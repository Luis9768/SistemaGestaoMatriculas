'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  Palette,
  KeyRound,
  CheckCircle2,
  Clock,
  RotateCw,
} from 'lucide-react';
import { api, LoginResponse } from '@/lib/api';
import { GradientHoverButton } from './GradientHoverButton';

interface LoginCulturalViewProps {
  onLoginSucesso: (user: LoginResponse) => void | Promise<void>;
  onAcessarInscricaoPublica?: () => void;
}

export function LoginCulturalView({ onLoginSucesso }: LoginCulturalViewProps) {
  // Estado de autenticação principal
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  // Estados do Fluxo de Redefinição de Senha
  const [modo, setModo] = useState<'login' | 'recuperacao'>('login');
  const [etapaRecuperacao, setEtapaRecuperacao] = useState<'email' | 'codigo' | 'senha' | 'sucesso'>('email');
  const [emailRecuperacao, setEmailRecuperacao] = useState('');
  const [emailMascarado, setEmailMascarado] = useState('');
  const [codigoRecuperacao, setCodigoRecuperacao] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [mostrarNovaSenha, setMostrarNovaSenha] = useState(false);
  const [mostrarConfirmarSenha, setMostrarConfirmarSenha] = useState(false);
  const [recuperacaoLoading, setRecuperacaoLoading] = useState(false);
  const [recuperacaoErro, setRecuperacaoErro] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !senha.trim()) {
      setErro('Informe seu e-mail e senha.');
      return;
    }

    try {
      setLoading(true);
      setErro(null);
      const user = await api.login(email.trim(), senha);
      await onLoginSucesso(user);
    } catch (err: any) {
      setErro(err.message || 'Credenciais inválidas. Verifique seus dados.');
      setLoading(false);
    }
  };

  // Iniciar fluxo de recuperação de senha
  const handleIniciarRecuperacao = () => {
    setModo('recuperacao');
    setEtapaRecuperacao('email');
    setEmailRecuperacao(email.trim());
    setCodigoRecuperacao('');
    setNovaSenha('');
    setConfirmarSenha('');
    setRecuperacaoErro(null);
  };

  // Voltar para a tela de login
  const handleVoltarLogin = () => {
    setModo('login');
    setEtapaRecuperacao('email');
    setRecuperacaoErro(null);
    setErro(null);
  };

  // Etapa 1: Solicitar código de verificação
  const handleSolicitarCodigo = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!emailRecuperacao.trim()) {
      setRecuperacaoErro('Informe seu e-mail cadastrado no sistema.');
      return;
    }

    try {
      setRecuperacaoLoading(true);
      setRecuperacaoErro(null);
      const resp = await api.solicitarRecuperacaoSenha(emailRecuperacao.trim());
      setEmailMascarado(resp.emailMascarado || resp.email);
      setEtapaRecuperacao('codigo');
    } catch (err: any) {
      setRecuperacaoErro(err.message || 'Não foi possível solicitar a recuperação. Verifique o e-mail informado.');
    } finally {
      setRecuperacaoLoading(false);
    }
  };

  // Etapa 2: Validar o código de 7 dígitos
  const handleValidarCodigo = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = codigoRecuperacao.trim();
    if (cleanCode.length !== 7) {
      setRecuperacaoErro('O código deve ter exatamente 7 dígitos numéricos.');
      return;
    }

    try {
      setRecuperacaoLoading(true);
      setRecuperacaoErro(null);
      await api.validarCodigoRecuperacao(emailRecuperacao.trim(), cleanCode);
      setEtapaRecuperacao('senha');
    } catch (err: any) {
      setRecuperacaoErro(err.message || 'Código de verificação incorreto ou expirado (limite de 10 min).');
    } finally {
      setRecuperacaoLoading(false);
    }
  };

  // Etapa 3: Redefinir a senha informada 2 vezes
  const handleRedefinirSenha = async (e: React.FormEvent) => {
    e.preventDefault();
    if (novaSenha.trim().length < 6) {
      setRecuperacaoErro('A nova senha deve ter no mínimo 6 caracteres.');
      return;
    }
    if (novaSenha !== confirmarSenha) {
      setRecuperacaoErro('As senhas não coincidem. Digite a mesma senha em ambos os campos.');
      return;
    }

    try {
      setRecuperacaoLoading(true);
      setRecuperacaoErro(null);
      await api.redefinirSenha({
        email: emailRecuperacao.trim(),
        codigo: codigoRecuperacao.trim(),
        novaSenha: novaSenha.trim(),
        confirmacaoSenha: confirmarSenha.trim(),
      });
      setEtapaRecuperacao('sucesso');
    } catch (err: any) {
      setRecuperacaoErro(err.message || 'Erro ao redefinir senha. Tente novamente.');
    } finally {
      setRecuperacaoLoading(false);
    }
  };

  // Finalizar sucesso e ir para login com credencial atualizada
  const handleConcluirSucesso = () => {
    setModo('login');
    setEmail(emailRecuperacao);
    setSenha('');
    setEtapaRecuperacao('email');
    setRecuperacaoErro(null);
    setErro(null);
  };

  return (
    <div className="relative min-h-screen md:h-screen md:max-h-screen w-full bg-[#FAF9F7] text-[#18181B] flex flex-col items-center justify-center p-2 sm:p-4 lg:p-6 font-sans antialiased overflow-x-hidden overflow-y-auto md:overflow-hidden selection:bg-[#18181B] selection:text-white">
      {/* Brasão Oficial no Topo para Desktop / Tablets (fixo no canto sem invadir o card) */}
      <div className="hidden md:flex absolute top-3 sm:top-5 left-4 sm:left-6 z-30 items-center gap-2 sm:gap-2.5">
        <Image
          src="/logo_santo_andre.png"
          alt="Brasão Oficial de Santo André"
          width={36}
          height={58}
          className="h-8 sm:h-9 xl:h-11 w-auto object-contain drop-shadow-xs"
          priority
        />
        <div className="flex flex-col">
          <span className="text-[10px] sm:text-[11px] font-bold tracking-wider text-[#18181B] uppercase">Santo André</span>
          <span className="text-[9px] sm:text-[10px] text-[#71717A] tracking-wide">Secretaria de Cultura</span>
        </div>
      </div>

      {/* Brasão Oficial para Mobile (acima do card) */}
      <header className="flex md:hidden items-center justify-center gap-2 mb-2 sm:mb-2.5 shrink-0">
        <Image
          src="/logo_santo_andre.png"
          alt="Brasão Oficial de Santo André"
          width={28}
          height={46}
          className="h-7 w-auto object-contain drop-shadow-xs"
          priority
        />
        <div className="flex flex-col text-left">
          <span className="text-[11px] font-bold tracking-wider text-[#18181B] uppercase">Santo André</span>
          <span className="text-[9px] text-[#71717A] tracking-wide">Secretaria de Cultura</span>
        </div>
      </header>

      {/* Container Principal do Card Responsivo */}
      <main className="w-full max-w-sm sm:max-w-md md:max-w-3xl lg:max-w-4xl xl:max-w-[1000px] my-auto">
        <div className="w-full bg-white rounded-2xl sm:rounded-3xl border border-[#EAEAEA] shadow-[0_8px_40px_rgba(0,0,0,0.04)] overflow-hidden flex flex-col md:grid md:grid-cols-12 md:max-h-[min(540px,94vh)]">
          
          {/* PAINEL ARTÍSTICO: Degradê com Ilustração e Slogan */}
          <section
            aria-label="Identidade visual das Escolas Livres"
            className="md:col-span-5 lg:col-span-6 relative flex flex-col justify-center items-center p-3.5 sm:p-5 md:p-6 lg:p-8 xl:p-10 overflow-hidden bg-gradient-to-br from-[#99E8E8] via-[#FBCFE8] to-[#FED7AA]"
          >
            {/* Efeitos de Iluminação e Atmosfera Artística com Desfoque */}
            <div
              className="absolute -top-12 -left-12 w-64 lg:w-72 h-64 lg:h-72 rounded-full bg-[#0D9488]/40 blur-3xl pointer-events-none"
              aria-hidden="true"
            />
            <div
              className="absolute -top-12 -right-12 w-64 lg:w-72 h-64 lg:h-72 rounded-full bg-[#EC4899]/40 blur-3xl pointer-events-none"
              aria-hidden="true"
            />
            <div
              className="absolute -bottom-12 -right-8 w-68 lg:w-80 h-68 lg:h-80 rounded-full bg-[#F59E0B]/45 blur-3xl pointer-events-none"
              aria-hidden="true"
            />
            <div
              className="absolute -bottom-10 -left-10 w-56 lg:w-64 h-56 lg:h-64 rounded-full bg-[#8B5CF6]/30 blur-3xl pointer-events-none"
              aria-hidden="true"
            />

            <div className="relative z-10 flex flex-col items-center justify-center w-full max-w-[280px] sm:max-w-[320px] lg:max-w-[360px]">
              {/* Ilustração Vetorial SVG Proporcional (compacta no mobile e equilibrada em laptops) */}
              <div className="relative w-20 h-20 sm:w-28 sm:h-28 md:w-36 md:h-36 lg:w-48 lg:h-48 xl:w-56 xl:h-56 max-h-[90px] sm:max-h-[120px] md:max-h-[160px] lg:max-h-[220px] flex items-center justify-center transition-transform duration-300 hover:scale-105 motion-reduce:transform-none">
                <Image
                  src="/arte_escolas_livres.svg"
                  alt="Expressão artística — Escolas Livres de Santo André"
                  fill
                  priority
                  className="object-contain drop-shadow-sm select-none pointer-events-none"
                  sizes="(max-width: 640px) 100px, (max-width: 768px) 120px, (max-width: 1024px) 160px, 220px"
                />
              </div>

              {/* Slogan Tipográfico: Crie. Inspire. Transcenda. */}
              <div className="mt-2 sm:mt-2.5 md:mt-3 text-center md:text-left w-full pl-0 md:pl-1">
                <h1 className="text-lg sm:text-2xl md:text-2xl lg:text-3xl xl:text-4xl font-extrabold text-[#18181B] tracking-tight leading-tight lg:leading-[1.12] text-balance">
                  Crie.<span className="hidden md:inline"><br /></span>{' '}
                  <span className="bg-gradient-to-r from-[#0D9488] via-[#7C3AED] to-[#E11D48] bg-clip-text text-transparent">
                    Inspire.
                  </span><span className="hidden md:inline"><br /></span>{' '}
                  Transcenda.
                </h1>
                <p className="text-[11px] sm:text-xs xl:text-[13.5px] text-[#71717A] mt-0.5 sm:mt-1 font-medium tracking-wide">
                  O seu centro de desenvolvimento artístico.
                </p>
              </div>
            </div>
          </section>

          {/* PAINEL DO FORMULÁRIO: Login OU Redefinição de Senha */}
          <section
            aria-label="Formulário de autenticação"
            className="md:col-span-7 lg:col-span-6 p-4 sm:p-6 lg:p-8 xl:p-10 flex flex-col justify-center items-center bg-white md:h-full md:overflow-y-auto"
          >
            <div className="w-full max-w-xs sm:max-w-sm xl:max-w-[340px] flex flex-col my-auto">
              
              {/* MODO 1: LOGIN PRINCIPAL */}
              {modo === 'login' && (
                <>
                  {/* Ícone com Cores Baseadas na Obra de Arte */}
                  <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-gradient-to-br from-[#0D9488] via-[#EC4899] to-[#F59E0B] shadow-sm shadow-[#EC4899]/20 flex items-center justify-center mx-auto mb-2 sm:mb-2.5 transition-transform duration-200 hover:scale-105 motion-reduce:transform-none">
                    <Palette className="w-4 h-4 sm:w-5 sm:h-5 text-white drop-shadow-xs" aria-hidden="true" />
                  </div>

                  {/* Título Oficial */}
                  <h2 className="font-fighter text-2xl sm:text-3xl xl:text-4xl font-normal text-[#18181B] tracking-wide text-center mb-2 sm:mb-3">
                    Portal de Acesso
                  </h2>

                  {/* Mensagem de Erro com Suporte a Acessibilidade */}
                  {erro && (
                    <div
                      role="alert"
                      aria-live="polite"
                      className="mb-2.5 p-2 rounded-xl bg-[#FDF2F2] border border-[#F9D4D5] text-[#9E2A2B] text-xs font-normal"
                    >
                      {erro}
                    </div>
                  )}

                  {/* Formulário de Login */}
                  <form onSubmit={handleSubmit} className="space-y-2.5 sm:space-y-3">
                    <div>
                      <label
                        htmlFor="emailInput"
                        className="block text-xs font-semibold text-[#3F3F46] mb-1 cursor-pointer"
                      >
                        E-mail
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#9CA3AF]">
                          <Mail className="w-4 h-4" aria-hidden="true" />
                        </div>
                        <input
                          id="emailInput"
                          name="email"
                          type="email"
                          required
                          autoComplete="email"
                          spellCheck={false}
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="artista@santoandre.sp.gov.br"
                          className="w-full pl-10 pr-4 py-2 sm:py-2.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl text-xs sm:text-sm text-[#18181B] placeholder-[#9CA3AF] focus:outline-none focus-visible:border-[#18181B] focus-visible:ring-2 focus-visible:ring-[#18181B]/15 focus:bg-white transition-colors duration-150 touch-manipulation"
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label
                          htmlFor="senhaInput"
                          className="block text-xs font-semibold text-[#3F3F46] cursor-pointer"
                        >
                          Senha
                        </label>
                        <button
                          type="button"
                          onClick={handleIniciarRecuperacao}
                          className="text-xs font-medium text-[#71717A] hover:text-[#18181B] hover:underline cursor-pointer min-h-[24px] inline-flex items-center touch-manipulation"
                        >
                          Esqueceu a senha?
                        </button>
                      </div>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#9CA3AF]">
                          <Lock className="w-4 h-4" aria-hidden="true" />
                        </div>
                        <input
                          id="senhaInput"
                          name="password"
                          type={mostrarSenha ? 'text' : 'password'}
                          required
                          autoComplete="current-password"
                          spellCheck={false}
                          value={senha}
                          onChange={(e) => setSenha(e.target.value)}
                          placeholder="••••••••"
                          className="w-full pl-10 pr-12 py-2 sm:py-2.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl text-xs sm:text-sm text-[#18181B] placeholder-[#9CA3AF] focus:outline-none focus-visible:border-[#18181B] focus-visible:ring-2 focus-visible:ring-[#18181B]/15 focus:bg-white transition-colors duration-150 touch-manipulation"
                        />
                        <button
                          type="button"
                          onClick={() => setMostrarSenha(!mostrarSenha)}
                          aria-label={mostrarSenha ? 'Ocultar senha' : 'Ver senha'}
                          className="absolute inset-y-0 right-0 pr-3.5 flex items-center justify-center text-[#9CA3AF] hover:text-[#374151] cursor-pointer min-w-[40px] min-h-[40px] rounded-r-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#18181B] touch-manipulation"
                        >
                          {mostrarSenha ? (
                            <EyeOff className="w-4 h-4" aria-hidden="true" />
                          ) : (
                            <Eye className="w-4 h-4" aria-hidden="true" />
                          )}
                        </button>
                      </div>
                    </div>

                    <GradientHoverButton
                      type="submit"
                      loading={loading}
                      loadingText="Entrando…"
                      preset="aurora"
                      direction="right-to-left"
                      className="mt-1.5 sm:mt-2"
                    >
                      <span>Entrar</span>
                      <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5 motion-reduce:transform-none" aria-hidden="true" />
                    </GradientHoverButton>
                  </form>
                </>
              )}

              {/* MODO 2: REDEFINIÇÃO DE SENHA (ETAPAS) */}
              {modo === 'recuperacao' && (
                <>
                  {/* ETAPA 1: SOLICITAR CÓDIGO (PEDIR E-MAIL CADASTRADO) */}
                  {etapaRecuperacao === 'email' && (
                    <div className="w-full flex flex-col">
                      <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-[#18181B] text-white flex items-center justify-center mx-auto mb-2 sm:mb-2.5 shadow-xs">
                        <KeyRound className="w-4 h-4 sm:w-5 sm:h-5 text-white" aria-hidden="true" />
                      </div>

                      <h2 className="text-lg sm:text-xl font-extrabold text-[#18181B] tracking-tight text-center uppercase">
                        Redefinir Senha
                      </h2>
                      <p className="text-[10px] sm:text-[11px] font-semibold text-[#71717A] tracking-wider text-center uppercase mt-0.5 mb-2.5 sm:mb-3">
                        Informe o e-mail cadastrado
                      </p>

                      {recuperacaoErro && (
                        <div
                          role="alert"
                          aria-live="polite"
                          className="mb-2.5 p-2 rounded-xl bg-[#FDF2F2] border border-[#F9D4D5] text-[#9E2A2B] text-xs font-normal"
                        >
                          {recuperacaoErro}
                        </div>
                      )}

                      <form onSubmit={handleSolicitarCodigo} className="space-y-2.5 sm:space-y-3">
                        <div>
                          <label
                            htmlFor="emailRecuperacaoInput"
                            className="block text-xs font-semibold text-[#3F3F46] mb-1 cursor-pointer"
                          >
                            E-mail Institucional
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#9CA3AF]">
                              <Mail className="w-4 h-4" aria-hidden="true" />
                            </div>
                            <input
                              id="emailRecuperacaoInput"
                              name="email"
                              type="email"
                              required
                              autoFocus
                              spellCheck={false}
                              value={emailRecuperacao}
                              onChange={(e) => setEmailRecuperacao(e.target.value)}
                              placeholder="seu.email@santoandre.sp.gov.br"
                              className="w-full pl-10 pr-4 py-2 sm:py-2.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl text-xs sm:text-sm text-[#18181B] placeholder-[#9CA3AF] focus:outline-none focus-visible:border-[#18181B] focus-visible:ring-2 focus-visible:ring-[#18181B]/15 focus:bg-white transition-colors duration-150 touch-manipulation"
                            />
                          </div>
                          <p className="text-[10px] sm:text-[11px] text-[#71717A] mt-1 leading-relaxed">
                            Um código será enviado para o seu e-mail.
                          </p>
                        </div>

                        <button
                          type="submit"
                          disabled={recuperacaoLoading}
                          className="w-full min-h-[40px] sm:min-h-[44px] py-2.5 sm:py-3 bg-[#18181B] hover:bg-[#27272A] text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs transition-colors duration-150 active:scale-[0.98] cursor-pointer flex items-center justify-center space-x-2 mt-1.5 touch-manipulation focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#18181B]"
                        >
                          {recuperacaoLoading ? (
                            <div className="flex items-center space-x-2">
                              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin motion-reduce:animate-pulse" />
                              <span>Enviando código…</span>
                            </div>
                          ) : (
                            <>
                              <span>Enviar Código</span>
                              <ArrowRight className="w-4 h-4" aria-hidden="true" />
                            </>
                          )}
                        </button>
                      </form>

                      <div className="mt-2.5 sm:mt-3 text-center">
                        <button
                          type="button"
                          onClick={handleVoltarLogin}
                          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#71717A] hover:text-[#18181B] hover:underline cursor-pointer min-h-[32px] touch-manipulation"
                        >
                          <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
                          <span>Voltar ao login</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* ETAPA 2: DIGITAR O CÓDIGO DE 7 DÍGITOS RECEBIDO POR E-MAIL */}
                  {etapaRecuperacao === 'codigo' && (
                    <div className="w-full flex flex-col">
                      <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-[#18181B] text-white flex items-center justify-center mx-auto mb-2 shadow-xs">
                        <KeyRound className="w-4 h-4 sm:w-5 sm:h-5 text-white" aria-hidden="true" />
                      </div>

                      <h2 className="text-lg sm:text-xl font-extrabold text-[#18181B] tracking-tight text-center uppercase">
                        Código de Acesso
                      </h2>
                      <p className="text-[10px] sm:text-[11px] font-semibold text-[#71717A] tracking-wider text-center mt-0.5 mb-1.5 truncate max-w-full px-2" title={emailMascarado}>
                        Enviado para {emailMascarado || emailRecuperacao}
                      </p>

                      {/* Aviso de Expiração em 10 Minutos */}
                      <div className="mb-2 py-1 px-2.5 rounded-lg bg-[#F4F4F5] border border-[#E4E4E7] text-[#52525B] text-[10px] sm:text-[11px] font-medium flex items-center justify-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 shrink-0 text-[#18181B]" aria-hidden="true" />
                        <span>O código possui 7 dígitos e expira em 10 minutos</span>
                      </div>

                      {recuperacaoErro && (
                        <div
                          role="alert"
                          aria-live="polite"
                          className="mb-2.5 p-2 rounded-xl bg-[#FDF2F2] border border-[#F9D4D5] text-[#9E2A2B] text-xs font-normal"
                        >
                          {recuperacaoErro}
                        </div>
                      )}

                      <form onSubmit={handleValidarCodigo} className="space-y-2.5 sm:space-y-3">
                        <div>
                          <label
                            htmlFor="codigoInput"
                            className="block text-xs font-semibold text-[#3F3F46] mb-1 text-center cursor-pointer"
                          >
                            Digite o código de 7 dígitos
                          </label>
                          <div className="relative">
                            <input
                              id="codigoInput"
                              name="code"
                              type="text"
                              inputMode="numeric"
                              pattern="[0-9]*"
                              autoComplete="one-time-code"
                              maxLength={7}
                              autoFocus
                              value={codigoRecuperacao}
                              onChange={(e) => {
                                const val = e.target.value.replace(/\D/g, '').slice(0, 7);
                                setCodigoRecuperacao(val);
                                setRecuperacaoErro(null);
                              }}
                              placeholder="0000000"
                              className="w-full text-center text-xl sm:text-2xl font-mono font-extrabold tracking-[0.35em] py-2 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl text-[#18181B] placeholder-[#D1D5DB] focus:outline-none focus-visible:border-[#18181B] focus-visible:ring-2 focus-visible:ring-[#18181B]/15 focus:bg-white transition-colors duration-150 touch-manipulation"
                              required
                            />
                          </div>
                        </div>

                        <button
                          type="submit"
                          disabled={recuperacaoLoading || codigoRecuperacao.trim().length !== 7}
                          className="w-full min-h-[40px] sm:min-h-[44px] py-2.5 sm:py-3 bg-[#18181B] hover:bg-[#27272A] disabled:opacity-50 text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs transition-colors duration-150 active:scale-[0.98] cursor-pointer flex items-center justify-center space-x-2 touch-manipulation focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#18181B]"
                        >
                          {recuperacaoLoading ? (
                            <div className="flex items-center space-x-2">
                              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin motion-reduce:animate-pulse" />
                              <span>Validando código…</span>
                            </div>
                          ) : (
                            <>
                              <span>Verificar Código</span>
                              <ArrowRight className="w-4 h-4" aria-hidden="true" />
                            </>
                          )}
                        </button>
                      </form>

                      {/* Ações Secundárias */}
                      <div className="mt-2.5 flex items-center justify-between text-xs px-1">
                        <button
                          type="button"
                          onClick={() => handleSolicitarCodigo()}
                          disabled={recuperacaoLoading}
                          className="inline-flex items-center gap-1 font-semibold text-[#18181B] hover:text-[#000000] hover:underline cursor-pointer min-h-[32px] touch-manipulation"
                        >
                          <RotateCw className="w-3 h-3" aria-hidden="true" />
                          <span>Reenviar código</span>
                        </button>
                        <button
                          type="button"
                          onClick={handleVoltarLogin}
                          className="font-medium text-[#71717A] hover:text-[#18181B] hover:underline cursor-pointer min-h-[32px] inline-flex items-center touch-manipulation"
                        >
                          Voltar ao login
                        </button>
                      </div>
                    </div>
                  )}

                  {/* ETAPA 3: COLOCAR A SENHA NOVA 2 VEZES */}
                  {etapaRecuperacao === 'senha' && (
                    <div className="w-full flex flex-col">
                      <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-[#18181B] text-white flex items-center justify-center mx-auto mb-2 shadow-xs">
                        <Lock className="w-4 h-4 sm:w-5 sm:h-5 text-white" aria-hidden="true" />
                      </div>

                      <h2 className="text-lg sm:text-xl font-extrabold text-[#18181B] tracking-tight text-center uppercase">
                        Nova Senha
                      </h2>
                      <p className="text-[10px] sm:text-[11px] font-semibold text-[#71717A] tracking-wider text-center uppercase mt-0.5 mb-2.5">
                        Digite sua nova senha 2 vezes
                      </p>

                      {recuperacaoErro && (
                        <div
                          role="alert"
                          aria-live="polite"
                          className="mb-2.5 p-2 rounded-xl bg-[#FDF2F2] border border-[#F9D4D5] text-[#9E2A2B] text-xs font-normal"
                        >
                          {recuperacaoErro}
                        </div>
                      )}

                      <form onSubmit={handleRedefinirSenha} className="space-y-2.5">
                        <div>
                          <label
                            htmlFor="novaSenhaInput"
                            className="block text-xs font-semibold text-[#3F3F46] mb-1 cursor-pointer"
                          >
                            1. Nova Senha
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#9CA3AF]">
                              <Lock className="w-4 h-4" aria-hidden="true" />
                            </div>
                            <input
                              id="novaSenhaInput"
                              name="new-password"
                              type={mostrarNovaSenha ? 'text' : 'password'}
                              required
                              autoFocus
                              autoComplete="new-password"
                              spellCheck={false}
                              value={novaSenha}
                              onChange={(e) => {
                                setNovaSenha(e.target.value);
                                setRecuperacaoErro(null);
                              }}
                              placeholder="Mínimo 6 caracteres"
                              className="w-full pl-10 pr-12 py-2 sm:py-2.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl text-xs sm:text-sm text-[#18181B] placeholder-[#9CA3AF] focus:outline-none focus-visible:border-[#18181B] focus-visible:ring-2 focus-visible:ring-[#18181B]/15 focus:bg-white transition-colors duration-150 touch-manipulation"
                            />
                            <button
                              type="button"
                              onClick={() => setMostrarNovaSenha(!mostrarNovaSenha)}
                              aria-label={mostrarNovaSenha ? 'Ocultar senha' : 'Ver senha'}
                              className="absolute inset-y-0 right-0 pr-3.5 flex items-center justify-center text-[#9CA3AF] hover:text-[#374151] cursor-pointer min-w-[40px] min-h-[40px] rounded-r-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#18181B] touch-manipulation"
                            >
                              {mostrarNovaSenha ? (
                                <EyeOff className="w-4 h-4" aria-hidden="true" />
                              ) : (
                                <Eye className="w-4 h-4" aria-hidden="true" />
                              )}
                            </button>
                          </div>
                        </div>

                        <div>
                          <label
                            htmlFor="confirmarSenhaInput"
                            className="block text-xs font-semibold text-[#3F3F46] mb-1 cursor-pointer"
                          >
                            2. Confirmar Nova Senha
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#9CA3AF]">
                              <Lock className="w-4 h-4" aria-hidden="true" />
                            </div>
                            <input
                              id="confirmarSenhaInput"
                              name="confirm-password"
                              type={mostrarConfirmarSenha ? 'text' : 'password'}
                              required
                              autoComplete="new-password"
                              spellCheck={false}
                              value={confirmarSenha}
                              onChange={(e) => {
                                setConfirmarSenha(e.target.value);
                                setRecuperacaoErro(null);
                              }}
                              placeholder="Repita exatamente a nova senha"
                              className="w-full pl-10 pr-12 py-2 sm:py-2.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl text-xs sm:text-sm text-[#18181B] placeholder-[#9CA3AF] focus:outline-none focus-visible:border-[#18181B] focus-visible:ring-2 focus-visible:ring-[#18181B]/15 focus:bg-white transition-colors duration-150 touch-manipulation"
                            />
                            <button
                              type="button"
                              onClick={() => setMostrarConfirmarSenha(!mostrarConfirmarSenha)}
                              aria-label={mostrarConfirmarSenha ? 'Ocultar senha' : 'Ver senha'}
                              className="absolute inset-y-0 right-0 pr-3.5 flex items-center justify-center text-[#9CA3AF] hover:text-[#374151] cursor-pointer min-w-[40px] min-h-[40px] rounded-r-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#18181B] touch-manipulation"
                            >
                              {mostrarConfirmarSenha ? (
                                <EyeOff className="w-4 h-4" aria-hidden="true" />
                              ) : (
                                <Eye className="w-4 h-4" aria-hidden="true" />
                              )}
                            </button>
                          </div>
                        </div>

                        <button
                          type="submit"
                          disabled={recuperacaoLoading}
                          className="w-full min-h-[40px] sm:min-h-[44px] py-2.5 sm:py-3 bg-[#18181B] hover:bg-[#27272A] text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs transition-colors duration-150 active:scale-[0.98] cursor-pointer flex items-center justify-center space-x-2 mt-1.5 touch-manipulation focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#18181B]"
                        >
                          {recuperacaoLoading ? (
                            <div className="flex items-center space-x-2">
                              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin motion-reduce:animate-pulse" />
                              <span>Salvando nova senha…</span>
                            </div>
                          ) : (
                            <>
                              <span>Salvar Nova Senha</span>
                              <ArrowRight className="w-4 h-4" aria-hidden="true" />
                            </>
                          )}
                        </button>
                      </form>

                      <div className="mt-2 text-center">
                        <button
                          type="button"
                          onClick={handleVoltarLogin}
                          className="text-xs font-medium text-[#71717A] hover:text-[#18181B] hover:underline cursor-pointer min-h-[32px] inline-flex items-center touch-manipulation"
                        >
                          Cancelar e voltar ao login
                        </button>
                      </div>
                    </div>
                  )}

                  {/* ETAPA 4: SUCESSO COMPLETO */}
                  {etapaRecuperacao === 'sucesso' && (
                    <div className="w-full flex flex-col items-center text-center py-1.5">
                      <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-[#18181B] text-white flex items-center justify-center mx-auto mb-2 shadow-xs">
                        <CheckCircle2 className="w-6 h-6 sm:w-7 sm:h-7 text-white" aria-hidden="true" />
                      </div>

                      <h2 className="text-lg sm:text-xl font-extrabold text-[#18181B] tracking-tight uppercase">
                        Senha Atualizada!
                      </h2>
                      <p className="text-xs text-[#71717A] mt-0.5 mb-3.5 max-w-[260px] leading-relaxed">
                        Sua senha foi redefinida com sucesso. Você já pode acessar sua conta com a nova senha.
                      </p>

                      <button
                        type="button"
                        onClick={handleConcluirSucesso}
                        className="w-full min-h-[40px] sm:min-h-[44px] py-2.5 sm:py-3 bg-[#18181B] hover:bg-[#27272A] text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs transition-colors duration-150 active:scale-[0.98] cursor-pointer flex items-center justify-center space-x-2 touch-manipulation focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#18181B]"
                      >
                        <span>Ir para o Login</span>
                        <ArrowRight className="w-4 h-4" aria-hidden="true" />
                      </button>
                    </div>
                  )}
                </>
              )}

            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
