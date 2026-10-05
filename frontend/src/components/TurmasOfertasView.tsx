'use client';

import React, { useState } from 'react';
import { Search, Plus, X, ArrowRight, Layers, BookOpen } from 'lucide-react';
import { Turma, Curso, Escola } from '@/lib/api';
import { ModalGerenciarMaterias } from '@/components/ModalGerenciarMaterias';

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
  const [filtroAbertas, setFiltroAbertas] = useState<'todas' | 'abertas' | 'fechadas'>('todas');
  const [buscaCodigo, setBuscaCodigo] = useState(termoBuscaInicial || '');
  const [turmaGerenciarMaterias, setTurmaGerenciarMaterias] = useState<Turma | null>(null);
  const [destaqueId, setDestaqueId] = useState<number | null>(destacarTurmaId || null);

  React.useEffect(() => {
    if (termoBuscaInicial) {
      setBuscaCodigo(termoBuscaInicial);
    }
  }, [termoBuscaInicial]);

  React.useEffect(() => {
    if (destacarTurmaId) {
      setDestaqueId(destacarTurmaId);
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

  const turmasFiltradas = turmas.filter((t) => {
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

  const abertasCount = turmas.filter((t) => t.matriculaAberta).length;
  const fechadasCount = turmas.filter((t) => !t.matriculaAberta).length;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Cabeçalho da Seção */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
            Turmas & Ofertas Letivas
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Acompanhe períodos de inscrição, tolerância de suplência e taxa de ocupação de vagas por turma.
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
      <div className="bg-white dark:bg-[#0D121F] p-3.5 sm:p-4 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Filtros em Abas Segmentadas */}
        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <button
            type="button"
            onClick={() => setFiltroAbertas('todas')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
              filtroAbertas === 'todas'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-700/80 border border-slate-200/60 dark:border-slate-700/60'
            }`}
          >
            Todas ({turmas.length})
          </button>

          <button
            type="button"
            onClick={() => setFiltroAbertas('abertas')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
              filtroAbertas === 'abertas'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-700/80 border border-slate-200/60 dark:border-slate-700/60'
            }`}
          >
            Inscrições Abertas ({abertasCount})
          </button>

          {fechadasCount > 0 && (
            <button
              type="button"
              onClick={() => setFiltroAbertas('fechadas')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                filtroAbertas === 'fechadas'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-700/80 border border-slate-200/60 dark:border-slate-700/60'
              }`}
            >
              Período Fechado ({fechadasCount})
            </button>
          )}
        </div>

        {/* Campo de Busca */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 pointer-events-none" />
          <input
            type="text"
            placeholder="Buscar por código, curso ou escola..."
            value={buscaCodigo}
            onChange={(e) => setBuscaCodigo(e.target.value)}
            className="w-full pl-10 pr-9 py-2 bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-700/80 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:focus:border-blue-500 transition"
          />
          {buscaCodigo && (
            <button
              type="button"
              onClick={() => {
                setBuscaCodigo('');
                setDestaqueId(null);
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5 cursor-pointer"
              title="Limpar busca"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Grid de Turmas por Escola */}
      {turmasFiltradas.length === 0 ? (
        <div className="p-12 text-center text-slate-400 dark:text-slate-500 bg-white dark:bg-[#0D121F] rounded-2xl border border-slate-200/90 dark:border-slate-800 text-xs">
          <p className="font-medium">Nenhuma turma encontrada com os filtros selecionados.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {turmasFiltradas.map((t) => {
            const sigla = getEscolaSigla(t);
            const theme = ESCOLAS_THEME[sigla] || DEFAULT_THEME;
            const ocupacao = t.vagasTotais > 0 ? ((t.vagasOcupadas ?? 0) / t.vagasTotais) * 100 : 0;
            const vagasRestantes = Math.max(0, t.vagasTotais - (t.vagasOcupadas ?? 0));

            const isDestacada = destaqueId === t.id;

            return (
              <div
                key={t.id}
                id={`turma-card-${t.id}`}
                className={`relative bg-white dark:bg-[#0D121F] rounded-2xl border transition-all duration-300 p-5 sm:p-6 flex flex-col justify-between overflow-hidden group ${
                  isDestacada
                    ? 'ring-4 ring-emerald-500/80 shadow-[0_0_35px_rgba(16,185,129,0.3)] border-emerald-400 dark:border-emerald-500 bg-emerald-50/15 dark:bg-emerald-950/20'
                    : 'border-slate-200/90 dark:border-slate-800 shadow-xs hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                {/* Linha Superior com Cor Institucional da Escola */}
                <div className={`absolute top-0 left-0 right-0 h-1.5 ${theme.accentBar}`} />

                <div>
                  {/* Badge de Destaque da Notificação */}
                  {isDestacada && (
                    <div className="mb-3 px-3 py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center justify-between animate-pulse">
                      <span className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                        Turma Selecionada na Notificação
                      </span>
                      <span className="text-[11px] font-mono">{vagasRestantes} vagas disponíveis</span>
                    </div>
                  )}

                  {/* Topo do Card: Sigla da Escola e Status da Inscrição */}
                  <div className="flex items-center justify-between gap-2 mb-3 pt-0.5">
                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold border uppercase tracking-wider ${theme.tagStyle}`}
                    >
                      {sigla}
                    </span>

                    {t.matriculaAberta ? (
                      <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/50">
                        Inscrições Abertas
                      </span>
                    ) : (
                      <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200/80 dark:bg-slate-800/80 dark:text-slate-400 dark:border-slate-700/60">
                        Período Fechado
                      </span>
                    )}
                  </div>

                  {/* Código da Turma e Nome do Curso */}
                  <h3 className="font-mono font-bold text-base text-slate-900 dark:text-white tracking-tight leading-snug">
                    {t.codigo}
                  </h3>
                  <p
                    className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1 line-clamp-1"
                    title={t.cursoNome}
                  >
                    {t.cursoNome}
                  </p>

                  {/* Metadados da Turma */}
                  <div className="mt-4 space-y-2 text-xs">
                    {t.educadorResponsavel && (
                      <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800/60">
                        <span className="text-slate-400 dark:text-slate-500">Educador(a):</span>
                        <span className="font-semibold text-violet-700 dark:text-violet-300">
                          {t.educadorResponsavel}
                        </span>
                      </div>
                    )}

                    {t.diasHorariosLocal && (
                      <div className="py-1 border-b border-slate-100 dark:border-slate-800/60 text-[11px] text-slate-600 dark:text-slate-300 leading-snug">
                        <span className="font-medium text-slate-500 dark:text-slate-400">Horário & Local: </span>
                        {t.diasHorariosLocal}
                      </div>
                    )}

                    <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800/60">
                      <span className="text-slate-400 dark:text-slate-500">Faixa Etária:</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {t.idadeMinima ? `${t.idadeMinima} a ${t.idadeMaxima || 99} anos` : 'Idade Livre'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800/60">
                      <span className="text-slate-400 dark:text-slate-500">Inscrições:</span>
                      <span className="font-mono text-[11px] font-medium text-slate-700 dark:text-slate-300">
                        {formatarDataBr(t.dataAberturaMatricula)} a {formatarDataBr(t.dataFechamentoMatricula)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800/60">
                      <span className="text-slate-400 dark:text-slate-500">Aulas:</span>
                      <span className="font-mono text-[11px] font-medium text-slate-700 dark:text-slate-300">
                        {formatarDataBr(t.dataInicioAulas)} a {formatarDataBr(t.dataFimAulas)}
                      </span>
                    </div>

                    {t.diasToleranciaSuplencia && (
                      <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800/60">
                        <span className="text-slate-400 dark:text-slate-500">Prazo Suplência:</span>
                        <span className="text-[11px] font-medium text-amber-700 dark:text-amber-400">
                          Até {t.diasToleranciaSuplencia} dias após início
                        </span>
                      </div>
                    )}

                    {/* Barra Visual de Ocupação de Vagas */}
                    <div className="pt-2">
                      <div className="flex justify-between text-[11px] mb-1.5 font-medium">
                        <span className="text-slate-500 dark:text-slate-400">Ocupação de Vagas</span>
                        <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">
                          {t.vagasOcupadas ?? 0} / {t.vagasTotais}{' '}
                          <span className="text-slate-400 dark:text-slate-500 font-normal">
                            ({Math.round(ocupacao)}%)
                          </span>
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-slate-800/80 rounded-full h-1.5 overflow-hidden border border-slate-200/50 dark:border-slate-700/50">
                        <div
                          className={`h-1.5 rounded-full transition-all duration-300 ${
                            ocupacao >= 100
                              ? 'bg-rose-500 dark:bg-rose-400'
                              : ocupacao >= 80
                              ? 'bg-amber-500 dark:bg-amber-400'
                              : theme.progressColor
                          }`}
                          style={{ width: `${Math.min(100, Math.round(ocupacao))}%` }}
                        />
                      </div>
                    </div>

                    {/* Matérias da Turma */}
                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800/60">
                      <div className="flex items-center justify-between text-[11px] mb-1.5 font-medium">
                        <span className="text-slate-500 dark:text-slate-400">
                          Matérias ({t.materias?.length || t.materiasNomes?.length || 0})
                        </span>
                        <button
                          type="button"
                          onClick={() => setTurmaGerenciarMaterias(t)}
                          className="text-[11px] font-semibold text-violet-600 dark:text-violet-400 hover:text-violet-800 dark:hover:text-violet-300 hover:underline flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          <BookOpen className="w-3 h-3" />
                          <span>Gerenciar</span>
                        </button>
                      </div>
                      {t.materias && t.materias.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {t.materias.map((m, idx) => (
                            <span
                              key={m.id || idx}
                              className="px-2 py-0.5 rounded-md bg-violet-50 dark:bg-violet-950/40 text-violet-700 dark:text-violet-300 border border-violet-200/60 dark:border-violet-800/50 text-[10px] font-semibold"
                              title={
                                m.professorResponsavel
                                  ? `Docente atual: ${m.professorResponsavel}${m.cargaHoraria ? ` • ${m.cargaHoraria}h` : ''}`
                                  : m.cargaHoraria
                                  ? `Carga: ${m.cargaHoraria}h`
                                  : undefined
                              }
                            >
                              {m.nome}
                              {m.cargaHoraria ? ` (${m.cargaHoraria}h)` : ''}
                              {m.professorResponsavel ? ` • Prof. ${m.professorResponsavel.split(' ')[0]}` : ''}
                            </span>
                          ))}
                        </div>
                      ) : t.materiasNomes && t.materiasNomes.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {t.materiasNomes.map((nome, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 rounded-md bg-violet-50 dark:bg-violet-950/40 text-violet-700 dark:text-violet-300 border border-violet-200/60 dark:border-violet-800/50 text-[10px] font-semibold"
                            >
                              {nome}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-[11px] text-slate-400 dark:text-slate-500 italic">
                          Nenhuma matéria cadastrada.
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Rodapé do Card com Ação */}
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2 mt-4">
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    {vagasRestantes > 0 ? (
                      <span>
                        <strong className="font-semibold text-slate-700 dark:text-slate-300">
                          {vagasRestantes}
                        </strong>{' '}
                        {vagasRestantes === 1 ? 'vaga restante' : 'vagas'}
                      </span>
                    ) : (
                      <span className="text-rose-600 dark:text-rose-400 font-medium">Vagas esgotadas</span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setTurmaGerenciarMaterias(t)}
                      title="Gerenciar matérias da turma"
                      className="p-2 rounded-xl text-slate-500 hover:text-violet-700 dark:text-slate-400 dark:hover:text-violet-300 hover:bg-violet-50 dark:hover:bg-violet-950/40 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
                    >
                      <BookOpen className="w-4 h-4" />
                    </button>

                    {t.matriculaAberta ? (
                      <button
                        onClick={() => onMatricularNaTurma(t.id!)}
                        className={`inline-flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-xl transition-all cursor-pointer shadow-xs active:scale-98 ${theme.btnAtivo}`}
                      >
                        <span>Matricular Aluno</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      <span className="text-xs font-medium px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/60 text-slate-400 dark:text-slate-500 border border-slate-200/60 dark:border-slate-700/50 cursor-not-allowed">
                        Inscrições Encerradas
                      </span>
                    )}
                  </div>
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
