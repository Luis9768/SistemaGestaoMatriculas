package com.gestaomatriculas.dto;

import com.gestaomatriculas.model.enums.StatusPresenca;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChamadaItemDTO {
    private Long alunoId;
    private String alunoNome;
    private String alunoCpf;
    
    @NotNull(message = "ID da matrícula é obrigatório")
    private Long matriculaId;
    
    @NotNull(message = "Status da presença é obrigatório")
    private StatusPresenca status;
    
    private String justificativa;
}
