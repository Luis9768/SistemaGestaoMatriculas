'use client';

import React, { useEffect, useRef } from 'react';
import {
  X,
  Calendar,
  Clock,
  MapPin,
  User,
  Users,
  BookOpen,
  ArrowRight,
  ClipboardList,
  CalendarDays,
  ShieldAlert,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { Turma } from '@/lib/api';
import { useRouter } from 'next/navigation';

interface ModalDetalhesTurmaProps {
  isOpen: boolean;
  turma: Turma | null;
  onClose: () => void;
  onMatricular: (turmaId: number) => void;
  onGerenciarMaterias?: (turma: Turma) => void;
}

const formatarDataBr = (dataStr?: string) => {
  if (!dataStr) return 'Não definida';
  const partes = dataStr.split('-');
  if (partes.length === 3) {
    return `${partes[2]}/${partes[1]}/${partes[0]}`;
  }
  return dataStr;
};

export function ModalDetalhesTurma({
  isOpen,
  turma,
  onClose,
  onMatricular,
  onGerenciarMaterias,
}: ModalDetalhesTurmaProps) {
  const router = useRouter();
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !turma) return null;

  const ocupacao =
    turma.vagasTotais > 0
      ? ((turma.vagasOcupadas ?? 0) / turma.vagasTotais) * 100
      : 0;
  const vagasRestantes = Math.max(
    0,
    turma.vagasTotais - (turma.vagasOcupadas ?? 0)
  );
  const materias = turma.materias || [];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-detalhes-titulo"
    >
      <div
        ref={modalRef}
        className="w-full max-w-2xl max-h-[90vh] bg-white dark:bg-[#0D121F] rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
      >
        {/* CABEÇALHO DO MODAL */}
        <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/70 dark:bg-slate-900/40 flex items-start justify-between gap-4">
          <div className="space-y-1.5 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-md font-mono text-[11px] font-bold bg-slate-200/80 text-slate-800 dark:bg-slate-800 dark:text-slate-200 border border-slate-300/80 dark:border-slate-700 uppercase tracking-wider">
                {turma.escolaSigla || 'ESCOLA'}
              </span>

              {turma.matriculaAberta ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/60">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Inscrições Abertas
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200/80 dark:bg-slate-800/80 dark:text-slate-400 dark:border-slate-700/60">
                  Período Fechado
                </span>
              )}
            </div>

            <h2
              id="modal-detalhes-titulo"
              className="text-lg sm:text-xl font-mono font-black text-slate-900 dark:text-white tracking-tight"
            >
              {turma.codigo}
            </h2>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium">
              {turma.cursoNome || 'Curso de Formação Cultural'}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition cursor-pointer shrink-0"
            aria-label="Fechar modal de detalhes"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* CORPO DO MODAL COM ROLAGEM SUAVE */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
          {/* BLOCO 1: EDUCADOR E LOGÍSTICA DE AULAS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-900/50 border border-slate-200/70 dark:border-slate-800/70 space-y-1">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-slate-500" />
                Educador(a) Titular
              </span>
              <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                {turma.educadorResponsavel || 'A ser informado pela coordenação'}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-900/50 border border-slate-200/70 dark:border-slate-800/70 space-y-1">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-slate-500" />
                Faixa Etária Permitida
              </span>
              <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                {turma.idadeMinima
                  ? `${turma.idadeMinima} a ${turma.idadeMaxima || 99} anos`
                  : 'Livre para todas as idades'}
              </p>
            </div>
          </div>

          {/* BLOCO 2: HORÁRIO & LOCALIZAÇÃO */}
          {turma.diasHorariosLocal && (
            <div className="p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-900/50 border border-slate-200/70 dark:border-slate-800/70 space-y-1">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                Horário & Espaço de Ensaio / Aula
              </span>
              <p className="text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-200">
                {turma.diasHorariosLocal}
              </p>
            </div>
          )}

          {/* BLOCO 3: CALENDÁRIO LETIVO & SUPLÊNCIA */}
          <div className="p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-900/50 border border-slate-200/70 dark:border-slate-800/70 space-y-3">
            <h3 className="text-[11px] uppercase font-extrabold tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              Prazos & Calendário Oficial
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="space-y-1">
                <span className="text-slate-400 dark:text-slate-500 block">
                  Período de Inscrição:
                </span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                  {formatarDataBr(turma.dataAberturaMatricula)} até{' '}
                  {formatarDataBr(turma.dataFechamentoMatricula)}
                </span>
              </div>

              <div className="space-y-1">
                <span className="text-slate-400 dark:text-slate-500 block">
                  Período das Aulas:
                </span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                  {formatarDataBr(turma.dataInicioAulas)} até{' '}
                  {formatarDataBr(turma.dataFimAulas)}
                </span>
              </div>
            </div>

            {turma.diasToleranciaSuplencia && (
              <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between text-xs">
                <span className="text-slate-500 dark:text-slate-400">
                  Prazo de Convocação de Suplentes:
                </span>
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  Até {turma.diasToleranciaSuplencia} dias após início das aulas
                </span>
              </div>
            )}
          </div>

          {/* BLOCO 4: CAPACIDADE E OCUPAÇÃO DE VAGAS */}
          <div className="p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-900/50 border border-slate-200/70 dark:border-slate-800/70 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] uppercase font-extrabold tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-slate-500" />
                Quadro de Vagas
              </span>
              <span className="font-mono text-xs font-bold text-slate-900 dark:text-white tabular-nums">
                {turma.vagasOcupadas ?? 0} / {turma.vagasTotais} (
                {Math.round(ocupacao)}%)
              </span>
            </div>

            <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  ocupacao >= 100
                    ? 'bg-rose-500'
                    : ocupacao >= 80
                    ? 'bg-amber-500'
                    : 'bg-emerald-500'
                }`}
                style={{ width: `${Math.min(100, Math.round(ocupacao))}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-1">
              <span>
                {vagasRestantes > 0 ? (
                  <strong className="text-emerald-600 dark:text-emerald-400">
                    {vagasRestantes} {vagasRestantes === 1 ? 'vaga livre' : 'vagas livres'}
                  </strong>
                ) : (
                  <strong className="text-rose-600 dark:text-rose-400">
                    Capacidade esgotada
                  </strong>
                )}
              </span>
              <span>Total de vagas: {turma.vagasTotais}</span>
            </div>
          </div>

          {/* BLOCO 5: MATÉRIAS CURRICULARES */}
          <div className="p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-900/50 border border-slate-200/70 dark:border-slate-800/70 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] uppercase font-extrabold tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-slate-500" />
                Matérias Curriculares ({materias.length})
              </span>

              {onGerenciarMaterias && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onGerenciarMaterias(turma);
                  }}
                  className="text-xs font-semibold text-slate-700 dark:text-slate-300 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Gerenciar Matérias</span>
                </button>
              )}
            </div>

            {materias.length > 0 ? (
              <div className="space-y-1.5">
                {materias.map((m, idx) => (
                  <div
                    key={m.id || idx}
                    className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800/70 flex items-center justify-between gap-2 text-xs"
                  >
                    <div>
                      <span className="font-semibold text-slate-900 dark:text-white block">
                        {m.nome}
                      </span>
                      {m.professorResponsavel && (
                        <span className="text-[11px] text-slate-500 dark:text-slate-400">
                          Docente: {m.professorResponsavel}
                        </span>
                      )}
                    </div>
                    {m.cargaHoraria && (
                      <span className="font-mono text-[11px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 shrink-0">
                        {m.cargaHoraria}h
                      </span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 dark:text-slate-500 italic">
                Nenhuma matéria cadastrada para esta turma.
              </p>
            )}
          </div>
        </div>

        {/* RODAPÉ DE AÇÕES */}
        <div className="p-4 sm:p-5 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/70 dark:bg-slate-900/40 flex flex-col sm:flex-row items-center justify-between gap-2.5">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold transition cursor-pointer w-full sm:w-auto"
            >
              Fechar
            </button>

            <button
              type="button"
              onClick={() => {
                onClose();
                router.push('/frequencia');
              }}
              className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold transition cursor-pointer flex items-center justify-center gap-1.5 w-full sm:w-auto"
            >
              <ClipboardList className="w-3.5 h-3.5" />
              <span>Diário de Chamadas</span>
            </button>
          </div>

          {turma.matriculaAberta ? (
            <button
              type="button"
              onClick={() => {
                onClose();
                onMatricular(turma.id!);
              }}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-xs active:scale-98"
            >
              <span>Matricular Aluno</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <span className="text-xs font-medium px-4 py-2.5 rounded-xl bg-slate-200/80 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 border border-slate-300/80 dark:border-slate-700/60 cursor-not-allowed">
              Inscrições Encerradas
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
