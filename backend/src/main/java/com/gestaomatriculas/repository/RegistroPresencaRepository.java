package com.gestaomatriculas.repository;

import com.gestaomatriculas.model.RegistroPresenca;
import com.gestaomatriculas.model.enums.StatusPresenca;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RegistroPresencaRepository extends JpaRepository<RegistroPresenca, Long> {

    List<RegistroPresenca> findByMatriculaIdOrderByDataAulaAsc(Long matriculaId);

    List<RegistroPresenca> findByMatriculaAlunoIdOrderByDataAulaDesc(Long alunoId);

    long countByMatriculaId(Long matriculaId);

    long countByMatriculaIdAndStatus(Long matriculaId, StatusPresenca status);
}
