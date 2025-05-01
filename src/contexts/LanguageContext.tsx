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
  // Application title and subtitle
  appTitle: {
    en: "Journal Analysis Tool",
    es: "Herramienta de Análisis de Diario",
    fr: "Outil d'Analyse de Journal",
    de: "Tagebuch-Analyse-Tool",
    zh: "日记分析工具",
  },
  appSubtitle: {
    en: "A digital tool to understand your dreams and emotions",
    es: "Una herramienta digital para entender tus sueños y emociones",
    fr: "Un outil numérique pour comprendre vos rêves et émotions",
    de: "Ein digitales Werkzeug zum Verständnis Ihrer Träume und Emotionen",
    zh: "一种理解梦想和情感的数字工具",
  },
  visualizationDescription: {
    en: "This visualization maps the emotional landscape of a personal journal entry about experiencing a panic attack.",
    es: "Esta visualización mapea el paisaje emocional de una entrada de diario personal sobre la experiencia de un ataque de pánico.",
    fr: "Cette visualisation cartographie le paysage émotionnel d'une entrée de journal personnel sur l'expérience d'une attaque de panique.",
    de: "Diese Visualisierung bildet die emotionale Landschaft eines persönlichen Tagebucheintrags über das Erleben einer Panikattacke ab.",
    zh: "此可视化映射了关于经历恐慌发作的个人日记条目的情感景观。",
  },
  
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
  
  // Journal Entry Example translations
  journalEntryExample: {
    en: "Journal Entry Example",
    es: "Ejemplo de Entrada de Diario",
    fr: "Exemple d'Entrée de Journal",
    de: "Tagebucheintrag Beispiel",
    zh: "日志条目示例",
  },
  journalEntryContent: {
    en: "Today I spent some time in the garden. The fresh air and sunlight helped me feel more energized. I noticed the roses are starting to bloom, which always brings me joy. Later, I had a difficult conversation with a colleague that left me feeling a bit anxious, but I'm trying to remain positive. Tomorrow I plan to start that new book I've been wanting to read.",
    es: "Hoy pasé un tiempo en el jardín. El aire fresco y la luz del sol me ayudaron a sentirme con más energía. Noté que las rosas están comenzando a florecer, lo que siempre me da alegría. Más tarde, tuve una conversación difícil con un colega que me dejó un poco ansioso, pero estoy tratando de mantenerme positivo. Mañana planeo comenzar ese nuevo libro que he querido leer.",
    fr: "Aujourd'hui, j'ai passé du temps dans le jardin. L'air frais et la lumière du soleil m'ont aidé à me sentir plus énergique. J'ai remarqué que les roses commencent à fleurir, ce qui me donne toujours de la joie. Plus tard, j'ai eu une conversation difficile avec un collègue qui m'a laissé un peu anxieux, mais j'essaie de rester positif. Demain, je prévois de commencer ce nouveau livre que je voulais lire.",
    de: "Heute habe ich einige Zeit im Garten verbracht. Die frische Luft und das Sonnenlicht halfen mir, mich energiegeladener zu fühlen. Ich bemerkte, dass die Rosen zu blühen beginnen, was mir immer Freude bereitet. Später hatte ich ein schwieriges Gespräch mit einem Kollegen, das mich etwas ängstlich zurückließ, aber ich versuche, positiv zu bleiben. Morgen plane ich, mit diesem neuen Buch zu beginnen, das ich schon lange lesen wollte.",
    zh: "今天我在花园里度过了一些时间。新鲜的空气和阳光帮助我感到更有活力。我注意到玫瑰开始绽放，这总是给我带来喜悦。后来，我与一位同事进行了一次困难的谈话，这让我感到有些焦虑，但我试图保持积极。明天我计划开始阅读那本我一直想读的新书。",
  },
  analyzeThisExample: {
    en: "Analyze this example",
    es: "Analizar este ejemplo",
    fr: "Analyser cet exemple",
    de: "Dieses Beispiel analysieren",
    zh: "分析此示例",
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
    zh: "在PDF中未���到可读文本",
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
  sentimentLabel: {
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
    es: "Palabras Conectadas",
    fr: "Mots Connectés",
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
  sentimentValue: {
    en: "sentiment",
    es: "sentimiento",
    fr: "sentiment",
    de: "Stimmung",
    zh: "情感",
  },
  
  // New translations for tabs and section titles
  latentEmotionalAnalysisTab: {
    en: "Latent Emotional Analysis",
    es: "Análisis Emocional Latente",
    fr: "Analyse Émotionnelle Latente",
    de: "Latente Emotionsanalyse",
    zh: "潜在情感分析",
  },
  overviewTab: {
    en: "Overview",
    es: "Resumen",
    fr: "Aperçu",
    de: "Überblick",
    zh: "概述",
  },
  timelineTab: {
    en: "Timeline",
    es: "Línea de Tiempo",
    fr: "Chronologie",
    de: "Zeitlinie",
    zh: "时间线",
  },
  themesTab: {
    en: "Themes",
    es: "Temas",
    fr: "Thèmes",
    de: "Themen",
    zh: "主题",
  },
  keywordsTab: {
    en: "Key Words",
    es: "Palabras Clave",
    fr: "Mots Clés",
    de: "Schlüsselwörter",
    zh: "关键词",
  },
  themeAnalysisTitle: {
    en: "Theme Sentiment Analysis",
    es: "Análisis de Sentimiento de Temas",
    fr: "Analyse de Sentiment des Thèmes",
    de: "Themen-Stimmungsanalyse",
    zh: "主题情感分析",
  },
  themeAnalysisDescription: {
    en: "The chart shows sentiment scores for key themes identified in your document.",
    es: "El gráfico muestra puntuaciones de sentimiento para los temas clave identificados en su documento.",
    fr: "Le graphique montre les scores de sentiment pour les thèmes clés identifiés dans votre document.",
    de: "Das Diagramm zeigt Stimmungswerte für wichtige Themen, die in Ihrem Dokument identifiziert wurden.",
    zh: "图表显示文档中识别出的关键主题的情感分数",
  },
  noThemeDataAvailable: {
    en: "No theme data available from your document",
    es: "No hay datos de tema disponibles de su documento",
    fr: "Aucune donnée de thème disponible dans votre document",
    de: "Keine Themendaten aus Ihrem Dokument verfügbar",
    zh: "您的文档中没有可用的主题数据",
  },
  commonWordsBySentiment: {
    en: "Common Words by Sentiment",
    es: "Palabras Comunes por Sentimiento",
    fr: "Mots Communs par Sentiment",
    de: "Häufige Wörter nach Stimmung",
    zh: "按情感分类的常用词",
  },
  keywordsDescription: {
    en: "Common words in your document, grouped by sentiment and sorted by frequency.",
    es: "Palabras comunes en su documento, agrupadas por sentimiento y ordenadas por frecuencia.",
    fr: "Mots communs dans votre document, regroupés par sentiment et triés par fréquence.",
    de: "Häufige Wörter in Ihrem Dokument, nach Stimmung gruppiert und nach Häufigkeit sortiert.",
    zh: "文档中的常用词，按情感分组并按频率排序。",
  },
  positiveWords: {
    en: "Positive Words",
    es: "Palabras Positivas",
    fr: "Mots Positivos",
    de: "Positive Wörter",
    zh: "积极词汇",
  },
  neutralWords: {
    en: "Neutral Words",
    es: "Palabras Neutrales",
    fr: "Mots Neutres",
    de: "Neutrale Wörter",
    zh: "中性词汇",
  },
  negativeWords: {
    en: "Negative Words",
    es: "Palabras Negativas",
    fr: "Mots Négatifs",
    de: "Negative Wörter",
    zh: "消极词汇",
  },
  noPositiveWords: {
    en: "No positive words detected",
    es: "No se detectaron palabras positivas",
    fr: "Aucun mot positif détecté",
    de: "Keine positiven Wörter erkannt",
    zh: "未检测到积极词汇",
  },
  noNeutralWords: {
    en: "No neutral words detected",
    es: "No se detectaron palabras neutrales",
    fr: "Aucun mot neutre détecté",
    de: "Keine neutralen Wörter erkannt",
    zh: "未检测到中性词汇",
  },
  noNegativeWords: {
    en: "No negative words detected",
    es: "No se detectaron palabras negativas",
    fr: "Aucun mot négatif détecté",
    de: "Keine negativen Wörter erkannt",
    zh: "未检测到消极词汇",
  },
  moreWordsNotShown: {
    en: "more {sentiment} words not shown",
    es: "más palabras {sentiment} no mostradas",
    fr: "plus de mots {sentiment} non affichés",
    de: "weitere {sentiment} Wörter nicht angezeigt",
    zh: "更多未显示的{sentiment}词汇",
  },
  resourcesAndSupport: {
    en: "Resources & Support",
    es: "Recursos y Soporte",
    fr: "Ressources et Support",
    de: "Ressourcen & Unterstützung",
    zh: "资源与支持",
  },
  wellbeingSuggestions: {
    en: "Wellbeing Suggestions",
    es: "Sugerencias de Bienestar",
    fr: "Suggestions de Bien-être",
    de: "Wohlbefinden-Vorschläge",
    zh: "健康建议",
  },
  mentalHealthResources: {
    en: "Mental Health Resources",
    es: "Recursos de Salud Mental",
    fr: "Ressources de Santé Mentale",
    de: "Ressourcen für Psychische Gesundheit",
    zh: "心理健康资源",
  },
  emotionalClusters: {
    en: "Emotional Clusters",
    es: "Grupos Emocionales",
    fr: "Groupes Émotionnels",
    de: "Emotionale Cluster",
    zh: "情感集群",
  },
  emotionalClustersDescription: {
    en: "Adjust the number of emotional clusters visible in the visualization:",
    es: "Ajustar el número de grupos emocionales visibles en la visualización:",
    fr: "Ajuster le nombre de groupes émotionnels visibles dans la visualisation:",
    de: "Anzahl der in der Visualisierung sichtbaren emotionalen Cluster anpassen:",
    zh: "调整可视化中可见的情感集群数量：",
  },
  visualizationUpdated: {
    en: "Visualization updated to show {count} emotional clusters",
    es: "Visualización actualizada para mostrar {count} grupos emocionales",
    fr: "Visualisation mise à jour pour afficher {count} groupes émotionnels",
    de: "Visualisierung aktualisiert, um {count} emotionale Cluster anzuzeigen",
    zh: "已��新可视化以显示 {count} 个情感集群",
  },
  benefit: {
    en: "Benefit",
    es: "Beneficio",
    fr: "Avantage",
    de: "Vorteil",
    zh: "好处",
  },
  contact: {
    en: "Contact",
    es: "Contacto",
    fr: "Contact",
    de: "Kontakt",
    zh: "联系方式",
  },
  website: {
    en: "Website",
    es: "Sitio web",
    fr: "Site web",
    de: "Webseite",
    zh: "网站",
  },
  resourcesDisclaimer: {
    en: "These resources are provided for informational purposes only. Please consult with healthcare professionals for personalized advice.",
    es: "Estos recursos se proporcionan solo con fines informativos. Por favor consulte con profesionales de la salud para obtener consejos personalizados.",
    fr: "Ces ressources sont fournies à titre informatif uniquement. Veuillez consulter des professionnels de la santé pour des conseils personnalisés.",
    de: "Diese Ressourcen dienen nur zu Informationszwecken. Bitte konsultieren Sie Gesundheitsexperten für eine persönliche Beratung.",
    zh: "这些资源仅供参考。请咨询医疗专业人员获取个性化建议。",
  },
  dataAvailableMissing: {
    en: "The required data for this view couldn't be loaded. This may happen when analysis is incomplete or when the document doesn't contain enough information.",
    es: "Los datos requeridos para esta vista no pudieron cargarse. Esto puede ocurrir cuando el análisis está incompleto o cuando el documento no contiene suficiente información.",
    fr: "Les données requises pour cette vue n'ont pas pu être chargées. Cela peut se produire lorsque l'analyse est incomplète ou lorsque le document ne contient pas suffisamment d'informations.",
    de: "Die für diese Ansicht erforderlichen Daten konnten nicht geladen werden. Dies kann vorkommen, wenn die Analyse unvollständig ist oder wenn das Dokument nicht genügend Informationen enthält.",
    zh: "无法加载此视图所需的数据。当分析不完整或文档不包含足够信息时，可能会发生这种情况。",
  },
  noDataTabName: {
    en: "No {tabName} Data Available",
    es: "No hay datos de {tabName} disponibles",
    fr: "Aucune donnée de {tabName} disponible",
    de: "Keine {tabName}-Daten verfügbar",
    zh: "没有可用的{tabName}数据",
  },
  embedding: {
    en: "Embedding",
    es: "Incrustación",
    fr: "Intégration",
    de: "Einbettung",
    zh: "嵌入",
  },
  searchWordsOrEmotions: {
    en: "Search words or emotions...",
    es: "Buscar palabras o emociones...",
    fr: "Rechercher des mots ou des émotions...",
    de: "Wörter oder Emotionen suchen...",
    zh: "搜索词语或情感...",
  },
  searchWords: {
    en: "Search words...",
    es: "Buscar palabras...",
    fr: "Rechercher des mots...",
    de: "Wörter suchen...",
    zh: "搜索词语...",
  },
  noResultsFound: {
    en: "No results found",
    es: "No se encontraron resultados",
    fr: "Aucun résultat trouvé",
    de: "Keine Ergebnisse gefunden",
    zh: "未找到结果",
  },
  hoverOrClick: {
    en: "Hover or click on words to see emotional relationships. Use the Reset View button when needed.",
    es: "Pase el cursor o haga clic en las palabras para ver las relaciones emocionales. Use el botón Restablecer Vista cuando sea necesario.",
    fr: "Survolez ou cliquez sur les mots pour voir les relations émotionnelles. Utilisez le bouton Réinitialiser la Vue si nécessaire.",
    de: "Bewegen Sie den Mauszeiger über Wörter oder klicken Sie darauf, um emotionale Beziehungen zu sehen. Verwenden Sie bei Bedarf die Schaltfläche Ansicht zurücksetzen.",
    zh: "悬停或点击单词以查看情感关系。需要时使用重置视图按钮。",
  },
  
  // Word Comparison Component translations
  wordComparison: {
    en: "Word Comparison",
    es: "Comparación de Palabras",
    fr: "Comparaison de Mots",
    de: "Wortvergleich",
    zh: "词语比较",
  },
  addWord: {
    en: "Add Word",
    es: "Añadir Palabra",
    fr: "Ajouter un Mot",
    de: "Wort hinzufügen",
    zh: "添加词语",
  },
  clearAll: {
    en: "Clear All",
    es: "Borrar Todo",
    fr: "Tout Effacer",
    de: "Alles löschen",
    zh: "清除全部",
  },
  noMatchingWords: {
    en: "No matching words",
    es: "No hay palabras coincidentes",
    fr: "Aucun mot correspondant",
    de: "Keine übereinstimmenden Wörter",
    zh: "没有匹配的词语",
  },
  noWordsSelected: {
    en: "No words selected",
    es: "No hay palabras seleccionadas",
    fr: "Aucun mot sélectionné",
    de: "Keine Wörter ausgewählt",
    zh: "未选择词语",
  },
  addWordsToCompare: {
    en: "Add words to compare their emotional relationship",
    es: "Añade palabras para comparar su relación emocional",
    fr: "Ajoutez des mots pour comparer leur relation émotionnelle",
    de: "Fügen Sie Wörter hinzu, um ihre emotionale Beziehung zu vergleichen",
    zh: "添加词语以比较它们的情感关系",
  },
  addWordsFromDocument: {
    en: "Add words from your document to compare",
    es: "Añade palabras de tu documento para comparar",
    fr: "Ajoutez des mots de votre document pour comparer",
    de: "Fügen Sie Wörter aus Ihrem Dokument zum Vergleich hinzu",
    zh: "从您的文档中添加词语进行比较",
  },
  searchWords: {
    en: "Search Words",
    es: "Buscar Palabras",
    fr: "Rechercher des Mots",
    de: "Wörter Suchen",
    zh: "搜索词语",
  },
  relationshipAnalysis: {
    en: "Relationship Analysis",
    es: "Análisis de Relación",
    fr: "Analyse de Relation",
    de: "Beziehungsanalyse",
    zh: "关系分析",
  },
  overallRelationship: {
    en: "Overall Relationship",
    es: "Relación General",
    fr: "Relation Globale",
    de: "Gesamtbeziehung",
    zh: "整体关系",
  },
  contextualSimilarity: {
    en: "Contextual Similarity",
    es: "Similitud Contextual",
    fr: "Similarité Contextuelle",
    de: "Kontextuelle Ähnlichkeit",
    zh: "上下文相似性",
  },
  emotionalAlignment: {
    en: "Emotional Alignment",
    es: "Alineación Emocional",
    fr: "Alignement Émotionnel",
    de: "Emotionale Ausrichtung",
    zh: "情感一致性",
  },
  emotionalGroupType: {
    en: "Emotional Group Type",
    es: "Tipo de Grupo Emocional",
    fr: "Type de Groupe Émotionnel",
    de: "Emotionaler Gruppentyp",
    zh: "情感组类型",
  },
  sharedConcepts: {
    en: "Shared Concepts",
    es: "Conceptos Compartidos",
    fr: "Concepts Partagés",
    de: "Gemeinsame Konzepte",
    zh: "共享概念",
  },
  bothIn: {
    en: "Both in",
    es: "Ambos en",
    fr: "Les deux dans",
    de: "Beide in",
    zh: "两者都在",
  },
  group: {
    en: "group",
    es: "grupo",
    fr: "groupe",
    de: "Gruppe",
    zh: "组",
  },
  differentGroups: {
    en: "Different groups",
    es: "Grupos diferentes",
    fr: "Groupes différents",
    de: "Verschiedene Gruppen",
    zh: "不同组",
  },
  vs: {
    en: "vs",
    es: "vs",
    fr: "vs",
    de: "vs",
    zh: "对比",
  },
  sentiment: {
    en: "Sentiment",
    es: "Sentimiento",
    fr: "Sentiment",
    de: "Stimmung",
    zh: "情感",
  },
  stronglyRelated: {
    en: "Strongly related",
    es: "Fuertemente relacionados",
    fr: "Fortement liés",
    de: "Stark verbunden",
    zh: "强相关",
  },
  related: {
    en: "Related",
    es: "Relacionados",
    fr: "Liés",
    de: "Verbunden",
    zh: "相关",
  },
  moderatelyRelated: {
    en: "Moderately related",
    es: "Moderadamente relacionados",
    fr: "Modérément liés",
    de: "Mäßig verbunden",
    zh: "中度相关",
  },
  weaklyRelated: {
    en: "Weakly related",
    es: "Débilmente relacionados",
    fr: "Faiblement liés",
    de: "Schwach verbunden",
    zh: "弱相关",
  },
  barelyRelated: {
    en: "Barely related",
    es: "Apenas relacionados",
    fr: "À peine liés",
    de: "Kaum verbunden",
    zh: "几乎不相关",
  },
  maxComparisonWordsError: {
    en: "Maximum of 4 words can be compared",
    es: "Se puede comparar un máximo de 4 palabras",
    fr: "Un maximum de 4 mots peut être comparé",
    de: "Maximal 4 Wörter können verglichen werden",
    zh: "一次最多只能比较4个词语",
  },
  alreadyInComparison: {
    en: "is already in the comparison",
    es: "ya está en la comparación",
    fr: "est déjà dans la comparaison",
    de: "ist bereits im Vergleich",
    zh: "已在比较中",
  },
  addedToComparison: {
    en: "Added",
    es: "Añadido",
    fr: "Ajouté",
    de: "Hinzugefügt",
    zh: "已添加",
  },
  toComparison: {
    en: "to comparison",
    es: "a la comparación",
    fr: "à la comparaison",
    de: "zum Vergleich",
    zh: "到比较",
  },
  removedFromComparison: {
    en: "Removed",
    es: "Eliminado",
    fr: "Supprimé",
    de: "Entfernt",
    zh: "已移除",
  },
  fromComparison: {
    en: "from comparison",
    es: "de la comparación",
    fr: "de la comparación",
    de: "aus dem Vergleich",
    zh: "从比较中",
  },
  clearedAllComparisonWords: {
    en: "Cleared all comparison words",
    es: "Se han borrado todas las palabras de comparación",
    fr: "Tous les mots de comparaison ont été effacés",
    de: "Alle Vergleichswörter wurden gelöscht",
    zh: "已清除所有比较词语",
  },
  emotionalRelationships: {
    en: "Emotional Relationships",
    es: "Relaciones Emocionales",
    fr: "Relations Émotionnelles",
    de: "Emotionale Beziehungen",
    zh: "情感关系",
  },
  spacialProximity: {
    en: "Spatial Proximity",
    es: "Proximidad Espacial",
    fr: "Proximité Spatiale",
    de: "Räumliche Nähe",
    zh: "空间邻近度",
  },
  sentimentSimilarity: {
    en: "Sentiment Similarity",
    es: "Similitud de Sentimiento",
    fr: "Similarité de Sentiment",
    de: "Stimmungsähnlichkeit",
    zh: "情感相似度",
  },
  selected: {
    en: "Selected",
    es: "Seleccionado",
    fr: "Sélectionné",
    de: "Ausgewählt",
    zh: "已选择",
  },
  
  // PDF Export related translations
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
    en: "Analysis report exported successfully",
    es: "Informe de análisis exportado exitosamente",
    fr: "Rapport d'analyse exporté avec succès",
    de: "Analysebericht erfolgreich exportiert",
    zh: "分析报告成功导出",
  },
  exportError: {
    en: "Error exporting analysis report",
    es: "Error al exportar el informe de análisis",
    fr: "Erreur lors de l'exportation du rapport d'analyse",
    de: "Fehler beim Exportieren des Analyseberichts",
    zh: "导出分析报告时出错",
  },
  noDataToExport: {
    en: "No analysis data to export",
    es: "No hay datos de análisis para exportar",
    fr: "Aucune donnée d'analyse à exporter",
    de: "Keine Analysedaten zum Exportieren",
    zh: "没有可供导出的分析数据",
  },
  documentAnalysisReport: {
    en: "Document Analysis Report",
    es: "Informe de Análisis de Documento",
    fr: "Rapport d'Analyse de Document",
    de: "Dokumentanalyse-Bericht",
    zh: "文档分析报告",
  },
  fileInformation: {
    en: "File Information",
    es: "Información del Archivo",
    fr: "Information sur le Fichier",
    de: "Datei-Information",
    zh: "文件信息",
  },
  fileName: {
    en: "File Name",
    es: "Nombre del Archivo",
    fr: "Nom du Fichier",
    de: "Dateiname",
    zh: "文件名",
  },
  fileSize: {
    en: "File Size",
    es: "Tamaño del Archivo",
    fr: "Taille du Fichier",
    de: "Dateigröße",
    zh: "文件大小",
  },
  sentimentAnalysis: {
    en: "Sentiment Analysis",
    es: "Análisis de Sentimiento",
    fr: "Analyse de Sentiment",
    de: "Stimmungsanalyse",
    zh: "情感分析",
  },
  generatedOn: {
    en: "Generated on",
    es: "Generado el",
    fr: "Généré le",
    de: "Erstellt am",
    zh: "生成于",
  },
  of: {
    en: "of",
    es: "de",
    fr: "de",
    de: "von",
    zh: "共",
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
  occurrences: {
    en: "Occurrences",
    es: "Ocurrencias",
    fr: "Occurrences",
    de: "Vorkommen",
    zh: "出现次数",
  },
  emotion: {
    en: "Emotion",
    es: "Emoción",
    fr: "Émotion",
    de: "Emotion",
    zh: "情感",
  },
  mentions: {
    en: "Mentions",
    es: "Menciones",
    fr: "Mentions",
    de: "Erwähnungen",
    zh: "提及",
  },
  documentAnalysis: {
    en: "Document Analysis",
    es: "Análisis de Documento",
    fr: "Analyse de Document",
    de: "Dokumentanalyse",
    zh: "文档分析",
  },
};

// Create the language context
interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  language: "en",
  setLanguage: () => {},
  t: (key) => key,
});

// Language provider component
interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider = ({ children }: LanguageProviderProps) => {
  // Try to get language preference from localStorage
  const getInitialLanguage = (): Language => {
    if (typeof window !== "undefined") {
      const savedLang = localStorage.getItem("language");
      if (savedLang && ["en", "es", "fr", "de", "zh"].includes(savedLang)) {
        return savedLang as Language;
      }
    }
    return "en";
  };

  const [language, setLanguageState] = useState<Language>(getInitialLanguage());

  // Update language and save to localStorage
  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    if (typeof window !== "undefined") {
      localStorage.setItem("language", lang);
    }
  };

  // Translation function
  const t = (key: string): string => {
    if (!translations[key]) {
      console.warn(`Translation key not found: ${key}`);
      return key;
    }
    return translations[key][language] || translations[key].en || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

// Custom hook to use the language context
export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
