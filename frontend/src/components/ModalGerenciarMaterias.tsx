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
  const [novaDuracao, setNovaDuracao] = useState('');
  const [salvandoNova, setSalvandoNova] = useState(false);

  // Estado de edição inline
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [editNome, setEditNome] = useState('');
  const [editDuracao, setEditDuracao] = useState('');
  const [salvandoEdicao, setSalvandoEdicao] = useState(false);

  useEffect(() => {
    if (isOpen && turma?.id) {
      carregarMaterias();
      setNovoNome('');
      setNovaDuracao('');
      setEditandoId(null);
      setErro(null);
      setSucesso(null);
    }
  }, [isOpen, turma?.id]);

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
        duracaoEstimada: novaDuracao.trim() || undefined,
      });
      setNovoNome('');
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
    setEditDuracao(m.duracaoEstimada || '');
    setErro(null);
  };

  const cancelarEdicao = () => {
    setEditandoId(null);
    setEditNome('');
    setEditDuracao('');
  };

  const handleSalvarEdicao = async (materiaId: number) => {
    if (!turma?.id || !editNome.trim()) return;

    try {
      setSalvandoEdicao(true);
      setErro(null);
      await api.atualizarMateriaTurma(turma.id, materiaId, {
        nome: editNome.trim(),
        duracaoEstimada: editDuracao.trim() || undefined,
      });
      setEditandoId(null);
      setSucesso('Matéria atualizada!');
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

  if (!isOpen || !turma) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-3 sm:p-5 overflow-y-auto"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white dark:bg-[#0B0F19] rounded-2xl shadow-xl border border-slate-200/90 dark:border-slate-800/90 max-w-lg w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in duration-150">
        {/* Cabeçalho */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800/80 bg-white dark:bg-[#0D1220] flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-50 dark:bg-violet-950/40 border border-violet-200/60 dark:border-violet-800/40 text-violet-600 dark:text-violet-400 flex items-center justify-center shrink-0">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  {turma.codigo}
                </span>
                <span className="text-[11px] text-slate-400">
                  {turma.escolaSigla || 'GERAL'}
                </span>
              </div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white mt-1">
                Gerenciar Matérias da Turma
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {turma.cursoNome}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Notificações / Alertas */}
        <div className="px-5 pt-4 space-y-2">
          {erro && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{erro}</span>
            </div>
          )}

          {sucesso && (
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2">
              <Sparkles className="w-4 h-4 shrink-0" />
              <span>{sucesso}</span>
            </div>
          )}
        </div>

        {/* Formulário de Adicionar Nova Matéria */}
        <form onSubmit={handleAdicionarMateria} className="p-5 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-[#070A11]/60">
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
            Adicionar Nova Matéria
          </label>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              required
              value={novoNome}
              onChange={(e) => setNovoNome(e.target.value)}
              placeholder="Ex: Dança Contemporânea, Iluminação..."
              className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-violet-400"
            />
            <input
              type="text"
              value={novaDuracao}
              onChange={(e) => setNovaDuracao(e.target.value)}
              placeholder="Duração (ex: 1 mês, 3 semanas)"
              className="sm:w-44 px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-violet-400"
            />
            <button
              type="submit"
              disabled={salvandoNova || !novoNome.trim()}
              className="px-3.5 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-medium text-xs flex items-center justify-center gap-1.5 transition cursor-pointer disabled:opacity-50 shrink-0 shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{salvandoNova ? 'Salvando...' : 'Adicionar'}</span>
            </button>
          </div>
          <p className="text-[10px] text-slate-400 mt-1.5">
            Adicione matérias em qualquer momento do ano letivo. A ordem das matérias não interfere nas chamadas.
          </p>
        </form>

        {/* Lista de Matérias */}
        <div className="p-5 overflow-y-auto flex-1 space-y-2">
          <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
            <span>Matérias Cadastradas ({materias.length})</span>
            <span className="text-[10px] lowercase font-normal text-slate-400">
              modular / chamadas independentes
            </span>
          </div>

          {loading ? (
            <div className="py-12 text-center text-slate-400 text-xs">Carregando matérias...</div>
          ) : materias.length === 0 ? (
            <div className="py-10 text-center text-slate-400 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 text-xs space-y-1">
              <BookOpen className="w-6 h-6 mx-auto text-slate-300 dark:text-slate-600 mb-1" />
              <div className="font-medium text-slate-600 dark:text-slate-400">
                Nenhuma matéria cadastrada nesta turma.
              </div>
              <div className="text-[11px] text-slate-400">
                Utilize o campo acima para adicionar as matérias que compõem esta turma.
              </div>
            </div>
          ) : (
            materias.map((m, idx) => {
              const isEditando = editandoId === m.id;

              return (
                <div
                  key={m.id || idx}
                  className="flex items-center justify-between p-3 rounded-xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-[#0D1220] hover:border-slate-300 dark:hover:border-slate-700 transition"
                >
                  {isEditando ? (
                    <div className="flex-1 flex flex-col sm:flex-row gap-2 items-center mr-2">
                      <input
                        type="text"
                        required
                        value={editNome}
                        onChange={(e) => setEditNome(e.target.value)}
                        className="flex-1 px-2.5 py-1.5 text-xs rounded-lg border border-violet-400 dark:border-violet-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none"
                      />
                      <input
                        type="text"
                        value={editDuracao}
                        onChange={(e) => setEditDuracao(e.target.value)}
                        placeholder="Duração (ex: 2 semanas)"
                        className="sm:w-36 px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none"
                      />
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleSalvarEdicao(m.id!)}
                          disabled={salvandoEdicao || !editNome.trim()}
                          className="p-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition cursor-pointer"
                          title="Salvar alterações"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={cancelarEdicao}
                          className="p-1.5 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-300 transition cursor-pointer"
                          title="Cancelar"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-2.5 min-w-0 pr-2">
                        <span className="w-5 h-5 rounded-full bg-violet-100 dark:bg-violet-950/60 text-violet-700 dark:text-violet-300 text-[10px] font-bold flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        <div className="min-w-0">
                          <div className="font-semibold text-xs text-slate-800 dark:text-slate-100 truncate">
                            {m.nome}
                          </div>
                          {m.duracaoEstimada && (
                            <div className="flex items-center gap-1 text-[10px] text-slate-400 mt-0.5">
                              <Clock className="w-3 h-3" />
                              <span>{m.duracaoEstimada}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => iniciarEdicao(m)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                          title="Editar nome ou duração"
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
                    </>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Rodapé */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-[#0E1424]/50 flex items-center justify-between text-xs">
          <span className="text-[11px] text-slate-400">
            Total: {materias.length} matéria(s)
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 text-white font-medium text-xs transition cursor-pointer shadow-xs"
          >
            Concluir
          </button>
        </div>
      </div>
    </div>
  );
}
