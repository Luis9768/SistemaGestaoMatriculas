/**
 * Utilitários compartilhados para cores e temas visuais das Escolas Livres de Santo André.
 * Segue o protocolo de Design Minimalista (/minimalist-ui) com paletas terrosas, contrastes precisos e sem saturação agressiva.
 */

export type SiglaEscolaOficial = 'ELT' | 'ELD' | 'ELCV' | 'EMIA' | 'GERAL';

export interface SchoolThemeDefinition {
  sigla: SiglaEscolaOficial;
  nome: string;
  dot: string;
  primaryHex: string;
  progressBar: string;
  solidBtn: string;
  subtleBtn: string;
  outlineBtn: string;
  accentText: string;
  activeTab: string;
  ringFocus: string;
  subtleBadge: string;
  borderAccent: string;
}

/**
 * Normaliza qualquer sigla, código de turma (ex: "ELT-2026-T1"), ou cor para uma das 4 escolas oficiais ou GERAL.
 */
export function getNormalizedEscolaSigla(input?: string): SiglaEscolaOficial {
  if (!input) return 'GERAL';
  const clean = input.trim().toUpperCase();

  if (clean.startsWith('ELT') || clean === 'VIOLET' || clean.includes('TEATRO')) {
    return 'ELT';
  }
  if (clean.startsWith('ELD') || clean === 'ROSE' || clean.includes('DANÇA') || clean.includes('DANCA')) {
    return 'ELD';
  }
  if (clean.startsWith('ELCV') || clean.startsWith('CIN') || clean === 'SKY' || clean === 'BLUE' || clean.includes('CINEMA') || clean.includes('AUDIOVISUAL')) {
    return 'ELCV';
  }
  if (clean.startsWith('EMIA') || clean.startsWith('ELIA') || clean === 'AMBER' || clean.includes('INICIAÇÃO') || clean.includes('INICIACAO')) {
    return 'EMIA';
  }

  return 'GERAL';
}

/**
 * Retorna o conjunto completo de classes utilitárias para estilização de botões e acentos por escola.
 */
