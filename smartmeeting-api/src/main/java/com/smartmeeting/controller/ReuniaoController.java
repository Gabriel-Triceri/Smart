package com.smartmeeting.controller;

import com.smartmeeting.dto.ReuniaoDTO;
import com.smartmeeting.model.Reuniao;
import com.smartmeeting.service.ReuniaoService;
import com.smartmeeting.service.email.EmailService;
import org.springframework.http.ResponseEntity;
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
     * @return DTO com os dados básicos da reunião
     */
    private ReuniaoDTO converterParaDTO(Reuniao reuniao) {
        if (reuniao == null) {
            return null;
        }
        
        return new ReuniaoDTO()
                .setId(reuniao.getId())
                .setPauta(reuniao.getPauta())
                .setDataHoraInicio(reuniao.getDataHoraInicio())
                .setDuracaoMinutos(reuniao.getDuracaoMinutos())
                .setStatus(reuniao.getStatus());
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
    public ResponseEntity<ReuniaoDTO> atualizar(@PathVariable Long id, @RequestBody ReuniaoDTO dto) {
        try {
            ReuniaoDTO reuniaoAtualizada = service.atualizarDTO(id, dto);
            return ResponseEntity.ok(reuniaoAtualizada);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Remove uma reunião do sistema
     * @param id Identificador da reunião a ser removida
     * @return ResponseEntity com status 204 (No Content)
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        try {
            service.deletar(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Encerra uma reunião, gerando sua ata e alterando seu status
     * @param id Identificador da reunião a ser encerrada
     * @return ResponseEntity contendo a reunião encerrada ou status 404 se não existir
     */
    @PostMapping("/{id}/encerrar")
    public ResponseEntity<ReuniaoDTO> encerrar(@PathVariable Long id) {
        try {
            ReuniaoDTO reuniaoEncerrada = service.encerrarReuniaoDTO(id);
            return ResponseEntity.ok(reuniaoEncerrada);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
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
