package com.smartmeeting.service;

import com.smartmeeting.dto.ReuniaoStatisticsDTO;
import com.smartmeeting.enums.StatusReuniao;
import com.smartmeeting.exception.ResourceNotFoundException;
import com.smartmeeting.model.Presenca;
import com.smartmeeting.model.Reuniao;
import com.smartmeeting.repository.PresencaRepository;
import com.smartmeeting.repository.ReuniaoRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class ReuniaoService {

    private final ReuniaoRepository repository;
    private final PresencaRepository presencaRepository;

    public ReuniaoService(ReuniaoRepository repository,
            PresencaRepository presencaRepository) {
        this.repository = repository;
        this.presencaRepository = presencaRepository;
    }

    // --- CRUD ---
    public List<Reuniao> listarTodas() {
        return repository.findAll();
    }

    public Optional<Reuniao> buscarPorId(Long id) {
        return repository.findById(id);
    }

    public Reuniao salvar(Reuniao reuniao) {
        return repository.save(reuniao);
    }

    public Reuniao atualizar(Long id, Reuniao reuniaoAtualizada) {
        return repository.findById(id)
                .map(reuniaoExistente -> {
                    reuniaoExistente.setTitulo(reuniaoAtualizada.getTitulo());
                    reuniaoExistente.setDataHoraInicio(reuniaoAtualizada.getDataHoraInicio());
                    reuniaoExistente.setDuracaoMinutos(reuniaoAtualizada.getDuracaoMinutos());
                    reuniaoExistente.setPauta(reuniaoAtualizada.getPauta());
                    reuniaoExistente.setAta(reuniaoAtualizada.getAta());
                    reuniaoExistente.setStatus(reuniaoAtualizada.getStatus());
                    reuniaoExistente.setOrganizador(reuniaoAtualizada.getOrganizador());
                    reuniaoExistente.setSala(reuniaoAtualizada.getSala());
                    reuniaoExistente.setParticipantes(reuniaoAtualizada.getParticipantes());
                    return repository.save(reuniaoExistente);
                })
                .orElseThrow(() -> new ResourceNotFoundException("Reunião não encontrada com ID: " + id));
    }

    public void deletar(Long id) {
        if (!repository.existsById(id)) {
            throw new ResourceNotFoundException("Reunião não encontrada com ID: " + id);
        }
        repository.deleteById(id);
    }

    @Transactional
    public Reuniao encerrarReuniao(Long id) {
        Reuniao reuniao = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Reunião não encontrada com ID: " + id));

        reuniao.setStatus(StatusReuniao.FINALIZADA);

        List<Presenca> presencasValidas = presencaRepository.findByReuniaoAndValidadoPorCrachaTrue(reuniao);

        reuniao.setAta(gerarAta(reuniao, presencasValidas));

        return repository.save(reuniao);
    }

    private String gerarAta(Reuniao reuniao, List<Presenca> presencas) {
        StringBuilder sb = new StringBuilder();
        sb.append("Ata da Reunião ID ").append(reuniao.getId()).append("\n\n");
        sb.append("Data/Hora Início: ").append(reuniao.getDataHoraInicio()).append("\n");
        sb.append("Duração (minutos): ").append(reuniao.getDuracaoMinutos()).append("\n\n");
        sb.append("Pauta:\n").append(reuniao.getPauta()).append("\n\n");
        sb.append("Participantes Presentes (validados por crachá):\n");

        presencas.forEach(p -> sb.append("- ").append(p.getParticipante().getNome()).append("\n"));

        return sb.toString();
    }

    // --- Métodos de Contagem ---
    public long getTotalReunioes() {
        return repository.count();
    }

    public long getTotalReunioesByPessoa(Long pessoaId) {
        return repository.countByOrganizadorIdOrParticipantesId(pessoaId);
    }

    // --- Estatísticas das reuniões ---
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

        // Note: proximasList is now returned as null - the controller will use
        // getProximasReunioes() and convert to DTO
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
