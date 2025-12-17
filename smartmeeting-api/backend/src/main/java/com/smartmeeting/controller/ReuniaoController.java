package com.smartmeeting.controller;

import com.smartmeeting.dto.*;
import com.smartmeeting.mapper.ReuniaoMapper;
import com.smartmeeting.model.Reuniao;
import com.smartmeeting.service.reuniao.ReuniaoService;
import com.smartmeeting.service.sala.SalaService;
import com.smartmeeting.service.pessoa.PessoaService;
import com.smartmeeting.service.project.ProjectPermissionService;
import com.smartmeeting.service.tarefa.TarefaService;
import com.smartmeeting.service.email.EmailService;
import org.springframework.security.access.prepost.PreAuthorize;

import org.apache.commons.text.StringEscapeUtils;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/reunioes")
public class ReuniaoController {

    private final ReuniaoService service;
    private final ReuniaoMapper mapper;
    private final EmailService emailService;
    private final SalaService salaService;
    private final PessoaService pessoaService;
    private final TarefaService tarefaService;

    private final ProjectPermissionService projectPermissionService;

    public ReuniaoController(ReuniaoService service, ReuniaoMapper mapper, EmailService emailService,
            SalaService salaService, PessoaService pessoaService, TarefaService tarefaService,
            ProjectPermissionService projectPermissionService) {
        this.service = service;
        this.mapper = mapper;
        this.emailService = emailService;
        this.salaService = salaService;
        this.pessoaService = pessoaService;
        this.tarefaService = tarefaService;
        this.projectPermissionService = projectPermissionService;
    }

    /**
     * Lista todas as reuniões cadastradas (filtradas por permissão do usuário)
     */
    @GetMapping
    public ResponseEntity<List<ReuniaoDTO>> listar() {
        Long currentUserId = com.smartmeeting.util.SecurityUtils.getCurrentUserId();
        if (currentUserId == null) {
            return ResponseEntity.ok(List.of());
        }

        // Admin global pode ver todas as reuniões
        boolean isAdmin = com.smartmeeting.util.SecurityUtils.isAdmin();

        List<ReuniaoDTO> reunioesFiltradas = service.listarTodas().stream()
                .filter(reuniao -> {
                    // Admin global tem acesso a tudo
                    if (isAdmin) {
                        return true;
                    }

                    // Se o usuário é organizador, pode ver
                    if (reuniao.getOrganizador() != null &&
                            reuniao.getOrganizador().getId().equals(currentUserId)) {
                        return true;
                    }

                    // Se o usuário é participante, pode ver
                    if (reuniao.getParticipantes() != null &&
                            reuniao.getParticipantes().stream()
                                    .anyMatch(p -> p.getId().equals(currentUserId))) {
                        return true;
                    }

                    // Verificar permissão no projeto associado
                    if (reuniao.getProject() != null) {
                        return projectPermissionService.hasPermission(
                                reuniao.getProject().getId(),
                                currentUserId,
                                com.smartmeeting.enums.PermissionType.MEETING_VIEW) ||
                                projectPermissionService.hasPermission(
                                        reuniao.getProject().getId(),
                                        currentUserId,
                                        com.smartmeeting.enums.PermissionType.PROJECT_VIEW);
                    }

                    // Reuniões sem projeto e sem ser organizador/participante: não visível
                    return false;
                })
                .map(mapper::toDTO)
                .collect(Collectors.toList());

        return ResponseEntity.ok(reunioesFiltradas);
    }

    /**
     * Busca por ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<ReuniaoDTO> buscarPorId(@PathVariable("id") Long id) {
        return service.buscarPorId(id)
                .map(reuniao -> {
                    // Validação de permissão
                    if (reuniao.getProject() != null) {
                        if (!projectPermissionService.hasPermissionForCurrentUser(reuniao.getProject().getId(),
                                com.smartmeeting.enums.PermissionType.MEETING_VIEW) &&
                                !projectPermissionService.hasPermissionForCurrentUser(reuniao.getProject().getId(),
                                        com.smartmeeting.enums.PermissionType.PROJECT_VIEW)) {
                            throw new com.smartmeeting.exception.ForbiddenException(
                                    "Você não tem permissão para visualizar esta reunião.");
                        }
                    }
                    return mapper.toDTO(reuniao);
                })
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Cria uma nova reunião
     */

    @PostMapping
    @PreAuthorize("hasRole('ORGANIZADOR')")
    public ResponseEntity<ReuniaoDTO> criar(@Valid @RequestBody ReuniaoDTO dto) {
        // Validação de permissão (se o DTO tiver projectId, o que não parece ter
        // explícito, mas pode vir no contexto)
        // Assumindo que a criação de reunião pode estar ligada a um projeto

        Reuniao reuniao = mapper.toEntity(dto);

        if (reuniao == null) {
            throw new IllegalArgumentException("Reunião não pode ser nula. Verifique o DTO enviado.");
        }

        if (reuniao.getProject() != null) {
            if (!projectPermissionService.hasPermissionForCurrentUser(reuniao.getProject().getId(),
                    com.smartmeeting.enums.PermissionType.MEETING_CREATE)) {
                throw new com.smartmeeting.exception.ForbiddenException(
                        "Você não tem permissão para criar reuniões neste projeto.");
            }
        }

        Reuniao reuniaoCriada = service.salvar(reuniao);
        return ResponseEntity.ok(mapper.toDTO(reuniaoCriada));
    }

