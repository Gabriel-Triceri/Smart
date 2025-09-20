package com.smartmeeting.service;

import com.smartmeeting.dto.ReuniaoDTO;
import com.smartmeeting.dto.PessoaDTO;
import com.smartmeeting.dto.SalaDTO;
import com.smartmeeting.enums.StatusReuniao;
import com.smartmeeting.model.Presenca;
import com.smartmeeting.model.Reuniao;
import com.smartmeeting.model.Pessoa;
import com.smartmeeting.model.Sala;
import com.smartmeeting.repository.PresencaRepository;
import com.smartmeeting.repository.ReuniaoRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class ReuniaoService {

    private final ReuniaoRepository repository;
    private final PresencaRepository presencaRepository;

    public ReuniaoService(ReuniaoRepository repository, PresencaRepository presencaRepository) {
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
                .orElseThrow(() -> new RuntimeException("Reunião não encontrada com ID: " + id));
    }

    public void deletar(Long id) {
        repository.deleteById(id);
    }

    @Transactional
    public Reuniao encerrarReuniao(Long id) {
        Reuniao reuniao = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Reunião não encontrada"));

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

    public ReuniaoDTO salvarDTO(ReuniaoDTO dto) {
        Reuniao reuniao = toEntity(dto);
        return toDTO(repository.save(reuniao));
    }

    public ReuniaoDTO atualizarDTO(Long id, ReuniaoDTO dto) {
        return repository.findById(id)
                .map(reuniaoExistente -> {
                    Reuniao reuniaoAtualizada = toEntity(dto);
                    reuniaoAtualizada.setId(id);
                    return toDTO(repository.save(reuniaoAtualizada));
                })
                .orElseThrow(() -> new RuntimeException("Reunião não encontrada com ID: " + id));
    }

    public ReuniaoDTO encerrarReuniaoDTO(Long id) {
        return toDTO(encerrarReuniao(id));
    }

    // --- Conversão DTO ↔ Entidade ---
    public Reuniao toEntity(ReuniaoDTO dto) {
        if (dto == null) return null;

        // Corrige ata null ou vazia para evitar erro SQL
        String ata = dto.getAta();
        if (ata == null || ata.isBlank()) {
            ata = "Sem ata";
        }

        Reuniao reuniao = new Reuniao()
                .setId(dto.getId())
                .setDataHoraInicio(dto.getDataHoraInicio())
                .setDuracaoMinutos(dto.getDuracaoMinutos())
                .setPauta(dto.getPauta())
                .setAta(ata)
                .setStatus(dto.getStatus());

        if (dto.getOrganizador() != null) {
            PessoaDTO o = dto.getOrganizador();
            reuniao.setOrganizador(new Pessoa()
                    .setId(o.getId())
                    .setNome(o.getNome())
                    .setEmail(o.getEmail())
                    .setCrachaId(o.getCrachaId())
                    .setTipoUsuario(o.getPapel()));
        }

        if (dto.getSala() != null) {
            SalaDTO s = dto.getSala();
            reuniao.setSala(new Sala()
                    .setId(s.getId())
                    .setNome(s.getNome())
                    .setCapacidade(s.getCapacidade())
                    .setLocalizacao(s.getLocalizacao())
                    .setStatus(s.getStatus()));
        }

        if (dto.getParticipantes() != null) {
            List<Pessoa> participantes = dto.getParticipantes().stream()
                    .map((PessoaDTO pdto) -> new Pessoa()
                            .setId(pdto.getId())
                            .setNome(pdto.getNome())
                            .setEmail(pdto.getEmail())
                            .setCrachaId(pdto.getCrachaId())
                            .setTipoUsuario(pdto.getPapel())
                    )
                    .collect(Collectors.toList());
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

        return new ReuniaoDTO(
                r.getId(),
                r.getDataHoraInicio(),
                r.getDuracaoMinutos(),
                r.getPauta(),
                r.getAta(),
                r.getStatus(),
                organizadorDTO,
                salaDTO,
                participantesDTO
        );
    }
}
