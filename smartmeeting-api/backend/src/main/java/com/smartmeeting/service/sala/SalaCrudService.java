package com.smartmeeting.service.sala;

import com.smartmeeting.dto.SalaDTO;
import com.smartmeeting.exception.ResourceNotFoundException;
import com.smartmeeting.mapper.SalaMapper;
import com.smartmeeting.model.Sala;
import com.smartmeeting.repository.SalaRepository;
import com.smartmeeting.repository.ReuniaoRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

/**
 * CRUD de salas e conversões via mapper.
 */
@Service
public class SalaCrudService {

    private final SalaRepository repository;
    private final ReuniaoRepository reuniaoRepository;
    private final SalaMapper mapper;

    public SalaCrudService(SalaRepository repository,
            ReuniaoRepository reuniaoRepository,
            SalaMapper mapper) {
        this.repository = repository;
        this.reuniaoRepository = reuniaoRepository;
        this.mapper = mapper;
    }

    public SalaDTO toDTO(Sala sala) {
        return mapper.toDTO(sala);
    }

    public Sala toEntity(SalaDTO dto) {
        return mapper.toEntity(dto);
    }

    public List<SalaDTO> listarTodas() {
        return repository.findAll().stream().map(mapper::toDTO).collect(Collectors.toList());
    }

    public SalaDTO buscarPorId(Long id) {
        return repository.findById(id).map(mapper::toDTO)
                .orElseThrow(() -> new ResourceNotFoundException("Sala não encontrada com ID: " + id));
    }

    public SalaDTO criar(SalaDTO dto) {
        Sala sala = mapper.toEntity(dto);
        Sala salvo = repository.save(sala);
        return mapper.toDTO(salvo);
    }

    public SalaDTO atualizar(Long id, SalaDTO dtoAtualizada) {
        Sala sala = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Sala não encontrada com ID: " + id));

        sala.setNome(dtoAtualizada.getNome());
        sala.setCapacidade(dtoAtualizada.getCapacidade());
        sala.setLocalizacao(dtoAtualizada.getLocalizacao());
        sala.setStatus(dtoAtualizada.getStatus());

        if (dtoAtualizada.getEquipamentos() != null)
            sala.setEquipamentos(dtoAtualizada.getEquipamentos());
        if (dtoAtualizada.getCategoria() != null)
            sala.setCategoria(dtoAtualizada.getCategoria());
        if (dtoAtualizada.getAndar() != null)
            sala.setAndar(dtoAtualizada.getAndar());
        if (dtoAtualizada.getImagem() != null)
            sala.setImagem(dtoAtualizada.getImagem());
        if (dtoAtualizada.getObservacoes() != null)
            sala.setObservacoes(dtoAtualizada.getObservacoes());

        Sala atualizado = repository.save(sala);
        return mapper.toDTO(atualizado);
    }

    public void deletar(Long id) {
        if (!repository.existsById(id)) {
            throw new ResourceNotFoundException("Sala não encontrada com ID: " + id);
        }

        // Desassocia reuniões
        List<com.smartmeeting.model.Reuniao> reunioesAssociadas = reuniaoRepository.findAll().stream()
                .filter(r -> r.getSala() != null && r.getSala().getId().equals(id))
                .collect(Collectors.toList());

        for (com.smartmeeting.model.Reuniao reuniao : reunioesAssociadas) {
            reuniao.setSala(null);
            reuniaoRepository.save(reuniao);
        }

        repository.deleteById(id);
    }
}
