'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import {
  Theater,
  Music,
  Film,
  Palette,
  Lock,
  ArrowRight,
  Building2,
  ShieldCheck,
} from 'lucide-react';
import { Escola, Curso, Turma, Matricula, LoginResponse } from '@/lib/api';
import { GraffitiBannerHeader } from '@/components/GraffitiBannerHeader';
import { LgpdModal } from '@/components/LgpdModal';

interface DirecionamentoEscolasViewProps {
  usuarioLogado: LoginResponse;
  escolas: Escola[];
  cursos: Curso[];
  turmas: Turma[];
  matriculas?: Matricula[];
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
  iconeEstilo: string;
  accentBar: string;
  hoverGlow: string;
  btnAtivo: string;
}

const ESCOLAS_CONFIG: Record<string, EscolaConfig> = {
  ELT: {
    sigla: 'ELT',
    nome: 'Escola Livre de Teatro',
    subtitulo: 'Artes Cênicas & Dramaturgia',
    descricao: 'Referência nacional na formação teatral pública, experimentação cênica e pedagogia colaborativa.',
    icone: Theater,
    tagline: 'Palco, Dramaturgia & Expressão Crítica',
    iconeEstilo: 'bg-violet-100 text-violet-700 dark:bg-violet-950/60 dark:text-violet-300 ring-4 ring-violet-500/10',
    accentBar: 'bg-gradient-to-r from-violet-600 via-purple-500 to-indigo-600',
    hoverGlow: 'hover:border-violet-400/80 dark:hover:border-violet-500/70 hover:shadow-[0_12px_32px_rgba(139,92,246,0.16)]',
    btnAtivo: 'bg-violet-700 hover:bg-violet-800 text-white dark:bg-violet-600 dark:hover:bg-violet-500 shadow-violet-500/25',
  },
  ELD: {
    sigla: 'ELD',
    nome: 'Escola Livre de Dança',
    subtitulo: 'Linguagens Corporais & Coreografia',
    descricao: 'Pesquisa continuada em dança contemporânea, consciência corporal e investigação continuada do movimento.',
    icone: Music,
    tagline: 'Corpo em Movimento & Dança Contemporânea',
    iconeEstilo: 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 ring-4 ring-rose-500/10',
    accentBar: 'bg-gradient-to-r from-rose-600 via-pink-500 to-red-500',
    hoverGlow: 'hover:border-rose-400/80 dark:hover:border-rose-500/70 hover:shadow-[0_12px_32px_rgba(244,63,94,0.16)]',
    btnAtivo: 'bg-rose-700 hover:bg-rose-800 text-white dark:bg-rose-600 dark:hover:bg-rose-500 shadow-rose-500/25',
  },
  ELCV: {
    sigla: 'ELCV',
    nome: 'Escola Livre de Cinema e Vídeo',
    subtitulo: 'Produção Audiovisual & Roteiro',
    descricao: 'Formação técnica e estética em direção cinematográfica, fotografia, som, montagem e pós-produção.',
    icone: Film,
    tagline: 'Sétima Arte, Direção, Fotografia & Som',
    iconeEstilo: 'bg-sky-100 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300 ring-4 ring-sky-500/10',
    accentBar: 'bg-gradient-to-r from-sky-600 via-cyan-500 to-blue-600',
    hoverGlow: 'hover:border-sky-400/80 dark:hover:border-sky-500/70 hover:shadow-[0_12px_32px_rgba(14,165,233,0.16)]',
    btnAtivo: 'bg-sky-700 hover:bg-sky-800 text-white dark:bg-sky-600 dark:hover:bg-sky-500 shadow-sky-500/25',
  },
  ELIA: {
    sigla: 'ELIA',
    nome: 'Escola Livre de Iniciação Artística',
    subtitulo: 'Multidisciplinaridade • Crianças & Jovens',
    descricao: 'Estímulo à sensibilidade poética e vivências artísticas integradas organizadas por faixas etárias.',
    icone: Palette,
    tagline: 'Infância, Juventude & Experimentação Artística',
    iconeEstilo: 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 ring-4 ring-amber-500/10',
    accentBar: 'bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-500',
    hoverGlow: 'hover:border-amber-400/80 dark:hover:border-amber-500/70 hover:shadow-[0_12px_32px_rgba(245,158,11,0.16)]',
    btnAtivo: 'bg-amber-700 hover:bg-amber-800 text-white dark:bg-amber-600 dark:hover:bg-amber-500 shadow-amber-500/25',
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
  const [modalLgpdAberto, setModalLgpdAberto] = useState(false);
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

  const primeiroNome = usuarioLogado?.nome ? usuarioLogado.nome.trim().split(/\s+/)[0] : 'Coordenação';

  return (
    <div className="min-h-screen bg-[#F6F7F9] dark:bg-[#070A11] text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      {/* Top Header Institucional Minimalista */}
      <GraffitiBannerHeader onLogout={onLogout} />

      {/* Conteúdo Principal */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-8 pt-6 sm:pt-8 md:pt-10 pb-12 sm:pb-16 flex flex-col">
        
        {/* HERO BANNER ARTÍSTICO UNIFICADO COM AMBIENT GLOW */}
        <div className="relative mb-8 sm:mb-10">
          {/* Brilho Ambiente Tridimensional Suave */}
          <div className="absolute -inset-1.5 bg-gradient-to-r from-violet-600/25 via-sky-500/20 to-amber-500/25 rounded-3xl blur-2xl opacity-50 dark:opacity-30 -z-10 pointer-events-none" />

          {/* Container do Banner com Proporção Natural e Cantos Arredondados */}
          <div className="relative w-full aspect-[16/7] sm:aspect-[16/6] md:aspect-[2.3/1] max-h-[380px] rounded-3xl overflow-hidden border border-slate-200/90 dark:border-slate-800 shadow-2xl">
            <Image
              src="/grafite_banner.webp"
              alt="Mural Artístico das Escolas Livres de Santo André: Teatro, Dança, Cinema e Iniciação Artística"
              fill
              priority
              quality={85}
              unoptimized={true}
              className="object-cover object-center"
              sizes="(max-width: 1200px) 100vw, 1200px"
            />

            {/* Sombreamento Escuro na Foto (Camada Completa e Gradiente Cinematográfico) */}
            <div className="absolute inset-0 bg-black/40 pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/50 pointer-events-none" />

            {/* Conteúdo Centralizado Diretamente na Imagem Sombreada */}
            <div className="absolute inset-0 flex items-center justify-center p-4 sm:p-8 text-center select-none z-10">
              {/* Saudação com Tipografia Cursiva e Sombreamento */}
              <h1
                className="font-fighter text-3xl sm:text-5xl md:text-6xl lg:text-7xl text-white font-normal tracking-wide drop-shadow-[0_4px_18px_rgba(0,0,0,0.95)] leading-tight"
                style={{
                  textShadow:
                    '0 3px 6px rgba(0, 0, 0, 1), 0 6px 20px rgba(0, 0, 0, 0.95), 0 12px 36px rgba(0, 0, 0, 0.9)',
                }}
              >
                Seja bem vindo, {primeiroNome}.
              </h1>
            </div>
          </div>
        </div>

        {/* GRADE DOS 4 CAMPOS DAS ESCOLAS LIVRES */}
        <section aria-label="Seleção de Escolas Livres" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {escolasRender.map((escola) => {
            const siglaUpper = escola.sigla.toUpperCase();
            const config = ESCOLAS_CONFIG[siglaUpper] || {
              sigla: escola.sigla,
              nome: escola.nome,
              subtitulo: 'Unidade Cultural',
              descricao: escola.descricao || 'Escola Livre da Secretaria de Cultura.',
              icone: Building2,
              tagline: 'Formação Artística e Cultural',
              iconeEstilo: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 ring-4 ring-slate-500/10',
              accentBar: 'bg-slate-500',
              hoverGlow: 'hover:border-slate-400 dark:hover:border-slate-500',
              btnAtivo: 'bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100',
            };

            const IconeComponent = config.icone;
            const liberada = isEscolaLiberada(escola);

            const cursosCount = cursos.filter(
              (c) => c.escolaId === escola.id || c.escolaSigla?.toUpperCase() === siglaUpper
            ).length;
            const turmasDaEscola = turmas.filter(
              (t) => t.escolaId === escola.id || t.escolaSigla?.toUpperCase() === siglaUpper
            );
            const turmasCount = turmasDaEscola.length;
            const vagasCount = turmasDaEscola.reduce((acc, t) => acc + (t.vagasTotais || 0), 0) || 60;

            return (
              <div
                key={escola.id}
                className={`group relative rounded-3xl p-5 sm:p-5.5 flex flex-col justify-between transition-all duration-300 overflow-hidden border ${
                  liberada
                    ? `bg-white dark:bg-[#0D121F] border-slate-200/90 dark:border-slate-800 shadow-md hover:-translate-y-1.5 ${config.hoverGlow}`
                    : 'bg-slate-50/70 dark:bg-[#0D121F]/60 border-slate-200/70 dark:border-slate-800/60 opacity-75 select-none'
                }`}
              >
                {/* Linha Superior com Cor de Destaque da Escola */}
                <div className={`absolute top-0 left-0 right-0 h-1.5 ${config.accentBar}`} />

                <div>
                  {/* Nome da Escola e Ícone com Container Duplo */}
                  <div className="flex items-start gap-3 mb-3 pt-1">
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-sm transition-transform duration-300 group-hover:scale-105 ${config.iconeEstilo}`}>
                      <IconeComponent className="w-5 h-5" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <h3 className="text-base font-black text-slate-900 dark:text-white leading-snug group-hover:text-slate-800 dark:group-hover:text-slate-100" title={config.nome}>
                        {config.nome}
                      </h3>
                      <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 truncate mt-0.5">
                        {config.subtitulo}
                      </p>
                    </div>
                  </div>

                  {/* Tagline / Resumo Conceitual */}
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-4 line-clamp-2">
                    {config.descricao}
                  </p>

                  {/* Mini-Indicadores Operacionais Compactos */}
                  {liberada ? (
                    <div className="grid grid-cols-3 gap-1.5 py-2 px-3 rounded-2xl bg-slate-50 dark:bg-[#070A11] border border-slate-200/80 dark:border-slate-800/80 mb-4 text-center">
                      <div>
                        <span className="block text-xs font-black text-slate-900 dark:text-slate-100 font-mono">
                          {cursosCount || 2}
                        </span>
                        <span className="block text-[9px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold">
                          Cursos
                        </span>
                      </div>
                      <div className="border-x border-slate-200 dark:border-slate-800">
                        <span className="block text-xs font-black text-slate-900 dark:text-slate-100 font-mono">
                          {turmasCount || 4}
                        </span>
                        <span className="block text-[9px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold">
                          Turmas
                        </span>
                      </div>
                      <div>
                        <span className="block text-xs font-black text-slate-900 dark:text-slate-100 font-mono">
                          {vagasCount}
                        </span>
                        <span className="block text-[9px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold">
                          Vagas
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="py-2.5 px-3 rounded-2xl bg-slate-100/70 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/40 mb-4 flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs">
                      <Lock className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                      <span className="truncate">Acesso reservado à encarregada</span>
                    </div>
                  )}
                </div>

                {/* Botão de Ação / Entrada na Escola */}
                <div className="pt-1">
                  {liberada ? (
                    <button
                      type="button"
                      onClick={() => onSelecionarEscola(escola.id)}
                      className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer shadow-sm hover:shadow-md active:scale-98 ${config.btnAtivo}`}
                    >
                      <span>Acessar {config.sigla}</span>
                      <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-1" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled
                      className="w-full py-2.5 px-4 rounded-xl bg-slate-200/70 dark:bg-slate-800/60 text-slate-400 dark:text-slate-500 text-xs font-medium border border-slate-300/50 dark:border-slate-700/60 flex items-center justify-center gap-1.5 cursor-not-allowed"
                    >
                      <Lock className="w-3.5 h-3.5 text-slate-400" />
                      <span>Restrito à Unidade</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </section>

        {/* RODAPÉ INSTITUCIONAL COM BRASÃO OFICIAL E PROTEÇÃO LGPD */}
        <footer className="mt-14 sm:mt-16 pt-8 pb-4 border-t border-slate-200/90 dark:border-slate-800/90 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3.5">
            <Image
              src="/logo_santo_andre.png"
              alt="Brasão Oficial do Município de Santo André"
              width={42}
              height={60}
              className="h-11 w-auto object-contain drop-shadow-xs dark:brightness-110"
            />
            <div className="flex flex-col text-left">
              <span className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-900 dark:text-slate-100">
                Prefeitura de Santo André
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                Secretaria de Cultura • Sistema Integrado de Gestão de Matrículas (SIGMA)
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 text-center md:text-right">
            <button
              onClick={() => setModalLgpdAberto(true)}
              type="button"
              className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline cursor-pointer"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Diretrizes de Privacidade (LGPD)</span>
            </button>

            <span className="hidden sm:inline text-slate-300 dark:text-slate-700">|</span>

            <div>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 font-medium">
                © {new Date().getFullYear()} Todos os direitos reservados.
              </p>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 font-mono mt-0.5">
                ELT • ELD • ELCV • ELIA
              </p>
            </div>
          </div>
        </footer>
      </main>

      {/* Modal Interativo de LGPD */}
      <LgpdModal
        isOpen={modalLgpdAberto}
        onClose={() => setModalLgpdAberto(false)}
        abaInicial="geral"
      />
    </div>
  );
}
