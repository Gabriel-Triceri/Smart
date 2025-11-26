package com.smartmeeting.dto;

import com.smartmeeting.enums.StatusReuniao;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.Accessors;
import java.util.stream.Collectors;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Accessors(chain = true)
public class ReuniaoDTO {
    private Long id;
    private String titulo;
    private LocalDateTime dataHoraInicio;
    private Integer duracaoMinutos;
    private String pauta;
    private String ata;
    private StatusReuniao status;
    private List<String> tarefas;

    private Long organizadorId;
    private Long salaId;
    private List<Long> participantes;

    private PessoaDTO organizador;
    private SalaDTO sala;
    private List<PessoaDTO> participantesDetalhes;

    public ReuniaoDTO(Long id,
            String titulo,
            LocalDateTime dataHoraInicio,
            Integer duracaoMinutos,
            String pauta,
            String ata,
            StatusReuniao status,
            PessoaDTO organizador,
            SalaDTO sala,
            List<PessoaDTO> participantesDetalhes,
            List<String> tarefas) {

        this.id = id;
        this.titulo = titulo;
        this.dataHoraInicio = dataHoraInicio;
        this.duracaoMinutos = duracaoMinutos;
        this.pauta = pauta;
        this.ata = ata;
        this.status = status;
        this.organizador = organizador;
        this.sala = sala;
        this.participantesDetalhes = participantesDetalhes;
        this.tarefas = tarefas;

        if (organizador != null) {
            this.organizadorId = organizador.getId();
        }
        if (sala != null) {
            this.salaId = sala.getId();
        }
        if (participantesDetalhes != null) {
            this.participantes = participantesDetalhes.stream()
                    .map(PessoaDTO::getId)
                    .collect(Collectors.toList());
        }
    }

    public LocalDateTime getDataHoraFim() {
        if (dataHoraInicio != null && duracaoMinutos != null) {
            return dataHoraInicio.plusMinutes(duracaoMinutos);
        }
        return null;
    }

    public void setDataHoraFim(LocalDateTime dataHoraFim) {
        // método vazio propositalmente
    }

    public List<String> getTarefas() {
        return tarefas;
    }

    public void setTarefas(List<String> tarefas) {
        this.tarefas = tarefas;
    }
}
