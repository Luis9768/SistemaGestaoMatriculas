'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import {
  Theater,
  Music,
  Film,
  Palette,
  ArrowRight,
  ShieldCheck,
  Lock,
  Building2,
  CheckCircle2,
  BookOpen,
  Users,
  GraduationCap,
} from 'lucide-react';
import { Escola, Curso, Turma, Matricula, LoginResponse } from '@/lib/api';
import { GraffitiBannerHeader } from '@/components/GraffitiBannerHeader';
import { LgpdModal } from '@/components/LgpdModal';

/* ─── TYPES ─── */
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

interface SchoolDefinition {
  sigla: string;
  numero: string;
  nome: string;
  especialidade: string;
  missao: string;
  icone: React.ComponentType<{ className?: string }>;
  tagEstilo: string;
  iconeEstilo: string;
  accentBar: string;
  watermark: string;
  hoverBorder: string;
  hoverGlow: string;
  btnHover: string;
}

/* ─── DEFINIÇÕES DAS 4 ESCOLAS HISTÓRICAS DE SANTO ANDRÉ ─── */
const ESCOLAS_DEFINICOES: Record<string, SchoolDefinition> = {
  ELT: {
    sigla: 'ELT',
    numero: '01',
    nome: 'Escola Livre de Teatro',
    especialidade: 'Artes Cênicas & Dramaturgia',
    missao:
      'Referência nacional na formação teatral pública. Foco em pedagogia colaborativa, criação coletiva, dramaturgia autoral e pesquisa de linguagens cênicas contemporâneas.',
    icone: Theater,
    tagEstilo:
      'bg-purple-50 text-purple-700 border-purple-200/90 dark:bg-purple-950/50 dark:text-purple-300 dark:border-purple-800/80',
    iconeEstilo:
      'bg-purple-600 text-white shadow-sm shadow-purple-600/30',
    accentBar: 'from-purple-600 to-indigo-600',
    watermark: 'text-purple-900/[0.03] dark:text-purple-400/[0.04]',
    hoverBorder: 'hover:border-purple-300 dark:hover:border-purple-600/60',
    hoverGlow: 'hover:shadow-[0_16px_36px_-8px_rgba(147,51,234,0.14)]',
    btnHover:
      'hover:bg-purple-600 hover:text-white dark:hover:bg-purple-600 dark:hover:text-white',
  },
  ELD: {
    sigla: 'ELD',
    numero: '02',
    nome: 'Escola Livre de Dança',
    especialidade: 'Corpo, Movimento & Coreografia',
    missao:
      'Polo de formação e reflexão continuada sobre a dança contemporânea. Investigação de consciência corporal, composição coreográfica e poéticas do corpo em cena.',
    icone: Music,
    tagEstilo:
      'bg-rose-50 text-rose-700 border-rose-200/90 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800/80',
    iconeEstilo:
      'bg-rose-600 text-white shadow-sm shadow-rose-600/30',
    accentBar: 'from-rose-600 to-pink-600',
    watermark: 'text-rose-900/[0.03] dark:text-rose-400/[0.04]',
    hoverBorder: 'hover:border-rose-300 dark:hover:border-rose-600/60',
    hoverGlow: 'hover:shadow-[0_16px_36px_-8px_rgba(244,63,94,0.14)]',
    btnHover:
      'hover:bg-rose-600 hover:text-white dark:hover:bg-rose-600 dark:hover:text-white',
  },
  ELCV: {
    sigla: 'ELCV',
    numero: '03',
    nome: 'Escola Livre de Cinema e Vídeo',
    especialidade: 'Audiovisual, Roteiro & Fotografia',
    missao:
      'Capacitação técnica e estética nas etapas da produção cinematográfica: direção, roteiro, fotografia de cena, captação sonora, montagem e realização de curtas autorais.',
    icone: Film,
    tagEstilo:
      'bg-sky-50 text-sky-700 border-sky-200/90 dark:bg-sky-950/50 dark:text-sky-300 dark:border-sky-800/80',
    iconeEstilo:
      'bg-sky-600 text-white shadow-sm shadow-sky-600/30',
    accentBar: 'from-sky-600 to-cyan-600',
    watermark: 'text-sky-900/[0.03] dark:text-sky-400/[0.04]',
    hoverBorder: 'hover:border-sky-300 dark:hover:border-sky-600/60',
    hoverGlow: 'hover:shadow-[0_16px_36px_-8px_rgba(14,165,233,0.14)]',
    btnHover:
      'hover:bg-sky-600 hover:text-white dark:hover:bg-sky-600 dark:hover:text-white',
  },
  EMIA: {
    sigla: 'EMIA',
    numero: '04',
    nome: 'Escola Municipal de Iniciação Artística',
    especialidade: 'Multidisciplinaridade • Crianças & Jovens',
    missao:
      'Espaço de sensibilização poética e vivências artísticas integradas por faixa etária, conectando artes visuais, teatro, música e dança de maneira colaborativa e lúdica.',
    icone: Palette,
    tagEstilo:
      'bg-amber-50 text-amber-800 border-amber-200/90 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800/80',
    iconeEstilo:
      'bg-amber-600 text-white shadow-sm shadow-amber-600/30',
    accentBar: 'from-amber-600 to-orange-600',
    watermark: 'text-amber-900/[0.03] dark:text-amber-400/[0.04]',
    hoverBorder: 'hover:border-amber-300 dark:hover:border-amber-600/60',
    hoverGlow: 'hover:shadow-[0_16px_36px_-8px_rgba(245,158,11,0.14)]',
    btnHover:
      'hover:bg-amber-600 hover:text-white dark:hover:bg-amber-600 dark:hover:text-white',
  },
  ELIA: {
    sigla: 'EMIA',
    numero: '04',
    nome: 'Escola Municipal de Iniciação Artística',
    especialidade: 'Multidisciplinaridade • Crianças & Jovens',
    missao:
      'Espaço de sensibilização poética e vivências artísticas integradas por faixa etária, conectando artes visuais, teatro, música e dança de maneira colaborativa e lúdica.',
    icone: Palette,
    tagEstilo:
      'bg-amber-50 text-amber-800 border-amber-200/90 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800/80',
    iconeEstilo:
      'bg-amber-600 text-white shadow-sm shadow-amber-600/30',
    accentBar: 'from-amber-600 to-orange-600',
    watermark: 'text-amber-900/[0.03] dark:text-amber-400/[0.04]',
    hoverBorder: 'hover:border-amber-300 dark:hover:border-amber-600/60',
    hoverGlow: 'hover:shadow-[0_16px_36px_-8px_rgba(245,158,11,0.14)]',
    btnHover:
      'hover:bg-amber-600 hover:text-white dark:hover:bg-amber-600 dark:hover:text-white',
  },
};

