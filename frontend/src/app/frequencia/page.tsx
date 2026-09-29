'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import { AppLayout } from '@/components/AppLayout';
import { DashboardAnalytics } from '@/components/DashboardAnalytics';

export default function FrequenciaPage() {
  const {
    escolaSelecionada,
    turmas,
    usuarioLogado,
    handleLogout,
    abrirModalPerfil,
  } = useApp();

  return (
    <AppLayout>
      <DashboardAnalytics
        escolaId={escolaSelecionada}
        turmas={turmas}
        usuarioLogado={usuarioLogado}
        onOpenLogin={handleLogout}
        onOpenPerfilAluno={(id) => abrirModalPerfil(id)}
      />
    </AppLayout>
  );
}
