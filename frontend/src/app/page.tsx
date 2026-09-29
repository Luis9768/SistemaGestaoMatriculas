'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  api,
  Escola,
  Curso,
  Turma,
  Matricula,
  Aluno,
  PageResponse,
  LoginResponse,
  ImportacaoResultado,
  InscricaoExternaPayload,
} from '@/lib/api';
import { DirecionamentoEscolasView } from '@/components/DirecionamentoEscolasView';
import { ThemeToggle } from '@/components/ThemeToggle';
import { EscolasCampusView } from '@/components/EscolasCampusView';
import { PortalProfessorasView } from '@/components/PortalProfessorasView';
import { TurmasOfertasView } from '@/components/TurmasOfertasView';
import { MatriculasView } from '@/components/MatriculasView';
import { AlunosPesquisaView } from '@/components/AlunosPesquisaView';
import { InscricaoPublicaView } from '@/components/InscricaoPublicaView';
import { ImportacaoLoteView } from '@/components/ImportacaoLoteView';
import { DashboardAnalytics } from '@/components/DashboardAnalytics';
import { PerfilAlunoModal } from '@/components/PerfilAlunoModal';
import { LgpdModal } from '@/components/LgpdModal';
import { LoginCulturalView } from '@/components/LoginCulturalView';
import {
  RefreshCw,
  Sparkles,
  Calendar,
  X,
  CheckCircle2,
  AlertCircle,
  Building2,
  Clock,
  ArrowLeft,
  LogOut,
  Users,
  Layers,
  BookOpen,
  Search,
  FileSpreadsheet,
  Activity,
  Send,
  ShieldCheck,
  ChevronDown,
} from 'lucide-react';

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

