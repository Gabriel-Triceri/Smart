package com.smartmeeting.dto;

import com.smartmeeting.enums.StatusReuniao;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.Accessors;
import java.util.stream.Collectors;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Os campos abaixo eram todos opcionais, apesar de {@code criar} e {@code atualizar}
 * declararem {@code @Valid}: título vazio, data nula ou duração zero chegavam ao banco e
 * viravam 500 por violação de constraint (as colunas são NOT NULL), em vez de 400.
 *
 * {@code status} e {@code ata} não são validados de propósito — são campos de ciclo de
 * vida, preenchidos pelo servidor (ver {@code ReuniaoCrudService} e
 * {@code ReuniaoLifecycleService}).
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Accessors(chain = true)
public class ReuniaoDTO {
    private Long id;

    @NotBlank(message = "O título não pode estar em branco")
    private String titulo;

    @NotNull(message = "A data e hora de início não pode ser nula")
    private LocalDateTime dataHoraInicio;

    @NotNull(message = "A duração não pode ser nula")
    @Min(value = 1, message = "A duração deve ser de pelo menos 1 minuto")
    private Integer duracaoMinutos;

    @NotBlank(message = "A pauta não pode estar em branco")
    private String pauta;

    private String ata;
    private StatusReuniao status;
    private List<String> tarefas;
    private Long projectId;

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
            List<String> tarefas,
            Long projectId) {

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
        this.projectId = projectId;

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
