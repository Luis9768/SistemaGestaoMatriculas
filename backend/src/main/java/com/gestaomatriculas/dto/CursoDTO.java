package com.gestaomatriculas.dto;

import com.gestaomatriculas.model.enums.TipoCurso;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CursoDTO {
    private Long id;

    @NotBlank(message = "O nome do curso é obrigatório")
    private String nome;

    private String descricao;

    @NotNull(message = "O tipo do curso é obrigatório (OFICINA ou REGULAR)")
    private TipoCurso tipo;

    @NotNull(message = "A duração em meses é obrigatória")
    @Min(value = 1, message = "A duração deve ser de pelo menos 1 mês")
    private Integer duracaoMeses;

    @NotNull(message = "A carga horária é obrigatória")
    @Min(value = 1, message = "A carga horária deve ser maior que zero")
    private Integer cargaHoraria;

    private Boolean ativo;
}
