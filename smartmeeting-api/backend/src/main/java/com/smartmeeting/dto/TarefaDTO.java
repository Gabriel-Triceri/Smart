package com.smartmeeting.dto;

import com.smartmeeting.enums.StatusTarefa;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.Accessors;

import java.time.LocalDate;

/**
 * DTO para transferência de dados de Tarefa
 * Contém informações sobre tarefas, incluindo descrição, prazo, status e
 * responsável
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Accessors(chain = true)
public class TarefaDTO {
    private Long id;
    private String descricao;
    private LocalDate prazo;
    private boolean concluida;
    private StatusTarefa statusTarefa;
    private String prioridade;
    private Long responsavelId;
    private String responsavelNome;
    private Long reuniaoId;
    private String reuniaoTitulo;
    private Long projectId;
    private String projectName;
}
