package com.smartmeeting.security;

import com.smartmeeting.api.SmartmeetingApiApplication;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Prova que os buracos de autorização fechados continuam fechados.
 *
 * Cada caso afirma 403/404 para quem não pode e, quando faz sentido, 2xx para quem pode —
 * um teste que só verifica a negação passaria com o endpoint quebrado para todo mundo.
 *
 * Usa os usuários do seed (data.sql) e um JWT real, e não @WithMockUser, porque as
 * checagens dependem de SecurityUtils.getCurrentUserId(), que exige um UserPrincipal.
 */
@SpringBootTest(classes = SmartmeetingApiApplication.class)
@AutoConfigureMockMvc
class PermissionHardeningTest {

    private static final String ADMIN = "alice.admin@smart.com";        // pessoa 1, TipoUsuario ADMIN
    private static final String PARTICIPANTE = "paula.participante@smart.com"; // pessoa 3
    private static final String ORGANIZADOR = "otavio.organizador@smart.com";  // pessoa 2
    private static final String CONVIDADO = "carlos.convidado@smart.com";      // pessoa 4

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @Autowired
    private CustomUserDetailsService userDetailsService;

    private String tokenDe(String email) {
        UserDetails userDetails = userDetailsService.loadUserByUsername(email);
        Authentication auth = new UsernamePasswordAuthenticationToken(
                userDetails, null, userDetails.getAuthorities());
        return "Bearer " + jwtTokenProvider.generateToken(auth);
    }

    // ── Controllers que não tinham nenhuma verificação ────────────────────────

    @Test
    void agendaDoSistemaInteiro_naoAdmin_deveRetornar403() throws Exception {
        mockMvc.perform(get("/calendario/todas/ical")
                        .header("Authorization", tokenDe(PARTICIPANTE)))
                .andExpect(status().isForbidden());
    }

    @Test
    void agendaDoSistemaInteiro_admin_deveRetornar200() throws Exception {
        mockMvc.perform(get("/calendario/todas/ical")
                        .header("Authorization", tokenDe(ADMIN)))
                .andExpect(status().isOk());
    }

    @Test
    void agendaDeOutraPessoa_naoAdmin_deveRetornar403() throws Exception {
        // paula (pessoa 3) tentando exportar a agenda da alice (pessoa 1)
        mockMvc.perform(get("/calendario/pessoa/1/ical")
                        .header("Authorization", tokenDe(PARTICIPANTE)))
                .andExpect(status().isForbidden());
    }

    @Test
    void agendaPropria_deveSerPermitida() throws Exception {
        mockMvc.perform(get("/calendario/pessoa/3/ical")
                        .header("Authorization", tokenDe(PARTICIPANTE)))
                .andExpect(status().isOk());
    }

    @Test
    void envioDeEmailDeTeste_naoAdmin_deveRetornar403() throws Exception {
        mockMvc.perform(post("/emails/teste")
                        .param("destinatario", "alguem@exemplo.com")
                        .header("Authorization", tokenDe(PARTICIPANTE)))
                .andExpect(status().isForbidden());
    }

    // ── Projetos ──────────────────────────────────────────────────────────────

    @Test
    void listarTodosOsProjetos_naoAdmin_deveRetornar403() throws Exception {
        mockMvc.perform(get("/projects/all")
                        .header("Authorization", tokenDe(PARTICIPANTE)))
                .andExpect(status().isForbidden());
    }

    @Test
    void listarTodosOsProjetos_admin_deveRetornar200() throws Exception {
        mockMvc.perform(get("/projects/all")
                        .header("Authorization", tokenDe(ADMIN)))
                .andExpect(status().isOk());
    }

