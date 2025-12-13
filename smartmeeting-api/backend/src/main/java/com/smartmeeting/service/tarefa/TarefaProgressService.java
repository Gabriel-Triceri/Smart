package com.smartmeeting.service.tarefa;

import com.smartmeeting.dto.TarefaDTO;
import com.smartmeeting.enums.StatusTarefa;
import com.smartmeeting.exception.ResourceNotFoundException;
import com.smartmeeting.mapper.TarefaMapperService;
import com.smartmeeting.model.Tarefa;
import com.smartmeeting.repository.TarefaRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class TarefaProgressService {

    private static final Logger logger = LoggerFactory.getLogger(TarefaProgressService.class);

    private final TarefaRepository tarefaRepository;
    private final TarefaMapperService tarefaMapper;

    @Transactional
    public TarefaDTO atualizarProgresso(Long tarefaId, Integer progresso) {
        if (progresso == null || progresso < 0 || progresso > 100) {
            throw new IllegalArgumentException("Progresso deve estar entre 0 e 100");
        }
        Tarefa tarefa = tarefaRepository.findById(tarefaId)
                .orElseThrow(() -> new ResourceNotFoundException("Tarefa não encontrada com ID: " + tarefaId));

        logger.info("Atualizando progresso da tarefa ID {} para {}%", tarefaId, progresso);
        tarefa.setProgresso(progresso);

        if (progresso == 100) {
            tarefa.setStatusTarefa(StatusTarefa.DONE);
            tarefa.setConcluida(true);
        } else if (tarefa.isConcluida() && progresso < 100) {
            tarefa.setConcluida(false);
            if (tarefa.getStatusTarefa() == StatusTarefa.DONE) {
                tarefa.setStatusTarefa(StatusTarefa.IN_PROGRESS);
            }
        }

        Tarefa atualizada = tarefaRepository.save(tarefa);
        return tarefaMapper.toDTO(atualizada);
    }
}
