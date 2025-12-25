package com.smartmeeting.dto;

import com.smartmeeting.enums.StatusReuniao;
import java.time.LocalDateTime;

public class ReuniaoListDTO {
    private Long id;
    private String titulo;
    private LocalDateTime dataHoraInicio;
    private Integer duracaoMinutos;
    private StatusReuniao status;
    private String organizadorNome;
    private String projectName;

    // Constructors
    public ReuniaoListDTO() {
    }

    public ReuniaoListDTO(Long id, String titulo, LocalDateTime dataHoraInicio, Integer duracaoMinutos, StatusReuniao status, String organizadorNome, String projectName) {
        this.id = id;
        this.titulo = titulo;
        this.dataHoraInicio = dataHoraInicio;
        this.duracaoMinutos = duracaoMinutos;
        this.status = status;
        this.organizadorNome = organizadorNome;
        this.projectName = projectName;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitulo() {
        return titulo;
    }

    public void setTitulo(String titulo) {
        this.titulo = titulo;
    }

    public LocalDateTime getDataHoraInicio() {
        return dataHoraInicio;
    }

    public void setDataHoraInicio(LocalDateTime dataHoraInicio) {
        this.dataHoraInicio = dataHoraInicio;
    }

    public Integer getDuracaoMinutos() {
        return duracaoMinutos;
    }

    public void setDuracaoMinutos(Integer duracaoMinutos) {
        this.duracaoMinutos = duracaoMinutos;
    }

    public StatusReuniao getStatus() {
        return status;
    }

    public void setStatus(StatusReuniao status) {
        this.status = status;
    }

    public String getOrganizadorNome() {
        return organizadorNome;
    }

    public void setOrganizadorNome(String organizadorNome) {
        this.organizadorNome = organizadorNome;
    }

    public String getProjectName() {
        return projectName;
    }

    public void setProjectName(String projectName) {
        this.projectName = projectName;
    }
}
