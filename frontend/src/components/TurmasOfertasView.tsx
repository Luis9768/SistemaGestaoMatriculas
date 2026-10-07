'use client';

import React, { useState } from 'react';
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

interface EscolaTheme {
  sigla: string;
  nome: string;
  accentBar: string;
  tagStyle: string;
  progressColor: string;
  btnAtivo: string;
}

const ESCOLAS_THEME: Record<string, EscolaTheme> = {
  ELT: {
    sigla: 'ELT',
    nome: 'Escola Livre de Teatro',
    accentBar: 'bg-gradient-to-r from-violet-600 via-purple-500 to-indigo-600',
    tagStyle:
      'bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950/50 dark:text-violet-300 dark:border-violet-800/60',
    progressColor: 'bg-violet-600 dark:bg-violet-500',
    btnAtivo:
      'bg-violet-700 hover:bg-violet-800 active:bg-violet-900 text-white dark:bg-violet-600 dark:hover:bg-violet-500 shadow-violet-500/20',
  },
  ELD: {
    sigla: 'ELD',
    nome: 'Escola Livre de Dança',
    accentBar: 'bg-gradient-to-r from-rose-600 via-pink-500 to-red-500',
    tagStyle:
      'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800/60',
    progressColor: 'bg-rose-600 dark:bg-rose-500',
    btnAtivo:
      'bg-rose-700 hover:bg-rose-800 active:bg-rose-900 text-white dark:bg-rose-600 dark:hover:bg-rose-500 shadow-rose-500/20',
  },
  ELCV: {
    sigla: 'ELCV',
    nome: 'Escola Livre de Cinema e Vídeo',
    accentBar: 'bg-gradient-to-r from-sky-600 via-cyan-500 to-blue-600',
    tagStyle:
      'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/50 dark:text-sky-300 dark:border-sky-800/60',
    progressColor: 'bg-sky-600 dark:bg-sky-500',
    btnAtivo:
      'bg-sky-700 hover:bg-sky-800 active:bg-sky-900 text-white dark:bg-sky-600 dark:hover:bg-sky-500 shadow-sky-500/20',
  },
  EMIA: {
    sigla: 'EMIA',
    nome: 'Escola Municipal de Iniciação Artística',
    accentBar: 'bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-500',
    tagStyle:
      'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800/60',
    progressColor: 'bg-amber-600 dark:bg-amber-500',
    btnAtivo:
      'bg-amber-700 hover:bg-amber-800 active:bg-amber-900 text-white dark:bg-amber-600 dark:hover:bg-amber-500 shadow-amber-500/20',
  },
  ELIA: {
    sigla: 'EMIA',
    nome: 'Escola Municipal de Iniciação Artística',
    accentBar: 'bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-500',
    tagStyle:
      'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800/60',
    progressColor: 'bg-amber-600 dark:bg-amber-500',
    btnAtivo:
      'bg-amber-700 hover:bg-amber-800 active:bg-amber-900 text-white dark:bg-amber-600 dark:hover:bg-amber-500 shadow-amber-500/20',
  },
};

const DEFAULT_THEME: EscolaTheme = {
  sigla: 'GERAL',
  nome: 'Secretaria de Cultura',
  accentBar: 'bg-slate-500 dark:bg-slate-600',
  tagStyle:
    'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
  progressColor: 'bg-blue-600 dark:bg-blue-500',
  btnAtivo: 'bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-600 dark:hover:bg-blue-500',
};

