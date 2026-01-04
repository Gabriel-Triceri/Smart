package com.smartmeeting.service.reuniao;

import com.smartmeeting.dto.ReuniaoListDTO;
import com.smartmeeting.dto.ReuniaoStatisticsDTO;
import com.smartmeeting.model.Reuniao;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

/**
 * Orquestrador público que expõe a API de ReuniaoService.
 * Delega para serviços especializados.
 */
@Service
@RequiredArgsConstructor
public class ReuniaoService {

    private final ReuniaoCrudService crudService;
    private final ReuniaoLifecycleService lifecycleService;
    private final ReuniaoStatisticsService statisticsService;

    // CRUD
    public List<ReuniaoListDTO> listarTodas(Long userId) {
        return crudService.listarTodas(userId);
    }

    public Optional<Reuniao> buscarPorId(Long id) {
        return crudService.buscarPorId(id);
    }

    public Reuniao salvar(Reuniao reuniao) {
        return crudService.salvar(reuniao);
    }

    public Reuniao atualizar(Long id, Reuniao reuniaoAtualizada) {
        return crudService.atualizar(id, reuniaoAtualizada);
    }

    public void deletar(Long id) {
        crudService.deletar(id);
    }

    // Lifecycle
    public Reuniao encerrarReuniao(Long id) {
        return lifecycleService.encerrarReuniao(id);
    }

    // Statistics
    public long getTotalReunioes() {
        return statisticsService.getTotalReunioes();
    }

    public long getTotalReunioesByPessoa(Long pessoaId) {
        return statisticsService.getTotalReunioesByPessoa(pessoaId);
    }

    public List<Reuniao> getProximasReunioes() {
        return statisticsService.getProximasReunioes();
    }

    @Cacheable("statistics")
    public ReuniaoStatisticsDTO getReuniaoStatistics() {
        return statisticsService.getReuniaoStatistics();
    }
}
