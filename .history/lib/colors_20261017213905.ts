// theme/colors.ts

export const colors = {
  // --- Marca / Identidade Visual ---
  primary: '#b507c5',
  primaryDark: '#8a1297',
  primaryLight: '#b507c530', // Com transparência (equivalente a ~20% de opacidade)
  primaryMuted: '#b507c520', // Transparência ainda mais suave

  // --- Fundos (Backgrounds) ---
  background: '#b507c530', // Cor de fundo geral do app
  surface: '#ffffff',      // Cor de fundo de cards, modais e inputs
  surfaceMuted: '#f5f5f5', // Cor de fundo alternativa (ex: cards secundários)

  // --- Textos ---
  textPrimary: '#26002b',  // Texto principal (títulos, rótulos fortes)
  textSecondary: '#666666', // Texto secundário (datas, descrições)
  textMuted: '#888888',    // Texto inativo ou vazio (empty state)
  textInverse: '#ffffff',  // Texto sobre fundos escuros/coloridos

  // --- Semânticas / Status ---
  success: '#22c55e',      // Verde moderno para entradas/sucesso
  danger: '#e53e3e',       // Vermelho para saídas/erros
  dangerLight: '#e53e3e30', // Fundo vermelho suave (ex: botão de deletar)
  warning: '#f59e0b',      // Laranja para avisos

  // --- Bordas e Sobreposições ---
  border: '#06060630',     // Borda sutil
  borderActive: '#b507c5', // Borda quando o elemento está focado/ativo
  overlay: 'rgba(0, 0, 0, 0.5)', // Fundo escuro para modais
} as const;

// Opcional: Exporta os tipos para usar no TypeScript se necessário
export type ColorKeys = keyof typeof colors;