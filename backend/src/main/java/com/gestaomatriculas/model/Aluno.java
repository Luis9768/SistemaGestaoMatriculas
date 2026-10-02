package com.gestaomatriculas.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "alunos")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Aluno {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(nullable = false)
    private String nome;

    @NotBlank
    @Column(nullable = false, unique = true, length = 14)
    private String cpf;

    @NotBlank
    @Email
    @Column(nullable = false)
    private String email;

    @Column(length = 20)
    private String telefone;

    @Column(name = "data_nascimento")
    private LocalDate dataNascimento;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "responsavel_id")
    private Responsavel responsavel;

    @Column(name = "endereco")
    private String endereco;

    @Column(name = "bairro")
    private String bairro;

    @Column(name = "cidade")
    private String cidade;

    @Column(name = "genero", length = 50)
    private String genero;

    @Column(name = "neurodiverso")
    @Builder.Default
    private Boolean neurodiverso = false;

    @Column(name = "neurodiverso_detalhe")
    private String neurodiversoDetalhe;

    @Column(name = "pcd")
    @Builder.Default
    private Boolean pcd = false;

    @Column(name = "pcd_detalhe")
    private String pcdDetalhe;

    @Column(name = "contato_emergencia")
    private String contatoEmergencia;

    @Column(name = "consentimento_lgpd")
    @Builder.Default
    private Boolean consentimentoLgpd = true;

    @Column(name = "consentimento_dados_sensiveis")
    @Builder.Default
    private Boolean consentimentoLgpdDadosSensiveis = true;

    @Column(name = "data_consentimento_lgpd")
    private LocalDateTime dataConsentimentoLgpd;

    @Column(name = "consentimento_uso_imagem")
    @Builder.Default
    private Boolean consentimentoUsoImagem = false;

    @Column(name = "termo_papel_entregue")
    @Builder.Default
    private Boolean termoPapelEntregue = true;

    public boolean isMenorDeIdade() {
        if (dataNascimento == null) return false;
        return java.time.Period.between(dataNascimento, java.time.LocalDate.now()).getYears() < 18;
    }

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
