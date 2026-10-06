'use client';

import React, { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  GraduationCap,
  Users,
  ClipboardCheck,
  BookOpen,
  Search,
  FileSpreadsheet,
  ShieldCheck,
  ArrowLeft,
  LogOut,
  CheckCircle2,
  AlertCircle,
  Menu,
  X,
  Plus,
  ChevronDown,
  Building2,
  PanelLeftClose,
  PanelLeftOpen,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { ThemeToggle } from '@/components/ThemeToggle';
import { PerfilAlunoModal } from '@/components/PerfilAlunoModal';
import { NotificacoesPopover } from '@/components/NotificacoesPopover';
import { ModalDetalhesTurma } from '@/components/ModalDetalhesTurma';

/* ─── Navigation Categorized in Shadcn School Style ─── */
interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  adminOnly?: boolean;
  allowedRoles?: string[];
  badge?: string;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const NAV_SECTIONS: NavSection[] = [
  {
    title: 'Visão Geral',
    items: [
      { href: '/panorama', label: 'Dashboard Escolar', icon: LayoutDashboard },
    ],
  },
  {
    title: 'Gestão Acadêmica',
    items: [
      { href: '/turmas', label: 'Turmas & Vagas', icon: GraduationCap },
      { href: '/matriculas', label: 'Matrículas & Fila', icon: Users },
      { href: '/frequencia', label: 'Diário de Chamadas', icon: ClipboardCheck, allowedRoles: ['ROLE_ADMIN', 'ROLE_ENCARREGADA'] },
      { href: '/cursos', label: 'Matriz & Cursos', icon: BookOpen },
      { href: '/alunos', label: 'Dossiê de Alunos', icon: Search },
    ],
  },
  {
    title: 'Administração',
    items: [
      { href: '/usuarios', label: 'Equipe da Secretaria', icon: ShieldCheck, adminOnly: true },
      { href: '/importacao', label: 'Importação em Lote', icon: FileSpreadsheet },
    ],
  },
];

/* ─── School Badge Styles Helper ─── */
function getSchoolColorClasses(sigla?: string) {
  switch (sigla) {
    case 'ELT':
      return {
        bg: 'bg-violet-500/10 dark:bg-violet-950/40',
        text: 'text-violet-700 dark:text-violet-300',
        border: 'border-violet-300 dark:border-violet-700/60',
        dot: 'bg-violet-600',
      };
    case 'ELD':
      return {
        bg: 'bg-rose-500/10 dark:bg-rose-950/40',
        text: 'text-rose-700 dark:text-rose-300',
        border: 'border-rose-300 dark:border-rose-700/60',
        dot: 'bg-rose-600',
      };
    case 'ELCV':
      return {
        bg: 'bg-sky-500/10 dark:bg-sky-950/40',
        text: 'text-sky-700 dark:text-sky-300',
        border: 'border-sky-300 dark:border-sky-700/60',
        dot: 'bg-sky-600',
      };
    case 'EMIA':
    case 'ELIA':
      return {
        bg: 'bg-amber-500/10 dark:bg-amber-950/40',
        text: 'text-amber-700 dark:text-amber-300',
        border: 'border-amber-300 dark:border-amber-700/60',
        dot: 'bg-amber-600',
      };
    default:
      return {
        bg: 'bg-slate-500/10 dark:bg-slate-800/40',
        text: 'text-slate-700 dark:text-slate-300',
        border: 'border-slate-300 dark:border-slate-700',
        dot: 'bg-slate-600',
      };
  }
}

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
    fecharFeedback,
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
    autoDeclaracaoMatriculaId,
    setAutoDeclaracaoMatriculaId,
    carregarMatriculas,
    turmaDetalhesModal,
    fecharModalDetalhesTurma,
  } = useApp();

  // Sidebar collapse & mobile drawer state
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [escolaDropdownOpen, setEscolaDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [inputMateriaTexto, setInputMateriaTexto] = useState('');

  // Carregar preferência salva de sidebar
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('sidebar_collapsed');
      if (saved !== null) {
        setIsCollapsed(saved === 'true');
      }
    }
  }, []);

  const toggleSidebarCollapse = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      if (typeof window !== 'undefined') {
        localStorage.setItem('sidebar_collapsed', String(next));
      }
      return next;
    });
  };

  // Fechar dropdowns ao clicar fora
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setEscolaDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fechar menu mobile ao navegar
  useEffect(() => {
    setMobileMenuOpen(false);
    setEscolaDropdownOpen(false);
  }, [pathname]);

  // Tecla ESC fecha modais/menus
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMobileMenuOpen(false);
        setEscolaDropdownOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (!loading && !usuarioLogado) {
      router.replace('/login');
    }
  }, [loading, usuarioLogado, router]);

  // Se não houver escola selecionada, direciona para o Hub
  useEffect(() => {
    if (!loading && usuarioLogado && escolaSelecionada === null) {
      const permittedIds: number[] = usuarioLogado.escolasIds?.length
        ? usuarioLogado.escolasIds
        : (usuarioLogado.escolas?.map((e) => e.id) || (usuarioLogado.escolaId ? [usuarioLogado.escolaId] : []));

      if (usuarioLogado.role === 'ROLE_ENCARREGADA' && permittedIds.length === 1) {
        setEscolaSelecionada(permittedIds[0]);
      } else {
        router.replace('/direcionamento');
      }
    }
  }, [loading, usuarioLogado, escolaSelecionada, router, setEscolaSelecionada]);

  if (loading || !usuarioLogado) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#090D16] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin text-indigo-600" />
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            Carregando ambiente escolar...
          </span>
        </div>
      </div>
    );
  }

  const schoolColor = getSchoolColorClasses(escolaAtualObj?.sigla);

  const permittedSchoolIds: number[] = usuarioLogado?.escolasIds?.length
    ? usuarioLogado.escolasIds
    : (usuarioLogado?.escolas?.map((e) => e.id) || (usuarioLogado?.escolaId ? [usuarioLogado.escolaId] : []));

  const podeTrocarEscola = usuarioLogado?.role === 'ROLE_ADMIN' || permittedSchoolIds.length > 1;

  const escolasDisponiveis = usuarioLogado?.role === 'ROLE_ADMIN'
    ? escolas
    : escolas.filter((esc) => permittedSchoolIds.includes(esc.id));

  // Mapeamento de Breadcrumb
  const getPageTitle = () => {
    switch (pathname) {
      case '/panorama':
        return 'Dashboard Escolar';
      case '/turmas':
        return 'Turmas & Vagas';
      case '/matriculas':
        return 'Matrículas & Fila';
      case '/frequencia':
        return 'Diário de Chamadas';
      case '/cursos':
        return 'Matriz & Cursos';
      case '/alunos':
        return 'Dossiê de Alunos';
      case '/usuarios':
        return 'Equipe da Secretaria';
      case '/importacao':
        return 'Importação em Lote';
      default:
        return 'Visão Geral';
    }
  };

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

  // Troca rápida de escola no seletor
  const handleTrocarEscola = (id: number | null) => {
    setEscolaSelecionada(id);
    setEscolaDropdownOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#090D16] text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      {/* ─── DESKTOP & MOBILE SIDEBAR ─── */}
      {/* Backdrop Mobile */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-40 lg:hidden"
          aria-hidden="true"
        />
      )}

      {/* Sidebar Principal (Estilo Shadcn Dashboard) */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 bg-white dark:bg-[#0D1322] border-r border-slate-200/90 dark:border-slate-800/90 flex flex-col transition-all duration-300 ease-in-out ${
          isCollapsed ? 'lg:w-[72px]' : 'lg:w-64'
        } ${
          mobileMenuOpen ? 'w-72 translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
        aria-label="Navegação da Escola"
      >
        {/* Topo da Sidebar: Identidade Institucional Santo André */}
        <div className="h-16 px-4 border-b border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <Image
              src="/logo_santo_andre.png"
              alt="Brasão Santo André"
              width={28}
              height={36}
              className="h-8 w-auto object-contain shrink-0 drop-shadow-xs dark:brightness-110"
              priority
            />
            {!isCollapsed && (
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-black tracking-tight text-slate-900 dark:text-white uppercase truncate">
                  Santo André
                </span>
                <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 font-mono tracking-wider truncate">
                  Escolas Livres
                </span>
              </div>
            )}
          </div>

          {/* Botão recolher no desktop ou fechar no mobile */}
          <div className="flex items-center">
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition lg:hidden"
              title="Fechar menu"
            >
              <X className="w-5 h-5" />
            </button>
            <button
              onClick={toggleSidebarCollapse}
              className="hidden lg:flex p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              title={isCollapsed ? 'Expandir barra lateral' : 'Recolher barra lateral'}
            >
              {isCollapsed ? <PanelLeftOpen className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Card Seletor da Escola Ativa (Dropdown Integrado) */}
        <div className="p-3 border-b border-slate-100 dark:border-slate-800/60">
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => podeTrocarEscola && setEscolaDropdownOpen((prev) => !prev)}
              disabled={!podeTrocarEscola}
              className={`w-full flex items-center gap-2.5 p-2 rounded-xl border text-left transition-all ${
                schoolColor.bg
              } ${schoolColor.border} hover:opacity-90 ${
                isCollapsed ? 'justify-center p-2' : 'justify-between'
              } ${!podeTrocarEscola ? 'cursor-default' : 'cursor-pointer'}`}
              title={escolaAtualObj ? escolaAtualObj.nome : 'Rede Municipal'}
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${schoolColor.dot}`} />
                {!isCollapsed && (
                  <div className="min-w-0">
                    <p className={`text-xs font-extrabold truncate ${schoolColor.text}`}>
                      {escolaAtualObj ? escolaAtualObj.sigla : 'REDE'}
                    </p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                      {escolaAtualObj ? escolaAtualObj.nome : 'Todas as Escolas'}
                    </p>
                  </div>
                )}
              </div>
              {!isCollapsed && podeTrocarEscola && (
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              )}
            </button>

            {/* Menu Popover para alternar entre as Escolas Permitidas */}
            {escolaDropdownOpen && (
              <div className="absolute top-full left-0 mt-1.5 w-60 bg-white dark:bg-[#0F1629] border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl z-50 p-1 text-xs">
                <div className="px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-slate-800">
                  Alternar Unidade
                </div>
                {escolasDisponiveis.map((esc) => {
                  const itemColor = getSchoolColorClasses(esc.sigla);
                  const isCurrent = escolaSelecionada === esc.id;
                  return (
                    <button
                      key={esc.id}
                      type="button"
                      onClick={() => handleTrocarEscola(esc.id)}
                      className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-left transition-colors cursor-pointer ${
                        isCurrent
                          ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-bold'
                          : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className={`w-2 h-2 rounded-full shrink-0 ${itemColor.dot}`} />
                        <span className="truncate">{esc.nome}</span>
                      </div>
                      <span className="text-[10px] font-mono uppercase font-bold text-slate-400">
                        {esc.sigla}
                      </span>
                    </button>
                  );
                })}
                {usuarioLogado?.role === 'ROLE_ADMIN' && (
                  <>
                    <div className="border-t border-slate-100 dark:border-slate-800 my-1" />
                    <button
                      type="button"
                      onClick={() => handleTrocarEscola(null)}
                      className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-left transition-colors cursor-pointer ${
                        escolaSelecionada === null
                          ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-bold'
                          : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-slate-400" />
                        <span>Todas as Escolas (Rede)</span>
                      </div>
                    </button>
                  </>
                )}
                <div className="border-t border-slate-100 dark:border-slate-800 my-1" />
                <Link
                  href="/direcionamento"
                  onClick={() => setEscolaDropdownOpen(false)}
                  className="flex items-center gap-2 px-2.5 py-2 rounded-lg text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Voltar ao Hub de Escolas</span>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Navegação Hierárquica da Sidebar */}
        <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-5">
          {NAV_SECTIONS.map((section) => {
            const filteredItems = section.items.filter((item) => {
              if (item.adminOnly && usuarioLogado?.role !== 'ROLE_ADMIN') return false;
              if (item.allowedRoles && !item.allowedRoles.includes(usuarioLogado?.role || '')) return false;
              return true;
            });

            if (filteredItems.length === 0) return null;

            return (
              <div key={section.title} className="space-y-1">
                {!isCollapsed && (
                  <p className="px-2.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 font-mono">
                    {section.title}
                  </p>
                )}
                {filteredItems.map((item) => {
                  const ItemIcon = item.icon;
                  const isActive = pathname === item.href;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      title={isCollapsed ? item.label : undefined}
                      className={`flex items-center gap-3 px-2.5 py-2 rounded-xl text-xs font-semibold transition-all duration-150 cursor-pointer ${
                        isCollapsed ? 'justify-center px-0' : ''
                      } ${
                        isActive
                          ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950 shadow-xs'
                          : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-slate-800/60'
                      }`}
                    >
                      <ItemIcon
                        className={`w-4 h-4 shrink-0 ${
                          isActive
                            ? 'text-indigo-400 dark:text-indigo-600'
                            : 'text-slate-400 dark:text-slate-500'
                        }`}
                      />
                      {!isCollapsed && <span className="truncate">{item.label}</span>}
                      {!isCollapsed && item.badge && (
                        <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded-md font-mono bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            );
          })}
        </nav>

        {/* Rodapé da Sidebar: Perfil do Usuário */}
        <div className="p-3 border-t border-slate-200/80 dark:border-slate-800/80 bg-slate-50/50 dark:bg-[#0B101D]/50">
          <div
            className={`flex items-center gap-2.5 ${
              isCollapsed ? 'justify-center' : 'justify-between'
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                {usuarioLogado?.email?.slice(0, 2).toUpperCase() || 'US'}
              </div>
              {!isCollapsed && (
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                    {usuarioLogado?.email?.split('@')[0]}
                  </p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono truncate">
                    {usuarioLogado?.role === 'ROLE_ADMIN' ? 'Administrador' : 'Encarregada'}
                  </p>
                </div>
              )}
            </div>

            {!isCollapsed && (
              <button
                onClick={handleLogout}
                type="button"
                className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition cursor-pointer"
                title="Encerrar sessão"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* ─── MAIN CONTENT WRAPPER ─── */}
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ${
          isCollapsed ? 'lg:pl-[72px]' : 'lg:pl-64'
        }`}
      >
        {/* Topbar Superior Integrada (Shadcn School Style) */}
        <header className="sticky top-0 z-30 h-16 bg-white/80 dark:bg-[#090D16]/80 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between px-4 sm:px-6">
          {/* Lado Esquerdo: Toggle Mobile + Breadcrumbs */}
          <div className="flex items-center gap-3 min-w-0">
            {/* Botão Hamburger (Mobile) */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              type="button"
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 lg:hidden cursor-pointer"
              aria-label="Abrir menu lateral"
            >
              <Menu className="w-4 h-4" />
            </button>

            {/* Breadcrumb Elegante */}
            <nav className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 truncate">
              {podeTrocarEscola ? (
                <Link
                  href="/direcionamento"
                  className="hover:text-slate-900 dark:hover:text-white transition flex items-center gap-1"
                  title="Voltar ao Hub de Escolas"
                >
                  <Building2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Escolas Livres</span>
                </Link>
              ) : (
                <span className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
                  <Building2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Escola Livre</span>
                </span>
              )}
              <ChevronRight className="w-3 h-3 text-slate-400" />
              <Link
                href="/panorama"
                className="font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition truncate max-w-[140px] sm:max-w-[200px]"
              >
                {escolaAtualObj ? escolaAtualObj.nome : 'Rede Municipal'}
              </Link>
              <ChevronRight className="w-3 h-3 text-slate-400" />
              <span className="font-bold text-slate-900 dark:text-white truncate">
                {getPageTitle()}
              </span>
            </nav>
          </div>

          {/* Lado Direito: Ações Globais */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Central de Notificações */}
            <NotificacoesPopover escolaId={escolaSelecionada} />

            {/* Alternador Modo Claro / Escuro */}
            <ThemeToggle showLabel={false} />

            {/* Botão Sair Rápido */}
            <button
              onClick={handleLogout}
              type="button"
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 hover:border-rose-300 transition cursor-pointer shadow-2xs"
              title="Encerrar sessão"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Feedback Alert Toast Flutuante do Sistema */}
        {feedbackMsg && (
          <div className="fixed top-6 right-6 z-[100] max-w-md w-[calc(100vw-3rem)] animate-in slide-in-from-top-3 fade-in duration-200">
            <div
              className={`p-4 rounded-2xl shadow-2xl flex items-start justify-between gap-3 border bg-white dark:bg-[#0E1526] ${
                feedbackMsg.tipo === 'sucesso'
                  ? 'border-emerald-500/40 dark:border-emerald-500/40 text-slate-900 dark:text-white ring-1 ring-emerald-500/10'
                  : 'border-rose-500/40 dark:border-rose-500/40 text-slate-900 dark:text-white ring-1 ring-rose-500/10'
              }`}
            >
              <div className="flex items-start gap-3 min-w-0">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                    feedbackMsg.tipo === 'sucesso'
                      ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                      : 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                  }`}
                >
                  {feedbackMsg.tipo === 'sucesso' ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : (
                    <AlertCircle className="w-5 h-5" />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold leading-tight">
                    {feedbackMsg.tipo === 'sucesso' ? 'Operação Concluída' : 'Atenção / Falha'}
                  </p>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                    {feedbackMsg.texto}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={fecharFeedback}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer shrink-0"
                title="Fechar notificação"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Área Principal de Conteúdo */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6">
          {children}
        </main>
      </div>

      {/* ─── MODAIS GLOBAIS ─── */}
      {/* Modal Nova Turma */}
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
                  Digite as matérias individualmente ou separe por vírgula (ex: <i>Audiovisual, Artes Cênicas, Design de Cinema</i>).
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
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-xs cursor-pointer"
                >
                  Salvar Turma
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Perfil do Estudante */}
      {showModalPerfil && perfilAlunoId && (
        <PerfilAlunoModal
          alunoId={perfilAlunoId}
          isOpen={showModalPerfil}
          autoAbrirDeclaracaoMatriculaId={autoDeclaracaoMatriculaId}
          onClose={() => {
            setShowModalPerfil(false);
            setAutoDeclaracaoMatriculaId(null);
          }}
          onUpdate={() => {
            carregarMatriculas();
          }}
        />
      )}

      {/* Modal Detalhes da Turma Global */}
      {turmaDetalhesModal && (
        <ModalDetalhesTurma
          isOpen={Boolean(turmaDetalhesModal)}
          turma={turmaDetalhesModal}
          onClose={fecharModalDetalhesTurma}
          onMatricular={(id) => {
            fecharModalDetalhesTurma();
            router.push(`/inscricao?turma=${id}`);
          }}
          onGerenciarMaterias={(turma) => {
            fecharModalDetalhesTurma();
            router.push(`/turmas?turmaId=${turma.id}`);
          }}
        />
      )}
    </div>
  );
}
