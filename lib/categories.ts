// Categorias fixas do aplicativo
export const CATEGORIES = [
  "Salário",
  "Freelance",
  "Aluguel",
  "Água",
  "Luz",
  "Internet",
  "Telefone",
  "Alimentação",
  "Transporte",
  "Saúde",
  "Educação",
  "Lazer",
  "Vestuário",
  "Diversos",
] as const;

export type Category = (typeof CATEGORIES)[number];

