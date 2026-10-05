'use client';

import React, { useState } from 'react';
import {
  BookOpen,
  PlusCircle,
  Clock,
  User,
  Trash2,
  CheckCircle2,
  Sparkles,
  Calendar,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Curso, Disciplina, Escola } from '@/lib/api';

interface PortalProfessorasViewProps {
  cursos: Curso[];
  escolas: Escola[];
  escolaSelecionada: number | null;
  onSalvarCurso: (curso: Curso) => Promise<void>;
  onAbrirNovaTurma: (cursoId: number) => void;
}

export function PortalProfessorasView({
  cursos,
  escolas,
  escolaSelecionada,
  onSalvarCurso,
  onAbrirNovaTurma,
}: PortalProfessorasViewProps) {
  const [modoAba, setModoAba] = useState<'catalogo' | 'novo'>('catalogo');
  const [cursoExpandidoId, setCursoExpandidoId] = useState<number | null>(null);

  // Formulário do Novo Curso
  const [nomeCurso, setNomeCurso] = useState('');
  const [escolaId, setEscolaId] = useState<number>(escolaSelecionada || (escolas[0]?.id || 1));
  const [modalidade, setModalidade] = useState<'FORMACAO' | 'NUCLEO' | 'OFICINA'>('FORMACAO');
  const [cargaHorariaCurso, setCargaHorariaCurso] = useState<number | string>(500);
  const [duracaoTexto, setDuracaoTexto] = useState('2 semestres');
  const [descricao, setDescricao] = useState('');

  // Disciplinas em composição (inicialmente limpo, sem professores fictícios)
  const [disciplinas, setDisciplinas] = useState<Disciplina[]>([]);

  // Inputs temporários para adicionar nova disciplina
  const [novaDiscNome, setNovaDiscNome] = useState('');
  const [novaDiscCarga, setNovaDiscCarga] = useState<number>(40);
  const [novaDiscProf, setNovaDiscProf] = useState('');
  const [novaDiscEmenta, setNovaDiscEmenta] = useState('');

  const [salvando, setSalvando] = useState(false);
  const [erroMsg, setErroMsg] = useState<string | null>(null);
  const [sucessoMsg, setSucessoMsg] = useState<string | null>(null);

  // Cálculo dinâmico da carga horária somada
  const cargaHorariaTotal = disciplinas.reduce((acc, d) => acc + (d.cargaHoraria || 0), 0);

  const handleAdicionarDisciplina = () => {
    if (!novaDiscNome.trim()) {
      alert('Informe o nome da disciplina');
      return;
    }
    if (novaDiscCarga <= 0) {
      alert('A carga horária deve ser maior que zero');
      return;
    }

    setDisciplinas([
      ...disciplinas,
      {
        nome: novaDiscNome.trim(),
        cargaHoraria: Number(novaDiscCarga),
        professorResponsavel: novaDiscProf.trim() || undefined,
        descricao: novaDiscEmenta.trim() || undefined,
      },
    ]);

    setNovaDiscNome('');
    setNovaDiscCarga(40);
    setNovaDiscProf('');
    setNovaDiscEmenta('');
  };

  const handleRemoverDisciplina = (index: number) => {
    setDisciplinas(disciplinas.filter((_, i) => i !== index));
  };

  const handleSubmeterCurso = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nomeCurso.trim()) {
      setErroMsg('O nome do curso é obrigatório.');
      return;
    }
    const cargaFinal = Math.max(Number(cargaHorariaCurso) || 0, cargaHorariaTotal);
    if (cargaFinal <= 0) {
      setErroMsg('Informe uma carga horária válida para o conteúdo do curso (ex: 500h).');
      return;
    }
    if (disciplinas.length === 0) {
      setErroMsg('Adicione pelo menos 1 disciplina com sua respectiva carga horária.');
      return;
    }

    try {
      setSalvando(true);
      setErroMsg(null);
      await onSalvarCurso({
        nome: nomeCurso.trim(),
        descricao: descricao.trim(),
        escolaId: Number(escolaId),
        tipo: modalidade === 'FORMACAO' ? 'REGULAR' : 'OFICINA',
        modalidade,
        duracaoMeses: Math.max(1, Math.round(cargaFinal / 40)), // Estimativa proporcional para compatibilidade legada
        duracaoEstimada: duracaoTexto.trim() || undefined,
        cargaHoraria: cargaFinal,
        ativo: true,
        disciplinas,
      });

      setSucessoMsg(`Curso "${nomeCurso}" (${cargaFinal}h de conteúdo) e suas ${disciplinas.length} disciplinas foram salvos com sucesso!`);
      setNomeCurso('');
      setDescricao('');
      setCargaHorariaCurso(500);
      setDuracaoTexto('2 semestres');
      setDisciplinas([]);
      setModoAba('catalogo');
      setTimeout(() => setSucessoMsg(null), 6000);
    } catch (err: any) {
      setErroMsg(err.message || 'Erro ao salvar curso');
    } finally {
      setSalvando(false);
    }
  };

  const cursosFiltrados = escolaSelecionada
    ? cursos.filter((c) => c.escolaId === escolaSelecionada)
    : cursos;

  const getBadgeEscola = (sigla?: string) => {
    switch (sigla) {
      case 'ELT':
        return 'bg-violet-100 text-violet-900 border-violet-300 dark:bg-violet-950/60 dark:text-violet-300 dark:border-violet-800';
      case 'ELD':
        return 'bg-rose-100 text-rose-900 border-rose-300 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800';
      case 'ELCV':
        return 'bg-cyan-100 text-cyan-900 border-cyan-300 dark:bg-cyan-950/60 dark:text-cyan-300 dark:border-cyan-800';
      case 'ELIA':
      case 'EMIA':
        return 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700';
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Banner Institucional da Matriz Curricular */}
      <div className="bg-gradient-to-r from-[#1E1B4B] via-[#2E1065] to-[#0F172A] rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-violet-900/50 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Secretaria de Cultura • Matriz Pedagógica</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Catálogo de Cursos & Matriz Curricular
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Estruturação dos cursos das Escolas Livres de Santo André (ELT, ELD, ELCV e EMIA). Acompanhe disciplinas, cargas horárias e organize a grade pedagógica das turmas.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setModoAba('catalogo')}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs transition cursor-pointer flex items-center space-x-2 ${
                modoAba === 'catalogo'
                  ? 'bg-white text-slate-900 shadow-md'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Grade de Cursos ({cursosFiltrados.length})</span>
            </button>
            <button
              onClick={() => setModoAba('novo')}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs transition cursor-pointer flex items-center space-x-2 ${
                modoAba === 'novo'
                  ? 'bg-amber-500 text-slate-950 font-black shadow-lg shadow-amber-900/40'
                  : 'bg-amber-600/80 hover:bg-amber-500 text-white'
              }`}
            >
              <PlusCircle className="w-4 h-4" />
              <span>Criar Novo Curso com Disciplinas</span>
            </button>
          </div>
        </div>
      </div>

      {sucessoMsg && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 rounded-2xl flex items-center space-x-3 text-emerald-900 dark:text-emerald-200 text-xs shadow-xs">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span className="font-semibold">{sucessoMsg}</span>
        </div>
      )}

      {/* TELA A: FORMULÁRIO COMPLETO DE CRIAÇÃO (CURSO + DISCIPLINAS + CARGA HORÁRIA) */}
      {modoAba === 'novo' ? (
        <form onSubmit={handleSubmeterCurso} className="space-y-8">
          {erroMsg && (
            <div className="p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs rounded-2xl">
              {erroMsg}
            </div>
          )}

          {/* BLOCO 1: IDENTIDADE DA FORMAÇÃO ARTÍSTICA */}
          <div className="bg-white dark:bg-[#0D1220] rounded-3xl p-6 sm:p-8 border border-slate-200/90 dark:border-slate-800/90 shadow-xs space-y-6">
            <div className="border-b border-slate-100 dark:border-slate-800/80 pb-4 flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                  <span className="w-6 h-6 rounded-lg bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 flex items-center justify-center text-xs font-black">
                    1
                  </span>
                  <span>Identidade do Curso</span>
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Defina o nome da formação, unidade escolar e modalidade
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
              <div className="md:col-span-2">
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Nome do Curso / Formação *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Formação em Interpretação Teatral e Pesquisa da Cena"
                  value={nomeCurso}
                  onChange={(e) => setNomeCurso(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/90 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-xs font-semibold focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-amber-500/40 focus:border-amber-600 transition"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">Escola de Cultura *</label>
                <select
                  value={escolaId}
                  onChange={(e) => setEscolaId(Number(e.target.value))}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/90 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 text-xs font-semibold focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-amber-500/40 focus:border-amber-600 transition"
                >
                  {escolas.map((esc) => (
                    <option key={esc.id} value={esc.id}>
                      [{esc.sigla}] {esc.nome}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">Modalidade Curricular *</label>
                <select
                  value={modalidade}
                  onChange={(e) => setModalidade(e.target.value as any)}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/90 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 text-xs font-semibold focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-amber-500/40 focus:border-amber-600 transition"
                >
                  <option value="FORMACAO">Formação Completa (Carga Aprofundada com Seleção)</option>
                  <option value="NUCLEO">Núcleo de Pesquisa e Montagem (Módulos Temáticos)</option>
                  <option value="OFICINA">Oficina Livre e Vivência Artística (Intensiva / Curta Duração)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Carga Horária do Conteúdo (Horas) *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min={1}
                    max={5000}
                    required
                    placeholder="Ex: 500"
                    value={cargaHorariaCurso}
                    onChange={(e) => setCargaHorariaCurso(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full pl-4 pr-9 py-3 bg-slate-50 dark:bg-slate-900/90 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-xs font-semibold focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-amber-500/40 focus:border-amber-600 transition"
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold font-mono text-slate-400">
                    h
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
                  Ex: 500h (usado para cálculo de presença, soma e certificados).
                </p>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Duração Estimada (Texto para Exibição)
                </label>
                <input
                  type="text"
                  placeholder="Ex: 2 semanas, 2 meses, 1 ano..."
                  value={duracaoTexto}
                  onChange={(e) => setDuracaoTexto(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/90 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-xs font-semibold focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-amber-500/40 focus:border-amber-600 transition"
                />
                <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
                  Apenas para exibição visual informativa na grade (ex: 2 semanas, 2 meses).
                </p>
              </div>

              <div className="md:col-span-2">
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Descrição Pedagógica / Perfil Formativo
                </label>
                <textarea
                  rows={3}
                  placeholder="Descreva a fundamentação artística, repertório e competências desenvolvidas..."
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/90 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-xs focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-amber-500/40 focus:border-amber-600 transition"
                />
              </div>
            </div>
          </div>

          {/* BLOCO 2: MATRIZ CURRICULAR DAS DISCIPLINAS */}
          <div className="bg-white dark:bg-[#0D1220] rounded-3xl p-6 sm:p-8 border border-slate-200/90 dark:border-slate-800/90 shadow-xs space-y-6">
            <div className="border-b border-slate-100 dark:border-slate-800/80 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                  <span className="w-6 h-6 rounded-lg bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 flex items-center justify-center text-xs font-black">
                    2
                  </span>
                  <span>Disciplinas e Cargas Horárias</span>
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Adicione as disciplinas que compõem a matriz deste curso e suas respectivas horas
                </p>
              </div>

              {/* Medidor Totalizador de Carga Horária em Tempo Real */}
              <div className="px-4 py-2 bg-gradient-to-r from-amber-50 to-amber-100 dark:from-amber-950/40 dark:to-amber-900/40 border border-amber-300 dark:border-amber-800/80 rounded-2xl flex items-center space-x-3 shadow-2xs">
                <Clock className="w-5 h-5 text-amber-700 dark:text-amber-400" />
                <div>
                  <div className="text-[10px] uppercase font-bold text-amber-800 dark:text-amber-300 tracking-wider">
                    Carga Horária de Conteúdo
                  </div>
                  <div className="text-lg font-black text-amber-950 dark:text-amber-100 font-mono">
                    {Math.max(Number(cargaHorariaCurso) || 0, cargaHorariaTotal)}h
                    <span className="text-xs font-medium text-amber-800 dark:text-amber-300 font-sans ml-1.5">
                      ({disciplinas.length} disciplinas {cargaHorariaTotal > 0 ? `• ${cargaHorariaTotal}h somadas` : ''})
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Painel de Inclusão Rápida de Disciplina */}
            <div className="bg-slate-50/80 dark:bg-slate-900/60 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider block">
                + Nova Disciplina na Matriz
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 gap-3 text-xs">
                <div className="sm:col-span-2">
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Nome da Disciplina *</label>
                  <input
                    type="text"
                    placeholder="Ex: Atuação e Poéticas Vocais"
                    value={novaDiscNome}
                    onChange={(e) => setNovaDiscNome(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Carga Horária (Horas) *</label>
                  <input
                    type="number"
                    min={1}
                    value={novaDiscCarga}
                    onChange={(e) => setNovaDiscCarga(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Docente Responsável (Opcional)</label>
                  <input
                    type="text"
                    placeholder="Atribuído na abertura da turma"
                    value={novaDiscProf}
                    onChange={(e) => setNovaDiscProf(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div className="sm:col-span-3 md:col-span-4">
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Ementa / Conteúdo Programático</label>
                  <input
                    type="text"
                    placeholder="Ex: Exercícios de ressonância, projeção no palco e articulação..."
                    value={novaDiscEmenta}
                    onChange={(e) => setNovaDiscEmenta(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleAdicionarDisciplina}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 transition cursor-pointer shadow-xs"
                >
                  <PlusCircle className="w-4 h-4 text-amber-500 dark:text-amber-600" />
                  <span>Adicionar Disciplina à Grade</span>
                </button>
              </div>
            </div>

            {/* Lista das Disciplinas Adicionadas */}
            <div className="space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                Disciplinas Integradas ({disciplinas.length})
              </span>

              {disciplinas.length === 0 ? (
                <div className="p-8 text-center text-slate-400 dark:text-slate-500 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-xs">
                  Nenhuma disciplina adicionada ainda. Utilize os campos acima para estruturar a grade deste curso.
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-2.5">
                  {disciplinas.map((disc, idx) => (
                    <div
                      key={idx}
                      className="p-4 bg-white dark:bg-[#0E1424] border border-slate-200/90 dark:border-slate-800/90 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs hover:border-slate-300 dark:hover:border-slate-700 transition"
                    >
                      <div className="flex items-start space-x-3 min-w-0">
                        <span className="w-7 h-7 rounded-xl bg-amber-100 dark:bg-amber-950/80 text-amber-900 dark:text-amber-300 font-bold text-xs flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        <div>
                          <div className="font-bold text-slate-900 dark:text-white text-sm">{disc.nome}</div>
                          <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-slate-500 dark:text-slate-400">
                            {disc.professorResponsavel && (
                              <span className="inline-flex items-center gap-1 font-medium text-slate-700 dark:text-slate-300">
                                <User className="w-3 h-3 text-slate-400" />
                                {disc.professorResponsavel}
                              </span>
                            )}
                            {disc.descricao && (
                              <span className="text-slate-400 dark:text-slate-500 truncate max-w-md">• {disc.descricao}</span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3 shrink-0 self-end sm:self-auto">
                        <span className="px-3 py-1 bg-amber-50 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800/80 rounded-xl text-amber-900 dark:text-amber-300 text-xs font-extrabold flex items-center gap-1 font-mono">
                          <Clock className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
                          <span>{disc.cargaHoraria}h</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoverDisciplina(idx)}
                          className="p-2 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition cursor-pointer"
                          title="Remover disciplina"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Botões Finais de Ação */}
          <div className="flex items-center justify-end space-x-4 pt-4">
            <button
              type="button"
              onClick={() => setModoAba('catalogo')}
              className="px-6 py-3 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={salvando}
              className="px-8 py-3 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-black text-xs rounded-xl shadow-lg shadow-amber-950/20 transition cursor-pointer flex items-center space-x-2"
            >
              <CheckCircle2 className="w-4 h-4 text-white" />
              <span>{salvando ? 'Salvando Matriz Curricular...' : 'Salvar Curso & Disciplinas'}</span>
            </button>
          </div>
        </form>
      ) : (
        /* TELA B: CATÁLOGO DE CURSOS COM GAVETA DE DISCIPLINAS */
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-800 dark:text-white">
                Grade de Cursos das Escolas Livres
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Clique nos cursos para visualizar as disciplinas que compõem cada matriz e as cargas horárias
              </p>
            </div>
            <button
              onClick={() => setModoAba('novo')}
              className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100 text-white rounded-xl text-xs font-bold flex items-center space-x-2 shadow-xs cursor-pointer"
            >
              <PlusCircle className="w-4 h-4 text-amber-500 dark:text-amber-600" />
              <span>Cadastrar Novo Curso</span>
            </button>
          </div>

          <div className="grid grid-cols-1 gap-5">
            {cursosFiltrados.length === 0 ? (
              <div className="p-12 text-center text-slate-500 dark:text-slate-400 bg-white dark:bg-[#0D1220] rounded-3xl border border-slate-200 dark:border-slate-800">
                Nenhum curso encontrado para a escola selecionada.
              </div>
            ) : (
              cursosFiltrados.map((curso) => {
                const isExpandido = cursoExpandidoId === curso.id;
                const temDisciplinas = curso.disciplinas && curso.disciplinas.length > 0;

                return (
                  <div
                    key={curso.id}
                    className="bg-white dark:bg-[#0D1220] rounded-3xl border border-slate-200/90 dark:border-slate-800/90 shadow-xs overflow-hidden hover:border-slate-300 dark:hover:border-slate-700 transition"
                  >
                    {/* Header do Card de Curso */}
                    <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/50 dark:bg-[#090D17]/80 border-b border-slate-100 dark:border-slate-800/80">
                      <div>
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <span
                            className={`px-2.5 py-0.5 rounded-md text-[11px] font-black border uppercase tracking-wider ${getBadgeEscola(
                              curso.escolaSigla
                            )}`}
                          >
                            {curso.escolaSigla || 'GERAL'}
                          </span>
                          <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                            {curso.modalidade || curso.tipo}
                          </span>
                          <span className="text-xs text-slate-500 dark:text-slate-400">
                            {curso.duracaoEstimada ? (
                              <span>
                                Duração: <strong className="text-slate-700 dark:text-slate-300">{curso.duracaoEstimada}</strong> •{' '}
                              </span>
                            ) : null}
                            Conteúdo: <strong className="text-slate-700 dark:text-slate-300 font-mono">{curso.cargaHoraria}h totais</strong>
                          </span>
                        </div>
                        <h3 className="text-base font-bold text-slate-900 dark:text-white">{curso.nome}</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{curso.descricao}</p>
                      </div>

                      <div className="flex items-center space-x-3 shrink-0">
                        <div className="text-right">
                          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Carga Horária</div>
                          <div className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-1 justify-end font-mono">
                            <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                            <span>{curso.cargaHoraria}h</span>
                          </div>
                        </div>

                        <button
                          onClick={() => onAbrirNovaTurma(curso.id!)}
                          className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-xs cursor-pointer"
                        >
                          <Calendar className="w-3.5 h-3.5" />
                          <span>Abrir Turma</span>
                        </button>

                        <button
                          onClick={() => setCursoExpandidoId(isExpandido ? null : curso.id!)}
                          className="p-2 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-slate-700 dark:text-slate-300 cursor-pointer transition"
                          title="Ver Disciplinas"
                        >
                          {isExpandido ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Gaveta de Disciplinas Cadastradas pelas Professoras */}
                    {isExpandido && (
                      <div className="p-6 bg-slate-50/60 dark:bg-[#070A11]/60 border-t border-slate-100 dark:border-slate-800/80 space-y-4 animate-in fade-in duration-150">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
                            <BookOpen className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                            <span>Matriz de Disciplinas ({curso.disciplinas?.length || 0})</span>
                          </h4>
                          <span className="text-xs text-slate-500 dark:text-slate-400">
                            Soma: <strong className="text-slate-700 dark:text-slate-300 font-mono">{curso.cargaHoraria} horas-aula</strong>
                          </span>
                        </div>

                        {!temDisciplinas ? (
                          <div className="p-4 bg-white dark:bg-[#0E1424] rounded-xl border border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 text-center">
                            Nenhuma disciplina detalhada foi vinculada ainda a este curso.
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {curso.disciplinas?.map((disc) => (
                              <div
                                key={disc.id}
                                className="p-4 bg-white dark:bg-[#0E1424] rounded-2xl border border-slate-200/90 dark:border-slate-800/90 shadow-2xs space-y-2"
                              >
                                <div className="flex items-start justify-between gap-2">
                                  <div className="font-bold text-slate-800 dark:text-white text-xs">{disc.nome}</div>
                                  <span className="px-2 py-0.5 bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800/60 rounded font-black text-[11px] font-mono shrink-0">
                                    {disc.cargaHoraria}h
                                  </span>
                                </div>
                                {disc.professorResponsavel && (
                                  <div className="flex items-center space-x-1.5 text-[11px] text-slate-600 dark:text-slate-400">
                                    <User className="w-3 h-3 text-slate-400" />
                                    <span>Docente: <strong className="text-slate-800 dark:text-slate-200">{disc.professorResponsavel}</strong></span>
                                  </div>
                                )}
                                {disc.descricao && (
                                  <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">
                                    {disc.descricao}
                                  </p>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
