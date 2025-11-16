package com.smartmeeting.service;

import com.smartmeeting.dto.*;
import com.smartmeeting.enums.SalaStatus;
import com.smartmeeting.enums.StatusReuniao;
import com.smartmeeting.model.Pessoa;
import com.smartmeeting.model.Reuniao;
import com.smartmeeting.model.Sala;
import com.smartmeeting.model.Tarefa;
import com.smartmeeting.repository.*;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class DashboardService {

    private static final int DIAS_UTEIS_MES = 22;
    private static final int HORAS_TRABALHO_DIA = 8;
    private static final int MINUTOS_POR_HORA = 60;

    private final ReuniaoRepository reuniaoRepository;
    private final SalaRepository salaRepository;
    private final PessoaRepository pessoaRepository;
    private final TarefaRepository tarefaRepository;
    private final PresencaRepository presencaRepository;

    public DashboardService(ReuniaoRepository reuniaoRepository,
                            SalaRepository salaRepository,
                            PessoaRepository pessoaRepository,
                            TarefaRepository tarefaRepository,
                            PresencaRepository presencaRepository) {

        this.reuniaoRepository = reuniaoRepository;
        this.salaRepository = salaRepository;
        this.pessoaRepository = pessoaRepository;
        this.tarefaRepository = tarefaRepository;
        this.presencaRepository = presencaRepository;
    }

    // ====================================
    // DASHBOARD COMPLETO
    // ====================================
    public DashboardDTO obterDashboardCompleto() {
        return new DashboardDTO()
                .setEstatisticasGerais(obterEstatisticasGerais())
                .setUsoSalas(obterUsoSalas())
                .setTaxasPresenca(obterTaxasPresenca())
                .setProdutividadeOrganizadores(obterProdutividadeOrganizadores())
                .setMetricasReunioes(obterMetricasReunioes())
                .setReunioesHoje(obterReunioesHoje())
                .setProximasReunioes(obterProximasReunioes())
                .setAlertas(obterAlertas());
    }

    // ====================================
    // ESTATÍSTICAS GERAIS
    // ====================================
    public EstatisticasGeraisDTO obterEstatisticasGerais() {
        long totalAgendadas = reuniaoRepository.countByStatus(StatusReuniao.AGENDADA);
        long totalFinalizadas = reuniaoRepository.countByStatus(StatusReuniao.FINALIZADA);
        long totalCanceladas = reuniaoRepository.countByStatus(StatusReuniao.CANCELADA);
        long totalEmAndamento = reuniaoRepository.countByStatus(StatusReuniao.EM_ANDAMENTO);

        long totalSalas = salaRepository.count();
        long salasDisponiveis = salaRepository.countByStatus(SalaStatus.LIVRE);
        long totalPessoas = pessoaRepository.count();

        long tarefasPendentes = tarefaRepository.countByConcluida(false);
        long tarefasConcluidas = tarefaRepository.countByConcluida(true);

        long totalTarefas = tarefasPendentes + tarefasConcluidas;
        double taxaConclusao = totalTarefas == 0 ? 0.0 :
                Math.round((tarefasConcluidas * 100.0 / totalTarefas) * 100.0) / 100.0;

        return new EstatisticasGeraisDTO()
                .setTotalReunioesAgendadas(totalAgendadas)
                .setTotalReunioesFinalizadas(totalFinalizadas)
                .setTotalReunioesCanceladas(totalCanceladas)
                .setTotalReunioesEmAndamento(totalEmAndamento)
                .setTotalSalas(totalSalas)
                .setTotalSalasDisponiveis(salasDisponiveis)
                .setTotalPessoas(totalPessoas)
                .setTotalTarefasPendentes(tarefasPendentes)
                .setTotalTarefasConcluidas(tarefasConcluidas)
                .setTaxaConclusaoTarefas(taxaConclusao);
    }

    // ====================================
    // USO DAS SALAS
    // ====================================
    public List<UsoSalaDTO> obterUsoSalas() {
        return salaRepository.findAll().stream()
                .map(this::calcularUsoSala)
                .collect(Collectors.toList());
    }

    private UsoSalaDTO calcularUsoSala(Sala sala) {
        long totalReunioesRealizadas =
                reuniaoRepository.countBySalaIdAndStatus(sala.getId(), StatusReuniao.FINALIZADA);

        Integer totalMinutosUso =
                reuniaoRepository.sumDuracaoMinutosBySalaIdAndStatus(sala.getId(), StatusReuniao.FINALIZADA);

        if (totalMinutosUso == null) totalMinutosUso = 0;

        double taxaOcupacao = calcularTaxaOcupacao(totalMinutosUso);

        return new UsoSalaDTO()
                .setSalaId(sala.getId())
                .setSalaNome(sala.getNome())
                .setSalaLocalizacao(sala.getLocalizacao())
                .setTotalReunioesRealizadas(totalReunioesRealizadas)
                .setTotalMinutosUso(totalMinutosUso)
                .setTaxaOcupacao(taxaOcupacao);
    }

    private double calcularTaxaOcupacao(int minutosUsados) {
        int minutosDisponiveisMes = DIAS_UTEIS_MES * HORAS_TRABALHO_DIA * MINUTOS_POR_HORA;
        double taxa = minutosUsados == 0 ? 0.0 : (minutosUsados * 100.0) / minutosDisponiveisMes;
        return Math.round(taxa * 100.0) / 100.0;
    }

    // ====================================
    // TAXAS DE PRESENÇA
    // ====================================
    public List<TaxaPresencaDTO> obterTaxasPresenca() {
        return pessoaRepository.findAll().stream()
                .map(this::calcularTaxaPresenca)
                .filter(t -> t.getTotalReunioesConvidadas() > 0)
                .collect(Collectors.toList());
    }

    private TaxaPresencaDTO calcularTaxaPresenca(Pessoa pessoa) {

        List<Reuniao> reunioesConvidadas = reuniaoRepository.findByParticipanteId(pessoa.getId());
        long presencasRegistradas = presencaRepository.countByParticipanteId(pessoa.getId());

        long totalConvidadas = reunioesConvidadas.size();
        double taxa = totalConvidadas == 0 ? 0.0 :
                Math.round((presencasRegistradas * 100.0 / totalConvidadas) * 100.0) / 100.0;

        return new TaxaPresencaDTO()
                .setPessoaId(pessoa.getId())
                .setPessoaNome(pessoa.getNome())
                .setPessoaEmail(pessoa.getEmail())
                .setTotalReunioesConvidadas(totalConvidadas)
                .setTotalPresencasRegistradas(presencasRegistradas)
                .setTaxaPresenca(taxa);
    }

    // ====================================
    // PRODUTIVIDADE ORGANIZADORES
    // ====================================
    public List<ProdutividadeOrganizadorDTO> obterProdutividadeOrganizadores() {
        return pessoaRepository.findAll().stream()
                .filter(p -> !reuniaoRepository.findByOrganizadorId(p.getId()).isEmpty())
                .map(this::calcularProdutividadeOrganizador)
                .collect(Collectors.toList());
    }

    private ProdutividadeOrganizadorDTO calcularProdutividadeOrganizador(Pessoa organizador) {
        List<Reuniao> reunioes = reuniaoRepository.findByOrganizadorId(organizador.getId());

        long total = reunioes.size();
        long finalizadas = reunioes.stream().filter(r -> r.getStatus() == StatusReuniao.FINALIZADA).count();
        long canceladas = reunioes.stream().filter(r -> r.getStatus() == StatusReuniao.CANCELADA).count();

        int minutosTotais = reunioes.stream()
                .filter(r -> r.getStatus() == StatusReuniao.FINALIZADA)
                .mapToInt(Reuniao::getDuracaoMinutos)
                .sum();

        double taxaSucesso = total == 0 ? 0.0 :
                Math.round((finalizadas * 100.0 / total) * 100.0) / 100.0;

        double mediaPart =
                reunioes.stream()
                        .filter(r -> r.getParticipantes() != null)
                        .mapToInt(r -> r.getParticipantes().size())
                        .average()
                        .orElse(0.0);

        return new ProdutividadeOrganizadorDTO()
                .setOrganizadorId(organizador.getId())
                .setOrganizadorNome(organizador.getNome())
                .setOrganizadorEmail(organizador.getEmail())
                .setTotalReunioesOrganizadas(total)
                .setReunioesFinalizadas(finalizadas)
                .setReunioesCanceladas(canceladas)
                .setTotalMinutosReuniao(minutosTotais)
                .setTaxaSucesso(taxaSucesso)
                .setMediaParticipantesPorReuniao(Math.round(mediaPart * 100.0) / 100.0);
    }

    // ====================================
    // MÉTRICAS DE REUNIÕES
    // ====================================
    public MetricasReunioesDTO obterMetricasReunioes() {

        Double mediaDuracao = reuniaoRepository.avgDuracaoMinutosByStatus(StatusReuniao.FINALIZADA);
        Integer minDuracao = reuniaoRepository.minDuracaoMinutosByStatus(StatusReuniao.FINALIZADA);
        Integer maxDuracao = reuniaoRepository.maxDuracaoMinutosByStatus(StatusReuniao.FINALIZADA);

        if (mediaDuracao == null || minDuracao == null || maxDuracao == null) {
            return new MetricasReunioesDTO()
                    .setDuracaoMediaMinutos(0.0)
                    .setDuracaoMinimaMinutos(0)
                    .setDuracaoMaximaMinutos(0)
                    .setMediaParticipantesPorReuniao(0.0)
                    .setTotalParticipantesUnicos(0);
        }

        List<Reuniao> finalizadas = reuniaoRepository.findByStatus(StatusReuniao.FINALIZADA);

        double mediaParticipantes =
                finalizadas.stream()
                        .mapToInt(r -> r.getParticipantes() != null ? r.getParticipantes().size() : 0)
                        .average()
                        .orElse(0.0);

        int participantesUnicos =
                (int) finalizadas.stream()
                        .filter(r -> r.getParticipantes() != null)
                        .flatMap(r -> r.getParticipantes().stream())
                        .map(Pessoa::getId)
                        .distinct()
                        .count();

        return new MetricasReunioesDTO()
                .setDuracaoMediaMinutos(Math.round(mediaDuracao * 100.0) / 100.0)
                .setDuracaoMinimaMinutos(minDuracao)
                .setDuracaoMaximaMinutos(maxDuracao)
                .setMediaParticipantesPorReuniao(Math.round(mediaParticipantes * 100.0) / 100.0)
                .setTotalParticipantesUnicos(participantesUnicos);
    }

    // ====================================
    // REUNIÕES HOJE
    // ====================================
    public List<ReuniaoResumoDTO> obterReunioesHoje() {
        LocalDate hoje = LocalDate.now();
        List<Reuniao> reunioesHoje = reuniaoRepository.findByDataHoraInicioBetween(
                hoje.atStartOfDay(), hoje.atTime(23, 59, 59)
        );
        return reunioesHoje.stream().map(this::toReuniaoResumoDTO).collect(Collectors.toList());
    }

    // ====================================
    // PRÓXIMAS REUNIÕES
    // ====================================
    public List<ReuniaoResumoDTO> obterProximasReunioes() {
        LocalDateTime agora = LocalDateTime.now();
        LocalDateTime limite = agora.plusDays(7);
        List<Reuniao> proximas = reuniaoRepository.findByDataHoraInicioBetween(agora, limite);
        return proximas.stream().map(this::toReuniaoResumoDTO).collect(Collectors.toList());
    }

    // ====================================
    // ALERTAS (CORRIGIDO)
    // ====================================
    public List<AlertaDTO> obterAlertas() {

        List<AlertaDTO> alertas = new ArrayList<>();

        // Reuniões do dia
        List<Reuniao> reunioesHoje = reuniaoRepository.findByDataHoraInicioBetween(
                LocalDate.now().atStartOfDay(),
                LocalDate.now().atTime(23, 59, 59)
        );

        for (Reuniao r : reunioesHoje) {
            alertas.add(new AlertaDTO()
                    .setTipo("reuniao_hoje")
                    .setTitulo("Reunião Hoje")
                    .setMensagem("Reunião: " + r.getPauta())
                    .setPrioridade("media")
                    .setDataCriacao(LocalDateTime.now())
                    .setDadosAdicionais("{\"reuniaoId\": " + r.getId() + "}")
            );
        }

        return alertas;
    }

    // ====================================
    // CONVERSOR CORRIGIDO
    // ====================================
    private ReuniaoResumoDTO toReuniaoResumoDTO(Reuniao r) {
        return new ReuniaoResumoDTO()
                .setId(r.getId())
                .setTitulo(r.getPauta() != null ? r.getPauta() : "Sem pauta")
                .setDataHoraInicio(r.getDataHoraInicio())
                .setDuracaoMinutos(r.getDuracaoMinutos())
                .setStatus(r.getStatus())
                .setSalaNome(r.getSala() != null ? r.getSala().getNome() : null)
                .setOrganizadorNome(r.getOrganizador() != null ? r.getOrganizador().getNome() : null)
                .setTotalParticipantes(
                        r.getParticipantes() != null ? r.getParticipantes().size() : 0
                );
    }
}
