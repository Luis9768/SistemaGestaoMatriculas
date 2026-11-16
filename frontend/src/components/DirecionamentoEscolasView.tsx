'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowRight,
  ShieldCheck,
  Lock,
  CheckCircle2,
  MapPin,
  Sparkles,
} from 'lucide-react';
import { Escola, Curso, Turma, Matricula, LoginResponse } from '@/lib/api';
import { GraffitiBannerHeader } from '@/components/GraffitiBannerHeader';
import { LgpdModal } from '@/components/LgpdModal';

/* ─── PROPS ─── */
export interface DirecionamentoEscolasViewProps {
  usuarioLogado: LoginResponse;
  escolas: Escola[];
  cursos: Curso[];
  turmas: Turma[];
  matriculas?: Matricula[];
  tempoRestanteMin: number;
  onSelecionarEscola: (escolaId: number | null) => void;
  onLogout: () => void;
}

interface SchoolTheatricalConfig {
  sigla: string;
  nome: string;
  subtitulo: string;
  descricao: string;
  sede: string;
  // Temas terrosos / teatrais por superfície
  panelClass: string;
  borderClass: string;
  monogramColor: string;
  vagasColor: string;
  btnClass: string;
  accentBar: string;
}

const THEATRICAL_CONFIG: Record<string, SchoolTheatricalConfig> = {
  ELT: {
    sigla: 'ELT',
    nome: 'Escola Livre de Teatro',
    subtitulo: 'Artes Cênicas & Dramaturgia',
    descricao:
      'Referência nacional na formação pública continuada de atores, encenadores e dramaturgos. Prática de palco colaborativa, pesquisa autoral e investigação cênica contemporânea.',
    sede: 'Teatro Conchita de Moraes • Santa Teresinha',
    panelClass:
      'bg-[#160a26] text-[#f5f3ff]',
    borderClass:
      'border-[#33175c] hover:border-[#8b5cf6]',
    monogramColor:
      'text-[#a78bfa]/15',
    vagasColor:
      'text-[#c084fc]',
    btnClass:
      'bg-[#6d28d9] hover:bg-[#7c3aed] text-white shadow-xs',
    accentBar: 'bg-[#8b5cf6]',
  },
  ELD: {
    sigla: 'ELD',
    nome: 'Escola Livre de Dança',
    subtitulo: 'Corpo, Movimento & Coreografia',
    descricao:
      'Polo de pesquisa continuada em dança contemporânea e consciência do movimento. Investigação de poéticas corporais, preparação física e criação coreográfica colaborativa.',
    sede: 'Espaço da Dança • Jardim Bela Vista',
    panelClass:
      'bg-[#240615] text-[#fdf2f8]',
    borderClass:
      'border-[#531132] hover:border-[#ec4899]',
    monogramColor:
      'text-[#f472b6]/15',
    vagasColor:
      'text-[#fb7185]',
    btnClass:
      'bg-[#be185d] hover:bg-[#db2777] text-white shadow-xs',
    accentBar: 'bg-[#ec4899]',
  },
  ELCV: {
    sigla: 'ELCV',
    nome: 'Escola Livre de Cinema e Vídeo',
    subtitulo: 'Audiovisual, Roteiro & Fotografia',
    descricao:
      'Formação técnica e estética completa nas etapas da produção cinematográfica: direção, roteiro, fotografia de cena, captação de som direto, montagem e realização de curtas autorais.',
    sede: 'Polo Audiovisual • Vila Gilda',
    panelClass:
      'bg-[#061426] text-[#f0f9ff]',
    borderClass:
      'border-[#132f57] hover:border-[#38bdf8]',
    monogramColor:
      'text-[#38bdf8]/15',
    vagasColor:
      'text-[#38bdf8]',
    btnClass:
      'bg-[#0284c7] hover:bg-[#0ea5e9] text-white shadow-xs',
    accentBar: 'bg-[#38bdf8]',
  },
  EMIA: {
    sigla: 'EMIA',
    nome: 'Escola Municipal de Iniciação Artística',
    subtitulo: 'Multidisciplinaridade • Crianças & Jovens',
    descricao:
      'Sensibilização poética e vivências artísticas integradas por faixa etária. Conexão viva e lúdica entre artes visuais, teatro, música e dança para a infância e juventude.',
    sede: 'Pq. Regional da Criança • Jaçatuba',
    panelClass:
      'bg-[#1f1503] text-[#fefce8]',
    borderClass:
      'border-[#573906] hover:border-[#f59e0b]',
    monogramColor:
      'text-[#fbbf24]/15',
    vagasColor:
      'text-[#fbbf24]',
    btnClass:
      'bg-[#d97706] hover:bg-[#f59e0b] text-slate-950 font-black shadow-xs',
    accentBar: 'bg-[#f59e0b]',
  },
  ELIA: {
    sigla: 'EMIA',
    nome: 'Escola Municipal de Iniciação Artística',
    subtitulo: 'Multidisciplinaridade • Crianças & Jovens',
    descricao:
      'Sensibilização poética e vivências artísticas integradas por faixa etária. Conexão viva e lúdica entre artes visuais, teatro, música e dança para a infância e juventude.',
    sede: 'Pq. Regional da Criança • Jaçatuba',
    panelClass:
      'bg-[#1f1503] text-[#fefce8]',
    borderClass:
      'border-[#573906] hover:border-[#f59e0b]',
    monogramColor:
      'text-[#fbbf24]/15',
    vagasColor:
      'text-[#fbbf24]',
    btnClass:
      'bg-[#d97706] hover:bg-[#f59e0b] text-slate-950 font-black shadow-xs',
    accentBar: 'bg-[#f59e0b]',
  },
};

