package com.gestaomatriculas.repository;

import com.gestaomatriculas.model.Matricula;
import com.gestaomatriculas.model.enums.CanalOrigem;
import com.gestaomatriculas.model.enums.StatusMatricula;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MatriculaRepository extends JpaRepository<Matricula, Long> {
    Optional<Matricula> findByAlunoIdAndTurmaId(Long alunoId, Long turmaId);
    boolean existsByAlunoIdAndTurmaId(Long alunoId, Long turmaId);
    List<Matricula> findByTurmaId(Long turmaId);
    List<Matricula> findByAlunoId(Long alunoId);
    List<Matricula> findByCanalOrigem(CanalOrigem canalOrigem);
    List<Matricula> findByStatus(StatusMatricula status);
    long countByTurmaIdAndStatus(Long turmaId, StatusMatricula status);
}
