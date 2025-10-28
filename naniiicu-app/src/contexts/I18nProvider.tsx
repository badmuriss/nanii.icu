import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { Language, Translations, translations, getStoredLanguage, setStoredLanguage } from '@/lib/i18n';

export interface I18nContextValue {
  language: Language;
  changeLanguage: (lang: Language) => void;
  t: Translations;
}

export const I18nContext = createContext<I18nContextValue | undefined>(undefined);

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('pt');

  useEffect(() => {
    const initial = getStoredLanguage();
    setLanguage(initial);
  }, []);

  const changeLanguage = (lang: Language) => {
    setLanguage(lang);
    setStoredLanguage(lang);
  };

  const t = useMemo<Translations>(() => translations[language], [language]);

  const value: I18nContextValue = useMemo(() => ({ language, changeLanguage, t }), [language, t]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};

const useI18nContext = () => {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used within I18nProvider');
  return ctx;
};
