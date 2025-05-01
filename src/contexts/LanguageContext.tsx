import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'en' | 'es' | 'fr' | 'de' | 'zh';

export interface Translations {
  [key: string]: {
    [lang in Language]: string;
  };
}

export const translations: Translations = {
  uploadDocument: {
    en: "Upload Document",
    es: "Subir Documento",
    fr: "Télécharger le Document",
    de: "Dokument Hochladen",
    zh: "上传文档",
  },
  selectFile: {
    en: "Select File",
    es: "Seleccionar Archivo",
    fr: "Sélectionner Fichier",
    de: "Datei auswählen",
    zh: "选择文件",
  },
  orDragDrop: {
    en: "or drag and drop",
    es: "o arrastra y suelta",
    fr: "ou glisser-déposer",
    de: "oder ziehen und ablegen",
    zh: "或拖放",
  },
  supportedFormats: {
    en: "Supported formats: PDF",
    es: "Formatos soportados: PDF",
    fr: "Formats supportés: PDF",
    de: "Unterstützte Formate: PDF",
    zh: "支持格式：PDF",
  },
  uploading: {
    en: "Uploading...",
    es: "Subiendo...",
    fr: "Téléchargement...",
    de: "Hochladen...",
    zh: "上传中...",
  },
  analysisOptions: {
    en: "Analysis Options",
    es: "Opciones de Análisis",
    fr: "Options d'Analyse",
    de: "Analyseoptionen",
    zh: "分析选项",
  },
  performSentimentAnalysis: {
    en: "Perform Sentiment Analysis",
    es: "Realizar Análisis de Sentimiento",
    fr: "Effectuer une Analyse des Sentiments",
    de: "Sentimentanalyse durchführen",
    zh: "执行情感分析",
  },
  analyzeKeyThemes: {
    en: "Analyze Key Themes",
    es: "Analizar Temas Clave",
    fr: "Analyser les Thèmes Clés",
    de: "Schlüsselthemen analysieren",
    zh: "分析关键主题",
  },
  extractNamedEntities: {
    en: "Extract Named Entities",
    es: "Extraer Entidades Nombradas",
    fr: "Extraire les Entités Nommées",
    de: "Benannte Entitäten extrahieren",
    zh: "提取命名实体",
  },
  startAnalysis: {
    en: "Start Analysis",
    es: "Iniciar Análisis",
    fr: "Démarrer l'Analyse",
    de: "Analyse starten",
    zh: "开始分析",
  },
  documentSummaryTitle: {
    en: "Document Summary",
    es: "Resumen del Documento",
    fr: "Résumé du Document",
    de: "Dokumentzusammenfassung",
    zh: "文档摘要",
  },
  overallSentiment: {
    en: "Overall Sentiment",
    es: "Sentimiento General",
    fr: "Sentiment Général",
    de: "Gesamtstimmung",
    zh: "总体情感",
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
    zh: "中性",
  },
  sentimentDistribution: {
    en: "Sentiment Distribution",
    es: "Distribución de Sentimientos",
    fr: "Distribution des Sentiments",
    de: "Verteilung der Stimmungen",
    zh: "情感分布",
  },
  keyThemeAnalysis: {
    en: "Key Theme Analysis",
    es: "Análisis de Temas Clave",
    fr: "Analyse des Thèmes Clés",
    de: "Schlüsselthemenanalyse",
    zh: "关键主题分析",
  },
  namedEntityRecognition: {
    en: "Named Entity Recognition",
    es: "Reconocimiento de Entidades Nombradas",
    fr: "Reconnaissance d'Entités Nommées",
    de: "Erkennung benannter Entitäten",
    zh: "命名实体识别",
  },
  entity: {
    en: "Entity",
    es: "Entidad",
    fr: "Entité",
    de: "Entität",
    zh: "实体",
  },
  type: {
    en: "Type",
    es: "Tipo",
    fr: "Type",
    de: "Typ",
    zh: "类型",
  },
  relevance: {
    en: "Relevance",
    es: "Relevancia",
    fr: "Pertinence",
    de: "Relevanz",
    zh: "相关性",
  },
  documentAnalysisComplete: {
    en: "Document analysis complete!",
    es: "¡Análisis del documento completo!",
    fr: "Analyse du document terminée !",
    de: "Dokumentanalyse abgeschlossen!",
    zh: "文档分析完成！",
  },
  analysisInProgress: {
    en: "Analysis in progress...",
    es: "Análisis en progreso...",
    fr: "Analyse en cours...",
    de: "Analyse läuft...",
    zh: "分析进行中...",
  },
  noDocumentUploaded: {
    en: "No document uploaded.",
    es: "Ningún documento subido.",
    fr: "Aucun document téléchargé.",
    de: "Kein Dokument hochgeladen.",
    zh: "未上传任何文档。",
  },
  errorAnalyzingDocument: {
    en: "Error analyzing document.",
    es: "Error al analizar el documento.",
    fr: "Erreur lors de l'analyse du document.",
    de: "Fehler beim Analysieren des Dokuments.",
    zh: "分析文档时出错。",
  },
  tryAgain: {
    en: "Please try again.",
    es: "Por favor, inténtelo de nuevo.",
    fr: "Veuillez réessayer.",
    de: "Bitte versuche es erneut.",
    zh: "请重试。",
  },
  language: {
    en: "Language",
    es: "Idioma",
    fr: "Langue",
    de: "Sprache",
    zh: "语言",
  },
  selectLanguage: {
    en: "Select Language",
    es: "Seleccionar Idioma",
    fr: "Sélectionner la Langue",
    de: "Sprache auswählen",
    zh: "选择语言",
  },
  embeddingVisualization: {
    en: "Embedding Visualization",
    es: "Visualización de Incrustación",
    fr: "Visualisation d'Intégration",
    de: "Einbettungsvisualisierung",
    zh: "嵌入可视化",
  },
  word: {
    en: "Word",
    es: "Palabra",
    fr: "Mot",
    de: "Wort",
    zh: "词",
  },
  sentimentScore: {
    en: "Sentiment Score",
    es: "Puntuación de Sentimiento",
    fr: "Score de Sentiment",
    de: "Sentiment-Punktzahl",
    zh: "情感得分",
  },
  emotionalTone: {
    en: "Emotional Tone",
    es: "Tono Emocional",
    fr: "Ton Émotionnel",
    de: "Emotionale Stimmung",
    zh: "情感基调",
  },
  searchPlaceholder: {
    en: "Search for words...",
    es: "Buscar palabras...",
    fr: "Rechercher des mots...",
    de: "Suche nach Wörtern...",
    zh: "搜索词语...",
  },
  resetVisualization: {
    en: "Reset Visualization",
    es: "Restablecer Visualización",
    fr: "Réinitialiser la Visualisation",
    de: "Visualisierung zurücksetzen",
    zh: "重置可视化",
  },
  clearSearch: {
    en: "Clear Search",
    es: "Borrar Búsqueda",
    fr: "Effacer la Recherche",
    de: "Suche löschen",
    zh: "清除搜索",
  },
  noWordSelected: {
    en: "No word selected",
    es: "Ninguna palabra seleccionada",
    fr: "Aucun mot sélectionné",
    de: "Kein Wort ausgewählt",
    zh: "未选择任何词语",
  },
  relatedWords: {
    en: "Related Words",
    es: "Palabras Relacionadas",
    fr: "Mots Associés",
    de: "Verwandte Wörter",
    zh: "相关词语",
  },
  wellbeingResources: {
    en: "Wellbeing Resources",
    es: "Recursos de Bienestar",
    fr: "Ressources de Bien-être",
    de: "Ressourcen für das Wohlbefinden",
    zh: "健康资源",
  },
  wellbeingDescription: {
    en: "Explore resources to support your wellbeing.",
    es: "Explora recursos para apoyar tu bienestar.",
    fr: "Explorez des ressources pour soutenir votre bien-être.",
    de: "Entdecken Sie Ressourcen zur Unterstützung Ihres Wohlbefindens.",
    zh: "探索支持您健康的资源。",
  },
  findSupport: {
    en: "Find Support",
    es: "Encontrar Apoyo",
    fr: "Trouver du Soutien",
    de: "Unterstützung finden",
    zh: "寻找支持",
  },
  learnMore: {
    en: "Learn More",
    es: "Aprender Más",
    fr: "En Savoir Plus",
    de: "Mehr erfahren",
    zh: "了解更多",
  },
  analysisTabs: {
    en: "Analysis Tabs",
    es: "Pestañas de Análisis",
    fr: "Onglets d'Analyse",
    de: "Analyse-Tabs",
    zh: "分析标签",
  },
  embedding: {
    en: "Embedding",
    es: "Incrustación",
    fr: "Intégration",
    de: "Einbettung",
    zh: "嵌入",
  },
  summary: {
    en: "Summary",
    es: "Resumen",
    fr: "Résumé",
    de: "Zusammenfassung",
    zh: "摘要",
  },
  themes: {
    en: "Themes",
    es: "Temas",
    fr: "Thèmes",
    de: "Themen",
    zh: "主题",
  },
  emotions: {
    en: "Emotions",
    es: "Emociones",
    fr: "Émotions",
    de: "Emotionen",
    zh: "情绪",
  },
  emotionalClusters: {
    en: "Emotional Clusters",
    es: "Clusters Emocionales",
    fr: "Clusters Émotionnels",
    de: "Emotionale Cluster",
    zh: "情感集群",
  },
  showMoreClusters: {
    en: "Show More Clusters",
    es: "Mostrar Más Clusters",
    fr: "Afficher Plus de Clusters",
    de: "Mehr Cluster anzeigen",
    zh: "显示更多集群",
  },
  showLessClusters: {
    en: "Show Less Clusters",
    es: "Mostrar Menos Clusters",
    fr: "Afficher Moins de Clusters",
    de: "Weniger Cluster anzeigen",
    zh: "显示更少集群",
  },
  themeAnalysisTitle: {
    en: "Theme Analysis",
    es: "Análisis de Temas",
    fr: "Analyse des Thèmes",
    de: "Themenanalyse",
    zh: "主题分析",
  },
  emotionalTones: {
    en: "Emotional Tones",
    es: "Tonos Emocionales",
    fr: "Tonalités Émotionnelles",
    de: "Emotionale Töne",
    zh: "情感基调",
  },
  exportAnalysis: {
    en: "Export Analysis",
    es: "Exportar Análisis",
    fr: "Exporter l'Analyse",
    de: "Analyse Exportieren",
    zh: "导出分析",
  },
  exportDescription: {
    en: "Download a PDF report with the complete analysis of your document.",
    es: "Descargue un informe PDF con el análisis completo de su documento.",
    fr: "Téléchargez un rapport PDF avec l'analyse complète de votre document.",
    de: "Laden Sie einen PDF-Bericht mit der vollständigen Analyse Ihres Dokuments herunter.",
    zh: "下载包含文档完整分析的PDF报告。",
  },
  exportToPdf: {
    en: "Export to PDF",
    es: "Exportar a PDF",
    fr: "Exporter en PDF",
    de: "Als PDF exportieren",
    zh: "导出为PDF",
  },
  exportSuccess: {
    en: "PDF report successfully exported",
    es: "Informe PDF exportado con éxito",
    fr: "Rapport PDF exporté avec succès",
    de: "PDF-Bericht erfolgreich exportiert",
    zh: "PDF报告成功导出",
  },
  exportError: {
    en: "Error exporting PDF report",
    es: "Error al exportar informe PDF",
    fr: "Erreur lors de l'exportation du rapport PDF",
    de: "Fehler beim Exportieren des PDF-Berichts",
    zh: "导出PDF报告时出错",
  },
  noDataToExport: {
    en: "No data available to export",
    es: "No hay datos disponibles para exportar",
    fr: "Aucune donnée disponible à exporter",
    de: "Keine Daten zum Exportieren verfügbar",
    zh: "没有可导出的数据",
  },
  documentAnalysis: {
    en: "Document Analysis",
    es: "Análisis de Documento",
    fr: "Analyse de Document",
    de: "Dokumentenanalyse",
    zh: "文档分析",
  },
  documentAnalysisReport: {
    en: "Document Analysis Report",
    es: "Informe de Análisis de Documento",
    fr: "Rapport d'Analyse de Document",
    de: "Dokumentenanalyse-Bericht",
    zh: "文档分析报告",
  },
  fileInformation: {
    en: "File Information",
    es: "Información del Archivo",
    fr: "Information sur le Fichier",
    de: "Dateiinformationen",
    zh: "文件信息",
  },
  fileName: {
    en: "File Name",
    es: "Nombre del Archivo",
    fr: "Nom du Fichier",
    de: "Dateiname",
    zh: "文件名称",
  },
  fileSize: {
    en: "File Size",
    es: "Tamaño del Archivo",
    fr: "Taille du Fichier",
    de: "Dateigröße",
    zh: "文件大小",
  },
  wordCount: {
    en: "Word Count",
    es: "Recuento de Palabras",
    fr: "Nombre de Mots",
    de: "Wortanzahl",
    zh: "字数",
  },
  documentSummary: {
    en: "Document Summary",
    es: "Resumen del Documento",
    fr: "Résumé du Document",
    de: "Dokumentzusammenfassung",
    zh: "文档摘要",
  },
  noSummaryAvailable: {
    en: "No summary available for this document.",
    es: "No hay resumen disponible para este documento.",
    fr: "Aucun résumé disponible pour ce document.",
    de: "Keine Zusammenfassung für dieses Dokument verfügbar.",
    zh: "此文档没有可用的摘要。",
  },
  sentimentAnalysis: {
    en: "Sentiment Analysis",
    es: "Análisis de Sentimiento",
    fr: "Analyse de Sentiment",
    de: "Stimmungsanalyse",
    zh: "情感分析",
  },
  keyPhrases: {
    en: "Key Phrases",
    es: "Frases Clave",
    fr: "Phrases Clés",
    de: "Schlüsselphrasen",
    zh: "关键短语",
  },
  phrase: {
    en: "Phrase",
    es: "Frase",
    fr: "Phrase",
    de: "Phrase",
    zh: "短语",
  },
  frequency: {
    en: "Frequency",
    es: "Frecuencia",
    fr: "Fréquence",
    de: "Häufigkeit",
    zh: "频率",
  },
  theme: {
    en: "Theme",
    es: "Tema",
    fr: "Thème",
    de: "Thema",
    zh: "主题",
  },
  mentions: {
    en: "Mentions",
    es: "Menciones",
    fr: "Mentions",
    de: "Erwähnungen",
    zh: "提及",
  },
  emotion: {
    en: "Emotion",
    es: "Emoción",
    fr: "Émotion",
    de: "Emotion",
    zh: "情感",
  },
  occurrences: {
    en: "Occurrences",
    es: "Ocurrencias",
    fr: "Occurrences",
    de: "Vorkommen",
    zh: "出现次数",
  },
  generatedOn: {
    en: "Generated on",
    es: "Generado el",
    fr: "Généré le",
    de: "Generiert am",
    zh: "生成于",
  },
  of: {
    en: "of",
    es: "de",
    fr: "de",
    de: "von",
    zh: "的",
  },
  searchWords: {
    en: "Search Words",
    es: "Buscar Palabras",
    fr: "Rechercher des Mots",
    de: "Wörter suchen",
    zh: "搜索词语",
  },
};

interface LanguageContextProps {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextProps | undefined>(
  undefined
);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [language, setLanguage] = useState<Language>('en');

  useEffect(() => {
    const storedLanguage = localStorage.getItem('language');
    if (storedLanguage && (['en', 'es', 'fr', 'de', 'zh'] as string[]).includes(storedLanguage)) {
      setLanguage(storedLanguage as Language);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  const t = (key: string): string => {
    const translation = translations[key]?.[language] || key;
    return translation;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
