package com.smartmeeting.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.Accessors;

/**
 * DTO para autenticação de usuários
 * Contém credenciais de login (email e senha)
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Accessors(chain = true)
public class LoginDTO {
    private String email;
    private String senha;

}
