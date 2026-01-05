package com.smartmeeting.controller;

import com.smartmeeting.dto.PresencaDTO;
import com.smartmeeting.service.reuniao.PresencaService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/reunioes")
public class PresencaController {

    private final PresencaService presencaService;
    private final com.smartmeeting.repository.ReuniaoRepository reuniaoRepository;
    private final com.smartmeeting.service.project.ProjectPermissionService projectPermissionService;

    public PresencaController(PresencaService presencaService,
            com.smartmeeting.repository.ReuniaoRepository reuniaoRepository,
            com.smartmeeting.service.project.ProjectPermissionService projectPermissionService) {
        this.presencaService = presencaService;
        this.reuniaoRepository = reuniaoRepository;
        this.projectPermissionService = projectPermissionService;
    }

    /**
     * Registra a presença de um participante em uma reunião
     * 
     * @param reuniaoId Identificador da reunião
     * @param dto       Dados da presença a ser registrada
     * @return ResponseEntity contendo os dados da presença registrada ou status 400
     *         em caso de erro
     */
    @PostMapping("/{id}/presenca")
    public ResponseEntity<PresencaDTO> registrarPresenca(
            @PathVariable("id") Long reuniaoId,
            @RequestBody PresencaDTO dto) {
        if (!com.smartmeeting.util.SecurityUtils.isAdmin()) {
            com.smartmeeting.model.Reuniao reuniao = reuniaoRepository.findById(reuniaoId)
                    .orElseThrow(() -> new com.smartmeeting.exception.ResourceNotFoundException(
                            "Reunião não encontrada: " + reuniaoId));

            if (reuniao.getProject() != null) {
                if (!projectPermissionService.hasPermissionForCurrentUser(reuniao.getProject().getId(),
                        com.smartmeeting.enums.PermissionType.MEETING_MANAGE_PARTICIPANTS)) {
                    throw new com.smartmeeting.exception.ForbiddenException(
                            "Você não tem permissão para gerenciar participantes nesta reunião.");
                }
            }
        }
        PresencaDTO resultado = presencaService.registrarPresenca(reuniaoId, dto);
        return ResponseEntity.ok(resultado);
    }
}
