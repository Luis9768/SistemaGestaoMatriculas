'use client';

import React, { useState, useEffect } from 'react';
import { api, Turma, TurmaMateria } from '@/lib/api';
import {
  X,
  Plus,
  BookOpen,
  Trash2,
  Edit2,
  Check,
  AlertCircle,
  Clock,
  Sparkles,
  Layers,
  User,
  ShieldCheck,
  Info,
} from 'lucide-react';

interface ModalGerenciarMateriasProps {
  isOpen: boolean;
  turma: Turma | null;
  onClose: () => void;
  onMateriasAtualizadas?: () => void;
}

export function ModalGerenciarMaterias({
  isOpen,
  turma,
  onClose,
  onMateriasAtualizadas,
}: ModalGerenciarMateriasProps) {
  const [materias, setMaterias] = useState<TurmaMateria[]>([]);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState<string | null>(null);

  // Form para adicionar nova matéria
  const [novoNome, setNovoNome] = useState('');
  const [novaCargaHoraria, setNovaCargaHoraria] = useState<string>('40');
  const [novoProfessor, setNovoProfessor] = useState('');
  const [novaDuracao, setNovaDuracao] = useState('');
  const [salvandoNova, setSalvandoNova] = useState(false);

  // Estado de edição inline
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [editNome, setEditNome] = useState('');
  const [editCargaHoraria, setEditCargaHoraria] = useState<string>('');
  const [editProfessor, setEditProfessor] = useState('');
  const [editDuracao, setEditDuracao] = useState('');
  const [salvandoEdicao, setSalvandoEdicao] = useState(false);

  useEffect(() => {
    if (isOpen && turma?.id) {
      carregarMaterias();
      carregarProfessores();
      setNovoNome('');
      setNovaCargaHoraria('40');
      setNovoProfessor('');
      setNovaDuracao('');
      setEditandoId(null);
      setErro(null);
      setSucesso(null);
    }
  }, [isOpen, turma?.id]);

  const carregarProfessores = () => {
    // Campo de texto livre para digitação direta do docente atual
  };

  const carregarMaterias = async () => {
    if (!turma?.id) return;
    try {
      setLoading(true);
      const lista = await api.getMateriasTurma(turma.id);
      setMaterias(lista);
    } catch (e: any) {
      setErro('Erro ao carregar matérias da turma.');
    } finally {
      setLoading(false);
    }
  };

  const handleAdicionarMateria = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!turma?.id || !novoNome.trim()) return;

    try {
      setSalvandoNova(true);
      setErro(null);
      await api.adicionarMateriaTurma(turma.id, {
        nome: novoNome.trim(),
        cargaHoraria: novaCargaHoraria ? parseInt(novaCargaHoraria, 10) : undefined,
        professorResponsavel: novoProfessor.trim() || undefined,
        duracaoEstimada: novaDuracao.trim() || undefined,
      });
      setNovoNome('');
      setNovaCargaHoraria('40');
      setNovoProfessor('');
      setNovaDuracao('');
      setSucesso('Matéria adicionada com sucesso!');
      setTimeout(() => setSucesso(null), 3000);
      await carregarMaterias();
      onMateriasAtualizadas?.();
    } catch (err: any) {
      setErro(err.message || 'Erro ao adicionar matéria.');
    } finally {
      setSalvandoNova(false);
    }
  };

  const iniciarEdicao = (m: TurmaMateria) => {
    if (!m.id) return;
    setEditandoId(m.id);
    setEditNome(m.nome);
    setEditCargaHoraria(m.cargaHoraria ? String(m.cargaHoraria) : '');
    setEditProfessor(m.professorResponsavel || '');
    setEditDuracao(m.duracaoEstimada || '');
    setErro(null);
  };

  const cancelarEdicao = () => {
    setEditandoId(null);
    setEditNome('');
    setEditCargaHoraria('');
    setEditProfessor('');
    setEditDuracao('');
  };

  const handleSalvarEdicao = async (materiaId: number) => {
    if (!turma?.id || !editNome.trim()) return;

    try {
      setSalvandoEdicao(true);
      setErro(null);
      await api.atualizarMateriaTurma(turma.id, materiaId, {
        nome: editNome.trim(),
        cargaHoraria: editCargaHoraria ? parseInt(editCargaHoraria, 10) : undefined,
        professorResponsavel: editProfessor.trim() || undefined,
        duracaoEstimada: editDuracao.trim() || undefined,
      });
      setEditandoId(null);
      setSucesso('Matéria atualizada com sucesso!');
      setTimeout(() => setSucesso(null), 3000);
      await carregarMaterias();
      onMateriasAtualizadas?.();
    } catch (err: any) {
      setErro(err.message || 'Erro ao atualizar matéria.');
    } finally {
      setSalvandoEdicao(false);
    }
  };

  const handleRemoverMateria = async (materiaId: number, nomeMateria: string) => {
    if (!turma?.id) return;
    const confirmou = window.confirm(
      `Deseja realmente remover a matéria "${nomeMateria}" desta turma?`
    );
    if (!confirmou) return;

    try {
      setErro(null);
      await api.removerMateriaTurma(turma.id, materiaId);
      setSucesso(`Matéria "${nomeMateria}" removida com sucesso!`);
      setTimeout(() => setSucesso(null), 3000);
      await carregarMaterias();
      onMateriasAtualizadas?.();
    } catch (err: any) {
      setErro(err.message || 'Erro ao remover matéria.');
    }
  };

  const totalHorasTurma = materias.reduce((acc, m) => acc + (m.cargaHoraria || 0), 0);

  if (!isOpen || !turma) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-3 sm:p-5 overflow-y-auto"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white dark:bg-[#121214] rounded-3xl shadow-2xl border border-slate-200/90 dark:border-[#27272a] max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in duration-150">
        {/* Cabeçalho */}
        <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-[#27272a]/80 bg-slate-50/50 dark:bg-[#18181b]/80 flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  {turma.codigo}
                </span>
                <span className="text-[11px] font-semibold text-slate-400">
                  {turma.escolaSigla || 'GERAL'}
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white mt-0.5">
                Matérias & Docentes da Turma
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {turma.cursoNome}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-xl p-2 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Notificações / Alertas */}
        <div className="px-5 pt-4 space-y-2">
          {erro && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{erro}</span>
            </div>
          )}

          {sucesso && (
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2">
              <Sparkles className="w-4 h-4 shrink-0" />
              <span>{sucesso}</span>
            </div>
          )}

          {/* Aviso sobre imutabilidade histórica do diário */}
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-slate-700 dark:text-slate-300 text-[11px] flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-amber-800 dark:text-amber-300 font-bold block mb-0.5">
                Alocação Docente & Auditoria Histórica
              </strong>
              <span>
                O professor associado à matéria é o responsável pedagógico atual. Caso ocorra substituição, você pode editá-lo a qualquer momento. O histórico de presenças passadas manterá permanentemente gravado o nome exato de quem realizou a chamada naquele dia.
              </span>
            </div>
          </div>
        </div>

        {/* Formulário de Adicionar Nova Matéria */}
        <form
          onSubmit={handleAdicionarMateria}
          className="p-5 border-b border-slate-100 dark:border-[#27272a]/80 bg-slate-50/70 dark:bg-[#09090b]/60 space-y-3"
        >
          <div className="flex items-center justify-between">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              + Adicionar Matéria na Grade da Turma
            </label>
            <span className="text-[10px] text-slate-400">Campos com * são obrigatórios</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
            {/* Nome da Matéria */}
            <div className="sm:col-span-6">
              <input
                type="text"
                required
                value={novoNome}
                onChange={(e) => setNovoNome(e.target.value)}
                placeholder="Nome da matéria (ex: Expressão Corporal)*"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
              />
            </div>

            {/* Carga Horária (Numérica) */}
            <div className="sm:col-span-3">
              <div className="relative">
                <input
                  type="number"
                  min={1}
                  max={1000}
                  required
                  value={novaCargaHoraria}
                  onChange={(e) => setNovaCargaHoraria(e.target.value)}
                  placeholder="Carga (h)*"
                  className="w-full pl-3 pr-7 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                />
                <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400">
                  h
                </span>
              </div>
            </div>

            {/* Duração Estimada Opcional (Exibição: ex: 2 semanas, 2 meses) */}
            <div className="sm:col-span-3">
              <input
                type="text"
                value={novaDuracao}
                onChange={(e) => setNovaDuracao(e.target.value)}
                placeholder="Duração (ex: 2 semanas, 2 meses)"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
              />
            </div>

            {/* Professor Responsável */}
            <div className="sm:col-span-9">
              <input
                type="text"
                value={novoProfessor}
                onChange={(e) => setNovoProfessor(e.target.value)}
                placeholder="Professor responsável atual (digite o nome)..."
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
              />
            </div>

            {/* Botão Adicionar */}
            <div className="sm:col-span-3">
              <button
                type="submit"
                disabled={salvandoNova || !novoNome.trim()}
                className="w-full h-full min-h-[34px] px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 active:scale-98 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer disabled:opacity-50 shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{salvandoNova ? 'Salvando...' : 'Adicionar'}</span>
              </button>
            </div>
          </div>
        </form>

        {/* Lista de Matérias */}
        <div className="p-5 overflow-y-auto flex-1 space-y-2.5">
          <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
            <span>Matérias Cadastradas ({materias.length})</span>
            {totalHorasTurma > 0 && (
              <span className="font-mono text-amber-600 dark:text-amber-400 font-extrabold lowercase">
                soma: {totalHorasTurma}h totais
              </span>
            )}
          </div>

          {loading ? (
            <div className="py-12 text-center text-slate-400 text-xs">Carregando matérias...</div>
          ) : materias.length === 0 ? (
            <div className="py-10 text-center text-slate-400 bg-slate-50 dark:bg-slate-900/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 text-xs space-y-1">
              <BookOpen className="w-6 h-6 mx-auto text-slate-300 dark:text-slate-600 mb-1" />
              <div className="font-medium text-slate-600 dark:text-slate-400">
                Nenhuma matéria cadastrada nesta turma ainda.
              </div>
              <div className="text-[11px] text-slate-400">
                Utilize os campos acima para cadastrar matérias, cargas horárias e professores.
              </div>
            </div>
          ) : (
            materias.map((m, idx) => {
              const isEditando = editandoId === m.id;

              return (
                <div
                  key={m.id || idx}
                  className="p-3.5 rounded-2xl border border-slate-200/90 dark:border-[#27272a] bg-white dark:bg-[#18181b] hover:border-slate-300 dark:hover:border-zinc-700 transition space-y-2"
                >
                  {isEditando ? (
                    <div className="space-y-2">
                      <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                        <input
                          type="text"
                          required
                          value={editNome}
                          onChange={(e) => setEditNome(e.target.value)}
                          placeholder="Nome da matéria"
                          className="sm:col-span-6 px-3 py-1.5 text-xs rounded-xl border border-amber-400 dark:border-amber-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none"
                        />
                        <div className="sm:col-span-3 relative">
                          <input
                            type="number"
                            min={1}
                            value={editCargaHoraria}
                            onChange={(e) => setEditCargaHoraria(e.target.value)}
                            placeholder="Carga (h)"
                            className="w-full pl-3 pr-6 py-1.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none"
                          />
                          <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400">
                            h
                          </span>
                        </div>
                        <input
                          type="text"
                          value={editDuracao}
                          onChange={(e) => setEditDuracao(e.target.value)}
                          placeholder="Duração (ex: 2 semanas, 2 meses)"
                          className="sm:col-span-3 px-3 py-1.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none"
                        />
                        <div className="sm:col-span-12">
                          <input
                            type="text"
                            value={editProfessor}
                            onChange={(e) => setEditProfessor(e.target.value)}
                            placeholder="Professor responsável atual..."
                            className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none"
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-100 dark:border-slate-800">
                        <button
                          type="button"
                          onClick={cancelarEdicao}
                          className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold cursor-pointer"
                        >
                          Cancelar
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSalvarEdicao(m.id!)}
                          disabled={salvandoEdicao || !editNome.trim()}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>{salvandoEdicao ? 'Salvando...' : 'Salvar Alterações'}</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-start gap-3 min-w-0">
                        <span className="w-6 h-6 rounded-lg bg-amber-500/10 text-amber-700 dark:text-amber-400 text-xs font-extrabold flex items-center justify-center shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <div className="min-w-0">
                          <div className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white truncate">
                            {m.nome}
                          </div>

                          <div className="flex flex-wrap items-center gap-2 mt-1 text-[11px]">
                            {/* Carga Horária Badge */}
                            {m.cargaHoraria ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800/60 text-amber-800 dark:text-amber-300 font-mono font-bold text-[10px]">
                                <Clock className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                                {m.cargaHoraria}h
                              </span>
                            ) : null}

                            {/* Professor Atual Badge */}
                            {m.professorResponsavel ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-semibold text-[10px]">
                                <User className="w-3 h-3 text-slate-500 dark:text-slate-400" />
                                <span>Prof: <strong>{m.professorResponsavel}</strong></span>
                              </span>
                            ) : (
                              <span className="text-[10px] text-slate-400 italic">
                                Sem professor fixo atribuído
                              </span>
                            )}

                            {m.duracaoEstimada && (
                              <span className="text-[10px] text-slate-400">
                                • {m.duracaoEstimada}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => iniciarEdicao(m)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/30 transition cursor-pointer"
                          title="Editar matéria ou alterar professor"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoverMateria(m.id!, m.nome)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition cursor-pointer"
                          title="Remover matéria"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Rodapé */}
        <div className="p-4 sm:p-5 border-t border-slate-100 dark:border-[#27272a] bg-slate-50/70 dark:bg-[#09090b] flex items-center justify-between text-xs">
          <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-2">
            <span>{materias.length} matéria(s) cadastrada(s)</span>
            {totalHorasTurma > 0 && (
              <>
                <span>•</span>
                <span className="font-mono font-bold text-slate-700 dark:text-slate-300">
                  {totalHorasTurma} horas totais
                </span>
              </>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100 text-white font-bold text-xs transition cursor-pointer shadow-xs"
          >
            Concluir
          </button>
        </div>
      </div>
    </div>
  );
}
