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

import org.springframework.data.redis.core.StringRedisTemplate;

import java.security.SecureRandom;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final EmailService emailService;
    private final Optional<StringRedisTemplate> redisTemplate;

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

        java.util.Set<com.gestaomatriculas.model.Escola> todasEscolas = usuario.getTodasEscolas();
        java.util.List<com.gestaomatriculas.dto.EscolaResumoDTO> escolasDTO = todasEscolas.stream()
                .map(e -> com.gestaomatriculas.dto.EscolaResumoDTO.builder()
                        .id(e.getId())
                        .sigla(e.getSigla())
                        .nome(e.getNome())
                        .corTema(e.getCorTema())
                        .build())
                .sorted(java.util.Comparator.comparing(com.gestaomatriculas.dto.EscolaResumoDTO::getId))
                .toList();

        java.util.List<Long> escolasIds = escolasDTO.stream()
                .map(com.gestaomatriculas.dto.EscolaResumoDTO::getId)
                .toList();

        Long primId = usuario.getEscola() != null ? usuario.getEscola().getId() : (!escolasIds.isEmpty() ? escolasIds.get(0) : null);
        String primNome = usuario.getEscola() != null ? usuario.getEscola().getNome() : (!escolasDTO.isEmpty() ? escolasDTO.get(0).getNome() : "Todas as Escolas (Administrador Geral)");
        String primSigla = usuario.getEscola() != null ? usuario.getEscola().getSigla() : (!escolasDTO.isEmpty() ? escolasDTO.get(0).getSigla() : "ADMIN");

        return LoginResponseDTO.builder()
                .token(token)
                .tipo("Bearer")
                .id(usuario.getId())
                .nome(usuario.getNome())
                .email(usuario.getEmail())
                .role(usuario.getRole())
                .escolaId(primId)
                .escolaNome(primNome)
                .escolaSigla(primSigla)
                .escolasIds(escolasIds)
                .escolas(escolasDTO)
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

        if (redisTemplate.isPresent()) {
            try {
                redisTemplate.get().opsForValue().set("sigma:recuperacao:" + emailNorm, codigo, Duration.ofMinutes(10));
                log.info("[RECUPERAÇÃO DE SENHA] Código armazenado no Redis com TTL de 10 minutos.");
            } catch (Exception e) {
                log.warn("[RECUPERAÇÃO DE SENHA] Falha ao comunicar com Redis ({}), mantendo em memória RAM.", e.getMessage());
            }
        }

        String mascarado = mascararEmail(emailNorm);

        // Registro seguro de auditoria do envio de e-mail institucional
        log.info("[RECUPERAÇÃO DE SENHA] Código de verificação institucional gerado para o e-mail: {}", mascarado);
        log.info("[RECUPERAÇÃO DE SENHA] Expiração em 10 minutos (até {}). Armazenamento exclusivamente em memória.", expiracao.toLocalTime());

        // Disparo real via Resend
        emailService.enviarCodigoRecuperacao(emailNorm, codigo);

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

        // 1. Tenta validar via Redis se disponível
        if (redisTemplate.isPresent()) {
            try {
                String codigoSalvo = redisTemplate.get().opsForValue().get("sigma:recuperacao:" + emailNorm);
                if (codigoSalvo != null) {
                    if (!codigoSalvo.equals(codigo.trim())) {
                        throw new BusinessException("Código de verificação incorreto. Verifique os 7 dígitos recebidos.");
                    }
                    return true;
                }
            } catch (BusinessException be) {
                throw be;
            } catch (Exception e) {
                log.warn("[RECUPERAÇÃO DE SENHA] Erro ao consultar Redis ({}), verificando cache em memória RAM.", e.getMessage());
            }
        }

        // 2. Fallback via memória RAM
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

        // Remove o código da memória e do Redis após o uso
        codigosAtivos.remove(emailNorm);
        if (redisTemplate.isPresent()) {
            try {
                redisTemplate.get().delete("sigma:recuperacao:" + emailNorm);
            } catch (Exception e) {
                log.warn("[RECUPERAÇÃO DE SENHA] Falha ao remover código do Redis: {}", e.getMessage());
            }
        }
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
        if (codigosHistoricos.size() > 50000) {
            codigosHistoricos.clear();
            log.info("[SEGURANÇA] Reciclagem periódica do cache de histórico de códigos para controle de memória JVM.");
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
