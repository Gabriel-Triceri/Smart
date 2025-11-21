package com.smartmeeting.controller;

import com.smartmeeting.dto.*;
import com.smartmeeting.mapper.ReuniaoMapper;
import com.smartmeeting.model.Reuniao;
import com.smartmeeting.service.ReuniaoService;
import com.smartmeeting.service.SalaService;
import com.smartmeeting.service.PessoaService;
import com.smartmeeting.service.TarefaService;
import com.smartmeeting.service.email.EmailService;
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

    public ReuniaoController(ReuniaoService service, ReuniaoMapper mapper, EmailService emailService,
            SalaService salaService, PessoaService pessoaService, TarefaService tarefaService) {
        this.service = service;
        this.mapper = mapper;
        this.emailService = emailService;
        this.salaService = salaService;
        this.pessoaService = pessoaService;
        this.tarefaService = tarefaService;
    }

    /**
     * Lista todas as reuniões cadastradas
     */
    @GetMapping
    public ResponseEntity<List<ReuniaoDTO>> listar() {
        List<ReuniaoDTO> reunioes = service.listarTodas().stream()
                .map(mapper::toDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(reunioes);
    }

    /**
     * Busca por ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<ReuniaoDTO> buscarPorId(@PathVariable("id") Long id) {
        return service.buscarPorId(id)
                .map(mapper::toDTO)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Cria uma nova reunião
     */
    @PostMapping
    // @PreAuthorize("hasAuthority('CRIAR_REUNIAO')")
    public ResponseEntity<ReuniaoDTO> criar(@Valid @RequestBody ReuniaoDTO dto) {
        Reuniao reuniao = mapper.toEntity(dto);
        Reuniao reuniaoCriada = service.salvar(reuniao);
        return ResponseEntity.ok(mapper.toDTO(reuniaoCriada));
    }

    /**
     * Atualiza uma reunião existente
     */
    @PutMapping("/{id}")
    public ResponseEntity<ReuniaoDTO> atualizar(@PathVariable("id") Long id, @Valid @RequestBody ReuniaoDTO dto) {
        Reuniao reuniaoAtualizada = mapper.toEntity(dto);
        Reuniao reuniao = service.atualizar(id, reuniaoAtualizada);
        return ResponseEntity.ok(mapper.toDTO(reuniao));
    }

    /**
     * Remove reunião
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable("id") Long id) {
        service.deletar(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * Encerra reunião
     */
    @PostMapping("/{id}/encerrar")
    public ResponseEntity<ReuniaoDTO> encerrar(@PathVariable("id") Long id) {
        Reuniao reuniao = service.encerrarReuniao(id);
        return ResponseEntity.ok(mapper.toDTO(reuniao));
    }

    /**
     * Testa envio de email
     */
    @PostMapping("/testar-email")
    public ResponseEntity<String> testarEmail(@RequestParam(defaultValue = "teste@exemplo.com") String email) {
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
