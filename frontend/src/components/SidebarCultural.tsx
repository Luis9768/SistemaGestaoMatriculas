'use client';

import React from 'react';
import {
  GraduationCap,
  Building2,
  Calendar,
  Users,
  Search,
  BookOpen,
  FileSpreadsheet,
  Send,
  Lock,
  LogOut,
  UserCheck,
  Activity,
  Layers,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { Escola, LoginResponse } from '@/lib/api';

export type ScreenId =
  | 'panorama'
  | 'escolas'
  | 'professoras'
  | 'turmas'
  | 'matriculas'
  | 'frequencia'
  | 'alunos'
  | 'inscricao'
  | 'importacao';

interface SidebarCulturalProps {
  currentScreen: ScreenId;
  onSelectScreen: (screen: ScreenId) => void;
  escolas: Escola[];
  escolaSelecionada: number | null;
  onSelectEscola: (id: number | null) => void;
  usuarioLogado: LoginResponse | null;
  onOpenLogin: () => void;
  onLogout: () => void;
  onOpenLgpd: (aba: 'geral' | 'alunos') => void;
}

export function SidebarCultural({
  currentScreen,
  onSelectScreen,
  escolas,
  escolaSelecionada,
  onSelectEscola,
  usuarioLogado,
  onOpenLogin,
  onLogout,
  onOpenLgpd,
}: SidebarCulturalProps) {
  const getEscolaBadgeColor = (sigla: string) => {
    switch (sigla) {
      case 'ELT':
        return 'bg-violet-900/60 text-violet-300 border-violet-500/40';
      case 'ELD':
        return 'bg-rose-900/60 text-rose-300 border-rose-500/40';
      case 'ELCV':
        return 'bg-cyan-900/60 text-cyan-300 border-cyan-500/40';
      case 'ELIA':
        return 'bg-amber-900/60 text-amber-300 border-amber-500/40';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  const navItems: {
    id: ScreenId;
    label: string;
    description: string;
    icon: any;
    section: 'panorama' | 'pedagogico' | 'gestao' | 'comunidade';
    badge?: string;
    protected?: boolean;
  }[] = [
    {
      id: 'panorama',
      label: 'Panorama & Indicadores',
      description: 'Métricas executivas, evasão e gráficos',
      icon: Activity,
      section: 'panorama',
      protected: true,
    },
    {
      id: 'escolas',
      label: 'As 4 Casas de Cultura',
      description: 'ELT, ELD, ELCV e ELIA',
      icon: Building2,
      section: 'panorama',
      badge: 'Campus',
    },
    {
      id: 'professoras',
      label: 'Matriz Curricular & Cursos',
      description: 'Disciplinas, cargas horárias e ementas',
      icon: BookOpen,
      section: 'pedagogico',
      badge: 'Professoras',
      protected: true,
    },
    {
      id: 'turmas',
      label: 'Turmas & Ofertas',
      description: 'Vagas, períodos e faixas etárias',
      icon: Calendar,
      section: 'pedagogico',
      protected: true,
    },
    {
      id: 'matriculas',
      label: 'Matrículas & Fila',
      description: 'Gestão de inscritos e suplentes',
      icon: Users,
      section: 'gestao',
      protected: true,
    },
    {
      id: 'frequencia',
      label: 'Frequência & Busca Ativa',
      description: 'Diário de presença e alerta de faltas',
      icon: Layers,
      section: 'gestao',
      protected: true,
    },
    {
      id: 'alunos',
      label: 'Cadastro de Alunos',
      description: 'Pesquisa paginada e responsáveis',
      icon: Search,
      section: 'gestao',
      protected: true,
    },
    {
      id: 'importacao',
      label: 'Importação em Lote',
      description: 'Carga de planilhas CSV e Excel',
      icon: FileSpreadsheet,
      section: 'gestao',
      protected: true,
    },
    {
      id: 'inscricao',
      label: 'Portal do Munícipe',
      description: 'Inscrição pública para cidadãos',
      icon: Send,
      section: 'comunidade',
      badge: 'Público',
    },
  ];

  return (
    <aside className="w-72 bg-[#0B0F17] text-slate-200 flex flex-col h-screen sticky top-0 border-r border-slate-800/80 shadow-2xl z-40 select-none">
      {/* Brand Header Institucional */}
      <div className="p-5 border-b border-slate-800/80 bg-gradient-to-b from-[#111827] to-[#0B0F17]">
        <div className="flex items-center space-x-3">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-amber-600 via-rose-600 to-violet-700 flex items-center justify-center text-white shadow-lg shadow-violet-900/30">
            <Sparkles className="w-6 h-6 text-amber-200" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="text-base font-black tracking-tight text-white">SIGMA</span>
              <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Cultura
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">Prefeitura de Santo André</p>
          </div>
        </div>

        {/* Chip Seletor de Contexto Escolar */}
        <div className="mt-4 pt-3 border-t border-slate-800/60">
          <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-1.5">
            Filtrar Unidade Escolar:
          </label>
          <div className="grid grid-cols-5 gap-1">
            <button
              onClick={() => onSelectEscola(null)}
              className={`py-1 text-[11px] rounded font-bold transition text-center ${
                escolaSelecionada === null
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300'
              }`}
              title="Todas as 4 Escolas"
            >
              TODAS
            </button>
            {escolas.map((esc) => {
              const active = escolaSelecionada === esc.id;
              return (
                <button
                  key={esc.id}
                  onClick={() => onSelectEscola(esc.id)}
                  className={`py-1 text-[11px] rounded font-bold border transition text-center ${
                    active
                      ? `${getEscolaBadgeColor(esc.sigla)} ring-1 ring-white/20 font-black`
                      : 'bg-slate-900/60 hover:bg-slate-800 text-slate-400 border-slate-800'
                  }`}
                  title={`${esc.sigla} - ${esc.nome}`}
                >
                  {esc.sigla}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Navegação Principal em Camadas Estruturadas */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-5 scrollbar-thin scrollbar-thumb-slate-800">
        {/* Seção 1: Panorama & Campus */}
        <div>
          <span className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Panorama Artístico
          </span>
          <div className="mt-1.5 space-y-1">
            {navItems
              .filter((i) => i.section === 'panorama')
              .map((item) => {
                const Icon = item.icon;
                const active = currentScreen === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onSelectScreen(item.id)}
                    className={`w-full text-left px-3 py-2 rounded-xl transition flex items-center justify-between group cursor-pointer ${
                      active
                        ? 'bg-gradient-to-r from-violet-900/50 to-slate-800/60 text-white border border-violet-500/30 shadow-sm'
                        : 'text-slate-300 hover:bg-slate-800/50 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className={`p-1.5 rounded-lg ${
                          active
                            ? 'bg-violet-600 text-white'
                            : 'bg-slate-800/70 text-slate-400 group-hover:text-slate-200'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-semibold leading-tight">{item.label}</div>
                        <div className="text-[10px] text-slate-500 leading-tight">{item.description}</div>
                      </div>
                    </div>
                    {item.badge && (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-800 text-amber-300 border border-slate-700">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
          </div>
        </div>

        {/* Seção 2: Gestão Pedagógica (Portal das Professoras) */}
        <div>
          <span className="px-3 text-[10px] font-bold uppercase tracking-wider text-amber-400/80 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span>Área Pedagógica (Professoras)</span>
          </span>
          <div className="mt-1.5 space-y-1">
            {navItems
              .filter((i) => i.section === 'pedagogico')
              .map((item) => {
                const Icon = item.icon;
                const active = currentScreen === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onSelectScreen(item.id)}
                    className={`w-full text-left px-3 py-2 rounded-xl transition flex items-center justify-between group cursor-pointer ${
                      active
                        ? 'bg-gradient-to-r from-amber-900/40 to-slate-800/60 text-white border border-amber-500/40 shadow-sm'
                        : 'text-slate-300 hover:bg-slate-800/50 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className={`p-1.5 rounded-lg ${
                          active
                            ? 'bg-amber-600 text-slate-950 font-bold'
                            : 'bg-slate-800/70 text-slate-400 group-hover:text-slate-200'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-semibold leading-tight">{item.label}</div>
                        <div className="text-[10px] text-slate-500 leading-tight">{item.description}</div>
                      </div>
                    </div>
                    {item.badge && (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
          </div>
        </div>

        {/* Seção 3: Secretaria & Matrículas */}
        <div>
          <span className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Secretaria & Atendimento
          </span>
          <div className="mt-1.5 space-y-1">
            {navItems
              .filter((i) => i.section === 'gestao')
              .map((item) => {
                const Icon = item.icon;
                const active = currentScreen === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onSelectScreen(item.id)}
                    className={`w-full text-left px-3 py-2 rounded-xl transition flex items-center justify-between group cursor-pointer ${
                      active
                        ? 'bg-gradient-to-r from-cyan-900/40 to-slate-800/60 text-white border border-cyan-500/30 shadow-sm'
                        : 'text-slate-300 hover:bg-slate-800/50 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className={`p-1.5 rounded-lg ${
                          active
                            ? 'bg-cyan-600 text-white'
                            : 'bg-slate-800/70 text-slate-400 group-hover:text-slate-200'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-semibold leading-tight">{item.label}</div>
                        <div className="text-[10px] text-slate-500 leading-tight">{item.description}</div>
                      </div>
                    </div>
                  </button>
                );
              })}
          </div>
        </div>

        {/* Seção 4: Portal do Cidadão */}
        <div>
          <span className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Acesso Aberto
          </span>
          <div className="mt-1.5">
            {navItems
              .filter((i) => i.section === 'comunidade')
              .map((item) => {
                const Icon = item.icon;
                const active = currentScreen === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onSelectScreen(item.id)}
                    className={`w-full text-left px-3 py-2 rounded-xl transition flex items-center justify-between group cursor-pointer ${
                      active
                        ? 'bg-gradient-to-r from-emerald-900/40 to-slate-800/60 text-white border border-emerald-500/30 shadow-sm'
                        : 'text-slate-300 hover:bg-slate-800/50 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className={`p-1.5 rounded-lg ${
                          active
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-800/70 text-slate-400 group-hover:text-slate-200'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-semibold leading-tight">{item.label}</div>
                        <div className="text-[10px] text-slate-500 leading-tight">{item.description}</div>
                      </div>
                    </div>
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      Cidadão
                    </span>
                  </button>
                );
              })}
          </div>
        </div>
      </div>

      {/* Footer com Status LGPD e Usuário */}
      <div className="p-3 border-t border-slate-800/80 bg-[#0E131F] space-y-2">
        {/* Links Rápidos LGPD */}
        <div className="flex items-center justify-between px-2 text-[10px] text-slate-400">
          <button
            onClick={() => onOpenLgpd('geral')}
            className="hover:text-slate-200 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <ShieldCheck className="w-3 h-3 text-emerald-400" />
            <span>LGPD Geral</span>
          </button>
          <span>•</span>
          <button
            onClick={() => onOpenLgpd('alunos')}
            className="hover:text-slate-200 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>Alunos & Menores</span>
          </button>
        </div>

        {/* Card do Usuário Autenticado */}
        {usuarioLogado ? (
          <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-violet-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                {usuarioLogado.nome.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-white truncate">{usuarioLogado.nome}</div>
                <div className="text-[10px] text-amber-300 font-medium truncate">
                  {usuarioLogado.role === 'ROLE_ADMIN' ? 'Coordenação Geral' : `Secretaria ${usuarioLogado.escolaSigla}`}
                </div>
              </div>
            </div>
            <button
              onClick={onLogout}
              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition cursor-pointer"
              title="Encerrar Sessão"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <button
            onClick={onOpenLogin}
            className="w-full py-2 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-bold text-xs rounded-xl flex items-center justify-center space-x-1.5 shadow-md shadow-amber-950/40 transition cursor-pointer"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Acesso Secretaria / Professoras</span>
          </button>
        )}
      </div>
    </aside>
  );
}
