package com.smartmeeting.controller;

import com.smartmeeting.dto.SalaDTO;
import com.smartmeeting.service.SalaService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/salas")
public class SalaController {

    private final SalaService service;

    public SalaController(SalaService service) {
        this.service = service;
    }

    /**
     * Lista todas as salas cadastradas no sistema
     * @return Lista de salas convertidas para DTO
     */
    @GetMapping
    public ResponseEntity<List<SalaDTO>> listar() {
        List<SalaDTO> salas = service.listarTodas();
        return ResponseEntity.ok(salas);
    }

    /**
     * Busca uma sala específica pelo seu ID
     * @param id Identificador da sala
     * @return ResponseEntity contendo a sala encontrada ou status 404 se não existir
     */
    @GetMapping("/{id}")
    public ResponseEntity<SalaDTO> buscarPorId(@PathVariable Long id) {
        // O service lançará ResourceNotFoundException se não encontrar, que será tratada pelo GlobalExceptionHandler
        SalaDTO dto = service.buscarPorId(id);
        return ResponseEntity.ok(dto);
    }

    /**
     * Cria uma nova sala no sistema
     * @param dto Dados da sala a ser criada
     * @return ResponseEntity contendo a sala criada com ID gerado
     */
    @PostMapping
    public ResponseEntity<SalaDTO> criar(@Valid @RequestBody SalaDTO dto) {
        SalaDTO salvo = service.criar(dto);
        return ResponseEntity.ok(salvo);
    }

    /**
     * Atualiza uma sala existente
     * @param id Identificador da sala a ser atualizada
     * @param dto Novos dados da sala
     * @return ResponseEntity contendo a sala atualizada ou status 404 se não existir
     */
    @PutMapping("/{id}")
    public ResponseEntity<SalaDTO> atualizar(@PathVariable Long id, @Valid @RequestBody SalaDTO dto) {
        SalaDTO atualizado = service.atualizar(id, dto);
        return ResponseEntity.ok(atualizado);
    }

    /**
     * Remove uma sala do sistema
     * @param id Identificador da sala a ser removida
     * @return ResponseEntity com status 204 (No Content) ou 404 se não encontrada
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        service.deletar(id);
        return ResponseEntity.noContent().build();
    }
}
