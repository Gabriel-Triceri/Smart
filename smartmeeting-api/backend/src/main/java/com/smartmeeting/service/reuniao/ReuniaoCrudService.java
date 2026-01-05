package com.smartmeeting.service.reuniao;

import com.smartmeeting.dto.ReuniaoListDTO;
import com.smartmeeting.exception.ResourceNotFoundException;
import com.smartmeeting.model.Reuniao;
import com.smartmeeting.repository.ReuniaoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * Serviço responsável pelas operações CRUD básicas de Reunião
 */
@Service
@RequiredArgsConstructor
public class ReuniaoCrudService {

    private final ReuniaoRepository repository;

    public List<ReuniaoListDTO> listarTodas(Long userId) {
        List<Reuniao> reunioes;
        if (userId != null) {
            reunioes = repository.findAllWithDetailsByUserId(userId);
        } else {
            reunioes = repository.findAllWithDetails();
        }
        return reunioes.stream()
                .map(this::toReuniaoListDTO)
                .collect(Collectors.toList());
    }

    private ReuniaoListDTO toReuniaoListDTO(Reuniao reuniao) {
        String organizadorNome = reuniao.getOrganizador() != null ? reuniao.getOrganizador().getNome() : null;
        String projectName = reuniao.getProject() != null ? reuniao.getProject().getName() : null;
        Long projectId = reuniao.getProject() != null ? reuniao.getProject().getId() : null;
        return new ReuniaoListDTO(
                reuniao.getId(),
                reuniao.getTitulo(),
                reuniao.getDataHoraInicio(),
                reuniao.getDuracaoMinutos(),
                reuniao.getStatus(),
                organizadorNome,
                projectName,
                projectId);
    }

    public Optional<Reuniao> buscarPorId(Long id) {
        return repository.findById(id);
    }

    public Reuniao buscarPorIdObrigatorio(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Reunião não encontrada com ID: " + id));
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
}
