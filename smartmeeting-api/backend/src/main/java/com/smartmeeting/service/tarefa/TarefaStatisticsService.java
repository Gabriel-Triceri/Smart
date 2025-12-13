package com.smartmeeting.service.tarefa;

import com.smartmeeting.dto.TarefaStatisticsDTO;
import com.smartmeeting.enums.PrioridadeTarefa;
import com.smartmeeting.enums.StatusTarefa;
import com.smartmeeting.model.Tarefa;
import com.smartmeeting.repository.TarefaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class TarefaStatisticsService {

        private final TarefaRepository tarefaRepository;

        public TarefaStatisticsService(TarefaRepository tarefaRepository) {
                this.tarefaRepository = tarefaRepository;
        }

        @Transactional(readOnly = true)
        public TarefaStatisticsDTO getTarefaStatistics() {
                List<Tarefa> todasTarefas = tarefaRepository.findAll();
                LocalDateTime now = LocalDateTime.now();

                long total = todasTarefas.size();

                Map<StatusTarefa, Long> porStatus = todasTarefas.stream()
                                .map(this::withDefaultStatus)
                                .collect(Collectors.groupingBy(Tarefa::getStatusTarefa, Collectors.counting()));

                Map<PrioridadeTarefa, Long> porPrioridade = todasTarefas.stream()
                                .map(this::withDefaultPrioridade)
                                .collect(Collectors.groupingBy(Tarefa::getPrioridade, Collectors.counting()));

                List<TarefaStatisticsDTO.ResponsavelStatsDTO> porResponsavel = todasTarefas.stream()
                                .filter(t -> t.getResponsavel() != null)
                                .collect(Collectors.groupingBy(t -> t.getResponsavel().getNome(),
                                                Collectors.collectingAndThen(Collectors.toList(),
                                                                tarefasDoResponsavel -> {
                                                                        long totalResp = tarefasDoResponsavel.size();
                                                                        long concluidasResp = tarefasDoResponsavel
                                                                                        .stream()
                                                                                        .filter(t -> t.getStatusTarefa() == StatusTarefa.DONE)
                                                                                        .count();
                                                                        return new TarefaStatisticsDTO.ResponsavelStatsDTO(
                                                                                        tarefasDoResponsavel.get(0)
                                                                                                        .getResponsavel()
                                                                                                        .getNome(),
                                                                                        totalResp, concluidasResp);
                                                                })))
                                .values().stream().collect(Collectors.toList());

                long tarefasConcluidas = todasTarefas.stream()
                                .filter(t -> t.getStatusTarefa() == StatusTarefa.DONE)
                                .count();
                double taxaConclusao = total > 0 ? (double) tarefasConcluidas / total : 0.0;

                long tarefasVencendo = todasTarefas.stream()
                                .filter(t -> t.getPrazo() != null && t.getPrazo().isAfter(now.toLocalDate())
                                                && t.getPrazo().isBefore(now.toLocalDate().plusDays(3))
                                                && t.getStatusTarefa() != StatusTarefa.DONE)
                                .count();

                long tarefasAtrasadas = todasTarefas.stream()
                                .filter(t -> t.getPrazo() != null && t.getPrazo().isBefore(now.toLocalDate())
                                                && t.getStatusTarefa() != StatusTarefa.DONE)
                                .count();

                double mediaTempoConclusao = 0.0;
                List<TarefaStatisticsDTO.ProdutividadeSemanaDTO> produtividadeSemana = List.of();

                return new TarefaStatisticsDTO(total, porStatus, porPrioridade, porResponsavel, taxaConclusao,
                                tarefasVencendo, tarefasAtrasadas, mediaTempoConclusao, produtividadeSemana);
        }

        @Transactional(readOnly = true)
        public List<com.smartmeeting.dto.TarefaDTO> getTarefasVencendo(Integer dias) {
                if (dias == null || dias < 0)
                        dias = 3;
                java.time.LocalDate dataLimite = java.time.LocalDate.now().plusDays(dias);

                List<Tarefa> tarefas = tarefaRepository.findAll().stream()
                                .filter(t -> t.getPrazo() != null && !t.isConcluida()
                                                && t.getPrazo().isBefore(dataLimite)
                                                && t.getPrazo().isAfter(java.time.LocalDate.now()))
                                .collect(Collectors.toList());

                return tarefas.stream().map(t -> {
                        // converter manualmente chamando mapper se necessário.
                        com.smartmeeting.dto.TarefaDTO dto = new com.smartmeeting.dto.TarefaDTO();
                        dto.setId(t.getId());
                        dto.setDescricao(t.getDescricao());
                        dto.setPrazo(t.getPrazo());
                        dto.setTitulo(t.getTitulo());
                        dto.setConcluida(t.isConcluida());
                        return dto;
                }).collect(Collectors.toList());
        }

        private Tarefa withDefaultStatus(Tarefa tarefa) {
                if (tarefa.getStatusTarefa() == null)
                        tarefa.setStatusTarefa(StatusTarefa.TODO);
                return tarefa;
        }

        private Tarefa withDefaultPrioridade(Tarefa tarefa) {
                if (tarefa.getPrioridade() == null)
                        tarefa.setPrioridade(PrioridadeTarefa.MEDIA);
                return tarefa;
        }

        public long countByStatus(StatusTarefa status) {
                return tarefaRepository.countByStatusTarefa(status);
        }

        public long countByProjeto(Long projetoId) {
                return tarefaRepository.countByProjectId(projetoId);
        }
}