export function getSchoolThemeColors(siglaOuCor?: string): SchoolThemeDefinition {
  const sigla = getNormalizedEscolaSigla(siglaOuCor);

  switch (sigla) {
    case 'ELT':
      return {
        sigla: 'ELT',
        nome: 'Escola Livre de Teatro',
        dot: 'bg-violet-500',
        primaryHex: '#7c3aed',
        progressBar: 'bg-[#7c3aed] dark:bg-violet-500',
        solidBtn: 'bg-[#6d28d9] hover:bg-[#7c3aed] active:bg-[#5b21b6] text-white shadow-xs',
        subtleBtn: 'bg-violet-500/10 hover:bg-violet-500/20 active:bg-violet-500/25 text-violet-700 dark:text-violet-300 border border-violet-500/30',
        outlineBtn: 'border border-violet-500/40 hover:border-violet-600 text-violet-700 dark:text-violet-300 hover:bg-violet-500/10',
        accentText: 'text-violet-700 dark:text-violet-300',
        activeTab: 'border-violet-600 text-violet-700 dark:text-violet-300 dark:border-violet-400',
        ringFocus: 'focus:ring-violet-500/20 focus:border-violet-500',
        subtleBadge: 'bg-violet-50 text-violet-700 border-violet-200/70 dark:bg-violet-950/30 dark:text-violet-300 dark:border-violet-800/40',
        borderAccent: 'border-l-violet-600',
      };
    case 'ELD':
      return {
        sigla: 'ELD',
        nome: 'Escola Livre de Dança',
        dot: 'bg-rose-500',
        primaryHex: '#db2777',
        progressBar: 'bg-[#db2777] dark:bg-rose-500',
        solidBtn: 'bg-[#be185d] hover:bg-[#db2777] active:bg-[#9d174d] text-white shadow-xs',
        subtleBtn: 'bg-rose-500/10 hover:bg-rose-500/20 active:bg-rose-500/25 text-rose-700 dark:text-rose-300 border border-rose-500/30',
        outlineBtn: 'border border-rose-500/40 hover:border-rose-600 text-rose-700 dark:text-rose-300 hover:bg-rose-500/10',
        accentText: 'text-rose-700 dark:text-rose-300',
        activeTab: 'border-rose-600 text-rose-700 dark:text-rose-300 dark:border-rose-400',
        ringFocus: 'focus:ring-rose-500/20 focus:border-rose-500',
        subtleBadge: 'bg-rose-50 text-rose-700 border-rose-200/70 dark:bg-rose-950/30 dark:text-rose-300 dark:border-rose-800/40',
        borderAccent: 'border-l-rose-600',
      };
    case 'ELCV':
      return {
        sigla: 'ELCV',
        nome: 'Escola Livre de Cinema e Vídeo',
        dot: 'bg-sky-500',
        primaryHex: '#0284c7',
        progressBar: 'bg-[#0284c7] dark:bg-sky-500',
        solidBtn: 'bg-[#0284c7] hover:bg-[#0ea5e9] active:bg-[#0369a1] text-white shadow-xs',
        subtleBtn: 'bg-sky-500/10 hover:bg-sky-500/20 active:bg-sky-500/25 text-sky-700 dark:text-sky-300 border border-sky-500/30',
        outlineBtn: 'border border-sky-500/40 hover:border-sky-600 text-sky-700 dark:text-sky-300 hover:bg-sky-500/10',
        accentText: 'text-sky-700 dark:text-sky-300',
        activeTab: 'border-sky-600 text-sky-700 dark:text-sky-300 dark:border-sky-400',
        ringFocus: 'focus:ring-sky-500/20 focus:border-sky-500',
        subtleBadge: 'bg-sky-50 text-sky-700 border-sky-200/70 dark:bg-sky-950/30 dark:text-sky-300 dark:border-sky-800/40',
        borderAccent: 'border-l-sky-600',
      };
    case 'EMIA':
      return {
        sigla: 'EMIA',
        nome: 'Escola Municipal de Iniciação Artística',
        dot: 'bg-amber-500',
        primaryHex: '#d97706',
        progressBar: 'bg-[#d97706] dark:bg-amber-500',
        solidBtn: 'bg-[#d97706] hover:bg-[#f59e0b] active:bg-[#b45309] text-stone-950 font-bold shadow-xs',
        subtleBtn: 'bg-amber-500/10 hover:bg-amber-500/20 active:bg-amber-500/25 text-amber-800 dark:text-amber-300 border border-amber-500/30',
        outlineBtn: 'border border-amber-500/40 hover:border-amber-600 text-amber-800 dark:text-amber-300 hover:bg-amber-500/10',
        accentText: 'text-amber-700 dark:text-amber-300',
        activeTab: 'border-amber-600 text-amber-700 dark:text-amber-300 dark:border-amber-400',
        ringFocus: 'focus:ring-amber-500/20 focus:border-amber-500',
        subtleBadge: 'bg-amber-50 text-amber-700 border-amber-200/70 dark:bg-amber-950/30 dark:text-amber-300 dark:border-amber-800/40',
        borderAccent: 'border-l-amber-600',
      };
    default:
      return {
        sigla: 'GERAL',
        nome: 'Secretaria de Cultura',
        dot: 'bg-stone-400',
        primaryHex: '#52525b',
        progressBar: 'bg-stone-700 dark:bg-stone-400',
        solidBtn: 'bg-stone-900 hover:bg-stone-800 active:bg-stone-950 text-white dark:bg-stone-100 dark:hover:bg-white dark:text-stone-900 shadow-xs',
        subtleBtn: 'bg-stone-100 hover:bg-stone-200 active:bg-stone-300 text-stone-800 dark:bg-stone-800 dark:hover:bg-stone-700 dark:text-stone-200 border border-stone-200 dark:border-stone-700',
        outlineBtn: 'border border-stone-300 hover:border-stone-400 text-stone-700 dark:border-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800',
        accentText: 'text-stone-700 dark:text-stone-300',
        activeTab: 'border-stone-900 text-stone-900 dark:text-stone-100 dark:border-stone-100',
        ringFocus: 'focus:ring-stone-500/20 focus:border-stone-500',
        subtleBadge: 'bg-slate-50 text-slate-700 border-slate-200/70 dark:bg-slate-800/40 dark:text-slate-300 dark:border-slate-700/60',
        borderAccent: 'border-l-stone-400',
      };
  }
}

/**
 * Retorna a classe para badge/tag colorida da escola (compatibilidade e utilitário).
 */
export const getCorTemaEscola = (siglaOuCor?: string): string => {
  return getSchoolThemeColors(siglaOuCor).subtleBadge;
};

export function getSchoolHexColor(siglaOuCor?: string): string {
  return getSchoolThemeColors(siglaOuCor).primaryHex;
}
