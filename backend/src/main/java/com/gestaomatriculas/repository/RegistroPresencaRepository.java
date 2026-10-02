package com.gestaomatriculas.repository;

import com.gestaomatriculas.model.RegistroPresenca;
import com.gestaomatriculas.model.enums.StatusPresenca;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface RegistroPresencaRepository extends JpaRepository<RegistroPresenca, Long> {

    List<RegistroPresenca> findByMatriculaIdOrderByDataAulaAsc(Long matriculaId);

    List<RegistroPresenca> findByMatriculaAlunoIdOrderByDataAulaDesc(Long alunoId);

    long countByMatriculaId(Long matriculaId);

    long countByMatriculaIdAndStatus(Long matriculaId, StatusPresenca status);

    List<RegistroPresenca> findByMatriculaIdAndMateriaIdOrderByDataAulaAsc(Long matriculaId, Long materiaId);

    long countByMatriculaIdAndMateriaId(Long matriculaId, Long materiaId);

    long countByMatriculaIdAndMateriaIdAndStatus(Long matriculaId, Long materiaId, StatusPresenca status);

    List<RegistroPresenca> findByMatriculaIdAndMateriaIdAndStatus(Long matriculaId, Long materiaId, StatusPresenca status);

    List<RegistroPresenca> findByMateriaIdAndDataAula(Long materiaId, LocalDate dataAula);

    List<RegistroPresenca> findByMateriaIdOrderByDataAulaDesc(Long materiaId);

    java.util.Optional<RegistroPresenca> findByMatriculaIdAndMateriaIdAndDataAula(Long matriculaId, Long materiaId, java.time.LocalDate dataAula);

    List<RegistroPresenca> findByMateriaTurmaIdOrderByDataAulaDesc(Long turmaId);

    long countByMateriaId(Long materiaId);
}
