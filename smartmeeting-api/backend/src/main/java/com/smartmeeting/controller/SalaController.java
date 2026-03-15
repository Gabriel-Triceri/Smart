package com.smartmeeting.controller;

import com.smartmeeting.dto.SalaDTO;
import com.smartmeeting.dto.SalaStatisticsDTO;
import com.smartmeeting.service.sala.SalaService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
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

    @GetMapping
    public ResponseEntity<List<SalaDTO>> listar() {
        List<SalaDTO> salas = service.listarTodas();
        return ResponseEntity.ok(salas);
    }

    @GetMapping("/{id}")
    public ResponseEntity<SalaDTO> buscarPorId(@PathVariable(name = "id") Long id) {
        SalaDTO dto = service.buscarPorId(id);
        return ResponseEntity.ok(dto);
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasAuthority('ADMIN_SYSTEM_SETTINGS')")
    public ResponseEntity<SalaDTO> criar(@Valid @RequestBody SalaDTO dto) {
        SalaDTO salvo = service.criar(dto);
        return ResponseEntity.ok(salvo);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasAuthority('ADMIN_SYSTEM_SETTINGS')")
    public ResponseEntity<SalaDTO> atualizar(@PathVariable(name = "id") Long id, @Valid @RequestBody SalaDTO dto) {
        SalaDTO atualizado = service.atualizar(id, dto);
        return ResponseEntity.ok(atualizado);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasAuthority('ADMIN_SYSTEM_SETTINGS')")
    public ResponseEntity<Void> deletar(@PathVariable(name = "id") Long id) {
        service.deletar(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/total")
    public ResponseEntity<Map<String, Long>> getTotalSalas() {
        long totalSalas = service.getTotalSalas();
        return ResponseEntity.ok(Map.of("totalSalas", totalSalas));
    }

    @GetMapping("/em-uso")
    public ResponseEntity<Map<String, Long>> getSalasEmUso() {
        long salasEmUso = service.getSalasEmUso();
        return ResponseEntity.ok(Map.of("salasEmUso", salasEmUso));
    }

    @GetMapping("/statistics")
    @PreAuthorize("hasRole('ADMIN') or hasAuthority('ADMIN_VIEW_REPORTS')")
    public ResponseEntity<SalaStatisticsDTO> getSalaStatistics() {
        SalaStatisticsDTO statistics = service.getSalaStatistics();
        return ResponseEntity.ok(statistics);
    }

    @PostMapping("/{id}/reservar")
    public ResponseEntity<Void> reservarSala(@PathVariable("id") Long id, @RequestBody Map<String, String> body) {
        service.reservarSala(id, body.get("inicio"), body.get("fim"));
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{id}/disponibilidade")
    public ResponseEntity<Map<String, Object>> getDisponibilidadeSala(
            @PathVariable("id") Long id,
            @RequestParam String data) {
        Map<String, Object> disponibilidade = service.getDisponibilidadeSala(id, data);
        return ResponseEntity.ok(disponibilidade);
    }

    @DeleteMapping("/{id}/reservar/{reservaId}")
    public ResponseEntity<Void> cancelarReservaSala(
            @PathVariable("id") Long id,
            @PathVariable("reservaId") Long reservaId) {
        service.cancelarReservaSala(id, reservaId);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}/recursos")
    @PreAuthorize("hasRole('ADMIN') or hasAuthority('ADMIN_SYSTEM_SETTINGS')")
    public ResponseEntity<SalaDTO> updateRecursosSala(
            @PathVariable("id") Long id,
            @RequestBody Map<String, Object> requestBody) {
        @SuppressWarnings("unchecked")
        List<String> recursos = (List<String>) requestBody.get("recursos");
        SalaDTO salaAtualizada = service.updateRecursos(id, recursos);
        return ResponseEntity.ok(salaAtualizada);
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN') or hasAuthority('ADMIN_SYSTEM_SETTINGS')")
    public ResponseEntity<SalaDTO> atualizarStatusSala(
            @PathVariable("id") Long id,
            @RequestBody Map<String, String> requestBody) {
        String status = requestBody.get("status");
        SalaDTO salaAtualizada = service.atualizarStatus(id, status);
        return ResponseEntity.ok(salaAtualizada);
    }

    @GetMapping("/buscar")
    public ResponseEntity<List<SalaDTO>> buscarSalas(@RequestParam String q) {
        List<SalaDTO> salas = service.buscarPorTexto(q);
        return ResponseEntity.ok(salas);
    }

    @GetMapping("/categorias")
    public ResponseEntity<List<String>> getCategoriasSalas() {
        List<String> categorias = service.getCategorias();
        return ResponseEntity.ok(categorias);
    }
}
