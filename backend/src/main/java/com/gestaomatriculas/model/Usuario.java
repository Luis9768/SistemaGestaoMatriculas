package com.gestaomatriculas.model;

import com.gestaomatriculas.model.enums.Role;
import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "usuarios")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Usuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(nullable = false, length = 150)
    private String nome;

    @NotBlank
    @Email
    @Column(nullable = false, unique = true, length = 150)
    private String email;

    @NotBlank
    @Column(nullable = false, length = 255)
    private String senha;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private Role role;

    /**
     * Escola principal de lotação (compatibilidade e escopo primário)
     */
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "escola_id")
    private Escola escola;

    /**
     * Conjunto de escolas às quais o usuário tem permissão de acesso e gestão.
     */
    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
        name = "usuarios_escolas",
        joinColumns = @JoinColumn(name = "usuario_id"),
        inverseJoinColumns = @JoinColumn(name = "escola_id")
    )
    @Builder.Default
    private java.util.Set<Escola> escolas = new java.util.HashSet<>();

    @Builder.Default
    @Column(nullable = false)
    private Boolean ativo = true;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public java.util.Set<Escola> getTodasEscolas() {
        java.util.Set<Escola> todas = new java.util.HashSet<>();
        if (escolas != null) {
            todas.addAll(escolas);
        }
        if (escola != null) {
            todas.add(escola);
        }
        return todas;
    }

    public boolean temAcessoAEscola(Long escolaId) {
        if (this.role == Role.ROLE_ADMIN) {
            return true;
        }
        if (escolaId == null) {
            return false;
        }
        if (escola != null && escolaId.equals(escola.getId())) {
            return true;
        }
        if (escolas != null) {
            return escolas.stream().anyMatch(e -> e.getId().equals(escolaId));
        }
        return false;
    }
}
