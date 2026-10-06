package com.gestaomatriculas.service;

import com.gestaomatriculas.dto.CadastrarUsuarioDTO;
import com.gestaomatriculas.dto.UsuarioDTO;
import com.gestaomatriculas.exception.BusinessException;
import com.gestaomatriculas.exception.ResourceNotFoundException;
import com.gestaomatriculas.model.Escola;
import com.gestaomatriculas.model.Usuario;
import com.gestaomatriculas.model.enums.Role;
import com.gestaomatriculas.repository.EscolaRepository;
import com.gestaomatriculas.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final EscolaRepository escolaRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional(readOnly = true)
    public List<UsuarioDTO> listar(Role role) {
        List<Usuario> usuarios;
        if (role != null) {
            usuarios = usuarioRepository.findByRoleOrderByNomeAsc(role);
        } else {
            usuarios = usuarioRepository.findAll();
        }
        return usuarios.stream().map(this::toDTO).toList();
    }

    @Transactional(readOnly = true)
    public UsuarioDTO buscarPorId(Long id) {
        Usuario u = usuarioRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado com id: " + id));
        return toDTO(u);
    }

    @Transactional
    public UsuarioDTO cadastrar(CadastrarUsuarioDTO dto) {
        String emailFormatado = dto.getEmail().trim().toLowerCase();

        if (usuarioRepository.existsByEmail(emailFormatado)) {
            throw new BusinessException("Já existe um usuário cadastrado com o e-mail: " + dto.getEmail());
        }

        java.util.Set<Escola> escolasEncontradas = new java.util.HashSet<>();
        Escola escolaPrimaria = null;

        if (dto.getRole() == Role.ROLE_ENCARREGADA) {
            java.util.List<Long> ids = new java.util.ArrayList<>();
            if (dto.getEscolasIds() != null && !dto.getEscolasIds().isEmpty()) {
                ids.addAll(dto.getEscolasIds());
            } else if (dto.getEscolaId() != null) {
                ids.add(dto.getEscolaId());
            }

            if (ids.isEmpty()) {
                throw new BusinessException("Para o perfil Encarregada, é obrigatório selecionar ao menos uma Escola de atuação.");
            }

            java.util.List<Escola> lista = escolaRepository.findAllById(ids);
            if (lista.isEmpty()) {
                throw new BusinessException("Nenhuma das escolas selecionadas foi encontrada no sistema.");
            }
            escolasEncontradas.addAll(lista);
            escolaPrimaria = lista.get(0);
        }

        Usuario novo = Usuario.builder()
                .nome(dto.getNome().trim())
                .email(emailFormatado)
                .senha(passwordEncoder.encode(dto.getSenha().trim()))
                .role(dto.getRole())
                .escola(escolaPrimaria)
                .escolas(escolasEncontradas)
                .ativo(true)
                .build();

        Usuario salvo = usuarioRepository.save(novo);
        log.info("Novo usuário cadastrado pelo administrador: {} ({}) com {} escolas vinculadas",
                salvo.getEmail(), salvo.getRole(), salvo.getTodasEscolas().size());
        return toDTO(salvo);
    }

    @Transactional
    public UsuarioDTO atualizar(Long id, com.gestaomatriculas.dto.AtualizarUsuarioDTO dto) {
        Usuario u = usuarioRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado com id: " + id));

        if (!Boolean.TRUE.equals(u.getAtivo()) && !Boolean.TRUE.equals(dto.getAtivo())) {
            throw new BusinessException("Só é permitido alterar dados cadastrais de usuários que estejam ativos no sistema. Reative o acesso do usuário primeiro para poder editar suas informações.");
        }

        String emailFormatado = dto.getEmail().trim().toLowerCase();
        if (!u.getEmail().equalsIgnoreCase(emailFormatado) && usuarioRepository.existsByEmail(emailFormatado)) {
            throw new BusinessException("Já existe outro usuário cadastrado com o e-mail: " + dto.getEmail());
        }

        u.setNome(dto.getNome().trim());
        u.setEmail(emailFormatado);
        u.setRole(dto.getRole());

        if (dto.getAtivo() != null) {
            u.setAtivo(dto.getAtivo());
        }

        if (dto.getSenha() != null && !dto.getSenha().trim().isEmpty()) {
            u.setSenha(passwordEncoder.encode(dto.getSenha().trim()));
            log.info("Senha redefinida para o usuário: {}", u.getEmail());
        }

        if (dto.getRole() == Role.ROLE_ENCARREGADA) {
            if (dto.getEscolasIds() == null || dto.getEscolasIds().isEmpty()) {
                throw new BusinessException("Para o perfil Encarregada, é obrigatório selecionar ao menos uma Escola de atuação.");
            }
            java.util.List<Escola> lista = escolaRepository.findAllById(dto.getEscolasIds());
            if (lista.isEmpty()) {
                throw new BusinessException("Nenhuma das escolas selecionadas foi encontrada.");
            }
            u.getEscolas().clear();
            u.getEscolas().addAll(lista);
            u.setEscola(lista.get(0));
        } else {
            u.getEscolas().clear();
            u.setEscola(null);
        }

        Usuario salvo = usuarioRepository.save(u);
        log.info("Usuário atualizado com sucesso: {} (Role: {}, Ativo: {}, Escolas: {})",
                salvo.getEmail(), salvo.getRole(), salvo.getAtivo(), salvo.getTodasEscolas().size());
        return toDTO(salvo);
    }

    @Transactional
    public UsuarioDTO alternarStatus(Long id) {
        Usuario u = usuarioRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado com id: " + id));

        u.setAtivo(!Boolean.TRUE.equals(u.getAtivo()));
        Usuario salvo = usuarioRepository.save(u);
        log.info("Status de acesso do usuário {} alterado para: {}", salvo.getEmail(), salvo.getAtivo() ? "ATIVO" : "INATIVO");
        return toDTO(salvo);
    }

    public UsuarioDTO toDTO(Usuario u) {
        java.util.Set<Escola> todas = u.getTodasEscolas();
        java.util.List<com.gestaomatriculas.dto.EscolaResumoDTO> escolasDTO = todas.stream()
                .map(e -> com.gestaomatriculas.dto.EscolaResumoDTO.builder()
                        .id(e.getId())
                        .sigla(e.getSigla())
                        .nome(e.getNome())
                        .corTema(e.getCorTema())
                        .build())
                .sorted(java.util.Comparator.comparing(com.gestaomatriculas.dto.EscolaResumoDTO::getId))
                .toList();

        java.util.List<Long> ids = escolasDTO.stream()
                .map(com.gestaomatriculas.dto.EscolaResumoDTO::getId)
                .toList();

        Long primId = u.getEscola() != null ? u.getEscola().getId() : (!ids.isEmpty() ? ids.get(0) : null);
        String primNome = u.getEscola() != null ? u.getEscola().getNome() : (!escolasDTO.isEmpty() ? escolasDTO.get(0).getNome() : null);
        String primSigla = u.getEscola() != null ? u.getEscola().getSigla() : (!escolasDTO.isEmpty() ? escolasDTO.get(0).getSigla() : null);

        return UsuarioDTO.builder()
                .id(u.getId())
                .nome(u.getNome())
                .email(u.getEmail())
                .role(u.getRole())
                .escolaId(primId)
                .escolaNome(primNome)
                .escolaSigla(primSigla)
                .escolasIds(ids)
                .escolas(escolasDTO)
                .ativo(u.getAtivo())
                .build();
    }
}

