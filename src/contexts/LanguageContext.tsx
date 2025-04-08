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
  // File uploader
  extractingText: {
    en: "Extracting text from PDF...",
    es: "Extrayendo texto del PDF...",
    fr: "Extraction du texte du PDF...",
    de: "Text aus PDF extrahieren...",
    zh: "从PDF中提取文本...",
  },
  noTextFound: {
    en: "No readable text found in the PDF",
    es: "No se encontró texto legible en el PDF",
    fr: "Aucun texte lisible trouvé dans le PDF",
    de: "Kein lesbarer Text in der PDF gefunden",
    zh: "在PDF中未找到可读文本",
  },
  extracted: {
    en: "Extracted",
    es: "Extraído",
    fr: "Extrait",
    de: "Extrahiert",
    zh: "已提取",
  },
  fromPDF: {
    en: "from PDF",
    es: "del PDF",
    fr: "du PDF",
    de: "aus PDF",
    zh: "从PDF",
  },
  processingError: {
    en: "Error processing PDF file",
    es: "Error al procesar el archivo PDF",
    fr: "Erreur lors du traitement du fichier PDF",
    de: "Fehler bei der Verarbeitung der PDF-Datei",
    zh: "处理PDF文件时出错",
  },
  onlyPDFSupported: {
    en: "Only PDF files are supported",
    es: "Solo se admiten archivos PDF",
    fr: "Seuls les fichiers PDF sont pris en charge",
    de: "Nur PDF-Dateien werden unterstützt",
    zh: "仅支持PDF文件",
  },
  extractionError: {
    en: "Failed to extract text from PDF",
    es: "No se pudo extraer texto del PDF",
    fr: "Échec de l'extraction du texte du PDF",
    de: "Fehler beim Extrahieren von Text aus PDF",
    zh: "无法从PDF中提取文本",
  },
  chooseFile: {
    en: "Choose File",
    es: "Elegir Archivo",
    fr: "Choisir un Fichier",
    de: "Datei auswählen",
    zh: "选择文件",
  },
  maxFileSize: {
    en: "Maximum file size: 10MB",
    es: "Tamaño máximo de archivo: 10MB",
    fr: "Taille maximale de fichier: 10MB",
    de: "Maximale Dateigröße: 10MB",
    zh: "最大文件大小：10MB",
  },
  analyzeWithBert: {
    en: "Analyze with BERT",
    es: "Analizar con BERT",
    fr: "Analyser avec BERT",
    de: "Mit BERT analysieren",
    zh: "使用BERT分析",
  },
  analyzeWithGemma3: {
    en: "Analyze with Gemma 3",
    es: "Analizar con Gemma 3",
    fr: "Analyser avec Gemma 3",
    de: "Mit Gemma 3 analysieren",
    zh: "使用Gemma 3分析",
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
    fr: "Affichage de todos los groupes émotionnels",
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
  },
  sentimentTimeline: {
    en: "Sentiment Timeline",
    es: "Línea de Tiempo del Sentimiento",
    fr: "Chronologie du Sentiment",
    de: "Stimmungsverlauf",
    zh: "情感时间线",
  },
  pageNumber: {
    en: "Page Number",
    es: "Número de Página",
    fr: "Numéro de Page",
    de: "Seitenzahl",
    zh: "页码",
  },
  sentimentScore: {
    en: "Sentiment Score",
    es: "Puntuación de Sentimiento",
    fr: "Score de Sentiment",
    de: "Stimmungswert",
    zh: "情感分数",
  },
  score: {
    en: "Score",
    es: "Puntuación",
    fr: "Score",
    de: "Wert",
    zh: "分数",
  },
  sentiment: {
    en: "Sentiment",
    es: "Sentimiento",
    fr: "Sentiment",
    de: "Stimmung",
    zh: "情感",
  },
  page: {
    en: "Page",
    es: "Página",
    fr: "Page",
    de: "Seite",
    zh: "页",
  },
  average: {
    en: "Avg",
    es: "Prom",
    fr: "Moy",
    de: "Durchschn",
    zh: "平均",
  },
  positive: {
    en: "Positive",
    es: "Positivo",
    fr: "Positif",
    de: "Positiv",
    zh: "积极",
  },
  negative: {
    en: "Negative",
    es: "Negativo",
    fr: "Négatif",
    de: "Negativ",
    zh: "消极",
  },
  neutral: {
    en: "Neutral",
    es: "Neutral",
    fr: "Neutre",
    de: "Neutral",
    zh: "中立",
  },
  veryPositive: {
    en: "Very Positive",
    es: "Muy Positivo",
    fr: "Très Positif",
    de: "Sehr Positiv",
    zh: "非常积极",
  },
  veryNegative: {
    en: "Very Negative",
    es: "Muy Negativo",
    fr: "Très Négatif",
    de: "Sehr Negativ",
    zh: "非常消极",
  },
  overallSentiment: {
    en: "Overall Sentiment",
    es: "Sentimiento General",
    fr: "Sentiment Global",
    de: "Gesamtstimmung",
    zh: "整体情感",
  },
  sentimentDistribution: {
    en: "Sentiment Distribution",
    es: "Distribución del Sentimiento",
    fr: "Distribution du Sentiment",
    de: "Stimmungsverteilung",
    zh: "情感分布",
  },
  emotionalTones: {
    en: "Emotional Tones",
    es: "Tonos Emocionales",
    fr: "Tonalités Émotionnelles",
    de: "Emotionale Töne",
    zh: "情感色调",
  },
  joy: {
    en: "Joy",
    es: "Alegría",
    fr: "Joie",
    de: "Freude",
    zh: "喜悦",
  },
  sadness: {
    en: "Sadness",
    es: "Tristeza",
    fr: "Tristesse",
    de: "Traurigkeit",
    zh: "悲伤",
  },
  anger: {
    en: "Anger",
    es: "Ira",
    fr: "Colère",
    de: "Wut",
    zh: "愤怒",
  },
  fear: {
    en: "Fear",
    es: "Miedo",
    fr: "Peur",
    de: "Angst",
    zh: "恐惧",
  },
  surprise: {
    en: "Surprise",
    es: "Sorpresa",
    fr: "Surprise",
    de: "Überraschung",
    zh: "惊讶",
  },
  disgust: {
    en: "Disgust",
    es: "Asco",
    fr: "Dégoût",
    de: "Ekel",
    zh: "厌恶",
  },
  trust: {
    en: "Trust",
    es: "Confianza",
    fr: "Confiance",
    de: "Vertrauen",
    zh: "信任",
  },
  anticipation: {
    en: "Anticipation",
    es: "Anticipación",
    fr: "Anticipation",
    de: "Erwartung",
    zh: "期待",
  },
  holdMiddleMouseButton: {
    en: "Hold middle mouse button and move to pan in any direction",
    es: "Mantén presionado el botón central del ratón y mueve para desplazarte en cualquier dirección",
    fr: "Maintenez le bouton central de la souris et déplacez pour faire un panoramique dans n'importe quelle direction",
    de: "Halten Sie die mittlere Maustaste gedrückt und bewegen Sie sich in eine beliebige Richtung",
    zh: "按住鼠标中键并移动以向任何方向平移",
  },
  zoomIn: {
    en: "Zoom In",
    es: "Acercar",
    fr: "Zoom avant",
    de: "Vergrößern",
    zh: "放大",
  },
  zoomOut: {
    en: "Zoom Out",
    es: "Alejar",
    fr: "Zoom arrière",
    de: "Verkleinern",
    zh: "缩小",
  },
  relatedConcepts: {
    en: "Related Concepts",
    es: "Conceptos Relacionados",
    fr: "Concepts Liés",
    de: "Verwandte Konzepte",
    zh: "相关概念",
  },
  connectedWords: {
    en: "Connected words",
    es: "Palabras conectadas",
    fr: "Mots connectés",
    de: "Verbundene Wörter",
    zh: "关联词",
  },
  timelineDescription: {
    en: "This chart shows sentiment fluctuations across the pages of your document.",
    es: "Este gráfico muestra las fluctuaciones de sentimiento a través de las páginas de su documento.",
    fr: "Ce graphique montre les fluctuations de sentiment à travers les pages de votre document.",
    de: "Dieses Diagramm zeigt Stimmungsschwankungen über die Seiten Ihres Dokuments.",
    zh: "此图表显示文档各页面的情感波动。",
  },
  documentSentiment: {
    en: "Your document has an overall",
    es: "Su documento tiene un sentimiento general",
    fr: "Votre document a un sentiment global",
    de: "Ihr Dokument hat eine allgemeine",
    zh: "您的文档整体情感为",
  },
  documentWithName: {
    en: "Your document",
    es: "Su documento",
    fr: "Votre document",
    de: "Ihr Dokument",
    zh: "您的文档",
  },
  hasSentiment: {
    en: "has an overall",
    es: "tiene un sentimiento general",
    fr: "a un sentiment global",
    de: "hat eine allgemeine",
    zh: "整体情感为",
  },
  sentiment: {
    en: "sentiment",
    es: "sentimiento",
    fr: "sentiment",
    de: "Stimmung",
    zh: "情感",
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
