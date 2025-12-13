package com.smartmeeting.service.tarefa;

import com.smartmeeting.dto.MovimentacaoTarefaDTO;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

/**
 * Serviço para registrar movimentações de tarefa. Atualmente apenas loga,
 * mas centraliza o ponto onde futuramente pode persistir.
 */
@Service
public class TarefaMovimentacaoService {

    private static final Logger logger = LoggerFactory.getLogger(TarefaMovimentacaoService.class);

    public void registrarMovimentacao(MovimentacaoTarefaDTO dto) {
        logger.info(
                "Movimentação de Tarefa Registrada: Tarefa ID={}, De Status={}, Para Status={}, Usuário={}, Timestamp={}",
                dto.getTarefaId(), dto.getStatusAnterior(), dto.getStatusNovo(), dto.getUsuarioNome(),
                dto.getTimestamp());
        // Futuro: persistir em repositório
    }
}
