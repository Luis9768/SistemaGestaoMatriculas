'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import { AppLayout } from '@/components/AppLayout';
import { DiarioChamadasView } from '@/components/DiarioChamadasView';

export default function FrequenciaPage() {
  const {
    escolaSelecionada,
    turmas,
    usuarioLogado,
  } = useApp();

  return (
    <AppLayout>
      <DiarioChamadasView
        escolaId={escolaSelecionada}
        turmas={turmas}
        usuarioLogado={usuarioLogado}
      />
    </AppLayout>
  );
}
