package com.gestaomatriculas.repository;

import com.gestaomatriculas.model.AuditoriaAcao;
import com.gestaomatriculas.model.enums.TipoAcaoAuditoria;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;

@Repository
public interface AuditoriaAcaoRepository extends JpaRepository<AuditoriaAcao, Long> {

    @Query("SELECT a FROM AuditoriaAcao a WHERE " +
           "(:tipoAcao IS NULL OR a.tipoAcao = :tipoAcao) AND " +
           "(:escolaId IS NULL OR a.escolaId = :escolaId) AND " +
           "(:usuarioId IS NULL OR a.usuarioId = :usuarioId) AND " +
           "(:dataInicio IS NULL OR a.criadoEm >= :dataInicio) AND " +
           "(:dataFim IS NULL OR a.criadoEm <= :dataFim) AND " +
           "(:termo IS NULL OR LOWER(a.detalhes) LIKE LOWER(CONCAT('%', :termo, '%')) OR " +
           " LOWER(a.usuarioNome) LIKE LOWER(CONCAT('%', :termo, '%')) OR " +
           " LOWER(a.usuarioEmail) LIKE LOWER(CONCAT('%', :termo, '%')) OR " +
           " LOWER(a.entidade) LIKE LOWER(CONCAT('%', :termo, '%')) OR " +
           " LOWER(a.entidadeId) LIKE LOWER(CONCAT('%', :termo, '%')))")
    Page<AuditoriaAcao> buscarComFiltros(
            @Param("tipoAcao") TipoAcaoAuditoria tipoAcao,
            @Param("escolaId") Long escolaId,
            @Param("usuarioId") Long usuarioId,
            @Param("dataInicio") LocalDateTime dataInicio,
            @Param("dataFim") LocalDateTime dataFim,
            @Param("termo") String termo,
            Pageable pageable
    );
}
