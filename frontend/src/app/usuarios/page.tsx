'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { AppLayout } from '@/components/AppLayout';
import { ModalCadastrarUsuario } from '@/components/ModalCadastrarUsuario';
import { api, Usuario } from '@/lib/api';
import {
  Users2,
  GraduationCap,
  ShieldCheck,
  Plus,
  RefreshCw,
  Mail,
  CheckCircle2,
  XCircle,
  BookOpen,
} from 'lucide-react';

export default function UsuariosPage() {
  const router = useRouter();
  const { usuarioLogado } = useApp();
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroRole, setFiltroRole] = useState<'TODOS' | 'ROLE_ADMIN' | 'ROLE_ENCARREGADA'>('TODOS');
  const [modalAberto, setModalAberto] = useState(false);
  const [atualizandoStatusId, setAtualizandoStatusId] = useState<number | null>(null);

  useEffect(() => {
    if (usuarioLogado && usuarioLogado.role !== 'ROLE_ADMIN') {
      router.replace('/panorama');
    }
  }, [usuarioLogado, router]);

  useEffect(() => {
    carregarUsuarios();
  }, []);

  const carregarUsuarios = async () => {
    try {
      setLoading(true);
      const data = await api.getUsuarios();
      setUsuarios(data);
    } catch (e: any) {
      console.error('Erro ao carregar lista de usuários:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleAlternarStatus = async (id: number) => {
    try {
      setAtualizandoStatusId(id);
      await api.alternarStatusUsuario(id);
      await carregarUsuarios();
    } catch (err: any) {
      alert(err.message || 'Erro ao alterar status do usuário');
    } finally {
      setAtualizandoStatusId(null);
    }
  };

  const usuariosFiltrados = usuarios.filter((u) => {
    if (filtroRole === 'TODOS') return true;
    return u.role === filtroRole;
  });

  const totalAdmins = usuarios.filter((u) => u.role === 'ROLE_ADMIN').length;
  const totalEncarregadas = usuarios.filter((u) => u.role === 'ROLE_ENCARREGADA').length;

  if (usuarioLogado && usuarioLogado.role !== 'ROLE_ADMIN') {
    return (
      <AppLayout>
        <div className="py-20 text-center text-xs text-slate-500">
          Redirecionando... Acesso restrito à Coordenação Geral.
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        
        {/* Cabeçalho da Página */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 dark:border-slate-800/80 pb-6">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                Equipe & Docentes
              </h1>
              <span className="px-2 py-0.5 rounded-md text-[11px] font-mono bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                {usuarios.length} cadastrado(s)
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Gerencie os professores com atribuição multidisciplinar de turmas e as encarregadas das Escolas Livres
            </p>
          </div>

          {usuarioLogado?.role === 'ROLE_ADMIN' && (
            <button
              onClick={() => setModalAberto(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 rounded-xl font-semibold text-xs transition cursor-pointer shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Cadastrar Novo Usuário</span>
            </button>
          )}
        </div>

        {/* Barra de Filtros e Segmentos */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900/80 p-1 rounded-xl text-xs w-fit">
            <button
              onClick={() => setFiltroRole('TODOS')}
              className={`px-3.5 py-1.5 rounded-lg font-medium transition cursor-pointer flex items-center gap-1.5 ${
                filtroRole === 'TODOS'
                  ? 'bg-white dark:bg-[#151C2C] text-slate-900 dark:text-white shadow-2xs font-semibold'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              <span>Todos</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-200/60 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-mono">
                {usuarios.length}
              </span>
            </button>

            <button
              onClick={() => setFiltroRole('ROLE_ADMIN')}
              className={`px-3.5 py-1.5 rounded-lg font-medium transition cursor-pointer flex items-center gap-1.5 ${
                filtroRole === 'ROLE_ADMIN'
                  ? 'bg-white dark:bg-[#151C2C] text-slate-900 dark:text-white shadow-2xs font-semibold'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Administradores</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-200/60 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-mono">
                {totalAdmins}
              </span>
            </button>

            <button
              onClick={() => setFiltroRole('ROLE_ENCARREGADA')}
              className={`px-3.5 py-1.5 rounded-lg font-medium transition cursor-pointer flex items-center gap-1.5 ${
                filtroRole === 'ROLE_ENCARREGADA'
                  ? 'bg-white dark:bg-[#151C2C] text-slate-900 dark:text-white shadow-2xs font-semibold'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              <Users2 className="w-3.5 h-3.5" />
              <span>Encarregadas</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-200/60 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-mono">
                {totalEncarregadas}
              </span>
            </button>
          </div>

          <button
            onClick={carregarUsuarios}
            className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 flex items-center gap-1.5 transition cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Atualizar Lista</span>
          </button>
        </div>

        {/* Listagem de Usuários */}
        {loading ? (
          <div className="py-20 text-center text-slate-400 dark:text-slate-500 text-xs flex flex-col items-center justify-center gap-2">
            <RefreshCw className="w-5 h-5 animate-spin text-slate-400" />
            <span>Carregando equipe escolar...</span>
          </div>
        ) : usuariosFiltrados.length === 0 ? (
          <div className="py-16 text-center text-slate-400 dark:text-slate-500 bg-white dark:bg-[#0B0F19] rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 text-xs space-y-3">
            <Users2 className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600" />
            <div className="font-medium text-slate-700 dark:text-slate-300">
              Nenhum usuário encontrado com os filtros atuais.
            </div>
            <p className="text-[11px] max-w-sm mx-auto text-slate-400">
              Utilize o botão acima para cadastrar novas encarregadas das Escolas Livres.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {usuariosFiltrados.map((u) => {
              const isEncarregada = u.role === 'ROLE_ENCARREGADA';
              const isAdmin = u.role === 'ROLE_ADMIN';

              return (
                <div
                  key={u.id}
                  className="bg-white dark:bg-[#0D1220] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 hover:border-slate-300 dark:hover:border-slate-700 transition shadow-2xs space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    {/* Topo do Card */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-sm border border-slate-200/80 dark:border-slate-700/60 flex items-center justify-center shrink-0">
                          {u.nome.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 dark:text-white text-sm">
                            {u.nome}
                          </div>
                          <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-xs mt-0.5">
                            <Mail className="w-3 h-3 text-slate-400" />
                            <span>{u.email}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {isEncarregada && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-sky-50 text-sky-700 border border-sky-200/60 dark:bg-sky-950/30 dark:text-sky-300 dark:border-sky-800/40">
                            Encarregada
                          </span>
                        )}
                        {isAdmin && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700">
                            Administrador
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Vínculo de Encarregada */}
                    {isEncarregada && (
                      <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#070A11] border border-slate-200/70 dark:border-slate-800/70 text-xs text-slate-600 dark:text-slate-400">
                        <strong className="text-slate-500 block text-[10px] uppercase tracking-wider mb-0.5">
                          Escola de Atuação
                        </strong>
                        <span className="font-medium text-slate-800 dark:text-slate-200">
                          {u.escolaNome ? `[${u.escolaSigla}] ${u.escolaNome}` : 'Geral'}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Rodapé do Card com Status e Ações */}
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800/70 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5">
                      {u.ativo ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Ativo</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-400">
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Desativado</span>
                        </span>
                      )}
                    </div>

                    {!isAdmin && (
                      <button
                        onClick={() => handleAlternarStatus(u.id)}
                        disabled={atualizandoStatusId === u.id}
                        className="text-xs text-slate-500 hover:text-slate-900 dark:hover:text-white underline cursor-pointer disabled:opacity-50"
                      >
                        {u.ativo ? 'Desativar acesso' : 'Reativar acesso'}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* Modal de Cadastro de Professor / Encarregada */}
      <ModalCadastrarUsuario
        isOpen={modalAberto}
        onClose={() => setModalAberto(false)}
        onUsuarioCadastrado={() => {
          carregarUsuarios();
        }}
      />
    </AppLayout>
  );
}
