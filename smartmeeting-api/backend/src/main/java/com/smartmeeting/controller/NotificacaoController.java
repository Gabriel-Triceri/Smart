package com.smartmeeting.controller;

import com.smartmeeting.dto.NotificacaoDTO;
import com.smartmeeting.service.NotificacaoService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/notificacoes")
public class NotificacaoController {

    private final NotificacaoService service;

    public NotificacaoController(NotificacaoService service) {
        this.service = service;
    }

    /**
     * Lista todas as notificações cadastradas no sistema
     * @return Lista de notificações convertidas para DTO
     */
    @GetMapping
    public ResponseEntity<List<NotificacaoDTO>> listar() {
        List<NotificacaoDTO> notificacoes = service.listarTodas();
        return ResponseEntity.ok(notificacoes);
    }

    /**
     * Busca uma notificação específica pelo seu ID
     * @param id Identificador da notificação
     * @return ResponseEntity contendo a notificação encontrada ou status 404 se não existir
     */
    @GetMapping("/{id}")
    public ResponseEntity<NotificacaoDTO> buscarPorId(@PathVariable Long id) {
        // O service já lança ResourceNotFoundException se não encontrar
        NotificacaoDTO dto = service.buscarPorId(id);
        return ResponseEntity.ok(dto);
    }

    /**
     * Cria uma nova notificação no sistema
     * @param dto Dados da notificação a ser criada
     * @return ResponseEntity contendo a notificação criada com ID gerado
     */
    @PostMapping
    public ResponseEntity<NotificacaoDTO> criar(@RequestBody NotificacaoDTO dto) {
        NotificacaoDTO salvo = service.salvar(dto);
        return ResponseEntity.ok(salvo);
    }

    /**
     * Atualiza uma notificação existente
     * @param id Identificador da notificação a ser atualizada
     * @param dto Novos dados da notificação
     * @return ResponseEntity contendo a notificação atualizada ou status 404 se não existir
     */
    @PutMapping("/{id}")
    public ResponseEntity<NotificacaoDTO> atualizar(@PathVariable Long id, @RequestBody NotificacaoDTO dto) {
        NotificacaoDTO atualizado = service.atualizar(id, dto);
        return ResponseEntity.ok(atualizado);
    }

    /**
     * Remove uma notificação do sistema
     * @param id Identificador da notificação a ser removida
     * @return ResponseEntity com status 204 (No Content) ou 404 se não encontrada
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        service.deletar(id);
        return ResponseEntity.noContent().build();
    }
}
