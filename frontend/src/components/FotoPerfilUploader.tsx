'use client';

import React, { useRef, useState } from 'react';
import { Camera, Trash2, Link as LinkIcon, Image as ImageIcon } from 'lucide-react';

interface FotoPerfilUploaderProps {
  fotoUrl: string;
  onChangeFotoUrl: (url: string) => void;
  nomeUsuario: string;
  disabled?: boolean;
}

export function FotoPerfilUploader({
  fotoUrl,
  onChangeFotoUrl,
  nomeUsuario,
  disabled = false,
}: FotoPerfilUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [mostrarCampoUrl, setMostrarCampoUrl] = useState(false);
  const [erroUpload, setErroUpload] = useState<string | null>(null);

  const inicial = nomeUsuario?.trim() ? nomeUsuario.trim().charAt(0).toUpperCase() : 'U';

  const handleArquivoSelecionado = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErroUpload(null);

    // Limite de 2.5 MB para imagens em base64
    if (file.size > 2.5 * 1024 * 1024) {
      setErroUpload('A imagem deve ter no máximo 2.5 MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        onChangeFotoUrl(dataUrl);
      }
    };
    reader.onerror = () => {
      setErroUpload('Erro ao processar imagem selecionada.');
    };
    reader.readAsDataURL(file);

    // Reseta o input para permitir selecionar o mesmo arquivo novamente
    e.target.value = '';
  };

  const handleRemoverFoto = () => {
    onChangeFotoUrl('');
    setErroUpload(null);
  };

  return (
    <div className="space-y-2 p-3 rounded-xl border border-zinc-200/90 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-900/40">
      <div className="flex items-center justify-between">
        <label className="font-semibold text-zinc-700 dark:text-zinc-300 text-xs block">
          Foto de Perfil
        </label>
        <button
          type="button"
          disabled={disabled}
          onClick={() => setMostrarCampoUrl((prev) => !prev)}
          className="text-[11px] text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200 inline-flex items-center gap-1 cursor-pointer disabled:opacity-40"
        >
          <LinkIcon className="w-3 h-3" />
          <span>{mostrarCampoUrl ? 'Ocultar URL' : 'Inserir Link'}</span>
        </button>
      </div>

      <div className="flex items-center gap-3.5">
        {/* Preview Circular da Foto */}
        <div className="w-14 h-14 rounded-full border border-zinc-200 dark:border-zinc-700/80 bg-white dark:bg-zinc-800 flex items-center justify-center shrink-0 overflow-hidden">
          {fotoUrl ? (
            <img
              src={fotoUrl}
              alt={`Foto de ${nomeUsuario || 'usuário'}`}
              className="w-full h-full object-cover rounded-full"
            />
          ) : (
            <span className="font-sans font-bold text-lg text-zinc-700 dark:text-zinc-200 select-none">
              {inicial}
            </span>
          )}
        </div>

        {/* Controles de Ação */}
        <div className="flex-1 flex flex-wrap items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            disabled={disabled}
            onChange={handleArquivoSelecionado}
            className="hidden"
          />

          <button
            type="button"
            disabled={disabled}
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700/60 text-zinc-700 dark:text-zinc-200 text-xs font-semibold transition cursor-pointer disabled:opacity-50"
          >
            <Camera className="w-3.5 h-3.5 text-zinc-400" />
            <span>{fotoUrl ? 'Alterar Foto' : 'Carregar Foto'}</span>
          </button>

          {fotoUrl && (
            <button
              type="button"
              disabled={disabled}
              onClick={handleRemoverFoto}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-medium text-rose-600 hover:text-rose-700 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition cursor-pointer disabled:opacity-50"
            >
              <Trash2 className="w-3 h-3" />
              <span>Remover</span>
            </button>
          )}
        </div>
      </div>

      {/* Campo Opcional para Inserir URL Direta */}
      {mostrarCampoUrl && (
        <div className="pt-1.5 animate-in fade-in duration-150">
          <div className="relative">
            <input
              type="url"
              disabled={disabled}
              placeholder="https://exemplo.com/foto.jpg"
              value={fotoUrl}
              onChange={(e) => onChangeFotoUrl(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-hidden focus:ring-1 focus:ring-zinc-400"
            />
            <ImageIcon className="w-3.5 h-3.5 text-zinc-400 absolute left-2.5 top-2" />
          </div>
        </div>
      )}

      {erroUpload && (
        <p className="text-xs text-rose-600 dark:text-rose-400 font-medium pt-1">
          {erroUpload}
        </p>
      )}
    </div>
  );
}
