package com.gestaomatriculas.repository;

import com.gestaomatriculas.model.Curso;
import com.gestaomatriculas.model.enums.TipoCurso;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CursoRepository extends JpaRepository<Curso, Long> {
    List<Curso> findByAtivoTrue();
    List<Curso> findByTipo(TipoCurso tipo);
}
