
import React, { createContext, useContext, useState, ReactNode } from "react";

// Define all supported languages
export type Language = "en" | "es" | "fr" | "de" | "zh";

// Translation types
export type Translations = {
  [key: string]: {
    [lang in Language]: string;
  };
};

// Define all translations for the app
export const translations: Translations = {
  // Header and navigation
  home: {
    en: "Home",
    es: "Inicio",
    fr: "Accueil",
    de: "Startseite",
    zh: "首页",
  },
  dashboard: {
    en: "Dashboard",
    es: "Panel",
    fr: "Tableau de bord",
    de: "Dashboard",
    zh: "仪表板",
  },
  selectLanguage: {
    en: "Select Language",
    es: "Seleccionar idioma",
    fr: "Choisir la langue",
    de: "Sprache auswählen",
    zh: "选择语言",
  },
  
  // Dashboard page
  latentEmotionalAnalysis: {
    en: "Latent Emotional Analysis",
    es: "Análisis Emocional Latente",
    fr: "Analyse Émotionnelle Latente",
    de: "Latente Emotionsanalyse",
    zh: "潜在情感分析",
  },
  documentEmbedding: {
    en: "Document Embedding",
    es: "Incrustación de Documentos",
    fr: "Intégration de Documents",
    de: "Dokumenteinbettung",
    zh: "文档嵌入",
  },
  uniqueWordsExtracted: {
    en: "unique words extracted",
    es: "palabras únicas extraídas",
    fr: "mots uniques extraits",
    de: "eindeutige Wörter extrahiert",
    zh: "提取的唯一单词",
  },
  loading: {
    en: "Loading...",
    es: "Cargando...",
    fr: "Chargement...",
    de: "Wird geladen...",
    zh: "加载中...",
  },
  
  // Footer
  footerTitle: {
    en: "Journal Analysis",
    es: "Análisis de Diario",
    fr: "Analyse de Journal",
    de: "Journalanalyse",
    zh: "日志分析",
  },
};

type LanguageContextType = {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string) => string;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>("en");

  // Translation function
  const t = (key: string): string => {
    if (!translations[key]) {
      console.warn(`Translation key not found: ${key}`);
      return key;
    }
    return translations[key][language] || translations[key]["en"];
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
