package com.smartmeeting.service.reuniao;

import com.smartmeeting.dto.ReuniaoStatisticsDTO;
import com.smartmeeting.enums.StatusReuniao;
import com.smartmeeting.model.Reuniao;
import com.smartmeeting.repository.ReuniaoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Serviço responsável por estatísticas e relatórios de reuniões
 */
@Service
@RequiredArgsConstructor
public class ReuniaoStatisticsService {

    private final ReuniaoRepository repository;

    public long getTotalReunioes() {
        return repository.count();
    }

    public long getTotalReunioesByPessoa(Long pessoaId) {
        return repository.countByOrganizadorIdOrParticipantesId(pessoaId);
    }

    public List<Reuniao> getProximasReunioes() {
        LocalDateTime now = LocalDateTime.now();
        return repository.findAll().stream()
                .filter(r -> r.getDataHoraInicio().isAfter(now) && r.getStatus() == StatusReuniao.AGENDADA)
                .sorted(Comparator.comparing(Reuniao::getDataHoraInicio))
                .limit(5)
                .collect(Collectors.toList());
    }

    public ReuniaoStatisticsDTO getReuniaoStatistics() {
        List<Reuniao> todasReunioes = repository.findAll();
        LocalDateTime now = LocalDateTime.now();

        long total = todasReunioes.size();
        long agendadas = todasReunioes.stream().filter(r -> r.getStatus() == StatusReuniao.AGENDADA).count();
        long andamento = todasReunioes.stream().filter(r -> r.getStatus() == StatusReuniao.EM_ANDAMENTO).count();
        long finalizadas = todasReunioes.stream().filter(r -> r.getStatus() == StatusReuniao.FINALIZADA).count();
        long canceladas = todasReunioes.stream().filter(r -> r.getStatus() == StatusReuniao.CANCELADA).count();

        long proximasCount = todasReunioes.stream()
                .filter(r -> r.getDataHoraInicio().isAfter(now) && r.getStatus() == StatusReuniao.AGENDADA)
                .count();

        String salaMaisUsada = todasReunioes.stream()
                .filter(r -> r.getSala() != null)
                .collect(Collectors.groupingBy(r -> r.getSala().getNome(), Collectors.counting()))
                .entrySet().stream()
                .max(Map.Entry.comparingByValue())
                .map(Map.Entry::getKey)
                .orElse("N/A");

        long salasEmUso = todasReunioes.stream()
                .filter(r -> r.getStatus() == StatusReuniao.EM_ANDAMENTO && r.getSala() != null)
                .map(r -> r.getSala().getId())
                .distinct()
                .count();

        double taxaParticipacao = 0.0;

        return new ReuniaoStatisticsDTO(
                total,
                agendadas,
                andamento,
                finalizadas,
                canceladas,
                proximasCount,
                salaMaisUsada,
                salasEmUso,
                taxaParticipacao,
                null); // Controller will populate this
    }
}
