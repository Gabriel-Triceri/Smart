package com.smartmeeting.dto;

import com.smartmeeting.enums.StatusReuniao;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.Accessors;
import java.util.stream.Collectors;
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
    private StatusReuniao status;
    private List<String> tarefas; // Adicionado campo para tarefas

    // Campos para IDs (usados na criação/atualização)
    private Long organizadorId;
    private Long salaId;
    private List<Long> participantes; // Renomeado de participantesIds para participantes

    // Campos para objetos completos (usados na resposta)
    private PessoaDTO organizador;
    private SalaDTO sala;
    private List<PessoaDTO> participantesDetalhes; // Renomeado de participantes para participantesDetalhes

    // Construtor completo para respostas
    public ReuniaoDTO(Long id,
                      LocalDateTime dataHoraInicio,
                      Integer duracaoMinutos,
                      String pauta,
                      String ata,
                      StatusReuniao status,
                      PessoaDTO organizador,
                      SalaDTO sala,
                      List<PessoaDTO> participantesDetalhes, // Ajustado para participantesDetalhes
                      List<String> tarefas) { // Adicionado tarefas ao construtor
        this.id = id;
        this.dataHoraInicio = dataHoraInicio;
        this.duracaoMinutos = duracaoMinutos;
        this.pauta = pauta;
        this.ata = ata;
        this.status = status;
        this.organizador = organizador;
        this.sala = sala;
        this.participantesDetalhes = participantesDetalhes; // Ajustado para participantesDetalhes
        this.tarefas = tarefas; // Inicializa tarefas

        // Preenche os IDs automaticamente a partir dos objetos
        if (organizador != null) {
            this.organizadorId = organizador.getId();
        }
        if (sala != null) {
            this.salaId = sala.getId();
        }
        if (participantesDetalhes != null) { // Ajustado para participantesDetalhes
            this.participantes = participantesDetalhes.stream()
                    .map(PessoaDTO::getId)
                    .collect(Collectors.toList());
        }
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

    // Getters e Setters para tarefas (gerados por Lombok @Data, mas explicitamente para clareza)
    public List<String> getTarefas() {
        return tarefas;
    }

    public void setTarefas(List<String> tarefas) {
        this.tarefas = tarefas;
    }
}
