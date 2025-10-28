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

  // Hub display
  hub_loading: string;
  hub_not_found_title: string;
  hub_not_found_description: string;
  hub_go_home: string;
  hub_created: string;
  hub_views: string;
  hub_create_own: string;
  hub_branded_link: string;

  // Hub creation
  mode_single_url: string;
  mode_link_hub: string;
  hub_title_placeholder: string;
  hub_description_placeholder: string;
  hub_custom_name_placeholder: string;
  hub_links_section: string;
  hub_add_link: string;
  hub_link_title_placeholder: string;
  hub_link_url_placeholder: string;
  hub_create_button: string;
  hub_creating: string;
  hub_title_required: string;
  hub_one_link_required: string;
  hub_invalid_url_in_link: string;
  hub_success_title: string;
  hub_success_details: string;
  hub_success_url: string;

  // Additional UI strings
  custom_name_available: string;
  hub_name_available: string;
  shortening: string;
  url_success_title: string;
  link_singular: string;
  links_plural: string;

  // Page titles
  page_title_shortener: string;
}

export const translations: Record<Language, Translations> = {
  pt: {
    title: "Seu encurtador de URLs",
    subtitle: "Transforme URLs longas em links pequenos e amigáveis com o nanii.icu",
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
    footer_text: "© {year} nanii.icu. Todos os direitos reservados.",
    language_selector: "Selecionar idioma",

    // Hub display
    hub_loading: "Carregando hub...",
    hub_not_found_title: "Hub Não Encontrado",
    hub_not_found_description: "O hub que você está procurando não existe ou foi removido.",
    hub_go_home: "Ir para Início",
    hub_created: "Criado em",
    hub_views: "visualizações",
    hub_create_own: "Crie seu próprio hub de links em",
    hub_branded_link: "nanii.icu",

    // Hub creation
    mode_single_url: "Link Único",
    mode_link_hub: "Hub de Links",
    hub_title_placeholder: "Título do hub",
    hub_description_placeholder: "Descrição do hub (opcional)",
    hub_custom_name_placeholder: "Nome personalizado do hub (opcional)",
    hub_links_section: "Links",
    hub_add_link: "Adicionar Link",
    hub_link_title_placeholder: "Título do link",
    hub_link_url_placeholder: "URL",
    hub_create_button: "Criar Hub",
    hub_creating: "Criando Hub...",
    hub_title_required: "Título do hub é obrigatório",
    hub_one_link_required: "Pelo menos um link é obrigatório",
    hub_invalid_url_in_link: "URL inválida no link",
    hub_success_title: "Hub criado com sucesso!",
    hub_success_details: "Detalhes do Hub",
    hub_success_url: "URL do Hub",

    // Additional UI strings
    custom_name_available: "✓ Este nome personalizado está disponível!",
    hub_name_available: "✓ Este nome do hub está disponível!",
    shortening: "Encurtando...",
    url_success_title: "Link encurtado com sucesso!",
    link_singular: "link",
    links_plural: "links",

    // Page titles
    page_title_shortener: "encurtador de URLs"
  },
  en: {
    title: "Your URL shortener",
    subtitle: "Transform long URLs into small and friendly links with nanii.icu",
    placeholder: "Paste your long link here...",
    custom_placeholder: "Your 'nanii' name (optional)",
    button_shorten: "Shorten",
    button_copy: "Copy",
    copy_success: "Copied!",
    error_invalid_url: "Oops! It seems this is not a valid link.",
    error_name_taken: "Oh, what a shame! The name is already taken.",
    error_generic: "Something went wrong. Please try again!",
    result_original: "Original link:",
    result_shortened: "nanii link:",
    footer_text: "© {year} nanii.icu. All rights reserved.",
    language_selector: "Select language",

    // Hub display
    hub_loading: "Loading hub...",
    hub_not_found_title: "Hub Not Found",
    hub_not_found_description: "The hub you're looking for doesn't exist or has been removed.",
    hub_go_home: "Go Home",
    hub_created: "Created",
    hub_views: "views",
    hub_create_own: "Create your own link hub at",
    hub_branded_link: "nanii.icu",

    // Hub creation
    mode_single_url: "Single URL",
    mode_link_hub: "Link Hub",
    hub_title_placeholder: "Hub title",
    hub_description_placeholder: "Hub description (optional)",
    hub_custom_name_placeholder: "Custom hub name (optional)",
    hub_links_section: "Links",
    hub_add_link: "Add Link",
    hub_link_title_placeholder: "Link title",
    hub_link_url_placeholder: "URL",
    hub_create_button: "Create Hub",
    hub_creating: "Creating Hub...",
    hub_title_required: "Hub title is required",
    hub_one_link_required: "At least one link is required",
    hub_invalid_url_in_link: "Invalid URL in link",
    hub_success_title: "Hub created successfully!",
    hub_success_details: "Hub Details",
    hub_success_url: "Hub URL",

    // Additional UI strings
    custom_name_available: "✓ This custom name is available!",
    hub_name_available: "✓ This hub name is available!",
    shortening: "Shortening...",
    url_success_title: "Link shortened successfully!",
    link_singular: "link",
    links_plural: "links",

    // Page titles
    page_title_shortener: "URL shortener"
  },
  es: {
    title: "Tu acortador de URLs",
    subtitle: "Transforma URLs largas en enlaces pequeños y amigables con nanii.icu",
    placeholder: "Pega tu enlace largo aquí...",
    custom_placeholder: "Tu nombre 'nanii' (opcional)",
    button_shorten: "Acortar",
    button_copy: "Copiar",
    copy_success: "¡Copiado!",
    error_invalid_url: "¡Uy! Parece que este no es un enlace válido.",
    error_name_taken: "¡Qué pena! El nombre ya ha sido elegido.",
    error_generic: "Algo salió mal. ¡Inténtalo de nuevo!",
    result_original: "Enlace original:",
    result_shortened: "Enlace nanii:",
    footer_text: "© {year} nanii.icu. Todos los derechos reservados.",
    language_selector: "Seleccionar idioma",

    // Hub display
    hub_loading: "Cargando hub...",
    hub_not_found_title: "Hub No Encontrado",
    hub_not_found_description: "El hub que buscas no existe o ha sido eliminado.",
    hub_go_home: "Ir al Inicio",
    hub_created: "Creado el",
    hub_views: "visualizaciones",
    hub_create_own: "Crea tu propio hub de enlaces en",
    hub_branded_link: "nanii.icu",

    // Hub creation
    mode_single_url: "URL Única",
    mode_link_hub: "Hub de Enlaces",
    hub_title_placeholder: "Título del hub",
    hub_description_placeholder: "Descripción del hub (opcional)",
    hub_custom_name_placeholder: "Nombre personalizado del hub (opcional)",
    hub_links_section: "Enlaces",
    hub_add_link: "Agregar Enlace",
    hub_link_title_placeholder: "Título del enlace",
    hub_link_url_placeholder: "URL",
    hub_create_button: "Crear Hub",
    hub_creating: "Creando Hub...",
    hub_title_required: "El título del hub es obligatorio",
    hub_one_link_required: "Al menos un enlace es obligatorio",
    hub_invalid_url_in_link: "URL inválida en el enlace",
    hub_success_title: "¡Hub creado exitosamente!",
    hub_success_details: "Detalles del Hub",
    hub_success_url: "URL del Hub",

    // Additional UI strings
    custom_name_available: "✓ ¡Este nombre personalizado está disponible!",
    hub_name_available: "✓ ¡Este nombre del hub está disponible!",
    shortening: "Acortando...",
    url_success_title: "¡Enlace acortado exitosamente!",
    link_singular: "enlace",
    links_plural: "enlaces",

    // Page titles
    page_title_shortener: "acortador de URLs"
  }
};

const detectBrowserLanguage = (): Language => {
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