'use client';

import React, { useState, useEffect } from 'react';
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
import { SidebarCultural, ScreenId } from '@/components/SidebarCultural';
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
import {
  Lock,
  RefreshCw,
  Sparkles,
  Calendar,
  X,
  CheckCircle2,
  AlertCircle,
  Menu,
  Building2,
} from 'lucide-react';

export default function Home() {
  const [currentScreen, setCurrentScreen] = useState<ScreenId>('panorama');

  // Estado da Escola Ativa (null = Todas / Global)
  const [escolas, setEscolas] = useState<Escola[]>([]);
  const [escolaSelecionada, setEscolaSelecionada] = useState<number | null>(null);

  // Usuário Autenticado da Secretaria
  const [usuarioLogado, setUsuarioLogado] = useState<LoginResponse | null>(null);
  const [showModalLogin, setShowModalLogin] = useState(false);
  const [emailLogin, setEmailLogin] = useState('');
  const [senhaLogin, setSenhaLogin] = useState('');
  const [loginErro, setLoginErro] = useState<string | null>(null);
  const [loggingIn, setLoggingIn] = useState(false);

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

  // Menu móvel
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const user = api.getUsuarioSalvo();
    if (user) {
      setUsuarioLogado(user);
      if (user.role === 'ROLE_ENCARREGADA' && user.escolaId) {
        setEscolaSelecionada(user.escolaId);
      }
      carregarDadosIniciais(user);
    } else {
      // Auto-autenticação para ambiente local/desenvolvimento
      autoLoginDefault();
    }
  }, []);

  const autoLoginDefault = async () => {
    try {
      const resp = await api.login('admin@santoandre.sp.gov.br', 'admin123');
      setUsuarioLogado(resp);
      await carregarDadosIniciais(resp);
    } catch {
      await carregarDadosIniciais(null);
    }
  };

  useEffect(() => {
    carregarDadosEscola();
  }, [escolaSelecionada]);

  useEffect(() => {
    carregarAlunosPaginados(paginaAtualAlunos);
  }, [escolaSelecionada, paginaAtualAlunos]);

  const carregarDadosIniciais = async (userAtivo?: LoginResponse | null) => {
    setLoading(true);
    try {
      const esc = await api.getEscolas();
      setEscolas(esc);
      const isAuth = !!(userAtivo || usuarioLogado);
      if (isAuth) {
        await carregarDadosEscola();
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

  // Login da Secretaria
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoggingIn(true);
    setLoginErro(null);
    try {
      const resp = await api.login(emailLogin, senhaLogin);
      setUsuarioLogado(resp);
      setShowModalLogin(false);
      setEmailLogin('');
      setSenhaLogin('');
      mostrarFeedback('sucesso', `Bem-vinda(o), ${resp.nome}! Login autenticado com sucesso.`);
      if (resp.role === 'ROLE_ENCARREGADA' && resp.escolaId) {
        setEscolaSelecionada(resp.escolaId);
      }
      await carregarDadosEscola();
      await carregarAlunosPaginados(0);
    } catch (err: any) {
      setLoginErro(err.message || 'Falha ao autenticar.');
    } finally {
      setLoggingIn(false);
    }
  };

  const handleLogout = () => {
    api.logout();
    setUsuarioLogado(null);
    setEscolaSelecionada(null);
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

  // Criação de Curso com Disciplinas (Pedido das Professoras)
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

  const getScreenTitle = (screen: ScreenId) => {
    switch (screen) {
      case 'panorama':
        return 'Panorama Cultural & Indicadores de Evasão';
      case 'escolas':
        return 'As 4 Casas de Cultura de Santo André';
      case 'professoras':
        return 'Portal Pedagógico das Professoras — Matriz Curricular & Cursos';
      case 'turmas':
        return 'Turmas, Ofertas Letivas & Vagas';
      case 'matriculas':
        return 'Secretaria de Matrículas & Suplência';
      case 'frequencia':
        return 'Diário de Frequência, Presenças & Busca Ativa';
      case 'alunos':
        return 'Cadastro Central de Alunos';
      case 'inscricao':
        return 'Portal do Munícipe — Inscrição Pública';
      case 'importacao':
        return 'Automação de Importação em Lote';
      default:
        return 'SIGMA Cultura';
    }
  };

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 flex font-sans">
      {/* Sidebar Cultural Fixa */}
      <div className="hidden lg:block shrink-0">
        <SidebarCultural
          currentScreen={currentScreen}
          onSelectScreen={setCurrentScreen}
          escolas={escolas}
          escolaSelecionada={escolaSelecionada}
          onSelectEscola={setEscolaSelecionada}
          usuarioLogado={usuarioLogado}
          onOpenLogin={() => setShowModalLogin(true)}
          onLogout={handleLogout}
          onOpenLgpd={(aba) => {
            setLgpdAbaInicial(aba);
            setShowModalLgpd(true);
          }}
        />
      </div>

      {/* Container Principal */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar Superior com Identidade Cultural e Breadcrumbs */}
        <header className="bg-white/95 backdrop-blur-md border-b border-slate-200/90 h-16 px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30 shadow-xs">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Santo André
                </span>
                <span className="text-slate-300">•</span>
                <h1 className="text-sm font-extrabold text-slate-800 tracking-tight">
                  {getScreenTitle(currentScreen)}
                </h1>
              </div>
            </div>
          </div>

          {/* Contexto da Escola e Ações */}
          <div className="flex items-center space-x-3">
            {escolaAtualObj ? (
              <div className="flex items-center space-x-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold">
                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                <span>Unidade: <strong>{escolaAtualObj.sigla}</strong> ({escolaAtualObj.nome})</span>
                <button
                  onClick={() => setEscolaSelecionada(null)}
                  className="text-blue-600 hover:text-blue-800 font-bold ml-1 cursor-pointer"
                  title="Ver todas as 4 escolas"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="hidden sm:flex items-center space-x-1.5 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-600">
                <Building2 className="w-3.5 h-3.5 text-slate-500" />
                <span>Visão Integrada: <strong>Todas as 4 Escolas</strong></span>
              </div>
            )}

            <button
              onClick={carregarDadosEscola}
              disabled={refreshing}
              className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition cursor-pointer border border-slate-200"
              title="Recarregar dados"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-blue-600' : ''}`} />
            </button>
          </div>
        </header>

        {/* Notificações do Sistema */}
        {feedbackMsg && (
          <div className="max-w-7xl mx-auto w-full px-4 sm:px-8 mt-4">
            <div
              className={`p-4 rounded-2xl flex items-center justify-between shadow-xs border ${
                feedbackMsg.tipo === 'sucesso'
                  ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
                  : 'bg-rose-50 text-rose-900 border-rose-300'
              }`}
            >
              <div className="flex items-center space-x-3">
                {feedbackMsg.tipo === 'sucesso' ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                )}
                <span className="text-xs font-semibold">{feedbackMsg.texto}</span>
              </div>
              <button
                onClick={() => setFeedbackMsg(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-md transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Conteúdo Principal Renderizado Conforme a Tela Selecionada */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8 py-8">
          {/* TELA 1: PANORAMA & INDICADORES DE EVASÃO */}
          {currentScreen === 'panorama' && (
            <DashboardAnalytics
              escolaId={escolaSelecionada}
              turmas={turmas}
              usuarioLogado={usuarioLogado}
              onOpenLogin={() => setShowModalLogin(true)}
              onOpenPerfilAluno={(id) => {
                setPerfilAlunoId(id);
                setShowModalPerfil(true);
              }}
            />
          )}

          {/* TELA 2: AS 4 CASAS DE CULTURA */}
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

          {/* TELA 3: PORTAL DAS PROFESSORAS (MATRIZ CURRICULAR, DISCIPLINAS E CARGA HORÁRIA) */}
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

          {/* TELA 4: TURMAS & OFERTAS */}
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

          {/* TELA 5: MATRÍCULAS & FILA DE ESPERA */}
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

          {/* TELA 6: FREQUÊNCIA & DIÁRIO DE CLASSE */}
          {currentScreen === 'frequencia' && (
            <DashboardAnalytics
              escolaId={escolaSelecionada}
              turmas={turmas}
              usuarioLogado={usuarioLogado}
              onOpenLogin={() => setShowModalLogin(true)}
              onOpenPerfilAluno={(id) => {
                setPerfilAlunoId(id);
                setShowModalPerfil(true);
              }}
            />
          )}

          {/* TELA 7: CADASTRO DE ALUNOS */}
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

          {/* TELA 9: IMPORTAÇÃO EM LOTE */}
          {currentScreen === 'importacao' && (
            <ImportacaoLoteView onUploadPlanilha={handleUploadPlanilha} />
          )}
        </main>
      </div>

      {/* MODAL NOVA TURMA */}
      {showModalTurma && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-black text-base text-slate-900">Abrir Nova Turma / Oferta</h3>
                <p className="text-[11px] text-slate-500">Defina vagas, datas e restrições etárias</p>
              </div>
              <button
                onClick={() => setShowModalTurma(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCriarTurma} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Curso Vinculado *</label>
                <select
                  required
                  value={novaTurma.cursoId}
                  onChange={(e) => setNovaTurma({ ...novaTurma, cursoId: Number(e.target.value) })}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-semibold"
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
                  <label className="block font-bold text-slate-700 mb-1">Código da Turma *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: ELT-2026-T1"
                    value={novaTurma.codigo}
                    onChange={(e) => setNovaTurma({ ...novaTurma, codigo: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Vagas Totais *</label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={novaTurma.vagasTotais}
                    onChange={(e) => setNovaTurma({ ...novaTurma, vagasTotais: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                  />
                </div>
              </div>

              {/* Faixa Etária */}
              <div className="p-3 bg-amber-50/60 rounded-2xl space-y-2 border border-amber-200">
                <span className="font-bold text-amber-900 block text-[10px] uppercase tracking-wider">
                  Faixa Etária Permitida
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] text-slate-600 mb-0.5">Idade Mínima</label>
                    <input
                      type="number"
                      placeholder="Ex: 5 ou 16"
                      value={novaTurma.idadeMinima || ''}
                      onChange={(e) => setNovaTurma({ ...novaTurma, idadeMinima: e.target.value ? Number(e.target.value) : undefined })}
                      className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-600 mb-0.5">Idade Máxima</label>
                    <input
                      type="number"
                      placeholder="Ex: 12 ou 99"
                      value={novaTurma.idadeMaxima || ''}
                      onChange={(e) => setNovaTurma({ ...novaTurma, idadeMaxima: e.target.value ? Number(e.target.value) : undefined })}
                      className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Período de Inscrição */}
              <div className="p-3 bg-blue-50/60 rounded-2xl space-y-2 border border-blue-100">
                <span className="font-bold text-blue-900 block text-[10px] uppercase tracking-wider">
                  Período de Inscrição
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] text-slate-600 mb-0.5">Abertura *</label>
                    <input
                      type="date"
                      required
                      value={novaTurma.dataAberturaMatricula}
                      onChange={(e) => setNovaTurma({ ...novaTurma, dataAberturaMatricula: e.target.value })}
                      className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-600 mb-0.5">Fechamento *</label>
                    <input
                      type="date"
                      required
                      value={novaTurma.dataFechamentoMatricula}
                      onChange={(e) => setNovaTurma({ ...novaTurma, dataFechamentoMatricula: e.target.value })}
                      className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Período de Aulas */}
              <div className="p-3 bg-slate-50 rounded-2xl space-y-2 border border-slate-200">
                <span className="font-bold text-slate-700 block text-[10px] uppercase tracking-wider">
                  Aulas & Tolerância de Suplência
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] text-slate-600 mb-0.5">Início *</label>
                    <input
                      type="date"
                      required
                      value={novaTurma.dataInicioAulas}
                      onChange={(e) => setNovaTurma({ ...novaTurma, dataInicioAulas: e.target.value })}
                      className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-600 mb-0.5">Término *</label>
                    <input
                      type="date"
                      required
                      value={novaTurma.dataFimAulas}
                      onChange={(e) => setNovaTurma({ ...novaTurma, dataFimAulas: e.target.value })}
                      className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                    />
                  </div>
                </div>
                <div className="pt-1">
                  <label className="block text-[11px] text-slate-600 mb-0.5">
                    Tolerância para Chamar Suplentes (Dias após o início)
                  </label>
                  <input
                    type="number"
                    value={novaTurma.diasToleranciaSuplencia || 60}
                    onChange={(e) => setNovaTurma({ ...novaTurma, diasToleranciaSuplencia: Number(e.target.value) })}
                    className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowModalTurma(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
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

      {/* MODAL LOGIN SECRETARIA & PROFESSORAS */}
      {showModalLogin && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 sm:p-8 shadow-2xl border border-slate-200">
            <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-900 flex items-center justify-center font-bold">
                  <Lock className="w-4 h-4" />
                </div>
                <h3 className="font-black text-sm text-slate-900">Acesso da Secretaria</h3>
              </div>
              <button
                onClick={() => setShowModalLogin(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {loginErro && (
              <div className="p-3 mb-3 bg-rose-50 text-rose-700 text-xs rounded-xl border border-rose-200">
                {loginErro}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">E-mail Institucional</label>
                <input
                  type="email"
                  required
                  placeholder="admin@santoandre.sp.gov.br"
                  value={emailLogin}
                  onChange={(e) => setEmailLogin(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Senha</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={senhaLogin}
                  onChange={(e) => setSenhaLogin(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>

              <button
                type="submit"
                disabled={loggingIn}
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold shadow-sm transition cursor-pointer mt-2"
              >
                {loggingIn ? 'Autenticando...' : 'Entrar no Sistema'}
              </button>
            </form>

            <div className="mt-4 pt-3 border-t border-slate-100">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                Atalhos Rápidos (Demonstração):
              </span>
              <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                <button
                  type="button"
                  onClick={() => {
                    setEmailLogin('admin@santoandre.sp.gov.br');
                    setSenhaLogin('admin123');
                  }}
                  className="p-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-left font-semibold text-slate-800"
                >
                  Coordenação Geral
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEmailLogin('encarregada.elt@santoandre.sp.gov.br');
                    setSenhaLogin('elt123');
                  }}
                  className="p-1.5 bg-violet-50 hover:bg-violet-100 text-violet-900 rounded-lg text-left font-semibold"
                >
                  Secretaria ELT
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEmailLogin('encarregada.elcv@santoandre.sp.gov.br');
                    setSenhaLogin('elcv123');
                  }}
                  className="p-1.5 bg-cyan-50 hover:bg-cyan-100 text-cyan-900 rounded-lg text-left font-semibold"
                >
                  Secretaria ELCV
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEmailLogin('encarregada.eld@santoandre.sp.gov.br');
                    setSenhaLogin('eld123');
                  }}
                  className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-900 rounded-lg text-left font-semibold"
                >
                  Secretaria ELD
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEmailLogin('encarregada.elia@santoandre.sp.gov.br');
                    setSenhaLogin('elia123');
                  }}
                  className="col-span-2 p-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 rounded-lg text-left font-semibold"
                >
                  Secretaria ELIA (Iniciação)
                </button>
              </div>
            </div>
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
