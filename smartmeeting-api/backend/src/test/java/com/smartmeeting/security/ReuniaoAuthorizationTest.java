package com.smartmeeting.security;

import com.smartmeeting.api.SmartmeetingApiApplication;
import com.smartmeeting.service.PessoaService;
import com.smartmeeting.service.ReuniaoService;
import com.smartmeeting.service.SalaService;
import com.smartmeeting.service.email.EmailService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(classes = SmartmeetingApiApplication.class)
@AutoConfigureMockMvc
class ReuniaoAuthorizationTest {

    @Autowired
    private MockMvc mockMvc;

    // Mock dos serviços para não depender da lógica interna quando a autorização permitir
    @MockBean private ReuniaoService reuniaoService;
    @MockBean private SalaService salaService;
    @MockBean private PessoaService pessoaService;
    @MockBean private EmailService emailService;

    @Test
    @WithMockUser(username = "participante@teste.com", roles = {"PARTICIPANTE"})
    void participanteNaoPodeCriarReuniao_deveRetornar403() throws Exception {
        mockMvc.perform(post("/reunioes")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(username = "organizador@teste.com", authorities = {"CRIAR_REUNIAO"})
    void usuarioComPermissaoCriarReuniao_deveRetornar200() throws Exception {
        // Evita NullPointer do service quando o método é chamado após autorização
        when(reuniaoService.salvarDTO(any())).thenAnswer(inv -> inv.getArgument(0));
        when(reuniaoService.toEntity(any())).thenReturn(null);

        mockMvc.perform(post("/reunioes")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isOk());
    }
}
