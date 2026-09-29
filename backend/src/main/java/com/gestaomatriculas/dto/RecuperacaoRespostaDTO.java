package com.gestaomatriculas.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RecuperacaoRespostaDTO {
    private String mensagem;
    private String email;
    private String emailMascarado;
}
