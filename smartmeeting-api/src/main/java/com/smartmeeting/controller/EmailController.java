package com.smartmeeting.controller;

import com.smartmeeting.service.email.EmailService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/emails")
public class EmailController {

    private final EmailService emailService;

    public EmailController(EmailService emailService) {
        this.emailService = emailService;
    }

    /**
     * Endpoint para testar o envio de e-mail
     * @param destinatario Endereço de e-mail do destinatário
     * @return Mensagem de confirmação
     */
    @GetMapping("/teste")
    public ResponseEntity<String> testarEmail(@RequestParam String destinatario) {
        try {
            String resultado = emailService.enviarEmailTeste(destinatario);
            return ResponseEntity.ok(resultado);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
}