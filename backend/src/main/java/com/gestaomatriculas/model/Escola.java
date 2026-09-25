package com.gestaomatriculas.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "escolas")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Escola {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(nullable = false, length = 150)
    private String nome;

    @NotBlank
    @Column(nullable = false, unique = true, length = 20)
    private String sigla;

    @Column(columnDefinition = "TEXT")
    private String descricao;

    @Column(length = 20)
    private String corTema; // ex: blue, violet, rose, amber para destaque visual no frontend

    @Builder.Default
    @Column(nullable = false)
    private Boolean ativa = true;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
