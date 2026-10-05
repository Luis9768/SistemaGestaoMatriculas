package com.gestaomatriculas.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "turma_materias")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TurmaMateria {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "turma_id", nullable = false)
    @JsonIgnore
    private Turma turma;

    @NotBlank(message = "O nome da matéria é obrigatório")
    @Column(nullable = false, length = 150)
    private String nome;

    @Column(name = "duracao_estimada", length = 100)
    private String duracaoEstimada;

    @Column(name = "professor_responsavel", length = 150)
    private String professorResponsavel;

    @Column(name = "carga_horaria")
    private Integer cargaHoraria;

    @Column(name = "ordem")
    private Integer ordem;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
