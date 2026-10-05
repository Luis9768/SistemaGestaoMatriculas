'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { api } from '@/lib/api';
import { DirecionamentoEscolasView } from '@/components/DirecionamentoEscolasView';
import { PerfilAlunoModal } from '@/components/PerfilAlunoModal';

export default function DirecionamentoPage() {
  const router = useRouter();
  const {
    usuarioLogado,
    escolas,
    cursos,
    turmas,
    tempoRestanteMin,
    loading,
    setEscolaSelecionada,
    handleLogout,
    showModalPerfil,
    setShowModalPerfil,
    perfilAlunoId,
    carregarMatriculas,
  } = useApp();

  const userEfetivo = usuarioLogado || (typeof window !== 'undefined' ? api.getUsuarioSalvo() : null);

  useEffect(() => {
    if (!loading && !userEfetivo) {
      router.replace('/login');
    }
  }, [loading, userEfetivo, router]);

  if (loading || !userEfetivo) {
    return (
      <div className="min-h-screen bg-[#FAF9F7] dark:bg-[#090D16] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-amber-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            Carregando Hub de Escolas...
          </span>
        </div>
      </div>
    );
  }

  const handleSelecionarEscola = (escolaId: number) => {
    setEscolaSelecionada(escolaId);
    router.push('/panorama');
  };

  return (
    <>
      <DirecionamentoEscolasView
        usuarioLogado={userEfetivo}
        escolas={escolas}
        cursos={cursos}
        turmas={turmas}
        tempoRestanteMin={tempoRestanteMin}
        onSelecionarEscola={handleSelecionarEscola}
        onLogout={handleLogout}
      />

      {/* Modal Dossiê do Estudante acionável pela Central de Notificações */}
      {showModalPerfil && perfilAlunoId && (
        <PerfilAlunoModal
          alunoId={perfilAlunoId}
          isOpen={showModalPerfil}
          onClose={() => setShowModalPerfil(false)}
          onUpdate={() => {
            carregarMatriculas();
          }}
        />
      )}
    </>
  );
}
