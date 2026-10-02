package com.gestaomatriculas.dto;

import com.gestaomatriculas.model.enums.ModalidadeCurso;
import com.gestaomatriculas.model.enums.StatusMatricula;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MatriculaItemPerfilDTO {
    private Long matriculaId;
    private Long turmaId;
    private String turmaNome;
    private String turmaCodigo;
    private String cursoNome;
    private ModalidadeCurso modalidade;
    private String escolaNome;
    private String escolaSigla;
    private String escolaCorTema;
    private LocalDateTime dataMatricula;
    private LocalDate dataInicio;
    private LocalDate dataTermino;
    private String horario;
    private String diasSemana;
    private StatusMatricula status;
    private boolean formado;
    private boolean desistenteFaltas;
    private ResumoFrequenciaDTO frequencia;

    // Elegibilidade e Padrão de Emissão de Documentos Oficiais
    private boolean aptoCertificado;
    private String motivoInaptidaoCertificado;
    private boolean aptoDeclaracaoTransporte;
    private LocalDate dataLiberacaoDeclaracaoTransporte;
    private Long diasRestantesDeclaracaoTransporte;
    private String motivoInaptidaoDeclaracaoTransporte;
    private Integer cargaHorariaTotal;
    private String codigoRegistroLivro;

    @Builder.Default
    private List<RegistroPresencaDTO> presencas = new ArrayList<>();
}
