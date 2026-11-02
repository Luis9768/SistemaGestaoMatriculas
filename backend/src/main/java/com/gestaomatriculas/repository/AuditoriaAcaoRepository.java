package com.gestaomatriculas.repository;

import com.gestaomatriculas.model.AuditoriaAcao;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

@Repository
public interface AuditoriaAcaoRepository extends JpaRepository<AuditoriaAcao, Long>, JpaSpecificationExecutor<AuditoriaAcao> {
}
