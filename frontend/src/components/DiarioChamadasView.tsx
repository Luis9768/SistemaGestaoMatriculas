'use client';

import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Turma,
  TurmaMateria,
  ChamadaItem,
  ChamadaResumo,
  ChamadaDetalhe,
  LoginResponse,
  api,
  formatarCpfMascara,
} from '@/lib/api';
import Link from 'next/link';
import { ModalGerenciarMaterias } from '@/components/ModalGerenciarMaterias';
import { useApp } from '@/context/AppContext';
import {
  BookOpen,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Plus,
  Search,
  Save,
  CheckCheck,
  Shield,
  ChevronDown,
  Edit3,
  Users,
  UserPlus,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Minus,
  X,
  Check,
  Calendar,
} from 'lucide-react';

/* ─── School Accent Palette Helper ─── */
interface SchoolTheme {
  name: string;
  sigla: string;
  primaryBg: string;
  primaryText: string;
  accentText: string;
  accentBorder: string;
  tabActiveBg: string;
  tabActiveText: string;
  badgeBg: string;
  dotBg: string;
  ringColor: string;
  wipeHover: string;
}

function getSchoolTheme(sigla?: string): SchoolTheme {
  switch (sigla) {
    case 'ELT':
      return {
        name: 'Escola Livre de Teatro',
        sigla: 'ELT',
        primaryBg: 'bg-violet-700 hover:bg-violet-800 text-white',
        primaryText: 'text-violet-100',
        accentText: 'text-violet-600 dark:text-violet-400',
        accentBorder: 'border-violet-600 dark:border-violet-500',
        tabActiveBg: 'bg-violet-950/15 dark:bg-violet-500/20',
        tabActiveText: 'text-violet-900 dark:text-violet-300',
        badgeBg: 'bg-violet-500/10 text-violet-700 dark:text-violet-300 border-violet-500/20',
        dotBg: 'bg-violet-500',
        ringColor: 'focus:ring-violet-500',
        wipeHover: 'hover:bg-violet-750',
      };
    case 'ELD':
      return {
        name: 'Escola Livre de Dança',
        sigla: 'ELD',
        primaryBg: 'bg-rose-600 hover:bg-rose-700 text-white',
        primaryText: 'text-rose-100',
        accentText: 'text-rose-600 dark:text-rose-400',
        accentBorder: 'border-rose-600 dark:border-rose-500',
        tabActiveBg: 'bg-rose-950/15 dark:bg-rose-500/20',
        tabActiveText: 'text-rose-900 dark:text-rose-300',
        badgeBg: 'bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/20',
        dotBg: 'bg-rose-500',
        ringColor: 'focus:ring-rose-500',
        wipeHover: 'hover:bg-rose-650',
      };
    case 'ELCV':
      return {
        name: 'Escola Livre de Cinema e Vídeo',
        sigla: 'ELCV',
        primaryBg: 'bg-sky-600 hover:bg-sky-700 text-white',
        primaryText: 'text-sky-100',
        accentText: 'text-sky-600 dark:text-sky-400',
        accentBorder: 'border-sky-600 dark:border-sky-500',
        tabActiveBg: 'bg-sky-950/15 dark:bg-sky-500/20',
        tabActiveText: 'text-sky-900 dark:text-sky-300',
        badgeBg: 'bg-sky-500/10 text-sky-700 dark:text-sky-300 border-sky-500/20',
        dotBg: 'bg-sky-500',
        ringColor: 'focus:ring-sky-500',
        wipeHover: 'hover:bg-sky-650',
      };
    case 'EMIA':
    case 'ELIA':
      return {
        name: 'Escola Municipal de Iniciação Artística',
        sigla: 'EMIA',
        primaryBg: 'bg-amber-600 hover:bg-amber-700 text-white',
        primaryText: 'text-amber-100',
        accentText: 'text-amber-600 dark:text-amber-400',
        accentBorder: 'border-amber-600 dark:border-amber-500',
        tabActiveBg: 'bg-amber-950/15 dark:bg-amber-500/20',
        tabActiveText: 'text-amber-900 dark:text-amber-300',
        badgeBg: 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20',
        dotBg: 'bg-amber-500',
        ringColor: 'focus:ring-amber-500',
        wipeHover: 'hover:bg-amber-650',
      };
    default:
      return {
        name: 'Rede de Escolas Livres',
        sigla: 'REDE',
        primaryBg: 'bg-stone-900 hover:bg-stone-800 text-white dark:bg-stone-100 dark:hover:bg-white dark:text-stone-900',
        primaryText: 'text-stone-100',
        accentText: 'text-stone-900 dark:text-stone-100',
        accentBorder: 'border-stone-600',
        tabActiveBg: 'bg-stone-500/15 dark:bg-stone-500/25',
        tabActiveText: 'text-stone-900 dark:text-stone-100',
        badgeBg: 'bg-stone-500/10 text-stone-700 dark:text-stone-300 border-stone-500/20',
        dotBg: 'bg-stone-400',
        ringColor: 'focus:ring-stone-500',
        wipeHover: 'hover:bg-stone-800',
      };
  }
}

/* ─── Tear-off Calendar Helper (Folhinha) ─── */
function parseDataFolhinha(isoDate: string) {
  if (!isoDate) {
    return { diaSemana: '', diaNumero: '', mesAbreviado: '', mesAnoGrupo: '' };
  }
  const [year, month, day] = isoDate.split('-').map(Number);
  const dateObj = new Date(year, (month || 1) - 1, day || 1);

  const diasSemana = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'];
  const meses = [
    'jan', 'fev', 'mar', 'abr', 'mai', 'jun',
    'jul', 'ago', 'set', 'out', 'nov', 'dez'
  ];
  const mesesCompletos = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  return {
    diaSemana: diasSemana[dateObj.getDay()] || '',
    diaNumero: String(day).padStart(2, '0'),
    mesAbreviado: meses[(month || 1) - 1] || '',
    mesAnoGrupo: `${mesesCompletos[(month || 1) - 1] || ''} ${year}`,
  };
}

