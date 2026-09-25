'use client';

import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Download,
  Upload,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  FileCheck,
} from 'lucide-react';
import { ImportacaoResultado, api } from '@/lib/api';

interface ImportacaoLoteViewProps {
  onUploadPlanilha: (file: File) => Promise<ImportacaoResultado>;
}

export function ImportacaoLoteView({ onUploadPlanilha }: ImportacaoLoteViewProps) {
  const [arquivo, setArquivo] = useState<File | null>(null);
  const [importando, setImportando] = useState(false);
  const [resultado, setResultado] = useState<ImportacaoResultado | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!arquivo) return;

    try {
      setImportando(true);
      setErro(null);
      const res = await onUploadPlanilha(arquivo);
      setResultado(res);
    } catch (err: any) {
      setErro(err.message || 'Falha ao processar arquivo.');
    } finally {
      setImportando(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div>
        <h2 className="text-xl font-black text-slate-900">
          Automação de Importação em Lote
        </h2>
        <p className="text-xs text-slate-500 mt-1 max-w-xl">
          Substitua digitação manual. Envie planilhas Excel (.xlsx) ou CSV com as colunas padronizadas para alimentar o sistema automaticamente com deduplicação por CPF.
        </p>
      </div>

      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        {/* Bloco Modelo CSV */}
        <div className="flex flex-col sm:flex-row items-center justify-between p-5 bg-slate-50 border border-slate-200 rounded-2xl gap-4">
          <div>
            <h3 className="text-xs font-bold text-slate-800">Planilha Modelo Padronizada</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Cabeçalhos aceitos: Nome, CPF, Email, Telefone, CodigoTurma, CanalOrigem.
            </p>
          </div>
          <a
            href={api.downloadModeloCsvUrl()}
            download="modelo_matriculas.csv"
            className="px-4 py-2 bg-white border border-slate-300 hover:bg-slate-100 text-slate-800 text-xs font-bold rounded-xl flex items-center space-x-1.5 shadow-2xs whitespace-nowrap cursor-pointer transition"
          >
            <Download className="w-4 h-4 text-blue-600" />
            <span>Baixar Modelo CSV</span>
          </a>
        </div>

        {erro && (
          <div className="p-4 bg-rose-50 border border-rose-300 text-rose-800 text-xs rounded-xl flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{erro}</span>
          </div>
        )}

        {/* Área de Seleção de Arquivo */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-3xl p-8 text-center transition-colors bg-slate-50/50">
            <FileSpreadsheet className="w-10 h-10 text-slate-400 mx-auto mb-3" />
            <label className="block text-sm font-bold text-slate-800 cursor-pointer">
              <span>{arquivo ? arquivo.name : 'Clique para selecionar o arquivo (.xlsx, .xls ou .csv)'}</span>
              <input
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={(e) => setArquivo(e.target.files?.[0] || null)}
                className="hidden"
              />
            </label>
            <p className="text-xs text-slate-400 mt-1">Formatos aceitos: Microsoft Excel (.xlsx, .xls) ou CSV UTF-8</p>
          </div>

          <button
            type="submit"
            disabled={importando || !arquivo}
            className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-bold text-xs rounded-xl shadow-sm transition flex items-center justify-center space-x-2 cursor-pointer"
          >
            <Upload className="w-4 h-4" />
            <span>{importando ? 'Processando e deduplicando registros...' : 'Iniciar Processamento Automático'}</span>
          </button>
        </form>

        {/* Resultado do Processamento */}
        {resultado && (
          <div className="mt-8 border-t border-slate-200 pt-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Resultado do Processamento:</h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <span className="text-[11px] text-slate-500 font-bold uppercase">Total Linhas</span>
                <p className="text-xl font-black text-slate-900 mt-1">{resultado.totalLinhas}</p>
              </div>
              <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-200">
                <span className="text-[11px] text-emerald-800 font-bold uppercase">Sucesso</span>
                <p className="text-xl font-black text-emerald-700 mt-1">{resultado.sucesso}</p>
              </div>
              <div className="bg-amber-50 p-4 rounded-2xl border border-amber-200">
                <span className="text-[11px] text-amber-800 font-bold uppercase">Duplicadas</span>
                <p className="text-xl font-black text-amber-700 mt-1">{resultado.ignoradas}</p>
              </div>
              <div className="bg-rose-50 p-4 rounded-2xl border border-rose-200">
                <span className="text-[11px] text-rose-800 font-bold uppercase">Falhas</span>
                <p className="text-xl font-black text-rose-700 mt-1">{resultado.falhas}</p>
              </div>
            </div>

            <div className="bg-[#0B0F17] text-slate-200 p-4 rounded-2xl text-xs font-mono max-h-48 overflow-y-auto space-y-1">
              {resultado.logs.map((log, idx) => (
                <div
                  key={idx}
                  className={
                    log.includes('sucesso')
                      ? 'text-emerald-400'
                      : log.includes('Ignorada')
                      ? 'text-amber-400'
                      : log.includes('Falha') || log.includes('Erro')
                      ? 'text-rose-400'
                      : 'text-slate-400'
                  }
                >
                  {log}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
