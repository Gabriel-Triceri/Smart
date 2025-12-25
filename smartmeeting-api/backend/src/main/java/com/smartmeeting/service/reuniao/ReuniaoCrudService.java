package com.smartmeeting.service.reuniao;

import com.smartmeeting.exception.ResourceNotFoundException;
import com.smartmeeting.model.Reuniao;
import com.smartmeeting.repository.ReuniaoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

/**
 * Serviço responsável pelas operações CRUD básicas de Reunião
 */
@Service
@RequiredArgsConstructor
public class ReuniaoCrudService {

    private final ReuniaoRepository repository;

    public List<Reuniao> listarTodas() {
        return repository.findAllWithDetails();
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
