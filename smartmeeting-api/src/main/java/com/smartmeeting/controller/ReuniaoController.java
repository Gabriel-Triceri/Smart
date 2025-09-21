package com.smartmeeting.controller;

import com.smartmeeting.dto.ReuniaoDTO;
import com.smartmeeting.dto.PessoaDTO;
import com.smartmeeting.dto.SalaDTO;
import com.smartmeeting.model.Reuniao;
import com.smartmeeting.model.Pessoa;
import com.smartmeeting.model.Sala;
import com.smartmeeting.service.ReuniaoService;
import com.smartmeeting.service.email.EmailService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.orm.ObjectOptimisticLockingFailureException;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/reunioes")
public class ReuniaoController {

    private final ReuniaoService service;
    private final EmailService emailService;

    public ReuniaoController(ReuniaoService service, EmailService emailService) {
        this.service = service;
        this.emailService = emailService;
    }

    /**
     * Lista todas as reuniões cadastradas
     * @return Lista de reuniões convertidas para DTO
     */
    @GetMapping
    public List<ReuniaoDTO> listar() {
        return service.listarTodas().stream()
                .map(this::converterParaDTO)
                .collect(Collectors.toList());
    }

    /**
     * Converte uma entidade Reuniao para ReuniaoDTO
     * @param reuniao Entidade a ser convertida
     * @return DTO com os dados básicos da reunião e relações preenchidas
     */
    private ReuniaoDTO converterParaDTO(Reuniao reuniao) {
        if (reuniao == null) {
            return null;
        }

        // Campos básicos
        ReuniaoDTO dto = new ReuniaoDTO()
                .setId(reuniao.getId())
                .setPauta(reuniao.getPauta())
                .setDataHoraInicio(reuniao.getDataHoraInicio())
                .setDuracaoMinutos(reuniao.getDuracaoMinutos())
                .setStatus(reuniao.getStatus())
                .setAta(reuniao.getAta());

        // Organizador
        if (reuniao.getOrganizador() != null) {
            Pessoa o = reuniao.getOrganizador();
            PessoaDTO organizadorDTO = new PessoaDTO(
                    o.getId(),
                    o.getNome(),
                    o.getEmail(),
                    o.getTipoUsuario(),
                    o.getCrachaId()
            );
            dto.setOrganizador(organizadorDTO);
            dto.setOrganizadorId(o.getId());
        } else {
            dto.setOrganizador(null);
            dto.setOrganizadorId(null);
        }

        // Sala
        if (reuniao.getSala() != null) {
            Sala s = reuniao.getSala();
            SalaDTO salaDTO = new SalaDTO(
                    s.getId(),
                    s.getNome(),
                    s.getCapacidade(),
                    s.getLocalizacao(),
                    s.getStatus()
            );
            dto.setSala(salaDTO);
            dto.setSalaId(s.getId());
        } else {
            dto.setSala(null);
            dto.setSalaId(null);
        }

        // Participantes (DTOs e IDs)
        if (reuniao.getParticipantes() != null) {
            List<PessoaDTO> participantesDTO = reuniao.getParticipantes().stream()
                    .map((Pessoa p) -> new PessoaDTO(
                            p.getId(),
                            p.getNome(),
                            p.getEmail(),
                            p.getTipoUsuario(),
                            p.getCrachaId()
                    ))
                    .collect(Collectors.toList());
            List<Long> participantesIds = reuniao.getParticipantes().stream()
                    .map(Pessoa::getId)
                    .collect(Collectors.toList());

            dto.setParticipantes(participantesDTO);
            dto.setParticipantesIds(participantesIds);
        } else {
            dto.setParticipantes(null);
            dto.setParticipantesIds(null);
        }

        return dto;
    }

    /**
     * Busca uma reunião específica pelo seu ID
     * @param id Identificador da reunião
     * @return ResponseEntity contendo a reunião encontrada ou status 404 se não existir
     */
    @GetMapping("/{id}")
    public ResponseEntity<ReuniaoDTO> buscarPorId(@PathVariable Long id) {
        return service.buscarPorId(id)
                .map(this::converterParaDTO)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Cria uma nova reunião
     * @param dto Dados da reunião a ser criada
     * @return DTO da reunião criada com ID gerado
     */
    @PostMapping
    public ResponseEntity<ReuniaoDTO> criar(@RequestBody ReuniaoDTO dto) {
        ReuniaoDTO reuniaoCriada = service.salvarDTO(dto);
        return ResponseEntity.ok(reuniaoCriada);
    }

    /**
     * Atualiza uma reunião existente
     * @param id Identificador da reunião a ser atualizada
     * @param dto Novos dados da reunião
     * @return ResponseEntity contendo a reunião atualizada ou status 404 se não existir
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> atualizar(@PathVariable Long id, @RequestBody ReuniaoDTO dto) {
        try {
            ReuniaoDTO reuniaoAtualizada = service.atualizarDTO(id, dto);
            return ResponseEntity.ok(reuniaoAtualizada);
        } catch (ObjectOptimisticLockingFailureException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body("Erro de concorrência: Os dados foram modificados por outro usuário. Recarregue e tente novamente.");
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(e.getMessage());
        }
    }

    /**
     * Remove uma reunião do sistema
     * @param id Identificador da reunião a ser removida
     * @return ResponseEntity com status 204 (No Content)
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deletar(@PathVariable Long id) {
        try {
            service.deletar(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Reunião não encontrada com ID: " + id);
        }
    }

    /**
     * Encerra uma reunião, gerando sua ata e alterando seu status
     * @param id Identificador da reunião a ser encerrada
     * @return ResponseEntity contendo a reunião encerrada ou status 404 se não existir
     */
    @PostMapping("/{id}/encerrar")
    public ResponseEntity<?> encerrar(@PathVariable Long id) {
        try {
            ReuniaoDTO reuniaoEncerrada = service.encerrarReuniaoDTO(id);
            return ResponseEntity.ok(reuniaoEncerrada);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(e.getMessage());
        }
    }

    /**
     * Endpoint para testar o serviço de envio de emails
     * @param email Endereço de email para teste (opcional)
     * @return ResponseEntity contendo o resultado do teste
     */
    @PostMapping("/testar-email")
    public ResponseEntity<String> testarEmail(@RequestParam(defaultValue = "teste@exemplo.com") String email) {
        try {
            String resultado = emailService.enviarEmailTeste(email);
            return ResponseEntity.ok(resultado);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Erro ao enviar email: " + e.getMessage());
        }
    }
}
