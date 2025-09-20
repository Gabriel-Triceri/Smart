package com.smartmeeting.dto;
import com.smartmeeting.enums.TipoUsuario;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.Accessors;

/**
 * DTO para criação de novos usuários
 * Contém informações necessárias para cadastro, incluindo senha
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Accessors(chain = true)
public class PessoaCreateDTO {
    private String nome;
    private String email;
    private TipoUsuario papel; 
    private String crachaId;
    private String senha;
}
