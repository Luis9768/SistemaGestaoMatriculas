'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import { AppLayout } from '@/components/AppLayout';
import { RelatorioPrefeituraView } from '@/components/RelatorioPrefeituraView';

export default function RelatoriosPage() {
  const { escolaSelecionada, abrirModalPerfil } = useApp();

  return (
    <AppLayout>
      <RelatorioPrefeituraView
        escolaId={escolaSelecionada}
        onOpenPerfilAluno={abrirModalPerfil}
      />
    </AppLayout>
  );
}
