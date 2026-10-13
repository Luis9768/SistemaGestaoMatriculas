package com.gestaomatriculas.service;

import com.gestaomatriculas.dto.AuditoriaAcaoDTO;
import com.gestaomatriculas.model.AuditoriaAcao;
import com.gestaomatriculas.model.Escola;
import com.gestaomatriculas.model.Usuario;
import com.gestaomatriculas.model.enums.TipoAcaoAuditoria;
import com.gestaomatriculas.repository.AuditoriaAcaoRepository;
import com.gestaomatriculas.security.SecurityService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuditoriaService {

    private final AuditoriaAcaoRepository auditoriaAcaoRepository;
    private final SecurityService securityService;

    /**
     * Registra uma ação de auditoria utilizando o contexto de segurança atual.
     */
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void registrarAcao(
            TipoAcaoAuditoria tipoAcao,
            String entidade,
            String entidadeId,
            String detalhes,
            Long escolaId,
            String escolaSigla
    ) {
        try {
            Optional<Usuario> usuarioOpt = securityService.getUsuarioAutenticado();
            Long usuarioId = usuarioOpt.map(Usuario::getId).orElse(null);
            String usuarioNome = usuarioOpt.map(Usuario::getNome).orElse("Sistema / Público");
            String usuarioEmail = usuarioOpt.map(Usuario::getEmail).orElse(null);
            String usuarioRole = usuarioOpt.map(u -> u.getRole() != null ? u.getRole().name() : null).orElse(null);

            if (escolaId == null && usuarioOpt.isPresent()) {
                Usuario u = usuarioOpt.get();
                if (!u.getTodasEscolas().isEmpty()) {
                    Escola esc = u.getTodasEscolas().iterator().next();
                    escolaId = esc.getId();
                    escolaSigla = esc.getSigla();
                }
            }

            AuditoriaAcao acao = AuditoriaAcao.builder()
                    .usuarioId(usuarioId)
                    .usuarioNome(usuarioNome)
                    .usuarioEmail(usuarioEmail)
                    .usuarioRole(usuarioRole)
                    .escolaId(escolaId)
                    .escolaSigla(escolaSigla)
                    .tipoAcao(tipoAcao)
                    .entidade(entidade)
                    .entidadeId(entidadeId)
                    .detalhes(detalhes)
                    .criadoEm(LocalDateTime.now())
                    .build();

            auditoriaAcaoRepository.save(acao);
            log.info("[AUDITORIA] Ação {} registrada por {}: {}", tipoAcao, usuarioNome, detalhes);
        } catch (Exception e) {
            log.error("[AUDITORIA] Falha ao registrar log de auditoria: {}", e.getMessage(), e);
        }
    }

    /**
     * Registra ação especificando explicitamente o usuário (ex: login ou ações externas).
     */
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void registrarAcaoComUsuario(
            Usuario usuario,
            TipoAcaoAuditoria tipoAcao,
            String entidade,
            String entidadeId,
            String detalhes,
            Long escolaId,
            String escolaSigla
    ) {
        try {
            Long usuarioId = usuario != null ? usuario.getId() : null;
            String usuarioNome = usuario != null ? usuario.getNome() : "Sistema / Público";
            String usuarioEmail = usuario != null ? usuario.getEmail() : null;
            String usuarioRole = (usuario != null && usuario.getRole() != null) ? usuario.getRole().name() : null;

            AuditoriaAcao acao = AuditoriaAcao.builder()
                    .usuarioId(usuarioId)
                    .usuarioNome(usuarioNome)
                    .usuarioEmail(usuarioEmail)
                    .usuarioRole(usuarioRole)
                    .escolaId(escolaId)
                    .escolaSigla(escolaSigla)
                    .tipoAcao(tipoAcao)
                    .entidade(entidade)
                    .entidadeId(entidadeId)
                    .detalhes(detalhes)
                    .criadoEm(LocalDateTime.now())
                    .build();

            auditoriaAcaoRepository.save(acao);
            log.info("[AUDITORIA] Ação {} registrada para {}: {}", tipoAcao, usuarioNome, detalhes);
        } catch (Exception e) {
            log.error("[AUDITORIA] Falha ao registrar log de auditoria com usuário: {}", e.getMessage(), e);
        }
    }

    @Transactional(readOnly = true)
    public Page<AuditoriaAcaoDTO> listarPaginado(
            TipoAcaoAuditoria tipoAcao,
            Long escolaId,
            Long usuarioId,
            LocalDateTime dataInicio,
            LocalDateTime dataFim,
            String termo,
            Pageable pageable
    ) {
        return auditoriaAcaoRepository.buscarComFiltros(
                tipoAcao,
                escolaId,
                usuarioId,
                dataInicio,
                dataFim,
                termo != null && !termo.trim().isEmpty() ? termo.trim() : null,
                pageable
        ).map(this::toDTO);
    }

    public AuditoriaAcaoDTO toDTO(AuditoriaAcao a) {
        return AuditoriaAcaoDTO.builder()
                .id(a.getId())
                .usuarioId(a.getUsuarioId())
                .usuarioNome(a.getUsuarioNome())
                .usuarioEmail(a.getUsuarioEmail())
                .usuarioRole(a.getUsuarioRole())
                .escolaId(a.getEscolaId())
                .escolaSigla(a.getEscolaSigla())
                .tipoAcao(a.getTipoAcao())
                .tipoAcaoDescricao(a.getTipoAcao() != null ? a.getTipoAcao().getDescricao() : "")
                .entidade(a.getEntidade())
                .entidadeId(a.getEntidadeId())
                .detalhes(a.getDetalhes())
                .ipOrigem(a.getIpOrigem())
                .criadoEm(a.getCriadoEm())
                .build();
    }
}
