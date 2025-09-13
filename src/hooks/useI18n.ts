import { useState, useEffect } from 'react';
import { Language, translations, getStoredLanguage, setStoredLanguage } from '@/lib/i18n';

export const useI18n = () => {
  const [language, setLanguage] = useState<Language>('pt');

  useEffect(() => {
    const storedLang = getStoredLanguage();
    setLanguage(storedLang);
  }, []);

  const changeLanguage = (newLanguage: Language) => {
    setLanguage(newLanguage);
    setStoredLanguage(newLanguage);
  };

  const t = translations[language];

  return {
    language,
    changeLanguage,
    t
  };
};