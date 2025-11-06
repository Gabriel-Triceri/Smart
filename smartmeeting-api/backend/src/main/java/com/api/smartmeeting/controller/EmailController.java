package com.api.smartmeeting.controller;

import com.api.smartmeeting.service.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/emails")
public class EmailController {

    @Autowired
    private EmailService emailService;

    /**
     * Endpoint para testar o envio de e-mail
     * @param destinatario Endereço de e-mail do destinatário
     * @return Mensagem de confirmação
     */
    @GetMapping("/teste")
    public ResponseEntity<String> testarEmail(@RequestParam String destinatario) {
        String resultado = emailService.enviarEmailTeste(destinatario);
        return ResponseEntity.ok(resultado);
    }
}