/* ─── Sparkline Component ─── */
function SparklineFrequencia({ historico }: { historico: ChamadaResumo[] }) {
  // Ordenar cronologicamente para a curva de evolução
  const dados = useMemo(() => {
    return [...historico]
      .reverse()
      .map((c) => c.percentualPresenca);
  }, [historico]);

  if (dados.length < 2) return null;

  const min = Math.min(...dados, 50);
  const max = Math.max(...dados, 100);
  const range = max - min || 1;

  const width = 110;
  const height = 30;
  const padding = 4;

  const points = dados.map((val, idx) => {
    const x = padding + (idx / (dados.length - 1)) * (width - padding * 2);
    const y = height - padding - ((val - min) / range) * (height - padding * 2);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });

  const pathD = `M ${points.join(' L ')}`;
  const primeiro = dados[0];
  const ultimo = dados[dados.length - 1];
  const diff = ultimo - primeiro;

  return (
    <div className="flex items-center gap-2.5">
      <svg width={width} height={height} className="overflow-visible">
        <path
          d={pathD}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-stone-500 dark:text-stone-400"
        />
        {/* Ponto final */}
        {points.length > 0 && (
          <circle
            cx={points[points.length - 1].split(',')[0]}
            cy={points[points.length - 1].split(',')[1]}
            r="3"
            className="fill-stone-900 dark:fill-stone-100"
          />
        )}
      </svg>

      <div className="text-[11px] font-mono flex items-center gap-1 font-medium">
        {diff > 1 ? (
          <span className="text-emerald-700 dark:text-emerald-400 flex items-center gap-0.5">
            <TrendingUp className="w-3.5 h-3.5" />
            +{diff}%
          </span>
        ) : diff < -1 ? (
          <span className="text-rose-700 dark:text-rose-400 flex items-center gap-0.5">
            <TrendingDown className="w-3.5 h-3.5" />
            {diff}%
          </span>
        ) : (
          <span className="text-stone-600 dark:text-stone-400 flex items-center gap-0.5">
            <Minus className="w-3.5 h-3.5" />
            estável
          </span>
        )}
      </div>
    </div>
  );
}

/* ─── Custom Combobox for Turmas ─── */
interface ComboboxTurmaProps {
  turmas: Turma[];
  turmaSelecionadaId: number | null;
  onSelect: (id: number) => void;
  schoolTheme: SchoolTheme;
}

