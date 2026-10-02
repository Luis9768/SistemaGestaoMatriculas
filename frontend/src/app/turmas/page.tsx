'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { AppLayout } from '@/components/AppLayout';
import { TurmasOfertasView } from '@/components/TurmasOfertasView';

export default function TurmasPage() {
  const router = useRouter();
  const {
    turmas,
    cursos,
    escolas,
    escolaSelecionada,
    abrirModalNovaTurma,
    carregarDadosEscola,
  } = useApp();

  return (
    <AppLayout>
      <TurmasOfertasView
        turmas={turmas}
        cursos={cursos}
        escolas={escolas}
        escolaSelecionada={escolaSelecionada}
        onAbrirModalTurma={() => abrirModalNovaTurma()}
        onMatricularNaTurma={(turmaId) => {
          router.push(`/inscricao?turma=${turmaId}`);
        }}
        onTurmasAtualizadas={carregarDadosEscola}
      />
    </AppLayout>
  );
}
