'use client';

import React, { useState, useEffect } from 'react';
import { api, Escola, CadastrarUsuarioPayload } from '@/lib/api';
import { useApp } from '@/context/AppContext';
import { X, ShieldCheck, AlertCircle, Building2, Mail, Lock, User, Users2, Sparkles } from 'lucide-react';

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
  const { mostrarFeedback } = useApp();
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [role, setRole] = useState<'ROLE_ADMIN' | 'ROLE_ENCARREGADA'>('ROLE_ENCARREGADA');
  const [escolaId, setEscolaId] = useState<number | ''>('');

  const [escolas, setEscolas] = useState<Escola[]>([]);
  const [escolasIds, setEscolasIds] = useState<number[]>([]);
  const [loadingDados, setLoadingDados] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      carregarEscolas();
      limparFormulario();
    }
  }, [isOpen]);

  const limparFormulario = () => {
    setNome('');
    setEmail('');
    setSenha('');
    setRole('ROLE_ENCARREGADA');
    setEscolaId('');
    setEscolasIds([]);
    setErro(null);
  };

  const carregarEscolas = async () => {
    try {
      setLoadingDados(true);
      const listaEscolas = await api.getEscolas();
      setEscolas(listaEscolas);
      if (listaEscolas.length > 0 && escolasIds.length === 0) {
        setEscolasIds([listaEscolas[0].id]);
        setEscolaId(listaEscolas[0].id);
      }
    } catch {
      setErro('Erro ao carregar lista de escolas.');
    } finally {
      setLoadingDados(false);
    }
  };

  const handleToggleEscola = (id: number) => {
    setEscolasIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro(null);

    if (!nome.trim() || !email.trim() || !senha.trim()) {
      const msg = 'Preencha todos os campos obrigatórios (nome, e-mail e senha).';
      setErro(msg);
      mostrarFeedback('erro', msg);
      return;
    }

    if (role === 'ROLE_ENCARREGADA' && escolasIds.length === 0) {
      const msg = 'Selecione pelo menos uma escola de atuação para a encarregada.';
      setErro(msg);
      mostrarFeedback('erro', msg);
      return;
    }

    try {
      setSalvando(true);
      const payload: CadastrarUsuarioPayload = {
        nome: nome.trim(),
        email: email.trim().toLowerCase(),
        senha: senha.trim(),
        role: role,
        escolaId: role === 'ROLE_ENCARREGADA' && escolasIds.length > 0 ? escolasIds[0] : undefined,
        escolasIds: role === 'ROLE_ENCARREGADA' ? escolasIds : [],
      };

      await api.cadastrarUsuario(payload);

      const escolasNomes = role === 'ROLE_ENCARREGADA'
        ? escolas.filter((e) => escolasIds.includes(e.id)).map((e) => e.sigla).join(', ')
        : '';

      const perfilDescricao = role === 'ROLE_ADMIN'
        ? 'Administrador(a) da Coordenação Geral'
        : `Encarregada da Secretaria [${escolasNomes}]`;

      mostrarFeedback(
        'sucesso',
        `Cadastro realizado com sucesso! ${nome.trim()} foi cadastrado(a) como ${perfilDescricao}. O acesso já está liberado para login com ${email.trim().toLowerCase()}.`
      );

      if (onUsuarioCadastrado) {
        onUsuarioCadastrado();
      }
      onClose();
    } catch (err: any) {
      const msgErro = err.message || 'Falha ao cadastrar usuário. Verifique se o e-mail já está em uso.';
      setErro(msgErro);
      mostrarFeedback('erro', `Erro no cadastro: ${msgErro}`);
    } finally {
      setSalvando(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-3 sm:p-5 overflow-y-auto"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white dark:bg-[#121214] rounded-2xl shadow-xl border border-slate-200/90 dark:border-[#27272a] max-w-md w-full overflow-hidden animate-in fade-in duration-150">
        {/* Cabeçalho do Modal */}
        <div className="p-6 border-b border-slate-100 dark:border-[#27272a]/80 bg-white dark:bg-[#121214] flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/60 dark:border-amber-800/40 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold tracking-tight text-slate-900 dark:text-white">
                Cadastrar Novo Usuário
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Defina o perfil institucional (Administrador ou Encarregada)
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

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {erro && (
            <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{erro}</span>
            </div>
          )}

          {/* Seleção do Perfil de Acesso */}
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
              Perfil de Acesso *
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setRole('ROLE_ENCARREGADA')}
                className={`p-3 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between gap-1.5 ${
                  role === 'ROLE_ENCARREGADA'
                    ? 'border-sky-500 bg-sky-50/60 dark:bg-sky-950/30 ring-1 ring-sky-500/50'
                    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`font-bold text-xs ${role === 'ROLE_ENCARREGADA' ? 'text-sky-900 dark:text-sky-300' : 'text-slate-800 dark:text-slate-200'}`}>
                    Encarregada
                  </span>
                  <Users2 className={`w-4 h-4 ${role === 'ROLE_ENCARREGADA' ? 'text-sky-600 dark:text-sky-400' : 'text-slate-400'}`} />
                </div>
                <p className="text-[10.5px] text-slate-500 dark:text-slate-400 leading-tight">
                  Secretaria de escola livre específica
                </p>
              </button>

              <button
                type="button"
                onClick={() => setRole('ROLE_ADMIN')}
                className={`p-3 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between gap-1.5 ${
                  role === 'ROLE_ADMIN'
                    ? 'border-amber-500 bg-amber-50/60 dark:bg-amber-950/30 ring-1 ring-amber-500/50'
                    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`font-bold text-xs ${role === 'ROLE_ADMIN' ? 'text-amber-900 dark:text-amber-300' : 'text-slate-800 dark:text-slate-200'}`}>
                    Administrador
                  </span>
                  <ShieldCheck className={`w-4 h-4 ${role === 'ROLE_ADMIN' ? 'text-amber-600 dark:text-amber-400' : 'text-slate-400'}`} />
                </div>
                <p className="text-[10.5px] text-slate-500 dark:text-slate-400 leading-tight">
                  Coordenação Geral (Acesso Global)
                </p>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
              Nome Completo *
            </label>
            <div className="relative">
              <User className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                required
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Ex: Maria Aparecida da Silva"
                className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
              E-mail Institucional *
            </label>
            <div className="relative">
              <Mail className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={role === 'ROLE_ADMIN' ? 'coord.geral@santoandre.sp.gov.br' : 'encarregada@santoandre.sp.gov.br'}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
              Senha Provisória *
            </label>
            <div className="relative">
              <Lock className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
              <input
                type="password"
                required
                minLength={5}
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="Mínimo de 5 caracteres"
                className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400"
              />
            </div>
          </div>

          {/* Seleção de Escola (apenas para Encarregada) */}
          {role === 'ROLE_ENCARREGADA' ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Escolas de Atuação & Gestão *
                </label>
                <button
                  type="button"
                  onClick={() => setEscolasIds(escolas.map((e) => e.id))}
                  className="text-[10px] text-indigo-600 dark:text-indigo-400 hover:underline font-semibold cursor-pointer"
                >
                  Marcar Todas
                </button>
              </div>

              <div className="grid grid-cols-1 gap-1.5">
                {escolas.map((esc) => {
                  const sel = escolasIds.includes(esc.id);
                  return (
                    <div
                      key={esc.id}
                      onClick={() => handleToggleEscola(esc.id)}
                      className={`p-2 rounded-xl border text-xs flex items-center justify-between cursor-pointer select-none transition ${
                        sel
                          ? 'border-indigo-600 bg-indigo-50/60 dark:bg-indigo-950/40 text-slate-900 dark:text-white font-medium'
                          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${
                          sel ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600'
                        }`}>
                          {esc.sigla}
                        </span>
                        <span>{esc.nome}</span>
                      </div>
                      <div className={`w-4 h-4 rounded border flex items-center justify-center text-[10px] ${
                        sel ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-300 dark:border-slate-700'
                      }`}>
                        {sel && '✓'}
                      </div>
                    </div>
                  );
                })}
              </div>
              <span className="text-[10px] text-slate-400 block">
                {escolasIds.length === 0 ? 'Nenhuma escola marcada.' : `${escolasIds.length} unidade(s) selecionada(s).`}
              </span>
            </div>
          ) : (
            <div className="p-3 rounded-xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-900/60 flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div className="text-[11px] text-amber-900 dark:text-amber-200 leading-tight">
                <strong>Acesso Global / Coordenação:</strong> Usuários com perfil Administrador têm acesso unificado a todas as 4 escolas (ELT, ELD, ELCV e EMIA) e controle total de turmas e matrículas.
              </div>
            </div>
          )}

          {/* Botões de Ação */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium transition cursor-pointer text-xs"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={salvando || loadingDados}
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 text-white font-medium transition cursor-pointer disabled:opacity-50 text-xs shadow-xs"
            >
              {salvando
                ? 'Salvando...'
                : role === 'ROLE_ADMIN'
                ? 'Cadastrar Administrador'
                : 'Cadastrar Encarregada'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
