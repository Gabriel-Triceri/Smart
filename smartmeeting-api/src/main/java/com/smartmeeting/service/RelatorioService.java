package com.smartmeeting.service;

import com.smartmeeting.enums.StatusReuniao;
import com.smartmeeting.enums.StatusTarefa;
import com.smartmeeting.model.Pessoa;
import com.smartmeeting.model.Presenca;
import com.smartmeeting.model.Reuniao;
import com.smartmeeting.model.Tarefa;
import com.smartmeeting.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
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

    public Map<String, Object> getReunioesPorSala() {
        List<Reuniao> reunioes = reuniaoRepository.findAll();
        Map<String, Long> reunioesPorSala = reunioes.stream()
                .collect(Collectors.groupingBy(
                        reuniao -> reuniao.getSala().getNome(),
                        Collectors.counting()
                ));

        Map<String, Object> resultado = new HashMap<>();
        resultado.put("total_reunioes", reunioes.size());
        resultado.put("reunioes_por_sala", reunioesPorSala);
        resultado.put("data_geracao", LocalDateTime.now());

        return resultado;
    }

    public Map<String, Object> getTarefasConcluidas() {
        List<Tarefa> todasTarefas = tarefaRepository.findAll();
        List<Tarefa> tarefasConcluidas = tarefaRepository.findByStatusTarefa(StatusTarefa.PRE_REUNIAO);

        Map<String, Object> resultado = new HashMap<>();
        resultado.put("total_tarefas", todasTarefas.size());
        resultado.put("tarefas_concluidas", tarefasConcluidas.size());
        resultado.put("tarefas_pendentes", todasTarefas.size() - tarefasConcluidas.size());
        resultado.put("percentual_conclusao", 
                todasTarefas.size() > 0 ? 
                        (double) tarefasConcluidas.size() / todasTarefas.size() * 100 : 0);
        resultado.put("data_geracao", LocalDateTime.now());

        return resultado;
    }

    public Map<String, Object> getPresencaPorPessoa(Long participanteId) {
        List<Presenca> presencas;
        if (participanteId != null) {
            presencas = presencaRepository.findByParticipanteId(participanteId);
        } else {
            presencas = presencaRepository.findAll();
        }

        Map<String, Long> presencasPorPessoa = presencas.stream()
                .collect(Collectors.groupingBy(
                        presenca -> presenca.getParticipante().getNome(),
                        Collectors.counting()
                ));

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

    public Map<String, Object> getDuracaoReunioes() {
        List<Reuniao> reunioesFinalizadas = reuniaoRepository.findByStatus(StatusReuniao.FINALIZADA);

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
}