interface NavTabItem {
  id: ScreenId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const NAV_TABS: NavTabItem[] = [
  { id: 'turmas', label: 'Turmas & Ofertas', icon: Calendar },
  { id: 'matriculas', label: 'Matrículas & Fila', icon: Users },
  { id: 'frequencia', label: 'Diário & Frequência', icon: Layers },
  { id: 'professoras', label: 'Matriz Curricular & Cursos', icon: BookOpen },
  { id: 'alunos', label: 'Cadastro de Alunos', icon: Search },
  { id: 'importacao', label: 'Importação em Lote', icon: FileSpreadsheet },
  { id: 'panorama', label: 'Panorama & Métricas', icon: Activity },
  { id: 'inscricao', label: 'Inscrição Pública', icon: Send },
];

export default function Home() {
  const [currentScreen, setCurrentScreen] = useState<ScreenId>('turmas');

  // Estado da Escola Ativa (null = Hub de Direcionamento)
  const [escolas, setEscolas] = useState<Escola[]>([]);
  const [escolaSelecionada, setEscolaSelecionada] = useState<number | null>(null);

  // Usuário Autenticado da Secretaria
  const [usuarioLogado, setUsuarioLogado] = useState<LoginResponse | null>(null);

  // Estados de Dados Centrais
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [matriculas, setMatriculas] = useState<Matricula[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ tipo: 'sucesso' | 'erro'; texto: string } | null>(null);

  // Perfil do Aluno e Presenças
  const [perfilAlunoId, setPerfilAlunoId] = useState<number | null>(null);
  const [showModalPerfil, setShowModalPerfil] = useState(false);

  // Pesquisa Paginada de Alunos
  const [paginaAlunos, setPaginaAlunos] = useState<PageResponse<Aluno>>({
    content: [],
    totalElements: 0,
    totalPages: 0,
    size: 10,
    number: 0,
    first: true,
    last: true,
    empty: true,
  });
  const [paginaAtualAlunos, setPaginaAtualAlunos] = useState(0);
  const [buscaAlunoTermo, setBuscaAlunoTermo] = useState('');
  const [loadingAlunos, setLoadingAlunos] = useState(false);

  // Formulário de Nova Turma
  const [showModalTurma, setShowModalTurma] = useState(false);
  const [turmaCursoPreSelecionadoId, setTurmaCursoPreSelecionadoId] = useState<number | null>(null);
  const [novaTurma, setNovaTurma] = useState<Turma>({
    cursoId: 0,
    codigo: '',
    dataAberturaMatricula: '',
    dataFechamentoMatricula: '',
    dataInicioAulas: '',
    dataFimAulas: '',
    vagasTotais: 30,
    idadeMinima: undefined,
    idadeMaxima: undefined,
    diasToleranciaSuplencia: 60,
  });

  // Modal LGPD
  const [showModalLgpd, setShowModalLgpd] = useState(false);
  const [lgpdAbaInicial, setLgpdAbaInicial] = useState<'geral' | 'alunos'>('geral');

  // Tempo de sessão
  const [tempoRestanteMin, setTempoRestanteMin] = useState<number>(120);

  useEffect(() => {
    // Validação estrita: se não houver token ou se tiver expirado (>2h), exige login
    const user = api.getUsuarioSalvo();
    if (user) {
      setUsuarioLogado(user);
      // Mantém escolaSelecionada como null para que a 2ª tela (Direcionamento) seja exibida inicialmente
      setEscolaSelecionada(null);
      const { minutos } = api.getTempoRestanteSessao();
      setTempoRestanteMin(minutos);
      carregarDadosIniciais(user);
    } else {
      setUsuarioLogado(null);
      setLoading(false);
    }
  }, []);

  // Monitoramento ativo da expiração de 2 horas da sessão JWT
  useEffect(() => {
    if (!usuarioLogado) return;
    const interval = setInterval(() => {
      const user = api.getUsuarioSalvo();
      if (!user) {
        handleLogout();
        mostrarFeedback('erro', 'Sua sessão expirou (limite máximo de 2 horas). Por favor, realize login novamente.');
      } else {
        const { minutos } = api.getTempoRestanteSessao();
        setTempoRestanteMin(minutos);
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [usuarioLogado]);

  useEffect(() => {
    if (escolaSelecionada !== null) {
      carregarDadosEscola();
    }
  }, [escolaSelecionada]);

  useEffect(() => {
    if (escolaSelecionada !== null) {
      carregarAlunosPaginados(paginaAtualAlunos);
    }
  }, [escolaSelecionada, paginaAtualAlunos]);

  const carregarDadosIniciais = async (userAtivo?: LoginResponse | null) => {
    setLoading(true);
    try {
      const esc = await api.getEscolas();
      setEscolas(esc);
      const isAuth = !!(userAtivo || usuarioLogado);
      if (isAuth) {
        const [c, t, m] = await Promise.all([
          api.getCursos(),
          api.getTurmas(),
          api.getMatriculas(),
        ]);
        setCursos(c);
        setTurmas(t);
        setMatriculas(m);
      } else {
        const [c, t] = await Promise.all([
          api.getCursos(),
          api.getTurmas(undefined, undefined, true),
        ]);
        setCursos(c);
        setTurmas(t);
      }
    } catch (e: any) {
      mostrarFeedback('erro', 'Erro ao carregar dados do servidor: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  const carregarDadosEscola = async () => {
    setRefreshing(true);
    try {
      if (usuarioLogado || api.getUsuarioSalvo()) {
        const [c, t, m] = await Promise.all([
          api.getCursos(escolaSelecionada || undefined),
          api.getTurmas(undefined, escolaSelecionada || undefined),
          api.getMatriculas(escolaSelecionada || undefined),
        ]);
        setCursos(c);
        setTurmas(t);
        setMatriculas(m);

        if (c.length > 0 && (!novaTurma.cursoId || !c.some((cur) => cur.id === novaTurma.cursoId))) {
          setNovaTurma((prev) => ({ ...prev, cursoId: c[0]?.id || 0 }));
        }
      } else {
        const [c, t] = await Promise.all([
          api.getCursos(escolaSelecionada || undefined),
          api.getTurmas(undefined, escolaSelecionada || undefined, true),
        ]);
        setCursos(c);
        setTurmas(t);
      }
    } catch (e: any) {
      mostrarFeedback('erro', 'Erro ao sincronizar informações: ' + e.message);
    } finally {
      setRefreshing(false);
    }
  };

  const carregarAlunosPaginados = async (pagina: number = 0, buscaOverride?: string) => {
    setLoadingAlunos(true);
    try {
      const termo = buscaOverride !== undefined ? buscaOverride : buscaAlunoTermo;
      const res = await api.getAlunosPaginado(
        pagina,
        10,
        escolaSelecionada || undefined,
        termo || undefined
      );
      setPaginaAlunos(res);
      setPaginaAtualAlunos(pagina);
    } catch (e: any) {
      mostrarFeedback('erro', 'Erro ao pesquisar alunos: ' + e.message);
    } finally {
      setLoadingAlunos(false);
    }
  };

  const mostrarFeedback = (tipo: 'sucesso' | 'erro', texto: string) => {
    setFeedbackMsg({ tipo, texto });
    setTimeout(() => setFeedbackMsg(null), 6000);
  };

  const handleLoginSucesso = async (resp: LoginResponse) => {
    setUsuarioLogado(resp);
    const { minutos } = api.getTempoRestanteSessao();
    setTempoRestanteMin(minutos);
    mostrarFeedback('sucesso', `Bem-vinda(o), ${resp.nome}! Sessão iniciada com sucesso.`);
    // Abre diretamente na Segunda Tela de Direcionamento
    setEscolaSelecionada(null);
    await carregarDadosIniciais(resp);
  };

  const handleLogout = () => {
    api.logout();
    setUsuarioLogado(null);
    setEscolaSelecionada(null);
    setCurrentScreen('turmas');
    mostrarFeedback('sucesso', 'Sessão encerrada com segurança.');
  };

  // Ações de Matrícula
  const handlePromoverSuplente = async (matriculaId: number, alunoNome: string) => {
    if (!confirm(`Deseja promover o suplente ${alunoNome} para vaga efetiva nesta turma?`)) return;
    try {
      await api.promoverSuplente(matriculaId);
      mostrarFeedback('sucesso', `Suplente ${alunoNome} promovido com sucesso para vaga efetiva!`);
      await carregarDadosEscola();
    } catch (e: any) {
      mostrarFeedback('erro', e.message || 'Erro ao promover suplente.');
    }
  };

  const handleCancelarMatricula = async (matriculaId: number) => {
    if (!confirm('Deseja realmente cancelar esta matrícula? A vaga será liberada imediatamente para o próximo da fila de espera.')) return;
    try {
      await api.cancelarMatricula(matriculaId);
      mostrarFeedback('sucesso', 'Matrícula cancelada e vaga disponibilizada para a fila de espera.');
      await carregarDadosEscola();
    } catch (e: any) {
      mostrarFeedback('erro', e.message || 'Erro ao cancelar matrícula.');
    }
  };

  // Criação de Curso com Disciplinas
  const handleSalvarCursoComDisciplinas = async (cursoData: Curso) => {
    const salvo = await api.createCurso(cursoData);
    mostrarFeedback('sucesso', `Curso "${salvo.nome}" cadastrado com sucesso!`);
    await carregarDadosEscola();
  };

  // Abertura de Turma
  const handleCriarTurma = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createTurma(novaTurma);
      setShowModalTurma(false);
      mostrarFeedback('sucesso', `Turma ${novaTurma.codigo} aberta com sucesso!`);
      await carregarDadosEscola();
    } catch (e: any) {
      mostrarFeedback('erro', 'Erro ao criar turma: ' + e.message);
    }
  };

  // Inscrição Pública
  const handleSubmeterInscricao = async (payload: InscricaoExternaPayload) => {
    await api.inscreverExterno(payload);
    mostrarFeedback('sucesso', 'Inscrição confirmada com sucesso!');
    await carregarDadosEscola();
  };

  // Upload Planilha
  const handleUploadPlanilha = async (file: File): Promise<ImportacaoResultado> => {
    const res = await api.importarPlanilha(file);
    mostrarFeedback('sucesso', `Processamento concluído: ${res.sucesso} matrículas importadas com sucesso!`);
    await carregarDadosEscola();
    return res;
  };

  const escolaAtualObj = escolas.find((e) => e.id === escolaSelecionada) || null;

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

  // 1. Não autenticado: Exibe a Tela de Login Cultural
  if (!usuarioLogado) {
    return <LoginCulturalView onLoginSucesso={handleLoginSucesso} />;
  }

  // 2. Autenticado mas sem escola selecionada: Exibe a SEGUNDA TELA DE DIRECIONAMENTO
  if (escolaSelecionada === null) {
    return (
      <DirecionamentoEscolasView
        usuarioLogado={usuarioLogado}
        escolas={escolas}
        cursos={cursos}
        turmas={turmas}
        matriculas={matriculas}
        tempoRestanteMin={tempoRestanteMin}
        onSelecionarEscola={(id) => {
          setEscolaSelecionada(id);
          setCurrentScreen('turmas');
        }}
        onLogout={handleLogout}
      />
    );
  }

  // 3. Autenticado e dentro de uma escola selecionada: Layout moderno SEM menu lateral SIGMA
  const badgeStyle = getEscolaBadgeStyle(escolaAtualObj?.sigla);

  return (
    <div className="min-h-screen bg-[#FAF9F7] dark:bg-[#090D16] text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      {/* Topbar Superior Integrada — Substitui completamente a antiga Sidebar SIGMA */}
      <header className="bg-white/95 dark:bg-[#0D1322]/95 backdrop-blur-md border-b border-slate-200/90 dark:border-slate-800/90 sticky top-0 z-30 shadow-xs">
        {/* Linha 1: Identidade, Unidade Ativa, Controles e Sessão */}
        <div className="max-w-7xl mx-auto px-4 sm:px-8 h-16 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
            {/* Botão de Retorno ao Hub de Escolas */}
            <button
              onClick={() => setEscolaSelecionada(null)}
              type="button"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all shadow-xs cursor-pointer shrink-0"
              title="Voltar para a Tela de Direcionamento das Escolas"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Hub de Escolas</span>
            </button>

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

          {/* Ações da Direita: Troca Rápida (Admin), Refresh, Tema, Sessão e Logout */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Troca Rápida de Escola para Administradores */}
            {usuarioLogado.role === 'ROLE_ADMIN' && escolas.length > 0 && (
              <div className="hidden xl:flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
                {escolas.map((esc) => (
                  <button
                    key={esc.id}
                    onClick={() => setEscolaSelecionada(esc.id)}
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
              onClick={() => {
                setLgpdAbaInicial('geral');
                setShowModalLgpd(true);
              }}
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

        {/* Linha 2: Barra de Abas Horizontais dos Módulos */}
        <div className="border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/60 dark:bg-[#0A0F1D]/60 overflow-x-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-8 flex items-center gap-1.5 py-2">
            {NAV_TABS.map((tab) => {
              const TabIcon = tab.icon;
              const active = currentScreen === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setCurrentScreen(tab.id)}
                  className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 whitespace-nowrap cursor-pointer ${
                    active
                      ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800'
                  }`}
                >
                  <TabIcon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
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
            <button
              onClick={() => setFeedbackMsg(null)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-md transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Conteúdo Principal — Espaço Amplo sem a barra lateral */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8 py-8">
        {/* TELA 1: TURMAS & OFERTAS */}
        {currentScreen === 'turmas' && (
          <TurmasOfertasView
            turmas={turmas}
            cursos={cursos}
            escolas={escolas}
            escolaSelecionada={escolaSelecionada}
            onAbrirModalTurma={() => setShowModalTurma(true)}
            onMatricularNaTurma={(turmaId) => {
              setTurmaCursoPreSelecionadoId(turmaId);
              setCurrentScreen('inscricao');
            }}
          />
        )}

        {/* TELA 2: MATRÍCULAS & FILA DE ESPERA */}
        {currentScreen === 'matriculas' && (
          <MatriculasView
            matriculas={matriculas}
            escolaSelecionada={escolaSelecionada}
            onNovaMatricula={() => setCurrentScreen('inscricao')}
            onPromoverSuplente={handlePromoverSuplente}
            onCancelarMatricula={handleCancelarMatricula}
            onOpenPerfilAluno={(id) => {
              setPerfilAlunoId(id);
              setShowModalPerfil(true);
            }}
          />
        )}

        {/* TELA 3: FREQUÊNCIA & DIÁRIO DE CLASSE */}
        {currentScreen === 'frequencia' && (
          <DashboardAnalytics
            escolaId={escolaSelecionada}
            turmas={turmas}
            usuarioLogado={usuarioLogado}
            onOpenLogin={handleLogout}
            onOpenPerfilAluno={(id) => {
              setPerfilAlunoId(id);
              setShowModalPerfil(true);
            }}
          />
        )}

        {/* TELA 4: PORTAL DAS PROFESSORAS (MATRIZ CURRICULAR) */}
        {currentScreen === 'professoras' && (
          <PortalProfessorasView
            cursos={cursos}
            escolas={escolas}
            escolaSelecionada={escolaSelecionada}
            onSalvarCurso={handleSalvarCursoComDisciplinas}
            onAbrirNovaTurma={(cursoId) => {
              setTurmaCursoPreSelecionadoId(cursoId);
              setNovaTurma((prev) => ({ ...prev, cursoId }));
              setShowModalTurma(true);
            }}
          />
        )}

        {/* TELA 5: CADASTRO DE ALUNOS */}
        {currentScreen === 'alunos' && (
          <AlunosPesquisaView
            paginaAlunos={paginaAlunos}
            paginaAtualAlunos={paginaAtualAlunos}
            buscaAlunoTermo={buscaAlunoTermo}
            loadingAlunos={loadingAlunos}
            escolaAtualObj={escolaAtualObj}
            onBuscarAlunos={(termo) => {
              setBuscaAlunoTermo(termo);
              setPaginaAtualAlunos(0);
              carregarAlunosPaginados(0, termo);
            }}
            onMudarPagina={(pag) => setPaginaAtualAlunos(pag)}
            onCadastrarNovoAluno={() => setCurrentScreen('inscricao')}
            onOpenPerfilAluno={(id) => {
              setPerfilAlunoId(id);
              setShowModalPerfil(true);
            }}
            onVerTodasEscolas={() => setEscolaSelecionada(null)}
          />
        )}

        {/* TELA 6: IMPORTAÇÃO EM LOTE */}
        {currentScreen === 'importacao' && (
          <ImportacaoLoteView onUploadPlanilha={handleUploadPlanilha} />
        )}

        {/* TELA 7: PANORAMA & INDICADORES DE EVASÃO */}
        {currentScreen === 'panorama' && (
          <DashboardAnalytics
            escolaId={escolaSelecionada}
            turmas={turmas}
            usuarioLogado={usuarioLogado}
            onOpenLogin={handleLogout}
            onOpenPerfilAluno={(id) => {
              setPerfilAlunoId(id);
              setShowModalPerfil(true);
            }}
          />
        )}

        {/* TELA 8: INSCRIÇÃO PÚBLICA / PORTAL DO MUNÍCIPE */}
        {currentScreen === 'inscricao' && (
          <InscricaoPublicaView
            turmas={turmas}
            turmaPreSelecionadaId={turmaCursoPreSelecionadoId || undefined}
            alunoMenorDeIdade={false}
            onSubmeterInscricao={handleSubmeterInscricao}
            onOpenLgpd={(aba) => {
              setLgpdAbaInicial(aba);
              setShowModalLgpd(true);
            }}
          />
        )}

        {/* TELA 9: AS 4 CASAS DE CULTURA (VISÃO GLOBAL) */}
        {currentScreen === 'escolas' && (
          <EscolasCampusView
            escolas={escolas}
            cursos={cursos}
            turmas={turmas}
            onFiltrarEscola={(id) => setEscolaSelecionada(id)}
            onVerCursosEscola={(id) => {
              setEscolaSelecionada(id);
              setCurrentScreen('professoras');
            }}
          />
        )}
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
                <div className="pt-1">
                  <label className="block text-[11px] text-slate-600 dark:text-slate-400 mb-0.5">
                    Tolerância para Chamar Suplentes (Dias após o início)
                  </label>
                  <input
                    type="number"
                    value={novaTurma.diasToleranciaSuplencia || 60}
                    onChange={(e) => setNovaTurma({ ...novaTurma, diasToleranciaSuplencia: Number(e.target.value) })}
                    className="w-full px-2 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white"
                  />
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

      {/* Modal de Prontuário Completo do Aluno */}
      {showModalPerfil && perfilAlunoId && (
        <PerfilAlunoModal
          alunoId={perfilAlunoId}
          isOpen={showModalPerfil}
          onClose={() => {
            setShowModalPerfil(false);
            setPerfilAlunoId(null);
          }}
          onUpdate={() => {
            carregarAlunosPaginados(paginaAtualAlunos);
          }}
        />
      )}

      {/* Modal LGPD */}
      <LgpdModal
        isOpen={showModalLgpd}
        onClose={() => setShowModalLgpd(false)}
        abaInicial={lgpdAbaInicial}
      />
    </div>
  );
}