/* ─── CARD INDIVIDUAL COM COMPOSIÇÃO EDITORIAL ─── */
interface SchoolCardItemProps {
  escola: Escola;
  def: SchoolDefinition;
  cursosCount: number;
  turmasCount: number;
  vagasCount: number;
  isPermitido: boolean;
  isEncarregada: boolean;
  onSelect: () => void;
}

function SchoolCardItem({
  escola,
  def,
  cursosCount,
  turmasCount,
  vagasCount,
  isPermitido,
  isEncarregada,
  onSelect,
}: SchoolCardItemProps) {
  const IconeComp = def.icone;

  return (
    <article
      className={`group relative rounded-3xl p-6 sm:p-7 md:p-8 flex flex-col justify-between transition-all duration-300 overflow-hidden border bg-white dark:bg-[#0c1017] border-slate-200/90 dark:border-slate-800/90 shadow-[0_2px_8px_rgba(15,23,42,0.04),0_12px_24px_-4px_rgba(15,23,42,0.05)] ${
        isPermitido
          ? `hover:-translate-y-1 ${def.hoverBorder} ${def.hoverGlow}`
          : 'opacity-60 saturate-50 border-dashed cursor-not-allowed'
      }`}
    >
      {/* Monograma D'água Tipográfico em Marcação Arquitetural */}
      <span
        aria-hidden="true"
        className={`absolute -right-4 -bottom-6 font-mono text-8xl sm:text-9xl font-black select-none pointer-events-none tracking-tighter ${def.watermark} transition-transform duration-500 group-hover:scale-105`}
      >
        {def.sigla}
      </span>

      {/* Topo do Card: Número da Escola, Badge de Categoria e Ícone */}
      <div>
        <div className="flex items-center justify-between gap-3 mb-5">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold tracking-widest text-slate-400 dark:text-slate-500">
              #{def.numero}
            </span>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold border tracking-wide ${def.tagEstilo}`}
            >
              {def.especialidade}
            </span>
          </div>

          {/* Badge de Acesso Restrito para Encarregadas */}
          {isEncarregada && (
            <div>
              {isPermitido ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                  <CheckCircle2 className="w-3 h-3" />
                  Autorizada
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                  <Lock className="w-2.5 h-2.5" />
                  Restrito
                </span>
              )}
            </div>
          )}
        </div>

        {/* Título e Ícone */}
        <div className="flex items-start gap-4 mb-3.5">
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-transform duration-300 ${
              isPermitido ? 'group-hover:scale-105 group-hover:-rotate-2' : ''
            } ${def.iconeEstilo}`}
          >
            <IconeComp className="w-6 h-6" />
          </div>

          <div className="min-w-0 flex-1">
            <h3
              className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-snug group-hover:text-slate-800 dark:group-hover:text-slate-100"
              title={def.nome}
            >
              {def.nome}
            </h3>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 font-mono tracking-wider uppercase mt-0.5">
              {def.sigla} • Santo André
            </p>
          </div>
        </div>

        {/* Manifesto / Descrição da Escola */}
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-6 line-clamp-3">
          {def.missao}
        </p>
      </div>

      {/* Rodapé do Card: Indicadores + Botão de Ação */}
      <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
        {/* Indicadores Operacionais */}
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-baseline gap-1.5">
            <span className="font-mono text-base font-black text-slate-900 dark:text-white">
              {cursosCount || 2}
            </span>
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
              Cursos
            </span>
          </div>

          <span className="text-slate-200 dark:text-slate-700">|</span>

          <div className="flex items-baseline gap-1.5">
            <span className="font-mono text-base font-black text-slate-900 dark:text-white">
              {turmasCount || 4}
            </span>
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
              Turmas
            </span>
          </div>

          <span className="text-slate-200 dark:text-slate-700">|</span>

          <div className="flex items-baseline gap-1.5">
            <span className="font-mono text-base font-black text-slate-900 dark:text-white">
              {vagasCount}
            </span>
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
              Vagas
            </span>
          </div>
        </div>

        {/* Botão de Entrada */}
        <button
          type="button"
          disabled={!isPermitido}
          onClick={onSelect}
          className={`py-2.5 px-5 rounded-xl text-xs font-bold transition-all duration-200 inline-flex items-center justify-center gap-2 border cursor-pointer active:scale-98 ${
            isPermitido
              ? `bg-slate-900 text-white border-slate-900 dark:bg-white dark:text-slate-900 dark:border-white shadow-xs ${def.btnHover}`
              : 'bg-slate-100 text-slate-400 border-slate-200 dark:bg-slate-800 dark:text-slate-500 dark:border-slate-700 cursor-not-allowed'
          }`}
        >
          {isPermitido ? (
            <>
              <span>Acessar {def.sigla}</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-1" />
            </>
          ) : (
            <>
              <Lock className="w-3.5 h-3.5" />
              <span>Acesso Restrito</span>
            </>
          )}
        </button>
      </div>
    </article>
  );
}

