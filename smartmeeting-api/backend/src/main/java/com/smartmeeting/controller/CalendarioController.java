package com.smartmeeting.controller;

import com.smartmeeting.service.calendario.CalendarioService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/calendario")
public class CalendarioController {

    private final CalendarioService calendarioService;

    public CalendarioController(CalendarioService calendarioService) {
        this.calendarioService = calendarioService;
    }

    @GetMapping("/reuniao/{id}/ical")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<String> exportarReuniaoICal(@PathVariable Long id) {
        // O service lançará ResourceNotFoundException se não encontrar, que será
        // tratada pelo GlobalExceptionHandler
        return calendarioService.gerarICalParaReuniao(id)
                .map(ical -> {
                    HttpHeaders headers = new HttpHeaders();
                    headers.setContentType(new MediaType("text", "calendar"));
                    headers.setContentDispositionFormData("attachment",
                            "reuniao-" + id + ".ics");
                    return new ResponseEntity<>(ical, headers, HttpStatus.OK);
                })
                .orElse(ResponseEntity.notFound().build()); // Mantido para o Optional vazio
    }

    /** A agenda de uma pessoa é dela; terceiros só com permissão administrativa. */
    @GetMapping("/pessoa/{pessoaId}/ical")
    @PreAuthorize("#pessoaId == authentication.principal.id or hasRole('ADMIN') or hasAuthority('ADMIN_MANAGE_USERS')")
    public ResponseEntity<String> exportarReunioesParaPessoaICal(@PathVariable Long pessoaId) {
        String ical = calendarioService.gerarICalParaPessoa(pessoaId);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(new MediaType("text", "calendar"));
        headers.setContentDispositionFormData("attachment",
                "minhas-reunioes.ics");

        return new ResponseEntity<>(ical, headers, HttpStatus.OK);
    }

    /** Exporta a agenda do sistema inteiro — restrito a administradores. */
    @GetMapping("/todas/ical")
    @PreAuthorize("hasRole('ADMIN') or hasAuthority('ADMIN_VIEW_REPORTS')")
    public ResponseEntity<String> exportarTodasReunioesICal() {
        String ical = calendarioService.gerarICalTodasReunioes();

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(new MediaType("text", "calendar"));
        headers.setContentDispositionFormData("attachment",
                "todas-reunioes-smartmeeting.ics");

        return new ResponseEntity<>(ical, headers, HttpStatus.OK);
    }
}
