package com.gestaomatriculas.dto;

import com.gestaomatriculas.model.enums.StatusTurma;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TurmaDTO {
    private Long id;

    @NotNull(message = "O ID do curso é obrigatório")
    private Long cursoId;
    private String cursoNome;

    @NotBlank(message = "O código da turma é obrigatório")
    private String codigo;

    @NotNull(message = "A data de abertura de matrícula é obrigatória")
    private LocalDate dataAberturaMatricula;

    @NotNull(message = "A data de fechamento de matrícula é obrigatória")
    private LocalDate dataFechamentoMatricula;

    @NotNull(message = "A data de início das aulas é obrigatória")
    private LocalDate dataInicioAulas;

    @NotNull(message = "A data de fim das aulas é obrigatória")
    private LocalDate dataFimAulas;

    @NotNull(message = "O total de vagas é obrigatório")
    @Min(value = 1, message = "Deve haver no mínimo 1 vaga")
    private Integer vagasTotais;

    private Long escolaId;
    private String escolaNome;
    private String escolaSigla;

    private Integer idadeMinima;
    private Integer idadeMaxima;
    private Integer diasToleranciaSuplencia;
    private Boolean suplenciaAberta;

    private Integer vagasOcupadas;
    private StatusTurma status;
    private Boolean matriculaAberta;

    private String educadorResponsavel;
    private String diasHorariosLocal;

    private java.util.List<TurmaMateriaDTO> materias;
    private java.util.List<String> materiasNomes;
}

