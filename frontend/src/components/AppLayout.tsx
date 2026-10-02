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
  Users2,
  Plus,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { ThemeToggle } from '@/components/ThemeToggle';
import { PerfilAlunoModal } from '@/components/PerfilAlunoModal';

const NAV_TABS: Array<{ href: string; label: string; icon: any; adminOnly?: boolean; allowedRoles?: string[] }> = [
  { href: '/turmas', label: 'Turmas & Ofertas', icon: Calendar },
  { href: '/matriculas', label: 'Matrículas & Fila', icon: Users },
  { href: '/frequencia', label: 'Diário de Chamadas', icon: Layers, allowedRoles: ['ROLE_ADMIN', 'ROLE_PROFESSOR'] },
  { href: '/cursos', label: 'Matriz Curricular & Cursos', icon: BookOpen },
  { href: '/alunos', label: 'Cadastro de Alunos', icon: Search },
  { href: '/usuarios', label: 'Equipe & Docentes', icon: Users2, adminOnly: true },
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
    showModalPerfil,
    setShowModalPerfil,
    perfilAlunoId,
    carregarMatriculas,
  } = useApp();

  const [menuAberto, setMenuAberto] = useState(false);
  const [inputMateriaTexto, setInputMateriaTexto] = useState('');

  const handleAdicionarMateria = (e?: React.MouseEvent | React.KeyboardEvent) => {
    if (e) e.preventDefault();
    if (!inputMateriaTexto.trim()) return;

    const partes = inputMateriaTexto
      .split(/[,;\n]+/)
      .map((p) => p.trim())
      .filter((p) => p.length > 0);

    const atuais = novaTurma.materiasNomes || [];
    const novas = partes.filter((p) => !atuais.includes(p));

    setNovaTurma({
      ...novaTurma,
      materiasNomes: [...atuais, ...novas],
    });
    setInputMateriaTexto('');
  };

  const handleRemoverMateria = (index: number) => {
    const atuais = novaTurma.materiasNomes || [];
    setNovaTurma({
      ...novaTurma,
      materiasNomes: atuais.filter((_, i) => i !== index),
    });
  };

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

  const handleVoltar = () => {
    if (pathname === '/turmas') {
      router.push('/direcionamento');
    } else {
      router.push('/turmas');
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9F7] dark:bg-[#090D16] text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      {/* Topbar Superior Integrada — Linha única, limpa e espaçosa */}
      <header className="bg-white/95 dark:bg-[#0D1322]/95 backdrop-blur-md border-b border-slate-200/90 dark:border-slate-800/90 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 h-16 flex items-center justify-between gap-3">
          {/* Lado Esquerdo: Setinha Voltar + Botão 3 Barrinhas */}
          <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
            {/* Setinha para Escolha de Turmas / Voltar (à esquerda das 3 barrinhas) */}
            <button
              onClick={handleVoltar}
              type="button"
              aria-label={pathname === '/turmas' ? 'Voltar para escolha de escolas' : 'Ir para escolha de turmas'}
              title={pathname === '/turmas' ? 'Voltar para escolha de escolas (Hub)' : 'Ir para escolha de turmas (/turmas)'}
              className="p-2 sm:p-2.5 rounded-xl border border-slate-200/90 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition cursor-pointer active:scale-95 shadow-xs flex items-center justify-center shrink-0"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

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
          </div>

          {/* Ações da Direita */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* Botão de Modo Claro e Escuro */}
            <ThemeToggle showLabel={false} />

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
        {/* Topo do Drawer: Brasão de Santo André + Nome da Escola Ativa + Botão de Fechar */}
        <div className="h-16 px-4 sm:px-5 border-b border-slate-200/90 dark:border-slate-800/90 flex items-center justify-between bg-slate-50/70 dark:bg-[#0E1424]/70">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 pr-2">
            <Image
              src="/logo_santo_andre.png"
              alt="Brasão Oficial de Santo André"
              width={28}
              height={40}
              className="h-8 w-auto object-contain drop-shadow-xs dark:brightness-110 shrink-0"
              priority
            />
            <div className="flex flex-col text-left min-w-0">
              <span className="text-xs sm:text-sm font-extrabold tracking-tight text-slate-900 dark:text-white truncate leading-snug">
                {escolaAtualObj ? escolaAtualObj.nome : 'Escolas Livres'}
              </span>
              {escolaAtualObj && (
                <div className="mt-0.5">
                  <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase font-mono tracking-wider leading-none">
                    {escolaAtualObj.sigla} • Santo André
                  </span>
                </div>
              )}
            </div>
          </div>

          <button
            onClick={() => setMenuAberto(false)}
            type="button"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition cursor-pointer shrink-0"
            title="Fechar menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Lista Vertical dos 8 Módulos */}
        <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
          <span className="block px-3 py-1 text-[10px] font-mono uppercase tracking-widest text-slate-400 dark:text-slate-500 font-bold">
            Módulos de Gestão
          </span>
          {NAV_TABS.filter((tab) => {
            if (tab.adminOnly && usuarioLogado?.role !== 'ROLE_ADMIN') return false;
            if (tab.allowedRoles && !tab.allowedRoles.includes(usuarioLogado?.role || '')) return false;
            return true;
          }).map((tab) => {
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

        {/* Rodapé do Menu com Informações do Usuário */}
        <div className="p-4 border-t border-slate-200/90 dark:border-slate-800/90 bg-slate-50/50 dark:bg-[#0E1424]/50">
          <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 px-1">
            <span className="truncate max-w-[170px]">{usuarioLogado?.email}</span>
            <span className="font-mono text-[10px] uppercase font-bold text-amber-600 dark:text-amber-400">
              {usuarioLogado?.role === 'ROLE_ADMIN'
                ? 'Admin'
                : usuarioLogado?.role === 'ROLE_PROFESSOR'
                ? 'Professor'
                : 'Encarregada'}
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

              {/* Matérias / Disciplinas da Turma */}
              <div className="p-3 bg-violet-50/70 dark:bg-violet-950/30 rounded-2xl space-y-2 border border-violet-200 dark:border-violet-800/60">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-violet-900 dark:text-violet-300 block text-[10px] uppercase tracking-wider">
                    Matérias da Turma (Grade de Disciplinas)
                  </span>
                  <span className="text-[10px] text-violet-600 dark:text-violet-400 font-semibold font-mono">
                    {(novaTurma.materiasNomes || []).length} matéria(s)
                  </span>
                </div>

                <div className="flex gap-1.5">
                  <input
                    type="text"
                    value={inputMateriaTexto}
                    onChange={(e) => setInputMateriaTexto(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAdicionarMateria(e);
                      }
                    }}
                    placeholder="Ex: Audiovisual, Artes Cênicas, Design..."
                    className="flex-1 px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:border-violet-500"
                  />
                  <button
                    type="button"
                    onClick={handleAdicionarMateria}
                    className="px-3 py-1.5 bg-violet-600 hover:bg-violet-700 active:scale-95 text-white rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1 shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Adicionar</span>
                  </button>
                </div>

                <p className="text-[10.5px] text-slate-500 dark:text-slate-400 leading-tight">
                  Digite as matérias individualmente ou separe por vírgula (ex: <i>Audiovisual, Artes Cênicas, Design de Cinema, Máquinas Cinematográficas</i>).
                </p>

                {/* Chips / Tags das Matérias Cadastradas */}
                {(novaTurma.materiasNomes || []).length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {(novaTurma.materiasNomes || []).map((materia, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white dark:bg-slate-800 text-violet-900 dark:text-violet-200 border border-violet-200 dark:border-violet-700 rounded-lg text-xs font-semibold shadow-2xs"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-violet-500 shrink-0" />
                        <span>{materia}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoverMateria(idx)}
                          className="hover:bg-violet-100 dark:hover:bg-violet-900/50 p-0.5 rounded text-violet-500 hover:text-violet-700 dark:hover:text-violet-300 transition cursor-pointer"
                          title="Remover matéria"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
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

      {/* MODAL PERFIL DO ESTUDANTE */}
      {showModalPerfil && perfilAlunoId && (
        <PerfilAlunoModal
          alunoId={perfilAlunoId}
          isOpen={showModalPerfil}
          onClose={() => setShowModalPerfil(false)}
          onUpdate={() => {
            carregarMatriculas();
          }}
        />
      )}
    </div>
  );
}
