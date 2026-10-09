'use client';

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Search, Plus, X, ArrowRight, Layers, BookOpen, User, Clock, Info } from 'lucide-react';
import { Turma, Curso, Escola } from '@/lib/api';
import { ModalGerenciarMaterias } from '@/components/ModalGerenciarMaterias';
import { useApp } from '@/context/AppContext';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface TurmasOfertasViewProps {
  turmas: Turma[];
  cursos: Curso[];
  escolas: Escola[];
  escolaSelecionada: number | null;
  termoBuscaInicial?: string;
  destacarTurmaId?: number | null;
  onAbrirModalTurma: () => void;
  onMatricularNaTurma: (turmaId: number) => void;
  onTurmasAtualizadas?: () => void;
}

export interface EscolaTheme {
  sigla: string;
  nome: string;
  accentBorder: string;
  accentGlow: string;
  seatFree: string;
  btnAtivo: string;
}

export const ESCOLAS_THEME: Record<string, EscolaTheme> = {
  ELT: {
    sigla: 'ELT',
    nome: 'Escola Livre de Teatro',
    accentBorder: 'border-l-[#7c3aed]',
    accentGlow: 'hover:border-[#7c3aed]/50',
    seatFree: 'bg-[#7c3aed] ring-1 ring-[#a78bfa]/40',
    btnAtivo: 'bg-[#6d28d9] hover:bg-[#7c3aed] text-white shadow-xs',
  },
  ELD: {
    sigla: 'ELD',
    nome: 'Escola Livre de Dança',
    accentBorder: 'border-l-[#db2777]',
    accentGlow: 'hover:border-[#db2777]/50',
    seatFree: 'bg-[#db2777] ring-1 ring-[#f472b6]/40',
    btnAtivo: 'bg-[#be185d] hover:bg-[#db2777] text-white shadow-xs',
  },
  ELCV: {
    sigla: 'ELCV',
    nome: 'Escola Livre de Cinema e Vídeo',
    accentBorder: 'border-l-[#0284c7]',
    accentGlow: 'hover:border-[#0284c7]/50',
    seatFree: 'bg-[#0284c7] ring-1 ring-[#38bdf8]/40',
    btnAtivo: 'bg-[#0284c7] hover:bg-[#0ea5e9] text-white shadow-xs',
  },
  EMIA: {
    sigla: 'EMIA',
    nome: 'Escola Municipal de Iniciação Artística',
    accentBorder: 'border-l-[#d97706]',
    accentGlow: 'hover:border-[#d97706]/50',
    seatFree: 'bg-[#d97706] ring-1 ring-[#fbbf24]/40',
    btnAtivo: 'bg-[#d97706] hover:bg-[#f59e0b] text-stone-950 font-bold shadow-xs',
  },
  ELIA: {
    sigla: 'EMIA',
    nome: 'Escola Municipal de Iniciação Artística',
    accentBorder: 'border-l-[#d97706]',
    accentGlow: 'hover:border-[#d97706]/50',
    seatFree: 'bg-[#d97706] ring-1 ring-[#fbbf24]/40',
    btnAtivo: 'bg-[#d97706] hover:bg-[#f59e0b] text-stone-950 font-bold shadow-xs',
  },
};

export const DEFAULT_THEME: EscolaTheme = {
  sigla: 'GERAL',
  nome: 'Secretaria de Cultura',
  accentBorder: 'border-l-stone-500',
  accentGlow: 'hover:border-stone-400',
  seatFree: 'bg-stone-700 dark:bg-stone-300 ring-1 ring-stone-400/40',
  btnAtivo:
    'bg-stone-900 hover:bg-stone-800 text-white dark:bg-stone-100 dark:hover:bg-white dark:text-stone-900 shadow-xs',
};

/**
 * Formata a linha de decisão do curso (Dias · Horário · Faixa etária).
 */
