package com.smartmeeting.dto;

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
    private String titulo;
    private String descricao;
    private LocalDate prazo;
    private String prazo_tarefa;
    private boolean concluida;
    private Long columnId;
    private String columnName;
    private String prioridade;
    private LocalDate dataInicio;
    private Double estimadoHoras;
    private java.util.List<String> tags;
    private String cor;

    private Long responsavelId;
    private String responsavelNome;
    private Long responsavelPrincipalId;
    private java.util.List<AssigneeDTO> responsaveis;
    private java.util.List<String> responsaveisIds; // IDs enviados pelo frontend para atualização

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
