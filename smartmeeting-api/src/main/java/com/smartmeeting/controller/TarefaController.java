package com.smartmeeting.controller;

import com.smartmeeting.dto.TarefaDTO;
import com.smartmeeting.service.TarefaService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/tarefas")
public class TarefaController {

    private final TarefaService tarefaService;

    public TarefaController(TarefaService tarefaService) {
        this.tarefaService = tarefaService;
    }

    /**
     * Lista todas as tarefas cadastradas no sistema
     * @return Lista de tarefas convertidas para DTO
     */
    @GetMapping
    public ResponseEntity<List<TarefaDTO>> listarTodas() {
        List<TarefaDTO> tarefas = tarefaService.listarTodasDTO();
        return ResponseEntity.ok(tarefas);
    }

    /**
     * Busca uma tarefa específica pelo seu ID
     * @param id Identificador da tarefa
     * @return ResponseEntity contendo a tarefa encontrada ou status 404 se não existir
     */
    @GetMapping("/{id}")
    public ResponseEntity<TarefaDTO> buscarPorId(@PathVariable Long id) {
        return tarefaService.buscarPorIdDTO(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Cria uma nova tarefa no sistema
     * @param dto Dados da tarefa a ser criada
     * @return ResponseEntity contendo a tarefa criada com ID gerado
     */
    @PostMapping
    public ResponseEntity<TarefaDTO> criar(@RequestBody TarefaDTO dto) {
        try {
            TarefaDTO salvo = tarefaService.criar(dto);
            return ResponseEntity.ok(salvo);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Atualiza uma tarefa existente
     * @param id Identificador da tarefa a ser atualizada
     * @param dto Novos dados da tarefa
     * @return ResponseEntity contendo a tarefa atualizada ou status 404 se não existir
     */
    @PutMapping("/{id}")
    public ResponseEntity<TarefaDTO> atualizar(@PathVariable Long id, @RequestBody TarefaDTO dto) {
        try {
            TarefaDTO atualizado = tarefaService.atualizar(id, dto);
            return ResponseEntity.ok(atualizado);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Remove uma tarefa do sistema
     * @param id Identificador da tarefa a ser removida
     * @return ResponseEntity com status 204 (No Content) ou 404 se não encontrada
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        try {
            tarefaService.deletar(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Verifica tarefas pendentes para uma reunião específica
     * @param idReuniao Identificador da reunião
     * @return ResponseEntity contendo informações sobre as pendências ou status 404 se a reunião não existir
     */
    @GetMapping("/reuniao/{idReuniao}/pendencias")
    public ResponseEntity<String> verificarPendencias(@PathVariable Long idReuniao) {
        try {
            String resultado = tarefaService.verificarPendencias(idReuniao);
            return ResponseEntity.ok(resultado);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }
}
