/**
 * Utilitários compartilhados para cores e temas visuais das Escolas Livres de Santo André.
 */

export const getCorTemaEscola = (siglaOuCor?: string): string => {
  switch (siglaOuCor?.toUpperCase()) {
    case 'ELT':
    case 'VIOLET':
      return 'bg-purple-50 text-purple-700 border-purple-200/70 dark:bg-purple-950/30 dark:text-purple-300 dark:border-purple-800/40';
    case 'ELD':
    case 'ROSE':
      return 'bg-rose-50 text-rose-700 border-rose-200/70 dark:bg-rose-950/30 dark:text-rose-300 dark:border-rose-800/40';
    case 'ELCV':
    case 'SKY':
    case 'BLUE':
      return 'bg-sky-50 text-sky-700 border-sky-200/70 dark:bg-sky-950/30 dark:text-sky-300 dark:border-sky-800/40';
    case 'ELIA':
    case 'EMIA':
    case 'AMBER':
      return 'bg-amber-50 text-amber-700 border-amber-200/70 dark:bg-amber-950/30 dark:text-amber-300 dark:border-amber-800/40';
    default:
      return 'bg-slate-50 text-slate-700 border-slate-200/70 dark:bg-slate-800/40 dark:text-slate-300 dark:border-slate-700/60';
  }
};
