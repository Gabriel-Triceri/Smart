package com.smartmeeting.service.tarefa;

import com.smartmeeting.exception.ResourceNotFoundException;

import com.smartmeeting.repository.AnexoTarefaRepository;
import com.smartmeeting.repository.TarefaRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.Map;

@Service
public class TarefaAnexoService {

    private static final Logger logger = LoggerFactory.getLogger(TarefaAnexoService.class);

    private final AnexoTarefaRepository anexoRepo;
    private final TarefaRepository tarefaRepo;

    public TarefaAnexoService(AnexoTarefaRepository anexoRepo, TarefaRepository tarefaRepo) {
        this.anexoRepo = anexoRepo;
        this.tarefaRepo = tarefaRepo;
    }

    @Transactional
    public Map<String, Object> anexarArquivo(Long tarefaId, MultipartFile arquivo) {
        if (!tarefaRepo.existsById(tarefaId)) {
            throw new ResourceNotFoundException("Tarefa não encontrada com ID: " + tarefaId);
        }

        if (arquivo == null || arquivo.isEmpty()) {
            throw new IllegalArgumentException("O arquivo não pode ser vazio");
        }

        // Simulação: em sistema real salvar no storage e persistir entidade
        // AnexoTarefa.
        long timestamp = System.currentTimeMillis();
        Map<String, Object> anexo = Map.of(
                "id", timestamp,
                "tarefaId", tarefaId,
                "nomeArquivo", arquivo.getOriginalFilename(),
                "tamanho", arquivo.getSize(),
                "tipo", arquivo.getContentType(),
                "urlDownload", "/api/arquivos/" + timestamp,
                "dataUpload", LocalDateTime.now(),
                "status", "anexado");

        return anexo;
    }

    public java.util.List<com.smartmeeting.model.AnexoTarefa> listarAnexos(Long tarefaId) {
        return anexoRepo.findByTarefaId(tarefaId);
    }

    public void deletarAnexo(Long anexoId, com.smartmeeting.model.Pessoa deletedBy) {
        anexoRepo.deleteById(anexoId);
        logger.info("Anexo {} deletado por {}", anexoId, deletedBy.getEmail());
    }

    public byte[] downloadAnexo(Long anexoId) {
        // Mock download
        return new byte[0];
    }
}
