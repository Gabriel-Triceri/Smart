package com.smartmeeting.dto;

import com.smartmeeting.enums.StatusReuniao;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.Accessors;

import java.time.LocalDateTime;
import java.util.List;

/**
 * DTO para transferência de dados de Reunião
 * Contém informações sobre reuniões, incluindo data/hora, duração, participantes e sala
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Accessors(chain = true)
public class ReuniaoDTO {
    private Long id;
    private LocalDateTime dataHoraInicio;
    private Integer duracaoMinutos; // duração em minutos
    private String pauta;
    private String ata;
    private Long salaId;
    private StatusReuniao status;
    private PessoaDTO organizador;
    private SalaDTO sala;
    private List<PessoaDTO> participantes;
    private List<Long> participantesIds;

    // Construtor manual para evitar erro de build
    public ReuniaoDTO(Long id,
                      LocalDateTime dataHoraInicio,
                      Integer duracaoMinutos,
                      String pauta,
                      String ata,
                      StatusReuniao status,
                      PessoaDTO organizador,
                      SalaDTO sala,
                      List<PessoaDTO> participantes) {
        this.id = id;
        this.dataHoraInicio = dataHoraInicio;
        this.duracaoMinutos = duracaoMinutos;
        this.pauta = pauta;
        this.ata = ata;
        this.status = status;
        this.organizador = organizador;
        this.sala = sala;
        this.participantes = participantes;
    }

    /**
     * Calcula e retorna o horário de término da reunião com base na data/hora de início e duração
     * @return Data e hora de término da reunião ou null se os dados necessários não estiverem disponíveis
     */
    public LocalDateTime getDataHoraFim() {
        if (dataHoraInicio != null && duracaoMinutos != null) {
            return dataHoraInicio.plusMinutes(duracaoMinutos);
        }
        return null;
    }

    /**
     * Método para compatibilidade com o padrão JavaBean
     * @param dataHoraFim Data e hora de término da reunião (não utilizado, calculado dinamicamente)
     */
    public void setDataHoraFim(LocalDateTime dataHoraFim) {
        // Método mantido vazio pois o valor é calculado dinamicamente
    }
}
