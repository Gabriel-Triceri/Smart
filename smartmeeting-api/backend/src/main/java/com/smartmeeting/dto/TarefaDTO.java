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
    private String titulo; // Alias para descricao
    private String descricao;
    private LocalDate prazo;
    private String prazo_tarefa; // Alias para prazo (compatibilidade frontend)
    private boolean concluida;
    private StatusTarefa statusTarefa;
    private String prioridade;
    private LocalDate dataInicio;
    private Double estimadoHoras;
    private java.util.List<String> tags;
    private String cor;

    // Responsáveis
    private Long responsavelId; // Mantido para compatibilidade
    private String responsavelNome; // Mantido para compatibilidade
    private Long responsavelPrincipalId;
    private java.util.List<AssigneeDTO> responsaveis;

    // Relacionamentos
    private Long reuniaoId;
    private String reuniaoTitulo;
    private Long projectId;
    private String projectName;

    // Novos campos solicitados
    private Integer progresso;
    private java.util.List<ComentarioTarefaDTO> comentarios;
    private java.util.List<AnexoTarefaDTO> anexos;
    private java.util.List<TarefaDTO> subtarefas;
    private java.util.List<String> dependencias;
    private Double horasTrabalhadas;

    // Auditoria
    private String criadaPor;
    private String criadaPorNome;
    private String atualizadaPor;
    private String atualizadaPorNome;
    private java.time.LocalDateTime createdAt;
    private java.time.LocalDateTime updatedAt;
}
