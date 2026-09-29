'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
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
  LogOut,
  CheckCircle2,
  AlertCircle,
  Menu,
  X,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { ThemeToggle } from '@/components/ThemeToggle';

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
    feedbackMsg,
    mostrarFeedback,
    handleLogout,
    showModalTurma,
    setShowModalTurma,
    novaTurma,
    setNovaTurma,
    cursos,
    handleCriarTurma,
  } = useApp();

  const [menuAberto, setMenuAberto] = useState(false);

  // Fechar menu ao navegar ou teclar ESC
  useEffect(() => {
    setMenuAberto(false);
  }, [pathname]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMenuAberto(false);
      }
    };
    if (menuAberto) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [menuAberto]);

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
  const tabAtiva = NAV_TABS.find((t) => t.href === pathname);

  const handleVoltar = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
    } else {
      router.push('/direcionamento');
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9F7] dark:bg-[#090D16] text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      {/* Topbar Superior Integrada — Linha única, limpa e espaçosa */}
      <header className="bg-white/95 dark:bg-[#0D1322]/95 backdrop-blur-md border-b border-slate-200/90 dark:border-slate-800/90 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 h-16 flex items-center justify-between gap-3">
          {/* Lado Esquerdo: Botão 3 Barrinhas + Setinha Voltar + Escola Ativa + Módulo Atual */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            {/* Botão de 3 Barrinhas (Menu Lateral) */}
            <button
              onClick={() => setMenuAberto((prev) => !prev)}
              type="button"
              aria-label={menuAberto ? 'Fechar menu de navegação' : 'Abrir menu de navegação'}
              aria-expanded={menuAberto}
              className="p-2 sm:p-2.5 rounded-xl border border-slate-200/90 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 transition cursor-pointer active:scale-95 shadow-xs flex items-center justify-center shrink-0"
              title="Menu de Módulos (3 barrinhas)"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Setinha para Voltar à Tela Anterior */}
            <button
              onClick={handleVoltar}
              type="button"
              aria-label="Voltar à tela anterior"
              title="Voltar à tela anterior"
              className="p-2 sm:p-2.5 rounded-xl border border-slate-200/90 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition cursor-pointer active:scale-95 shadow-xs flex items-center justify-center shrink-0"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            {/* Badge da Escola Ativa */}
            {escolaAtualObj && (
              <div
                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold border ${badgeStyle.pill} truncate`}
              >
                <span className={`w-2 h-2 rounded-full ${badgeStyle.dot} shrink-0`} />
                <span className="font-extrabold">{escolaAtualObj.sigla}</span>
                <span className="hidden md:inline font-medium text-slate-600 dark:text-slate-300 truncate">
                  — {escolaAtualObj.nome}
                </span>
              </div>
            )}

            {/* Identificação do Módulo Atual */}
            {tabAtiva && (
              <div className="hidden lg:flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200">
                <tabAtiva.icon className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                <span>{tabAtiva.label}</span>
              </div>
            )}
          </div>

          {/* Ações da Direita */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* Botão de Modo Claro e Escuro */}
            <ThemeToggle showLabel={false} />

            {/* Perfil do Usuário */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-amber-600 to-rose-600 flex items-center justify-center text-white text-[11px] font-black">
                {usuarioLogado.nome.charAt(0).toUpperCase()}
              </div>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate max-w-[140px]">
                {usuarioLogado.nome}
              </span>
            </div>

            {/* Botão Sair */}
            <button
              onClick={handleLogout}
              type="button"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/50 hover:border-rose-300 dark:hover:border-rose-800 text-slate-600 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 text-xs font-bold transition-all cursor-pointer shadow-xs active:scale-95"
              title="Encerrar sessão"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sair</span>
            </button>
          </div>
        </div>
      </header>

      {/* DRAWER / MENU LATERAL COM AS 3 BARRINHAS */}
      {/* 1. Backdrop com blur e animação de fade */}
      <div
        onClick={() => setMenuAberto(false)}
        className={`fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 transition-opacity duration-300 ${
          menuAberto ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        aria-hidden="true"
      />

      {/* 2. Painel Lateral Deslizante à Esquerda */}
      <aside
        className={`fixed top-0 left-0 bottom-0 w-80 max-w-[85vw] bg-white dark:bg-[#0B101D] border-r border-slate-200 dark:border-slate-800/90 z-50 shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${
          menuAberto ? 'translate-x-0' : '-translate-x-full'
        }`}
        aria-label="Menu de Navegação Principal"
      >
        {/* Topo do Drawer: Brasão de Santo André + Título + Botão de Fechar */}
        <div className="h-16 px-5 border-b border-slate-200/90 dark:border-slate-800/90 flex items-center justify-between bg-slate-50/70 dark:bg-[#0E1424]/70">
          <div className="flex items-center gap-3">
            <Image
              src="/logo_santo_andre.png"
              alt="Brasão Oficial de Santo André"
              width={28}
              height={40}
              className="h-8 w-auto object-contain drop-shadow-xs dark:brightness-110"
              priority
            />
            <div className="flex flex-col text-left">
              <span className="text-xs font-bold tracking-wider text-slate-900 dark:text-white uppercase font-sans leading-none">
                A CASA
              </span>
              <span className="text-[9px] font-semibold tracking-wider text-slate-500 dark:text-slate-400 uppercase font-mono mt-1 leading-none">
                Módulos do Sistema
              </span>
            </div>
          </div>

          <button
            onClick={() => setMenuAberto(false)}
            type="button"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition cursor-pointer"
            title="Fechar menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Card de Contexto da Unidade Ativa */}
        {escolaAtualObj && (
          <div className="p-3.5 mx-4 mt-4 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400 font-bold">
                Unidade em Operação
              </span>
              <span className={`w-2 h-2 rounded-full ${badgeStyle.dot}`} />
            </div>
            <p className="text-xs font-extrabold text-slate-900 dark:text-white truncate">
              {escolaAtualObj.sigla} — {escolaAtualObj.nome}
            </p>
          </div>
        )}

        {/* Lista Vertical dos 8 Módulos */}
        <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
          <span className="block px-3 py-1 text-[10px] font-mono uppercase tracking-widest text-slate-400 dark:text-slate-500 font-bold">
            Módulos de Gestão
          </span>
          {NAV_TABS.map((tab) => {
            const TabIcon = tab.icon;
            const active = pathname === tab.href;

            return (
              <Link
                key={tab.href}
                href={tab.href}
                onClick={() => setMenuAberto(false)}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all duration-150 cursor-pointer ${
                  active
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950 shadow-xs'
                    : 'text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/80'
                }`}
              >
                <TabIcon className={`w-4 h-4 shrink-0 ${active ? 'text-amber-500 dark:text-amber-600' : 'text-slate-400'}`} />
                <span className="truncate">{tab.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Rodapé do Menu com Atalho para o Hub e Informações do Usuário */}
        <div className="p-4 border-t border-slate-200/90 dark:border-slate-800/90 bg-slate-50/50 dark:bg-[#0E1424]/50 space-y-2">
          <Link
            href="/direcionamento"
            onClick={() => setMenuAberto(false)}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-700 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Mudar de Escola (Hub)</span>
          </Link>

          <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-1 px-1">
            <span className="truncate max-w-[170px]">{usuarioLogado.email}</span>
            <span className="font-mono text-[10px] uppercase font-bold text-amber-600 dark:text-amber-400">
              {usuarioLogado.role === 'ROLE_ADMIN' ? 'Admin' : 'Encarregada'}
            </span>
          </div>
        </div>
      </aside>

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
