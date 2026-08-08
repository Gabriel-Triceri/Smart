package com.smartmeeting.model;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.Accessors;

/**
 * Configurações globais do sistema.
 *
 * Existe uma única linha, sempre com ID {@link #SINGLETON_ID} — não há
 * configuração por usuário ou por tenant.
 */
@Entity
@Table(name = "SYSTEM_SETTINGS")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Accessors(chain = true)
@EqualsAndHashCode(callSuper = false)
@ToString
public class SystemSettings extends Auditable {

    public static final Long SINGLETON_ID = 1L;

    @Id
    @Column(name = "ID_SYSTEM_SETTINGS")
    private Long id;

    // --- Notificações ---

    @Column(name = "NOTIF_EMAIL", nullable = false)
    private Boolean notifEmail = true;

    @Column(name = "NOTIF_LEMBRETE", nullable = false)
    private Boolean notifLembrete = true;

    @Column(name = "MINUTOS_ANTECEDENCIA", nullable = false)
    private Integer minutosAntecedencia = 30;

    // --- Reuniões ---

    @Column(name = "DURACAO_PADRAO_MINUTOS", nullable = false)
    private Integer duracaoPadraoMinutos = 60;

    @Column(name = "LIMITE_PARTICIPANTES", nullable = false)
    private Integer limiteParticipantes = 20;

    @Column(name = "PERMITIR_CONFLITO", nullable = false)
    private Boolean permitirConflito = false;

    // --- Sistema ---

    @Column(name = "NOME_EMPRESA", nullable = false)
    private String nomeEmpresa = "SmartMeeting";

    @Column(name = "FUSO_HORARIO", nullable = false)
    private String fusoHorario = "America/Sao_Paulo";

    @Column(name = "MODO_MANUTENCAO", nullable = false)
    private Boolean modoManutencao = false;

    public static SystemSettings withDefaults() {
        return new SystemSettings().setId(SINGLETON_ID);
    }
}
