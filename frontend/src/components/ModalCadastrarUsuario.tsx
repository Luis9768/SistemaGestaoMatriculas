'use client';

import React, { useState, useEffect } from 'react';
import {
  api,
  Escola,
  Turma,
  CadastrarUsuarioPayload,
} from '@/lib/api';
import {
  X,
  User,
  GraduationCap,
  ShieldCheck,
  Check,
  AlertCircle,
  Search,
} from 'lucide-react';
import { getCorTemaEscola } from '@/lib/escolaUtils';

interface ModalCadastrarUsuarioProps {
  isOpen: boolean;
  onClose: () => void;
  onUsuarioCadastrado?: () => void;
}

export function ModalCadastrarUsuario({
  isOpen,
  onClose,
  onUsuarioCadastrado,
}: ModalCadastrarUsuarioProps) {
  const [role, setRole] = useState<'ROLE_PROFESSOR' | 'ROLE_ENCARREGADA'>('ROLE_PROFESSOR');
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [escolaId, setEscolaId] = useState<number | ''>('');
  const [turmasSelecionadas, setTurmasSelecionadas] = useState<number[]>([]);
  const [buscaTurma, setBuscaTurma] = useState('');
  const [filtroEscolaTurma, setFiltroEscolaTurma] = useState<number | 'TODAS'>('TODAS');

  const [escolas, setEscolas] = useState<Escola[]>([]);
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [loadingDados, setLoadingDados] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      carregarListasAuxiliares();
      limparFormulario();
    }
  }, [isOpen]);

  const limparFormulario = () => {
    setNome('');
    setEmail('');
    setSenha('');
    setEscolaId('');
    setTurmasSelecionadas([]);
    setBuscaTurma('');
    setFiltroEscolaTurma('TODAS');
    setErro(null);
  };

  const carregarListasAuxiliares = async () => {
    try {
      setLoadingDados(true);
      const [listaEscolas, listaTurmas] = await Promise.all([
        api.getEscolas(),
        api.getTurmas(),
      ]);
      setEscolas(listaEscolas);
      setTurmas(listaTurmas);
      if (listaEscolas.length > 0 && !escolaId) {
        setEscolaId(listaEscolas[0].id);
      }
    } catch (e: any) {
      setErro('Erro ao carregar escolas e turmas para o formulário.');
    } finally {
      setLoadingDados(false);
    }
  };

  const alternarTurma = (turmaId: number) => {
    setTurmasSelecionadas((prev) =>
      prev.includes(turmaId) ? prev.filter((id) => id !== turmaId) : [...prev, turmaId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro(null);

    if (!nome.trim() || !email.trim() || !senha.trim()) {
      setErro('Preencha todos os campos obrigatórios (nome, e-mail e senha).');
      return;
    }

    if (role === 'ROLE_ENCARREGADA' && !escolaId) {
      setErro('Selecione a escola da qual a encarregada será responsável.');
      return;
    }

    try {
      setSalvando(true);
      const payload: CadastrarUsuarioPayload = {
        nome: nome.trim(),
        email: email.trim().toLowerCase(),
        senha: senha.trim(),
        role,
        escolaId: role === 'ROLE_ENCARREGADA' ? Number(escolaId) : undefined,
        turmaIds: role === 'ROLE_PROFESSOR' ? turmasSelecionadas : undefined,
      };

      await api.cadastrarUsuario(payload);
      if (onUsuarioCadastrado) {
        onUsuarioCadastrado();
      }
      onClose();
    } catch (err: any) {
      setErro(err.message || 'Falha ao cadastrar usuário.');
    } finally {
      setSalvando(false);
    }
  };

  if (!isOpen) return null;

  const turmasFiltradas = turmas.filter((t) => {
    const matchEscola = filtroEscolaTurma === 'TODAS' || t.escolaId === filtroEscolaTurma;
    const termo = buscaTurma.trim().toLowerCase();
    const matchBusca =
      !termo ||
      t.codigo?.toLowerCase().includes(termo) ||
      t.cursoNome?.toLowerCase().includes(termo) ||
      t.escolaSigla?.toLowerCase().includes(termo);
    return matchEscola && matchBusca;
  });

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-3 sm:p-5 overflow-y-auto"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white dark:bg-[#0B0F19] rounded-2xl shadow-xl border border-slate-200/90 dark:border-slate-800/90 max-w-xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in duration-150">
        
        {/* Cabeçalho do Modal */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800/80 bg-white dark:bg-[#0D1220] flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
              Cadastrar Usuário da Equipe
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Defina o perfil de acesso (Professor ou Encarregada) e seus vínculos escolares
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formulário com Scroll Interno */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 space-y-4 text-xs">
          
          {erro && (
            <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{erro}</span>
            </div>
          )}

          {/* Seletor de Perfil (Professor vs Encarregada) */}
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
              Função Institucional
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setRole('ROLE_PROFESSOR')}
                className={`p-3 rounded-xl border text-left transition cursor-pointer flex items-center gap-2.5 ${
                  role === 'ROLE_PROFESSOR'
                    ? 'border-slate-900 bg-slate-50 dark:border-white dark:bg-slate-800/80 text-slate-900 dark:text-white font-semibold'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                }`}
              >
                <GraduationCap className="w-4 h-4 shrink-0" />
                <div>
                  <div className="font-semibold text-xs">Professor(a)</div>
                  <div className="text-[10px] text-slate-400 font-normal">Leciona em 1 ou mais turmas</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setRole('ROLE_ENCARREGADA')}
                className={`p-3 rounded-xl border text-left transition cursor-pointer flex items-center gap-2.5 ${
                  role === 'ROLE_ENCARREGADA'
                    ? 'border-slate-900 bg-slate-50 dark:border-white dark:bg-slate-800/80 text-slate-900 dark:text-white font-semibold'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                }`}
              >
                <ShieldCheck className="w-4 h-4 shrink-0" />
                <div>
                  <div className="font-semibold text-xs">Encarregada</div>
                  <div className="text-[10px] text-slate-400 font-normal">Gestão de escola específica</div>
                </div>
              </button>
            </div>
          </div>

          {/* Dados Pessoais de Acesso */}
          <div className="space-y-3 pt-1">
            <div>
              <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                Nome Completo *
              </label>
              <input
                type="text"
                required
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Ex: Carlos Eduardo de Oliveira"
                className="w-full border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                  E-mail de Acesso *
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="usuario@santoandre.sp.gov.br"
                  className="w-full border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Senha Inicial de Acesso *
                </label>
                <input
                  type="password"
                  required
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  placeholder="Defina a senha provisória"
                  className="w-full border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400"
                />
              </div>
            </div>
          </div>

          {/* Vínculo da Encarregada com a Escola */}
          {role === 'ROLE_ENCARREGADA' && (
            <div className="pt-2">
              <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                Escola de Lotação *
              </label>
              <select
                value={escolaId}
                onChange={(e) => setEscolaId(Number(e.target.value))}
                required
                className="w-full border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-slate-400"
              >
                <option value="">Selecione uma Escola Livre...</option>
                {escolas.map((esc) => (
                  <option key={esc.id} value={esc.id}>
                    [{esc.sigla}] {esc.nome}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Vínculo Multidisciplinar do Professor com Turmas */}
          {role === 'ROLE_PROFESSOR' && (
            <div className="pt-2 space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400">
                  Turmas Atribuídas ao Docente ({turmasSelecionadas.length} selecionada(s))
                </label>
                <span className="text-[10px] text-slate-400">
                  Lecione em diferentes escolas e linguagens
                </span>
              </div>

              {/* Filtros de Turma (Busca + Escola) */}
              <div className="space-y-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    value={buscaTurma}
                    onChange={(e) => setBuscaTurma(e.target.value)}
                    placeholder="Filtrar turma por código ou curso..."
                    className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400"
                  />
                </div>

                <div className="flex items-center gap-1 overflow-x-auto pb-0.5 text-[11px]">
                  <button
                    type="button"
                    onClick={() => setFiltroEscolaTurma('TODAS')}
                    className={`px-2 py-0.5 rounded-md font-mono text-[10px] uppercase font-bold transition cursor-pointer ${
                      filtroEscolaTurma === 'TODAS'
                        ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                    }`}
                  >
                    Todas
                  </button>
                  {escolas.map((esc) => (
                    <button
                      key={esc.id}
                      type="button"
                      onClick={() => setFiltroEscolaTurma(esc.id)}
                      className={`px-2 py-0.5 rounded-md font-mono text-[10px] uppercase font-bold transition cursor-pointer border ${
                        filtroEscolaTurma === esc.id
                          ? 'border-slate-900 dark:border-white bg-slate-900 dark:bg-white text-white dark:text-slate-900'
                          : `${getCorTemaEscola(esc.sigla)} hover:opacity-80`
                      }`}
                    >
                      {esc.sigla}
                    </button>
                  ))}
                </div>
              </div>

              {loadingDados ? (
                <div className="py-8 text-center text-slate-400 text-xs">Carregando turmas...</div>
              ) : turmasFiltradas.length === 0 ? (
                <div className="py-6 text-center text-slate-400 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 text-xs">
                  Nenhuma turma encontrada com o filtro selecionado.
                </div>
              ) : (
                <div className="border border-slate-200/80 dark:border-slate-800/80 rounded-xl p-3 bg-slate-50/50 dark:bg-[#070A11] max-h-56 overflow-y-auto space-y-1.5">
                  {turmasFiltradas.map((t) => {
                    const isSelected = turmasSelecionadas.includes(t.id!);
                    return (
                      <div
                        key={t.id}
                        onClick={() => alternarTurma(t.id!)}
                        className={`flex items-center justify-between p-2.5 rounded-lg border transition cursor-pointer select-none text-xs ${
                          isSelected
                            ? 'bg-white dark:bg-slate-800 border-slate-900 dark:border-white shadow-2xs font-medium'
                            : 'bg-white/60 dark:bg-slate-900/40 border-slate-200/70 dark:border-slate-800/70 hover:bg-white dark:hover:bg-slate-800/60'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider border ${getCorTemaEscola(
                              t.escolaSigla
                            )}`}
                          >
                            {t.escolaSigla || 'GERAL'}
                          </span>
                          <span className="text-slate-800 dark:text-slate-200 font-medium">
                            {t.cursoNome}
                          </span>
                          <span className="font-mono text-slate-400 text-[11px]">
                            ({t.codigo})
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <div
                            className={`w-4 h-4 rounded flex items-center justify-center border transition ${
                              isSelected
                                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white'
                                : 'border-slate-300 dark:border-slate-700'
                            }`}
                          >
                            {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Rodapé com Botões de Ação */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={salvando}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 rounded-lg text-xs font-medium transition cursor-pointer disabled:opacity-50"
            >
              {salvando ? 'Cadastrando...' : 'Cadastrar Usuário'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
