'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import { AppLayout } from '@/components/AppLayout';
import { ImportacaoLoteView } from '@/components/ImportacaoLoteView';

export default function ImportacaoPage() {
  const { handleUploadPlanilha } = useApp();

  return (
    <AppLayout>
      <ImportacaoLoteView onUploadPlanilha={handleUploadPlanilha} />
    </AppLayout>
  );
}
