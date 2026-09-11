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

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public boolean isPeriodoMatriculaAberto() {
        LocalDate hoje = LocalDate.now();
        return !hoje.isBefore(dataAberturaMatricula) && !hoje.isAfter(dataFechamentoMatricula) && status == StatusTurma.ABERTA;
    }

    public boolean temVagasDisponiveis() {
        return vagasOcupadas < vagasTotais;
    }
}
