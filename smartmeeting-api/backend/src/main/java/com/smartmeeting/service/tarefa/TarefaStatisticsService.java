package com.smartmeeting.service.tarefa;

import com.smartmeeting.dto.TarefaDTO;
import com.smartmeeting.dto.TarefaStatisticsDTO;
import com.smartmeeting.enums.PrioridadeTarefa;
import com.smartmeeting.model.Tarefa;
import com.smartmeeting.repository.TarefaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
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

                // ===== AGRUPAMENTO POR COLUNA KANBAN (DINÂMICO) =====
                Map<String, Long> porStatus = todasTarefas.stream()
                        .filter(t -> t.getColumn() != null)
                        .collect(Collectors.groupingBy(
                                t -> t.getColumn().getTitle(),
                                Collectors.counting()
                        ));

                Map<PrioridadeTarefa, Long> porPrioridade = todasTarefas.stream()
                        .map(this::withDefaultPrioridade)
                        .collect(Collectors.groupingBy(
                                Tarefa::getPrioridade,
                                Collectors.counting()
                        ));

                List<TarefaStatisticsDTO.ResponsavelStatsDTO> porResponsavel =
                        todasTarefas.stream()
                                .filter(t -> t.getResponsavel() != null)
                                .collect(Collectors.groupingBy(
                                        t -> t.getResponsavel().getNome(),
                                        Collectors.collectingAndThen(
                                                Collectors.toList(),
                                                tarefasDoResponsavel -> {
                                                        long totalResp = tarefasDoResponsavel.size();
                                                        long concluidasResp = tarefasDoResponsavel.stream()
                                                                .filter(Tarefa::isConcluida)
                                                                .count();

                                                        return new TarefaStatisticsDTO.ResponsavelStatsDTO(
                                                                tarefasDoResponsavel.get(0).getResponsavel().getNome(),
                                                                totalResp,
                                                                concluidasResp
                                                        );
                                                }
                                        )
                                ))
                                .values()
                                .stream()
                                .collect(Collectors.toList());

                long tarefasConcluidas = todasTarefas.stream()
                        .filter(Tarefa::isConcluida)
                        .count();

                double taxaConclusao = total > 0
                        ? (double) tarefasConcluidas / total
                        : 0.0;

                long tarefasVencendo = todasTarefas.stream()
                        .filter(t -> t.getPrazo() != null
                                && t.getPrazo().isAfter(now.toLocalDate())
                                && t.getPrazo().isBefore(now.toLocalDate().plusDays(3))
                                && !t.isConcluida())
                        .count();

                long tarefasAtrasadas = todasTarefas.stream()
                        .filter(t -> t.getPrazo() != null
                                && t.getPrazo().isBefore(now.toLocalDate())
                                && !t.isConcluida())
                        .count();

                double mediaTempoConclusao = 0.0;
                List<TarefaStatisticsDTO.ProdutividadeSemanaDTO> produtividadeSemana = List.of();

                return new TarefaStatisticsDTO(
                        total,
                        porStatus,            // ✔ agora Map<String, Long>
                        porPrioridade,
                        porResponsavel,
                        taxaConclusao,
                        tarefasVencendo,
                        tarefasAtrasadas,
                        mediaTempoConclusao,
                        produtividadeSemana
                );
        }

        @Transactional(readOnly = true)
        public List<TarefaDTO> getTarefasVencendo(Integer dias) {
                if (dias == null || dias < 0) {
                        dias = 3;
                }

                LocalDate dataLimite = LocalDate.now().plusDays(dias);

                return tarefaRepository.findAll().stream()
                        .filter(t -> t.getPrazo() != null
                                && !t.isConcluida()
                                && t.getPrazo().isAfter(LocalDate.now())
                                && t.getPrazo().isBefore(dataLimite))
                        .map(t -> {
                                TarefaDTO dto = new TarefaDTO();
                                dto.setId(t.getId());
                                dto.setTitulo(t.getTitulo());
                                dto.setDescricao(t.getDescricao());
                                dto.setPrazo(t.getPrazo());
                                dto.setConcluida(t.isConcluida());
                                return dto;
                        })
                        .collect(Collectors.toList());
        }

        private Tarefa withDefaultPrioridade(Tarefa tarefa) {
                if (tarefa.getPrioridade() == null) {
                        tarefa.setPrioridade(PrioridadeTarefa.MEDIA);
                }
                return tarefa;
        }

        public long countByProjeto(Long projetoId) {
                return tarefaRepository.countByProjectId(projetoId);
        }
}