export function DirecionamentoEscolasView({
  usuarioLogado,
  escolas,
  cursos,
  turmas,
  onSelecionarEscola,
  onLogout,
}: DirecionamentoEscolasViewProps) {
  const [modalLgpdAberto, setModalLgpdAberto] = useState(false);
  const [hoveredSigla, setHoveredSigla] = useState<string | null>(null);

  const isEncarregada = usuarioLogado?.role === 'ROLE_ENCARREGADA';
  const permittedIds: number[] = usuarioLogado?.escolasIds?.length
    ? usuarioLogado.escolasIds
    : (usuarioLogado?.escolas?.map((e) => e.id) || (usuarioLogado?.escolaId ? [usuarioLogado.escolaId] : []));

  const escolasRender =
    escolas.length >= 4
      ? escolas
      : [
          { id: 1, sigla: 'ELT', nome: 'Escola Livre de Teatro', corTema: 'violet' },
          { id: 2, sigla: 'ELD', nome: 'Escola Livre de Dança', corTema: 'rose' },
          { id: 3, sigla: 'ELCV', nome: 'Escola Livre de Cinema e Vídeo', corTema: 'blue' },
          { id: 4, sigla: 'EMIA', nome: 'Escola Municipal de Iniciação Artística', corTema: 'amber' },
        ];

  const primeiroNome = usuarioLogado?.nome ? usuarioLogado.nome.trim().split(/\s+/)[0] : 'Coordenação';

  return (
    <div className="direcionamento-original-scale min-h-screen md:h-screen md:max-h-screen bg-[#F1F5F9] dark:bg-[#000000] text-slate-900 dark:text-zinc-100 flex flex-col justify-between font-sans transition-colors duration-200 relative overflow-x-hidden overflow-y-auto md:overflow-hidden">
      {/* Top Header Institucional Integrado */}
      <GraffitiBannerHeader onLogout={onLogout} />

      {/* Conteúdo Principal (Ajustado dinamicamente para caber 100% na tela de qualquer laptop sem rolagem) */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-4 lg:px-6 py-1.5 sm:py-2 lg:py-2.5 flex flex-col justify-between min-h-0 relative z-10">
        {/* ─── CABEÇALHO EDITORIAL COMPACTO ─── */}
        <section className="mb-1 sm:mb-1.5 shrink-0">
          <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between pb-1 sm:pb-1.5 border-b border-slate-200/90 dark:border-slate-800/90 gap-1 sm:gap-3">
            <div>
              <motion.h1
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, ease: [0.2, 0.8, 0.2, 1] }}
                className="font-sans text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-black tracking-tight leading-tight text-slate-900 dark:text-white"
              >
                Rede de Escolas Livres
              </motion.h1>
            </div>
            <motion.p
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.05, ease: [0.2, 0.8, 0.2, 1] }}
              className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium"
            >
              Olá, <span className="text-slate-900 dark:text-white font-semibold">{primeiroNome}</span>. Por onde começamos?
            </motion.p>
          </div>
        </section>

        {/* ─── OS 4 PAINÉIS DE TAMANHO PADRONIZADO E RESPONSIVO (GRID 4 COLUNAS EM TABLETS E DESKTOPS) ─── */}
        <section
          aria-label="Unidades das Escolas Livres"
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-3 xl:gap-4 w-full flex-1 min-h-0 items-stretch"
        >
          {escolasRender.map((escola, index) => {
            const siglaUpper = escola.sigla.toUpperCase();
            const config = THEATRICAL_CONFIG[siglaUpper] || THEATRICAL_CONFIG.ELT;

            const cursosCount = cursos.filter(
              (c) => c.escolaId === escola.id || c.escolaSigla?.toUpperCase() === siglaUpper
            ).length;
            const turmasDaEscola = turmas.filter(
              (t) => t.escolaId === escola.id || t.escolaSigla?.toUpperCase() === siglaUpper
            );
            const turmasCount = turmasDaEscola.length;
            const vagasCount = turmasDaEscola.reduce((acc, t) => acc + (t.vagasTotais || 0), 0);

            const isPermitido = !isEncarregada || permittedIds.includes(escola.id);

            return (
              <motion.article
                key={escola.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.35,
                  delay: 0.06 + index * 0.04,
                  ease: [0.2, 0.8, 0.2, 1],
                }}
                onClick={() => isPermitido && onSelecionarEscola(escola.id)}
                tabIndex={isPermitido ? 0 : -1}
                aria-label={`Unidade ${config.nome}`}
                className={`group relative rounded-2xl lg:rounded-3xl p-3 sm:p-3.5 xl:p-4.5 flex flex-col justify-between overflow-hidden border transition-all duration-300 ease-out select-none h-full ${
                  config.panelClass
                } ${config.borderClass} ${
                  isPermitido
                    ? 'cursor-pointer hover:-translate-y-1 hover:shadow-2xl focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-current outline-none'
                    : 'opacity-50 saturate-50 cursor-not-allowed'
                }`}
              >
                {/* ─── SIGLA GIGANTE EM MARCA D'ÁGUA DE FUNDO ─── */}
                <span
                  aria-hidden="true"
                  className={`absolute -right-2 sm:-right-3 -bottom-4 sm:-bottom-5 font-sans text-6xl sm:text-7xl lg:text-8xl xl:text-9xl font-black tracking-tighter leading-none pointer-events-none select-none transition-transform duration-500 ease-out ${
                    config.monogramColor
                  } group-hover:scale-105 group-hover:opacity-30`}
                >
                  {config.sigla}
                </span>

                {/* ─── TOPO DO PAINEL: SIGLA, STATUS E TÍTULO ─── */}
                <div className="relative z-10 flex flex-col">
                  <div className="flex items-center justify-between gap-2 mb-0.5 sm:mb-1">
                    <span className="font-sans text-lg sm:text-xl font-black tracking-tight">
                      {config.sigla}
                    </span>

                    {isEncarregada && (
                      <div>
                        {isPermitido ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            <CheckCircle2 className="w-2.5 h-2.5" />
                            Autorizada
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-white/10 text-white/70 border border-white/15">
                            <Lock className="w-2.5 h-2.5" />
                            Restrito
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <h2 className="font-sans text-sm sm:text-base xl:text-lg font-black tracking-tight leading-snug line-clamp-2 min-h-[2.25rem] sm:min-h-[2.5rem] flex items-center">
                    {config.nome}
                  </h2>
                  <p className="text-[11px] sm:text-xs font-semibold tracking-wide opacity-80 mt-0.5 line-clamp-1">
                    {config.subtitulo}
                  </p>

                  {/* Descrição legível e calibrada para as encarregadas */}
                  <p className="mt-1 sm:mt-1.5 text-xs sm:text-[13px] leading-relaxed opacity-90 line-clamp-2 sm:line-clamp-3">
                    {config.descricao}
                  </p>

                  {/* Sede com ícone */}
                  <div className="flex items-center gap-1.5 text-[11px] sm:text-xs opacity-80 mt-1 sm:mt-1.5 pt-1 sm:pt-1.5 border-t border-current/15">
                    <MapPin className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{config.sede}</span>
                  </div>
                </div>

                {/* ─── BASE DO PAINEL: NÚMEROS COM HIERARQUIA & CTA ─── */}
                <div className="relative z-10 pt-1.5 sm:pt-2 mt-auto">
                  {/* Destaque Principal: VAGAS + TURMAS EM LINHA COMPACTA */}
                  <div className="flex items-baseline justify-between gap-1 mb-1.5 sm:mb-2">
                    <div className="flex items-baseline gap-1.5 shrink-0">
                      <span
                        className={`font-mono text-xl sm:text-2xl font-black tracking-tight leading-none ${config.vagasColor}`}
                      >
                        {vagasCount}
                      </span>
                      <span className="text-xs sm:text-sm font-semibold opacity-85">
                        vagas
                      </span>
                    </div>

                    <div className="text-[10px] sm:text-xs font-mono opacity-75 text-right whitespace-nowrap">
                      {turmasCount} {turmasCount === 1 ? 'turma' : 'turmas'} · {cursosCount} {cursosCount === 1 ? 'curso' : 'cursos'}
                    </div>
                  </div>

                  {/* Botão de Entrada Tátil */}
                  <div>
                    <button
                      type="button"
                      disabled={!isPermitido}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (isPermitido) onSelecionarEscola(escola.id);
                      }}
                      className={`w-full py-2 sm:py-2.5 px-2.5 sm:px-3 xl:px-3.5 rounded-xl text-xs xl:text-sm font-bold transition-all duration-200 flex items-center justify-between shadow-xs active:scale-98 cursor-pointer ${
                        config.btnClass
                      }`}
                    >
                      <span className="truncate">Entrar no Palco {config.sigla}</span>
                      <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 transition-transform duration-200 group-hover:translate-x-1" />
                    </button>
                  </div>
                </div>
              </motion.article>
            );
          })}
        </section>

        {/* ─── RODAPÉ INSTITUCIONAL DISCRETO ─── */}
        <footer className="mt-1 sm:mt-1.5 pt-1 sm:pt-1.5 border-t border-slate-200/90 dark:border-slate-800/90 flex flex-col sm:flex-row items-center justify-between gap-1.5 sm:gap-2 text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 shrink-0">
          <div className="flex items-center gap-2">
            <Image
              src="/logo_santo_andre.png"
              alt="Brasão Oficial do Município de Santo André"
              width={20}
              height={28}
              className="h-5 sm:h-5.5 w-auto object-contain drop-shadow-xs dark:brightness-110"
            />
            <span className="text-[10px] sm:text-xs">
              Prefeitura de Santo André • Secretaria de Cultura • SIGMA
            </span>
          </div>

          <div className="flex items-center gap-2.5 text-[10px] sm:text-xs">
            <button
              onClick={() => setModalLgpdAberto(true)}
              type="button"
              className="hover:underline cursor-pointer flex items-center gap-1"
            >
              <ShieldCheck className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              <span>Privacidade & LGPD</span>
            </button>
            <span className="opacity-40">·</span>
            <span className="font-mono">ELT · ELD · ELCV · EMIA</span>
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
  );}
