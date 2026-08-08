package com.smartmeeting.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.Accessors;

/**
 * Configurações do sistema agrupadas por área, no mesmo formato consumido
 * pela tela de configurações do frontend.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Accessors(chain = true)
public class SystemSettingsDTO {

    @Valid
    @NotNull
    private Notificacoes notificacoes;

    @Valid
    @NotNull
    private Reunioes reunioes;

    @Valid
    @NotNull
    private Sistema sistema;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Accessors(chain = true)
    public static class Notificacoes {
        @NotNull
        private Boolean email;

        @NotNull
        private Boolean lembretes;

        @NotNull
        @Min(0)
        private Integer minutosAntecedencia;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Accessors(chain = true)
    public static class Reunioes {
        @NotNull
        @Min(1)
        private Integer duracaoPadraoMinutos;

        @NotNull
        @Min(1)
        private Integer limiteParticipantes;

        @NotNull
        private Boolean permitirConflito;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Accessors(chain = true)
    public static class Sistema {
        @NotBlank
        private String nomeEmpresa;

        @NotBlank
        private String fusoHorario;

        @NotNull
        private Boolean modoManutencao;
    }
}
