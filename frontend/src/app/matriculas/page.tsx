'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { AppLayout } from '@/components/AppLayout';
import { MatriculasView } from '@/components/MatriculasView';

export default function MatriculasPage() {
  const router = useRouter();
  const {
    matriculas,
    escolaSelecionada,
    handlePromoverSuplente,
    handleCancelarMatricula,
    abrirModalPerfil,
  } = useApp();

  return (
    <AppLayout>
      <MatriculasView
        matriculas={matriculas}
        escolaSelecionada={escolaSelecionada}
        onNovaMatricula={() => router.push('/inscricao')}
        onPromoverSuplente={handlePromoverSuplente}
        onCancelarMatricula={handleCancelarMatricula}
        onOpenPerfilAluno={(id) => abrirModalPerfil(id)}
      />
    </AppLayout>
  );
}
