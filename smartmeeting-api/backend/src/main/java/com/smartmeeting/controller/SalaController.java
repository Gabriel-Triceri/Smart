package com.smartmeeting.controller;

import com.smartmeeting.dto.SalaDTO;
import com.smartmeeting.dto.SalaStatisticsDTO;
import com.smartmeeting.service.SalaService;
import com.smartmeeting.service.TarefaService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;

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
    public ResponseEntity<SalaDTO> buscarPorId(@PathVariable(name = "id") Long id) {
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
    public ResponseEntity<SalaDTO> atualizar(@PathVariable(name = "id") Long id, @Valid @RequestBody SalaDTO dto) {
        SalaDTO atualizado = service.atualizar(id, dto);
        return ResponseEntity.ok(atualizado);
    }

    /**
     * Remove uma sala do sistema
     * @param id Identificador da sala a ser removida
     * @return ResponseEntity com status 204 (No Content) ou 404 se não encontrada
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable(name = "id") Long id) {
        service.deletar(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * API para obter o total de salas cadastradas no sistema.
     * Endpoint: GET /salas/total
     * Retorno: JSON com a quantidade total de salas, por exemplo: { "totalSalas": 10 }
     */
    @GetMapping("/total")
    public ResponseEntity<Map<String, Long>> getTotalSalas() {
        long totalSalas = service.getTotalSalas();
        return ResponseEntity.ok(Map.of("totalSalas", totalSalas));
    }

    /**
     * API para obter a quantidade de salas atualmente em uso.
     * Endpoint: GET /salas/em-uso
     * Retorno: JSON com a quantidade de salas ocupadas, por exemplo: { "salasEmUso": 3 }
     */
    @GetMapping("/em-uso")
    public ResponseEntity<Map<String, Long>> getSalasEmUso() {
        long salasEmUso = service.getSalasEmUso();
        return ResponseEntity.ok(Map.of("salasEmUso", salasEmUso));
    }

    /**
     * API para obter estatísticas gerais sobre as salas.
     * Endpoint: GET /salas/statistics
     * Retorno: JSON com dados estatísticos, por exemplo: { "totalSalas": 10, "salasEmUso": 3, "salasDisponiveis": 7 }
     */
    @GetMapping("/statistics")
    public ResponseEntity<SalaStatisticsDTO> getSalaStatistics() {
        SalaStatisticsDTO statistics = service.getSalaStatistics();
        return ResponseEntity.ok(statistics);
    }

    @PostMapping("/{id}/reservar")
    public ResponseEntity<Void> reservarSala(@PathVariable("id") Long id, @RequestBody Map<String, String> body) {
        service.reservarSala(id, body.get("inicio"), body.get("fim"));
        return ResponseEntity.ok().build();
    }

    /**
     * API para obter disponibilidade de uma sala em uma data específica
     */
    @GetMapping("/{id}/disponibilidade")
    public ResponseEntity<Map<String, Object>> getDisponibilidadeSala(
            @PathVariable("id") Long id,
            @RequestParam String data) {
        Map<String, Object> disponibilidade = service.getDisponibilidadeSala(id, data);
        return ResponseEntity.ok(disponibilidade);
    }

    /**
     * API para cancelar reserva de sala
     */
    @DeleteMapping("/{id}/reservar/{reservaId}")
    public ResponseEntity<Void> cancelarReservaSala(
            @PathVariable("id") Long id,
            @PathVariable("reservaId") Long reservaId) {
        service.cancelarReservaSala(id, reservaId);
        return ResponseEntity.noContent().build();
    }

    /**
     * API para atualizar recursos de uma sala
     */
    @PutMapping("/{id}/recursos")
    public ResponseEntity<SalaDTO> updateRecursosSala(
            @PathVariable("id") Long id,
            @RequestBody Map<String, Object> requestBody) {
        @SuppressWarnings("unchecked")
        List<String> recursos = (List<String>) requestBody.get("recursos");
        SalaDTO salaAtualizada = service.updateRecursos(id, recursos);
        return ResponseEntity.ok(salaAtualizada);
    }


    /**
     * API para atualizar status da sala
     */
    @PatchMapping("/{id}/status")
    public ResponseEntity<SalaDTO> atualizarStatusSala(
            @PathVariable("id") Long id,
            @RequestBody Map<String, String> requestBody) {
        String status = requestBody.get("status");
        SalaDTO salaAtualizada = service.atualizarStatus(id, status);
        return ResponseEntity.ok(salaAtualizada);
    }

    /**
     * API para buscar salas por texto
     */
    @GetMapping("/buscar")
    public ResponseEntity<List<SalaDTO>> buscarSalas(@RequestParam String q) {
        List<SalaDTO> salas = service.buscarPorTexto(q);
        return ResponseEntity.ok(salas);
    }

    /**
     * API para obter categorias de salas
     */
    @GetMapping("/categorias")
    public ResponseEntity<List<String>> getCategoriasSalas() {
        List<String> categorias = service.getCategorias();
        return ResponseEntity.ok(categorias);
    }

}
