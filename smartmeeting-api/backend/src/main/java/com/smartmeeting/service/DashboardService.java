package com.smartmeeting.service;

import com.smartmeeting.dto.*;
import com.smartmeeting.enums.SalaStatus;
import com.smartmeeting.enums.StatusReuniao;
import com.smartmeeting.model.Pessoa;
import com.smartmeeting.model.Reuniao;
import com.smartmeeting.model.Sala;
import com.smartmeeting.repository.*;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class DashboardService {

        private static final int DIAS_UTEIS_MES = 22;
        private static final int HORAS_TRABALHO_DIA = 8;
        private static final int MINUTOS_POR_HORA = 60;
        private static final int HISTORICO_DIAS = 7;
        private static final DateTimeFormatter DIA_FORMATTER = DateTimeFormatter.ofPattern("dd/MM");
        private static final DateTimeFormatter HORA_FORMATTER = DateTimeFormatter.ofPattern("HH:mm");

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
                List<ReuniaoResumoDTO> reunioesHoje = obterReunioesHoje();
                List<ReuniaoResumoDTO> proximasReunioes = obterProximasReunioes();
                List<AlertaDTO> alertas = obterAlertas();

                return new DashboardDTO()
                                .setEstatisticas(buildEstatisticas(reunioesHoje.size(), proximasReunioes.size(),
                                                alertas.size()))
                                .setUsoSalas(obterUsoSalas())
                                .setMetricas(obterMetricasReunioes())
                                .setReunioesHoje(reunioesHoje)
                                .setProximasReunioes(proximasReunioes)
                                .setAlertas(alertas);
        }

        // ====================================
        // ESTATÍSTICAS GERAIS
        // ====================================
        public EstatisticasGeraisDTO obterEstatisticasGerais() {
                List<ReuniaoResumoDTO> reunioesHoje = obterReunioesHoje();
                List<ReuniaoResumoDTO> proximasReunioes = obterProximasReunioes();
                List<AlertaDTO> alertas = obterAlertas();
                return buildEstatisticas(reunioesHoje.size(), proximasReunioes.size(), alertas.size());
        }

        private EstatisticasGeraisDTO buildEstatisticas(long reunioesHoje,
                        long proximasReunioes,
                        long alertasPendentes) {
                long totalReunioes = reuniaoRepository.count();
                long totalSalas = salaRepository.count();
                long salasEmUso = salaRepository.countByStatus(SalaStatus.OCUPADA);

                List<Reuniao> finalizadas = reuniaoRepository.findByStatus(StatusReuniao.FINALIZADA);

                double tempoMedio = finalizadas.stream()
                                .mapToInt(Reuniao::getDuracaoMinutos)
                                .average()
                                .orElse(0.0);

                double mediaParticipantes = finalizadas.stream()
                                .mapToInt(r -> r.getParticipantes() != null ? r.getParticipantes().size() : 0)
                                .average()
                                .orElse(0.0);

                long totalConvidados = finalizadas.stream()
                                .mapToLong(r -> r.getParticipantes() != null ? r.getParticipantes().size() : 0)
                                .sum();

                long presencasRegistradas = finalizadas.stream()
                                .mapToLong(presencaRepository::countByReuniao)
                                .sum();

                double taxaPresenca = totalConvidados == 0 ? 0.0 : (presencasRegistradas * 100.0) / totalConvidados;

                return new EstatisticasGeraisDTO()
                                .setTotalReunioes(totalReunioes)
                                .setTaxaPresenca(roundTwoDecimals(taxaPresenca))
                                .setSalasEmUso(salasEmUso)
                                .setTotalSalas(totalSalas)
                                .setReunioesHoje(reunioesHoje)
                                .setProximasReunioes(proximasReunioes)
                                .setAlertasPendentes(alertasPendentes)
                                .setMediaParticipantes(roundTwoDecimals(mediaParticipantes))
                                .setTempoMedioReuniao(roundTwoDecimals(tempoMedio));
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
                long totalReunioesRealizadas = reuniaoRepository.countBySalaIdAndStatus(sala.getId(),
                                StatusReuniao.FINALIZADA);

                Integer totalMinutosUso = reuniaoRepository.sumDuracaoMinutosBySalaIdAndStatus(sala.getId(),
                                StatusReuniao.FINALIZADA);

                if (totalMinutosUso == null) {
                        totalMinutosUso = 0;
                }

                double taxaOcupacao = calcularTaxaOcupacao(totalMinutosUso);

                return new UsoSalaDTO()
                                .setId(String.valueOf(sala.getId()))
                                .setNome(sala.getNome())
                                .setTotalReunioes(totalReunioesRealizadas)
                                .setCapacidade(sala.getCapacidade())
                                .setUtilizacao(roundTwoDecimals(taxaOcupacao))
                                .setStatus(mapearStatusSala(sala.getStatus()));
        }

        private double calcularTaxaOcupacao(int minutosUsados) {
                int minutosDisponiveisMes = DIAS_UTEIS_MES * HORAS_TRABALHO_DIA * MINUTOS_POR_HORA;
                return minutosUsados == 0 ? 0.0 : (minutosUsados * 100.0) / minutosDisponiveisMes;
        }

        private double roundTwoDecimals(double valor) {
                return Math.round(valor * 100.0) / 100.0;
        }

        private String formatarStatus(StatusReuniao status) {
                if (status == null) {
                        return "agendada";
                }
                return switch (status) {
                        case EM_ANDAMENTO -> "em-andamento";
                        case FINALIZADA -> "concluida";
                        case CANCELADA -> "cancelada";
                        default -> "agendada";
                };
        }

        private String mapearStatusSala(SalaStatus status) {
                if (status == null) {
                        return "desconhecido";
                }
                return switch (status) {
                        case LIVRE -> "disponivel";
                        case OCUPADA -> "ocupada";
                        case RESERVADA -> "reservada";
                        case MANUTENCAO -> "manutencao";
                };
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
                double taxa = totalConvidadas == 0 ? 0.0
                                : Math.round((presencasRegistradas * 100.0 / totalConvidadas) * 100.0) / 100.0;

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

                double taxaSucesso = total == 0 ? 0.0 : Math.round((finalizadas * 100.0 / total) * 100.0) / 100.0;

                double mediaPart = reunioes.stream()
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
        public List<MetricasReunioesDTO> obterMetricasReunioes() {
                LocalDate hoje = LocalDate.now();
                LocalDate inicio = hoje.minusDays(HISTORICO_DIAS - 1);

                LocalDateTime inicioPeriodo = inicio.atStartOfDay();
                LocalDateTime fimPeriodo = hoje.atTime(23, 59, 59);

                List<Reuniao> reunioesPeriodo = reuniaoRepository.findByDataHoraInicioBetween(inicioPeriodo,
                                fimPeriodo);

                Map<LocalDate, List<Reuniao>> reunioesPorDia = reunioesPeriodo.stream()
                                .collect(Collectors.groupingBy(r -> r.getDataHoraInicio().toLocalDate()));

                List<MetricasReunioesDTO> metricas = new ArrayList<>();

                for (int i = 0; i < HISTORICO_DIAS; i++) {
                        LocalDate dia = inicio.plusDays(i);
                        List<Reuniao> reunioesDoDia = reunioesPorDia.getOrDefault(dia, List.of());

                        int totalReunioesDia = reunioesDoDia.size();
                        int totalParticipantesDia = reunioesDoDia.stream()
                                        .mapToInt(r -> r.getParticipantes() != null ? r.getParticipantes().size() : 0)
                                        .sum();
                        int totalPresencasDia = reunioesDoDia.stream()
                                        .mapToInt(r -> r.getPresencas() != null ? r.getPresencas().size() : 0)
                                        .sum();

                        metricas.add(new MetricasReunioesDTO()
                                        .setData(dia.format(DIA_FORMATTER))
                                        .setReunioes(totalReunioesDia)
                                        .setParticipantes(totalParticipantesDia)
                                        .setPresencas(totalPresencasDia));
                }

                return metricas;
        }

        // ====================================
        // REUNIÕES HOJE
        // ====================================
        public List<ReuniaoResumoDTO> obterReunioesHoje() {
                LocalDate hoje = LocalDate.now();
                List<Reuniao> reunioesHoje = reuniaoRepository.findByDataHoraInicioBetween(
                                hoje.atStartOfDay(), hoje.atTime(23, 59, 59));
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
                LocalDate hoje = LocalDate.now();
                List<Reuniao> reunioesHoje = reuniaoRepository.findByDataHoraInicioBetween(
                                hoje.atStartOfDay(),
                                hoje.atTime(23, 59, 59));

                return reunioesHoje.stream()
                                .map(reuniao -> new AlertaDTO()
                                                .setId("reuniao-" + reuniao.getId())
                                                .setTipo("warning")
                                                .setMensagem(String.format("Reunião \"%s\" às %s",
                                                                reuniao.getPauta(),
                                                                reuniao.getDataHoraInicio().format(HORA_FORMATTER)))
                                                .setTimestamp(reuniao.getDataHoraInicio().toString())
                                                .setLido(false))
                                .collect(Collectors.toList());
        }

        // ====================================
        // CONVERSOR CORRIGIDO
        // ====================================
        private ReuniaoResumoDTO toReuniaoResumoDTO(Reuniao reuniao) {
                LocalDateTime inicio = reuniao.getDataHoraInicio();
                return new ReuniaoResumoDTO()
                                .setId(reuniao.getId())
                                .setTitulo(reuniao.getPauta() != null ? reuniao.getPauta() : "Sem pauta")
                                .setSala(reuniao.getSala() != null ? reuniao.getSala().getNome() : null)
                                .setHorario(inicio != null ? inicio.format(HORA_FORMATTER) : null)
                                .setDataHora(inicio != null ? inicio.toString() : null)
                                .setParticipantes(reuniao.getParticipantes() != null ? reuniao.getParticipantes().size()
                                                : 0)
                                .setOrganizador(reuniao.getOrganizador() != null ? reuniao.getOrganizador().getNome()
                                                : null)
                                .setStatus(formatarStatus(reuniao.getStatus()));
        }
}
