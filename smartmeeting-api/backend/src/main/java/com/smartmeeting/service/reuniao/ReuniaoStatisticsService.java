package com.smartmeeting.service.reuniao;

import com.smartmeeting.dto.ReuniaoStatisticsDTO;
import com.smartmeeting.enums.StatusReuniao;
import com.smartmeeting.model.Reuniao;
import com.smartmeeting.repository.ReuniaoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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

    /**
     * Reuniões visíveis para o usuário informado, ou todas quando {@code userId} é nulo
     * (admin).
     *
     * A regra de visibilidade é a mesma de {@code GET /reunioes} — organizador,
     * participante ou membro do projeto com MEETING_VIEW/PROJECT_VIEW — e vem da mesma
     * query, para as duas rotas não divergirem.
     */
    @Transactional(readOnly = true)
    public List<Reuniao> carregarVisiveis(Long userId) {
        return userId == null
                ? repository.findAllComSala()
                : repository.findAllWithDetailsByUserId(userId);
    }

    @Transactional(readOnly = true)
    public List<Reuniao> getProximasReunioes(Long userId) {
        LocalDateTime now = LocalDateTime.now();
        return carregarVisiveis(userId).stream()
                .filter(r -> r.getDataHoraInicio() != null
                        && r.getDataHoraInicio().isAfter(now)
                        && r.getStatus() == StatusReuniao.AGENDADA)
                .sorted(Comparator.comparing(Reuniao::getDataHoraInicio))
                .limit(5)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ReuniaoStatisticsDTO getReuniaoStatistics(Long userId) {
        List<Reuniao> todasReunioes = carregarVisiveis(userId);
        LocalDateTime now = LocalDateTime.now();

        long total = todasReunioes.size();
        long agendadas = todasReunioes.stream().filter(r -> r.getStatus() == StatusReuniao.AGENDADA).count();
        long andamento = todasReunioes.stream().filter(r -> r.getStatus() == StatusReuniao.EM_ANDAMENTO).count();
        long finalizadas = todasReunioes.stream().filter(r -> r.getStatus() == StatusReuniao.FINALIZADA).count();
        long canceladas = todasReunioes.stream().filter(r -> r.getStatus() == StatusReuniao.CANCELADA).count();

        long proximasCount = todasReunioes.stream()
                .filter(r -> r.getDataHoraInicio() != null && r.getDataHoraInicio().isAfter(now) && r.getStatus() == StatusReuniao.AGENDADA)
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
