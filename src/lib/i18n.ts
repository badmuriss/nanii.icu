export type Language = 'pt' | 'en' | 'es';

export interface Translations {
  title: string;
  subtitle: string;
  placeholder: string;
  custom_placeholder: string;
  button_shorten: string;
  button_copy: string;
  copy_success: string;
  error_invalid_url: string;
  error_name_taken: string;
  error_generic: string;
  result_original: string;
  result_shortened: string;
  footer_text: string;
  language_selector: string;
}

export const translations: Record<Language, Translations> = {
  pt: {
    title: "Encurte seus links. Deixe tudo mais 'nanico'.",
    subtitle: "Transforme URLs longas em links pequenos e amigáveis com o Nani.icu",
    placeholder: "Cole seu link longo aqui...",
    custom_placeholder: "Seu nome 'nanico' (opcional)",
    button_shorten: "Encurtar",
    button_copy: "Copiar",
    copy_success: "Copiado!",
    error_invalid_url: "Opa! Parece que este não é um link válido.",
    error_name_taken: "Ah, que pena! O nome já foi escolhido.",
    error_generic: "Algo deu errado. Tente novamente!",
    result_original: "Link original:",
    result_shortened: "Link nanico:",
    footer_text: "Feito com ❤️ para deixar a web mais nanica",
    language_selector: "Selecionar idioma"
  },
  en: {
    title: "Shorten your links. Make everything 'nani'.",
    subtitle: "Transform long URLs into small and friendly links with Nani.icu",
    placeholder: "Paste your long link here...",
    custom_placeholder: "Your 'nani' name (optional)",
    button_shorten: "Shorten",
    button_copy: "Copy",
    copy_success: "Copied!",
    error_invalid_url: "Oops! It seems this is not a valid link.",
    error_name_taken: "Oh, what a shame! The name is already taken.",
    error_generic: "Something went wrong. Please try again!",
    result_original: "Original link:",
    result_shortened: "Nani link:",
    footer_text: "Made with ❤️ to make the web more nani",
    language_selector: "Select language"
  },
  es: {
    title: "Acorta tus enlaces. Haz todo más 'nanico'.",
    subtitle: "Transforma URLs largas en enlaces pequeños y amigables con Nani.icu",
    placeholder: "Pega tu enlace largo aquí...",
    custom_placeholder: "Tu nombre 'nanico' (opcional)",
    button_shorten: "Acortar",
    button_copy: "Copiar",
    copy_success: "¡Copiado!",
    error_invalid_url: "¡Uy! Parece que este no es un enlace válido.",
    error_name_taken: "¡Qué pena! El nombre ya ha sido elegido.",
    error_generic: "Algo salió mal. ¡Inténtalo de nuevo!",
    result_original: "Enlace original:",
    result_shortened: "Enlace nanico:",
    footer_text: "Hecho con ❤️ para hacer la web más nanica",
    language_selector: "Seleccionar idioma"
  }
};

export const detectBrowserLanguage = (): Language => {
  if (typeof window === 'undefined') return 'pt';
  
  const browserLang = navigator.language || navigator.languages?.[0] || 'pt';
  
  if (browserLang.startsWith('pt')) return 'pt';
  if (browserLang.startsWith('en')) return 'en';
  if (browserLang.startsWith('es')) return 'es';
  
  return 'pt'; // Default to Portuguese
};

export const getStoredLanguage = (): Language => {
  if (typeof window === 'undefined') return 'pt';
  
  const stored = localStorage.getItem('nani-language') as Language;
  return stored && ['pt', 'en', 'es'].includes(stored) ? stored : detectBrowserLanguage();
};

export const setStoredLanguage = (language: Language): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('nani-language', language);
  }
};