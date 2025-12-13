package com.smartmeeting.service.sala;

import com.smartmeeting.dto.SalaDTO;
import com.smartmeeting.dto.SalaStatisticsDTO;
import com.smartmeeting.exception.ResourceNotFoundException;
import com.smartmeeting.model.Reuniao;

import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

/**
 * Orquestrador público que expõe a mesma API da sua SalaService original.
 * Delegates para serviços especializados.
 */
@Service
public class SalaService {

    private final SalaCrudService crudService;
    private final SalaStatisticsService statisticsService;
    private final SalaReservationService reservationService;
    private final SalaAvailabilityService availabilityService;
    private final SalaResourceService resourceService;
    private final SalaStatusService statusService;
    private final SalaSearchService searchService;

    public SalaService(SalaCrudService crudService,
            SalaStatisticsService statisticsService,
            SalaReservationService reservationService,
            SalaAvailabilityService availabilityService,
            SalaResourceService resourceService,
            SalaStatusService statusService,
            SalaSearchService searchService) {
        this.crudService = crudService;
        this.statisticsService = statisticsService;
        this.reservationService = reservationService;
        this.availabilityService = availabilityService;
        this.resourceService = resourceService;
        this.statusService = statusService;
        this.searchService = searchService;
    }

    // Conversões (pass-through para manter compatibilidade)
    public SalaDTO toDTO(com.smartmeeting.model.Sala sala) {
        return crudService.toDTO(sala);
    }

    public com.smartmeeting.model.Sala toEntity(SalaDTO dto) {
        return crudService.toEntity(dto);
    }

    // CRUD
    public List<SalaDTO> listarTodas() {
        return crudService.listarTodas();
    }

    public SalaDTO buscarPorId(Long id) {
        return crudService.buscarPorId(id);
    }

    public SalaDTO criar(SalaDTO dto) {
        return crudService.criar(dto);
    }

    public SalaDTO atualizar(Long id, SalaDTO dtoAtualizada) {
        return crudService.atualizar(id, dtoAtualizada);
    }

    public void deletar(Long id) {
        crudService.deletar(id);
    }

    // Estatísticas / contagens
    public long getTotalSalas() {
        return statisticsService.getTotalSalas();
    }

    public long getSalasEmUso() {
        return statisticsService.getSalasEmUso();
    }

    public SalaStatisticsDTO getSalaStatistics() {
        return statisticsService.getSalaStatistics();
    }

    // Reserva / disponibilidade
    public void reservarSala(Long id, String inicio, String fim) {
        reservationService.reservarSala(id, inicio, fim);
    }

    public Map<String, Object> getDisponibilidadeSala(Long salaId, String data) {
        return availabilityService.getDisponibilidadeSala(salaId, data);
    }

    public void cancelarReservaSala(Long salaId, Long reservaId) {
        reservationService.cancelarReservaSala(salaId, reservaId);
    }

    // Recursos / status / busca
    public SalaDTO updateRecursos(Long salaId, List<String> recursos) {
        return resourceService.updateRecursos(salaId, recursos);
    }

    public SalaDTO atualizarStatus(Long salaId, String status) {
        return statusService.atualizarStatus(salaId, status);
    }

    public List<SalaDTO> buscarPorTexto(String termo) {
        return searchService.buscarPorTexto(termo);
    }

    public List<String> getCategorias() {
        return searchService.getCategorias();
    }
}
