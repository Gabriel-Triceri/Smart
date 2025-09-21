package com.smartmeeting.dto;

import com.smartmeeting.enums.TipoUsuario;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.Accessors;


@Data
@NoArgsConstructor
@AllArgsConstructor
@Accessors(chain = true)
public class RegistroDTO {
    private String nome;
    private String email;
    private String senha;
    private TipoUsuario papel;
    private String crachaId;
}