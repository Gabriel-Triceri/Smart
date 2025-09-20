package com.smartmeeting.service;

import com.smartmeeting.dto.NotificacaoDTO;
import com.smartmeeting.model.Notificacao;
import com.smartmeeting.repository.NotificacaoRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class NotificacaoService {

    private final NotificacaoRepository repository;

    public NotificacaoService(NotificacaoRepository repository) {
        this.repository = repository;
    }

    /**
     * Converte uma entidade Notificacao para seu respectivo DTO
     * @param notificacao Entidade a ser convertida
     * @return DTO correspondente ou null se a entidade for nula
     */
    private NotificacaoDTO toDTO(Notificacao notificacao) {
        if (notificacao == null) return null;
        NotificacaoDTO dto = new NotificacaoDTO();
        dto.setId(notificacao.getId());
        dto.setMensagem(notificacao.getMensagem());
        dto.setDataEnvio(notificacao.getDataEnvio());
        dto.setTipo(notificacao.getTipo());
        dto.setDestinatarioId(notificacao.getDestinatario() != null ? notificacao.getDestinatario().getId() : null);
        return dto;
    }

    /**
     * Converte um DTO para a entidade Notificacao
     * @param dto DTO contendo os dados da notificação
     * @return Entidade Notificacao correspondente ou null se o DTO for nulo
     */
    private Notificacao toEntity(NotificacaoDTO dto) {
        if (dto == null) return null;
        Notificacao notificacao = new Notificacao();
        notificacao.setMensagem(dto.getMensagem());
        notificacao.setDataEnvio(dto.getDataEnvio());
        notificacao.setTipo(dto.getTipo());
        // Aqui você poderia buscar o destinatário pelo ID se necessário
        return notificacao;
    }

    // --- Métodos de serviço ---
    public List<NotificacaoDTO> listarTodas() {
        return repository.findAll().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public Optional<NotificacaoDTO> buscarPorId(Long id) {
        return repository.findById(id)
                .map(this::toDTO);
    }

    public NotificacaoDTO salvar(NotificacaoDTO dto) {
        Notificacao notificacao = toEntity(dto);
        Notificacao salvo = repository.save(notificacao);
        return toDTO(salvo);
    }

    public NotificacaoDTO atualizar(Long id, NotificacaoDTO dtoAtualizada) {
        return repository.findById(id)
                .map(notificacao -> {
                    notificacao.setMensagem(dtoAtualizada.getMensagem());
                    notificacao.setDataEnvio(dtoAtualizada.getDataEnvio());
                    notificacao.setTipo(dtoAtualizada.getTipo());
                    // Aqui poderia atualizar o destinatário também
                    return toDTO(repository.save(notificacao));
                })
                .orElseThrow(() -> new RuntimeException("Notificação não encontrada"));
    }

    public void deletar(Long id) {
        repository.deleteById(id);
    }
}
