package com.smartmeeting.dto;

import com.smartmeeting.enums.StatusTarefa;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;

public class MovimentacaoTarefaDTO {
    @NotNull
    private Long tarefaId;
    @NotNull
    private StatusTarefa statusAnterior;
    @NotNull
    private StatusTarefa statusNovo;
    private String colunaAnterior;
    private String colunaNova;
    @NotBlank
    private String usuarioId;
    @NotBlank
    private String usuarioNome;
    @NotNull
    private LocalDateTime timestamp;
    private String comentario; // Optional

    // Construtor vazio
    public MovimentacaoTarefaDTO() {
    }

    // Construtor completo
    public MovimentacaoTarefaDTO(@NotNull Long tarefaId,
                                 @NotNull StatusTarefa statusAnterior,
                                 @NotNull StatusTarefa statusNovo,
                                 String colunaAnterior,
                                 String colunaNova,
                                 @NotBlank String usuarioId,
                                 @NotBlank String usuarioNome,
                                 @NotNull LocalDateTime timestamp,
                                 String comentario) {
        this.tarefaId = tarefaId;
        this.statusAnterior = statusAnterior;
        this.statusNovo = statusNovo;
        this.colunaAnterior = colunaAnterior;
        this.colunaNova = colunaNova;
        this.usuarioId = usuarioId;
        this.usuarioNome = usuarioNome;
        this.timestamp = timestamp;
        this.comentario = comentario;
    }

    // Construtor simplificado sem colunas e comentário
    public MovimentacaoTarefaDTO(@NotNull Long tarefaId,
                                 @NotNull StatusTarefa statusAnterior,
                                 @NotNull StatusTarefa statusNovo,
                                 @NotBlank String usuarioId,
                                 @NotBlank String usuarioNome,
                                 @NotNull LocalDateTime timestamp) {
        this(tarefaId, statusAnterior, statusNovo, null, null, usuarioId, usuarioNome, timestamp, null);
    }

    // Construtor simplificado que aceita String para status (para Kanban)
    public MovimentacaoTarefaDTO(@NotNull Long tarefaId,
                                 String statusAnteriorDesc,
                                 String statusNovoDesc,
                                 String usuarioId,
                                 String usuarioNome,
                                 LocalDateTime timestamp) {
        this.tarefaId = tarefaId;
        // Armazenar como strings já que são títulos de colunas do Kanban
        this.statusAnterior = null; // Não aplicável para Kanban
        this.statusNovo = null; // Não aplicável para Kanban
        this.colunaAnterior = statusAnteriorDesc;
        this.colunaNova = statusNovoDesc;
        this.usuarioId = usuarioId != null ? usuarioId : "";
        this.usuarioNome = usuarioNome != null ? usuarioNome : "";
        this.timestamp = timestamp != null ? timestamp : LocalDateTime.now();
    }

    // Getters e Setters (mantenha os que você já tem)
    public Long getTarefaId() {
        return tarefaId;
    }

    public void setTarefaId(Long tarefaId) {
        this.tarefaId = tarefaId;
    }

    public StatusTarefa getStatusAnterior() {
        return statusAnterior;
    }

    public void setStatusAnterior(StatusTarefa statusAnterior) {
        this.statusAnterior = statusAnterior;
    }

    public StatusTarefa getStatusNovo() {
        return statusNovo;
    }

    public void setStatusNovo(StatusTarefa statusNovo) {
        this.statusNovo = statusNovo;
    }

    public String getColunaAnterior() {
        return colunaAnterior;
    }

    public void setColunaAnterior(String colunaAnterior) {
        this.colunaAnterior = colunaAnterior;
    }

    public String getColunaNova() {
        return colunaNova;
    }

    public void setColunaNova(String colunaNova) {
        this.colunaNova = colunaNova;
    }

    public String getUsuarioId() {
        return usuarioId;
    }

    public void setUsuarioId(String usuarioId) {
        this.usuarioId = usuarioId;
    }

    public String getUsuarioNome() {
        return usuarioNome;
    }

    public void setUsuarioNome(String usuarioNome) {
        this.usuarioNome = usuarioNome;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }

    public String getComentario() {
        return comentario;
    }

    public void setComentario(String comentario) {
        this.comentario = comentario;
    }
}