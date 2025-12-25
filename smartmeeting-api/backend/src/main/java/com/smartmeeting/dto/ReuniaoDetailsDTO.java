package com.smartmeeting.dto;

import com.smartmeeting.enums.StatusReuniao;
import com.smartmeeting.model.Pessoa;
import com.smartmeeting.model.Sala;

import java.time.LocalDateTime;
import java.util.List;

public class ReuniaoDetailsDTO {
    private Long id;
    private String titulo;
    private LocalDateTime dataHoraInicio;
    private Integer duracaoMinutos;
    private String pauta;
    private String ata;
    private StatusReuniao status;
    private Pessoa organizador;
    private Sala sala;
    private List<Pessoa> participantes;
    private String projectName;

    // Constructors
    public ReuniaoDetailsDTO() {
    }

    public ReuniaoDetailsDTO(Long id, String titulo, LocalDateTime dataHoraInicio, Integer duracaoMinutos, String pauta, String ata, StatusReuniao status, Pessoa organizador, Sala sala, List<Pessoa> participantes, String projectName) {
        this.id = id;
        this.titulo = titulo;
        this.dataHoraInicio = dataHoraInicio;
        this.duracaoMinutos = duracaoMinutos;
        this.pauta = pauta;
        this.ata = ata;
        this.status = status;
        this.organizador = organizador;
        this.sala = sala;
        this.participantes = participantes;
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

    public String getPauta() {
        return pauta;
    }

    public void setPauta(String pauta) {
        this.pauta = pauta;
    }

    public String getAta() {
        return ata;
    }

    public void setAta(String ata) {
        this.ata = ata;
    }

    public StatusReuniao getStatus() {
        return status;
    }

    public void setStatus(StatusReuniao status) {
        this.status = status;
    }

    public Pessoa getOrganizador() {
        return organizador;
    }

    public void setOrganizador(Pessoa organizador) {
        this.organizador = organizador;
    }

    public Sala getSala() {
        return sala;
    }

    public void setSala(Sala sala) {
        this.sala = sala;
    }

    public List<Pessoa> getParticipantes() {
        return participantes;
    }

    public void setParticipantes(List<Pessoa> participantes) {
        this.participantes = participantes;
    }

    public String getProjectName() {
        return projectName;
    }

    public void setProjectName(String projectName) {
        this.projectName = projectName;
    }
}
