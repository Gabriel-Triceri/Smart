package com.smartmeeting.service;

import com.smartmeeting.dto.*;
import com.smartmeeting.enums.SalaStatus;
import com.smartmeeting.enums.StatusReuniao;
import com.smartmeeting.exception.ResourceNotFoundException;
import com.smartmeeting.model.Pessoa;
import com.smartmeeting.model.Reuniao;
import com.smartmeeting.model.Sala;
import com.smartmeeting.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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

    public DashboardDTO obterDashboardCompleto() {
        return new DashboardDTO()
                .setEstatisticasGerais(obterEstatisticasGerais())
                .setUsoSalas(obterUsoSalas())
                .setTaxasPresenca(obterTaxasPresenca())
                .setProdutividadeOrganizadores(obterProdutividadeOrganizadores())
                .setMetricasReunioes(obterMetricasReunioes());
    }

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

    public List<UsoSalaDTO> obterUsoSalas() {
        List<Sala> salas = salaRepository.findAll();
        
        return salas.stream()
                .map(this::calcularUsoSala)
                .collect(Collectors.toList());
    }

    private UsoSalaDTO calcularUsoSala(Sala sala) {
        long totalReunioesRealizadas = reuniaoRepository.countBySalaIdAndStatus(
                sala.getId(), StatusReuniao.FINALIZADA);
        
        Integer totalMinutosUso = reuniaoRepository.sumDuracaoMinutosBySalaIdAndStatus(
                sala.getId(), StatusReuniao.FINALIZADA);
        
        if (totalMinutosUso == null) {
            totalMinutosUso = 0;
        }
        
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
        double taxa = minutosUsados == 0 ? 0.0 : 
                (minutosUsados * 100.0) / minutosDisponiveisMes;
        return Math.round(taxa * 100.0) / 100.0;
    }

    public List<TaxaPresencaDTO> obterTaxasPresenca() {
        List<Pessoa> pessoas = pessoaRepository.findAll();
        
        return pessoas.stream()
                .map(this::calcularTaxaPresenca)
                .filter(taxa -> taxa.getTotalReunioesConvidadas() > 0)
                .collect(Collectors.toList());
    }

    private TaxaPresencaDTO calcularTaxaPresenca(Pessoa pessoa) {
        List<Reuniao> reunioesConvidadas = reuniaoRepository.findByParticipanteId(pessoa.getId());
        long presencasRegistradas = presencaRepository.countByParticipanteId(pessoa.getId());
        
        long totalConvidadas = reunioesConvidadas.size();
        double taxaPresenca = totalConvidadas == 0 ? 0.0 :
                Math.round((presencasRegistradas * 100.0 / totalConvidadas) * 100.0) / 100.0;

        return new TaxaPresencaDTO()
                .setPessoaId(pessoa.getId())
                .setPessoaNome(pessoa.getNome())
                .setPessoaEmail(pessoa.getEmail())
                .setTotalReunioesConvidadas(totalConvidadas)
                .setTotalPresencasRegistradas(presencasRegistradas)
                .setTaxaPresenca(taxaPresenca);
    }

    public List<ProdutividadeOrganizadorDTO> obterProdutividadeOrganizadores() {
        List<Pessoa> organizadores = pessoaRepository.findAll().stream()
                .filter(p -> !reuniaoRepository.findByOrganizadorId(p.getId()).isEmpty())
                .collect(Collectors.toList());

        return organizadores.stream()
                .map(this::calcularProdutividadeOrganizador)
                .collect(Collectors.toList());
    }

    private ProdutividadeOrganizadorDTO calcularProdutividadeOrganizador(Pessoa organizador) {
        List<Reuniao> reunioes = reuniaoRepository.findByOrganizadorId(organizador.getId());

        long totalReunioesOrganizadas = reunioes.size();
        long reunioesFinalizadas = reunioes.stream()
                .filter(r -> r.getStatus() == StatusReuniao.FINALIZADA)
                .count();
        long reunioesCanceladas = reunioes.stream()
                .filter(r -> r.getStatus() == StatusReuniao.CANCELADA)
                .count();

        int totalMinutos = reunioes.stream()
                .filter(r -> r.getStatus() == StatusReuniao.FINALIZADA)
                .mapToInt(Reuniao::getDuracaoMinutos)
                .sum();

        double taxaSucesso = totalReunioesOrganizadas == 0 ? 0.0 :
                Math.round((reunioesFinalizadas * 100.0 / totalReunioesOrganizadas) * 100.0) / 100.0;

        double mediaParticipantes = reunioes.stream()
                .filter(r -> r.getParticipantes() != null)
                .mapToInt(r -> r.getParticipantes().size())
                .average()
                .orElse(0.0);

        return new ProdutividadeOrganizadorDTO()
                .setOrganizadorId(organizador.getId())
                .setOrganizadorNome(organizador.getNome())
                .setOrganizadorEmail(organizador.getEmail())
                .setTotalReunioesOrganizadas(totalReunioesOrganizadas)
                .setReunioesFinalizadas(reunioesFinalizadas)
                .setReunioesCanceladas(reunioesCanceladas)
                .setTotalMinutosReuniao(totalMinutos)
                .setTaxaSucesso(taxaSucesso)
                .setMediaParticipantesPorReuniao(Math.round(mediaParticipantes * 100.0) / 100.0);
    }

    public MetricasReunioesDTO obterMetricasReunioes() {
        Double duracaoMedia = reuniaoRepository.avgDuracaoMinutosByStatus(StatusReuniao.FINALIZADA);
        Integer duracaoMinima = reuniaoRepository.minDuracaoMinutosByStatus(StatusReuniao.FINALIZADA);
        Integer duracaoMaxima = reuniaoRepository.maxDuracaoMinutosByStatus(StatusReuniao.FINALIZADA);
        
        if (duracaoMedia == null || duracaoMinima == null || duracaoMaxima == null) {
            return new MetricasReunioesDTO()
                    .setDuracaoMediaMinutos(0.0)
                    .setDuracaoMinimaMinutos(0)
                    .setDuracaoMaximaMinutos(0)
                    .setMediaParticipantesPorReuniao(0.0)
                    .setTotalParticipantesUnicos(0);
        }

        List<Reuniao> reunioesFinalizadas = reuniaoRepository.findByStatus(StatusReuniao.FINALIZADA);

        double mediaParticipantes = reunioesFinalizadas.stream()
                .filter(r -> r.getParticipantes() != null)
                .mapToInt(r -> r.getParticipantes().size())
                .average()
                .orElse(0.0);

        int participantesUnicos = (int) reunioesFinalizadas.stream()
                .filter(r -> r.getParticipantes() != null)
                .flatMap(r -> r.getParticipantes().stream())
                .map(Pessoa::getId)
                .distinct()
                .count();

        return new MetricasReunioesDTO()
                .setDuracaoMediaMinutos(Math.round(duracaoMedia * 100.0) / 100.0)
                .setDuracaoMinimaMinutos(duracaoMinima)
                .setDuracaoMaximaMinutos(duracaoMaxima)
                .setMediaParticipantesPorReuniao(Math.round(mediaParticipantes * 100.0) / 100.0)
                .setTotalParticipantesUnicos(participantesUnicos);
    }
}
