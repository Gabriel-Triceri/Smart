package com.smartmeeting.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;

public class MovimentacaoTarefaDTO {
    @NotNull
    private Long tarefaId;
    private String statusAnterior;
    private String statusNovo;
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
            String statusAnterior,
            String statusNovo,
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
            String statusAnterior,
            String statusNovo,
            @NotBlank String usuarioId,
            @NotBlank String usuarioNome,
            @NotNull LocalDateTime timestamp) {
        this(tarefaId, statusAnterior, statusNovo, null, null, usuarioId, usuarioNome, timestamp, null);
    }

    // Getters e Setters (mantenha os que você já tem)
    public Long getTarefaId() {
        return tarefaId;
    }

    public void setTarefaId(Long tarefaId) {
        this.tarefaId = tarefaId;
    }

    public String getStatusAnterior() {
        return statusAnterior;
    }

    public void setStatusAnterior(String statusAnterior) {
        this.statusAnterior = statusAnterior;
    }

    public String getStatusNovo() {
        return statusNovo;
    }

    public void setStatusNovo(String statusNovo) {
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