/* ─── COMPONENTE PRINCIPAL ─── */
export function DirecionamentoEscolasView({
  usuarioLogado,
  escolas,
  cursos,
  turmas,
  onSelecionarEscola,
  onLogout,
}: DirecionamentoEscolasViewProps) {
  const [modalLgpdAberto, setModalLgpdAberto] = useState(false);
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
    <div className="min-h-screen bg-[#F1F5F9] dark:bg-[#000000] text-slate-900 dark:text-zinc-100 flex flex-col font-sans transition-colors duration-200">
      {/* Top Header Institucional Minimalista */}
      <GraffitiBannerHeader onLogout={onLogout} />

      {/* Conteúdo Principal */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 flex flex-col">
        {/* ─── CABEÇALHO EDITORIAL DE IDENTIDADE ─── */}
        <section className="mb-8 sm:mb-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slate-200/90 dark:border-slate-800/90">
            <div>
              {/* Etiqueta Institucional */}
              <div className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 font-mono uppercase tracking-wider mb-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Secretaria de Cultura • Santo André</span>
              </div>

              {/* Título Principal Editorial */}
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-none">
                Rede de Escolas Livres
              </h1>

              {/* Saudação ao Usuário e Propósito */}
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 mt-2.5 max-w-2xl leading-relaxed">
                Bem-vindo(a), <span className="font-bold text-slate-900 dark:text-white">{primeiroNome}</span>. Selecione a unidade pedagógica para gerenciar turmas, frequências e registros de matrícula.
              </p>
            </div>

            {/* Badges de Contexto Operacional */}
            <div className="flex items-center gap-2 self-start md:self-end">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-[#0c1017] border border-slate-200/90 dark:border-slate-800 text-xs font-mono font-bold text-slate-700 dark:text-slate-300 shadow-2xs">
                <Building2 className="w-3.5 h-3.5 text-indigo-500" />
                4 Escolas Livres
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-[#0c1017] border border-slate-200/90 dark:border-slate-800 text-xs font-mono font-bold text-slate-700 dark:text-slate-300 shadow-2xs">
                Ano Letivo 2026
              </span>
            </div>
          </div>
        </section>

        {/* ─── GRID EDITORIAL DAS 4 ESCOLAS (2x2) ─── */}
        <section
          aria-label="Seleção de Unidades Escolares"
          className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-7"
        >
          {escolasRender.map((escola) => {
            const siglaUpper = escola.sigla.toUpperCase();
            const def = ESCOLAS_DEFINICOES[siglaUpper] || {
              sigla: escola.sigla,
              numero: '00',
              nome: escola.nome,
              especialidade: 'Unidade Cultural',
              missao: escola.descricao || 'Formação artística pública de Santo André.',
              icone: Building2,
              tagEstilo: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300',
              iconeEstilo: 'bg-slate-800 text-white',
              accentBar: 'from-slate-600 to-slate-800',
              watermark: 'text-slate-900/[0.03]',
              hoverBorder: 'hover:border-slate-400',
              hoverGlow: 'hover:shadow-md',
              btnHover: 'hover:bg-slate-800',
            };

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
              <SchoolCardItem
                key={escola.id}
                escola={escola}
                def={def}
                cursosCount={cursosCount}
                turmasCount={turmasCount}
                vagasCount={vagasCount}
                isPermitido={isPermitido}
                isEncarregada={isEncarregada}
                onSelect={() => isPermitido && onSelecionarEscola(escola.id)}
              />
            );
          })}
        </section>

        {/* ─── RODAPÉ INSTITUCIONAL COM BRASÃO OFICIAL E LGPD ─── */}
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
              className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 underline cursor-pointer"
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
                ELT • ELD • ELCV • EMIA
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
