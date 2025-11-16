package com.smartmeeting.controller;

import com.smartmeeting.dto.*;
import com.smartmeeting.model.Reuniao;
import com.smartmeeting.model.Pessoa;
import com.smartmeeting.model.Sala;
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
    private final EmailService emailService;
    private final SalaService salaService;
    private final PessoaService pessoaService;
    private final TarefaService tarefaService;

    public ReuniaoController(ReuniaoService service, EmailService emailService, SalaService salaService, PessoaService pessoaService, TarefaService tarefaService) {
        this.service = service;
        this.emailService = emailService;
        this.salaService = salaService;
        this.pessoaService = pessoaService;
        this.tarefaService = tarefaService;
    }

    /**
     * Lista todas as reuniões cadastradas
     */
    @GetMapping
    public List<ReuniaoDTO> listar() {
        return service.listarTodas().stream()
                .map(this::converterParaDTO)
                .collect(Collectors.toList());
    }

    /**
     * Converte entidade para DTO de forma segura contra XSS
     * Este método é usado para listar e buscar por ID, onde a entidade Reuniao é a fonte.
     */
    private ReuniaoDTO converterParaDTO(Reuniao reuniao) {
        if (reuniao == null) return null;

        // Escapar campos textuais para evitar XSS
        String pautaSegura = escape(reuniao.getPauta());
        String ataSegura = escape(reuniao.getAta());

        ReuniaoDTO dto = new ReuniaoDTO()
                .setId(reuniao.getId())
                .setPauta(pautaSegura)
                .setDataHoraInicio(reuniao.getDataHoraInicio())
                .setDuracaoMinutos(reuniao.getDuracaoMinutos())
                .setStatus(reuniao.getStatus())
                .setAta(ataSegura);

        // Organizador
        if (reuniao.getOrganizador() != null) {
            Pessoa o = reuniao.getOrganizador();
            PessoaDTO organizadorDTO = new PessoaDTO(
                    o.getId(),
                    escape(o.getNome()),
                    escape(o.getEmail()),
                    o.getTipoUsuario(),
                    o.getCrachaId()
            );
            dto.setOrganizador(organizadorDTO);
            dto.setOrganizadorId(o.getId());
        }

        // Sala
        if (reuniao.getSala() != null) {
            Sala s = reuniao.getSala();
            SalaDTO salaDTO = new SalaDTO()
                    .setId(s.getId())
                    .setNome(escape(s.getNome()))
                    .setCapacidade(s.getCapacidade())
                    .setLocalizacao(escape(s.getLocalizacao()))
                    .setStatus(s.getStatus())
                    .setEquipamentos(null) // equipamentos
                    .setCategoria(null) // categoria
                    .setAndar(null) // andar
                    .setDisponibilidade(null) // disponibilidade
                    .setImagem(null) // imagem
                    .setObservacoes(null); // observacoes
            dto.setSala(salaDTO);
            dto.setSalaId(s.getId());
        }

        // Participantes
        if (reuniao.getParticipantes() != null) {
            List<PessoaDTO> participantesDTO = reuniao.getParticipantes().stream()
                    .map((Pessoa p) -> new PessoaDTO(
                            p.getId(),
                            escape(p.getNome()),
                            escape(p.getEmail()),
                            p.getTipoUsuario(),
                            p.getCrachaId()
                    ))
                    .collect(Collectors.toList());
            List<Long> participantesIds = reuniao.getParticipantes().stream()
                    .map(Pessoa::getId)
                    .collect(Collectors.toList());

            dto.setParticipantesDetalhes(participantesDTO); // Ajustado para o novo campo
            dto.setParticipantes(participantesIds); // Ajustado para o novo campo
        }

        return dto;
    }

    /**
     * Utilitário para escapar strings potencialmente perigosas
     */
    private String escape(String valor) {
        if (valor == null) {
            return null;
        }
        // Usar método mais seguro e moderno
        return StringEscapeUtils.escapeHtml4(valor);
    }

    /**
     * Busca por ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<ReuniaoDTO> buscarPorId(@PathVariable("id") Long id) {
        return service.buscarPorId(id)
                .map(this::converterParaDTO)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Cria uma nova reunião
     */
    @PostMapping
    //@PreAuthorize("hasAuthority('CRIAR_REUNIAO')")
    public ResponseEntity<ReuniaoDTO> criar(@Valid @RequestBody ReuniaoDTO dto) {
        ReuniaoDTO reuniaoCriada = service.salvarDTO(dto);
        return ResponseEntity.ok(reuniaoCriada); // Retorna o DTO já populado pelo serviço
    }

    /**
     * Atualiza uma reunião existente
     */
    @PutMapping("/{id}")
    public ResponseEntity<ReuniaoDTO> atualizar(@PathVariable("id") Long id, @Valid @RequestBody ReuniaoDTO dto) {
        ReuniaoDTO reuniaoAtualizada = service.atualizarDTO(id, dto);
        return ResponseEntity.ok(reuniaoAtualizada); // Retorna o DTO já populado pelo serviço
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
        ReuniaoDTO reuniaoEncerrada = service.encerrarReuniaoDTO(id);
        return ResponseEntity.ok(reuniaoEncerrada); // Retorna o DTO já populado pelo serviço
    }

    /**
     * Testa envio de email
     */
    @PostMapping("/testar-email")
    public ResponseEntity<String> testarEmail(@RequestParam(defaultValue = "teste@exemplo.com") String email) {
        boolean sucesso = emailService.enviarEmailTeste(email);
        String resultado = sucesso
                ? "Email de teste enviado com sucesso para: " + escape(email)
                : "Falha ao enviar email de teste para: " + escape(email);
        return ResponseEntity.ok(resultado);
    }

    /**
     * Lista todas as salas disponíveis
     */
    @GetMapping("/salas")
    public List<SalaDTO> listarSalas() {
        return salaService.listarTodas();
    }

    /**
     * Lista todas as pessoas (organizadores e participantes)
     */
    @GetMapping("/pessoas")
    public List<PessoaDTO> listarPessoas() {
        return pessoaService.listarTodas();
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
