'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Calendar,
  Users,
  Layers,
  BookOpen,
  Search,
  FileSpreadsheet,
  Activity,
  Send,
  ArrowLeft,
  RefreshCw,
  Clock,
  LogOut,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  X,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { ThemeToggle } from '@/components/ThemeToggle';
import { PerfilAlunoModal } from '@/components/PerfilAlunoModal';
import { LgpdModal } from '@/components/LgpdModal';

const NAV_TABS = [
  { href: '/turmas', label: 'Turmas & Ofertas', icon: Calendar },
  { href: '/matriculas', label: 'Matrículas & Fila', icon: Users },
  { href: '/frequencia', label: 'Diário & Frequência', icon: Layers },
  { href: '/cursos', label: 'Matriz Curricular & Cursos', icon: BookOpen },
  { href: '/alunos', label: 'Cadastro de Alunos', icon: Search },
  { href: '/importacao', label: 'Importação em Lote', icon: FileSpreadsheet },
  { href: '/panorama', label: 'Panorama & Métricas', icon: Activity },
  { href: '/inscricao', label: 'Inscrição Pública', icon: Send },
];

export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const {
    usuarioLogado,
    escolas,
    escolaSelecionada,
    setEscolaSelecionada,
    escolaAtualObj,
    loading,
    refreshing,
    feedbackMsg,
    tempoRestanteMin,
    mostrarFeedback,
    carregarDadosEscola,
    handleLogout,
    showModalTurma,
    setShowModalTurma,
    novaTurma,
    setNovaTurma,
    cursos,
    handleCriarTurma,
    abrirModalLgpd,
    abrirModalPerfil,
  } = useApp();

  useEffect(() => {
    if (!loading && !usuarioLogado) {
      router.replace('/login');
    }
  }, [loading, usuarioLogado, router]);

  // Se não houver escola selecionada, direciona para o Hub
  useEffect(() => {
    if (!loading && usuarioLogado && escolaSelecionada === null) {
      if (usuarioLogado.role === 'ROLE_ENCARREGADA' && usuarioLogado.escolaId) {
        setEscolaSelecionada(usuarioLogado.escolaId);
      } else {
        router.replace('/direcionamento');
      }
    }
  }, [loading, usuarioLogado, escolaSelecionada, router]);

  if (loading || !usuarioLogado) {
    return (
      <div className="min-h-screen bg-[#FAF9F7] dark:bg-[#090D16] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-amber-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            Carregando ambiente escolar...
          </span>
        </div>
      </div>
    );
  }

  const getEscolaBadgeStyle = (sigla?: string) => {
    switch (sigla?.toUpperCase()) {
      case 'ELT':
        return {
          pill: 'bg-violet-100 text-violet-800 dark:bg-violet-950/70 dark:text-violet-300 border-violet-300 dark:border-violet-800',
          dot: 'bg-violet-600',
        };
      case 'ELD':
        return {
          pill: 'bg-rose-100 text-rose-800 dark:bg-rose-950/70 dark:text-rose-300 border-rose-300 dark:border-rose-800',
          dot: 'bg-rose-600',
        };
      case 'ELCV':
        return {
          pill: 'bg-sky-100 text-sky-800 dark:bg-sky-950/70 dark:text-sky-300 border-sky-300 dark:border-sky-800',
          dot: 'bg-sky-600',
        };
      case 'ELIA':
        return {
          pill: 'bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300 border-amber-300 dark:border-amber-800',
          dot: 'bg-amber-600',
        };
      default:
        return {
          pill: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-700',
          dot: 'bg-slate-500',
        };
    }
  };

  const badgeStyle = getEscolaBadgeStyle(escolaAtualObj?.sigla);

  return (
    <div className="min-h-screen bg-[#FAF9F7] dark:bg-[#090D16] text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      {/* Topbar Superior Integrada */}
      <header className="bg-white/95 dark:bg-[#0D1322]/95 backdrop-blur-md border-b border-slate-200/90 dark:border-slate-800/90 sticky top-0 z-30 shadow-xs">
        {/* Linha 1: Identidade, Unidade Ativa, Controles e Sessão */}
        <div className="max-w-7xl mx-auto px-4 sm:px-8 h-16 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
            {/* Botão de Retorno ao Hub de Escolas */}
            <Link
              href="/direcionamento"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all shadow-xs cursor-pointer shrink-0"
              title="Voltar para a Tela de Direcionamento das Escolas"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Hub de Escolas</span>
            </Link>

            <span className="text-slate-300 dark:text-slate-700 hidden sm:inline">•</span>

            {/* Badge da Escola Ativa */}
            {escolaAtualObj && (
              <div
                className={`inline-flex items-center gap-2 px-3 py-1 rounded-xl text-xs font-bold border ${badgeStyle.pill} truncate`}
              >
                <span className={`w-2 h-2 rounded-full ${badgeStyle.dot} shrink-0`} />
                <span className="font-extrabold">{escolaAtualObj.sigla}</span>
                <span className="hidden md:inline font-medium text-slate-600 dark:text-slate-300 truncate">
                  — {escolaAtualObj.nome}
                </span>
              </div>
            )}
          </div>

          {/* Ações da Direita */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Troca Rápida de Escola para Administradores */}
            {usuarioLogado.role === 'ROLE_ADMIN' && escolas.length > 0 && (
              <div className="hidden xl:flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
                {escolas.map((esc) => (
                  <button
                    key={esc.id}
                    onClick={() => setEscolaSelecionada(esc.id)}
                    type="button"
                    className={`px-2 py-0.5 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
                      escolaSelecionada === esc.id
                        ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                        : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                    }`}
                  >
                    {esc.sigla}
                  </button>
                ))}
              </div>
            )}

            {/* Botão de Atualizar Dados */}
            <button
              onClick={carregarDadosEscola}
              disabled={refreshing}
              type="button"
              className="p-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition cursor-pointer border border-slate-200 dark:border-slate-700"
              title="Recarregar dados da escola"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-blue-600' : ''}`} />
            </button>

            {/* Indicador de Tempo de Sessão */}
            <div
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300"
              title="Tempo restante de sessão"
            >
              <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span>{tempoRestanteMin}m</span>
            </div>

            {/* Botão de Modo Claro e Escuro */}
            <ThemeToggle showLabel={false} />

            {/* Perfil do Usuário */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-amber-600 to-rose-600 flex items-center justify-center text-white text-[11px] font-black">
                {usuarioLogado.nome.charAt(0).toUpperCase()}
              </div>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate max-w-[120px]">
                {usuarioLogado.nome}
              </span>
            </div>

            {/* Botão LGPD */}
            <button
              onClick={() => abrirModalLgpd('geral')}
              type="button"
              className="hidden sm:inline-flex p-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition cursor-pointer border border-slate-200 dark:border-slate-700"
              title="Termos de Privacidade e LGPD"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </button>

            {/* Botão Sair */}
            <button
              onClick={handleLogout}
              type="button"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/50 hover:border-rose-300 dark:hover:border-rose-800 text-slate-600 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 text-xs font-bold transition-all cursor-pointer shadow-xs"
              title="Encerrar sessão"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sair</span>
            </button>
          </div>
        </div>

        {/* Linha 2: Barra de Abas Horizontais com Links Semânticos de Rota */}
        <div className="border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/60 dark:bg-[#0A0F1D]/60 overflow-x-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-8 flex items-center gap-1.5 py-2">
            {NAV_TABS.map((tab) => {
              const TabIcon = tab.icon;
              const active = pathname === tab.href;
              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 whitespace-nowrap cursor-pointer ${
                    active
                      ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800'
                  }`}
                >
                  <TabIcon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </header>

      {/* Notificações do Sistema */}
      {feedbackMsg && (
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-8 mt-4">
          <div
            className={`p-4 rounded-2xl flex items-center justify-between shadow-xs border ${
              feedbackMsg.tipo === 'sucesso'
                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 border-emerald-300 dark:border-emerald-800'
                : 'bg-rose-50 dark:bg-rose-950/40 text-rose-900 dark:text-rose-200 border-rose-300 dark:border-rose-800'
            }`}
          >
            <div className="flex items-center space-x-3">
              {feedbackMsg.tipo === 'sucesso' ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0" />
              )}
              <span className="text-xs font-semibold">{feedbackMsg.texto}</span>
            </div>
          </div>
        </div>
      )}

      {/* Conteúdo da Rota Ativa */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8 py-8">
        {children}
      </main>

      {/* MODAL NOVA TURMA */}
      {showModalTurma && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-[#0F1629] rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="font-black text-base text-slate-900 dark:text-white">Abrir Nova Turma / Oferta</h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Defina vagas, datas e restrições etárias</p>
              </div>
              <button
                onClick={() => setShowModalTurma(false)}
                type="button"
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCriarTurma} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Curso Vinculado *</label>
                <select
                  required
                  value={novaTurma.cursoId}
                  onChange={(e) => setNovaTurma({ ...novaTurma, cursoId: Number(e.target.value) })}
                  className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-semibold"
                >
                  <option value="">Selecione o curso...</option>
                  {cursos.map((c) => (
                    <option key={c.id} value={c.id}>
                      [{c.escolaSigla}] {c.nome} ({c.cargaHoraria}h)
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Código da Turma *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: ELT-2026-T1"
                    value={novaTurma.codigo}
                    onChange={(e) => setNovaTurma({ ...novaTurma, codigo: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Vagas Totais *</label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={novaTurma.vagasTotais}
                    onChange={(e) => setNovaTurma({ ...novaTurma, vagasTotais: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Faixa Etária */}
              <div className="p-3 bg-amber-50/60 dark:bg-amber-950/30 rounded-2xl space-y-2 border border-amber-200 dark:border-amber-800/60">
                <span className="font-bold text-amber-900 dark:text-amber-300 block text-[10px] uppercase tracking-wider">
                  Faixa Etária Permitida
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] text-slate-600 dark:text-slate-400 mb-0.5">Idade Mínima</label>
                    <input
                      type="number"
                      placeholder="Ex: 5 ou 16"
                      value={novaTurma.idadeMinima || ''}
                      onChange={(e) =>
                        setNovaTurma({ ...novaTurma, idadeMinima: e.target.value ? Number(e.target.value) : undefined })
                      }
                      className="w-full px-2 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-600 dark:text-slate-400 mb-0.5">Idade Máxima</label>
                    <input
                      type="number"
                      placeholder="Ex: 12 ou 99"
                      value={novaTurma.idadeMaxima || ''}
                      onChange={(e) =>
                        setNovaTurma({ ...novaTurma, idadeMaxima: e.target.value ? Number(e.target.value) : undefined })
                      }
                      className="w-full px-2 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Período de Inscrição */}
              <div className="p-3 bg-blue-50/60 dark:bg-blue-950/30 rounded-2xl space-y-2 border border-blue-100 dark:border-blue-900/60">
                <span className="font-bold text-blue-900 dark:text-blue-300 block text-[10px] uppercase tracking-wider">
                  Período de Inscrição
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] text-slate-600 dark:text-slate-400 mb-0.5">Abertura *</label>
                    <input
                      type="date"
                      required
                      value={novaTurma.dataAberturaMatricula}
                      onChange={(e) => setNovaTurma({ ...novaTurma, dataAberturaMatricula: e.target.value })}
                      className="w-full px-2 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-600 dark:text-slate-400 mb-0.5">Fechamento *</label>
                    <input
                      type="date"
                      required
                      value={novaTurma.dataFechamentoMatricula}
                      onChange={(e) => setNovaTurma({ ...novaTurma, dataFechamentoMatricula: e.target.value })}
                      className="w-full px-2 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Período de Aulas */}
              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl space-y-2 border border-slate-200 dark:border-slate-700">
                <span className="font-bold text-slate-700 dark:text-slate-300 block text-[10px] uppercase tracking-wider">
                  Aulas & Tolerância de Suplência
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] text-slate-600 dark:text-slate-400 mb-0.5">Início *</label>
                    <input
                      type="date"
                      required
                      value={novaTurma.dataInicioAulas}
                      onChange={(e) => setNovaTurma({ ...novaTurma, dataInicioAulas: e.target.value })}
                      className="w-full px-2 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-600 dark:text-slate-400 mb-0.5">Término *</label>
                    <input
                      type="date"
                      required
                      value={novaTurma.dataFimAulas}
                      onChange={(e) => setNovaTurma({ ...novaTurma, dataFimAulas: e.target.value })}
                      className="w-full px-2 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowModalTurma(false)}
                  className="px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-xl font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-sm cursor-pointer"
                >
                  Salvar Turma
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