    @Test
    void criarProjeto_apontandoOutroDono_deveIgnorarOwnerIdDoCorpo() throws Exception {
        // paula (pessoa 3) tentando criar um projeto cujo dono seria a alice (pessoa 1)
        mockMvc.perform(post("/projects")
                        .header("Authorization", tokenDe(PARTICIPANTE))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"Projeto da Paula\",\"ownerId\":1}"))
                .andExpect(status().isForbidden());
    }

    @Test
    void criarProjeto_semOwnerId_deveUsarOUsuarioAutenticado() throws Exception {
        mockMvc.perform(post("/projects")
                        .header("Authorization", tokenDe(PARTICIPANTE))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"Projeto sem dono explicito\"}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.owner.id").value(3));
    }

    // ── Notificações ──────────────────────────────────────────────────────────

    @Test
    void criarNotificacao_naoAdmin_deveRetornar403() throws Exception {
        mockMvc.perform(post("/notificacoes")
                        .header("Authorization", tokenDe(PARTICIPANTE))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"mensagem\":\"oi\",\"tipo\":\"EMAIL\",\"destinatarioId\":1}"))
                .andExpect(status().isForbidden());
    }

    // ── IDOR entre projetos ───────────────────────────────────────────────────

    @Test
    void editarPermissoesDeMembroDeOutroProjeto_deveRetornar404() throws Exception {
        // O membro 3 é a paula no projeto 1. A rota abaixo passa pelo projeto 2, onde a
        // paula é ADMIN e tem PROJECT_MANAGE_MEMBERS — antes isso bastava para alterar
        // permissões de um membro que não é daquele projeto.
        mockMvc.perform(put("/projects/2/permissions/members/3")
                        .header("Authorization", tokenDe(ADMIN))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"permissions\":{\"PROJECT_DELETE\":true}}"))
                .andExpect(status().isNotFound());
    }

    @Test
    void lerPermissoesDeMembroDeOutroProjeto_deveRetornar404() throws Exception {
        mockMvc.perform(get("/projects/2/permissions/members/3")
                        .header("Authorization", tokenDe(ADMIN)))
                .andExpect(status().isNotFound());
    }

    // ── Escalada de privilégio ────────────────────────────────────────────────

    @Test
    void promoverMembroAOwner_deveSerRejeitado() throws Exception {
        // Admin do projeto 2 tentando transformar o membro 8 em OWNER.
        mockMvc.perform(put("/projects/2/permissions/members/8/role")
                        .header("Authorization", tokenDe(ADMIN))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"role\":\"OWNER\"}"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void papelInvalido_deveRetornar400_eNao500() throws Exception {
        mockMvc.perform(put("/projects/2/permissions/members/8/role")
                        .header("Authorization", tokenDe(ADMIN))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"role\":\"SUPER_CHEFE\"}"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void trocarOProprioPapel_deveSerRejeitado() throws Exception {
        // Otavio é o membro 2 do projeto 1 e tem PROJECT_MANAGE_MEMBERS lá.
        mockMvc.perform(put("/projects/1/permissions/members/2/role")
                        .header("Authorization", tokenDe(ORGANIZADOR))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"role\":\"MEMBER_EDITOR\"}"))
                .andExpect(status().isBadRequest());
    }

    // ── Rotas de projeto para não-admin ───────────────────────────────────────
    //
    // O ProjectController declarava @AuthenticationPrincipal Pessoa, mas o principal é um
    // UserPrincipal — o parâmetro resolvia para null e estourava NPE em toda rota de
    // projeto para quem não fosse admin (para admin, o short-circuit de isAdmin() escondia
    // o problema).

    @Test
    void listarMeusProjetos_naoAdmin_deveFuncionar() throws Exception {
        mockMvc.perform(get("/projects")
                        .header("Authorization", tokenDe(PARTICIPANTE)))
                .andExpect(status().isOk());
    }

    @Test
    void abrirProjetoDoQualEMembro_naoAdmin_deveFuncionar() throws Exception {
        // paula é membro do projeto 1
        mockMvc.perform(get("/projects/1")
                        .header("Authorization", tokenDe(PARTICIPANTE)))
                .andExpect(status().isOk());
    }

    @Test
    void abrirProjetoDoQualNaoEMembro_deveRetornar403_eNao500() throws Exception {
        // carlos (pessoa 4) não é membro do projeto 4, e nenhum outro teste o adiciona lá
        mockMvc.perform(get("/projects/4")
                        .header("Authorization", tokenDe(CONVIDADO)))
                .andExpect(status().isForbidden());
    }

    // ── Permissões de membro novo ─────────────────────────────────────────────

    @Test
    void quemCriaUmProjeto_deveConseguirAbriLoEmSeguida() throws Exception {
        // O dono era criado como membro sem nenhuma ProjectPermission, então recebia 403
        // no próprio projeto que acabara de criar.
        String corpo = mockMvc.perform(post("/projects")
                        .header("Authorization", tokenDe(PARTICIPANTE))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"Projeto recem criado\"}"))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();

        Long novoId = com.jayway.jsonpath.JsonPath.parse(corpo).read("$.id", Integer.class).longValue();

        mockMvc.perform(get("/projects/" + novoId)
                        .header("Authorization", tokenDe(PARTICIPANTE)))
                .andExpect(status().isOk());
    }

    @Test
    void membroAdicionado_deveNascerComAsPermissoesDoPapel() throws Exception {
        // carlos (pessoa 4) não é membro do projeto 5; ao ser adicionado, precisa já
        // conseguir abrir o projeto — antes nascia com zero permissões e levava 403.
        mockMvc.perform(get("/projects/5")
                        .header("Authorization", tokenDe(CONVIDADO)))
                .andExpect(status().isForbidden());

        mockMvc.perform(post("/projects/5/members")
                        .header("Authorization", tokenDe(ADMIN))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"personId\":4,\"role\":\"MEMBER_EDITOR\"}"))
                .andExpect(status().isCreated());

        mockMvc.perform(get("/projects/5")
                        .header("Authorization", tokenDe(CONVIDADO)))
                .andExpect(status().isOk());
    }

    // ── Tarefas de projetos alheios ───────────────────────────────────────────

    @Test
    void alterarProgressoDeTarefaDeProjetoAlheio_deveRetornar403() throws Exception {
        // carlos (pessoa 4) não é membro do projeto 1
        mockMvc.perform(patch("/tarefas/1/progresso")
                        .param("progresso", "100")
                        .header("Authorization", tokenDe(CONVIDADO)))
                .andExpect(status().isForbidden());
    }

    @Test
    void listarAnexosDeTarefaDeProjetoAlheio_deveRetornar403() throws Exception {
        mockMvc.perform(get("/tarefas/1/anexos")
                        .header("Authorization", tokenDe(CONVIDADO)))
                .andExpect(status().isForbidden());
    }
}
