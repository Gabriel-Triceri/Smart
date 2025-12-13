package com.smartmeeting.service.tarefa;

import com.smartmeeting.exception.ResourceNotFoundException;
import com.smartmeeting.model.Pessoa;
import com.smartmeeting.model.Tarefa;
import com.smartmeeting.repository.ComentarioTarefaRepository;
import com.smartmeeting.repository.PessoaRepository;
import com.smartmeeting.repository.TarefaRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Service
public class TarefaComentarioService {

    private static final Logger logger = LoggerFactory.getLogger(TarefaComentarioService.class);

    private final ComentarioTarefaRepository comentarioRepo;
    private final PessoaRepository pessoaRepo;
    private final TarefaRepository tarefaRepo;

    public TarefaComentarioService(ComentarioTarefaRepository comentarioRepo,
            PessoaRepository pessoaRepo,
            TarefaRepository tarefaRepo) {
        this.comentarioRepo = comentarioRepo;
        this.pessoaRepo = pessoaRepo;
        this.tarefaRepo = tarefaRepo;
    }

    public List<com.smartmeeting.model.ComentarioTarefa> listarComentarios(Long tarefaId) {
        return comentarioRepo.findByTarefaId(tarefaId);
    }

    public void deletarComentario(Long comentarioId, Pessoa autor) {
        // Implementação básica de deleção (verificações de permissão omitidas por
        // simplicidade)
        comentarioRepo.deleteById(comentarioId);
        logger.info("Comentário {} deletado por {}", comentarioId, autor.getEmail());
    }

    @Transactional
    public Map<String, Object> adicionarComentario(Long tarefaId, String conteudo, List<String> mencoes) {
        Tarefa tarefa = tarefaRepo.findById(tarefaId)
                .orElseThrow(() -> new ResourceNotFoundException("Tarefa não encontrada com ID: " + tarefaId));

        if (conteudo == null || conteudo.trim().isEmpty()) {
            throw new IllegalArgumentException("O conteúdo do comentário não pode ser vazio");
        }

        logger.info("Adicionando comentário à tarefa ID {}: {}", tarefaId,
                conteudo.substring(0, Math.min(50, conteudo.length())));

        Pessoa autor = pessoaRepo.findAll().stream().findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Nenhum usuário encontrado"));

        com.smartmeeting.model.ComentarioTarefa comentario = new com.smartmeeting.model.ComentarioTarefa();
        comentario.setTexto(conteudo);
        comentario.setTarefa(tarefa);
        comentario.setAutor(autor);
        comentario.setDataCriacao(LocalDateTime.now());

        com.smartmeeting.model.ComentarioTarefa salvo = comentarioRepo.save(comentario);

        return Map.of(
                "id", salvo.getId(),
                "tarefaId", tarefaId,
                "conteudo", salvo.getTexto(),
                "mencoes", mencoes != null ? mencoes : List.of(),
                "autorId", salvo.getAutor().getId(),
                "autorNome", salvo.getAutor().getNome(),
                "dataCriacao", salvo.getDataCriacao(),
                "status", "criado");
    }

    public com.smartmeeting.dto.ComentarioTarefaDTO toDTO(com.smartmeeting.model.ComentarioTarefa c) {
        return new com.smartmeeting.dto.ComentarioTarefaDTO()
                .setId(c.getId())
                .setTarefaId(c.getTarefa().getId())
                .setAutorId(c.getAutor().getId())
                .setAutorNome(c.getAutor().getNome())
                .setConteudo(c.getTexto())
                .setCreatedAt(c.getDataCriacao())
                .setMencoes(List.of())
                .setAnexos(List.of());
    }
}
