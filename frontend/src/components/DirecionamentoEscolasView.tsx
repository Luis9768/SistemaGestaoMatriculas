'use client';

import React from 'react';
import Image from 'next/image';
import {
  Theater,
  Music,
  Film,
  Palette,
  Lock,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  LogOut,
  Building2,
  Sparkles,
  BookOpen,
  Users,
  Calendar,
} from 'lucide-react';
import { Escola, Curso, Turma, Matricula, LoginResponse } from '@/lib/api';
import { ThemeToggle } from '@/components/ThemeToggle';
import { GraffitiBannerHeader } from '@/components/GraffitiBannerHeader';

interface DirecionamentoEscolasViewProps {
  usuarioLogado: LoginResponse;
  escolas: Escola[];
  cursos: Curso[];
  turmas: Turma[];
  matriculas: Matricula[];
  tempoRestanteMin: number;
  onSelecionarEscola: (escolaId: number) => void;
  onLogout: () => void;
}

interface EscolaConfig {
  sigla: string;
  nome: string;
  subtitulo: string;
  descricao: string;
  icone: React.ComponentType<{ className?: string }>;
  tagline: string;
  cores: {
    gradienteLight: string;
    gradienteDark: string;
    bordaLight: string;
    bordaDark: string;
    badgeLight: string;
    badgeDark: string;
    iconeBgLight: string;
    iconeBgDark: string;
    iconeCor: string;
    glowLight: string;
    glowDark: string;
    btnGradiente: string;
  };
}

const ESCOLAS_CONFIG: Record<string, EscolaConfig> = {
  ELT: {
    sigla: 'ELT',
    nome: 'Escola Livre de Teatro',
    subtitulo: 'Artes Cênicas & Dramaturgia',
    descricao: 'Referência nacional na formação teatral pública, experimentação cênica e pedagogia colaborativa.',
    icone: Theater,
    tagline: 'Palco, Dramaturgia & Expressão Crítica',
    cores: {
      gradienteLight: 'from-violet-500/10 via-purple-500/5 to-transparent',
      gradienteDark: 'from-violet-950/40 via-purple-950/20 to-transparent',
      bordaLight: 'border-violet-200 hover:border-violet-400',
      bordaDark: 'border-violet-900/60 hover:border-violet-500/60',
      badgeLight: 'bg-violet-100 text-violet-800 border-violet-200',
      badgeDark: 'bg-violet-950/70 text-violet-300 border-violet-800/60',
      iconeBgLight: 'bg-violet-600 text-white shadow-violet-500/25',
      iconeBgDark: 'bg-violet-600 text-white shadow-violet-950/50',
      iconeCor: 'text-violet-600 dark:text-violet-400',
      glowLight: 'bg-violet-400/15',
      glowDark: 'bg-violet-600/15',
      btnGradiente: 'from-violet-600 to-purple-700 hover:from-purple-700 hover:to-violet-600',
    },
  },
  ELD: {
    sigla: 'ELD',
    nome: 'Escola Livre de Dança',
    subtitulo: 'Linguagens Corporais & Coreografia',
    descricao: 'Pesquisa continuada em dança contemporânea, consciência corporal e investigação do movimento.',
    icone: Music,
    tagline: 'Corpo em Movimento & Dança Contemporânea',
    cores: {
      gradienteLight: 'from-rose-500/10 via-pink-500/5 to-transparent',
      gradienteDark: 'from-rose-950/40 via-pink-950/20 to-transparent',
      bordaLight: 'border-rose-200 hover:border-rose-400',
      bordaDark: 'border-rose-900/60 hover:border-rose-500/60',
      badgeLight: 'bg-rose-100 text-rose-800 border-rose-200',
      badgeDark: 'bg-rose-950/70 text-rose-300 border-rose-800/60',
      iconeBgLight: 'bg-rose-600 text-white shadow-rose-500/25',
      iconeBgDark: 'bg-rose-600 text-white shadow-rose-950/50',
      iconeCor: 'text-rose-600 dark:text-rose-400',
      glowLight: 'bg-rose-400/15',
      glowDark: 'bg-rose-600/15',
      btnGradiente: 'from-rose-600 to-pink-700 hover:from-pink-700 hover:to-rose-600',
    },
  },
  ELCV: {
    sigla: 'ELCV',
    nome: 'Escola Livre de Cinema e Vídeo',
    subtitulo: 'Produção Audiovisual & Roteiro',
    descricao: 'Formação técnica e estética em direção cinematográfica, fotografia, som, montagem e pós-produção.',
    icone: Film,
    tagline: 'Sétima Arte, Direção, Fotografia & Som',
    cores: {
      gradienteLight: 'from-sky-500/10 via-blue-500/5 to-transparent',
      gradienteDark: 'from-sky-950/40 via-blue-950/20 to-transparent',
      bordaLight: 'border-sky-200 hover:border-sky-400',
      bordaDark: 'border-sky-900/60 hover:border-sky-500/60',
      badgeLight: 'bg-sky-100 text-sky-800 border-sky-200',
      badgeDark: 'bg-sky-950/70 text-sky-300 border-sky-800/60',
      iconeBgLight: 'bg-sky-600 text-white shadow-sky-500/25',
      iconeBgDark: 'bg-sky-600 text-white shadow-sky-950/50',
      iconeCor: 'text-sky-600 dark:text-sky-400',
      glowLight: 'bg-sky-400/15',
      glowDark: 'bg-sky-600/15',
      btnGradiente: 'from-sky-600 to-blue-700 hover:from-blue-700 hover:to-sky-600',
    },
  },
  ELIA: {
    sigla: 'ELIA',
    nome: 'Escola Livre de Iniciação Artística',
    subtitulo: 'Multidisciplinaridade • Crianças & Jovens',
    descricao: 'Estímulo à sensibilidade poética e vivências artísticas integradas organizadas por faixas etárias.',
    icone: Palette,
    tagline: 'Infância, Juventude & Experimentação Artística',
    cores: {
      gradienteLight: 'from-amber-500/10 via-orange-500/5 to-transparent',
      gradienteDark: 'from-amber-950/40 via-orange-950/20 to-transparent',
      bordaLight: 'border-amber-200 hover:border-amber-400',
      bordaDark: 'border-amber-900/60 hover:border-amber-500/60',
      badgeLight: 'bg-amber-100 text-amber-800 border-amber-200',
      badgeDark: 'bg-amber-950/70 text-amber-300 border-amber-800/60',
      iconeBgLight: 'bg-amber-600 text-white shadow-amber-500/25',
      iconeBgDark: 'bg-amber-600 text-white shadow-amber-950/50',
      iconeCor: 'text-amber-600 dark:text-amber-400',
      glowLight: 'bg-amber-400/15',
      glowDark: 'bg-amber-600/15',
      btnGradiente: 'from-amber-600 to-orange-700 hover:from-orange-700 hover:to-amber-600',
    },
  },
};

