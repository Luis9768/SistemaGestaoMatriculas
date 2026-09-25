package com.gestaomatriculas.repository;

import com.gestaomatriculas.model.Escola;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EscolaRepository extends JpaRepository<Escola, Long> {
    Optional<Escola> findBySiglaIgnoreCase(String sigla);
    List<Escola> findByAtivaTrue();
}
