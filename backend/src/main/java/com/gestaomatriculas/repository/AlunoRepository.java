package com.gestaomatriculas.repository;

import com.gestaomatriculas.model.Aluno;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AlunoRepository extends JpaRepository<Aluno, Long> {

    Optional<Aluno> findByCpf(String cpf);

    Optional<Aluno> findByEmail(String email);

    boolean existsByCpf(String cpf);

    /**
     * Consulta paginada com filtro opcional por Escola e busca rápida unificada por nome, e-mail ou CPF.
     * Se escolaId for nulo, a pesquisa é global em todas as 4 escolas.
     */
    @Query("SELECT DISTINCT a FROM Aluno a " +
           "LEFT JOIN Matricula m ON m.aluno = a " +
           "LEFT JOIN m.turma t " +
           "LEFT JOIN t.curso c " +
           "WHERE (:escolaId IS NULL OR c.escola.id = :escolaId) " +
           "AND (:termo IS NULL OR :termo = '' OR " +
           "     LOWER(a.nome) LIKE LOWER(CONCAT('%', :termo, '%')) OR " +
           "     LOWER(a.email) LIKE LOWER(CONCAT('%', :termo, '%')) OR " +
           "     a.cpf LIKE CONCAT('%', :termo, '%'))")
    Page<Aluno> buscarAlunosPaginado(
            @Param("escolaId") Long escolaId,
            @Param("termo") String termo,
            Pageable pageable
    );

    /**
     * Consulta paginada com filtros individuais por nome, e-mail e CPF, com opção de filtro por escola.
     */
    @Query("SELECT DISTINCT a FROM Aluno a " +
           "LEFT JOIN Matricula m ON m.aluno = a " +
           "LEFT JOIN m.turma t " +
           "LEFT JOIN t.curso c " +
           "WHERE (:escolaId IS NULL OR c.escola.id = :escolaId) " +
           "AND (:nome IS NULL OR :nome = '' OR LOWER(a.nome) LIKE LOWER(CONCAT('%', :nome, '%'))) " +
           "AND (:email IS NULL OR :email = '' OR LOWER(a.email) LIKE LOWER(CONCAT('%', :email, '%'))) " +
           "AND (:cpf IS NULL OR :cpf = '' OR a.cpf LIKE CONCAT('%', :cpf, '%'))")
    Page<Aluno> buscarAlunosFiltro(
            @Param("escolaId") Long escolaId,
            @Param("nome") String nome,
            @Param("email") String email,
            @Param("cpf") String cpf,
            Pageable pageable
    );
}
