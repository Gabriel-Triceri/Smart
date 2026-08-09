package com.smartmeeting.service.tarefa;

import com.smartmeeting.exception.ResourceNotFoundException;

import com.smartmeeting.model.AnexoTarefa;
import com.smartmeeting.model.Pessoa;
import com.smartmeeting.model.Tarefa;
import com.smartmeeting.repository.AnexoTarefaRepository;
import com.smartmeeting.repository.PessoaRepository;
import com.smartmeeting.repository.TarefaRepository;
import com.smartmeeting.util.SecurityUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;

@Service
public class TarefaAnexoService {

    private static final Logger logger = LoggerFactory.getLogger(TarefaAnexoService.class);

    private final AnexoTarefaRepository anexoRepo;
    private final TarefaRepository tarefaRepo;
    private final PessoaRepository pessoaRepo;

    public TarefaAnexoService(AnexoTarefaRepository anexoRepo, TarefaRepository tarefaRepo,
            PessoaRepository pessoaRepo) {
        this.anexoRepo = anexoRepo;
        this.tarefaRepo = tarefaRepo;
        this.pessoaRepo = pessoaRepo;
    }

    @Transactional
    public Map<String, Object> anexarArquivo(Long tarefaId, MultipartFile arquivo) {
        Tarefa tarefa = tarefaRepo.findById(tarefaId)
                .orElseThrow(() -> new ResourceNotFoundException("Tarefa não encontrada com ID: " + tarefaId));

        if (arquivo == null || arquivo.isEmpty()) {
            throw new IllegalArgumentException("O arquivo não pode ser vazio");
        }

        byte[] conteudo;
        try {
            conteudo = arquivo.getBytes();
        } catch (IOException e) {
            throw new IllegalStateException("Não foi possível ler o arquivo enviado", e);
        }

        AnexoTarefa anexo = new AnexoTarefa()
                .setNomeArquivo(arquivo.getOriginalFilename())
                .setTipoArquivo(arquivo.getContentType())
                .setTamanhoArquivo(arquivo.getSize())
                .setConteudo(conteudo)
                .setDataUpload(LocalDateTime.now())
                .setTarefa(tarefa)
                .setAutor(autorAtual());

        // A URL só pode apontar para o próprio anexo depois que ele tem ID.
        anexo = anexoRepo.save(anexo);
        anexo.setUrl("/tarefas/" + tarefaId + "/anexos/" + anexo.getId());
        anexo = anexoRepo.save(anexo);

        logger.info("Anexo {} ({} bytes) salvo na tarefa {}", anexo.getId(), anexo.getTamanhoArquivo(), tarefaId);

        Map<String, Object> resposta = new LinkedHashMap<>();
        resposta.put("id", anexo.getId());
        resposta.put("tarefaId", tarefaId);
        resposta.put("nomeArquivo", anexo.getNomeArquivo());
        resposta.put("tamanho", anexo.getTamanhoArquivo());
        resposta.put("tipo", anexo.getTipoArquivo());
        resposta.put("urlDownload", anexo.getUrl());
        resposta.put("dataUpload", anexo.getDataUpload());
        return resposta;
    }

    @Transactional(readOnly = true)
    public java.util.List<AnexoTarefa> listarAnexos(Long tarefaId) {
        if (!tarefaRepo.existsById(tarefaId)) {
            throw new ResourceNotFoundException("Tarefa não encontrada com ID: " + tarefaId);
        }
        return anexoRepo.findByTarefaId(tarefaId);
    }

    @Transactional
    public void deletarAnexo(Long anexoId, Pessoa deletedBy) {
        if (!anexoRepo.existsById(anexoId)) {
            throw new ResourceNotFoundException("Anexo não encontrado com ID: " + anexoId);
        }
        anexoRepo.deleteById(anexoId);
        logger.info("Anexo {} deletado por {}", anexoId, deletedBy != null ? deletedBy.getEmail() : "desconhecido");
    }

    @Transactional(readOnly = true)
    public AnexoTarefa buscarAnexo(Long anexoId) {
        return anexoRepo.findById(anexoId)
                .orElseThrow(() -> new ResourceNotFoundException("Anexo não encontrado com ID: " + anexoId));
    }

    @Transactional(readOnly = true)
    public byte[] downloadAnexo(Long anexoId) {
        byte[] conteudo = buscarAnexo(anexoId).getConteudo();
        return conteudo == null ? new byte[0] : conteudo;
    }

    private Pessoa autorAtual() {
        Long userId = SecurityUtils.getCurrentUserId();
        if (userId == null) {
            throw new IllegalStateException("Não foi possível identificar o usuário autenticado");
        }
        return pessoaRepo.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Pessoa não encontrada com ID: " + userId));
    }
}