export function formatarLinhaDecisao(turma: Turma, curso?: Curso): string {
  const partes: string[] = [];

  if (turma.diasHorariosLocal && turma.diasHorariosLocal.trim()) {
    const horarioLimpo = turma.diasHorariosLocal
      .replace(/\s*•\s*/g, ' · ')
      .replace(/\s*\|\s*/g, ' · ')
      .trim();
    partes.push(horarioLimpo);
  } else if (curso?.cargaHoraria) {
    partes.push(`${curso.cargaHoraria}h`);
  }

  if (turma.idadeMinima && turma.idadeMaxima) {
    partes.push(`${turma.idadeMinima} a ${turma.idadeMaxima} anos`);
  } else if (turma.idadeMinima) {
    partes.push(`${turma.idadeMinima}+ anos`);
  } else if (turma.idadeMaxima) {
    partes.push(`Até ${turma.idadeMaxima} anos`);
  }

  if (partes.length === 0) {
    return 'Horários em definição com a coordenação';
  }

  return partes.join(' · ');
}

/**
 * Visualização de assentos de teatro (poltronas).
 * Pontos preenchidos representam vagas ocupadas e pontos iluminados representam vagas disponíveis.
 */
interface TeatroAssentosProps {
  total: number;
  ocupadas: number;
  corAssentoLivre: string;
  isEncerrada?: boolean;
}

export function TeatroAssentos({
  total,
  ocupadas,
  corAssentoLivre,
  isEncerrada,
}: TeatroAssentosProps) {
  const totalPoltronas = Math.min(Math.max(total || 20, 16), 25);
  const ocupadasPoltronas = Math.min(
    totalPoltronas,
    Math.round(((ocupadas || 0) / Math.max(total || 1, 1)) * totalPoltronas)
  );

  return (
    <div
      className="flex items-center gap-1 flex-wrap max-w-[210px] py-0.5"
      aria-label={`${ocupadas} de ${total} vagas ocupadas`}
    >
      {Array.from({ length: totalPoltronas }).map((_, index) => {
        const isOcupado = index < ocupadasPoltronas;
        return (
          <motion.span
            key={index}
            initial={{ opacity: 0, scale: 0.3 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              duration: 0.18,
              delay: 0.06 + index * 0.015,
              ease: [0.2, 0.8, 0.2, 1],
            }}
            className={`w-2.5 h-3 rounded-t-[3px] rounded-b-[1px] transition-all duration-200 group-hover/contador:scale-110 ${
              isEncerrada
                ? 'bg-stone-200 dark:bg-stone-800'
                : isOcupado
                ? 'bg-stone-300 dark:bg-stone-700/80'
                : `${corAssentoLivre} shadow-xs`
            }`}
          />
        );
      })}
    </div>
  );
}

/**
 * Skeleton para carregamento das turmas no mesmo layout editorial.
 */
