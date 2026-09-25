package com.gestaomatriculas.model;

import com.gestaomatriculas.model.enums.StatusPresenca;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "registros_presenca", indexes = {
    @Index(name = "idx_presenca_matricula_data", columnList = "matricula_id, data_aula")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RegistroPresenca {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "matricula_id", nullable = false)
    private Matricula matricula;

    @NotNull
    @Column(name = "data_aula", nullable = false)
    private LocalDate dataAula;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private StatusPresenca status;

    @Column(length = 255)
    private String justificativa;

    @Column(name = "conteudo_ministrado", length = 500)
    private String conteudoMinistrado;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
