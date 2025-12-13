package com.smartmeeting.service.relatorio;

import com.smartmeeting.enums.StatusReuniao;

import com.smartmeeting.exception.ResourceNotFoundException;
import com.smartmeeting.model.Pessoa;
import com.smartmeeting.model.Presenca;
import com.smartmeeting.model.Reuniao;
import com.smartmeeting.model.Tarefa;
import com.smartmeeting.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class RelatorioService {

    @Autowired
    private ReuniaoRepository reuniaoRepository;

    @Autowired
    private TarefaRepository tarefaRepository;

    @Autowired
    private PresencaRepository presencaRepository;

    @Autowired
    private PessoaRepository pessoaRepository;

    public Map<String, Object> getReunioesPorSala(LocalDate dataInicio, LocalDate dataFim) {
        List<Reuniao> reunioes;
        if (dataInicio != null && dataFim != null) {
            reunioes = reuniaoRepository.findByDataHoraInicioBetween(dataInicio.atStartOfDay(),
                    dataFim.atTime(LocalTime.MAX));
        } else {
            reunioes = reuniaoRepository.findAll();
        }

        Map<String, Long> reunioesPorSala = reunioes.stream()
                .collect(Collectors.groupingBy(
                        reuniao -> reuniao.getSala().getNome(),
                        Collectors.counting()));

        Map<String, Object> resultado = new HashMap<>();
        resultado.put("total_reunioes", reunioes.size());
        resultado.put("reunioes_por_sala", reunioesPorSala);
        resultado.put("data_geracao", LocalDateTime.now());

        return resultado;
    }

    public Map<String, Object> getTarefasConcluidas(LocalDate dataInicio, LocalDate dataFim) {
        List<Tarefa> todasTarefas;
        if (dataInicio != null && dataFim != null) {
            todasTarefas = tarefaRepository.findByPrazoBetween(dataInicio, dataFim);
        } else {
            todasTarefas = tarefaRepository.findAll();
        }

        long tarefasConcluidas = todasTarefas.stream().filter(Tarefa::isConcluida).count();

        Map<String, Object> resultado = new HashMap<>();
        resultado.put("total_tarefas", todasTarefas.size());
        resultado.put("tarefas_concluidas", tarefasConcluidas);
        resultado.put("tarefas_pendentes", todasTarefas.size() - tarefasConcluidas);
        resultado.put("percentual_conclusao",
                todasTarefas.size() > 0 ? (double) tarefasConcluidas / todasTarefas.size() * 100 : 0);
        resultado.put("data_geracao", LocalDateTime.now());

        return resultado;
    }

    public Map<String, Object> getPresencaPorPessoa(Long participanteId) {
        List<Presenca> presencas;
        if (participanteId != null) {
            // Verifica se a pessoa existe antes de buscar as presenças
            pessoaRepository.findById(participanteId)
                    .orElseThrow(
                            () -> new ResourceNotFoundException("Pessoa não encontrada com ID: " + participanteId));
            presencas = presencaRepository.findByParticipanteId(participanteId);
        } else {
            presencas = presencaRepository.findAll();
        }

        Map<String, Long> presencasPorPessoa = presencas.stream()
                .collect(Collectors.groupingBy(
                        presenca -> presenca.getParticipante().getNome(),
                        Collectors.counting()));

        Map<String, Object> resultado = new HashMap<>();
        resultado.put("total_presencas", presencas.size());
        resultado.put("presencas_por_pessoa", presencasPorPessoa);
        if (participanteId != null) {
            Optional<Pessoa> pessoa = pessoaRepository.findById(participanteId);
            resultado.put("pessoa_filtrada", pessoa.map(Pessoa::getNome).orElse("Não encontrada"));
        }
        resultado.put("data_geracao", LocalDateTime.now());

        return resultado;
    }

    public Map<String, Object> getDuracaoReunioes(LocalDate dataInicio, LocalDate dataFim) {
        List<Reuniao> reunioesFinalizadas;
        if (dataInicio != null && dataFim != null) {
            reunioesFinalizadas = reuniaoRepository.findByDataHoraInicioBetweenAndStatus(dataInicio.atStartOfDay(),
                    dataFim.atTime(LocalTime.MAX), StatusReuniao.FINALIZADA);
        } else {
            reunioesFinalizadas = reuniaoRepository.findByStatus(StatusReuniao.FINALIZADA);
        }

        double duracaoMedia = reunioesFinalizadas.stream()
                .mapToDouble(Reuniao::getDuracaoMinutos)
                .average()
                .orElse(0.0);

        double duracaoTotal = reunioesFinalizadas.stream()
                .mapToDouble(Reuniao::getDuracaoMinutos)
                .sum();

        OptionalDouble duracaoMaxima = reunioesFinalizadas.stream()
                .mapToDouble(Reuniao::getDuracaoMinutos)
                .max();

        OptionalDouble duracaoMinima = reunioesFinalizadas.stream()
                .mapToDouble(Reuniao::getDuracaoMinutos)
                .min();

        Map<String, Object> resultado = new HashMap<>();
        resultado.put("total_reunioes_finalizadas", reunioesFinalizadas.size());
        resultado.put("duracao_media_minutos", duracaoMedia);
        resultado.put("duracao_total_minutos", duracaoTotal);
        resultado.put("duracao_maxima_minutos", duracaoMaxima.isPresent() ? duracaoMaxima.getAsDouble() : 0);
        resultado.put("duracao_minima_minutos", duracaoMinima.isPresent() ? duracaoMinima.getAsDouble() : 0);
        resultado.put("data_geracao", LocalDateTime.now());

        return resultado;
    }

    public Map<String, Object> getProdutividadePorParticipante(LocalDate dataInicio, LocalDate dataFim) {
        List<Tarefa> todasTarefas;
        if (dataInicio != null && dataFim != null) {
            todasTarefas = tarefaRepository.findByPrazoBetween(dataInicio, dataFim);
        } else {
            todasTarefas = tarefaRepository.findAll();
        }

        Map<String, List<Tarefa>> tarefasPorPessoa = todasTarefas.stream()
                .filter(t -> t.getResponsavel() != null)
                .collect(Collectors.groupingBy(t -> t.getResponsavel().getNome()));

        Map<String, Object> produtividade = tarefasPorPessoa.entrySet().stream()
                .collect(Collectors.toMap(
                        Map.Entry::getKey,
                        entry -> {
                            long concluidas = entry.getValue().stream()
                                    .filter(Tarefa::isConcluida)
                                    .count();
                            long total = entry.getValue().size();
                            Map<String, Object> stats = new HashMap<>();
                            stats.put("total_tarefas", total);
                            stats.put("tarefas_concluidas", concluidas);
                            stats.put("percentual_conclusao", total > 0 ? (double) concluidas / total * 100 : 0);
                            return stats;
                        }));

        Map<String, Object> resultado = new HashMap<>();
        resultado.put("produtividade_por_participante", produtividade);
        resultado.put("data_geracao", LocalDateTime.now());

        return resultado;
    }
}
