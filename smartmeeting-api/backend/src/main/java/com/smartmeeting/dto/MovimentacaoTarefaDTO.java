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
