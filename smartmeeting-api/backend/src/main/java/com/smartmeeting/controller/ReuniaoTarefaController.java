package com.smartmeeting.controller;

import com.smartmeeting.dto.TarefaDTO;
import com.smartmeeting.enums.PermissionType;
import com.smartmeeting.exception.ForbiddenException;
import com.smartmeeting.exception.ResourceNotFoundException;
import com.smartmeeting.model.Reuniao;
import com.smartmeeting.service.project.ProjectPermissionService;
import com.smartmeeting.service.reuniao.ReuniaoService;
import com.smartmeeting.service.tarefa.TarefaService;
import com.smartmeeting.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/reunioes/{reuniaoId}/tarefas")
@RequiredArgsConstructor
public class ReuniaoTarefaController {

    private final TarefaService tarefaService;
    private final ReuniaoService reuniaoService;
    private final ProjectPermissionService projectPermissionService;

    /**
     * Exige, no projeto da reunião, a mesma permissão que o {@code TarefaController} pede
     * nas rotas equivalentes.
     *
     * As três rotas aqui exigiam apenas autenticação, então as tarefas de qualquer reunião
     * — de qualquer projeto — eram legíveis e (re)vinculáveis por qualquer usuário logado.
     * Reunião sem projeto continua acessível a qualquer autenticado, como no
     * {@code TarefaController}.
     */
    private void exigirPermissaoNaReuniao(Long reuniaoId, PermissionType permissao, String acao) {
        Reuniao reuniao = reuniaoService.buscarPorId(reuniaoId)
                .orElseThrow(() -> new ResourceNotFoundException("Reunião não encontrada: " + reuniaoId));

        if (SecurityUtils.isAdmin() || reuniao.getProject() == null) {
            return;
        }

        if (!projectPermissionService.hasPermissionForCurrentUser(reuniao.getProject().getId(), permissao)) {
            throw new ForbiddenException("Você não tem permissão para " + acao + " nesta reunião.");
        }
    }

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<TarefaDTO>> listar(@PathVariable Long reuniaoId) {
        exigirPermissaoNaReuniao(reuniaoId, PermissionType.TASK_VIEW, "visualizar tarefas");
        return ResponseEntity.ok(tarefaService.getTarefasPorReuniao(reuniaoId));
    }

    @PostMapping("/{tarefaId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<TarefaDTO> vincular(@PathVariable Long reuniaoId,
                                              @PathVariable Long tarefaId) {
        exigirPermissaoNaReuniao(reuniaoId, PermissionType.TASK_EDIT, "vincular tarefas");
        TarefaDTO updated = tarefaService.atualizarReuniaoDaTarefa(tarefaId, reuniaoId);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{tarefaId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<TarefaDTO> desvincular(@PathVariable Long reuniaoId,
                                                 @PathVariable Long tarefaId) {
        exigirPermissaoNaReuniao(reuniaoId, PermissionType.TASK_EDIT, "desvincular tarefas");
        TarefaDTO updated = tarefaService.atualizarReuniaoDaTarefa(tarefaId, null);
        return ResponseEntity.ok(updated);
    }
}
