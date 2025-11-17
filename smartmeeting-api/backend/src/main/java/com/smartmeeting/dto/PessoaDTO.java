package com.smartmeeting.dto;

import com.smartmeeting.enums.TipoUsuario;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.Accessors;

/**
 * DTO para transferência de dados de Pessoa
 * Contém informações básicas de um usuário do sistema
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Accessors(chain = true)
public class PessoaDTO {
    private Long id;
    private String nome;
    private String email;
    private TipoUsuario tipoUsuario;
    private String crachaId;

    public Long getId() {
        return this.id;
    }
}
