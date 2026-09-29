'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import { AppLayout } from '@/components/AppLayout';
import { PortalProfessorasView } from '@/components/PortalProfessorasView';

export default function CursosPage() {
  const {
    cursos,
    escolas,
    escolaSelecionada,
    handleSalvarCursoComDisciplinas,
    abrirModalNovaTurma,
  } = useApp();

  return (
    <AppLayout>
      <PortalProfessorasView
        cursos={cursos}
        escolas={escolas}
        escolaSelecionada={escolaSelecionada}
        onSalvarCurso={handleSalvarCursoComDisciplinas}
        onAbrirNovaTurma={(cursoId) => abrirModalNovaTurma(cursoId)}
      />
    </AppLayout>
  );
}
