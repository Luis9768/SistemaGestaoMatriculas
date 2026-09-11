'use client';

import React, { useState, useEffect } from 'react';
import {
  api,
  Curso,
  Turma,
  Matricula,
  ImportacaoResultado,
  InscricaoExternaPayload,
} from '@/lib/api';
import {
  GraduationCap,
  Calendar,
  Users,
  FileSpreadsheet,
  PlusCircle,
  CheckCircle2,
  AlertCircle,
  Clock,
  Send,
  Download,
  Upload,
  XCircle,
  RefreshCw,
  Search,
  Filter,
} from 'lucide-react';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'cursos' | 'matriculas' | 'importacao' | 'inscricao'>('dashboard');

  // Estados de dados
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [matriculas, setMatriculas] = useState<Matricula[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ tipo: 'sucesso' | 'erro'; texto: string } | null>(null);

  // Filtros
  const [filtroCanal, setFiltroCanal] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('');
  const [buscaMatricula, setBuscaMatricula] = useState('');

  // Formulário de Novo Curso
  const [showModalCurso, setShowModalCurso] = useState(false);
  const [novoCurso, setNovoCurso] = useState<Curso>({
    nome: '',
    descricao: '',
    tipo: 'OFICINA',
    duracaoMeses: 2,
    cargaHoraria: 40,
    ativo: true,
  });

  // Formulário de Nova Turma
  const [showModalTurma, setShowModalTurma] = useState(false);
  const [novaTurma, setNovaTurma] = useState<Turma>({
    cursoId: 0,
    codigo: '',
    dataAberturaMatricula: '',
    dataFechamentoMatricula: '',
    dataInicioAulas: '',
    dataFimAulas: '',
    vagasTotais: 30,
  });

  // Formulário de Inscrição Externa / Site
  const [formInscricao, setFormInscricao] = useState<InscricaoExternaPayload>({
    nome: '',
    cpf: '',
    email: '',
    telefone: '',
    dataNascimento: '',
    turmaId: 0,
    canalOrigem: 'SITE',
    observacoes: '',
  });
  const [submittingInscricao, setSubmittingInscricao] = useState(false);

  // Importação de Planilhas
  const [arquivoUpload, setArquivoUpload] = useState<File | null>(null);
  const [importando, setImportando] = useState(false);
  const [resultadoImportacao, setResultadoImportacao] = useState<ImportacaoResultado | null>(null);

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    setRefreshing(true);
    try {
      const [c, t, m] = await Promise.all([
        api.getCursos(),
        api.getTurmas(),
        api.getMatriculas(),
      ]);
      setCursos(c);
      setTurmas(t);
      setMatriculas(m);
      if (t.length > 0 && novaTurma.cursoId === 0) {
        setNovaTurma((prev) => ({ ...prev, cursoId: c[0]?.id || 0 }));
      }
      if (t.length > 0 && formInscricao.turmaId === 0) {
        setFormInscricao((prev) => ({ ...prev, turmaId: t[0]?.id || 0 }));
      }
    } catch (e: any) {
      mostrarFeedback('erro', 'Erro ao sincronizar dados com o servidor: ' + e.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const mostrarFeedback = (tipo: 'sucesso' | 'erro', texto: string) => {
    setFeedbackMsg({ tipo, texto });
    setTimeout(() => setFeedbackMsg(null), 6000);
  };

  // Handlers Curso
  const handleCriarCurso = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createCurso(novoCurso);
      setShowModalCurso(false);
      setNovoCurso({
        nome: '',
        descricao: '',
        tipo: 'OFICINA',
        duracaoMeses: 2,
        cargaHoraria: 40,
        ativo: true,
      });
      mostrarFeedback('sucesso', 'Curso cadastrado com sucesso!');
      carregarDados();
    } catch (err: any) {
      mostrarFeedback('erro', err.message);
    }
  };

  // Handlers Turma
  const handleCriarTurma = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createTurma(novaTurma);
      setShowModalTurma(false);
      setNovaTurma({
        cursoId: cursos[0]?.id || 0,
        codigo: '',
        dataAberturaMatricula: '',
        dataFechamentoMatricula: '',
        dataInicioAulas: '',
        dataFimAulas: '',
        vagasTotais: 30,
      });
      mostrarFeedback('sucesso', 'Turma aberta com sucesso!');
      carregarDados();
    } catch (err: any) {
      mostrarFeedback('erro', err.message);
    }
  };

  // Handlers Inscrição Externa
  const handleInscricao = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingInscricao(true);
    try {
      await api.inscreverExterno(formInscricao);
      mostrarFeedback('sucesso', `Matrícula de ${formInscricao.nome} realizada com sucesso!`);
      setFormInscricao({
        nome: '',
        cpf: '',
        email: '',
        telefone: '',
        dataNascimento: '',
        turmaId: turmas[0]?.id || 0,
        canalOrigem: 'SITE',
        observacoes: '',
      });
      carregarDados();
    } catch (err: any) {
      mostrarFeedback('erro', err.message);
    } finally {
      setSubmittingInscricao(false);
    }
  };

  // Cancelar Matrícula
  const handleCancelarMatricula = async (id: number) => {
    if (!confirm('Deseja realmente cancelar esta matrícula? A vaga será liberada.')) return;
    try {
      await api.cancelarMatricula(id);
      mostrarFeedback('sucesso', 'Matrícula cancelada com sucesso!');
      carregarDados();
    } catch (err: any) {
      mostrarFeedback('erro', err.message);
    }
  };

  // Importar Planilha
  const handleUploadPlanilha = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!arquivoUpload) {
      mostrarFeedback('erro', 'Por favor, selecione um arquivo Excel (.xlsx) ou CSV.');
      return;
    }
    setImportando(true);
    try {
      const res = await api.importarPlanilha(arquivoUpload);
      setResultadoImportacao(res);
      mostrarFeedback('sucesso', `Importação finalizada: ${res.sucesso} matrículas adicionadas com sucesso!`);
      carregarDados();
    } catch (err: any) {
      mostrarFeedback('erro', err.message);
    } finally {
      setImportando(false);
    }
  };

  // Métricas
  const totalMatriculas = matriculas.length;
  const matriculasAtivas = matriculas.filter((m) => m.status === 'CONFIRMADA').length;
  const turmasAbertas = turmas.filter((t) => t.matriculaAberta).length;
  const totalVagas = turmas.reduce((acc, t) => acc + (t.vagasTotais || 0), 0);
  const vagasOcupadas = turmas.reduce((acc, t) => acc + (t.vagasOcupadas || 0), 0);

  // Filtragem
  const matriculasFiltradas = matriculas.filter((m) => {
    const matchCanal = !filtroCanal || m.canalOrigem === filtroCanal;
    const matchStatus = !filtroStatus || m.status === filtroStatus;
    const matchBusca =
      !buscaMatricula ||
      m.alunoNome.toLowerCase().includes(buscaMatricula.toLowerCase()) ||
      m.alunoCpf.includes(buscaMatricula) ||
      m.turmaCodigo.toLowerCase().includes(buscaMatricula.toLowerCase());
    return matchCanal && matchStatus && matchBusca;
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Topbar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold shadow-md shadow-blue-500/20">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-800 leading-tight">SIGMA</h1>
              <p className="text-xs text-slate-500">Sistema Integrado de Gestão de Matrículas</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 mr-1.5 animate-pulse"></span>
              MySQL 8.0 Conectado
            </span>
            <button
              onClick={carregarDados}
              disabled={refreshing}
              className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
              title="Recarregar dados"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Abas */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex space-x-8 border-t border-slate-100 overflow-x-auto">
          {[
            { id: 'dashboard', label: 'Visão Geral', icon: Clock },
            { id: 'cursos', label: 'Cursos & Turmas', icon: GraduationCap },
            { id: 'matriculas', label: 'Matrículas', icon: Users },
            { id: 'importacao', label: 'Automação / Planilhas', icon: FileSpreadsheet },
            { id: 'inscricao', label: 'Portal de Inscrição (Site)', icon: Send },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-3 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 whitespace-nowrap transition-all ${
                  active
                    ? 'border-blue-600 text-blue-600 font-semibold'
                    : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </header>

      {/* Banner de Notificações */}
      {feedbackMsg && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
          <div
            className={`p-4 rounded-xl flex items-center justify-between shadow-sm border ${
              feedbackMsg.tipo === 'sucesso'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : 'bg-rose-50 text-rose-800 border-rose-200'
            }`}
          >
            <div className="flex items-center space-x-3">
              {feedbackMsg.tipo === 'sucesso' ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              ) : (
                <AlertCircle className="w-5 h-5 text-rose-600" />
              )}
              <span className="text-sm font-medium">{feedbackMsg.texto}</span>
            </div>
            <button
              onClick={() => setFeedbackMsg(null)}
              className="text-slate-400 hover:text-slate-600 text-sm font-bold"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Conteúdo Principal */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="py-20 text-center">
            <RefreshCw className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-3" />
            <p className="text-slate-600">Carregando informações do sistema...</p>
          </div>
        ) : (
          <>
            {/* ABA: DASHBOARD OVERVIEW */}
            {activeTab === 'dashboard' && (
              <div className="space-y-8">
                {/* Cards de Métricas */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                  <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-slate-500">Matrículas Totais</span>
                      <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                        <Users className="w-5 h-5" />
                      </div>
                    </div>
                    <div className="mt-4 flex items-baseline justify-between">
                      <span className="text-3xl font-bold text-slate-800">{totalMatriculas}</span>
                      <span className="text-xs font-semibold px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full">
                        {matriculasAtivas} ativas
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-2">Capacidade anual ~1500+</p>
                  </div>

                  <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-slate-500">Cursos Cadastrados</span>
                      <div className="w-9 h-9 rounded-lg bg-violet-50 text-violet-600 flex items-center justify-center">
                        <GraduationCap className="w-5 h-5" />
                      </div>
                    </div>
                    <div className="mt-4 flex items-baseline justify-between">
                      <span className="text-3xl font-bold text-slate-800">{cursos.length}</span>
                      <span className="text-xs text-slate-500">
                        {cursos.filter((c) => c.tipo === 'OFICINA').length} oficinas /{' '}
                        {cursos.filter((c) => c.tipo === 'REGULAR').length} regulares
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-2">Oficinas (2-3m) e Cursos até 4 anos</p>
                  </div>

                  <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-slate-500">Inscrições Abertas</span>
                      <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                        <Calendar className="w-5 h-5" />
                      </div>
                    </div>
                    <div className="mt-4 flex items-baseline justify-between">
                      <span className="text-3xl font-bold text-emerald-600">{turmasAbertas}</span>
                      <span className="text-xs text-slate-500">de {turmas.length} turmas</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-2">Dentro do período de matrícula</p>
                  </div>

                  <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-slate-500">Taxa de Ocupação</span>
                      <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                        <CheckCircle2 className="w-5 h-5" />
                      </div>
                    </div>
                    <div className="mt-4 flex items-baseline justify-between">
                      <span className="text-3xl font-bold text-slate-800">
                        {totalVagas > 0 ? Math.round((vagasOcupadas / totalVagas) * 100) : 0}%
                      </span>
                      <span className="text-xs text-slate-500">
                        {vagasOcupadas}/{totalVagas} vagas
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 mt-3 overflow-hidden">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${totalVagas > 0 ? (vagasOcupadas / totalVagas) * 100 : 0}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                {/* Seções em Grid: Turmas Abertas & Distribuição por Origem */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Turmas em Período de Inscrição */}
                  <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-base font-bold text-slate-800">
                        Turmas com Inscrições em Aberto (Hoje)
                      </h2>
                      <button
                        onClick={() => setActiveTab('cursos')}
                        className="text-xs text-blue-600 hover:text-blue-800 font-semibold"
                      >
                        Ver todas →
                      </button>
                    </div>

                    <div className="space-y-3">
                      {turmas.filter((t) => t.matriculaAberta).length === 0 ? (
                        <p className="text-sm text-slate-500 py-4">Nenhuma turma com inscrições abertas no momento.</p>
                      ) : (
                        turmas
                          .filter((t) => t.matriculaAberta)
                          .map((t) => (
                            <div
                              key={t.id}
                              className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
                            >
                              <div>
                                <div className="flex items-center space-x-2">
                                  <span className="text-xs font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-700">
                                    {t.codigo}
                                  </span>
                                  <h3 className="text-sm font-semibold text-slate-800">{t.cursoNome}</h3>
                                </div>
                                <div className="text-xs text-slate-500 mt-1 flex items-center space-x-4">
                                  <span>
                                    Inscrições: <strong>{t.dataAberturaMatricula}</strong> até{' '}
                                    <strong>{t.dataFechamentoMatricula}</strong>
                                  </span>
                                  <span>•</span>
                                  <span>
                                    Aulas: <strong>{t.dataInicioAulas}</strong> a <strong>{t.dataFimAulas}</strong>
                                  </span>
                                </div>
                              </div>
                              <div className="flex items-center space-x-4">
                                <div className="text-right">
                                  <span className="text-xs text-slate-500">Vagas:</span>
                                  <p className="text-sm font-bold text-slate-800">
                                    {t.vagasOcupadas} / {t.vagasTotais}
                                  </p>
                                </div>
                                <button
                                  onClick={() => {
                                    setFormInscricao((prev) => ({ ...prev, turmaId: t.id! }));
                                    setActiveTab('inscricao');
                                  }}
                                  className="px-3 py-1.5 text-xs font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                  Inscrever
                                </button>
                              </div>
                            </div>
                          ))
                      )}
                    </div>
                  </div>

                  {/* Distribuição por Canal de Origem */}
                  <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
                    <h2 className="text-base font-bold text-slate-800 mb-4">Canais de Matrícula</h2>
                    <div className="space-y-4">
                      {[
                        { canal: 'SITE', label: 'Site / Portal Web', cor: 'bg-blue-500' },
                        { canal: 'FORMS', label: 'Formulários Externos', cor: 'bg-purple-500' },
                        { canal: 'PLANILHA', label: 'Planilhas Excel/CSV', cor: 'bg-emerald-500' },
                        { canal: 'PRESENCIAL', label: 'Presencial / Secretaria', cor: 'bg-amber-500' },
                      ].map((item) => {
                        const count = matriculas.filter((m) => m.canalOrigem === item.canal).length;
                        const pct = totalMatriculas > 0 ? Math.round((count / totalMatriculas) * 100) : 0;
                        return (
                          <div key={item.canal}>
                            <div className="flex justify-between text-xs font-medium text-slate-700 mb-1">
                              <span>{item.label}</span>
                              <span className="font-bold">
                                {count} ({pct}%)
                              </span>
                            </div>
                            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                              <div className={`${item.cor} h-2 rounded-full`} style={{ width: `${pct}%` }}></div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="mt-6 p-3 bg-blue-50/50 rounded-xl border border-blue-100 text-xs text-blue-800">
                      💡 <strong>Automação ativa:</strong> Todas as matrículas importadas ou via webhook são validadas e
                      deduplicadas automaticamente.
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ABA: CURSOS & TURMAS */}
            {activeTab === 'cursos' && (
              <div className="space-y-8">
                {/* Ações de Topo */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-bold text-slate-800">Gerenciamento de Cursos e Turmas</h2>
                    <p className="text-xs text-slate-500">
                      Configure oficinas de curta duração (2 a 3 meses) e cursos extensivos (até 4 anos).
                    </p>
                  </div>
                  <div className="flex space-x-3">
                    <button
                      onClick={() => setShowModalCurso(true)}
                      className="px-4 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl flex items-center space-x-1.5 shadow-xs"
                    >
                      <PlusCircle className="w-4 h-4 text-blue-600" />
                      <span>Novo Curso</span>
                    </button>
                    <button
                      onClick={() => setShowModalTurma(true)}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl flex items-center space-x-1.5 shadow-xs"
                    >
                      <Calendar className="w-4 h-4" />
                      <span>Abrir Nova Turma</span>
                    </button>
                  </div>
                </div>

                {/* Lista de Cursos e suas Turmas */}
                <div className="grid grid-cols-1 gap-6">
                  {cursos.map((curso) => {
                    const turmasDoCurso = turmas.filter((t) => t.cursoId === curso.id);
                    return (
                      <div
                        key={curso.id}
                        className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden"
                      >
                        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/40">
                          <div>
                            <div className="flex items-center space-x-3">
                              <span
                                className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                                  curso.tipo === 'OFICINA'
                                    ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                    : 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                                }`}
                              >
                                {curso.tipo}
                              </span>
                              <h3 className="text-base font-bold text-slate-800">{curso.nome}</h3>
                            </div>
                            <p className="text-xs text-slate-500 mt-1">{curso.descricao}</p>
                          </div>
                          <div className="flex items-center space-x-4 text-xs text-slate-600">
                            <div>
                              Duração: <strong className="text-slate-800">{curso.duracaoMeses} meses</strong>
                            </div>
                            <div>•</div>
                            <div>
                              Carga Horária: <strong className="text-slate-800">{curso.cargaHoraria}h</strong>
                            </div>
                          </div>
                        </div>

                        {/* Turmas do Curso */}
                        <div className="p-5">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                            Turmas & Ofertas ({turmasDoCurso.length})
                          </h4>
                          {turmasDoCurso.length === 0 ? (
                            <p className="text-xs text-slate-400 italic">Nenhuma turma aberta para este curso ainda.</p>
                          ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                              {turmasDoCurso.map((t) => (
                                <div
                                  key={t.id}
                                  className="p-4 rounded-xl border border-slate-200/80 bg-white hover:border-blue-300 transition-all flex flex-col justify-between"
                                >
                                  <div>
                                    <div className="flex items-center justify-between mb-2">
                                      <span className="font-bold text-sm text-slate-800">{t.codigo}</span>
                                      {t.matriculaAberta ? (
                                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                                          Inscrições Abertas
                                        </span>
                                      ) : (
                                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                                          Inscrições Fechadas
                                        </span>
                                      )}
                                    </div>

                                    <div className="space-y-1.5 text-xs text-slate-600">
                                      <div className="flex justify-between">
                                        <span className="text-slate-400">Prazos de Matrícula:</span>
                                        <span className="font-medium">
                                          {t.dataAberturaMatricula} até {t.dataFechamentoMatricula}
                                        </span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-slate-400">Período de Aulas:</span>
                                        <span className="font-medium">
                                          {t.dataInicioAulas} até {t.dataFimAulas}
                                        </span>
                                      </div>
                                      <div className="flex justify-between pt-1">
                                        <span className="text-slate-400">Vagas Preenchidas:</span>
                                        <span className="font-bold text-slate-800">
                                          {t.vagasOcupadas} / {t.vagasTotais}
                                        </span>
                                      </div>
                                    </div>
                                  </div>

                                  <div className="mt-4 pt-3 border-t border-slate-100 flex justify-end">
                                    <button
                                      disabled={!t.matriculaAberta}
                                      onClick={() => {
                                        setFormInscricao((prev) => ({ ...prev, turmaId: t.id! }));
                                        setActiveTab('inscricao');
                                      }}
                                      className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${
                                        t.matriculaAberta
                                          ? 'bg-blue-600 text-white hover:bg-blue-700'
                                          : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                      }`}
                                    >
                                      {t.matriculaAberta ? 'Matricular Aluno' : 'Fora do Prazo'}
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ABA: MATRÍCULAS */}
            {activeTab === 'matriculas' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-bold text-slate-800">Gestão Geral de Matrículas</h2>
                    <p className="text-xs text-slate-500">
                      Listagem unificada com canais de origem, busca rápida e cancelamento de matrículas.
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveTab('inscricao')}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl flex items-center space-x-1.5 shadow-xs"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>Nova Matrícula</span>
                  </button>
                </div>

                {/* Barra de Filtros */}
                <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row gap-3">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Buscar por nome do aluno, CPF ou código da turma..."
                      value={buscaMatricula}
                      onChange={(e) => setBuscaMatricula(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="flex gap-2">
                    <select
                      value={filtroCanal}
                      onChange={(e) => setFiltroCanal(e.target.value)}
                      className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-hidden"
                    >
                      <option value="">Todos os Canais</option>
                      <option value="SITE">Site Web</option>
                      <option value="FORMS">Formulários</option>
                      <option value="PLANILHA">Planilha</option>
                      <option value="PRESENCIAL">Presencial</option>
                    </select>

                    <select
                      value={filtroStatus}
                      onChange={(e) => setFiltroStatus(e.target.value)}
                      className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-hidden"
                    >
                      <option value="">Todos os Status</option>
                      <option value="CONFIRMADA">Confirmada</option>
                      <option value="CANCELADA">Cancelada</option>
                      <option value="PENDENTE">Pendente</option>
                    </select>
                  </div>
                </div>

                {/* Tabela de Matrículas */}
                <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                        <tr>
                          <th className="px-5 py-3.5">Aluno</th>
                          <th className="px-5 py-3.5">CPF / Contato</th>
                          <th className="px-5 py-3.5">Turma & Curso</th>
                          <th className="px-5 py-3.5">Canal de Origem</th>
                          <th className="px-5 py-3.5">Status</th>
                          <th className="px-5 py-3.5 text-right">Ações</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {matriculasFiltradas.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="px-5 py-8 text-center text-slate-400">
                              Nenhuma matrícula encontrada com os filtros selecionados.
                            </td>
                          </tr>
                        ) : (
                          matriculasFiltradas.map((m) => (
                            <tr key={m.id} className="hover:bg-slate-50/60 transition-colors">
                              <td className="px-5 py-4">
                                <span className="font-bold text-slate-800">{m.alunoNome}</span>
                              </td>
                              <td className="px-5 py-4 text-slate-600">
                                <div>{m.alunoCpf}</div>
                                <div className="text-[11px] text-slate-400">{m.alunoEmail}</div>
                              </td>
                              <td className="px-5 py-4">
                                <span className="font-semibold text-slate-800">{m.turmaCodigo}</span>
                                <div className="text-[11px] text-slate-500">{m.cursoNome}</div>
                              </td>
                              <td className="px-5 py-4">
                                <span
                                  className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                                    m.canalOrigem === 'SITE'
                                      ? 'bg-blue-100 text-blue-700'
                                      : m.canalOrigem === 'FORMS'
                                      ? 'bg-purple-100 text-purple-700'
                                      : m.canalOrigem === 'PLANILHA'
                                      ? 'bg-emerald-100 text-emerald-700'
                                      : 'bg-amber-100 text-amber-700'
                                  }`}
                                >
                                  {m.canalOrigem}
                                </span>
                              </td>
                              <td className="px-5 py-4">
                                <span
                                  className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                                    m.status === 'CONFIRMADA'
                                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                      : 'bg-rose-50 text-rose-700 border border-rose-200'
                                  }`}
                                >
                                  {m.status}
                                </span>
                              </td>
                              <td className="px-5 py-4 text-right">
                                {m.status === 'CONFIRMADA' && (
                                  <button
                                    onClick={() => handleCancelarMatricula(m.id)}
                                    className="text-xs text-rose-600 hover:text-rose-800 font-semibold"
                                  >
                                    Cancelar
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ABA: AUTOMAÇÃO / PLANILHAS */}
            {activeTab === 'importacao' && (
              <div className="space-y-8 max-w-4xl mx-auto">
                <div className="text-center">
                  <h2 className="text-xl font-bold text-slate-800">Automação de Importação em Lote</h2>
                  <p className="text-xs text-slate-500 mt-1 max-w-lg mx-auto">
                    Substitua o trabalho manual de planilhas. Envie seus arquivos Excel (.xlsx) ou CSV para criar alunos e
                    matrículas de uma só vez, com prevenção automática de duplicatas por CPF.
                  </p>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-6">
                  {/* Download do modelo */}
                  <div className="flex flex-col sm:flex-row items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200 gap-4">
                    <div>
                      <h4 className="text-xs font-bold text-slate-800">Precisa da planilha modelo?</h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Baixe o arquivo CSV de exemplo com as colunas corretas (Nome, CPF, Email, Turma, etc).
                      </p>
                    </div>
                    <a
                      href={api.downloadModeloCsvUrl()}
                      download="modelo_matriculas.csv"
                      className="px-3.5 py-2 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg flex items-center space-x-1.5 shadow-2xs whitespace-nowrap"
                    >
                      <Download className="w-4 h-4 text-blue-600" />
                      <span>Baixar Modelo CSV</span>
                    </a>
                  </div>

                  {/* Form de Upload */}
                  <form onSubmit={handleUploadPlanilha} className="space-y-4">
                    <div className="border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-2xl p-8 text-center transition-colors bg-slate-50/50">
                      <FileSpreadsheet className="w-10 h-10 text-slate-400 mx-auto mb-3" />
                      <label className="block text-sm font-semibold text-slate-700 cursor-pointer">
                        <span>{arquivoUpload ? arquivoUpload.name : 'Clique para selecionar a planilha'}</span>
                        <input
                          type="file"
                          accept=".xlsx,.xls,.csv"
                          onChange={(e) => setArquivoUpload(e.target.files?.[0] || null)}
                          className="hidden"
                        />
                      </label>
                      <p className="text-xs text-slate-400 mt-1">Formatos aceitos: Microsoft Excel (.xlsx, .xls) ou CSV</p>
                    </div>

                    <button
                      type="submit"
                      disabled={importando || !arquivoUpload}
                      className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-semibold text-xs rounded-xl shadow-xs flex items-center justify-center space-x-2 transition-colors"
                    >
                      <Upload className="w-4 h-4" />
                      <span>{importando ? 'Processando registros...' : 'Iniciar Processamento Automático'}</span>
                    </button>
                  </form>

                  {/* Resultado da Importação */}
                  {resultadoImportacao && (
                    <div className="mt-6 border-t border-slate-200 pt-6 space-y-4">
                      <h3 className="text-sm font-bold text-slate-800">Resultado do Processamento:</h3>

                      <div className="grid grid-cols-4 gap-3 text-center">
                        <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                          <span className="text-xs text-slate-500">Total Linhas</span>
                          <p className="text-base font-bold text-slate-800">{resultadoImportacao.totalLinhas}</p>
                        </div>
                        <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-200">
                          <span className="text-xs text-emerald-700 font-medium">Sucesso</span>
                          <p className="text-base font-bold text-emerald-700">{resultadoImportacao.sucesso}</p>
                        </div>
                        <div className="bg-amber-50 p-3 rounded-lg border border-amber-200">
                          <span className="text-xs text-amber-700 font-medium">Ignoradas (Duplicadas)</span>
                          <p className="text-base font-bold text-amber-700">{resultadoImportacao.ignoradas}</p>
                        </div>
                        <div className="bg-rose-50 p-3 rounded-lg border border-rose-200">
                          <span className="text-xs text-rose-700 font-medium">Erros</span>
                          <p className="text-base font-bold text-rose-700">{resultadoImportacao.falhas}</p>
                        </div>
                      </div>

                      {/* Log Linha a Linha */}
                      <div className="bg-slate-900 text-slate-200 p-4 rounded-xl text-xs font-mono max-h-48 overflow-y-auto space-y-1">
                        {resultadoImportacao.logs.map((log, idx) => (
                          <div
                            key={idx}
                            className={
                              log.includes('sucesso')
                                ? 'text-emerald-400'
                                : log.includes('Ignorada')
                                ? 'text-amber-400'
                                : log.includes('Falha') || log.includes('Erro')
                                ? 'text-rose-400'
                                : 'text-slate-300'
                            }
                          >
                            {log}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ABA: PORTAL DE INSCRIÇÃO EXTERNA (SIMULADOR DO SITE / FORMS) */}
            {activeTab === 'inscricao' && (
              <div className="max-w-2xl mx-auto space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-slate-800">Formulário de Matrícula Online</h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Simulação do formulário acessado pelos alunos no site ou formulários externos. O aluno é criado e
                    matriculado em tempo real com validação de datas e vagas.
                  </p>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
                  <form onSubmit={handleInscricao} className="space-y-4 text-xs">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Turma Desejada *</label>
                      <select
                        required
                        value={formInscricao.turmaId}
                        onChange={(e) => setFormInscricao({ ...formInscricao, turmaId: Number(e.target.value) })}
                        className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white text-xs"
                      >
                        <option value="">Selecione a turma...</option>
                        {turmas.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.codigo} - {t.cursoNome} ({t.vagasOcupadas}/{t.vagasTotais} vagas)
                            {t.matriculaAberta ? ' [ABERTA]' : ' [FECHADA]'}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Nome Completo do Aluno *</label>
                        <input
                          type="text"
                          required
                          placeholder="Ex: Beatriz Lima"
                          value={formInscricao.nome}
                          onChange={(e) => setFormInscricao({ ...formInscricao, nome: e.target.value })}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white text-xs"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">CPF *</label>
                        <input
                          type="text"
                          required
                          placeholder="000.000.000-00"
                          value={formInscricao.cpf}
                          onChange={(e) => setFormInscricao({ ...formInscricao, cpf: e.target.value })}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white text-xs"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">E-mail *</label>
                        <input
                          type="email"
                          required
                          placeholder="aluno@exemplo.com"
                          value={formInscricao.email}
                          onChange={(e) => setFormInscricao({ ...formInscricao, email: e.target.value })}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white text-xs"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Telefone / WhatsApp</label>
                        <input
                          type="text"
                          placeholder="(11) 99999-9999"
                          value={formInscricao.telefone}
                          onChange={(e) => setFormInscricao({ ...formInscricao, telefone: e.target.value })}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white text-xs"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Data de Nascimento</label>
                        <input
                          type="date"
                          value={formInscricao.dataNascimento}
                          onChange={(e) => setFormInscricao({ ...formInscricao, dataNascimento: e.target.value })}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white text-xs"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Canal de Origem</label>
                        <select
                          value={formInscricao.canalOrigem}
                          onChange={(e) => setFormInscricao({ ...formInscricao, canalOrigem: e.target.value as any })}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white text-xs"
                        >
                          <option value="SITE">Site Oficial</option>
                          <option value="FORMS">Google Forms / Typeform</option>
                          <option value="PRESENCIAL">Presencial</option>
                          <option value="PLANILHA">Planilha</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Observações Adicionais</label>
                      <textarea
                        rows={2}
                        placeholder="Alguma observação relevante..."
                        value={formInscricao.observacoes}
                        onChange={(e) => setFormInscricao({ ...formInscricao, observacoes: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white text-xs"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={submittingInscricao}
                      className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-semibold text-xs rounded-xl shadow-xs flex items-center justify-center space-x-2 transition-colors"
                    >
                      <Send className="w-4 h-4" />
                      <span>{submittingInscricao ? 'Efetivando Matrícula...' : 'Confirmar Matrícula'}</span>
                    </button>
                  </form>
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* MODAL NOVO CURSO */}
      {showModalCurso && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-100">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-sm text-slate-800">Cadastrar Novo Curso</h3>
              <button onClick={() => setShowModalCurso(false)} className="text-slate-400 hover:text-slate-600">
                ✕
              </button>
            </div>
            <form onSubmit={handleCriarCurso} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nome do Curso *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Oficina de Pintura em Tela"
                  value={novoCurso.nome}
                  onChange={(e) => setNovoCurso({ ...novoCurso, nome: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Tipo de Curso *</label>
                <select
                  value={novoCurso.tipo}
                  onChange={(e) => setNovoCurso({ ...novoCurso, tipo: e.target.value as any })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                >
                  <option value="OFICINA">Oficina (Curta Duração: 1 a 6 meses)</option>
                  <option value="REGULAR">Curso Regular / Extensivo (até 4 anos)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Duração (Meses) *</label>
                  <input
                    type="number"
                    min={1}
                    max={60}
                    required
                    value={novoCurso.duracaoMeses}
                    onChange={(e) => setNovoCurso({ ...novoCurso, duracaoMeses: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Carga Horária (Horas) *</label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={novoCurso.cargaHoraria}
                    onChange={(e) => setNovoCurso({ ...novoCurso, cargaHoraria: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Descrição</label>
                <textarea
                  rows={2}
                  value={novoCurso.descricao}
                  onChange={(e) => setNovoCurso({ ...novoCurso, descricao: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowModalCurso(false)}
                  className="px-3 py-1.5 border border-slate-300 rounded-lg font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button type="submit" className="px-3 py-1.5 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700">
                  Salvar Curso
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL NOVA TURMA */}
      {showModalTurma && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-100">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-sm text-slate-800">Abrir Nova Turma / Oferta</h3>
              <button onClick={() => setShowModalTurma(false)} className="text-slate-400 hover:text-slate-600">
                ✕
              </button>
            </div>
            <form onSubmit={handleCriarTurma} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Curso *</label>
                <select
                  required
                  value={novaTurma.cursoId}
                  onChange={(e) => setNovaTurma({ ...novaTurma, cursoId: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                >
                  <option value="">Selecione o curso...</option>
                  {cursos.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nome} ({c.tipo} - {c.duracaoMeses}m)
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Código da Turma *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: OFIC-2026-T2"
                    value={novaTurma.codigo}
                    onChange={(e) => setNovaTurma({ ...novaTurma, codigo: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Vagas Totais *</label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={novaTurma.vagasTotais}
                    onChange={(e) => setNovaTurma({ ...novaTurma, vagasTotais: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="p-3 bg-blue-50/60 rounded-xl space-y-2 border border-blue-100">
                <span className="font-bold text-blue-900 block text-[11px] uppercase tracking-wider">
                  Período de Inscrição / Matrícula
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] text-slate-600 mb-0.5">Abertura Matrículas *</label>
                    <input
                      type="date"
                      required
                      value={novaTurma.dataAberturaMatricula}
                      onChange={(e) => setNovaTurma({ ...novaTurma, dataAberturaMatricula: e.target.value })}
                      className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-600 mb-0.5">Fechamento Matrículas *</label>
                    <input
                      type="date"
                      required
                      value={novaTurma.dataFechamentoMatricula}
                      onChange={(e) => setNovaTurma({ ...novaTurma, dataFechamentoMatricula: e.target.value })}
                      className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded text-xs"
                    />
                  </div>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl space-y-2 border border-slate-200">
                <span className="font-bold text-slate-700 block text-[11px] uppercase tracking-wider">
                  Período de Aulas do Curso
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] text-slate-600 mb-0.5">Início das Aulas *</label>
                    <input
                      type="date"
                      required
                      value={novaTurma.dataInicioAulas}
                      onChange={(e) => setNovaTurma({ ...novaTurma, dataInicioAulas: e.target.value })}
                      className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-600 mb-0.5">Fim das Aulas *</label>
                    <input
                      type="date"
                      required
                      value={novaTurma.dataFimAulas}
                      onChange={(e) => setNovaTurma({ ...novaTurma, dataFimAulas: e.target.value })}
                      className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded text-xs"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowModalTurma(false)}
                  className="px-3 py-1.5 border border-slate-300 rounded-lg font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button type="submit" className="px-3 py-1.5 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700">
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
