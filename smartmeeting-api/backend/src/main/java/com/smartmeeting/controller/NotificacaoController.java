package com.smartmeeting.controller;

import com.smartmeeting.dto.NotificacaoDTO;
import com.smartmeeting.service.notification.NotificacaoService;
import com.smartmeeting.util.SecurityUtils;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
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
     * Lista as notificações do usuário autenticado. Administradores recebem todas.
     *
     * Antes este endpoint devolvia as notificações de todos os usuários do sistema para
     * qualquer autenticado.
     */
    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<NotificacaoDTO>> listar() {
        if (SecurityUtils.isAdmin()) {
            return ResponseEntity.ok(service.listarTodas());
        }
        return ResponseEntity.ok(service.listarPara(SecurityUtils.getCurrentUserId()));
    }

    /**
     * Busca uma notificação específica pelo seu ID
     * 
     * @param id Identificador da notificação
     * @return ResponseEntity contendo a notificação encontrada ou status 404 se não
     *         existir
     */
    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<NotificacaoDTO> buscarPorId(@PathVariable Long id) {
        service.verificarAcesso(id);
        NotificacaoDTO dto = service.buscarPorId(id);
        return ResponseEntity.ok(dto);
    }

    /**
     * Cria uma nova notificação no sistema
     * 
     * @param dto Dados da notificação a ser criada
     * @return ResponseEntity contendo a notificação criada com ID gerado
     */
    /** Criar notificação para outra pessoa é ação administrativa. */
    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasAuthority('ADMIN_MANAGE_USERS')")
    public ResponseEntity<NotificacaoDTO> criar(@RequestBody NotificacaoDTO dto) {
        NotificacaoDTO salvo = service.salvar(dto);
        return ResponseEntity.ok(salvo);
    }

    /**
     * Atualiza uma notificação existente
     * 
     * @param id  Identificador da notificação a ser atualizada
     * @param dto Novos dados da notificação
     * @return ResponseEntity contendo a notificação atualizada ou status 404 se não
     *         existir
     */
    @PutMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<NotificacaoDTO> atualizar(@PathVariable Long id, @RequestBody NotificacaoDTO dto) {
        service.verificarAcesso(id);
        NotificacaoDTO atualizado = service.atualizar(id, dto);
        return ResponseEntity.ok(atualizado);
    }

    /**
     * Remove uma notificação do sistema
     * 
     * @param id Identificador da notificação a ser removida
     * @return ResponseEntity com status 204 (No Content) ou 404 se não encontrada
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        service.verificarAcesso(id);
        service.deletar(id);
        return ResponseEntity.noContent().build();
    }
}
