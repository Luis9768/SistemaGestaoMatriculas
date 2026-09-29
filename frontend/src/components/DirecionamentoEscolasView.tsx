'use client';

import React from 'react';
import {
  Theater,
  Music,
  Film,
  Palette,
  Lock,
  ArrowRight,
  CheckCircle2,
  LogOut,
  Building2,
} from 'lucide-react';
import { Escola, Curso, Turma, Matricula, LoginResponse } from '@/lib/api';
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
  tagEstilo: string;
  iconeEstilo: string;
}

const ESCOLAS_CONFIG: Record<string, EscolaConfig> = {
  ELT: {
    sigla: 'ELT',
    nome: 'Escola Livre de Teatro',
    subtitulo: 'Artes Cênicas & Dramaturgia',
    descricao: 'Referência nacional na formação teatral pública, experimentação cênica e pedagogia colaborativa.',
    icone: Theater,
    tagline: 'Palco, Dramaturgia & Expressão Crítica',
    tagEstilo: 'bg-[#F3E8FF] text-[#6B21A8] dark:bg-purple-950/40 dark:text-purple-300 border border-purple-200 dark:border-purple-800/40',
    iconeEstilo: 'bg-[#F3E8FF] text-[#6B21A8] dark:bg-purple-950/50 dark:text-purple-300',
  },
  ELD: {
    sigla: 'ELD',
    nome: 'Escola Livre de Dança',
    subtitulo: 'Linguagens Corporais & Coreografia',
    descricao: 'Pesquisa continuada em dança contemporânea, consciência corporal e investigação do movimento.',
    icone: Music,
    tagline: 'Corpo em Movimento & Dança Contemporânea',
    tagEstilo: 'bg-[#FFE4E6] text-[#9F1239] dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 dark:border-rose-800/40',
    iconeEstilo: 'bg-[#FFE4E6] text-[#9F1239] dark:bg-rose-950/50 dark:text-rose-300',
  },
  ELCV: {
    sigla: 'ELCV',
    nome: 'Escola Livre de Cinema e Vídeo',
    subtitulo: 'Produção Audiovisual & Roteiro',
    descricao: 'Formação técnica e estética em direção cinematográfica, fotografia, som, montagem e pós-produção.',
    icone: Film,
    tagline: 'Sétima Arte, Direção, Fotografia & Som',
    tagEstilo: 'bg-[#E0F2FE] text-[#0369A1] dark:bg-sky-950/40 dark:text-sky-300 border border-sky-200 dark:border-sky-800/40',
    iconeEstilo: 'bg-[#E0F2FE] text-[#0369A1] dark:bg-sky-950/50 dark:text-sky-300',
  },
  ELIA: {
    sigla: 'ELIA',
    nome: 'Escola Livre de Iniciação Artística',
    subtitulo: 'Multidisciplinaridade • Crianças & Jovens',
    descricao: 'Estímulo à sensibilidade poética e vivências artísticas integradas organizadas por faixas etárias.',
    icone: Palette,
    tagline: 'Infância, Juventude & Experimentação Artística',
    tagEstilo: 'bg-[#FEF3C7] text-[#92400E] dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200 dark:border-amber-800/40',
    iconeEstilo: 'bg-[#FEF3C7] text-[#92400E] dark:bg-amber-950/50 dark:text-amber-300',
  },
};

