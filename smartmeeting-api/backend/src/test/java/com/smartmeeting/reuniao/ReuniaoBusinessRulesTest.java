package com.smartmeeting.reuniao;

import com.jayway.jsonpath.JsonPath;
import com.smartmeeting.api.SmartmeetingApiApplication;
import com.smartmeeting.security.CustomUserDetailsService;
import com.smartmeeting.security.JwtTokenProvider;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.UUID;

import static org.hamcrest.Matchers.hasItem;
import static org.hamcrest.Matchers.not;
import static org.hamcrest.Matchers.nullValue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Regras de negócio do módulo de reuniões.
 *
 * O módulo só tinha testes de autorização: nada cobria conflito de sala, validação de
 * corpo, ciclo de vida do status ou exclusão com dependências. Cada caso abaixo falha
 * contra o código anterior.
 *
 * Usa os usuários do seed (data.sql) e um JWT real, como o {@code PermissionHardeningTest},
 * porque as verificações dependem de {@code SecurityUtils.getCurrentUserId()}.
 */
@SpringBootTest(classes = SmartmeetingApiApplication.class)
@AutoConfigureMockMvc
class ReuniaoBusinessRulesTest {

    private static final String ADMIN = "alice.admin@smart.com";               // pessoa 1
    private static final String PARTICIPANTE = "paula.participante@smart.com"; // pessoa 3
    private static final String CONVIDADO = "carlos.convidado@smart.com";      // pessoa 4

    private static final DateTimeFormatter ISO = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss");

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

    private String corpo(String titulo, LocalDateTime inicio, int duracao, Long salaId) {
        return String.format(
                "{\"titulo\":\"%s\",\"dataHoraInicio\":\"%s\",\"duracaoMinutos\":%d,\"pauta\":\"Pauta %s\"%s}",
                titulo, inicio.format(ISO), duracao, titulo,
                salaId != null ? ",\"salaId\":" + salaId : "");
    }

    /** Cria uma reunião pela API e devolve o id. */
    private Long criarReuniao(String titulo, LocalDateTime inicio, int duracao, Long salaId) throws Exception {
        String resposta = mockMvc.perform(post("/reunioes")
                        .header("Authorization", tokenDe(ADMIN))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(corpo(titulo, inicio, duracao, salaId)))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();

        return JsonPath.parse(resposta).read("$.id", Integer.class).longValue();
    }

    /**
     * Horário longe no futuro e distinto a cada execução: o banco de teste é um arquivo H2
     * que sobrevive entre execuções, então um horário fixo conflitaria com a reunião criada
     * na execução anterior.
     */
    private LocalDateTime horarioLivre() {
        return LocalDateTime.now().plusYears(5)
                .withSecond(0).withNano(0)
                .plusMinutes(java.util.concurrent.ThreadLocalRandom.current().nextInt(500_000));
    }

    private String tituloUnico(String prefixo) {
        return prefixo + UUID.randomUUID().toString().replace("-", "");
    }

    // ── Conflito de sala ──────────────────────────────────────────────────────

