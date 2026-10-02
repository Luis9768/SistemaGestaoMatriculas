package com.gestaomatriculas.repository;

import com.gestaomatriculas.model.TurmaMateria;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TurmaMateriaRepository extends JpaRepository<TurmaMateria, Long> {
    List<TurmaMateria> findByTurmaIdOrderByOrdemAscIdAsc(Long turmaId);
    Optional<TurmaMateria> findByIdAndTurmaId(Long id, Long turmaId);
}
