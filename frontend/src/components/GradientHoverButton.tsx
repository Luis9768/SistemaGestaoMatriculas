import React from 'react';

export type GradientPreset = 'cultural' | 'aurora' | 'sunset' | 'cyber';
export type GradientDirection = 'right-to-left' | 'left-to-right';

interface GradientHoverButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  loadingText?: string;
  preset?: GradientPreset;
  direction?: GradientDirection;
  children: React.ReactNode;
}

const PRESET_GRADIENTS: Record<GradientPreset, { bg: string; glow: string }> = {
  // Aurora Elétrica (Azul Cobalto -> Púrpura -> Rosa Choque)
  aurora: {
    bg: 'from-[#2563EB] via-[#7C3AED] to-[#EC4899]',
    glow: 'from-[#2563EB] via-[#7C3AED] to-[#EC4899]',
  },
  // Cores Artísticas das Escolas Livres (Teal -> Violeta -> Carmim)
  cultural: {
    bg: 'from-[#0D9488] via-[#6366F1] to-[#E11D48]',
    glow: 'from-[#0D9488] via-[#6366F1] to-[#E11D48]',
  },
  // Pôr do Sol Cultural (Laranja -> Magenta -> Roxo Profundo)
  sunset: {
    bg: 'from-[#F97316] via-[#E11D48] to-[#7C3AED]',
    glow: 'from-[#F97316] via-[#E11D48] to-[#7C3AED]',
  },
  // Neon Cyber (Ciano -> Azul Céu -> Violeta)
  cyber: {
    bg: 'from-[#06B6D4] via-[#3B82F6] to-[#8B5CF6]',
    glow: 'from-[#06B6D4] via-[#3B82F6] to-[#8B5CF6]',
  },
};

export function GradientHoverButton({
  loading = false,
  loadingText = 'Carregando...',
  preset = 'aurora',
  direction = 'right-to-left',
  children,
  className = '',
  disabled,
  ...props
}: GradientHoverButtonProps) {
  const gradient = PRESET_GRADIENTS[preset] || PRESET_GRADIENTS.aurora;
  const isDisabled = disabled || loading;

  // Direção do deslocamento: direita para esquerda (translate-x-full -> 0)
  const initialTranslate = direction === 'right-to-left' ? 'translate-x-full' : '-translate-x-full';

  return (
    <div className="relative group w-full">
      {/* 1. Efeito Aura / Glow Difuso Externo */}
      {!isDisabled && (
        <div
          className={`absolute -inset-0.5 rounded-xl bg-gradient-to-r ${gradient.glow} opacity-0 group-hover:opacity-75 blur-md transition-opacity duration-500 pointer-events-none`}
          aria-hidden="true"
        />
      )}

      {/* 2. Botão Principal com Base Preta Sólida */}
      <button
        disabled={isDisabled}
        className={`relative w-full py-3 rounded-xl font-bold text-xs sm:text-sm text-white shadow-xs transition-all duration-300 active:scale-[0.98] cursor-pointer flex items-center justify-center space-x-2 overflow-hidden bg-[#18181B] disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
        {...props}
      >
        {/* 3. Camada do Degradê que Desliza Suavemente da Direita para a Esquerda */}
        {!isDisabled && (
          <div
            className={`absolute -inset-1 w-[calc(100%+8px)] h-[calc(100%+8px)] bg-gradient-to-r ${gradient.bg} ${initialTranslate} group-hover:translate-x-0 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] pointer-events-none`}
            aria-hidden="true"
          />
        )}

        {/* 4. Conteúdo textual e ícone sobrepostos com z-10 */}
        <div className="relative z-10 flex items-center justify-center space-x-2 pointer-events-none">
          {loading ? (
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>{loadingText}</span>
            </div>
          ) : (
            children
          )}
        </div>
      </button>
    </div>
  );
}
