package com.gestaomatriculas.repository;

import com.gestaomatriculas.model.Turma;
import com.gestaomatriculas.model.enums.StatusTurma;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface TurmaRepository extends JpaRepository<Turma, Long> {
    Optional<Turma> findByCodigo(String codigo);
    List<Turma> findByCursoId(Long cursoId);
    List<Turma> findByCursoEscolaId(Long escolaId);

    @Query("SELECT t FROM Turma t WHERE t.status = 'ABERTA' AND :hoje BETWEEN t.dataAberturaMatricula AND t.dataFechamentoMatricula")
    List<Turma> findTurmasComMatriculaAberta(LocalDate hoje);

    @Query("SELECT t FROM Turma t WHERE t.curso.escola.id = :escolaId AND t.status = 'ABERTA' AND :hoje BETWEEN t.dataAberturaMatricula AND t.dataFechamentoMatricula")
    List<Turma> findTurmasComMatriculaAbertaPorEscola(Long escolaId, LocalDate hoje);

    @org.springframework.data.jpa.repository.Lock(jakarta.persistence.LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT t FROM Turma t WHERE t.id = :id")
    Optional<Turma> findByIdWithLock(@org.springframework.data.repository.query.Param("id") Long id);
}