const formatarDataBr = (dataStr?: string) => {
  if (!dataStr) return 'Não definida';
  const partes = dataStr.split('-');
  if (partes.length === 3) {
    return `${partes[2]}/${partes[1]}/${partes[0]}`;
  }
  return dataStr;
};

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
          {turmasFiltradas.map((t) => {
            const ocupacao = t.vagasTotais > 0 ? ((t.vagasOcupadas ?? 0) / t.vagasTotais) * 100 : 0;
            const vagasRestantes = Math.max(0, t.vagasTotais - (t.vagasOcupadas ?? 0));

            // Cores conforme a lotação: verde até ~60%, âmbar acima de ~80%, vermelho lotado
            let corBarra = 'bg-emerald-500';
            let corTextoVagas = 'text-emerald-600 dark:text-emerald-400';
            if (ocupacao >= 100 || vagasRestantes === 0) {
              corBarra = 'bg-rose-500';
              corTextoVagas = 'text-rose-600 dark:text-rose-400';
            } else if (ocupacao >= 80) {
              corBarra = 'bg-amber-500';
              corTextoVagas = 'text-amber-600 dark:text-amber-400';
            }

            return (
              <div
                key={t.id}
                id={`turma-card-${t.id}`}
                className="group relative bg-white dark:bg-[#121214] rounded-2xl border border-slate-200/90 dark:border-white/[0.08] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] hover:border-slate-300 dark:hover:border-zinc-700/80 hover:-translate-y-0.5 transition-all duration-200 p-5 sm:p-5.5 flex flex-col justify-between"
              >
                <div>
                  {/* Topo do Card: Código pequeno em Mono (substitui tag redundante) e Status Discreto */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-xs font-semibold text-slate-500 dark:text-zinc-400 tracking-wider uppercase">
                      {t.codigo}
                    </span>

                    {t.matriculaAberta ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        Matrículas Abertas
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-500 border border-slate-200/60 dark:bg-zinc-900/60 dark:text-zinc-500 dark:border-zinc-800/60">
                        Encerrada
                      </span>
                    )}
                  </div>

                  {/* Hierarquia Invertida: Nome Legível do Curso é o Título Principal (Sans-serif) */}
                  <h3
                    className="font-sans font-semibold text-[17px] sm:text-lg text-slate-900 dark:text-white tracking-tight leading-snug mt-2 line-clamp-2"
                    title={t.cursoNome}
                  >
                    {t.cursoNome}
                  </h3>

                  {/* Bloco de Informações Compacto com Ícones (Educador, Horário, Matérias) */}
                  <div className="mt-4 space-y-2 text-xs text-slate-600 dark:text-zinc-300">
                    <div className="flex items-center gap-2">
                      <User className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500 shrink-0" aria-hidden="true" />
                      <span className="font-medium truncate text-slate-800 dark:text-zinc-200">
                        {t.educadorResponsavel || 'Coordenação da Escola'}
                      </span>
                    </div>

                    {t.diasHorariosLocal && (
                      <div className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500 shrink-0" aria-hidden="true" />
                        <span className="font-mono text-[11px] text-slate-600 dark:text-zinc-400 truncate">
                          {t.diasHorariosLocal}
                        </span>
                      </div>
                    )}

                    {t.materias && t.materias.length > 0 && (
                      <div className="flex items-center gap-2">
                        <BookOpen className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500 shrink-0" aria-hidden="true" />
                        <span className="text-[11px] text-slate-600 dark:text-zinc-400">
                          {t.materias.length} {t.materias.length === 1 ? 'matéria curricular' : 'matérias curriculares'}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Ocupação com Destaque Único nas Vagas Restantes e Barra Dinâmica */}
                  <div className="mt-4 pt-3.5 border-t border-slate-100 dark:border-white/[0.06]">
                    <div className="flex items-center justify-between text-xs mb-2">
                      <span className="text-slate-500 dark:text-zinc-400 font-medium">Ocupação</span>
                      <span className={`text-xs font-semibold ${corTextoVagas}`}>
                        {vagasRestantes > 0
                          ? `${vagasRestantes} ${vagasRestantes === 1 ? 'vaga restante' : 'vagas restantes'}`
                          : 'Vagas esgotadas'}
                      </span>
                    </div>

                    <div className="w-full bg-slate-100 dark:bg-zinc-800 rounded-full h-1.5 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${corBarra}`}
                        style={{ width: `${Math.min(100, Math.round(ocupacao))}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 dark:text-zinc-500 mt-1.5">
                      <span>{t.vagasOcupadas ?? 0}/{t.vagasTotais} vagas</span>
                      <span>{Math.round(ocupacao)}% preenchido</span>
                    </div>
                  </div>
                </div>

                {/* Rodapé: Botão Detalhes Ghost com Borda e Matricular Primário Mais Largo */}
                <div className="pt-4 border-t border-slate-100 dark:border-white/[0.06] flex items-center gap-2.5 mt-5">
                  <button
                    type="button"
                    onClick={() => abrirModalDetalhesTurma(t)}
                    className="h-9 px-3.5 rounded-xl border border-slate-200 dark:border-zinc-700/80 bg-transparent hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-200 text-xs font-medium transition flex items-center gap-1.5 cursor-pointer active:scale-98"
                    title="Ver informações detalhadas da turma"
                  >
                    <Info className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-400" aria-hidden="true" />
                    <span>Detalhes</span>
                  </button>

                  {t.matriculaAberta ? (
                    <button
                      type="button"
                      onClick={() => onMatricularNaTurma(t.id!)}
                      className="flex-1 h-9 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 text-xs font-semibold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs active:scale-98"
                    >
                      <span>Matricular</span>
                      <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                    </button>
                  ) : (
                    <span className="flex-1 h-9 rounded-xl inline-flex items-center justify-center text-xs font-medium text-slate-400 dark:text-zinc-600 bg-slate-100/60 dark:bg-zinc-900/50 border border-slate-200/50 dark:border-zinc-800/50 cursor-not-allowed">
                      Encerrada
                    </span>
                  )}
                </div>
              </div>
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