export function DirecionamentoEscolasView({
  usuarioLogado,
  escolas,
  cursos,
  turmas,
  matriculas,
  tempoRestanteMin,
  onSelecionarEscola,
  onLogout,
}: DirecionamentoEscolasViewProps) {
  const isAdmin = usuarioLogado.role === 'ROLE_ADMIN';

  // Verifica se a analista/usuário tem liberação de acesso para a escola fornecida
  const isEscolaLiberada = (escola: Escola): boolean => {
    if (isAdmin) return true;
    if (usuarioLogado.escolaId && escola.id === usuarioLogado.escolaId) return true;
    if (
      usuarioLogado.escolaSigla &&
      escola.sigla &&
      usuarioLogado.escolaSigla.toUpperCase() === escola.sigla.toUpperCase()
    ) {
      return true;
    }
    return false;
  };

  // Garante a lista das 4 escolas principais mesmo se a API ainda estiver carregando
  const escolasRender =
    escolas.length >= 4
      ? escolas
      : [
          { id: 1, sigla: 'ELT', nome: 'Escola Livre de Teatro', corTema: 'violet' },
          { id: 2, sigla: 'ELD', nome: 'Escola Livre de Dança', corTema: 'rose' },
          { id: 3, sigla: 'ELCV', nome: 'Escola Livre de Cinema e Vídeo', corTema: 'blue' },
          { id: 4, sigla: 'ELIA', nome: 'Escola Livre de Iniciação Artística', corTema: 'amber' },
        ];

  return (
    <div className="min-h-screen bg-[#FAF9F7] dark:bg-[#090D16] text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      {/* Banner Urbano Estilizado Inspirado em Arte Graffiti — Mantém o Sol (ThemeToggle) e remove elementos burocráticos */}
      <GraffitiBannerHeader onLogout={onLogout} />

      {/* Conteúdo Principal — Hub de Direcionamento */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8 py-8 sm:py-12 flex flex-col justify-center">
        {/* Saudação Obrigatória no Canto Superior Esquerdo */}
        <div className="mb-8 sm:mb-10 text-left">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/50 text-amber-800 dark:text-amber-300 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span>Portal de Gestão Integrada</span>
            </div>

            {/* Card com Usuário Ativo e Botão Rápido para Trocar de Conta / Sair */}
            <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
              <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-amber-600 to-rose-600 flex items-center justify-center text-white text-[11px] font-black shrink-0">
                {usuarioLogado.nome.charAt(0).toUpperCase()}
              </div>
              <div className="flex flex-col text-left">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-tight">
                  {usuarioLogado.nome}
                </span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
                  {isAdmin ? 'Coordenação Geral' : `Analista • ${usuarioLogado.escolaSigla || 'Escola'}`}
                </span>
              </div>
              <button
                type="button"
                onClick={onLogout}
                className="ml-2 px-2.5 py-1 rounded-lg bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 dark:hover:bg-rose-900/60 border border-rose-200 dark:border-rose-800/80 text-rose-700 dark:text-rose-300 text-[11px] font-bold transition flex items-center gap-1 cursor-pointer"
                title="Sair desta conta ou fazer login com outro usuário"
              >
                <LogOut className="w-3 h-3 text-rose-500" />
                <span>Trocar de Conta</span>
              </button>
            </div>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
            Olá, {usuarioLogado.nome}.
          </h1>

          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mt-2 max-w-2xl font-normal leading-relaxed">
            {isAdmin ? (
              <>
                Como <strong>Coordenação Geral</strong>, você tem acesso irrestrito a todas as 4 Escolas Livres. Selecione a unidade que deseja gerenciar:
              </>
            ) : (
              <>
                Seu perfil está vinculado como <strong>Analista / Encarregada</strong>. O acesso está liberado para a sua unidade designada de atuação:
              </>
            )}
          </p>
        </div>

        {/* Grade Bento dos 4 Campos das Escolas Livres */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
          {escolasRender.map((escola) => {
            const siglaUpper = escola.sigla.toUpperCase();
            const config = ESCOLAS_CONFIG[siglaUpper] || {
              sigla: escola.sigla,
              nome: escola.nome,
              subtitulo: 'Unidade Cultural',
              descricao: escola.descricao || 'Escola Livre da Secretaria de Cultura.',
              icone: Building2,
              tagline: 'Formação Artística e Cultural',
              cores: ESCOLAS_CONFIG.ELT.cores,
            };

            const IconeComponent = config.icone;
            const liberada = isEscolaLiberada(escola);

            // Contadores contextuais da escola
            const cursosCount = cursos.filter(
              (c) => c.escolaId === escola.id || c.escolaSigla?.toUpperCase() === siglaUpper
            ).length;
            const turmasCount = turmas.filter(
              (t) => t.escolaId === escola.id || t.escolaSigla?.toUpperCase() === siglaUpper
            ).length;
            const matriculasCount = matriculas.filter(
              (m) => m.escolaId === escola.id || m.escolaSigla?.toUpperCase() === siglaUpper
            ).length;

            return (
              <div
                key={escola.id}
                className={`relative rounded-3xl p-6 sm:p-7 flex flex-col justify-between transition-all duration-300 border ${
                  liberada
                    ? `bg-white dark:bg-[#0F1629] ${config.cores.bordaLight} ${config.cores.bordaDark} shadow-md hover:shadow-xl hover:-translate-y-1 group`
                    : 'bg-slate-100/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800/80 opacity-60 cursor-not-allowed select-none'
                }`}
              >
                {/* Aura de Cor Sutil ao Fundo */}
                {liberada && (
                  <div
                    className={`absolute -top-10 -right-10 w-44 h-44 rounded-full ${config.cores.glowLight} dark:${config.cores.glowDark} blur-3xl pointer-events-none group-hover:scale-125 transition-transform duration-500`}
                    aria-hidden="true"
                  />
                )}

                <div>
                  {/* Topo do Card: Badge de Liberação / Restrição e Sigla */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                        {config.sigla}
                      </span>
                      <span className="text-xs text-slate-400 dark:text-slate-500">•</span>
                      <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                        {config.subtitulo}
                      </span>
                    </div>

                    {/* Status de Acesso */}
                    {liberada ? (
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider border ${config.cores.badgeLight} dark:${config.cores.badgeDark}`}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{isAdmin ? 'Acesso Total' : 'Acesso Liberado'}</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-300 dark:border-slate-700">
                        <Lock className="w-3.5 h-3.5 text-slate-500" />
                        <span>Acesso Restrito</span>
                      </span>
                    )}
                  </div>

                  {/* Nome da Escola e Ícone */}
                  <div className="flex items-start gap-4 mb-3">
                    <div
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-md ${
                        liberada
                          ? `${config.cores.iconeBgLight} dark:${config.cores.iconeBgDark}`
                          : 'bg-slate-300 dark:bg-slate-800 text-slate-500 dark:text-slate-400 shadow-none'
                      }`}
                    >
                      <IconeComponent className="w-6 h-6" />
                    </div>

                    <div>
                      <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white leading-snug">
                        {config.nome}
                      </h2>
                      <p className="text-xs font-medium text-amber-700 dark:text-amber-400 mt-0.5">
                        {config.tagline}
                      </p>
                    </div>
                  </div>

                  {/* Descrição */}
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-5">
                    {config.descricao}
                  </p>

                  {/* Mini-Indicadores Operacionais */}
                  {liberada && (
                    <div className="grid grid-cols-3 gap-2 py-3 px-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-700/50 mb-5">
                      <div className="text-center">
                        <span className="block text-base sm:text-lg font-black text-slate-800 dark:text-slate-100">
                          {cursosCount || 2}
                        </span>
                        <span className="block text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase">
                          Cursos
                        </span>
                      </div>
                      <div className="text-center border-x border-slate-200 dark:border-slate-700/60">
                        <span className="block text-base sm:text-lg font-black text-slate-800 dark:text-slate-100">
                          {turmasCount || 4}
                        </span>
                        <span className="block text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase">
                          Turmas
                        </span>
                      </div>
                      <div className="text-center">
                        <span className="block text-base sm:text-lg font-black text-slate-800 dark:text-slate-100">
                          {matriculasCount || 60}
                        </span>
                        <span className="block text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase">
                          Vagas
                        </span>
                      </div>
                    </div>
                  )}

                  {!liberada && (
                    <div className="py-2.5 px-3.5 rounded-xl bg-slate-200/60 dark:bg-slate-800/40 border border-slate-300/60 dark:border-slate-700/40 mb-5 flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs">
                      <Lock className="w-4 h-4 shrink-0 text-slate-400" />
                      <span>Exclusivo para a analista designada a esta escola.</span>
                    </div>
                  )}
                </div>

                {/* Botão de Ação / Entrada na Escola */}
                <div>
                  {liberada ? (
                    <button
                      type="button"
                      onClick={() => onSelecionarEscola(escola.id)}
                      className={`w-full py-3.5 px-4 rounded-xl text-white font-bold text-xs sm:text-sm shadow-md transition-all duration-300 cursor-pointer flex items-center justify-center gap-2 bg-gradient-to-r ${config.cores.btnGradiente} active:scale-[0.99]`}
                    >
                      <span>Acessar Gestão da {config.sigla}</span>
                      <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled
                      className="w-full py-3.5 px-4 rounded-xl text-slate-400 dark:text-slate-500 bg-slate-200 dark:bg-slate-800 font-bold text-xs sm:text-sm border border-slate-300/60 dark:border-slate-700 cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      <Lock className="w-4 h-4 text-slate-400" />
                      <span>Acesso Restrito à Unidade</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Rodapé Informativo Institucional */}
        <div className="mt-10 sm:mt-12 text-center border-t border-slate-200/80 dark:border-slate-800/80 pt-6">
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Prefeitura Municipal de Santo André • Secretaria de Cultura • Sistema Integrado de Matrículas e Frequência
          </p>
        </div>
      </main>
    </div>
  );
}
