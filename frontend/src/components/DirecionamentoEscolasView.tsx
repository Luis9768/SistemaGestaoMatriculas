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
    <div className="direcionamento-original-scale min-h-screen lg:h-screen lg:max-h-screen bg-[#F1F5F9] dark:bg-[#000000] text-slate-900 dark:text-zinc-100 flex flex-col justify-between font-sans transition-colors duration-200 relative overflow-x-hidden overflow-y-auto lg:overflow-hidden">
      {/* Top Header Institucional Integrado */}
      <GraffitiBannerHeader onLogout={onLogout} />

      {/* Conteúdo Principal (Calibrado para caber perfeitamente na tela de notebooks com o acordeão teatral) */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-5 lg:py-3.5 xl:py-6 flex flex-col justify-between min-h-0 relative z-10">
        {/* ─── CABEÇALHO EDITORIAL ─── */}
        <section className="mb-2.5 sm:mb-4 lg:mb-3 xl:mb-6 shrink-0">
          <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between pb-2 sm:pb-3 border-b border-slate-200/90 dark:border-slate-800/90 gap-1.5 sm:gap-4">
            <div>
              <motion.h1
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, ease: [0.2, 0.8, 0.2, 1] }}
                className="font-sans text-2xl sm:text-3xl lg:text-3xl xl:text-5xl font-black tracking-tight leading-tight text-slate-900 dark:text-white"
              >
                Rede de Escolas Livres
              </motion.h1>
            </div>
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.08, ease: [0.2, 0.8, 0.2, 1] }}
              className="text-xs sm:text-sm lg:text-sm xl:text-base text-slate-600 dark:text-slate-400 font-medium"
            >
              Olá, <span className="text-slate-900 dark:text-white font-semibold">{primeiroNome}</span>. Por onde começamos?
            </motion.p>
          </div>
        </section>

        {/* ─── CORTINAS TEATRAIS: OS 4 PAINÉIS EXPANSÍVEIS (FLEX ACCORDION) ─── */}
        <section
          aria-label="Unidades das Escolas Livres"
          className="flex flex-col lg:flex-row gap-2.5 sm:gap-3.5 lg:gap-3 xl:gap-4 flex-1 min-h-[440px] sm:min-h-[480px] lg:min-h-0 w-full"
          onMouseLeave={() => setHoveredSigla(null)}
        >
          {escolasRender.map((escola, index) => {
            const siglaUpper = escola.sigla.toUpperCase();
            const config = THEATRICAL_CONFIG[siglaUpper] || THEATRICAL_CONFIG.ELT;

            const isExpanded = hoveredSigla === siglaUpper;
            const hasAnyHover = hoveredSigla !== null;

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
                initial={{ opacity: 0, y: 25 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.5,
                  delay: 0.1 + index * 0.06,
                  ease: [0.2, 0.8, 0.2, 1],
                }}
                onMouseEnter={() => setHoveredSigla(siglaUpper)}
                onFocus={() => setHoveredSigla(siglaUpper)}
                onClick={() => isPermitido && onSelecionarEscola(escola.id)}
                tabIndex={isPermitido ? 0 : -1}
                aria-label={`Unidade ${config.nome}`}
                className={`relative rounded-2xl lg:rounded-3xl p-4 sm:p-5 lg:p-4.5 xl:p-6 flex flex-col justify-between overflow-hidden border transition-all duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)] select-none ${
                  config.panelClass
                } ${config.borderClass} ${
                  isExpanded
                    ? 'lg:flex-[2.8] shadow-2xl'
                    : hasAnyHover
                    ? 'lg:flex-[0.8] opacity-80'
                    : 'lg:flex-1 shadow-xs'
                } ${
                  isPermitido
                    ? 'cursor-pointer focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-current outline-none'
                    : 'opacity-50 saturate-50 cursor-not-allowed'
                }`}
              >
                {/* ─── SIGLA GIGANTE EM OUTLINE RECORTE EDITORIAL ─── */}
                <span
                  aria-hidden="true"
                  className={`absolute -right-2 sm:-right-3 -bottom-4 sm:-bottom-6 font-sans text-6xl sm:text-7xl lg:text-7xl xl:text-9xl font-black tracking-tighter leading-none pointer-events-none select-none transition-transform duration-700 ease-[cubic-bezier(0.2,0.8,0.2,1)] ${
                    config.monogramColor
                  } ${isExpanded ? 'translate-x-0 scale-105' : 'translate-x-2 scale-95'}`}
                >
                  {config.sigla}
                </span>

                {/* ─── TOPO DO PAINEL: SIGLA, STATUS E TÍTULO ─── */}
                <div className="relative z-10 flex flex-col">
                  <div className="flex items-center justify-between gap-2 mb-2 sm:mb-3">
                    <span className="font-sans text-xl sm:text-2xl xl:text-3xl font-black tracking-tight">
                      {config.sigla}
                    </span>

                    {isEncarregada && (
                      <div>
                        {isPermitido ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            <CheckCircle2 className="w-2.5 h-2.5" />
                            Autorizada
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-white/10 text-white/70 border border-white/15">
                            <Lock className="w-2.5 h-2.5" />
                            Restrito
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <h2 className="font-sans text-base sm:text-lg lg:text-base xl:text-xl font-black tracking-tight leading-snug line-clamp-2">
                    {config.nome}
                  </h2>
                  <p className="text-[11px] sm:text-xs font-semibold tracking-wide opacity-75 mt-0.5 line-clamp-1">
                    {config.subtitulo}
                  </p>

                  {/* Descrição Completa (Revelada suavemente quando expandido no desktop ou no mobile) */}
                  <div
                    className={`text-xs sm:text-[13px] leading-relaxed opacity-90 transition-all duration-300 ${
                      isExpanded
                        ? 'mt-2.5 sm:mt-3 max-h-36 sm:max-h-44 opacity-100 overflow-y-auto pr-1'
                        : 'lg:max-h-0 lg:opacity-0 lg:overflow-hidden mt-0'
                    }`}
                  >
                    <p>{config.descricao}</p>

                    <div className="flex items-center gap-1.5 text-xs opacity-80 mt-2.5 pt-2.5 border-t border-current/15">
                      <MapPin className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{config.sede}</span>
                    </div>
                  </div>
                </div>

                {/* ─── BASE DO PAINEL: NÚMEROS COM HIERARQUIA & CTA ─── */}
                <div className="relative z-10 pt-2 sm:pt-4 mt-auto">
                  {/* Destaque Principal: VAGAS */}
                  <div className="mb-2 sm:mb-3">
                    <div className="flex items-baseline gap-2">
                      <span
                        className={`font-mono text-2xl sm:text-3xl lg:text-3xl xl:text-5xl font-black tracking-tight leading-none ${config.vagasColor}`}
                      >
                        {vagasCount}
                      </span>
                      <span className="text-xs sm:text-sm font-semibold opacity-80">
                        vagas ofertadas
                      </span>
                    </div>

                    <div className="text-[11px] sm:text-xs font-mono opacity-70 mt-0.5 sm:mt-1">
                      {turmasCount} {turmasCount === 1 ? 'turma' : 'turmas'} <span className="opacity-40">·</span> {cursosCount} {cursosCount === 1 ? 'curso ativo' : 'cursos ativos'}
                    </div>
                  </div>

                  {/* Botão de Entrada Tátil */}
                  <div
                    className={`transition-all duration-300 ${
                      isExpanded ? 'opacity-100 translate-y-0' : 'lg:opacity-90'
                    }`}
                  >
                    <button
                      type="button"
                      disabled={!isPermitido}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (isPermitido) onSelecionarEscola(escola.id);
                      }}
                      className={`w-full py-2 sm:py-2.5 xl:py-3 px-3 sm:px-4 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 flex items-center justify-between shadow-xs active:scale-98 cursor-pointer ${
                        config.btnClass
                      }`}
                    >
                      <span className="truncate">Entrar no Palco {config.sigla}</span>
                      <ArrowRight className="w-4 h-4 shrink-0 transition-transform duration-200 group-hover:translate-x-1.5" />
                    </button>
                  </div>
                </div>
              </motion.article>
            );
          })}
        </section>

        {/* ─── RODAPÉ INSTITUCIONAL DISCRETO ─── */}
        <footer className="mt-2.5 sm:mt-4 lg:mt-2.5 xl:mt-4 pt-2 sm:pt-3 border-t border-slate-200/90 dark:border-slate-800/90 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 shrink-0">
          <div className="flex items-center gap-2.5">
            <Image
              src="/logo_santo_andre.png"
              alt="Brasão Oficial do Município de Santo André"
              width={26}
              height={36}
              className="h-6 sm:h-7 w-auto object-contain drop-shadow-xs dark:brightness-110"
            />
            <span>
              Prefeitura de Santo André • Secretaria de Cultura • SIGMA
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setModalLgpdAberto(true)}
              type="button"
              className="hover:underline cursor-pointer flex items-center gap-1"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
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
  );
}
