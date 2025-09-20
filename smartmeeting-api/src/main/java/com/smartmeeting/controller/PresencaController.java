package com.smartmeeting.controller;

import com.smartmeeting.dto.PresencaDTO;
import com.smartmeeting.service.PresencaService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/reunioes")
public class PresencaController {

    private final PresencaService presencaService;

    public PresencaController(PresencaService presencaService) {
        this.presencaService = presencaService;
    }

    /**
     * Registra a presença de um participante em uma reunião
     * @param reuniaoId Identificador da reunião
     * @param dto Dados da presença a ser registrada
     * @return ResponseEntity contendo os dados da presença registrada ou status 400 em caso de erro
     */
    @PostMapping("/{id}/presenca")
    public ResponseEntity<PresencaDTO> registrarPresenca(
            @PathVariable("id") Long reuniaoId,
            @RequestBody PresencaDTO dto) {
        try {
            PresencaDTO resultado = presencaService.registrarPresenca(reuniaoId, dto);
            return ResponseEntity.ok(resultado);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
}
