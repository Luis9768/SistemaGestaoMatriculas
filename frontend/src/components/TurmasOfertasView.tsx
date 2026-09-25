'use client';

import React, { useState } from 'react';
import {
  Calendar,
  PlusCircle,
  Users,
  Clock,
  Sparkles,
  ArrowRight,
  Filter,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { Turma, Curso, Escola } from '@/lib/api';

interface TurmasOfertasViewProps {
  turmas: Turma[];
  cursos: Curso[];
  escolas: Escola[];
  escolaSelecionada: number | null;
  onAbrirModalTurma: () => void;
  onMatricularNaTurma: (turmaId: number) => void;
}

export function TurmasOfertasView({
  turmas,
  cursos,
  escolas,
  escolaSelecionada,
  onAbrirModalTurma,
  onMatricularNaTurma,
}: TurmasOfertasViewProps) {
  const [filtroAbertas, setFiltroAbertas] = useState<'todas' | 'abertas'>('todas');
  const [buscaCodigo, setBuscaCodigo] = useState('');

  const turmasFiltradas = turmas.filter((t) => {
    if (filtroAbertas === 'abertas' && !t.matriculaAberta) return false;
    if (buscaCodigo.trim()) {
      const q = buscaCodigo.toLowerCase();
      const matchCodigo = t.codigo.toLowerCase().includes(q);
      const matchCurso = t.cursoNome?.toLowerCase().includes(q);
      if (!matchCodigo && !matchCurso) return false;
    }
    return true;
  });

  const getEscolaBadgeColor = (sigla?: string) => {
    switch (sigla) {
      case 'ELT':
        return 'bg-violet-100 text-violet-900 border-violet-300';
      case 'ELD':
        return 'bg-rose-100 text-rose-900 border-rose-300';
      case 'ELCV':
        return 'bg-cyan-100 text-cyan-900 border-cyan-300';
      case 'ELIA':
        return 'bg-amber-100 text-amber-900 border-amber-300';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-300';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 flex items-center space-x-2">
            <span>Turmas & Ofertas Letivas</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Acompanhe períodos de inscrição, tolerância de suplência e taxa de ocupação de vagas por turma.
          </p>
        </div>

        <button
          onClick={onAbrirModalTurma}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-sm transition cursor-pointer self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Abrir Nova Turma</span>
        </button>
      </div>

      {/* Controles de Filtragem e Busca */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex items-center space-x-2 w-full md:w-auto">
          <button
            type="button"
            onClick={() => setFiltroAbertas('todas')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              filtroAbertas === 'todas'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200'
            }`}
          >
            Todas as Turmas ({turmas.length})
          </button>
          <button
            type="button"
            onClick={() => setFiltroAbertas('abertas')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center space-x-1.5 ${
              filtroAbertas === 'abertas'
                ? 'bg-emerald-700 text-white font-bold'
                : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Abertas Agora ({turmas.filter((t) => t.matriculaAberta).length})</span>
          </button>
        </div>

        <div className="w-full md:w-72">
          <input
            type="text"
            placeholder="Buscar por código ou nome do curso..."
            value={buscaCodigo}
            onChange={(e) => setBuscaCodigo(e.target.value)}
            className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:bg-white focus:ring-2 focus:ring-blue-500 transition"
          />
        </div>
      </div>

      {/* Grid de Turmas */}
      {turmasFiltradas.length === 0 ? (
        <div className="p-12 text-center text-slate-400 bg-white rounded-3xl border border-slate-200 text-xs">
          Nenhuma turma encontrada com os filtros selecionados.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {turmasFiltradas.map((t) => {
            const ocupacao = t.vagasTotais > 0 ? ((t.vagasOcupadas ?? 0) / t.vagasTotais) * 100 : 0;
            return (
              <div
                key={t.id}
                className="bg-white rounded-3xl border border-slate-200 shadow-xs hover:border-slate-300 transition-all p-6 flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-black border uppercase ${getEscolaBadgeColor(t.escolaSigla)}`}>
                      {t.escolaSigla || 'GERAL'}
                    </span>
                    {t.matriculaAberta ? (
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                        Inscrições Abertas
                      </span>
                    ) : (
                      <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                        Período Fechado
                      </span>
                    )}
                  </div>

                  <h3 className="font-extrabold text-base text-slate-900">{t.codigo}</h3>
                  <p className="text-xs text-slate-600 font-medium mt-0.5 line-clamp-1">{t.cursoNome}</p>

                  <div className="mt-4 space-y-2 text-xs text-slate-600">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Faixa Etária:</span>
                      <span className="font-bold text-slate-800">
                        {t.idadeMinima ? `${t.idadeMinima} a ${t.idadeMaxima || 99} anos` : 'Idade Livre'}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-slate-400">Inscrições:</span>
                      <span className="font-medium text-slate-700">
                        {t.dataAberturaMatricula} até {t.dataFechamentoMatricula}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-slate-400">Aulas:</span>
                      <span className="font-medium text-slate-700">
                        {t.dataInicioAulas} até {t.dataFimAulas}
                      </span>
                    </div>

                    {t.diasToleranciaSuplencia && (
                      <div className="flex justify-between text-[11px]">
                        <span className="text-slate-400">Prazo Suplência:</span>
                        <span className="text-amber-800 font-semibold">
                          Até {t.diasToleranciaSuplencia} dias após início
                        </span>
                      </div>
                    )}

                    {/* Barra Visual de Ocupação */}
                    <div className="pt-2">
                      <div className="flex justify-between text-[11px] mb-1 font-semibold">
                        <span className="text-slate-500">Ocupação de Vagas:</span>
                        <span className="text-slate-900">
                          {t.vagasOcupadas ?? 0} / {t.vagasTotais} ({Math.round(ocupacao)}%)
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200/50">
                        <div
                          className={`h-2 rounded-full transition-all duration-300 ${
                            ocupacao >= 100
                              ? 'bg-rose-500'
                              : ocupacao >= 80
                              ? 'bg-amber-500'
                              : 'bg-emerald-500'
                          }`}
                          style={{ width: `${Math.min(100, Math.round(ocupacao))}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-end">
                  <button
                    disabled={!t.matriculaAberta}
                    onClick={() => onMatricularNaTurma(t.id!)}
                    className={`text-xs font-bold px-4 py-2 rounded-xl transition cursor-pointer ${
                      t.matriculaAberta
                        ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm'
                        : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    {t.matriculaAberta ? 'Matricular Aluno →' : 'Fora do Prazo'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
