'use client';

import React, { useState, useEffect } from 'react';
import { api, Escola, CadastrarUsuarioPayload } from '@/lib/api';
import { X, ShieldCheck, AlertCircle, Building2, Mail, Lock, User } from 'lucide-react';

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
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [escolaId, setEscolaId] = useState<number | ''>('');

  const [escolas, setEscolas] = useState<Escola[]>([]);
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
    setEscolaId('');
    setErro(null);
  };

  const carregarEscolas = async () => {
    try {
      setLoadingDados(true);
      const listaEscolas = await api.getEscolas();
      setEscolas(listaEscolas);
      if (listaEscolas.length > 0 && !escolaId) {
        setEscolaId(listaEscolas[0].id);
      }
    } catch {
      setErro('Erro ao carregar lista de escolas.');
    } finally {
      setLoadingDados(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro(null);

    if (!nome.trim() || !email.trim() || !senha.trim()) {
      setErro('Preencha todos os campos obrigatórios (nome, e-mail e senha).');
      return;
    }

    if (!escolaId) {
      setErro('Selecione a escola da qual a encarregada será responsável.');
      return;
    }

    try {
      setSalvando(true);
      const payload: CadastrarUsuarioPayload = {
        nome: nome.trim(),
        email: email.trim().toLowerCase(),
        senha: senha.trim(),
        role: 'ROLE_ENCARREGADA',
        escolaId: Number(escolaId),
      };

      await api.cadastrarUsuario(payload);
      if (onUsuarioCadastrado) {
        onUsuarioCadastrado();
      }
      onClose();
    } catch (err: any) {
      setErro(err.message || 'Falha ao cadastrar encarregada.');
    } finally {
      setSalvando(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-3 sm:p-5 overflow-y-auto"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white dark:bg-[#0B0F19] rounded-2xl shadow-xl border border-slate-200/90 dark:border-slate-800/90 max-w-md w-full overflow-hidden animate-in fade-in duration-150">
        {/* Cabeçalho do Modal */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800/80 bg-white dark:bg-[#0D1220] flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200/60 dark:border-sky-800/40 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold tracking-tight text-slate-900 dark:text-white">
                Cadastrar Encarregada
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Acesso administrativo à secretaria da Escola Livre
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

          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
              Nome Completo
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
              E-mail Institucional
            </label>
            <div className="relative">
              <Mail className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="encarregada@santoandre.sp.gov.br"
                className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
              Senha Provisória
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

          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
              Escola de Lotação
            </label>
            <div className="relative">
              <Building2 className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
              <select
                value={escolaId}
                onChange={(e) => setEscolaId(Number(e.target.value))}
                required
                className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-slate-400"
              >
                <option value="">Selecione uma Escola Livre...</option>
                {escolas.map((esc) => (
                  <option key={esc.id} value={esc.id}>
                    [{esc.sigla}] {esc.nome}
                  </option>
                ))}
              </select>
            </div>
          </div>

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
              {salvando ? 'Salvando...' : 'Cadastrar Encarregada'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
