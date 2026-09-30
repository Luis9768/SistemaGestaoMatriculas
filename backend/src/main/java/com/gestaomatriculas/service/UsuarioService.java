package com.gestaomatriculas.service;

import com.gestaomatriculas.dto.CadastrarUsuarioDTO;
import com.gestaomatriculas.dto.TurmaDTO;
import com.gestaomatriculas.dto.UsuarioDTO;
import com.gestaomatriculas.exception.BusinessException;
import com.gestaomatriculas.exception.ResourceNotFoundException;
import com.gestaomatriculas.model.Escola;
import com.gestaomatriculas.model.Turma;
import com.gestaomatriculas.model.Usuario;
import com.gestaomatriculas.model.enums.Role;
import com.gestaomatriculas.repository.EscolaRepository;
import com.gestaomatriculas.repository.TurmaRepository;
import com.gestaomatriculas.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final EscolaRepository escolaRepository;
    private final TurmaRepository turmaRepository;
    private final TurmaService turmaService;
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
        java.util.Set<Turma> turmas = new java.util.HashSet<>();

        if (dto.getRole() == Role.ROLE_ENCARREGADA) {
            if (dto.getEscolaId() == null) {
                throw new BusinessException("Para o perfil Encarregada, é obrigatório selecionar a Escola de atuação.");
            }
            escola = escolaRepository.findById(dto.getEscolaId())
                    .orElseThrow(() -> new ResourceNotFoundException("Escola não encontrada com id: " + dto.getEscolaId()));
        } else if (dto.getRole() == Role.ROLE_PROFESSOR) {
            if (dto.getTurmaIds() != null && !dto.getTurmaIds().isEmpty()) {
                turmas.addAll(turmaRepository.findAllById(dto.getTurmaIds()));
            }
        }

        Usuario novo = Usuario.builder()
                .nome(dto.getNome().trim())
                .email(emailFormatado)
                .senha(passwordEncoder.encode(dto.getSenha().trim()))
                .role(dto.getRole())
                .escola(escola)
                .turmas(turmas)
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

    @Transactional(readOnly = true)
    public List<TurmaDTO> obterTurmasDoProfessorLogado(String email) {
        Usuario professor = usuarioRepository.findByEmail(email.trim().toLowerCase())
                .orElseThrow(() -> new ResourceNotFoundException("Professor não encontrado: " + email));

        if (professor.getRole() != Role.ROLE_PROFESSOR) {
            throw new BusinessException("Apenas usuários com perfil de Professor possuem turmas vinculadas.");
        }

        return professor.getTurmas().stream()
                .map(turmaService::toDTO)
                .toList();
    }

    public UsuarioDTO toDTO(Usuario u) {
        List<Long> turmaIds = new ArrayList<>();
        List<String> turmasNomes = new ArrayList<>();

        if (u.getTurmas() != null) {
            for (Turma t : u.getTurmas()) {
                turmaIds.add(t.getId());
                String sigla = (t.getCurso() != null && t.getCurso().getEscola() != null)
                        ? t.getCurso().getEscola().getSigla()
                        : "GERAL";
                String curso = t.getCurso() != null ? t.getCurso().getNome() : "Sem Curso";
                turmasNomes.add(String.format("[%s] %s (%s)", sigla, curso, t.getCodigo()));
            }
        }

        return UsuarioDTO.builder()
                .id(u.getId())
                .nome(u.getNome())
                .email(u.getEmail())
                .role(u.getRole())
                .escolaId(u.getEscola() != null ? u.getEscola().getId() : null)
                .escolaNome(u.getEscola() != null ? u.getEscola().getNome() : null)
                .escolaSigla(u.getEscola() != null ? u.getEscola().getSigla() : null)
                .ativo(u.getAtivo())
                .turmaIds(turmaIds)
                .turmasNomes(turmasNomes)
                .build();
    }
}
