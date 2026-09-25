package com.gestaomatriculas.repository;

import com.gestaomatriculas.model.Disciplina;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DisciplinaRepository extends JpaRepository<Disciplina, Long> {
    List<Disciplina> findByCursoIdOrderByNomeAsc(Long cursoId);
}
