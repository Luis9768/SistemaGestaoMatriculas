'use client';

import React, { useState, useEffect } from 'react';
import { api, Usuario, Escola, AtualizarUsuarioPayload } from '@/lib/api';
import {
  X,
  Mail,
  User,
  Lock,
  Eye,
  EyeOff,
  Check,
  AlertCircle,
  Loader2,
  ShieldCheck,
  Users2,
  Power,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';
import { FotoPerfilUploader } from '@/components/FotoPerfilUploader';

interface ModalGerenciarUsuarioProps {
  isOpen: boolean;
  usuario: Usuario | null;
  escolas: Escola[];
  onClose: () => void;
  onUsuarioAtualizado: (usuarioAtualizado: Usuario) => void;
  onAlternarStatus: (usuarioId: number, statusAtual: boolean) => Promise<void>;
}

export function ModalGerenciarUsuario({
  isOpen,
  usuario,
  escolas,
  onClose,
  onUsuarioAtualizado,
  onAlternarStatus,
}: ModalGerenciarUsuarioProps) {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'ROLE_ADMIN' | 'ROLE_ENCARREGADA'>('ROLE_ENCARREGADA');
  const [escolasSelecionadasIds, setEscolasSelecionadasIds] = useState<number[]>([]);
  const [senha, setSenha] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [ativo, setAtivo] = useState(true);
  const [fotoUrl, setFotoUrl] = useState('');

  const [loadingSalvar, setLoadingSalvar] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    if (usuario && isOpen) {
      setNome(usuario.nome || '');
      setEmail(usuario.email || '');
      setRole(usuario.role || 'ROLE_ENCARREGADA');
      setAtivo(usuario.ativo ?? true);
      setFotoUrl(usuario.fotoUrl || '');
      setSenha('');
      setMostrarSenha(false);
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

  const inicial = usuario.nome?.trim() ? usuario.nome.trim().charAt(0).toUpperCase() : 'U';

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

  const handleToggleStatus = async () => {
    if (!usuario) return;
    try {
      setLoadingStatus(true);
      setErro(null);
      const novoStatus = !ativo;
      await onAlternarStatus(usuario.id, ativo);
      setAtivo(novoStatus);
    } catch (err: any) {
      setErro(err.message || 'Erro ao alterar status do usuário.');
    } finally {
      setLoadingStatus(false);
    }
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
      setLoadingSalvar(true);
      const payload: AtualizarUsuarioPayload = {
        nome: nome.trim(),
        email: email.trim().toLowerCase(),
        role,
        escolasIds: role === 'ROLE_ENCARREGADA' ? escolasSelecionadasIds : [],
        senha: senha.trim() ? senha.trim() : undefined,
        ativo,
        fotoUrl: fotoUrl.trim() || undefined,
      };

      const atualizado = await api.atualizarUsuario(usuario.id, payload);
      onUsuarioAtualizado(atualizado);
      onClose();
    } catch (err: any) {
      setErro(err.message || 'Erro ao atualizar dados do usuário.');
    } finally {
      setLoadingSalvar(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-gerenciar-usuario-titulo"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/75 backdrop-blur-xs animate-in fade-in duration-150"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-[#121214] border border-zinc-200/90 dark:border-zinc-800 rounded-2xl w-full max-w-xl shadow-xs flex flex-col max-h-[92vh] overflow-hidden animate-in zoom-in-98 duration-150"
      >
        {/* Cabeçalho */}
        <div className="px-5 py-4 border-b border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/40 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-full border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 flex items-center justify-center shrink-0 overflow-hidden">
              {fotoUrl ? (
                <img
                  src={fotoUrl}
                  alt={usuario.nome}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="font-sans font-bold text-sm text-zinc-800 dark:text-zinc-100 select-none">
                  {inicial}
                </span>
              )}
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2
                  id="modal-gerenciar-usuario-titulo"
                  className="text-base font-bold text-zinc-900 dark:text-zinc-100 truncate tracking-tight"
                >
                  Gerenciar Usuário & Acessos
                </h2>
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wide uppercase ${
                    role === 'ROLE_ADMIN'
                      ? 'bg-[#FBF3DB] text-[#956400] dark:bg-amber-950/40 dark:text-amber-300 border border-amber-500/20'
                      : 'bg-[#E1F3FE] text-[#1F6C9F] dark:bg-sky-950/40 dark:text-sky-300 border border-sky-500/20'
                  }`}
                >
                  {role === 'ROLE_ADMIN' ? 'Administrador' : 'Encarregada'}
                </span>
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate mt-0.5">
                {usuario.email}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            type="button"
            className="p-1.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition cursor-pointer"
            title="Fechar"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formulário com Scroll */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-5 py-4 space-y-4 text-xs">
          {erro && (
            <div className="p-3 rounded-xl bg-[#FDEBEC] dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-[#9F2F2D] dark:text-rose-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span className="font-medium">{erro}</span>
            </div>
          )}

          {/* Status e Bloqueio de Login */}
          <div className="p-3 rounded-xl border border-zinc-200/90 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-900/30 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Acesso ao Painel:
              </span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase ${
                  ativo
                    ? 'bg-[#EDF3EC] text-[#346538] dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-500/20'
                    : 'bg-[#FDEBEC] text-[#9F2F2D] dark:bg-rose-950/40 dark:text-rose-300 border border-rose-500/20'
                }`}
              >
                {ativo ? 'Ativo' : 'Inativo'}
              </span>
            </div>

            <button
              type="button"
              onClick={handleToggleStatus}
              disabled={loadingStatus || loadingSalvar}
              className={`shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition cursor-pointer disabled:opacity-50 ${
                ativo
                  ? 'border-rose-200/90 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30'
                  : 'border-emerald-200/90 dark:border-emerald-900/60 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30'
              }`}
            >
              {loadingStatus ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : ativo ? (
                <Power className="w-3.5 h-3.5" />
              ) : (
                <CheckCircle2 className="w-3.5 h-3.5" />
              )}
              <span>{ativo ? 'Bloquear Login' : 'Reativar Login'}</span>
            </button>
          </div>

          {/* Foto de Perfil */}
          <FotoPerfilUploader
            fotoUrl={fotoUrl}
            onChangeFotoUrl={setFotoUrl}
            nomeUsuario={nome}
            disabled={loadingSalvar}
          />

          {/* Dados Cadastrais */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Nome Completo *
              </label>
              <div className="relative">
                <User className="w-3.5 h-3.5 absolute left-3 top-3 text-zinc-400" />
                <input
                  type="text"
                  required
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  disabled={loadingSalvar}
                  placeholder="Ex: Maria Aparecida"
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-hidden focus:ring-1 focus:ring-zinc-400 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                E-mail Institucional *
              </label>
              <div className="relative">
                <Mail className="w-3.5 h-3.5 absolute left-3 top-3 text-zinc-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loadingSalvar}
                  placeholder="usuario@santoandre.sp.gov.br"
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-hidden focus:ring-1 focus:ring-zinc-400 transition"
                />
              </div>
            </div>
          </div>

          {/* Função Institucional */}
          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
              Função Institucional *
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                disabled={loadingSalvar}
                onClick={() => setRole('ROLE_ENCARREGADA')}
                className={`p-3 rounded-xl border text-left flex items-center gap-2.5 transition cursor-pointer ${
                  role === 'ROLE_ENCARREGADA'
                    ? 'border-zinc-900 dark:border-zinc-100 bg-zinc-50 dark:bg-zinc-800/60 ring-1 ring-zinc-900 dark:ring-zinc-100'
                    : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400'
                }`}
              >
                <div className="w-7 h-7 rounded-lg bg-[#E1F3FE] dark:bg-sky-950/40 text-[#1F6C9F] dark:text-sky-300 flex items-center justify-center shrink-0">
                  <Users2 className="w-3.5 h-3.5" />
                </div>
                <span className="font-bold text-xs text-zinc-900 dark:text-zinc-100 truncate">
                  Encarregada da Secretaria
                </span>
              </button>

              <button
                type="button"
                disabled={loadingSalvar}
                onClick={() => setRole('ROLE_ADMIN')}
                className={`p-3 rounded-xl border text-left flex items-center gap-2.5 transition cursor-pointer ${
                  role === 'ROLE_ADMIN'
                    ? 'border-zinc-900 dark:border-zinc-100 bg-zinc-50 dark:bg-zinc-800/60 ring-1 ring-zinc-900 dark:ring-zinc-100'
                    : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400'
                }`}
              >
                <div className="w-7 h-7 rounded-lg bg-[#FBF3DB] dark:bg-amber-950/40 text-[#956400] dark:text-amber-300 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-3.5 h-3.5" />
                </div>
                <span className="font-bold text-xs text-zinc-900 dark:text-zinc-100 truncate">
                  Administrador Geral
                </span>
              </button>
            </div>

            {/* Escolas com Acesso (apenas para Encarregada) */}
            {role === 'ROLE_ENCARREGADA' && (
              <div className="mt-2.5 space-y-2 p-3 rounded-xl border border-zinc-200/90 dark:border-zinc-800 bg-zinc-50/40 dark:bg-zinc-900/20 animate-in fade-in duration-150">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                    Escolas de Atuação *
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleSelecionarTodas}
                      disabled={loadingSalvar}
                      className="text-[11px] text-zinc-900 dark:text-zinc-100 hover:underline font-semibold cursor-pointer"
                    >
                      Marcar Todas
                    </button>
                    <span className="text-zinc-300 dark:text-zinc-700">|</span>
                    <button
                      type="button"
                      onClick={handleLimparEscolas}
                      disabled={loadingSalvar}
                      className="text-[11px] text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300 hover:underline cursor-pointer"
                    >
                      Limpar
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {escolas.map((esc) => {
                    const selecionada = escolasSelecionadasIds.includes(esc.id);
                    return (
                      <div
                        key={esc.id}
                        onClick={() => {
                          if (loadingSalvar) return;
                          handleToggleEscola(esc.id);
                        }}
                        className={`p-2 rounded-xl border transition flex items-center justify-between select-none cursor-pointer ${
                          selecionada
                            ? 'border-zinc-900 dark:border-zinc-100 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-medium'
                            : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:border-zinc-300'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold shrink-0 ${
                              selecionada
                                ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900'
                                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
                            }`}
                          >
                            {esc.sigla}
                          </span>
                          <span className="text-xs truncate font-medium">{esc.nome}</span>
                        </div>

                        <div
                          className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition ${
                            selecionada
                              ? 'bg-zinc-900 dark:bg-zinc-100 border-zinc-900 dark:border-zinc-100 text-white dark:text-zinc-900'
                              : 'border-zinc-300 dark:border-zinc-700'
                          }`}
                        >
                          {selecionada && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Redefinição de Senha */}
          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Redefinir Senha de Acesso (Opcional)
            </label>
            <div className="relative">
              <Lock className="w-3.5 h-3.5 absolute left-3 top-3 text-zinc-400" />
              <input
                type={mostrarSenha ? 'text' : 'password'}
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                disabled={loadingSalvar}
                placeholder="Deixe em branco para manter a senha atual"
                className="w-full pl-9 pr-10 py-2 text-xs rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-hidden focus:ring-1 focus:ring-zinc-400 transition"
              />
              <button
                type="button"
                disabled={loadingSalvar}
                onClick={() => setMostrarSenha(!mostrarSenha)}
                className="absolute right-3 top-2.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer"
                title={mostrarSenha ? 'Ocultar senha' : 'Exibir senha'}
              >
                {mostrarSenha ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Rodapé do Formulário */}
          <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loadingSalvar}
              className="px-4 py-2 rounded-xl text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 font-medium transition cursor-pointer text-xs"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={loadingSalvar}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-zinc-900 font-bold transition cursor-pointer disabled:opacity-50 text-xs shadow-xs"
            >
              {loadingSalvar && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>{loadingSalvar ? 'Salvando...' : 'Salvar Alterações'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
