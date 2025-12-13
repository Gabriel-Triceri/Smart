package com.smartmeeting.security;

import com.smartmeeting.api.SmartmeetingApiApplication;
import com.smartmeeting.dto.ReuniaoDTO;
import com.smartmeeting.mapper.ReuniaoMapper;
import com.smartmeeting.model.Reuniao;
import com.smartmeeting.service.pessoa.PessoaService;
import com.smartmeeting.service.reuniao.ReuniaoService;
import com.smartmeeting.service.sala.SalaService; // Assuming SalaService moved to sala package? Check.
import com.smartmeeting.service.tarefa.TarefaService;
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

    // Mock dos serviços para não depender da lógica interna quando a autorização
    // permitir
    @MockBean
    private ReuniaoService reuniaoService;
    @MockBean
    private SalaService salaService;
    @MockBean
    private PessoaService pessoaService;
    @MockBean
    private EmailService emailService;
    @MockBean
    private ReuniaoMapper reuniaoMapper;
    @MockBean
    private TarefaService tarefaService;

    @Test
    @WithMockUser(username = "participante@teste.com", roles = { "PARTICIPANTE" })
    void participanteNaoPodeCriarReuniao_deveRetornar403() throws Exception {
        mockMvc.perform(post("/reunioes")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{}"))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(username = "organizador@teste.com", authorities = { "CRIAR_REUNIAO" })
    void usuarioComPermissaoCriarReuniao_deveRetornar200() throws Exception {
        // Evita NullPointer do service quando o método é chamado após autorização
        when(reuniaoMapper.toEntity(any())).thenReturn(new Reuniao());
        when(reuniaoService.salvar(any())).thenReturn(new Reuniao());
        when(reuniaoMapper.toDTO(any())).thenReturn(new ReuniaoDTO());

        mockMvc.perform(post("/reunioes")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{}"))
                .andExpect(status().isOk());
    }
}
