package com.smartmeeting.controller;

import com.smartmeeting.service.email.EmailService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/emails")
public class EmailController {

    private final EmailService emailService;

    public EmailController(EmailService emailService) {
        this.emailService = emailService;
    }

    /**
     * Endpoint para testar o envio de e-mail
     * 
     * @param destinatario Endereço de e-mail do destinatário
     * @return Mensagem de confirmação
     */
    @PostMapping("/teste")
    public ResponseEntity<String> testarEmail(@RequestParam String destinatario) {
        boolean sucesso = emailService.enviarEmailTeste(destinatario);
        if (sucesso) {
            return ResponseEntity.ok("E-mail de teste enviado com sucesso para " + destinatario);
        } else {
            return ResponseEntity.badRequest().body("Falha ao enviar e-mail de teste para " + destinatario);
        }
    }
}
