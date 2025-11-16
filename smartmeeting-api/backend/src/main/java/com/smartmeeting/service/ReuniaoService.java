package com.smartmeeting.service;

import com.smartmeeting.dto.ReuniaoDTO;
import com.smartmeeting.dto.PessoaDTO;
import com.smartmeeting.dto.SalaDTO;
import com.smartmeeting.dto.ReuniaoStatisticsDTO;
import com.smartmeeting.enums.StatusReuniao;
import com.smartmeeting.exception.ConflictException;
import com.smartmeeting.exception.ResourceNotFoundException;
import com.smartmeeting.model.Presenca;
import com.smartmeeting.model.Reuniao;
import com.smartmeeting.model.Pessoa;
import com.smartmeeting.model.Sala;
import com.smartmeeting.model.Tarefa;
import com.smartmeeting.repository.PresencaRepository;
import com.smartmeeting.repository.ReuniaoRepository;
import com.smartmeeting.repository.PessoaRepository;
import com.smartmeeting.repository.SalaRepository;
import org.springframework.context.annotation.Lazy;
import org.springframework.orm.ObjectOptimisticLockingFailureException;
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
    private final PessoaRepository pessoaRepository;
    private final SalaRepository salaRepository;
    private final SalaService salaService;

    public ReuniaoService(ReuniaoRepository repository,
                          PresencaRepository presencaRepository,
                          PessoaRepository pessoaRepository,
                          SalaRepository salaRepository,
                          @Lazy SalaService salaService) {
        this.repository = repository;
        this.presencaRepository = presencaRepository;
        this.pessoaRepository = pessoaRepository;
        this.salaRepository = salaRepository;
        this.salaService = salaService;
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

    // --- Métodos DTO ---
    public List<ReuniaoDTO> listarTodasDTO() {
        return repository.findAll().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public Optional<ReuniaoDTO> buscarPorIdDTO(Long id) {
        return repository.findById(id).map(this::toDTO);
    }

    @Transactional
    public ReuniaoDTO salvarDTO(ReuniaoDTO dto) {
        Reuniao reuniao = toEntity(dto);
        reuniao = repository.save(reuniao);
        return toDTO(reuniao);
    }

    @Transactional
    public ReuniaoDTO atualizarDTO(Long id, ReuniaoDTO dto) {
        try {
            return repository.findById(id)
                    .map(reuniaoExistente -> {
                        if (dto.getDataHoraInicio() != null) {
                            reuniaoExistente.setDataHoraInicio(dto.getDataHoraInicio());
                        }
                        if (dto.getDuracaoMinutos() != null) {
                            reuniaoExistente.setDuracaoMinutos(dto.getDuracaoMinutos());
                        }
                        if (dto.getPauta() != null) {
                            reuniaoExistente.setPauta(dto.getPauta());
                        }
                        if (dto.getAta() != null) {
                            reuniaoExistente.setAta(dto.getAta());
                        }
                        if (dto.getStatus() != null) {
                            reuniaoExistente.setStatus(dto.getStatus());
                        }
                        if (dto.getOrganizadorId() != null) {
                            Pessoa organizador = pessoaRepository.findById(dto.getOrganizadorId())
                                    .orElseThrow(() -> new ResourceNotFoundException("Organizador não encontrado"));
                            reuniaoExistente.setOrganizador(organizador);
                        }
                        if (dto.getSalaId() != null) {
                            Sala sala = salaRepository.findById(dto.getSalaId())
                                    .orElseThrow(() -> new ResourceNotFoundException("Sala não encontrada"));
                            reuniaoExistente.setSala(sala);
                        }

                        if (dto.getParticipantes() != null) {
                            List<Pessoa> participantes = pessoaRepository.findAllById(dto.getParticipantes());
                            reuniaoExistente.setParticipantes(participantes);
                        }

                        return toDTO(repository.save(reuniaoExistente));
                    })
                    .orElseThrow(() -> new ResourceNotFoundException("Reunião não encontrada"));
        } catch (ObjectOptimisticLockingFailureException e) {
            throw new ConflictException("Erro de concorrência");
        }
    }

    public ReuniaoDTO encerrarReuniaoDTO(Long id) {
        return toDTO(encerrarReuniao(id));
    }

    // --- Métodos de Contagem ---
    public long getTotalReunioes() {
        return repository.count();
    }

    public long getTotalReunioesByPessoa(Long pessoaId) {
        return repository.countByOrganizadorIdOrParticipantesId(pessoaId);
    }

    // --- Estatísticas das reuniões ---
    public ReuniaoStatisticsDTO getReuniaoStatistics() {
        List<Reuniao> todasReunioes = repository.findAll();
        LocalDateTime now = LocalDateTime.now();

        long total = todasReunioes.size();
        long agendadas = todasReunioes.stream().filter(r -> r.getStatus() == StatusReuniao.AGENDADA).count();
        long andamento = todasReunioes.stream().filter(r -> r.getStatus() == StatusReuniao.EM_ANDAMENTO).count();
        long finalizadas = todasReunioes.stream().filter(r -> r.getStatus() == StatusReuniao.FINALIZADA).count();
        long canceladas = todasReunioes.stream().filter(r -> r.getStatus() == StatusReuniao.CANCELADA).count();

        List<ReuniaoDTO> proximasList = todasReunioes.stream()
                .filter(r -> r.getDataHoraInicio().isAfter(now) && r.getStatus() == StatusReuniao.AGENDADA)
                .sorted(Comparator.comparing(Reuniao::getDataHoraInicio))
                .limit(5)
                .map(this::toDTO)
                .collect(Collectors.toList());

        long proximasCount = proximasList.size();

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
                proximasList
        );
    }

    // --- DTO → Entity ---
    @Transactional
    public Reuniao toEntity(ReuniaoDTO dto) {
        if (dto == null) return null;

        Reuniao reuniao = new Reuniao()
                .setDataHoraInicio(dto.getDataHoraInicio())
                .setDuracaoMinutos(dto.getDuracaoMinutos())
                .setPauta(dto.getPauta())
                .setAta(dto.getAta())
                .setStatus(dto.getStatus());

        if (dto.getOrganizadorId() != null) {
            reuniao.setOrganizador(
                    pessoaRepository.findById(dto.getOrganizadorId())
                            .orElseThrow(() -> new ResourceNotFoundException("Organizador não encontrado"))
            );
        }

        if (dto.getSalaId() != null) {
            reuniao.setSala(
                    salaRepository.findById(dto.getSalaId())
                            .orElseThrow(() -> new ResourceNotFoundException("Sala não encontrada"))
            );
        }

        if (dto.getParticipantes() != null) {
            reuniao.setParticipantes(
                    pessoaRepository.findAllById(dto.getParticipantes())
            );
        }

        return reuniao;
    }

    // --- Entity → DTO ---
    public ReuniaoDTO toDTO(Reuniao r) {
        if (r == null) return null;

        List<PessoaDTO> participantesDetalhes = r.getParticipantes() != null
                ? r.getParticipantes().stream()
                .map(p -> new PessoaDTO(p.getId(), p.getNome(), p.getEmail(), p.getTipoUsuario(), p.getCrachaId()))
                .collect(Collectors.toList())
                : null;

        List<Long> participantesIds = r.getParticipantes() != null
                ? r.getParticipantes().stream().map(Pessoa::getId).collect(Collectors.toList())
                : null;

        Long organizadorId = r.getOrganizador() != null ? r.getOrganizador().getId() : null;
        Long salaId = r.getSala() != null ? r.getSala().getId() : null;

        PessoaDTO organizadorDTO = r.getOrganizador() != null
                ? new PessoaDTO(r.getOrganizador().getId(), r.getOrganizador().getNome(), r.getOrganizador().getEmail(), r.getOrganizador().getTipoUsuario(), r.getOrganizador().getCrachaId())
                : null;

        SalaDTO salaDTO = r.getSala() != null
                ? salaService.toDTO(r.getSala())
                : null;

        List<String> tarefasStrings = null;
        if (r.getTarefas() != null) {
            tarefasStrings = r.getTarefas().stream()
                    .map(Tarefa::getDescricao)
                    .collect(Collectors.toList());
        }

        ReuniaoDTO dto = new ReuniaoDTO(
                r.getId(),
                r.getDataHoraInicio(),
                r.getDuracaoMinutos(),
                r.getPauta(),
                r.getAta(),
                r.getStatus(),
                organizadorDTO,
                salaDTO,
                participantesDetalhes,
                tarefasStrings
        );

        dto.setOrganizadorId(organizadorId);
        dto.setSalaId(salaId);
        dto.setParticipantes(participantesIds);

        return dto;
    }
}
