'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { DirecionamentoEscolasView } from '@/components/DirecionamentoEscolasView';

export default function DirecionamentoPage() {
  const router = useRouter();
  const {
    usuarioLogado,
    escolas,
    cursos,
    turmas,
    matriculas,
    tempoRestanteMin,
    loading,
    setEscolaSelecionada,
    handleLogout,
  } = useApp();

  useEffect(() => {
    if (!loading && !usuarioLogado) {
      router.replace('/login');
    }
  }, [loading, usuarioLogado, router]);

  if (loading || !usuarioLogado) {
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
    router.push('/turmas');
  };

  return (
    <DirecionamentoEscolasView
      usuarioLogado={usuarioLogado}
      escolas={escolas}
      cursos={cursos}
      turmas={turmas}
      matriculas={matriculas}
      tempoRestanteMin={tempoRestanteMin}
      onSelecionarEscola={handleSelecionarEscola}
      onLogout={handleLogout}
    />
  );
}
