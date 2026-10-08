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
      'bg-[#240A18] text-[#F3E5EC]',
    borderClass:
      'border-[#3D132A] hover:border-[#7D2453]',
    monogramColor:
      'text-[#E7B8D1]/10',
    vagasColor:
      'text-[#EBB5D0]',
    btnClass:
      'bg-[#6F2148] hover:bg-[#8A2859] text-white',
    accentBar: 'bg-[#6F2148]',
  },
  ELD: {
    sigla: 'ELD',
    nome: 'Escola Livre de Dança',
    subtitulo: 'Corpo, Movimento & Coreografia',
    descricao:
      'Polo de pesquisa continuada em dança contemporânea e consciência do movimento. Investigação de poéticas corporais, preparação física e criação coreográfica colaborativa.',
    sede: 'Espaço da Dança • Jardim Bela Vista',
    panelClass:
      'bg-[#250F13] text-[#F7E7E9]',
    borderClass:
      'border-[#3F1920] hover:border-[#822B3B]',
    monogramColor:
      'text-[#EEB9C2]/10',
    vagasColor:
      'text-[#EFB9C2]',
    btnClass:
      'bg-[#732734] hover:bg-[#8E2F3E] text-white',
    accentBar: 'bg-[#732734]',
  },
  ELCV: {
    sigla: 'ELCV',
    nome: 'Escola Livre de Cinema e Vídeo',
    subtitulo: 'Audiovisual, Roteiro & Fotografia',
    descricao:
      'Formação técnica e estética completa nas etapas da produção cinematográfica: direção, roteiro, fotografia de cena, captação de som direto, montagem e realização de curtas autorais.',
    sede: 'Polo Audiovisual • Vila Gilda',
    panelClass:
      'bg-[#0B1A24] text-[#E5F1F7]',
    borderClass:
      'border-[#153245] hover:border-[#286D94]',
    monogramColor:
      'text-[#A7D1E7]/10',
    vagasColor:
      'text-[#A7D1E7]',
    btnClass:
      'bg-[#1E5777] hover:bg-[#277099] text-white',
    accentBar: 'bg-[#1E5777]',
  },
  EMIA: {
    sigla: 'EMIA',
    nome: 'Escola Municipal de Iniciação Artística',
    subtitulo: 'Multidisciplinaridade • Crianças & Jovens',
    descricao:
      'Sensibilização poética e vivências artísticas integradas por faixa etária. Conexão viva e lúdica entre artes visuais, teatro, música e dança para a infância e juventude.',
    sede: 'Pq. Regional da Criança • Jaçatuba',
    panelClass:
      'bg-[#221A0C] text-[#F7EFE1]',
    borderClass:
      'border-[#3A2C14] hover:border-[#876423]',
    monogramColor:
      'text-[#E2C799]/10',
    vagasColor:
      'text-[#E2C799]',
    btnClass:
      'bg-[#73551E] hover:bg-[#8F6A26] text-white',
    accentBar: 'bg-[#73551E]',
  },
  ELIA: {
    sigla: 'EMIA',
    nome: 'Escola Municipal de Iniciação Artística',
    subtitulo: 'Multidisciplinaridade • Crianças & Jovens',
    descricao:
      'Sensibilização poética e vivências artísticas integradas por faixa etária. Conexão viva e lúdica entre artes visuais, teatro, música e dança para a infância e juventude.',
    sede: 'Pq. Regional da Criança • Jaçatuba',
    panelClass:
      'bg-[#221A0C] text-[#F7EFE1]',
    borderClass:
      'border-[#3A2C14] hover:border-[#876423]',
    monogramColor:
      'text-[#E2C799]/10',
    vagasColor:
      'text-[#E2C799]',
    btnClass:
      'bg-[#73551E] hover:bg-[#8F6A26] text-white',
    accentBar: 'bg-[#73551E]',
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
    <div className="min-h-screen bg-[#F1F5F9] dark:bg-[#000000] text-slate-900 dark:text-zinc-100 flex flex-col font-sans transition-colors duration-200 relative overflow-hidden">
      {/* Top Header Institucional Integrado */}
      <GraffitiBannerHeader onLogout={onLogout} />

      {/* Conteúdo Principal (Ocupa a Altura Útil) */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 flex flex-col justify-between relative z-10">
        {/* ─── CABEÇALHO EDITORIAL ─── */}
        <section className="mb-8 sm:mb-12">
          <div className="pb-6 border-b border-slate-200/90 dark:border-slate-800/90">
            <div>
              <motion.h1
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: [0.2, 0.8, 0.2, 1] }}
                className="font-sans text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight leading-none text-slate-900 dark:text-white"
              >
                Rede de Escolas Livres
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1, ease: [0.2, 0.8, 0.2, 1] }}
                className="text-base sm:text-lg text-slate-600 dark:text-slate-400 mt-3 font-medium"
              >
                Olá, <span className="text-slate-900 dark:text-white font-semibold">{primeiroNome}</span>. Por onde começamos?
              </motion.p>
            </div>
          </div>
        </section>

        {/* ─── CORTINAS TEATRAIS: OS 4 PAINÉIS EXPANSÍVEIS (FLEX ACCORDION) ─── */}
        <section
          aria-label="Unidades das Escolas Livres"
          className="flex flex-col lg:flex-row gap-3.5 sm:gap-4 flex-1 min-h-[540px] sm:min-h-[580px] w-full"
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
            const vagasCount = turmasDaEscola.reduce((acc, t) => acc + (t.vagasTotais || 0), 0) || 60;

            const isPermitido = !isEncarregada || permittedIds.includes(escola.id);

            return (
              <motion.article
                key={escola.id}
                initial={{ opacity: 0, y: 35 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.55,
                  delay: 0.15 + index * 0.08,
                  ease: [0.2, 0.8, 0.2, 1],
                }}
                onMouseEnter={() => setHoveredSigla(siglaUpper)}
                onFocus={() => setHoveredSigla(siglaUpper)}
                onClick={() => isPermitido && onSelecionarEscola(escola.id)}
                tabIndex={isPermitido ? 0 : -1}
                aria-label={`Unidade ${config.nome}`}
                className={`relative rounded-3xl p-6 sm:p-7 flex flex-col justify-between overflow-hidden border transition-all duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)] select-none ${
                  config.panelClass
                } ${config.borderClass} ${
                  isExpanded
                    ? 'lg:flex-[2.8] shadow-2xl'
                    : hasAnyHover
                    ? 'lg:flex-[0.8] opacity-80'
                    : 'lg:flex-[1] shadow-xs'
                } ${
                  isPermitido
                    ? 'cursor-pointer focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-current outline-none'
                    : 'opacity-50 saturate-50 cursor-not-allowed'
                }`}
              >
                {/* ─── SIGLA GIGANTE EM OUTLINE RECORTE EDITORIAL ─── */}
                <span
                  aria-hidden="true"
                  className={`absolute -right-3 sm:-right-4 -bottom-6 sm:-bottom-8 font-sans text-7xl sm:text-8xl lg:text-9xl font-black tracking-tighter leading-none pointer-events-none select-none transition-transform duration-700 ease-[cubic-bezier(0.2,0.8,0.2,1)] ${
                    config.monogramColor
                  } ${isExpanded ? 'translate-x-0 scale-105' : 'translate-x-3 scale-95'}`}
                >
                  {config.sigla}
                </span>

                {/* ─── TOPO DO PAINEL: SIGLA, STATUS E TÍTULO ─── */}
                <div className="relative z-10">
                  <div className="flex items-center justify-between gap-3 mb-4">
                    <span className="font-sans text-2xl sm:text-3xl font-black tracking-tight">
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

                  <h2 className="font-sans text-xl sm:text-2xl font-black tracking-tight leading-snug">
                    {config.nome}
                  </h2>
                  <p className="text-xs font-semibold tracking-wide opacity-75 mt-0.5">
                    {config.subtitulo}
                  </p>

                  {/* Descrição Completa (Revelada suavemente quando expandido no desktop ou no mobile) */}
                  <div
                    className={`mt-4 text-xs sm:text-sm leading-relaxed opacity-90 transition-all duration-500 ${
                      isExpanded
                        ? 'max-h-48 opacity-100'
                        : 'lg:max-h-0 lg:opacity-0 lg:overflow-hidden'
                    }`}
                  >
                    <p>{config.descricao}</p>

                    <div className="flex items-center gap-1.5 text-xs opacity-80 mt-3 pt-3 border-t border-current/15">
                      <MapPin className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{config.sede}</span>
                    </div>
                  </div>
                </div>

                {/* ─── BASE DO PAINEL: NÚMEROS COM HIERARQUIA & CTA ─── */}
                <div className="relative z-10 pt-6 mt-auto">
                  {/* Destaque Principal: VAGAS GIGANTES */}
                  <div className="mb-4">
                    <div className="flex items-baseline gap-2">
                      <span
                        className={`font-mono text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-none ${config.vagasColor}`}
                      >
                        {vagasCount}
                      </span>
                      <span className="text-xs sm:text-sm font-semibold opacity-80">
                        vagas ofertadas
                      </span>
                    </div>

                    <div className="text-xs font-mono opacity-70 mt-1">
                      {turmasCount || 4} turmas <span className="opacity-40">·</span> {cursosCount || 2} cursos ativos
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
                      className={`w-full py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 flex items-center justify-between shadow-sm active:scale-98 cursor-pointer ${
                        config.btnClass
                      }`}
                    >
                      <span>Entrar no Palco {config.sigla}</span>
                      <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1.5" />
                    </button>
                  </div>
                </div>
              </motion.article>
            );
          })}
        </section>

        {/* ─── RODAPÉ INSTITUCIONAL DISCRETO ─── */}
        <footer className="mt-8 pt-6 border-t border-slate-200/90 dark:border-slate-800/90 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-3">
            <Image
              src="/logo_santo_andre.png"
              alt="Brasão Oficial do Município de Santo André"
              width={32}
              height={44}
              className="h-8 w-auto object-contain drop-shadow-xs dark:brightness-110"
            />
            <span>
              Prefeitura de Santo André • Secretaria de Cultura • SIGMA
            </span>
          </div>

          <div className="flex items-center gap-4">
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
