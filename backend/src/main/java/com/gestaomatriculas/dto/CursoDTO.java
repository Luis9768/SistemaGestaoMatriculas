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

    @Min(value = 1, message = "A duração deve ser de pelo menos 1 mês")
    private Integer duracaoMeses;

    @Min(value = 1, message = "A carga horária deve ser maior que zero")
    private Integer cargaHoraria;

    private Long escolaId;
    private String escolaNome;
    private String escolaSigla;

    private com.gestaomatriculas.model.enums.ModalidadeCurso modalidade;

    private Boolean ativo;

    @Builder.Default
    private java.util.List<DisciplinaDTO> disciplinas = new java.util.ArrayList<>();
}