export function TurmaCardSkeleton() {
  return (
    <div className="relative bg-white dark:bg-[#121110] rounded-xl border border-stone-200/70 dark:border-[#262422] p-5 sm:p-6 flex flex-col justify-between animate-pulse">
      <div>
        <div className="flex justify-between items-center">
          <div className="h-3 w-16 bg-stone-200 dark:bg-stone-800 rounded" />
          <div className="h-4 w-20 bg-stone-200 dark:bg-stone-800 rounded-md" />
        </div>
        <div className="h-6 w-3/4 bg-stone-200 dark:bg-stone-800 rounded mt-3" />
        <div className="h-3.5 w-1/2 bg-stone-100 dark:bg-stone-800/60 rounded mt-2.5" />
        <div className="h-3.5 w-1/3 bg-stone-100 dark:bg-stone-800/60 rounded mt-2" />
      </div>
      <div className="mt-6 pt-2">
        <div className="flex justify-between items-end">
          <div className="h-6 w-32 bg-stone-200 dark:bg-stone-800 rounded" />
          <div className="h-5 w-16 bg-stone-200 dark:bg-stone-800 rounded" />
        </div>
        <div className="mt-5 flex justify-between items-center">
          <div className="h-4 w-16 bg-stone-100 dark:bg-stone-800 rounded" />
          <div className="h-8.5 w-24 bg-stone-200 dark:bg-stone-800 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

/**
 * Card Editorial e Teatral da Turma
 */
interface TurmaCardProps {
  turma: Turma;
  index: number;
  curso?: Curso;
  theme: EscolaTheme;
  onDetalhes: (turma: Turma) => void;
  onMatricular: (turmaId: number) => void;
}

export function TurmaCard({
  turma,
  index,
  curso,
  theme,
  onDetalhes,
  onMatricular,
}: TurmaCardProps) {
  const ocupacao =
    turma.vagasTotais > 0 ? ((turma.vagasOcupadas ?? 0) / turma.vagasTotais) * 100 : 0;
  const vagasRestantes = Math.max(0, turma.vagasTotais - (turma.vagasOcupadas ?? 0));
  const linhaDecisao = formatarLinhaDecisao(turma, curso);

  // Status semântico exclusivo para exceções (sem ruído quando normal)
  const isEncerrada = !turma.matriculaAberta;
  const isEsgotado = !isEncerrada && (vagasRestantes === 0 || ocupacao >= 100);
  const isPoucasVagas =
    !isEncerrada && !isEsgotado && (vagasRestantes <= 3 || ocupacao >= 80);

  return (
    <motion.div
      id={`turma-card-${turma.id}`}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.35,
        delay: Math.min(index * 0.04, 0.35),
        ease: [0.2, 0.8, 0.2, 1],
      }}
      onClick={() => onDetalhes(turma)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onDetalhes(turma);
        }
      }}
      role="button"
      tabIndex={0}
      className={`group relative bg-white dark:bg-[#121110] rounded-xl border border-stone-200/90 dark:border-[#262422] border-l-4 ${theme.accentBorder} ${theme.accentGlow} shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 p-5 sm:p-6 flex flex-col justify-between cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-stone-400`}
    >
      {/* Textura sutil de grão analógico */}
      <div
        className="pointer-events-none absolute inset-0 rounded-xl opacity-[0.035] dark:opacity-[0.06] bg-[radial-gradient(#000_1px,transparent_1px)] dark:bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:12px_12px]"
        aria-hidden="true"
      />

      {/* BLOCO 1: TÍTULO & META (Hierarquia e leitura claras) */}
      <div className="relative z-10">
        {/* Linha superior: Código discreto + Status semântico quando exceção */}
        <div className="flex items-center justify-between gap-2 min-h-[20px]">
          <span className="font-mono text-[11px] font-medium text-stone-400 dark:text-stone-500 uppercase tracking-widest">
            {turma.codigo}
          </span>

          {isEncerrada && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-stone-100 text-stone-600 dark:bg-stone-900/80 dark:text-stone-400 border border-stone-200/80 dark:border-stone-800">
              Encerrada
            </span>
          )}

          {isEsgotado && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-stone-100 text-stone-600 dark:bg-stone-900/80 dark:text-stone-400 border border-stone-200/80 dark:border-stone-800">
              Esgotado
            </span>
          )}

          {isPoucasVagas && (
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/30">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
              Últimas {vagasRestantes} {vagasRestantes === 1 ? 'vaga' : 'vagas'}
            </span>
          )}
        </div>

        {/* 1. Nome do curso grande em fonte serifada com palco */}
        <h3
          className="font-serif font-bold text-lg sm:text-xl text-stone-900 dark:text-[#EDE8E0] tracking-tight leading-snug mt-2.5 line-clamp-2"
          title={turma.cursoNome}
        >
          {turma.cursoNome}
        </h3>

        {/* 2. Linha que decide: Dias · Horário · Idade */}
        <p className="text-xs text-stone-600 dark:text-stone-400 font-medium mt-2 leading-relaxed">
          {linhaDecisao}
        </p>

        {/* 3. Professor ou coordenação em texto simples com nome real */}
        <p className="text-xs text-stone-500 dark:text-stone-400 font-normal mt-1 truncate">
          {turma.educadorResponsavel
            ? `${turma.educadorResponsavel}`
            : 'Coordenação Pedagógica'}
        </p>
      </div>

      {/* BLOCO 2: VAGAS & AÇÃO (Respiro generoso entre grupos) */}
      <div className="relative z-10 mt-6 pt-1">
        {/* Assentos como poltronas de teatro + Número mono em destaque */}
        <div
          className="flex items-end justify-between gap-3 p-2.5 rounded-lg bg-stone-50/70 dark:bg-stone-900/40 border border-stone-200/40 dark:border-stone-800/40 transition-colors group-hover:border-stone-300/60 dark:group-hover:border-stone-700/60"
          title={`${turma.vagasOcupadas ?? 0}/${turma.vagasTotais} vagas ocupadas (${Math.round(ocupacao)}% preenchido)`}
        >
          <div className="space-y-1">
            <span className="text-[10px] font-medium text-stone-400 dark:text-stone-500 uppercase tracking-wider block">
              Poltronas da Turma
            </span>
            <TeatroAssentos
              total={turma.vagasTotais}
              ocupadas={turma.vagasOcupadas ?? 0}
              corAssentoLivre={theme.seatFree}
              isEncerrada={isEncerrada}
            />
          </div>

          <div className="group/contador flex flex-col items-end shrink-0 cursor-help">
            <span className="font-mono text-base sm:text-lg font-bold text-stone-900 dark:text-stone-100 tracking-tight leading-none">
              {vagasRestantes > 0 ? `${vagasRestantes} vagas` : '0 vagas'}
            </span>
            <span className="text-[10px] text-stone-400 dark:text-stone-500 font-sans tracking-normal mt-0.5">
              {isEncerrada
                ? 'encerrada'
                : vagasRestantes === 0
                ? 'esgotado'
                : 'disponíveis'}
            </span>
          </div>
        </div>

        {/* Rodapé de Ações: Detalhes com stretched-feel e Botão com Wipe */}
        <div className="mt-4 flex items-center justify-between gap-2.5">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDetalhes(turma);
            }}
            className="text-xs font-medium text-stone-500 dark:text-stone-400 group-hover:text-stone-900 dark:group-hover:text-stone-200 underline-offset-4 hover:underline transition-colors flex items-center gap-1 cursor-pointer py-1"
          >
            <span>Ver detalhes</span>
          </button>

          {isEncerrada ? (
            <span className="h-8.5 px-3.5 rounded-lg inline-flex items-center justify-center text-xs font-medium text-stone-400 dark:text-stone-500 bg-stone-100 dark:bg-stone-900/60 border border-stone-200/70 dark:border-stone-800/60 cursor-not-allowed">
              Encerrada
            </span>
          ) : isEsgotado ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (turma.id) onMatricular(turma.id);
              }}
              className="group/btn relative overflow-hidden h-8.5 px-3.5 rounded-lg border border-stone-300 dark:border-stone-700 bg-transparent hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300 text-xs font-medium transition-colors flex items-center justify-center gap-1.5 cursor-pointer active:scale-98"
            >
              <span>Lista de espera</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover/btn:translate-x-0.5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (turma.id) onMatricular(turma.id);
              }}
              className={`group/btn relative overflow-hidden h-8.5 px-4 rounded-lg ${theme.btnAtivo} text-xs font-semibold transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer shadow-xs active:scale-98`}
            >
              {/* Wipe suave de 250ms da esquerda para a direita no hover */}
              <span className="absolute inset-0 w-full h-full bg-white/20 -translate-x-full group-hover/btn:translate-x-0 transition-transform duration-250 ease-out pointer-events-none" />
              <span className="relative z-10">Matricular</span>
              <ArrowRight className="relative z-10 w-3.5 h-3.5 transition-transform duration-200 group-hover/btn:translate-x-1" />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export function TurmasOfertasView({
  turmas,
  cursos,
  escolas,
  escolaSelecionada,
  termoBuscaInicial,
  destacarTurmaId,
  onAbrirModalTurma,
  onMatricularNaTurma,
  onTurmasAtualizadas,
}: TurmasOfertasViewProps) {
  const { abrirModalDetalhesTurma, usuarioLogado } = useApp();
  const [filtroAbertas, setFiltroAbertas] = useState<'todas' | 'abertas' | 'fechadas'>('todas');
  const [buscaCodigo, setBuscaCodigo] = useState(termoBuscaInicial || '');
  const [turmaGerenciarMaterias, setTurmaGerenciarMaterias] = useState<Turma | null>(null);

  const isEncarregada = usuarioLogado?.role === 'ROLE_ENCARREGADA';
  const permittedSchoolIds: number[] = usuarioLogado?.escolasIds?.length
    ? usuarioLogado.escolasIds
    : (usuarioLogado?.escolas?.map((e) => e.id) || (usuarioLogado?.escolaId ? [usuarioLogado.escolaId] : []));

  React.useEffect(() => {
    if (termoBuscaInicial) {
      setBuscaCodigo(termoBuscaInicial);
    }
  }, [termoBuscaInicial]);

  React.useEffect(() => {
    if (destacarTurmaId) {
      abrirModalDetalhesTurma(destacarTurmaId);
      const timer = setTimeout(() => {
        const el = document.getElementById(`turma-card-${destacarTurmaId}`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 350);
      return () => clearTimeout(timer);
    }
  }, [destacarTurmaId, turmas]);

  const getEscolaSigla = (t: Turma): string => {
    if (t.escolaSigla) return t.escolaSigla.toUpperCase();
    if (t.cursoId) {
      const curso = cursos.find((c) => c.id === t.cursoId);
      if (curso?.escolaSigla) return curso.escolaSigla.toUpperCase();
      if (curso?.escolaId) {
        const escola = escolas.find((e) => e.id === curso.escolaId);
        if (escola?.sigla) return escola.sigla.toUpperCase();
      }
    }
    if (t.codigo) {
      const prefix = t.codigo.split('-')[0]?.toUpperCase();
      if (['ELT', 'ELD', 'ELCV', 'ELIA', 'EMIA'].includes(prefix)) {
        return prefix === 'ELIA' ? 'EMIA' : prefix;
      }
    }
    if (escolaSelecionada) {
      const escola = escolas.find((e) => e.id === escolaSelecionada);
      if (escola?.sigla) return escola.sigla.toUpperCase();
    }
    return 'GERAL';
  };

  const pertenceAEscolaAtiva = (t: Turma): boolean => {
    if (isEncarregada && permittedSchoolIds.length > 0) {
      if (t.escolaId && !permittedSchoolIds.includes(t.escolaId)) return false;
      const siglaTurma = getEscolaSigla(t);
      const escolasPermitidas = escolas.filter((e) => permittedSchoolIds.includes(e.id));
      const siglasPermitidas = escolasPermitidas.map((e) => e.sigla?.toUpperCase());
      if (siglaTurma && siglaTurma !== 'GERAL' && !siglasPermitidas.includes(siglaTurma)) {
        return false;
      }
    }
    if (!escolaSelecionada) return true;
    if (t.escolaId && t.escolaId !== escolaSelecionada) return false;
    const escolaAtiva = escolas.find((e) => e.id === escolaSelecionada);
    const siglaAtiva = escolaAtiva?.sigla?.toUpperCase();
    if (siglaAtiva) {
      const siglaTurma = getEscolaSigla(t);
      if (siglaTurma && siglaTurma !== 'GERAL' && siglaTurma !== siglaAtiva) {
        return false;
      }
    }
    return true;
  };

  const turmasDaEscola = turmas.filter(pertenceAEscolaAtiva);

  const turmasFiltradas = turmasDaEscola.filter((t) => {
    if (filtroAbertas === 'abertas' && !t.matriculaAberta) return false;
    if (filtroAbertas === 'fechadas' && t.matriculaAberta) return false;
    if (buscaCodigo.trim()) {
      const q = buscaCodigo.toLowerCase();
      const matchCodigo = t.codigo.toLowerCase().includes(q);
      const matchCurso = t.cursoNome?.toLowerCase().includes(q);
      const sigla = getEscolaSigla(t).toLowerCase();
      const matchSigla = sigla.includes(q);
      if (!matchCodigo && !matchCurso && !matchSigla) return false;
    }
    return true;
  });

  const abertasCount = turmasDaEscola.filter((t) => t.matriculaAberta).length;
  const fechadasCount = turmasDaEscola.filter((t) => !t.matriculaAberta).length;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Cabeçalho da Seção */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
            Turmas & Ofertas Letivas
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 mt-1">
            Acompanhe turmas abertas, carga horária e taxa de ocupação de vagas por turma.
          </p>
        </div>

        <button
          onClick={onAbrirModalTurma}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs hover:shadow transition-all cursor-pointer self-start sm:self-auto active:scale-98"
        >
          <Plus className="w-4 h-4" />
          <span>Abrir Nova Turma</span>
        </button>
      </div>

      {/* Controles de Filtragem e Busca */}
      <div className="bg-white dark:bg-[#121214] p-3.5 sm:p-4 rounded-2xl border border-slate-200/90 dark:border-[#27272a] shadow-xs flex flex-col md:flex-row items-center gap-3">
        {/* Campo de Busca à Esquerda */}
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-zinc-500 pointer-events-none" />
          <input
            type="text"
            placeholder="Buscar por código, curso ou escola..."
            value={buscaCodigo}
            onChange={(e) => setBuscaCodigo(e.target.value)}
            className="w-full pl-10 pr-9 py-2 bg-slate-50 dark:bg-[#09090b] border border-slate-200 dark:border-[#27272a] rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-500 focus:bg-white dark:focus:bg-[#09090b] focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:focus:border-blue-500 transition"
          />
          {buscaCodigo && (
            <button
              type="button"
              onClick={() => {
                setBuscaCodigo('');
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 p-0.5 cursor-pointer"
              title="Limpar busca"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Seletor shadcn UI: Status das Turmas à Direita */}
        <div className="w-full sm:w-[190px] shrink-0">
          <Select
            value={filtroAbertas}
            onValueChange={(val: 'todas' | 'abertas' | 'fechadas') => setFiltroAbertas(val)}
          >
            <SelectTrigger className="h-9">
              <SelectValue placeholder="Status das Turmas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todas" badge={turmasDaEscola.length}>
                Todas as Turmas
              </SelectItem>
              <SelectItem value="abertas" badge={abertasCount}>
                Matrículas Abertas
              </SelectItem>
              {fechadasCount > 0 && (
                <SelectItem value="fechadas" badge={fechadasCount}>
                  Período Fechado
                </SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Grid de Turmas */}
      {turmasFiltradas.length === 0 ? (
        <div className="p-12 text-center text-slate-400 dark:text-zinc-500 bg-white dark:bg-[#121214] rounded-xl border border-slate-200/90 dark:border-[#27272a] text-xs">
          <p className="font-medium">Nenhuma turma encontrada com os filtros selecionados.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {turmasFiltradas.map((t, index) => {
            const curso = cursos.find((c) => c.id === t.cursoId);
            const sigla = getEscolaSigla(t);
            const theme = ESCOLAS_THEME[sigla] || DEFAULT_THEME;

            return (
              <TurmaCard
                key={t.id}
                turma={t}
                index={index}
                curso={curso}
                theme={theme}
                onDetalhes={abrirModalDetalhesTurma}
                onMatricular={onMatricularNaTurma}
              />
            );
          })}
        </div>
      )}

      {/* Modal Gerenciar Matérias */}
      {turmaGerenciarMaterias && (
        <ModalGerenciarMaterias
          isOpen={Boolean(turmaGerenciarMaterias)}
          turma={turmaGerenciarMaterias}
          onClose={() => setTurmaGerenciarMaterias(null)}
          onMateriasAtualizadas={onTurmasAtualizadas}
        />
      )}
    </div>
  );
}