    @Test
    void criarReuniaoEmSalaEHorarioJaOcupados_deveRetornar400() throws Exception {
        LocalDateTime inicio = horarioLivre();
        criarReuniao(tituloUnico("Primeira"), inicio, 60, 5L);

        // Começa 30 min depois da primeira, que ainda está acontecendo: sobreposição.
        mockMvc.perform(post("/reunioes")
                        .header("Authorization", tokenDe(ADMIN))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(corpo(tituloUnico("Segunda"), inicio.plusMinutes(30), 60, 5L)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void criarReuniaoNaMesmaSalaEmHorarioLivre_deveFuncionar() throws Exception {
        // Sem este caso, a validação poderia estar rejeitando tudo e o teste acima passaria.
        LocalDateTime inicio = horarioLivre();
        criarReuniao(tituloUnico("Manha"), inicio, 60, 5L);

        mockMvc.perform(post("/reunioes")
                        .header("Authorization", tokenDe(ADMIN))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(corpo(tituloUnico("Tarde"), inicio.plusMinutes(60), 60, 5L)))
                .andExpect(status().isOk());
    }

    @Test
    void editarReuniaoSemMudarHorario_naoDeveConflitarComEla_mesma() throws Exception {
        LocalDateTime inicio = horarioLivre();
        Long id = criarReuniao(tituloUnico("Editavel"), inicio, 60, 5L);

        mockMvc.perform(put("/reunioes/" + id)
                        .header("Authorization", tokenDe(ADMIN))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(corpo(tituloUnico("Editada"), inicio, 60, 5L)))
                .andExpect(status().isOk());
    }

    // ── Validação de corpo ────────────────────────────────────────────────────

    @Test
    void criarReuniaoComCorpoVazio_deveRetornar400_eNao500() throws Exception {
        mockMvc.perform(post("/reunioes")
                        .header("Authorization", tokenDe(ADMIN))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void criarReuniaoComTituloVazio_deveRetornar400() throws Exception {
        mockMvc.perform(post("/reunioes")
                        .header("Authorization", tokenDe(ADMIN))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"titulo\":\"   \",\"dataHoraInicio\":\"2030-01-01T10:00:00\","
                                + "\"duracaoMinutos\":30,\"pauta\":\"Pauta\"}"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void criarReuniaoComDuracaoZero_deveRetornar400() throws Exception {
        mockMvc.perform(post("/reunioes")
                        .header("Authorization", tokenDe(ADMIN))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(corpo(tituloUnico("Duracao"), horarioLivre(), 0, null)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void criarReuniaoComDataNula_deveRetornar400() throws Exception {
        mockMvc.perform(post("/reunioes")
                        .header("Authorization", tokenDe(ADMIN))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"titulo\":\"Sem data\",\"duracaoMinutos\":30,\"pauta\":\"Pauta\"}"))
                .andExpect(status().isBadRequest());
    }

    // ── Status fora do ciclo de vida ──────────────────────────────────────────

    @Test
    void putTentandoMudarStatus_devePreservarOStatus() throws Exception {
        LocalDateTime inicio = horarioLivre();
        Long id = criarReuniao(tituloUnico("Status"), inicio, 30, null);

        String corpoComStatus = "{\"titulo\":\"Status alterado\",\"dataHoraInicio\":\""
                + inicio.format(ISO) + "\",\"duracaoMinutos\":30,\"pauta\":\"Pauta\","
                + "\"status\":\"FINALIZADA\"}";

        mockMvc.perform(put("/reunioes/" + id)
                        .header("Authorization", tokenDe(ADMIN))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(corpoComStatus))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("AGENDADA"));

        mockMvc.perform(get("/reunioes/" + id)
                        .header("Authorization", tokenDe(ADMIN)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("AGENDADA"));
    }

    @Test
    void encerrarDuasVezes_segundaDeveSerRejeitada_eAtaPreservada() throws Exception {
        Long id = criarReuniao(tituloUnico("Encerrar"), horarioLivre(), 30, null);

        mockMvc.perform(post("/reunioes/" + id + "/encerrar")
                        .header("Authorization", tokenDe(ADMIN)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("FINALIZADA"));

        // Lida do GET, e não da resposta do encerrar: o ReuniaoDTO escapa HTML e o
        // ReuniaoDetailsDTO não, então as duas representações da mesma ata diferem.
        String ataGerada = JsonPath.parse(mockMvc.perform(get("/reunioes/" + id)
                        .header("Authorization", tokenDe(ADMIN)))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString(java.nio.charset.StandardCharsets.UTF_8))
                .read("$.ata", String.class);

        mockMvc.perform(post("/reunioes/" + id + "/encerrar")
                        .header("Authorization", tokenDe(ADMIN)))
                .andExpect(status().isBadRequest());

        mockMvc.perform(get("/reunioes/" + id)
                        .header("Authorization", tokenDe(ADMIN)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.ata").value(ataGerada));
    }

    // ── Endpoints de leitura sem verificação ──────────────────────────────────

    @Test
    void statistics_naoDeveListarReuniaoQueOUsuarioNaoAlcanca() throws Exception {
        // Reunião de alice (pessoa 1), sem carlos como participante. Fica logo à frente no
        // tempo para garantir presença entre as 5 próximas de quem pode vê-la.
        String titulo = tituloUnico("Sigilosa");
        LocalDateTime inicio = LocalDateTime.now().plusMinutes(5).withSecond(0).withNano(0);

        mockMvc.perform(post("/reunioes")
                        .header("Authorization", tokenDe(ADMIN))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"titulo\":\"" + titulo + "\",\"dataHoraInicio\":\"" + inicio.format(ISO)
                                + "\",\"duracaoMinutos\":30,\"pauta\":\"Confidencial\",\"organizadorId\":1}"))
                .andExpect(status().isOk());

        mockMvc.perform(get("/reunioes/statistics")
                        .header("Authorization", tokenDe(CONVIDADO)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.proximasReunioesList[*].titulo", not(hasItem(titulo))));

        mockMvc.perform(get("/reunioes/statistics")
                        .header("Authorization", tokenDe(ADMIN)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.proximasReunioesList[*].titulo", hasItem(titulo)));
    }

    @Test
    void statistics_deveContarSomenteOQueOUsuarioAlcanca() throws Exception {
        // Os números também eram do sistema inteiro, não só a lista. carlos (pessoa 4)
        // participa de poucas reuniões e não é membro da maioria dos projetos, então o
        // total dele tem de ser menor que o do admin.
        long totalAdmin = JsonPath.parse(mockMvc.perform(get("/reunioes/statistics")
                        .header("Authorization", tokenDe(ADMIN)))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString())
                .read("$.totalReunioes", Integer.class).longValue();

        long totalConvidado = JsonPath.parse(mockMvc.perform(get("/reunioes/statistics")
                        .header("Authorization", tokenDe(CONVIDADO)))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString())
                .read("$.totalReunioes", Integer.class).longValue();

        org.junit.jupiter.api.Assertions.assertTrue(totalConvidado < totalAdmin,
                "convidado deveria contar menos reuniões que o admin, mas contou "
                        + totalConvidado + " de " + totalAdmin);
    }

    @Test
    void tarefasDaReuniaoDeProjetoAlheio_deveRetornar403() throws Exception {
        // Reunião 1 é do projeto 1; carlos (pessoa 4) não é membro dele.
        mockMvc.perform(get("/reunioes/1/tarefas")
                        .header("Authorization", tokenDe(CONVIDADO)))
                .andExpect(status().isForbidden());
    }

    @Test
    void tarefasDaReuniao_paraQuemTemPermissao_deveFuncionar() throws Exception {
        mockMvc.perform(get("/reunioes/1/tarefas")
                        .header("Authorization", tokenDe(ADMIN)))
                .andExpect(status().isOk());
    }

    @Test
    void diretorioDePessoas_naoAdmin_deveRetornar403() throws Exception {
        mockMvc.perform(get("/reunioes/pessoas")
                        .header("Authorization", tokenDe(PARTICIPANTE)))
                .andExpect(status().isForbidden());
    }

    @Test
    void diretorioDePessoas_admin_deveRetornar200() throws Exception {
        mockMvc.perform(get("/reunioes/pessoas")
                        .header("Authorization", tokenDe(ADMIN)))
                .andExpect(status().isOk());
    }

    @Test
    void totalDeReunioesDeOutraPessoa_deveRetornar403() throws Exception {
        mockMvc.perform(get("/reunioes/total/1")
                        .header("Authorization", tokenDe(PARTICIPANTE)))
                .andExpect(status().isForbidden());
    }

    @Test
    void totalDeReunioesProprio_deveFuncionar() throws Exception {
        mockMvc.perform(get("/reunioes/total/3")
                        .header("Authorization", tokenDe(PARTICIPANTE)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalReunioes").exists());
    }

    // ── Exclusão com dependências ─────────────────────────────────────────────

    @Test
    void deletarReuniaoComPresencaETarefa_deveFuncionar() throws Exception {
        // Reunião 10 do seed tem a presença 10 e a tarefa 10 apontando para ela.
        mockMvc.perform(delete("/reunioes/10")
                        .header("Authorization", tokenDe(ADMIN)))
                .andExpect(status().isNoContent());

        mockMvc.perform(get("/reunioes/10")
                        .header("Authorization", tokenDe(ADMIN)))
                .andExpect(status().isNotFound());

        // A tarefa não morre com a reunião — apenas fica desvinculada.
        mockMvc.perform(get("/tarefas/10")
                        .header("Authorization", tokenDe(ADMIN)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.reuniaoId", nullValue()));
    }
}
