package com.gestaomatriculas.repository;

import com.gestaomatriculas.model.Responsavel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ResponsavelRepository extends JpaRepository<Responsavel, Long> {
    Optional<Responsavel> findByCpf(String cpf);
    boolean existsByCpf(String cpf);
}
