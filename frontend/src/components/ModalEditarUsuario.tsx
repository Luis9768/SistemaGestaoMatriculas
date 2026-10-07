'use client';

import React, { useState, useEffect } from 'react';
import { api, Usuario, Escola, AtualizarUsuarioPayload } from '@/lib/api';
import {
  X,
  UserCog,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Building2,
  Check,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  ShieldCheck,
  GraduationCap,
} from 'lucide-react';

interface ModalEditarUsuarioProps {
  isOpen: boolean;
  usuario: Usuario | null;
  escolas: Escola[];
  onClose: () => void;
  onUsuarioAtualizado: (usuarioAtualizado: Usuario) => void;
}

export function ModalEditarUsuario({
  isOpen,
  usuario,
  escolas,
  onClose,
  onUsuarioAtualizado,
}: ModalEditarUsuarioProps) {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'ROLE_ADMIN' | 'ROLE_ENCARREGADA'>('ROLE_ENCARREGADA');
  const [escolasSelecionadasIds, setEscolasSelecionadasIds] = useState<number[]>([]);
  const [senha, setSenha] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [ativo, setAtivo] = useState(true);

  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    if (usuario && isOpen) {
      setNome(usuario.nome || '');
      setEmail(usuario.email || '');
      setRole(usuario.role || 'ROLE_ENCARREGADA');
      setAtivo(usuario.ativo ?? true);
      setSenha('');
      setErro(null);

      const idsIniciais =
        usuario.escolasIds && usuario.escolasIds.length > 0
          ? usuario.escolasIds
          : usuario.escolaId
          ? [usuario.escolaId]
          : [];
      setEscolasSelecionadasIds(idsIniciais);
    }
  }, [usuario, isOpen]);

  if (!isOpen || !usuario) return null;

  const handleToggleEscola = (escolaId: number) => {
    setEscolasSelecionadasIds((prev) =>
      prev.includes(escolaId) ? prev.filter((id) => id !== escolaId) : [...prev, escolaId]
    );
  };

  const handleSelecionarTodas = () => {
    setEscolasSelecionadasIds(escolas.map((e) => e.id));
  };

  const handleLimparEscolas = () => {
    setEscolasSelecionadasIds([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro(null);

    if (!nome.trim()) {
      setErro('Informe o nome completo do usuário.');
      return;
    }

    if (!email.trim() || !email.includes('@')) {
      setErro('Informe um e-mail institucional válido.');
      return;
    }

    if (role === 'ROLE_ENCARREGADA' && escolasSelecionadasIds.length === 0) {
      setErro('Selecione pelo menos uma escola de atuação para a encarregada.');
      return;
    }

    try {
      setLoading(true);
      const payload: AtualizarUsuarioPayload = {
        nome: nome.trim(),
        email: email.trim().toLowerCase(),
        role,
        escolasIds: role === 'ROLE_ENCARREGADA' ? escolasSelecionadasIds : [],
        senha: senha.trim() ? senha.trim() : undefined,
        ativo,
      };

      const atualizado = await api.atualizarUsuario(usuario.id, payload);
      onUsuarioAtualizado(atualizado);
      onClose();
    } catch (err: any) {
      setErro(err.message || 'Erro ao atualizar dados do usuário.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="bg-white dark:bg-[#121214] border border-slate-200 dark:border-[#27272a] rounded-3xl w-full max-w-xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden"
        role="dialog"
        aria-modal="true"
      >
        {/* Topo do Modal */}
        <div className="px-6 py-5 border-b border-slate-100 dark:border-[#27272a] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <UserCog className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Editar Usuário & Acessos
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Altere dados cadastrais, unidades permitidas e status de login
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formulário com Scroll */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-5 space-y-5 text-xs">
          {erro && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{erro}</span>
            </div>
          )}

          {/* Banner de Bloqueio se o Usuário estiver Inativo */}
          {!ativo && (
            <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-900 dark:text-amber-200 flex items-start gap-3 animate-in fade-in duration-150">
              <Lock className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <p className="font-bold text-xs">Edição Bloqueada (Usuário Inativo)</p>
                <p className="text-[11px] text-amber-800/90 dark:text-amber-300/90 leading-relaxed">
                  Só é permitido alterar dados cadastrais (nome, e-mail, função ou escolas) caso o usuário esteja ativo. Clique em <strong>&ldquo;Ativar Usuário&rdquo;</strong> na seção de status abaixo para liberar a edição.
                </p>
              </div>
            </div>
          )}

          {/* Nome e E-mail */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Nome Completo *
              </label>
              <input
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                disabled={!ativo || loading}
                placeholder="Ex: Maria Aparecida da Silva"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                E-mail Institucional *
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={!ativo || loading}
                  placeholder="usuario@santoandre.sp.gov.br"
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>
            </div>
          </div>

          {/* Papel / Função */}
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Função Institucional *
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                disabled={!ativo || loading}
                onClick={() => setRole('ROLE_ENCARREGADA')}
                className={`p-3 rounded-2xl border text-left flex items-start gap-2.5 transition ${
                  !ativo ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                } ${
                  role === 'ROLE_ENCARREGADA'
                    ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/30 text-indigo-950 dark:text-indigo-200'
                    : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 text-slate-600 dark:text-slate-400'
                }`}
              >
                <GraduationCap className="w-4 h-4 shrink-0 text-indigo-600 mt-0.5" />
                <div>
                  <div className="font-bold">Encarregada da Secretaria</div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Acesso restrito às escolas selecionadas
                  </div>
                </div>
              </button>

              <button
                type="button"
                disabled={!ativo || loading}
                onClick={() => setRole('ROLE_ADMIN')}
                className={`p-3 rounded-2xl border text-left flex items-start gap-2.5 transition ${
                  !ativo ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                } ${
                  role === 'ROLE_ADMIN'
                    ? 'border-amber-600 bg-amber-50/50 dark:bg-amber-950/30 text-amber-950 dark:text-amber-200'
                    : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 text-slate-600 dark:text-slate-400'
                }`}
              >
                <ShieldCheck className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
                <div>
                  <div className="font-bold">Administrador Geral</div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Coordenação Geral e todas as escolas
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Escolas com Acesso (se for Encarregada) */}
          {role === 'ROLE_ENCARREGADA' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block">
                    Escolas de Atuação & Gestão *
                  </label>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    Marque as escolas que a encarregada pode acessar e gerenciar:
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleSelecionarTodas}
                    disabled={!ativo || loading}
                    className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer font-semibold disabled:opacity-40 disabled:cursor-not-allowed disabled:no-underline"
                  >
                    Marcar Todas
                  </button>
                  <span className="text-slate-300 dark:text-slate-700">|</span>
                  <button
                    type="button"
                    onClick={handleLimparEscolas}
                    disabled={!ativo || loading}
                    className="text-[11px] text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:underline cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:no-underline"
                  >
                    Limpar
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                {escolas.map((esc) => {
                  const selecionada = escolasSelecionadasIds.includes(esc.id);
                  return (
                    <div
                      key={esc.id}
                      onClick={() => {
                        if (!ativo || loading) return;
                        handleToggleEscola(esc.id);
                      }}
                      className={`p-3 rounded-2xl border transition-all flex items-center justify-between select-none ${
                        !ativo || loading
                          ? 'opacity-50 cursor-not-allowed'
                          : 'cursor-pointer hover:border-slate-300'
                      } ${
                        selecionada
                          ? 'border-indigo-600 bg-indigo-50/60 dark:bg-indigo-950/40 text-slate-900 dark:text-white shadow-2xs'
                          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span
                          className={`w-6 h-6 rounded-lg text-[10px] font-mono font-bold flex items-center justify-center shrink-0 ${
                            selecionada
                              ? 'bg-indigo-600 text-white'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                          }`}
                        >
                          {esc.sigla}
                        </span>
                        <div className="min-w-0">
                          <p className="font-bold text-xs truncate">{esc.nome}</p>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                            {esc.sigla === 'ELT' && 'Teatro'}
                            {esc.sigla === 'ELD' && 'Dança'}
                            {esc.sigla === 'ELCV' && 'Cinema & Vídeo'}
                            {esc.sigla === 'EMIA' && 'Iniciação Artística'}
                          </p>
                        </div>
                      </div>

                      <div
                        className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition ${
                          selecionada
                            ? 'bg-indigo-600 border-indigo-600 text-white'
                            : 'border-slate-300 dark:border-slate-700'
                        }`}
                      >
                        {selecionada && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5 pt-0.5">
                <Building2 className="w-3.5 h-3.5 text-indigo-500" />
                <span>
                  {escolasSelecionadasIds.length === 0
                    ? 'Nenhuma unidade selecionada.'
                    : `${escolasSelecionadasIds.length} unidade(s) selecionada(s).`}
                </span>
              </div>
            </div>
          )}

          {/* Status Ativo / Inativo */}
          <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/60 flex items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  Status de Acesso ao Sistema
                </span>
                {ativo ? (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                    Ativo para Login
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300">
                    Bloqueado / Inativo
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                {ativo
                  ? 'O usuário pode entrar no sistema normalmente com suas credenciais.'
                  : 'O login deste usuário está desativado. Ative para liberar as alterações.'}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setAtivo(!ativo)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 ${
                ativo
                  ? 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-900'
                  : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm shadow-emerald-600/20'
              }`}
            >
              {ativo ? 'Desativar Usuário' : 'Ativar Usuário'}
            </button>
          </div>

          {/* Redefinição de Senha (Opcional) */}
          <div className="space-y-1">
            <label className="block font-bold text-slate-700 dark:text-slate-300">
              Redefinir Senha de Acesso (Opcional)
            </label>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Deixe em branco para manter a senha atual do usuário.
            </p>
            <div className="relative pt-1">
              <input
                type={mostrarSenha ? 'text' : 'password'}
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                disabled={!ativo || loading}
                placeholder="Digite a nova senha se desejar alterá-la"
                className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-4" />
              <button
                type="button"
                disabled={!ativo || loading}
                onClick={() => setMostrarSenha(!mostrarSenha)}
                className="absolute right-3 top-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {mostrarSenha ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Rodapé do Formulário */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold transition cursor-pointer"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={loading || !ativo}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 font-bold transition shadow-xs cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>{loading ? 'Salvando...' : 'Salvar Alterações'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