export function DirecionamentoEscolasView({
  usuarioLogado,
  escolas,
  cursos,
  turmas,
  matriculas,
  onSelecionarEscola,
  onLogout,
}: DirecionamentoEscolasViewProps) {
  const isAdmin = usuarioLogado.role === 'ROLE_ADMIN';

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
    <div className="min-h-screen bg-[#FAF9F7] dark:bg-[#090D16] text-[#111111] dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      {/* Top Header Minimalista e Editorial */}
      <GraffitiBannerHeader onLogout={onLogout} />

      {/* Conteúdo Principal — Macro Espaçamento Utilitário */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-8 py-10 sm:py-16 flex flex-col justify-center">
        {/* Saudação no Canto Superior Esquerdo */}
        <div className="mb-10 text-left">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <span className="font-mono text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-medium">
              Portal de Gestão Integrada
            </span>

            {/* Pill com Usuário Ativo e Botão para Trocar de Conta */}
            <div className="inline-flex items-center gap-2.5 px-3 py-1.5 rounded-lg border border-[#EAEAEA] dark:border-slate-800 bg-white dark:bg-[#0E131F] text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {usuarioLogado.nome}
              </span>
              <span className="text-slate-300 dark:text-slate-700">•</span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                {isAdmin ? 'Coordenação Geral' : `Analista • ${usuarioLogado.escolaSigla || 'Escola'}`}
              </span>
              <button
                type="button"
                onClick={onLogout}
                className="ml-2 text-[11px] font-semibold text-rose-600 dark:text-rose-400 hover:underline cursor-pointer flex items-center gap-1"
                title="Sair desta conta"
              >
                <LogOut className="w-3 h-3" />
                <span>Trocar</span>
              </button>
            </div>
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#111111] dark:text-white tracking-tight leading-tight">
            Olá, {usuarioLogado.nome}.
          </h2>

          <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 max-w-2xl font-normal leading-relaxed">
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
              tagEstilo: 'bg-[#F4F4F5] text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700',
              iconeEstilo: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
            };

            const IconeComponent = config.icone;
            const liberada = isEscolaLiberada(escola);

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
                className={`relative rounded-xl p-6 sm:p-7 flex flex-col justify-between transition-all duration-200 border ${
                  liberada
                    ? 'bg-white dark:bg-[#0E131F] border-[#EAEAEA] dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-600'
                    : 'bg-[#FBFBFA] dark:bg-slate-900/30 border-[#EAEAEA] dark:border-slate-800/60 opacity-60 cursor-not-allowed select-none'
                }`}
              >
                <div>
                  {/* Topo do Card: Sigla e Status */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-0.5 rounded-md font-mono text-xs font-bold uppercase tracking-wider ${config.tagEstilo}`}>
                        {config.sigla}
                      </span>
                      <span className="text-xs text-slate-400 dark:text-slate-500">•</span>
                      <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                        {config.subtitulo}
                      </span>
                    </div>

                    {/* Status de Acesso */}
                    {liberada ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#EDF3EC] text-[#346538] dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/40">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>{isAdmin ? 'Acesso Total' : 'Liberado'}</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#F4F4F5] text-slate-500 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                        <Lock className="w-3 h-3 text-slate-400" />
                        <span>Restrito</span>
                      </span>
                    )}
                  </div>

                  {/* Nome da Escola e Ícone */}
                  <div className="flex items-start gap-3.5 mb-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${config.iconeEstilo}`}>
                      <IconeComponent className="w-5 h-5" />
                    </div>

                    <div>
                      <h3 className="text-base sm:text-lg font-bold text-[#111111] dark:text-white leading-snug">
                        {config.nome}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {config.tagline}
                      </p>
                    </div>
                  </div>

                  {/* Descrição */}
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-5">
                    {config.descricao}
                  </p>

                  {/* Mini-Indicadores Operacionais */}
                  {liberada && (
                    <div className="grid grid-cols-3 gap-2 py-2.5 px-3 rounded-lg bg-[#FAF9F7] dark:bg-[#080B12] border border-[#EAEAEA] dark:border-slate-800/70 mb-5">
                      <div className="text-center">
                        <span className="block text-sm font-bold text-slate-900 dark:text-slate-100 font-mono">
                          {cursosCount || 2}
                        </span>
                        <span className="block text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400">
                          Cursos
                        </span>
                      </div>
                      <div className="text-center border-x border-[#EAEAEA] dark:border-slate-800">
                        <span className="block text-sm font-bold text-slate-900 dark:text-slate-100 font-mono">
                          {turmasCount || 4}
                        </span>
                        <span className="block text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400">
                          Turmas
                        </span>
                      </div>
                      <div className="text-center">
                        <span className="block text-sm font-bold text-slate-900 dark:text-slate-100 font-mono">
                          {matriculasCount || 60}
                        </span>
                        <span className="block text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400">
                          Vagas
                        </span>
                      </div>
                    </div>
                  )}

                  {!liberada && (
                    <div className="py-2 px-3 rounded-lg bg-[#F4F4F5] dark:bg-slate-800/40 border border-[#EAEAEA] dark:border-slate-700/40 mb-5 flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs">
                      <Lock className="w-3.5 h-3.5 shrink-0 text-slate-400" />
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
                      className="w-full py-2.5 px-4 rounded-lg bg-[#111111] hover:bg-[#27272A] text-white dark:bg-white dark:text-[#111111] dark:hover:bg-slate-200 text-xs font-semibold transition active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <span>Acessar Gestão da {config.sigla}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled
                      className="w-full py-2.5 px-4 rounded-lg bg-[#F4F4F5] dark:bg-slate-800/60 text-slate-400 dark:text-slate-500 text-xs font-medium border border-[#EAEAEA] dark:border-slate-700/60 flex items-center justify-center gap-2 cursor-not-allowed"
                    >
                      <Lock className="w-3.5 h-3.5 text-slate-400" />
                      <span>Acesso Restrito</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Rodapé Editorial */}
        <div className="mt-12 text-center border-t border-[#EAEAEA] dark:border-slate-800 pt-6">
          <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
            Santo André • Secretaria de Cultura • Gestão de Matrículas e Frequência
          </p>
        </div>
      </main>
    </div>
  );
}
