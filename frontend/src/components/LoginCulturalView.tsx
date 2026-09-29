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
  onLoginSucesso: (user: LoginResponse) => void;
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
      onLoginSucesso(user);
    } catch (err: any) {
      setErro(err.message || 'Credenciais inválidas. Verifique seus dados.');
    } finally {
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
    <div className="relative h-screen max-h-screen w-full bg-[#FAF9F7] text-[#18181B] flex flex-col items-center justify-center p-3 sm:p-5 font-sans antialiased selection:bg-[#18181B] selection:text-white overflow-hidden">
      {/* Brasão Oficial de Santo André no Canto Superior Esquerdo da Tela */}
      <div className="absolute top-4 left-4 sm:top-6 sm:left-8 z-30 flex items-center gap-2.5">
        <Image
          src="/logo_santo_andre.png"
          alt="Brasão de Santo André"
          width={40}
          height={68}
          className="h-10 sm:h-12 w-auto object-contain drop-shadow-xs"
          priority
        />
        <div className="hidden sm:flex flex-col">
          <span className="text-[11px] font-bold tracking-wider text-[#18181B] uppercase">Santo André</span>
          <span className="text-[10px] text-[#71717A] tracking-wide">Secretaria de Cultura</span>
        </div>
      </div>

      <div className="w-full max-w-4xl flex flex-col items-center justify-center h-full max-h-[calc(100vh-20px)]">
        {/* Container Principal — Divisão 50/50 Exata */}
        <div className="w-full bg-white rounded-3xl border border-[#EAEAEA] shadow-[0_8px_40px_rgba(0,0,0,0.04)] overflow-hidden grid grid-cols-1 lg:grid-cols-12 h-[calc(100vh-80px)] max-h-[570px] min-h-[460px]">
          
          {/* PAINEL ESQUERDO: Fundo Artístico com Degradê Enriquecido e Cores Mais Vivas */}
          <div className="lg:col-span-6 relative flex flex-col justify-center items-center p-6 sm:p-10 overflow-hidden bg-gradient-to-br from-[#99E8E8] via-[#FBCFE8] to-[#FED7AA]">
            {/* Efeitos de Iluminação e Atmosfera Artística no Fundo com Cores Mais Fortes */}
            <div
              className="absolute -top-12 -left-12 w-72 h-72 rounded-full bg-[#0D9488]/45 blur-3xl pointer-events-none"
              aria-hidden="true"
            />
            <div
              className="absolute -top-12 -right-12 w-72 h-72 rounded-full bg-[#EC4899]/45 blur-3xl pointer-events-none"
              aria-hidden="true"
            />
            <div
              className="absolute -bottom-12 -right-8 w-80 h-80 rounded-full bg-[#F59E0B]/50 blur-3xl pointer-events-none"
              aria-hidden="true"
            />
            <div
              className="absolute -bottom-10 -left-10 w-64 h-64 rounded-full bg-[#8B5CF6]/30 blur-3xl pointer-events-none"
              aria-hidden="true"
            />

            <div className="relative z-10 flex flex-col items-center justify-center w-full max-w-[340px]">
              {/* Ilustração Vetorial SVG Sem Fundo Branco e em Tamanho Ampliado */}
              <div className="relative w-60 h-60 sm:w-68 sm:h-68 max-h-[250px] flex items-center justify-center transition-transform duration-300 hover:scale-105">
                <Image
                  src="/arte_escolas_livres.svg"
                  alt="Expressão artística — Escolas Livres de Santo André"
                  fill
                  priority
                  className="object-contain drop-shadow-sm select-none pointer-events-none"
                  sizes="(max-width: 768px) 240px, 272px"
                />
              </div>

              {/* Slogan Tipográfico: Crie. Inspire. Transcenda. */}
              <div className="mt-4 sm:mt-5 text-left w-full pl-1">
                <h1 className="text-3xl sm:text-4xl font-extrabold text-[#18181B] tracking-tight leading-[1.15]">
                  Crie.<br />
                  <span className="bg-gradient-to-r from-[#0D9488] via-[#7C3AED] to-[#E11D48] bg-clip-text text-transparent">
                    Inspire.
                  </span><br />
                  Transcenda.
                </h1>
                <p className="text-xs sm:text-sm text-[#71717A] mt-1.5 font-medium tracking-wide">
                  O seu centro de desenvolvimento artístico.
                </p>
              </div>
            </div>
          </div>

          {/* PAINEL DIREITO: Formulário de Login OU Fluxo de Redefinição de Senha */}
          <div className="lg:col-span-6 p-6 sm:p-10 flex flex-col justify-center items-center bg-white h-full overflow-hidden">
            <div className="w-full max-w-xs sm:max-w-sm flex flex-col">
              
              {/* MODO 1: LOGIN PRINCIPAL */}
              {modo === 'login' && (
                <>
                  {/* Ícone com Cores Fortes e Vivas Baseadas na Obra de Arte */}
                  <div className="w-13 h-13 rounded-full bg-gradient-to-br from-[#0D9488] via-[#EC4899] to-[#F59E0B] shadow-md shadow-[#EC4899]/25 flex items-center justify-center mx-auto mb-3.5 transition-transform duration-200 hover:scale-105">
                    <Palette className="w-6 h-6 text-white drop-shadow-xs" />
                  </div>

                  {/* Título: Apenas Portal de Acesso */}
                  <h2 className="font-fighter text-3xl sm:text-4xl font-normal text-[#18181B] tracking-wide text-center mb-4">
                    Portal de Acesso
                  </h2>


                  {/* Mensagem de Erro Discreta */}
                  {erro && (
                    <div className="mb-3 p-2.5 rounded-xl bg-[#FDF2F2] border border-[#F9D4D5] text-[#9E2A2B] text-xs font-normal">
                      {erro}
                    </div>
                  )}

                  {/* Formulário de Login */}
                  <form onSubmit={handleSubmit} className="space-y-3.5">
                    <div>
                      <label
                        htmlFor="emailInput"
                        className="block text-xs font-semibold text-[#3F3F46] mb-1.5"
                      >
                        E-mail
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#9CA3AF]">
                          <Mail className="w-4 h-4" />
                        </div>
                        <input
                          id="emailInput"
                          type="email"
                          required
                          autoComplete="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="artista@santoandre.sp.gov.br"
                          className="w-full pl-10 pr-4 py-2.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl text-xs sm:text-sm text-[#18181B] placeholder-[#9CA3AF] focus:outline-hidden focus:border-[#18181B] focus:ring-2 focus:ring-[#18181B]/15 focus:bg-white transition"
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label
                          htmlFor="senhaInput"
                          className="block text-xs font-semibold text-[#3F3F46]"
                        >
                          Senha
                        </label>
                        <button
                          type="button"
                          onClick={handleIniciarRecuperacao}
                          className="text-xs font-medium text-[#71717A] hover:text-[#18181B] hover:underline cursor-pointer"
                        >
                          Esqueceu a senha?
                        </button>
                      </div>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#9CA3AF]">
                          <Lock className="w-4 h-4" />
                        </div>
                        <input
                          id="senhaInput"
                          type={mostrarSenha ? 'text' : 'password'}
                          required
                          autoComplete="current-password"
                          value={senha}
                          onChange={(e) => setSenha(e.target.value)}
                          placeholder="••••••••"
                          className="w-full pl-10 pr-10 py-2.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl text-xs sm:text-sm text-[#18181B] placeholder-[#9CA3AF] focus:outline-hidden focus:border-[#18181B] focus:ring-2 focus:ring-[#18181B]/15 focus:bg-white transition"
                        />
                        <button
                          type="button"
                          onClick={() => setMostrarSenha(!mostrarSenha)}
                          aria-label={mostrarSenha ? 'Ocultar senha' : 'Ver senha'}
                          className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#9CA3AF] hover:text-[#374151] cursor-pointer"
                        >
                          {mostrarSenha ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <GradientHoverButton
                      type="submit"
                      loading={loading}
                      loadingText="Entrando..."
                      preset="aurora"
                      direction="right-to-left"
                      className="mt-2"
                    >
                      <span>Entrar</span>
                      <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5" />
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
                      <div className="w-13 h-13 rounded-full bg-[#18181B] text-white flex items-center justify-center mx-auto mb-3 shadow-xs">
                        <KeyRound className="w-6 h-6 text-white" />
                      </div>

                      <h2 className="text-xl font-extrabold text-[#18181B] tracking-tight text-center uppercase">
                        Redefinir Senha
                      </h2>
                      <p className="text-[11px] font-semibold text-[#71717A] tracking-wider text-center uppercase mt-0.5 mb-4">
                        Informe o e-mail cadastrado
                      </p>

                      {recuperacaoErro && (
                        <div className="mb-3 p-2.5 rounded-xl bg-[#FDF2F2] border border-[#F9D4D5] text-[#9E2A2B] text-xs font-normal">
                          {recuperacaoErro}
                        </div>
                      )}

                      <form onSubmit={handleSolicitarCodigo} className="space-y-3.5">
                        <div>
                          <label
                            htmlFor="emailRecuperacaoInput"
                            className="block text-xs font-semibold text-[#3F3F46] mb-1.5"
                          >
                            E-mail Institucional
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#9CA3AF]">
                              <Mail className="w-4 h-4" />
                            </div>
                            <input
                              id="emailRecuperacaoInput"
                              type="email"
                              required
                              autoFocus
                              value={emailRecuperacao}
                              onChange={(e) => setEmailRecuperacao(e.target.value)}
                              placeholder="seu.email@santoandre.sp.gov.br"
                              className="w-full pl-10 pr-4 py-2.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl text-xs sm:text-sm text-[#18181B] placeholder-[#9CA3AF] focus:outline-hidden focus:border-[#18181B] focus:ring-2 focus:ring-[#18181B]/15 focus:bg-white transition"
                            />
                          </div>
                          <p className="text-[11px] text-[#71717A] mt-1.5 leading-relaxed">
                            Um código será enviado para o seu e-mail.
                          </p>
                        </div>

                        <button
                          type="submit"
                          disabled={recuperacaoLoading}
                          className="w-full py-3 bg-[#18181B] hover:bg-[#27272A] text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center space-x-2 mt-2"
                        >
                          {recuperacaoLoading ? (
                            <div className="flex items-center space-x-2">
                              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                              <span>Enviando código...</span>
                            </div>
                          ) : (
                            <>
                              <span>Enviar Código</span>
                              <ArrowRight className="w-4 h-4" />
                            </>
                          )}
                        </button>
                      </form>

                      <div className="mt-4 text-center">
                        <button
                          type="button"
                          onClick={handleVoltarLogin}
                          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#71717A] hover:text-[#18181B] hover:underline cursor-pointer"
                        >
                          <ArrowLeft className="w-3.5 h-3.5" />
                          <span>Voltar ao login</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* ETAPA 2: DIGITAR O CÓDIGO DE 7 DÍGITOS RECEBIDO POR E-MAIL */}
                  {etapaRecuperacao === 'codigo' && (
                    <div className="w-full flex flex-col">
                      <div className="w-13 h-13 rounded-full bg-[#18181B] text-white flex items-center justify-center mx-auto mb-2.5 shadow-xs">
                        <KeyRound className="w-6 h-6 text-white" />
                      </div>

                      <h2 className="text-xl font-extrabold text-[#18181B] tracking-tight text-center uppercase">
                        Código de Acesso
                      </h2>
                      <p className="text-[11px] font-semibold text-[#71717A] tracking-wider text-center mt-0.5 mb-2 truncate max-w-full px-2" title={emailMascarado}>
                        Enviado para {emailMascarado || emailRecuperacao}
                      </p>

                      {/* Aviso de Expiração em 10 Minutos */}
                      <div className="mb-3 py-1.5 px-3 rounded-lg bg-[#F4F4F5] border border-[#E4E4E7] text-[#52525B] text-[11px] font-medium flex items-center justify-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 shrink-0 text-[#18181B]" />
                        <span>O código possui 7 dígitos e expira em 10 minutos</span>
                      </div>

                      {recuperacaoErro && (
                        <div className="mb-3 p-2.5 rounded-xl bg-[#FDF2F2] border border-[#F9D4D5] text-[#9E2A2B] text-xs font-normal">
                          {recuperacaoErro}
                        </div>
                      )}

                      <form onSubmit={handleValidarCodigo} className="space-y-3.5">
                        <div>
                          <label
                            htmlFor="codigoInput"
                            className="block text-xs font-semibold text-[#3F3F46] mb-1.5 text-center"
                          >
                            Digite o código de 7 dígitos
                          </label>
                          <div className="relative">
                            <input
                              id="codigoInput"
                              type="text"
                              inputMode="numeric"
                              pattern="[0-9]*"
                              maxLength={7}
                              autoFocus
                              value={codigoRecuperacao}
                              onChange={(e) => {
                                const val = e.target.value.replace(/\D/g, '').slice(0, 7);
                                setCodigoRecuperacao(val);
                                setRecuperacaoErro(null);
                              }}
                              placeholder="0000000"
                              className="w-full text-center text-2xl font-mono font-extrabold tracking-[0.35em] py-2.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl text-[#18181B] placeholder-[#D1D5DB] focus:outline-hidden focus:border-[#18181B] focus:ring-2 focus:ring-[#18181B]/15 focus:bg-white transition"
                              required
                            />
                          </div>
                        </div>

                        <button
                          type="submit"
                          disabled={recuperacaoLoading || codigoRecuperacao.trim().length !== 7}
                          className="w-full py-3 bg-[#18181B] hover:bg-[#27272A] disabled:opacity-50 text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center space-x-2"
                        >
                          {recuperacaoLoading ? (
                            <div className="flex items-center space-x-2">
                              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                              <span>Validando código...</span>
                            </div>
                          ) : (
                            <>
                              <span>Verificar Código</span>
                              <ArrowRight className="w-4 h-4" />
                            </>
                          )}
                        </button>
                      </form>

                      {/* Ações Secundárias */}
                      <div className="mt-3.5 flex items-center justify-between text-xs px-1">
                        <button
                          type="button"
                          onClick={() => handleSolicitarCodigo()}
                          disabled={recuperacaoLoading}
                          className="inline-flex items-center gap-1 font-semibold text-[#18181B] hover:text-[#000000] hover:underline cursor-pointer"
                        >
                          <RotateCw className="w-3 h-3" />
                          <span>Reenviar código</span>
                        </button>
                        <button
                          type="button"
                          onClick={handleVoltarLogin}
                          className="font-medium text-[#71717A] hover:text-[#18181B] hover:underline cursor-pointer"
                        >
                          Voltar ao login
                        </button>
                      </div>
                    </div>
                  )}

                  {/* ETAPA 3: COLOCAR A SENHA NOVA 2 VEZES */}
                  {etapaRecuperacao === 'senha' && (
                    <div className="w-full flex flex-col">
                      <div className="w-13 h-13 rounded-full bg-[#18181B] text-white flex items-center justify-center mx-auto mb-2.5 shadow-xs">
                        <Lock className="w-6 h-6 text-white" />
                      </div>

                      <h2 className="text-xl font-extrabold text-[#18181B] tracking-tight text-center uppercase">
                        Nova Senha
                      </h2>
                      <p className="text-[11px] font-semibold text-[#71717A] tracking-wider text-center uppercase mt-0.5 mb-3.5">
                        Digite sua nova senha 2 vezes
                      </p>

                      {recuperacaoErro && (
                        <div className="mb-3 p-2.5 rounded-xl bg-[#FDF2F2] border border-[#F9D4D5] text-[#9E2A2B] text-xs font-normal">
                          {recuperacaoErro}
                        </div>
                      )}

                      <form onSubmit={handleRedefinirSenha} className="space-y-3">
                        <div>
                          <label
                            htmlFor="novaSenhaInput"
                            className="block text-xs font-semibold text-[#3F3F46] mb-1"
                          >
                            1. Nova Senha
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#9CA3AF]">
                              <Lock className="w-4 h-4" />
                            </div>
                            <input
                              id="novaSenhaInput"
                              type={mostrarNovaSenha ? 'text' : 'password'}
                              required
                              autoFocus
                              value={novaSenha}
                              onChange={(e) => {
                                setNovaSenha(e.target.value);
                                setRecuperacaoErro(null);
                              }}
                              placeholder="Mínimo 6 caracteres"
                              className="w-full pl-10 pr-10 py-2.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl text-xs sm:text-sm text-[#18181B] placeholder-[#9CA3AF] focus:outline-hidden focus:border-[#18181B] focus:ring-2 focus:ring-[#18181B]/15 focus:bg-white transition"
                            />
                            <button
                              type="button"
                              onClick={() => setMostrarNovaSenha(!mostrarNovaSenha)}
                              aria-label={mostrarNovaSenha ? 'Ocultar senha' : 'Ver senha'}
                              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#9CA3AF] hover:text-[#374151] cursor-pointer"
                            >
                              {mostrarNovaSenha ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>

                        <div>
                          <label
                            htmlFor="confirmarSenhaInput"
                            className="block text-xs font-semibold text-[#3F3F46] mb-1"
                          >
                            2. Confirmar Nova Senha
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#9CA3AF]">
                              <Lock className="w-4 h-4" />
                            </div>
                            <input
                              id="confirmarSenhaInput"
                              type={mostrarConfirmarSenha ? 'text' : 'password'}
                              required
                              value={confirmarSenha}
                              onChange={(e) => {
                                setConfirmarSenha(e.target.value);
                                setRecuperacaoErro(null);
                              }}
                              placeholder="Repita exatamente a nova senha"
                              className="w-full pl-10 pr-10 py-2.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl text-xs sm:text-sm text-[#18181B] placeholder-[#9CA3AF] focus:outline-hidden focus:border-[#18181B] focus:ring-2 focus:ring-[#18181B]/15 focus:bg-white transition"
                            />
                            <button
                              type="button"
                              onClick={() => setMostrarConfirmarSenha(!mostrarConfirmarSenha)}
                              aria-label={mostrarConfirmarSenha ? 'Ocultar senha' : 'Ver senha'}
                              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#9CA3AF] hover:text-[#374151] cursor-pointer"
                            >
                              {mostrarConfirmarSenha ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>

                        <button
                          type="submit"
                          disabled={recuperacaoLoading}
                          className="w-full py-3 bg-[#18181B] hover:bg-[#27272A] text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center space-x-2 mt-2"
                        >
                          {recuperacaoLoading ? (
                            <div className="flex items-center space-x-2">
                              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                              <span>Salvando nova senha...</span>
                            </div>
                          ) : (
                            <>
                              <span>Salvar Nova Senha</span>
                              <ArrowRight className="w-4 h-4" />
                            </>
                          )}
                        </button>
                      </form>

                      <div className="mt-3 text-center">
                        <button
                          type="button"
                          onClick={handleVoltarLogin}
                          className="text-xs font-medium text-[#71717A] hover:text-[#18181B] hover:underline cursor-pointer"
                        >
                          Cancelar e voltar ao login
                        </button>
                      </div>
                    </div>
                  )}

                  {/* ETAPA 4: SUCESSO COMPLETO */}
                  {etapaRecuperacao === 'sucesso' && (
                    <div className="w-full flex flex-col items-center text-center py-2">
                      <div className="w-14 h-14 rounded-full bg-[#18181B] text-white flex items-center justify-center mx-auto mb-3 shadow-xs">
                        <CheckCircle2 className="w-8 h-8 text-white" />
                      </div>

                      <h2 className="text-xl font-extrabold text-[#18181B] tracking-tight uppercase">
                        Senha Atualizada!
                      </h2>
                      <p className="text-xs text-[#71717A] mt-1 mb-5 max-w-[260px] leading-relaxed">
                        Sua senha foi redefinida com sucesso. Você já pode acessar sua conta com a nova senha.
                      </p>

                      <button
                        type="button"
                        onClick={handleConcluirSucesso}
                        className="w-full py-3 bg-[#18181B] hover:bg-[#27272A] text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center space-x-2"
                      >
                        <span>Ir para o Login</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </>
              )}

            </div>
        </div>
      </div>
    </div>
    </div>
  );
}
