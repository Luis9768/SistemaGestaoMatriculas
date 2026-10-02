package com.gestaomatriculas.dto;

import com.gestaomatriculas.model.enums.StatusPresenca;
import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RegistroPresencaDTO {
    private Long id;
    private Long matriculaId;
    private Long materiaId;
    private LocalDate dataAula;
    private StatusPresenca status;
    private String justificativa;
    private String conteudoMinistrado;
    private String responsavelRegistro;
}