function ComboboxTurma({
  turmas,
  turmaSelecionadaId,
  onSelect,
  schoolTheme,
}: ComboboxTurmaProps) {
  const [aberto, setAberto] = useState(false);
  const [busca, setBusca] = useState('');
  const wrapperRef = useRef<HTMLDivElement>(null);

  const turmaAtual = useMemo(() => {
    return turmas.find((t) => t.id === turmaSelecionadaId) || null;
  }, [turmas, turmaSelecionadaId]);

  const filtradas = useMemo(() => {
    if (!busca.trim()) return turmas;
    const q = busca.toLowerCase();
    return turmas.filter(
      (t) =>
        (t.cursoNome && t.cursoNome.toLowerCase().includes(q)) ||
        (t.codigo && t.codigo.toLowerCase().includes(q))
    );
  }, [turmas, busca]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setAberto(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={wrapperRef}>
      <button
        type="button"
        onClick={() => setAberto((prev) => !prev)}
        className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl border border-stone-200 dark:border-[#262422] bg-white dark:bg-[#141210] hover:border-stone-400 dark:hover:border-stone-700 transition cursor-pointer text-left min-w-[240px] max-w-sm"
      >
        <span className={`w-2 h-2 rounded-full shrink-0 ${schoolTheme.dotBg}`} />
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold text-stone-900 dark:text-stone-100 truncate">
            {turmaAtual?.cursoNome || turmaAtual?.codigo || 'Selecione uma turma'}
          </p>
          {turmaAtual && (
            <p className="text-[10px] text-stone-600 dark:text-stone-400 font-mono truncate">
              {turmaAtual.codigo}
            </p>
          )}
        </div>
        <ChevronDown className="w-3.5 h-3.5 text-stone-400 shrink-0" />
      </button>

      {aberto && (
        <div className="absolute top-full left-0 mt-1.5 w-72 bg-white dark:bg-[#141210] border border-stone-200 dark:border-[#262422] rounded-xl shadow-xl z-50 p-2 text-xs">
          <div className="relative mb-2">
            <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              autoFocus
              placeholder="Buscar turma..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-stone-50 dark:bg-[#1c1a18] border border-stone-200 dark:border-[#2e2a27] text-stone-900 dark:text-stone-100 placeholder:text-stone-400 focus:outline-none focus:ring-1 focus:ring-stone-400 text-xs"
            />
          </div>

          <div className="max-h-56 overflow-y-auto space-y-1">
            {filtradas.length === 0 ? (
              <div className="p-3 text-center text-[11px] text-stone-400">
                Nenhuma turma encontrada.
              </div>
            ) : (
              filtradas.map((t) => {
                const isSelected = t.id === turmaSelecionadaId;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => {
                      if (t.id) {
                        onSelect(t.id);
                        setAberto(false);
                      }
                    }}
                    className={`w-full flex items-center justify-between p-2 rounded-lg text-left transition cursor-pointer ${
                      isSelected
                        ? `${schoolTheme.tabActiveBg} ${schoolTheme.tabActiveText} font-semibold`
                        : 'text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-[#1c1a18]'
                    }`}
                  >
                    <div className="min-w-0 pr-2">
                      <p className="truncate font-medium">{t.cursoNome || t.codigo}</p>
                      <p className="text-[10px] text-stone-600 dark:text-stone-400 font-mono truncate">
                        {t.codigo}
                      </p>
                    </div>
                    {isSelected && <Check className="w-3.5 h-3.5 shrink-0" />}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Segmented Tabs for Subjects (Matérias) ─── */
interface AbasMateriasProps {
  materias: TurmaMateria[];
  materiaSelecionadaId: number | null;
  onSelect: (id: number) => void;
  onAdicionarMateria: () => void;
  schoolTheme: SchoolTheme;
}

function AbasMaterias({
  materias,
  materiaSelecionadaId,
  onSelect,
  onAdicionarMateria,
  schoolTheme,
}: AbasMateriasProps) {
  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      <div className="flex items-center gap-1 p-1 bg-stone-100 dark:bg-[#181614] rounded-xl border border-stone-200/80 dark:border-[#262422] overflow-x-auto max-w-full">
        {materias.map((m) => {
          const ativo = m.id === materiaSelecionadaId;
          return (
            <button
              key={m.id}
              type="button"
              onClick={() => {
                if (m.id) onSelect(m.id);
              }}
              className={`relative px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer shrink-0 ${
                ativo
                  ? 'text-stone-900 dark:text-stone-100 font-semibold'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
              }`}
            >
              {ativo && (
                <motion.span
                  layoutId="activeMateriaTab"
                  className={`absolute inset-0 rounded-lg ${schoolTheme.tabActiveBg} border ${schoolTheme.accentBorder}`}
                  transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                />
              )}
              <span className="relative z-10">{m.nome}</span>
            </button>
          );
        })}

        {/* Botão de Adicionar Matéria no Fim da Linha de Abas */}
        <button
          type="button"
          onClick={onAdicionarMateria}
          className="relative z-10 p-1.5 rounded-lg text-stone-500 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-200/60 dark:hover:bg-[#262422] transition cursor-pointer shrink-0"
          title="Adicionar nova matéria a esta turma"
          aria-label="Adicionar matéria"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

/* ─── Executive Summary Strip (Faixa de Resumo) ─── */
interface ResumoFrequenciaFaixaProps {
  frequenciaMedia: number;
  totalAulas: number;
  alunosEmRisco: number;
  historico: ChamadaResumo[];
  schoolTheme: SchoolTheme;
}

function ResumoFrequenciaFaixa({
  frequenciaMedia,
  totalAulas,
  alunosEmRisco,
  historico,
}: ResumoFrequenciaFaixaProps) {
  return (
    <section className="bg-stone-50/70 dark:bg-[#141210] border border-stone-200/80 dark:border-[#262422] rounded-xl p-4 sm:px-6 flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center gap-6 sm:gap-10 flex-wrap">
        {/* Frequência Média */}
        <div>
          <span className="block text-[11px] font-medium text-stone-500 dark:text-stone-400">
            Frequência média
          </span>
          <span className="text-xl sm:text-2xl font-bold font-mono text-stone-900 dark:text-stone-100">
            {totalAulas > 0 ? `${frequenciaMedia}%` : '—'}
          </span>
        </div>

        {/* Total de Aulas */}
        <div>
          <span className="block text-[11px] font-medium text-stone-500 dark:text-stone-400">
            Total de aulas
          </span>
          <span className="text-xl sm:text-2xl font-bold text-stone-900 dark:text-stone-100">
            {totalAulas}
          </span>
        </div>

        {/* Alunos em Risco */}
        <div>
          <span className="block text-[11px] font-medium text-stone-500 dark:text-stone-400">
            Alunos em risco
          </span>
          <div className="flex items-center gap-1.5">
            <span
              className={`text-xl sm:text-2xl font-bold ${
                alunosEmRisco > 0
                  ? 'text-rose-600 dark:text-rose-400'
                  : 'text-stone-900 dark:text-stone-100'
              }`}
            >
              {alunosEmRisco}
            </span>
            {alunosEmRisco > 0 && (
              <span className="text-[10px] font-medium text-rose-600 dark:text-rose-400 bg-rose-500/10 px-1.5 py-0.5 rounded">
                faltas acumuladas
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Sparkline de Evolução Aula a Aula */}
      {historico.length >= 2 && (
        <div className="border-t sm:border-t-0 sm:border-l border-stone-200 dark:border-[#262422] pt-3 sm:pt-0 sm:pl-6">
          <span className="block text-[10px] font-medium text-stone-600 dark:text-stone-400 mb-1">
            Tendência aula a aula
          </span>
          <SparklineFrequencia historico={historico} />
        </div>
      )}
    </section>
  );
}

/* ─── Attendance Seats Metaphor (Poltronas de Presença) ─── */
function PoltronasPresenca({
  presentes,
  faltas,
}: {
  presentes: number;
  faltas: number;
}) {
  const total = presentes + faltas;
  const maxExibicao = 24;

  // Se o número for muito grande para caber na linha, exibe amostragem proporcional
  const presentesDots =
    total > maxExibicao
      ? Math.round((presentes / total) * maxExibicao)
      : presentes;
  const faltasDots =
    total > maxExibicao ? maxExibicao - presentesDots : faltas;

  return (
    <div
      className="flex items-center gap-1 flex-wrap"
      aria-label={`${presentes} de ${total} presentes`}
      title={`${presentes} presentes · ${faltas} faltas`}
    >
      {Array.from({ length: presentesDots }).map((_, i) => (
        <span
          key={`p-${i}`}
          className="w-2 h-2 rounded-full bg-emerald-500 shadow-2xs transition-transform hover:scale-125"
        />
      ))}
      {Array.from({ length: faltasDots }).map((_, i) => (
        <span
          key={`f-${i}`}
          className="w-2 h-2 rounded-full border border-rose-500 bg-rose-500/20 shadow-2xs transition-transform hover:scale-125"
        />
      ))}
    </div>
  );
}

/* ─── Chamada Row Component (Linha de Chamada) ─── */
interface ChamadaLinhaProps {
  chamada: ChamadaResumo;
  onAbrir: () => void;
  onEditar: () => void;
}

function ChamadaLinha({
  chamada,
  onAbrir,
  onEditar,
}: ChamadaLinhaProps) {
  const { diaSemana, diaNumero, mesAbreviado } = parseDataFolhinha(
    chamada.dataAula
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="group flex flex-col sm:flex-row sm:items-center justify-between p-3.5 sm:px-5 rounded-xl border border-stone-200/80 dark:border-[#262422] bg-white dark:bg-[#141210] hover:border-stone-400/80 dark:hover:border-stone-700/80 hover:bg-stone-50/50 dark:hover:bg-[#181614] transition-all duration-150 gap-3"
    >
      {/* Esquerda: Folhinha de Calendário + Dados de Presença */}
      <div className="flex items-center gap-4 min-w-0">
        {/* Folhinha */}
        <div className="w-11 h-12 rounded-lg bg-stone-100 dark:bg-[#1a1816] border border-stone-200/80 dark:border-[#2a2724] flex flex-col items-center justify-center shrink-0">
          <span className="text-[9px] uppercase font-mono font-medium text-stone-500 dark:text-stone-400 leading-none">
            {diaSemana}
          </span>
          <span className="text-base font-bold text-stone-900 dark:text-stone-100 leading-tight">
            {diaNumero}
          </span>
          <span className="text-[9px] font-mono text-stone-500 dark:text-stone-400 leading-none">
            {mesAbreviado}
          </span>
        </div>

        {/* Centro: Poltronas e Contagem */}
        <div className="min-w-0 space-y-1">
          <PoltronasPresenca
            presentes={chamada.totalPresentes}
            faltas={chamada.totalFaltas}
          />
          <p className="text-[11px] text-stone-600 dark:text-stone-400">
            <strong className="text-stone-800 dark:text-stone-200 font-semibold">
              {chamada.totalPresentes} presentes
            </strong>{' '}
            · {chamada.totalFaltas} faltas
          </p>
        </div>
      </div>

      {/* Direita: Percentual Mono, Responsável e Ações */}
      <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 border-t sm:border-t-0 border-stone-100 dark:border-[#262422] pt-2 sm:pt-0">
        {/* Porcentagem em Fonte Mono */}
        <span className="text-sm font-semibold font-mono text-stone-800 dark:text-stone-200">
          {chamada.percentualPresenca}%
        </span>

        {/* Registrado por X */}
        <div className="hidden md:block text-right max-w-[140px] truncate">
          <span className="block text-[10px] text-stone-500 dark:text-stone-400">
            Registrado por
          </span>
          <span className="text-xs text-stone-700 dark:text-stone-300 font-medium truncate block">
            {chamada.responsavelRegistro || 'Coordenação'}
          </span>
        </div>

        {/* Ações (Aparecem no hover / foco) */}
        <div className="flex items-center gap-1.5 opacity-90 sm:opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            type="button"
            onClick={onAbrir}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-white dark:bg-stone-100 dark:hover:bg-white dark:text-stone-900 text-xs font-medium transition cursor-pointer"
          >
            <span>Abrir chamada</span>
            <ArrowRight className="w-3 h-3" />
          </button>

          <button
            type="button"
            onClick={onEditar}
            className="p-1.5 rounded-lg text-stone-500 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-200/60 dark:hover:bg-[#262422] transition cursor-pointer"
            title="Editar chamada"
            aria-label="Editar chamada"
          >
            <Edit3 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

/* ─── Slide-over Drawer for Taking Attendance (Fazer a Chamada) ─── */
interface ChamadaDrawerProps {
  aberto: boolean;
  modo: 'novo' | 'edicao' | 'detalhes';
  turma: Turma | null;
  materia: TurmaMateria | null;
  dataAula: string;
  onDataAulaChange: (d: string) => void;
  responsavelNome: string;
  onResponsavelChange: (r: string) => void;
  conteudoMinistrado: string;
  onConteudoChange: (c: string) => void;
  itens: ChamadaItem[];
  onTogglePresenca: (matriculaId: number, status: 'PRESENTE' | 'FALTA' | 'JUSTIFICADA') => void;
  onMarcarTodos: (status: 'PRESENTE' | 'FALTA') => void;
  onSalvar: () => Promise<void>;
  onClose: () => void;
  onMudarParaEdicao: () => void;
  salvando: boolean;
  loadingItens: boolean;
  usuarioLogado: LoginResponse | null;
  schoolTheme: SchoolTheme;
}

function ChamadaDrawer({
  aberto,
  modo,
  turma,
  materia,
  dataAula,
  onDataAulaChange,
  responsavelNome,
  onResponsavelChange,
  conteudoMinistrado,
  onConteudoChange,
  itens,
  onTogglePresenca,
  onMarcarTodos,
  onSalvar,
  onClose,
  onMudarParaEdicao,
  salvando,
  loadingItens,
  usuarioLogado,
  schoolTheme,
}: ChamadaDrawerProps) {
  const [focadoIndex, setFocadoIndex] = useState(0);

  // Atalhos de teclado (P presente, F falta, setas para navegar)
  useEffect(() => {
    if (!aberto || modo === 'detalhes') return;

    function handleKeyDown(e: KeyboardEvent) {
      // Ignorar se o usuário estiver digitando em um input de texto
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;

      if (e.key === 'p' || e.key === 'P') {
        if (itens[focadoIndex]) {
          onTogglePresenca(itens[focadoIndex].matriculaId, 'PRESENTE');
        }
      } else if (e.key === 'f' || e.key === 'F') {
        if (itens[focadoIndex]) {
          onTogglePresenca(itens[focadoIndex].matriculaId, 'FALTA');
        }
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setFocadoIndex((prev) => Math.min(prev + 1, itens.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setFocadoIndex((prev) => Math.max(prev - 1, 0));
      } else if (e.key === 'Escape') {
        onClose();
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [aberto, modo, itens, focadoIndex, onTogglePresenca, onClose]);

  const presentesCount = itens.filter((i) => i.status === 'PRESENTE').length;
  const faltasCount = itens.filter((i) => i.status === 'FALTA').length;
  const totalCount = itens.length;
  const percentual = totalCount > 0 ? Math.round((presentesCount / totalCount) * 100) : 0;

  return (
    <AnimatePresence>
      {aberto && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop com blur sutil */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
          />

          {/* Drawer Lateral */}
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 350, damping: 35 }}
            className="relative z-10 w-full max-w-xl bg-white dark:bg-[#121110] border-l border-stone-200 dark:border-[#262422] shadow-2xl flex flex-col h-full overflow-hidden"
          >
            {/* Header do Drawer */}
            <header className="p-4 sm:p-6 border-b border-stone-200/80 dark:border-[#262422] flex items-center justify-between shrink-0 bg-stone-50/50 dark:bg-[#151312]">
              <div>
                <span className="text-[10px] font-mono text-stone-500 dark:text-stone-400">
                  {turma?.codigo} · {materia?.nome}
                </span>
                <h2 className="font-serif text-xl sm:text-2xl font-normal text-stone-900 dark:text-stone-100 tracking-tight">
                  {modo === 'detalhes'
                    ? 'Registro da Chamada'
                    : modo === 'edicao'
                    ? 'Editar Chamada'
                    : 'Fazer Chamada'}
                </h2>
              </div>

              <div className="flex items-center gap-2">
                {modo === 'detalhes' && (
                  <button
                    type="button"
                    onClick={onMudarParaEdicao}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-stone-200 dark:border-[#262422] hover:bg-stone-100 dark:hover:bg-[#1f1d1a] text-xs font-medium text-stone-800 dark:text-stone-200 transition cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Editar</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={onClose}
                  className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-[#1f1d1a] transition cursor-pointer"
                  title="Fechar (Esc)"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </header>

            {/* Conteúdo com Scroll */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
              {/* Contexto da Aula (Data + Professor) */}
              <section className="space-y-3.5 p-3.5 rounded-xl bg-stone-50 dark:bg-[#171513] border border-stone-200/80 dark:border-[#262422]">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Data da Aula */}
                  <div>
                    <label
                      htmlFor="drawer-data-aula"
                      className="block text-[11px] font-medium text-stone-600 dark:text-stone-400 mb-1"
                    >
                      Data da Aula
                    </label>
                    <input
                      id="drawer-data-aula"
                      type="date"
                      disabled={modo === 'detalhes'}
                      value={dataAula}
                      onChange={(e) => onDataAulaChange(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs font-semibold rounded-lg bg-white dark:bg-[#121110] border border-stone-200 dark:border-[#262422] text-stone-900 dark:text-stone-100 disabled:opacity-75 focus:outline-none focus:ring-1 focus:ring-stone-400"
                    />
                  </div>

                  {/* Responsável */}
                  <div>
                    <label
                      htmlFor="drawer-responsavel"
                      className="block text-[11px] font-medium text-stone-600 dark:text-stone-400 mb-1"
                    >
                      Professor / Responsável
                    </label>
                    <input
                      id="drawer-responsavel"
                      type="text"
                      disabled={modo === 'detalhes'}
                      value={responsavelNome}
                      onChange={(e) => onResponsavelChange(e.target.value)}
                      placeholder="Nome do educador..."
                      className="w-full px-3 py-1.5 text-xs font-semibold rounded-lg bg-white dark:bg-[#121110] border border-stone-200 dark:border-[#262422] text-stone-900 dark:text-stone-100 disabled:opacity-75 focus:outline-none focus:ring-1 focus:ring-stone-400"
                    />
                  </div>
                </div>

                {/* Conteúdo Ministrado (Opcional) */}
                <div>
                  <label
                    htmlFor="drawer-conteudo"
                    className="block text-[11px] font-medium text-stone-600 dark:text-stone-400 mb-1"
                  >
                    Conteúdo trabalhado (opcional)
                  </label>
                  <input
                    id="drawer-conteudo"
                    type="text"
                    disabled={modo === 'detalhes'}
                    value={conteudoMinistrado}
                    onChange={(e) => onConteudoChange(e.target.value)}
                    placeholder="Ex: Exercício de improvisação e voz..."
                    className="w-full px-3 py-1.5 text-xs rounded-lg bg-white dark:bg-[#121110] border border-stone-200 dark:border-[#262422] text-stone-900 dark:text-stone-100 disabled:opacity-75 focus:outline-none focus:ring-1 focus:ring-stone-400"
                  />
                </div>
              </section>

              {/* Ações Rápidas + Dica de Teclado */}
              {modo !== 'detalhes' && itens.length > 0 && (
                <div className="flex items-center justify-between gap-2 flex-wrap text-xs">
                  <button
                    type="button"
                    onClick={() => onMarcarTodos('PRESENTE')}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-stone-200 dark:border-[#262422] hover:bg-stone-100 dark:hover:bg-[#1a1816] text-stone-700 dark:text-stone-300 font-medium transition cursor-pointer"
                  >
                    <CheckCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>Marcar todos presentes</span>
                  </button>

                  <p className="text-[10px] text-stone-400 font-mono hidden sm:block">
                    Teclado: <kbd className="px-1 py-0.5 rounded bg-stone-100 dark:bg-[#201e1b]">P</kbd> presente · <kbd className="px-1 py-0.5 rounded bg-stone-100 dark:bg-[#201e1b]">F</kbd> falta
                  </p>
                </div>
              )}

              {/* Lista de Alunos (Táteis com Animação de Salto) */}
              {loadingItens ? (
                <div className="py-12 text-center">
                  <div className="w-6 h-6 border-2 border-stone-400 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                  <p className="text-xs text-stone-400">Carregando alunos da turma...</p>
                </div>
              ) : itens.length === 0 ? (
                <div className="p-8 rounded-xl border border-dashed border-stone-200 dark:border-[#262422] text-center space-y-3">
                  <Users className="w-6 h-6 mx-auto text-stone-400" />
                  <p className="text-xs text-stone-600 dark:text-stone-400">
                    Nenhum aluno matriculado nesta turma ainda.
                  </p>
                  <Link
                    href="/matriculas"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-900 dark:text-stone-100 underline underline-offset-4"
                  >
                    Ir para Matrículas
                  </Link>
                </div>
              ) : (
                <div className="divide-y divide-stone-100 dark:divide-[#201e1b] rounded-xl border border-stone-200/80 dark:border-[#262422] overflow-hidden">
                  {itens.map((item, index) => {
                    const isPresente = item.status === 'PRESENTE';
                    const isFalta = item.status === 'FALTA';
                    const isFocado = index === focadoIndex;

                    return (
                      <div
                        key={item.matriculaId}
                        onClick={() => setFocadoIndex(index)}
                        className={`p-3 sm:px-4 flex items-center justify-between gap-3 transition-colors ${
                          isFocado
                            ? 'bg-stone-50 dark:bg-[#181614]'
                            : 'hover:bg-stone-50/50 dark:hover:bg-[#141210]'
                        }`}
                      >
                        {/* Aluno */}
                        <div className="min-w-0 flex items-center gap-3">
                          <span className="w-6 text-[11px] font-mono text-stone-400 shrink-0 text-right">
                            {index + 1}.
                          </span>
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-stone-900 dark:text-stone-100 truncate">
                              {item.alunoNome}
                            </p>
                            {item.alunoCpf && (
                              <p className="text-[10px] text-stone-600 dark:text-stone-400 font-mono">
                                {formatarCpfMascara(item.alunoCpf)}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Botões Táteis de Presença (com animação física de salto) */}
                        {modo === 'detalhes' ? (
                          <span
                            className={`text-[11px] font-mono font-medium px-2 py-0.5 rounded ${
                              isPresente
                                ? 'text-emerald-700 dark:text-emerald-400 bg-emerald-500/10'
                                : 'text-rose-700 dark:text-rose-400 bg-rose-500/10'
                            }`}
                          >
                            {isPresente ? 'Presente' : 'Faltou'}
                          </span>
                        ) : (
                          <div className="flex items-center gap-1 shrink-0">
                            <motion.button
                              type="button"
                              whileTap={{ scale: 0.92 }}
                              onClick={() =>
                                onTogglePresenca(item.matriculaId, 'PRESENTE')
                              }
                              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition cursor-pointer flex items-center gap-1 ${
                                isPresente
                                  ? 'bg-emerald-600 text-white font-semibold shadow-2xs'
                                  : 'text-stone-500 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-[#201e1b]'
                              }`}
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>P</span>
                            </motion.button>

                            <motion.button
                              type="button"
                              whileTap={{ scale: 0.92 }}
                              onClick={() =>
                                onTogglePresenca(item.matriculaId, 'FALTA')
                              }
                              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition cursor-pointer flex items-center gap-1 ${
                                isFalta
                                  ? 'bg-rose-600 text-white font-semibold shadow-2xs'
                                  : 'text-stone-500 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-[#201e1b]'
                              }`}
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              <span>F</span>
                            </motion.button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer Fixo do Drawer com Contador ao Vivo */}
            <footer className="p-4 sm:p-5 border-t border-stone-200/80 dark:border-[#262422] bg-stone-50/70 dark:bg-[#151312] flex items-center justify-between shrink-0">
              {/* Contador Fixo */}
              <div className="text-xs font-mono text-stone-600 dark:text-stone-400">
                <strong className="text-emerald-700 dark:text-emerald-400">
                  {presentesCount} presentes
                </strong>{' '}
                · <span className="text-rose-700 dark:text-rose-400">{faltasCount} faltas</span>{' '}
                ({percentual}%)
              </div>

              {/* Botões de Ação */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3.5 py-2 rounded-xl text-xs font-medium text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 transition cursor-pointer"
                >
                  {modo === 'detalhes' ? 'Fechar' : 'Cancelar'}
                </button>

                {modo !== 'detalhes' && (
                  <button
                    type="button"
                    onClick={onSalvar}
                    disabled={salvando || itens.length === 0}
                    className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${schoolTheme.primaryBg}`}
                  >
                    {salvando ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Salvando...</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-3.5 h-3.5" />
                        <span>Salvar chamada</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </footer>
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}

/* ─── Main Component (DiarioChamadasView) ─── */
interface DiarioChamadasViewProps {
  escolaId: number | null;
  turmas: Turma[];
  usuarioLogado: LoginResponse | null;
}

export function DiarioChamadasView({
  escolaId,
  turmas,
  usuarioLogado,
}: DiarioChamadasViewProps) {
  // Verificação estrita de permissão (apenas ADMIN e ENCARREGADA)
  const temPermissao =
    usuarioLogado?.role === 'ROLE_ADMIN' ||
    usuarioLogado?.role === 'ROLE_ENCARREGADA';

  // Filtrar turmas da escola ativa
  const turmasEscola = useMemo(() => {
    if (!escolaId) return turmas;
    return turmas.filter((t) => t.escolaId === escolaId);
  }, [turmas, escolaId]);

  // Estados de seleção
  const [turmaSelecionadaId, setTurmaSelecionadaId] = useState<number | null>(null);
  const [materiaSelecionadaId, setMateriaSelecionadaId] = useState<number | null>(null);

  // Dados carregados da API
  const [historicoChamadas, setHistoricoChamadas] = useState<ChamadaResumo[]>([]);
  const [loadingHistorico, setLoadingHistorico] = useState(false);

  // Drawer lateral (Slide-over)
  const [drawerAberto, setDrawerAberto] = useState(false);
  const [drawerModo, setDrawerModo] = useState<'novo' | 'edicao' | 'detalhes'>('novo');
  const [dataAulaDrawer, setDataAulaDrawer] = useState(() => new Date().toISOString().split('T')[0]);
  const [responsavelDrawer, setResponsavelDrawer] = useState(usuarioLogado?.nome || '');
  const [conteudoDrawer, setConteudoDrawer] = useState('');
  const [itensDrawer, setItensDrawer] = useState<ChamadaItem[]>([]);
  const [loadingItensDrawer, setLoadingItensDrawer] = useState(false);
  const [salvandoDrawer, setSalvandoDrawer] = useState(false);

  // Matérias e Modais
  const [materiasLocaisMap, setMateriasLocaisMap] = useState<Record<number, TurmaMateria[]>>({});
  const [modalMateriasAberto, setModalMateriasAberto] = useState(false);
  const { carregarDadosEscola } = useApp();

  // Feedback discreto
  const [toastMsg, setToastMsg] = useState<{ tipo: 'sucesso' | 'erro'; texto: string } | null>(null);

  // Seleciona primeira turma automaticamente
  useEffect(() => {
    if (turmasEscola.length > 0 && !turmaSelecionadaId) {
      setTurmaSelecionadaId(turmasEscola[0].id || null);
    }
  }, [turmasEscola, turmaSelecionadaId]);

  const turmaAtual = useMemo(() => {
    return turmasEscola.find((t) => t.id === turmaSelecionadaId) || null;
  }, [turmasEscola, turmaSelecionadaId]);

  // Carregar matérias da turma selecionada
  useEffect(() => {
    if (turmaSelecionadaId) {
      api.getMateriasTurma(turmaSelecionadaId)
        .then((mats) => {
          setMateriasLocaisMap((prev) => ({ ...prev, [turmaSelecionadaId]: mats }));
        })
        .catch(() => {});
    }
  }, [turmaSelecionadaId]);

  const materiasTurma = useMemo(() => {
    if (!turmaAtual?.id) return [];
    if (materiasLocaisMap[turmaAtual.id] !== undefined) {
      return materiasLocaisMap[turmaAtual.id];
    }
    return turmaAtual.materias || [];
  }, [turmaAtual, materiasLocaisMap]);

  // Seleciona primeira matéria automaticamente
  useEffect(() => {
    if (materiasTurma.length > 0) {
      const existe = materiasTurma.some((m) => m.id === materiaSelecionadaId);
      if (!existe) {
        setMateriaSelecionadaId(materiasTurma[0].id || null);
      }
    } else {
      setMateriaSelecionadaId(null);
    }
  }, [materiasTurma, materiaSelecionadaId]);

  const materiaAtual = useMemo(() => {
    return materiasTurma.find((m) => m.id === materiaSelecionadaId) || null;
  }, [materiasTurma, materiaSelecionadaId]);

  // Paleta da escola
  const schoolTheme = useMemo(() => {
    return getSchoolTheme(turmaAtual?.escolaSigla);
  }, [turmaAtual]);

  // Carregar histórico de chamadas ao mudar turma e matéria
  const carregarHistorico = useCallback(async () => {
    if (!turmaSelecionadaId || !materiaSelecionadaId) {
      setHistoricoChamadas([]);
      return;
    }
    setLoadingHistorico(true);
    try {
      const dados = await api.listarChamadas(turmaSelecionadaId, materiaSelecionadaId);
      setHistoricoChamadas(dados);
    } catch {
      setHistoricoChamadas([]);
    } finally {
      setLoadingHistorico(false);
    }
  }, [turmaSelecionadaId, materiaSelecionadaId]);

  useEffect(() => {
    carregarHistorico();
  }, [carregarHistorico]);

  // Cálculo das métricas da Faixa de Resumo
  const frequenciaMedia = useMemo(() => {
    if (historicoChamadas.length === 0) return 0;
    const soma = historicoChamadas.reduce((acc, c) => acc + c.percentualPresenca, 0);
    return Math.round(soma / historicoChamadas.length);
  }, [historicoChamadas]);

  const totalAulas = historicoChamadas.length;

  const alunosEmRisco = useMemo(() => {
    if (historicoChamadas.length === 0) return 0;
    // Estimativa baseada nas aulas mais recentes com faltas
    const ultimasFaltas = historicoChamadas.slice(0, 3).reduce((acc, c) => acc + c.totalFaltas, 0);
    return Math.min(ultimasFaltas, Math.max(...historicoChamadas.map((c) => c.totalFaltas), 0));
  }, [historicoChamadas]);

  // Agrupamento de chamadas por mês
  const chamadasPorMes = useMemo(() => {
    const mapa = new Map<string, ChamadaResumo[]>();
    for (const ch of historicoChamadas) {
      const { mesAnoGrupo } = parseDataFolhinha(ch.dataAula);
      if (!mapa.has(mesAnoGrupo)) {
        mapa.set(mesAnoGrupo, []);
      }
      mapa.get(mesAnoGrupo)!.push(ch);
    }
    return Array.from(mapa.entries());
  }, [historicoChamadas]);

  // Abrir Drawer para Nova Chamada
  const handleNovaChamada = async () => {
    if (!turmaSelecionadaId || !materiaSelecionadaId) return;
    const hoje = new Date().toISOString().split('T')[0];
    setDataAulaDrawer(hoje);
    setResponsavelDrawer(
      materiaAtual?.professorResponsavel || usuarioLogado?.nome || ''
    );
    setConteudoDrawer('');
    setDrawerModo('novo');
    setDrawerAberto(true);
    setLoadingItensDrawer(true);

    try {
      const alunos = await api.obterAlunosParaChamada(
        turmaSelecionadaId,
        materiaSelecionadaId,
        hoje
      );
      setItensDrawer(alunos);
    } catch {
      setItensDrawer([]);
    } finally {
      setLoadingItensDrawer(false);
    }
  };

  // Abrir Drawer para Abrir / Inspecionar Chamada
  const handleAbrirChamada = async (dataAula: string) => {
    if (!materiaSelecionadaId || !turmaSelecionadaId) return;
    setDataAulaDrawer(dataAula);
    setDrawerModo('detalhes');
    setDrawerAberto(true);
    setLoadingItensDrawer(true);

    try {
      const detalhe = await api.obterDetalheChamada(materiaSelecionadaId, dataAula);
      setResponsavelDrawer(detalhe.responsavelRegistro || '');
      setConteudoDrawer(detalhe.conteudoMinistrado || '');
      setItensDrawer(detalhe.itens || []);
    } catch {
      setToastMsg({ tipo: 'erro', texto: 'Erro ao carregar detalhes da aula.' });
      setDrawerAberto(false);
    } finally {
      setLoadingItensDrawer(false);
    }
  };

  // Abrir Drawer para Editar Chamada
  const handleEditarChamada = async (dataAula: string) => {
    if (!materiaSelecionadaId || !turmaSelecionadaId) return;
    setDataAulaDrawer(dataAula);
    setDrawerModo('edicao');
    setDrawerAberto(true);
    setLoadingItensDrawer(true);

    try {
      const detalhe = await api.obterDetalheChamada(materiaSelecionadaId, dataAula);
      setResponsavelDrawer(detalhe.responsavelRegistro || '');
      setConteudoDrawer(detalhe.conteudoMinistrado || '');
      setItensDrawer(detalhe.itens || []);
    } catch {
      setToastMsg({ tipo: 'erro', texto: 'Erro ao carregar aula para edição.' });
      setDrawerAberto(false);
    } finally {
      setLoadingItensDrawer(false);
    }
  };

  // Alternar presença dentro do Drawer
  const handleTogglePresencaDrawer = (
    matriculaId: number,
    novoStatus: 'PRESENTE' | 'FALTA' | 'JUSTIFICADA'
  ) => {
    setItensDrawer((prev) =>
      prev.map((i) =>
        i.matriculaId === matriculaId ? { ...i, status: novoStatus } : i
      )
    );
  };

  // Marcar todos
  const handleMarcarTodosDrawer = (status: 'PRESENTE' | 'FALTA') => {
    setItensDrawer((prev) => prev.map((i) => ({ ...i, status })));
  };

  // Salvar chamada pelo Drawer
  const handleSalvarDrawer = async () => {
    if (!turmaSelecionadaId || !materiaSelecionadaId) return;
    if (!responsavelDrawer.trim()) {
      setToastMsg({ tipo: 'erro', texto: 'Informe o nome do responsável.' });
      return;
    }
    if (itensDrawer.length === 0) {
      setToastMsg({ tipo: 'erro', texto: 'Turma sem alunos para registrar.' });
      return;
    }

    setSalvandoDrawer(true);
    try {
      await api.salvarChamada({
        turmaId: turmaSelecionadaId,
        materiaId: materiaSelecionadaId,
        dataAula: dataAulaDrawer,
        responsavelRegistro: responsavelDrawer.trim(),
        conteudoMinistrado: conteudoDrawer.trim() || undefined,
        itens: itensDrawer,
      });

      setToastMsg({ tipo: 'sucesso', texto: 'Chamada registrada com sucesso.' });
      setDrawerAberto(false);
      carregarHistorico();
    } catch (err: any) {
      setToastMsg({ tipo: 'erro', texto: err.message || 'Erro ao salvar chamada.' });
    } finally {
      setSalvandoDrawer(false);
    }
  };

  // Temporizador do Toast
  useEffect(() => {
    if (toastMsg) {
      const t = setTimeout(() => setToastMsg(null), 3500);
      return () => clearTimeout(t);
    }
  }, [toastMsg]);

  // Se não tiver permissão
  if (!temPermissao) {
    return (
      <main className="p-6 max-w-3xl mx-auto">
        <div className="bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/60 rounded-xl p-6 text-center space-y-2">
          <Shield className="w-6 h-6 text-rose-600 dark:text-rose-400 mx-auto" />
          <h2 className="font-serif text-lg text-stone-900 dark:text-stone-100">
            Acesso Restrito ao Diário de Chamadas
          </h2>
          <p className="text-xs text-stone-600 dark:text-stone-400">
            Apenas Administradores e Encarregadas possuem permissão para realizar chamadas.
          </p>
        </div>
      </main>
    );
  }

  return (
    <div className="space-y-6">
      {/* Toast Feedback */}
      {toastMsg && (
        <div
          role="alert"
          className={`fixed bottom-6 right-6 z-50 px-4 py-2.5 rounded-xl text-xs font-semibold shadow-lg border flex items-center gap-2 animate-in fade-in duration-200 ${
            toastMsg.tipo === 'sucesso'
              ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-200 border-emerald-300 dark:border-emerald-800'
              : 'bg-rose-50 dark:bg-rose-950 text-rose-900 dark:text-rose-200 border-rose-300 dark:border-rose-800'
          }`}
        >
          {toastMsg.tipo === 'sucesso' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          ) : (
            <XCircle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
          )}
          <span>{toastMsg.texto}</span>
        </div>
      )}

      {/* ─── 2. Cabeçalho de Página Enxuto (sem caixa gigante de filtros) ─── */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200/80 dark:border-[#262422] pb-5">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-normal text-stone-900 dark:text-stone-100 tracking-tight">
            Diário de chamadas
          </h1>
          <div className="flex items-center gap-2.5 mt-2 flex-wrap">
            {/* Turma: Combobox customizado */}
            <ComboboxTurma
              turmas={turmasEscola}
              turmaSelecionadaId={turmaSelecionadaId}
              onSelect={(id) => setTurmaSelecionadaId(id)}
              schoolTheme={schoolTheme}
            />

            {/* Matérias: Segmented tabs */}
            {materiasTurma.length > 0 && (
              <AbasMaterias
                materias={materiasTurma}
                materiaSelecionadaId={materiaSelecionadaId}
                onSelect={(id) => setMateriaSelecionadaId(id)}
                onAdicionarMateria={() => setModalMateriasAberto(true)}
                schoolTheme={schoolTheme}
              />
            )}
          </div>
        </div>

        {/* Botão Primário Único da Página: Nova Chamada */}
        <div className="shrink-0 self-start sm:self-auto">
          {turmaAtual && materiaAtual && (
            <button
              type="button"
              onClick={handleNovaChamada}
              className={`inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-medium text-xs shadow-xs transition-all cursor-pointer ${schoolTheme.primaryBg}`}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Nova chamada</span>
            </button>
          )}
        </div>
      </header>

      {/* ─── 3. Resumo Antes da Lista (3 números + Sparkline) ─── */}
      {turmaAtual && materiaAtual && (
        <ResumoFrequenciaFaixa
          frequenciaMedia={frequenciaMedia}
          totalAulas={totalAulas}
          alunosEmRisco={alunosEmRisco}
          historico={historicoChamadas}
          schoolTheme={schoolTheme}
        />
      )}

      {/* ─── 4. Lista Agrupada por Mês no Lugar de Cards ─── */}
      <section className="space-y-6">
        {loadingHistorico ? (
          <div className="p-12 text-center rounded-xl border border-stone-200/80 dark:border-[#262422] bg-white dark:bg-[#141210]">
            <div className="w-6 h-6 border-2 border-stone-400 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-xs text-stone-500 dark:text-stone-400">
              Carregando chamadas...
            </p>
          </div>
        ) : historicoChamadas.length === 0 ? (
          <div className="p-10 sm:p-14 text-center rounded-xl border border-dashed border-stone-200 dark:border-[#262422] bg-stone-50/50 dark:bg-[#121110] space-y-3">
            <BookOpen className="w-6 h-6 mx-auto text-stone-400" />
            <p className="text-sm font-medium text-stone-800 dark:text-stone-200">
              Nenhuma chamada ainda. Registrar a primeira aula
            </p>
            <p className="text-xs text-stone-500 dark:text-stone-400 max-w-sm mx-auto">
              Comece registrando a frequência dos estudantes na matéria{' '}
              {materiaAtual?.nome || 'selecionada'}.
            </p>
            {turmaAtual && materiaAtual && (
              <button
                type="button"
                onClick={handleNovaChamada}
                className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${schoolTheme.primaryBg}`}
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Registrar primeira aula</span>
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {chamadasPorMes.map(([mesGrupo, chamadas]) => (
              <div key={mesGrupo} className="space-y-2.5">
                {/* Cabeçalho do Mês */}
                <h3 className="text-xs font-medium text-stone-500 dark:text-stone-400 px-1">
                  {mesGrupo}
                </h3>

                {/* Lista de Chamadas daquele Mês */}
                <div className="space-y-2">
                  {chamadas.map((ch) => (
                    <ChamadaLinha
                      key={`${ch.materiaId}-${ch.dataAula}`}
                      chamada={ch}
                      onAbrir={() => handleAbrirChamada(ch.dataAula)}
                      onEditar={() => handleEditarChamada(ch.dataAula)}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ─── 8. Drawer Lateral para Fazer ou Visualizar Chamada ─── */}
      <ChamadaDrawer
        aberto={drawerAberto}
        modo={drawerModo}
        turma={turmaAtual}
        materia={materiaAtual}
        dataAula={dataAulaDrawer}
        onDataAulaChange={setDataAulaDrawer}
        responsavelNome={responsavelDrawer}
        onResponsavelChange={setResponsavelDrawer}
        conteudoMinistrado={conteudoDrawer}
        onConteudoChange={setConteudoDrawer}
        itens={itensDrawer}
        onTogglePresenca={handleTogglePresencaDrawer}
        onMarcarTodos={handleMarcarTodosDrawer}
        onSalvar={handleSalvarDrawer}
        onClose={() => setDrawerAberto(false)}
        onMudarParaEdicao={() => setDrawerModo('edicao')}
        salvando={salvandoDrawer}
        loadingItens={loadingItensDrawer}
        usuarioLogado={usuarioLogado}
        schoolTheme={schoolTheme}
      />

      {/* Modal de Gerenciamento de Matérias */}
      <ModalGerenciarMaterias
        isOpen={modalMateriasAberto}
        turma={turmaAtual}
        onClose={() => setModalMateriasAberto(false)}
        onMateriasAtualizadas={async () => {
          if (turmaAtual?.id) {
            const idTurma = turmaAtual.id;
            try {
              const mats = await api.getMateriasTurma(idTurma);
              setMateriasLocaisMap((prev) => ({ ...prev, [idTurma]: mats }));
            } catch {}
          }
          carregarDadosEscola();
        }}
      />
    </div>
  );
}
