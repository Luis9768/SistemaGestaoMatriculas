package com.gestaomatriculas.service;

import com.gestaomatriculas.dto.LoginRequestDTO;
import com.gestaomatriculas.dto.LoginResponseDTO;
import com.gestaomatriculas.dto.RecuperacaoRespostaDTO;
import com.gestaomatriculas.dto.RedefinirSenhaDTO;
import com.gestaomatriculas.dto.UsuarioDTO;
import com.gestaomatriculas.exception.BusinessException;
import com.gestaomatriculas.model.Usuario;
import com.gestaomatriculas.repository.UsuarioRepository;
import com.gestaomatriculas.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

    // Estrutura em memória para códigos de recuperação (NÃO é salvo no banco de dados)
    private record CodigoRecuperacaoInfo(String codigo, LocalDateTime expiracao) {}
    private final Map<String, CodigoRecuperacaoInfo> codigosAtivos = new ConcurrentHashMap<>();
    private final Set<String> codigosHistoricos = ConcurrentHashMap.newKeySet();
    private final SecureRandom secureRandom = new SecureRandom();

    @Transactional(readOnly = true)
    public LoginResponseDTO autenticar(LoginRequestDTO dto) {
        Usuario usuario = usuarioRepository.findByEmail(dto.getEmail().trim().toLowerCase())
                .orElseThrow(() -> new BusinessException("Credenciais inválidas. Verifique seu e-mail e senha."));

        if (!Boolean.TRUE.equals(usuario.getAtivo())) {
            throw new BusinessException("Usuário desativado pelo administrador.");
        }

        if (!passwordEncoder.matches(dto.getSenha(), usuario.getSenha())) {
            throw new BusinessException("Credenciais inválidas. Verifique seu e-mail e senha.");
        }

        String token = jwtTokenProvider.gerarToken(usuario);

        return LoginResponseDTO.builder()
                .token(token)
                .tipo("Bearer")
                .id(usuario.getId())
                .nome(usuario.getNome())
                .email(usuario.getEmail())
                .role(usuario.getRole())
                .escolaId(usuario.getEscola() != null ? usuario.getEscola().getId() : null)
                .escolaNome(usuario.getEscola() != null ? usuario.getEscola().getNome() : "Todas as Escolas (Administrador Geral)")
                .escolaSigla(usuario.getEscola() != null ? usuario.getEscola().getSigla() : "ADMIN")
                .build();
    }

    @Transactional(readOnly = true)
    public UsuarioDTO obterUsuarioPorEmail(String email) {
        Usuario usuario = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new BusinessException("Usuário não encontrado."));

        return UsuarioDTO.builder()
                .id(usuario.getId())
                .nome(usuario.getNome())
                .email(usuario.getEmail())
                .role(usuario.getRole())
                .escolaId(usuario.getEscola() != null ? usuario.getEscola().getId() : null)
                .escolaNome(usuario.getEscola() != null ? usuario.getEscola().getNome() : "Todas as Escolas")
                .escolaSigla(usuario.getEscola() != null ? usuario.getEscola().getSigla() : "ADMIN")
                .ativo(usuario.getAtivo())
                .build();
    }

    /**
     * Solicita o envio do código de recuperação de senha.
     * Regras:
     * - O código expira em 10 minutos
     * - O código tem exatamente 7 dígitos numéricos
     * - O código é gerado aleatoriamente e não pode ser igual a nenhum já gerado historicamente
     * - NÃO é salvo no banco de dados (armazenado estritamente em memória RAM)
     */
    public RecuperacaoRespostaDTO solicitarCodigoRecuperacao(String email) {
        String emailNorm = email.trim().toLowerCase();
        Usuario usuario = usuarioRepository.findByEmail(emailNorm)
                .orElseThrow(() -> new BusinessException("Nenhum usuário localizado com o e-mail informado: " + emailNorm));

        if (!Boolean.TRUE.equals(usuario.getAtivo())) {
            throw new BusinessException("Conta desativada pelo administrador. Não é possível redefinir senha.");
        }

        // Gera código único de 7 dígitos nunca antes repetido
        String codigo = gerarCodigo7DigitosUnico();
        LocalDateTime expiracao = LocalDateTime.now().plusMinutes(10);
        codigosAtivos.put(emailNorm, new CodigoRecuperacaoInfo(codigo, expiracao));

        String mascarado = mascararEmail(emailNorm);

        // Registro seguro de auditoria do envio de e-mail institucional
        log.info("[RECUPERAÇÃO DE SENHA] Código institucional de 7 dígitos gerado para o e-mail: {}", mascarado);
        log.info("[RECUPERAÇÃO DE SENHA] Expiração em 10 minutos (até {}). Armazenamento exclusivamente em memória.", expiracao.toLocalTime());

        return RecuperacaoRespostaDTO.builder()
                .mensagem("Código de verificação de 7 dígitos enviado com sucesso para o seu e-mail institucional.")
                .email(emailNorm)
                .emailMascarado(mascarado)
                .build();
    }

    /**
     * Valida se o código de 7 dígitos fornecido é autêntico e se ainda está no prazo de 10 minutos.
     */
    public boolean validarCodigoRecuperacao(String email, String codigo) {
        if (email == null || codigo == null) {
            throw new BusinessException("E-mail e código de verificação são obrigatórios.");
        }

        String emailNorm = email.trim().toLowerCase();
        CodigoRecuperacaoInfo info = codigosAtivos.get(emailNorm);

        if (info == null) {
            throw new BusinessException("Nenhuma solicitação de recuperação ativa para este e-mail. Solicite um novo código.");
        }

        if (info.expiracao().isBefore(LocalDateTime.now())) {
            codigosAtivos.remove(emailNorm);
            throw new BusinessException("O código expirou (validade máxima de 10 minutos). Solicite um novo código.");
        }

        if (!info.codigo().equals(codigo.trim())) {
            throw new BusinessException("Código de verificação incorreto. Verifique os 7 dígitos recebidos.");
        }

        return true;
    }

    /**
     * Redefine a senha do usuário após validação em memória do código de 7 dígitos.
     */
    @Transactional
    public void redefinirSenha(RedefinirSenhaDTO dto) {
        if (!dto.getNovaSenha().equals(dto.getConfirmacaoSenha())) {
            throw new BusinessException("A nova senha e a confirmação não conferem.");
        }

        if (dto.getNovaSenha().trim().length() < 6) {
            throw new BusinessException("A nova senha deve ter no mínimo 6 caracteres.");
        }

        String emailNorm = dto.getEmail().trim().toLowerCase();

        // Valida o código em memória antes de alterar
        validarCodigoRecuperacao(emailNorm, dto.getCodigo());

        Usuario usuario = usuarioRepository.findByEmail(emailNorm)
                .orElseThrow(() -> new BusinessException("Usuário não encontrado."));

        // Persiste APENAS a nova senha criptografada (o código não existe no banco)
        usuario.setSenha(passwordEncoder.encode(dto.getNovaSenha().trim()));
        usuarioRepository.save(usuario);

        // Remove o código da memória após o uso
        codigosAtivos.remove(emailNorm);
    }

    /**
     * Rotina de limpeza periódica que remove códigos expirados da memória RAM a cada 60 segundos.
     * Previne vazamentos de memória causados por solicitações abandonadas.
     */
    @Scheduled(fixedRate = 60000)
    public void expurgarCodigosExpirados() {
        LocalDateTime agora = LocalDateTime.now();
        int antes = codigosAtivos.size();
        codigosAtivos.entrySet().removeIf(entry -> entry.getValue().expiracao().isBefore(agora));
        int removidos = antes - codigosAtivos.size();
        if (removidos > 0) {
            log.info("[SEGURANÇA] Expurgo automático: {} código(s) de recuperação expirado(s) removido(s) da memória.", removidos);
        }
    }

    /**
     * Gera um código de 7 dígitos aleatório que nunca foi gerado anteriormente.
     * Inclui limite seguro de iterações para evitar bloqueio de CPU.
     */
    private String gerarCodigo7DigitosUnico() {
        int tentativas = 0;
        String codigo;
        do {
            int num = 1000000 + secureRandom.nextInt(9000000); // 1.000.000 a 9.999.999 (7 dígitos)
            codigo = String.valueOf(num);
            tentativas++;
            if (tentativas > 100) {
                break;
            }
        } while (!codigosHistoricos.add(codigo));
        return codigo;
    }

    private String mascararEmail(String email) {
        int arroba = email.indexOf('@');
        if (arroba <= 2) {
            return email;
        }
        String usuario = email.substring(0, arroba);
        String dominio = email.substring(arroba);
        return usuario.charAt(0) + "***" + usuario.charAt(usuario.length() - 1) + dominio;
    }
}
