package com.gestaomatriculas.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "responsaveis")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Responsavel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(nullable = false, length = 200)
    private String nome;

    @NotBlank
    @Column(nullable = false, length = 14)
    private String cpf;

    @Column(length = 25)
    private String telefone;

    @Column(length = 150)
    private String email;

    @Column(name = "grau_parentesco", length = 50)
    private String grauParentesco; // Mae, Pai, Avo/Avoa, Tutor Legal

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
