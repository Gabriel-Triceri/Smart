package com.smartmeeting.service;

import com.smartmeeting.dto.ReuniaoDTO;
import com.smartmeeting.dto.PessoaDTO;
import com.smartmeeting.dto.SalaDTO;
import com.smartmeeting.enums.StatusReuniao;
import com.smartmeeting.exception.ConflictException;
import com.smartmeeting.exception.ResourceNotFoundException;
import com.smartmeeting.model.Presenca;
import com.smartmeeting.model.Reuniao;
import com.smartmeeting.model.Pessoa;
import com.smartmeeting.model.Sala;
import com.smartmeeting.repository.PresencaRepository;
import com.smartmeeting.repository.ReuniaoRepository;
import com.smartmeeting.repository.PessoaRepository;
import com.smartmeeting.repository.SalaRepository;
import org.springframework.orm.ObjectOptimisticLockingFailureException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class ReuniaoService {

    private final ReuniaoRepository repository;
    private final PresencaRepository presencaRepository;
    private final PessoaRepository pessoaRepository;
    private final SalaRepository salaRepository;

    public ReuniaoService(ReuniaoRepository repository, 
                         PresencaRepository presencaRepository,
                         PessoaRepository pessoaRepository,
                         SalaRepository salaRepository) {
        this.repository = repository;
        this.presencaRepository = presencaRepository;
        this.pessoaRepository = pessoaRepository;
        this.salaRepository = salaRepository;
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
                                .orElseThrow(() -> new ResourceNotFoundException("Organizador não encontrado com ID: " + dto.getOrganizadorId()));
                            reuniaoExistente.setOrganizador(organizador);
                        }
                        if (dto.getSalaId() != null) {
                            Sala sala = salaRepository.findById(dto.getSalaId())
                                .orElseThrow(() -> new ResourceNotFoundException("Sala não encontrada com ID: " + dto.getSalaId()));
                            reuniaoExistente.setSala(sala);
                        }
                        if (dto.getParticipantesIds() != null) {
                            List<Pessoa> participantes = pessoaRepository.findAllById(dto.getParticipantesIds());
                            reuniaoExistente.setParticipantes(participantes);
                        }

                        return toDTO(repository.save(reuniaoExistente));
                    })
                    .orElseThrow(() -> new ResourceNotFoundException("Reunião não encontrada com ID: " + id));
        } catch (ObjectOptimisticLockingFailureException e) {
            throw new ConflictException("Erro de concorrência: os dados foram modificados por outro usuário. Recarregue e tente novamente.");
        }
    }

    public ReuniaoDTO encerrarReuniaoDTO(Long id) {
        return toDTO(encerrarReuniao(id));
    }

    // --- Conversão DTO ↔ Entidade ---
    @Transactional
    public Reuniao toEntity(ReuniaoDTO dto) {
        if (dto == null) return null;

        String ata = dto.getAta();
        if (ata == null || ata.isBlank()) {
            ata = "Sem ata";
        }

        // Removido .setId(dto.getId()) para garantir que novas entidades sejam criadas
        Reuniao reuniao = new Reuniao()
                .setDataHoraInicio(dto.getDataHoraInicio())
                .setDuracaoMinutos(dto.getDuracaoMinutos())
                .setPauta(dto.getPauta())
                .setAta(ata)
                .setStatus(dto.getStatus());

        if (dto.getOrganizadorId() != null) {
            Pessoa organizador = pessoaRepository.findById(dto.getOrganizadorId())
                .orElseThrow(() -> new ResourceNotFoundException("Organizador não encontrado com ID: " + dto.getOrganizadorId()));
            reuniao.setOrganizador(organizador);
        }

        if (dto.getSalaId() != null) {
            Sala sala = salaRepository.findById(dto.getSalaId())
                .orElseThrow(() -> new ResourceNotFoundException("Sala não encontrada com ID: " + dto.getSalaId()));
            reuniao.setSala(sala);
        }

        if (dto.getParticipantesIds() != null && !dto.getParticipantesIds().isEmpty()) {
            List<Pessoa> participantes = pessoaRepository.findAllById(dto.getParticipantesIds());
            reuniao.setParticipantes(participantes);
        }

        return reuniao;
    }

    public ReuniaoDTO toDTO(Reuniao r) {
        if (r == null) return null;

        PessoaDTO organizadorDTO = null;
        if (r.getOrganizador() != null) {
            Pessoa o = r.getOrganizador();
            organizadorDTO = new PessoaDTO(
                    o.getId(),
                    o.getNome(),
                    o.getEmail(),
                    o.getTipoUsuario(),
                    o.getCrachaId()
            );
        }

        SalaDTO salaDTO = null;
        if (r.getSala() != null) {
            Sala s = r.getSala();
            salaDTO = new SalaDTO(
                    s.getId(),
                    s.getNome(),
                    s.getCapacidade(),
                    s.getLocalizacao(),
                    s.getStatus()
            );
        }

        List<PessoaDTO> participantesDTO = null;
        if (r.getParticipantes() != null) {
            participantesDTO = r.getParticipantes().stream()
                    .map((Pessoa p) -> new PessoaDTO(
                            p.getId(),
                            p.getNome(),
                            p.getEmail(),
                            p.getTipoUsuario(),
                            p.getCrachaId()
                    ))
                    .collect(Collectors.toList());
        }

        List<Long> participantesIds = null;
        if (r.getParticipantes() != null) {
            participantesIds = r.getParticipantes().stream()
                    .map(Pessoa::getId)
                    .collect(Collectors.toList());
        }

        Long organizadorId = null;
        if (r.getOrganizador() != null) {
            organizadorId = r.getOrganizador().getId();
        }

        Long salaId = null;
        if (r.getSala() != null) {
            salaId = r.getSala().getId();
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
                participantesDTO,
                null // Adicionado 'null' para o campo 'tarefas'
        );

        dto.setOrganizadorId(organizadorId);
        dto.setSalaId(salaId);
        dto.setParticipantesIds(participantesIds);

        return dto;
    }
}