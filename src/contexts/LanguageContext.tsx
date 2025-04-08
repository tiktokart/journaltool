
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
  
  // Main page content
  welcomeMessage: {
    en: "Welcome to SentiSphere",
    es: "Bienvenido a SentiSphere",
    fr: "Bienvenue sur SentiSphere",
    de: "Willkommen bei SentiSphere",
    zh: "欢迎使用SentiSphere",
  },
  subTitle: {
    en: "Analyze your documents with powerful AI",
    es: "Analiza tus documentos con IA potente",
    fr: "Analysez vos documents avec une IA puissante",
    de: "Analysieren Sie Ihre Dokumente mit leistungsstarker KI",
    zh: "使用强大的人工智能分析您的文档",
  },
  uploadTitle: {
    en: "Upload Your Document",
    es: "Sube tu Documento",
    fr: "Télécharger Votre Document",
    de: "Laden Sie Ihr Dokument hoch",
    zh: "上传您的文档",
  },
  uploadDescription: {
    en: "Drag and drop your file here or click to browse",
    es: "Arrastra y suelta tu archivo aquí o haz clic para explorar",
    fr: "Glissez-déposez votre fichier ici ou cliquez pour parcourir",
    de: "Ziehen Sie Ihre Datei hierher oder klicken Sie zum Durchsuchen",
    zh: "将文件拖放到此处或单击浏览",
  },
  analyzingDocument: {
    en: "Analyzing document...",
    es: "Analizando documento...",
    fr: "Analyse du document...",
    de: "Dokument wird analysiert...",
    zh: "正在分析文档...",
  },
  viewDashboard: {
    en: "View Dashboard",
    es: "Ver Panel",
    fr: "Voir le Tableau de Bord",
    de: "Dashboard anzeigen",
    zh: "查看仪表板",
  },
  // Additional translations for other components
  resetView: {
    en: "Reset View",
    es: "Restablecer Vista",
    fr: "Réinitialiser la Vue",
    de: "Ansicht zurücksetzen",
    zh: "重置视图",
  },
  showingWords: {
    en: "Showing",
    es: "Mostrando",
    fr: "Affichage de",
    de: "Anzeigen von",
    zh: "显示",
  },
  words: {
    en: "words",
    es: "palabras",
    fr: "mots",
    de: "Wörter",
    zh: "单词",
  },
  emotionalGroups: {
    en: "emotional groupings",
    es: "agrupaciones emocionales",
    fr: "groupements émotionnels",
    de: "emotionale Gruppierungen",
    zh: "情感分组",
  },
  jumpToEmotionalGroup: {
    en: "Jump to Emotional Group",
    es: "Saltar a Grupo Emocional",
    fr: "Aller au Groupe Émotionnel",
    de: "Zur emotionalen Gruppe springen",
    zh: "跳转到情感组",
  },
  filterByEmotion: {
    en: "Filter by emotion:",
    es: "Filtrar por emoción:",
    fr: "Filtrer par émotion:",
    de: "Nach Emotion filtern:",
    zh: "按情感筛选:",
  },
  compareWithAnotherWord: {
    en: "Compare with another word",
    es: "Comparar con otra palabra",
    fr: "Comparer avec un autre mot",
    de: "Mit einem anderen Wort vergleichen",
    zh: "与另一个词比较",
  },
  selectingComparison: {
    en: "Selecting comparison...",
    es: "Seleccionando comparación...",
    fr: "Sélection de la comparaison...",
    de: "Vergleich auswählen...",
    zh: "选择比较...",
  },
  filtered: {
    en: "Filtered:",
    es: "Filtrado:",
    fr: "Filtré:",
    de: "Gefiltert:",
    zh: "已筛选:",
  },
  reset: {
    en: "Reset",
    es: "Restablecer",
    fr: "Réinitialiser",
    de: "Zurücksetzen",
    zh: "重置",
  },
  viewReset: {
    en: "View reset to default",
    es: "Vista restablecida a predeterminada",
    fr: "Vue réinitialisée par défaut",
    de: "Ansicht auf Standard zurückgesetzt",
    zh: "视图重置为默认值",
  },
  showingAllEmotionalGroups: {
    en: "Showing all emotional groups",
    es: "Mostrando todos los grupos emocionales",
    fr: "Affichage de tous les groupes émotionnels",
    de: "Alle emotionalen Gruppen anzeigen",
    zh: "显示所有情感组",
  },
  showingOnlyEmotionalGroup: {
    en: "Showing only",
    es: "Mostrando solo",
    fr: "Affichage uniquement",
    de: "Nur anzeigen",
    zh: "仅显示",
  },
  emotionalGroup: {
    en: "emotional group",
    es: "grupo emocional",
    fr: "groupe émotionnel",
    de: "emotionale Gruppe",
    zh: "情感组",
  },
  noDataAvailable: {
    en: "No data available",
    es: "No hay datos disponibles",
    fr: "Aucune donnée disponible",
    de: "Keine Daten verfügbar",
    zh: "无可用数据",
  }
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

  console.log(`Language changed to: ${language}`);

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
