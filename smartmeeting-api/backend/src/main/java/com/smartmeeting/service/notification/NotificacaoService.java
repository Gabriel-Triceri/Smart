package com.smartmeeting.service.notification;

import com.smartmeeting.dto.NotificacaoDTO;
import com.smartmeeting.exception.ResourceNotFoundException;
import com.smartmeeting.model.Notificacao;
import com.smartmeeting.model.Pessoa;
import com.smartmeeting.repository.NotificacaoRepository;
import com.smartmeeting.repository.PessoaRepository;
import org.springframework.stereotype.Service;

import java.util.List;

import java.util.stream.Collectors;

@Service
public class NotificacaoService {

    private final NotificacaoRepository repository;
    private final PessoaRepository pessoaRepository;

    public NotificacaoService(NotificacaoRepository repository, PessoaRepository pessoaRepository) {
        this.repository = repository;
        this.pessoaRepository = pessoaRepository;
    }

    /**
     * Converte uma entidade Notificacao para seu respectivo DTO
     */
    private NotificacaoDTO toDTO(Notificacao notificacao) {
        if (notificacao == null)
            return null;
        NotificacaoDTO dto = new NotificacaoDTO();
        dto.setId(notificacao.getId());
        dto.setMensagem(notificacao.getMensagem());
        dto.setTipo(notificacao.getTipo());
        dto.setDestinatarioId(notificacao.getDestinatario() != null ? notificacao.getDestinatario().getId() : null);
        return dto;
    }

    /**
     * Converte um DTO para a entidade Notificacao, incluindo destinatário
     */
    private Notificacao toEntity(NotificacaoDTO dto) {
        if (dto == null)
            return null;
        Notificacao notificacao = new Notificacao();
        notificacao.setMensagem(dto.getMensagem());
        notificacao.setTipo(dto.getTipo());

        if (dto.getDestinatarioId() != null) {
            Pessoa destinatario = pessoaRepository.findById(dto.getDestinatarioId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Destinatário não encontrado com ID: " + dto.getDestinatarioId()));
            notificacao.setDestinatario(destinatario);
        }

        return notificacao;
    }

    public List<NotificacaoDTO> listarTodas() {
        return repository.findAll().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    // Corrigido: Retorna NotificacaoDTO diretamente, lançando exceção se não
    // encontrado
    public NotificacaoDTO buscarPorId(Long id) {
        return repository.findById(id)
                .map(this::toDTO)
                .orElseThrow(() -> new ResourceNotFoundException("Notificação não encontrada com ID: " + id));
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
                    notificacao.setTipo(dtoAtualizada.getTipo());

                    if (dtoAtualizada.getDestinatarioId() != null) {
                        Pessoa destinatario = pessoaRepository.findById(dtoAtualizada.getDestinatarioId())
                                .orElseThrow(() -> new ResourceNotFoundException(
                                        "Destinatário não encontrado com ID: " + dtoAtualizada.getDestinatarioId()));
                        notificacao.setDestinatario(destinatario);
                    }

                    return toDTO(repository.save(notificacao));
                })
                .orElseThrow(() -> new ResourceNotFoundException("Notificação não encontrada com ID: " + id));
    }

    public void deletar(Long id) {
        if (!repository.existsById(id)) {
            throw new ResourceNotFoundException("Notificação não encontrada com ID: " + id);
        }
        repository.deleteById(id);
    }
}
