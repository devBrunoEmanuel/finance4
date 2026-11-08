// Traduz as mensagens de erro mais comuns do Supabase Auth para português.
// Qualquer mensagem não reconhecida é devolvida como veio, para não esconder o erro real.
export function authErrorMessage(message: string): string {
  const m = message.toLowerCase();
  if (m.includes("invalid login credentials")) {
    return "E-mail ou senha incorretos.";
  }
  if (m.includes("email not confirmed")) {
    return "E-mail ainda não confirmado. Verifique sua caixa de entrada.";
  }
  if (m.includes("user already registered")) {
    return "Já existe uma conta com este e-mail.";
  }
  if (m.includes("rate limit") || m.includes("too many")) {
    return "Muitas tentativas. Aguarde um pouco e tente novamente.";
  }
  if (m.includes("failed to fetch") || m.includes("network request failed")) {
    return "Sem conexão com o servidor. Verifique sua internet e tente novamente.";
  }
  return message;
}