    /**
     * Atualiza uma reunião existente
     */
    @PutMapping("/{id}")
    public ResponseEntity<ReuniaoDTO> atualizar(@PathVariable("id") Long id, @Valid @RequestBody ReuniaoDTO dto) {
        // Buscar reunião existente (lança exceção se não encontrar)
        Reuniao existing = service.buscarPorId(id)
                .orElseThrow(() -> new com.smartmeeting.exception.ResourceNotFoundException(
                        "Reunião não encontrada: " + id));

        // Validação de permissão
        if (existing.getProject() != null) {
            if (!projectPermissionService.hasPermissionForCurrentUser(existing.getProject().getId(),
                    com.smartmeeting.enums.PermissionType.MEETING_EDIT)) {
                throw new com.smartmeeting.exception.ForbiddenException(
                        "Você não tem permissão para editar esta reunião.");
            }
        }

        Reuniao reuniaoAtualizada = mapper.toEntity(dto);
        Reuniao reuniao = service.atualizar(id, reuniaoAtualizada);
        return ResponseEntity.ok(mapper.toDTO(reuniao));
    }

    /**
     * Remove reunião
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable("id") Long id) {
        // Buscar reunião existente (lança exceção se não encontrar)
        Reuniao existing = service.buscarPorId(id)
                .orElseThrow(() -> new com.smartmeeting.exception.ResourceNotFoundException(
                        "Reunião não encontrada: " + id));

        // Validação de permissão
        if (existing.getProject() != null) {
            if (!projectPermissionService.hasPermissionForCurrentUser(existing.getProject().getId(),
                    com.smartmeeting.enums.PermissionType.MEETING_DELETE)) {
                throw new com.smartmeeting.exception.ForbiddenException(
                        "Você não tem permissão para excluir esta reunião.");
            }
        }

        service.deletar(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * Encerra reunião
     */
    @PostMapping("/{id}/encerrar")
    public ResponseEntity<ReuniaoDTO> encerrar(@PathVariable("id") Long id) {
        // Buscar reunião existente (lança exceção se não encontrar)
        Reuniao existing = service.buscarPorId(id)
                .orElseThrow(() -> new com.smartmeeting.exception.ResourceNotFoundException(
                        "Reunião não encontrada: " + id));

        // Validação de permissão (encerrar requer permissão de edição)
        if (existing.getProject() != null) {
            if (!projectPermissionService.hasPermissionForCurrentUser(existing.getProject().getId(),
                    com.smartmeeting.enums.PermissionType.MEETING_EDIT)) {
                throw new com.smartmeeting.exception.ForbiddenException(
                        "Você não tem permissão para encerrar esta reunião.");
            }
        }

        Reuniao reuniao = service.encerrarReuniao(id);
        return ResponseEntity.ok(mapper.toDTO(reuniao));
    }

    /**
     * Testa envio de email (apenas ADMIN)
     */
    @PostMapping("/testar-email")
    public ResponseEntity<String> testarEmail(@RequestParam(defaultValue = "teste@exemplo.com") String email) {
        // Apenas admin pode testar email
        if (!com.smartmeeting.util.SecurityUtils.isAdmin()) {
            throw new com.smartmeeting.exception.ForbiddenException(
                    "Apenas administradores podem testar envio de email.");
        }

        boolean sucesso = emailService.enviarEmailTeste(email);
        String resultado = sucesso
                ? "Email de teste enviado com sucesso para: " + StringEscapeUtils.escapeHtml4(email)
                : "Falha ao enviar email de teste para: " + StringEscapeUtils.escapeHtml4(email);
        return ResponseEntity.ok(resultado);
    }

    /**
     * Lista todas as salas disponíveis
     */
    @GetMapping("/salas")
    public ResponseEntity<List<SalaDTO>> listarSalas() {
        return ResponseEntity.ok(salaService.listarTodas());
    }

    /**
     * Lista todas as pessoas (organizadores e participantes)
     */
    @GetMapping("/pessoas")
    public ResponseEntity<List<PessoaDTO>> listarPessoas() {
        return ResponseEntity.ok(pessoaService.listarTodas());
    }

    /**
     * API de total de reuniões do sistema
     */
    @GetMapping("/total")
    public ResponseEntity<Map<String, Long>> getTotalReunioes() {
        long totalReunioes = service.getTotalReunioes();
        return ResponseEntity.ok(Map.of("totalReunioes", totalReunioes));
    }

    /**
     * API de total de reuniões por pessoa
     */
    @GetMapping("/total/{pessoaId}")
    public ResponseEntity<Map<String, Long>> getTotalReunioesByPessoa(@PathVariable("pessoaId") Long pessoaId) {
        long totalReunioes = service.getTotalReunioesByPessoa(pessoaId);
        return ResponseEntity.ok(Map.of("totalReunioes", totalReunioes));
    }

    /**
     * API de estatísticas de reuniões
     */
    @GetMapping("/statistics")
    public ResponseEntity<ReuniaoStatisticsDTO> getReuniaoStatistics() {
        ReuniaoStatisticsDTO statistics = service.getReuniaoStatistics();
        // Populate proximasList with DTOs
        List<ReuniaoDTO> proximasList = service.getProximasReunioes().stream()
                .map(mapper::toDTO)
                .collect(Collectors.toList());
        statistics.setProximasReunioesList(proximasList);
        return ResponseEntity.ok(statistics);
    }

    /**
     * API de tarefas por reunião
     */
    @GetMapping("/{id}/tarefas")
    public ResponseEntity<List<TarefaDTO>> getTarefasPorReuniao(@PathVariable Long id) {
        return ResponseEntity.ok(tarefaService.getTarefasPorReuniao(id));
    }
}
