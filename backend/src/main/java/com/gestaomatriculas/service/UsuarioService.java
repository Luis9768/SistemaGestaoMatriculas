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

        Escola escola = null;
        if (dto.getRole() == Role.ROLE_ENCARREGADA) {
            if (dto.getEscolaId() == null) {
                throw new BusinessException("Para o perfil Encarregada, é obrigatório selecionar a Escola de atuação.");
            }
            escola = escolaRepository.findById(dto.getEscolaId())
                    .orElseThrow(() -> new ResourceNotFoundException("Escola não encontrada com id: " + dto.getEscolaId()));
        }

        Usuario novo = Usuario.builder()
                .nome(dto.getNome().trim())
                .email(emailFormatado)
                .senha(passwordEncoder.encode(dto.getSenha().trim()))
                .role(dto.getRole())
                .escola(escola)
                .ativo(true)
                .build();

        Usuario salvo = usuarioRepository.save(novo);
        log.info("Novo usuário cadastrado pelo administrador: {} ({})", salvo.getEmail(), salvo.getRole());
        return toDTO(salvo);
    }

    @Transactional
    public UsuarioDTO alternarStatus(Long id) {
        Usuario u = usuarioRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado com id: " + id));

        u.setAtivo(!Boolean.TRUE.equals(u.getAtivo()));
        return toDTO(usuarioRepository.save(u));
    }

    public UsuarioDTO toDTO(Usuario u) {
        return UsuarioDTO.builder()
                .id(u.getId())
                .nome(u.getNome())
                .email(u.getEmail())
                .role(u.getRole())
                .escolaId(u.getEscola() != null ? u.getEscola().getId() : null)
                .escolaNome(u.getEscola() != null ? u.getEscola().getNome() : null)
                .escolaSigla(u.getEscola() != null ? u.getEscola().getSigla() : null)
                .ativo(u.getAtivo())
                .build();
    }
}

