package com.gestaomatriculas.model;

import com.gestaomatriculas.model.enums.StatusTurma;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "turmas")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Turma {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "curso_id", nullable = false)
    private Curso curso;

    @NotBlank
    @Column(nullable = false, unique = true, length = 50)
    private String codigo;

    @NotNull
    @Column(name = "data_abertura_matricula", nullable = false)
    private LocalDate dataAberturaMatricula;

    @NotNull
    @Column(name = "data_fechamento_matricula", nullable = false)
    private LocalDate dataFechamentoMatricula;

    @Column(name = "data_inicio_suplencia")
    private LocalDate dataInicioSuplencia;

    @Column(name = "data_fim_suplencia")
    private LocalDate dataFimSuplencia;

    @NotNull
    @Column(name = "data_inicio_aulas", nullable = false)
    private LocalDate dataInicioAulas;

    @NotNull
    @Column(name = "data_fim_aulas", nullable = false)
    private LocalDate dataFimAulas;

    @NotNull
    @Column(name = "vagas_totais", nullable = false)
    private Integer vagasTotais;

    @Builder.Default
    @Column(name = "vagas_ocupadas", nullable = false)
    private Integer vagasOcupadas = 0;

    @NotNull
    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private StatusTurma status = StatusTurma.ABERTA;

    @Column(name = "idade_minima")
    private Integer idadeMinima;

    @Column(name = "idade_maxima")
    private Integer idadeMaxima;

    @Column(name = "educador_responsavel")
    private String educadorResponsavel;

    @Column(name = "dias_horarios_local", length = 500)
    private String diasHorariosLocal;

    @Builder.Default
    @OneToMany(mappedBy = "turma", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("ordem ASC, id ASC")
    private java.util.List<TurmaMateria> materias = new java.util.ArrayList<>();

    @Version
    private Long version;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public boolean isPeriodoMatriculaAberto() {
        if (status != StatusTurma.ABERTA) {
            return false;
        }
        LocalDate hoje = LocalDate.now(java.time.ZoneId.of("America/Sao_Paulo"));
        if (dataFimAulas != null && hoje.isAfter(dataFimAulas)) {
            return false;
        }
        if (dataFimSuplencia != null && hoje.isAfter(dataFimSuplencia)) {
            return false;
        }
        if (dataFimSuplencia == null && dataFechamentoMatricula != null && hoje.isAfter(dataFechamentoMatricula)) {
            return false;
        }
        return true;
    }

    public boolean temVagasDisponiveis() {
        return vagasOcupadas < vagasTotais;
    }

    public boolean isIdadePermitida(int idade) {
        if (idadeMinima != null && idade < idadeMinima) return false;
        if (idadeMaxima != null && idade > idadeMaxima) return false;
        return true;
    }
}
