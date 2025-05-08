
import React, { createContext, useContext, useState, useEffect } from 'react';

interface Translations {
  [key: string]: string;
}

interface LanguageContextType {
  language: string;
  setLanguage: (language: string) => void;
  t: (key: string) => string;
  supportedLanguages: { code: string; name: string }[];
}

const translations: Record<string, Record<string, string>> = {
  en: {
    // Common UI elements
    welcome: "Welcome",
    loading: "Loading...",
    error: "Error",
    success: "Success",
    cancel: "Cancel",
    save: "Save",
    delete: "Delete",
    edit: "Edit",
    create: "Create",
    view: "View",
    search: "Search",
    noResultsFound: "No results found",
    home: "Home",
    dashboard: "Dashboard",
    journalAnalysis: "Journal Analysis",
    selectLanguage: "Select Language",
    
    // Navigation and Header
    welcomeToLifePlanner: "Welcome to Your Life Planner",
    planYourLife: "Plan your perfect life, analyze your thoughts, and track your emotional well-being.",
    goToDashboard: "Go to Dashboard",
    
    // Feature highlights
    emotionalInsights: "Emotional Insights",
    journalTracker: "Journal Tracker",
    sentimentAnalysis: "Sentiment Analysis",
    emotionalInsightsDesc: "Gain deep insights into your emotional patterns and understand what drives your feelings.",
    journalTrackerDesc: "Track and analyze your daily thoughts through journaling to identify patterns and trends.",
    sentimentAnalysisDesc: "Understand the sentiment behind your thoughts and track your emotional well-being over time.",
    
    // Mental Health Stats
    mentalHealthInsights: "Mental Health Insights",
    mentalHealthStatistics: "Mental Health Statistics",
    keyFactsAboutMental: "Key facts about mental health prevalence and impact on daily life",
    impactOnDailyLife: "Impact on Daily Life",
    
    // Interactive Visualization
    interactiveVisualization: "Interactive Visualization",
    shortAnalysis: "This is a short analysis and visualization of a generated person's recounting of his experience in a panic attack.",
    viewDetailedAnalysis: "View Detailed Analysis Data",
    originalTextSample: "Original Text Sample",
    keyEmotionalPatterns: "Key Emotional Patterns",
    dominantThemes: "Dominant Themes",
    sentimentDistribution: "Sentiment Distribution",
    negative: "Negative",
    neutral: "Neutral",
    positive: "Positive",
    linguisticMarkers: "Linguistic Markers",
    wordComparison: "Word Comparison",
    
    // Document Analysis
    documentAnalysisWithBERT: "Document Analysis with BERT Model",
    selectedFile: "Selected File",
    noFileSelected: "No file selected",
    wordsExtracted: "words extracted",
    analyzeWithBERT: "Analyze with BERT",
    analyzingWithBERT: "Analyzing with BERT...",
    
    // Perfect Life Plan
    perfectLifeTitle: "What does your Perfect Life Look Like?",
    dailyPlan: "Daily",
    weeklyPlan: "Weekly",
    monthlyPlan: "Monthly",
    dailyPlanPlaceholder: "What does your perfect day look like?",
    weeklyPlanPlaceholder: "What does your perfect week look like?",
    monthlyPlanPlaceholder: "What does your perfect month look like?",
    saveChanges: "Save Changes",
    
    // Specific translations
    uploadDocuments: "Upload Documents",
    analyzeWithGemma3: "Analyze with Gemma 3",
    documentTextVisualization: "Document Text Visualization",
    emotionalAnalysisVisualization: "Emotional Analysis Visualization",
    documentSummary: "Document Summary",
    viewDetailedAnalysisData: "View Detailed Analysis Data",
    sentimentTimeline: "Sentiment Timeline",
    sentimentOverview: "Sentiment Overview",
    entityAnalysis: "Entity Analysis",
    keyPhrases: "Key Phrases",
    latentEmotionalAnalysis: "Latent Emotional Analysis",
    noSummaryAvailable: "No summary available for this document.",
    noTextAvailable: "No text available from document",
    analyzedWords: "Analyzed Words",
    summary: "Summary",
    textSample: "Text Sample",
    showLess: "Show Less",
    viewFullText: "View Full Text",
    fullText: "Full Text",
    pageNumber: "Page Number",
    sentimentScore: "Sentiment Score",
    score: "Score",
    sentiment: "Sentiment",
    page: "Page",
    average: "Average",
    timelineDescription: "This chart shows sentiment changes throughout the document",
    searchWordsOrEmotions: "Search words or emotions...",
    resetView: "Reset View",
    hoverOrClick: "Hover over or click on points to see details",
    selected: "Selected",
    searchWords: "Search words",
    noDataTabName: "No data available for the {tabName} tab",
    dataAvailableMissing: "Some data required for this visualization is not available. Try analyzing the document again or try a different document.",
    latentEmotionalAnalysisTab: "Emotional Analysis",
    overviewTab: "Overview",
    timelineTab: "Timeline",
    themesTab: "Themes",
    keywordsTab: "Keywords",
    hideEmotionalHighlights: "Hide Emotional Highlights",
    showEmotionalHighlights: "Show Emotional Highlights",
    hideNonHighlighted: "Hide Non-Highlighted",
    showAllText: "Show All Text",
    noDataAvailable: "No data available",
    resources: "Resources",
    actionPlans: "Action Plans",
    tips: "Tips",
    compareWords: "Compare Words",
    relationshipAnalysis: "Relationship Analysis",
    selectAnotherWord: "Select another word to compare",
    spatialSimilarity: "Spatial Similarity",
    sentimentSimilarity: "Sentiment Similarity",
    emotionalGrouping: "Emotional Grouping",
    viewResults: "View Results",
    emotionalClusters: "Emotional Clusters",
    showClusters: "Show Clusters",
    wellbeingResources: "Wellbeing Resources",
    suggestedResources: "Suggested Resources",
    basedOnAnalysis: "Based on your document analysis, here are some resources that may be helpful",
    learnMore: "Learn More",
    journalInputTitle: "Daily Check-In Journal",
    journalPrompt: "How are you feeling today?",
    submitEntry: "Submit Entry",
    journalPlaceholder: "Write about your thoughts, feelings, and experiences...",
    journalCache: "Previous Journal Entries",
    yesterdayEntry: "Yesterday",
    todayEntry: "Today",
    lastWeekEntry: "Last Week",
    monthlyReflections: "Monthly Reflections",
    addToMonthly: "Add to Monthly Reflection",
    monthlyReflectionsTitle: "Monthly Reflections & Progress",
    monthlyReflectionsDescription: "Review your emotional journey and track progress over time",
  },
  fr: {
    // Common UI elements
    welcome: "Bienvenue",
    loading: "Chargement...",
    error: "Erreur",
    success: "Succès",
    cancel: "Annuler",
    save: "Sauvegarder",
    delete: "Supprimer",
    edit: "Modifier",
    create: "Créer",
    view: "Voir",
    search: "Rechercher",
    noResultsFound: "Aucun résultat trouvé",
    home: "Accueil",
    dashboard: "Tableau de bord",
    journalAnalysis: "Analyse de Journal",
    selectLanguage: "Sélectionner la langue",
    
    // Navigation and Header
    welcomeToLifePlanner: "Bienvenue dans votre planificateur de vie",
    planYourLife: "Planifiez votre vie parfaite, analysez vos pensées et suivez votre bien-être émotionnel.",
    goToDashboard: "Aller au tableau de bord",
    
    // Feature highlights
    emotionalInsights: "Aperçus émotionnels",
    journalTracker: "Suivi du journal",
    sentimentAnalysis: "Analyse des sentiments",
    emotionalInsightsDesc: "Obtenez des aperçus profonds de vos schémas émotionnels et comprenez ce qui motive vos sentiments.",
    journalTrackerDesc: "Suivez et analysez vos pensées quotidiennes par la tenue d'un journal pour identifier les tendances.",
    sentimentAnalysisDesc: "Comprenez le sentiment derrière vos pensées et suivez votre bien-être émotionnel au fil du temps.",
    
    // Mental Health Stats
    mentalHealthInsights: "Aperçus sur la santé mentale",
    mentalHealthStatistics: "Statistiques de santé mentale",
    keyFactsAboutMental: "Faits clés sur la prévalence de la santé mentale et l'impact sur la vie quotidienne",
    impactOnDailyLife: "Impact sur la vie quotidienne",
    
    // Interactive Visualization
    interactiveVisualization: "Visualisation interactive",
    shortAnalysis: "C'est une courte analyse et visualisation du récit d'une personne sur son expérience d'une crise de panique.",
    viewDetailedAnalysis: "Voir les données d'analyse détaillées",
    originalTextSample: "Exemple de texte original",
    keyEmotionalPatterns: "Modèles émotionnels clés",
    dominantThemes: "Thèmes dominants",
    sentimentDistribution: "Répartition des sentiments",
    negative: "Négatif",
    neutral: "Neutre",
    positive: "Positif",
    linguisticMarkers: "Marqueurs linguistiques",
    wordComparison: "Comparaison de mots",
    
    // Document Analysis
    documentAnalysisWithBERT: "Analyse de document avec le modèle BERT",
    selectedFile: "Fichier sélectionné",
    noFileSelected: "Aucun fichier sélectionné",
    wordsExtracted: "mots extraits",
    analyzeWithBERT: "Analyser avec BERT",
    analyzingWithBERT: "Analyse avec BERT...",
    
    // Perfect Life Plan
    perfectLifeTitle: "À quoi ressemble votre vie parfaite ?",
    dailyPlan: "Quotidien",
    weeklyPlan: "Hebdomadaire",
    monthlyPlan: "Mensuel",
    dailyPlanPlaceholder: "À quoi ressemble votre journée parfaite ?",
    weeklyPlanPlaceholder: "À quoi ressemble votre semaine parfaite ?",
    monthlyPlanPlaceholder: "À quoi ressemble votre mois parfait ?",
    saveChanges: "Enregistrer les modifications",
    
    // Specific translations
    uploadDocuments: "Télécharger des documents",
    analyzeWithGemma3: "Analyser avec Gemma 3",
    documentTextVisualization: "Visualisation de texte de document",
    emotionalAnalysisVisualization: "Visualisation de l'analyse émotionnelle",
    documentSummary: "Résumé du document",
    viewDetailedAnalysisData: "Voir les données d'analyse détaillées",
    sentimentTimeline: "Chronologie des sentiments",
    sentimentOverview: "Aperçu des sentiments",
    entityAnalysis: "Analyse des entités",
    keyPhrases: "Phrases clés",
    latentEmotionalAnalysis: "Analyse émotionnelle latente",
    noSummaryAvailable: "Aucun résumé disponible pour ce document.",
    noTextAvailable: "Aucun texte disponible dans le document",
    analyzedWords: "Mots analysés",
    summary: "Résumé",
    textSample: "Exemple de texte",
    showLess: "Voir moins",
    viewFullText: "Voir le texte complet",
    fullText: "Texte complet",
    pageNumber: "Numéro de page",
    sentimentScore: "Score de sentiment",
    score: "Score",
    sentiment: "Sentiment",
    page: "Page",
    average: "Moyenne",
    timelineDescription: "Ce graphique montre l'évolution des sentiments dans le document",
    searchWordsOrEmotions: "Rechercher des mots ou des émotions...",
    resetView: "Réinitialiser la vue",
    hoverOrClick: "Survolez ou cliquez sur les points pour voir les détails",
    selected: "Sélectionné",
    searchWords: "Rechercher des mots",
    noDataTabName: "Aucune donnée disponible pour l'onglet {tabName}",
    dataAvailableMissing: "Certaines données requises pour cette visualisation ne sont pas disponibles. Essayez d'analyser à nouveau le document ou essayez un document différent.",
    latentEmotionalAnalysisTab: "Analyse émotionnelle",
    overviewTab: "Aperçu",
    timelineTab: "Chronologie",
    themesTab: "Thèmes",
    keywordsTab: "Mots-clés",
    hideEmotionalHighlights: "Masquer les surlignages émotionnels",
    showEmotionalHighlights: "Afficher les surlignages émotionnels",
    hideNonHighlighted: "Masquer les éléments non surlignés",
    showAllText: "Afficher tout le texte",
    noDataAvailable: "Aucune donnée disponible",
    resources: "Ressources",
    actionPlans: "Plans d'action",
    tips: "Conseils",
    compareWords: "Comparer les mots",
    relationshipAnalysis: "Analyse des relations",
    selectAnotherWord: "Sélectionnez un autre mot à comparer",
    spatialSimilarity: "Similarité spatiale",
    sentimentSimilarity: "Similarité de sentiment",
    emotionalGrouping: "Groupement émotionnel",
    viewResults: "Voir les résultats",
    emotionalClusters: "Groupes émotionnels",
    showClusters: "Afficher les groupes",
    wellbeingResources: "Ressources de bien-être",
    suggestedResources: "Ressources suggérées",
    basedOnAnalysis: "Sur la base de l'analyse de votre document, voici quelques ressources qui pourraient vous être utiles",
    learnMore: "En savoir plus",
    journalInputTitle: "Journal de vérification quotidienne",
    journalPrompt: "Comment vous sentez-vous aujourd'hui ?",
    submitEntry: "Soumettre l'entrée",
    journalPlaceholder: "Écrivez sur vos pensées, sentiments et expériences...",
    journalCache: "Entrées de journal précédentes",
    yesterdayEntry: "Hier",
    todayEntry: "Aujourd'hui",
    lastWeekEntry: "La semaine dernière",
    monthlyReflections: "Réflexions mensuelles",
    addToMonthly: "Ajouter à la réflexion mensuelle",
    monthlyReflectionsTitle: "Réflexions mensuelles et progrès",
    monthlyReflectionsDescription: "Examinez votre parcours émotionnel et suivez vos progrès au fil du temps",
  },
  es: {
    // Common UI elements
    welcome: "Bienvenido",
    loading: "Cargando...",
    error: "Error",
    success: "Éxito",
    cancel: "Cancelar",
    save: "Guardar",
    delete: "Eliminar",
    edit: "Editar",
    create: "Crear",
    view: "Ver",
    search: "Buscar",
    noResultsFound: "No se encontraron resultados",
    home: "Inicio",
    dashboard: "Panel",
    journalAnalysis: "Análisis de Diario",
    selectLanguage: "Seleccionar idioma",
    
    // Navigation and Header
    welcomeToLifePlanner: "Bienvenido a tu planificador de vida",
    planYourLife: "Planifica tu vida perfecta, analiza tus pensamientos y haz seguimiento de tu bienestar emocional.",
    goToDashboard: "Ir al panel",
    
    // Feature highlights
    emotionalInsights: "Conocimientos emocionales",
    journalTracker: "Seguimiento de diario",
    sentimentAnalysis: "Análisis de sentimientos",
    emotionalInsightsDesc: "Obtén conocimientos profundos sobre tus patrones emocionales y comprende qué impulsa tus sentimientos.",
    journalTrackerDesc: "Sigue y analiza tus pensamientos diarios a través del diario para identificar patrones y tendencias.",
    sentimentAnalysisDesc: "Comprende el sentimiento detrás de tus pensamientos y sigue tu bienestar emocional a lo largo del tiempo.",
    
    // Mental Health Stats
    mentalHealthInsights: "Conocimientos sobre salud mental",
    mentalHealthStatistics: "Estadísticas de salud mental",
    keyFactsAboutMental: "Datos clave sobre la prevalencia de la salud mental y el impacto en la vida diaria",
    impactOnDailyLife: "Impacto en la vida diaria",
    
    // Interactive Visualization
    interactiveVisualization: "Visualización interactiva",
    shortAnalysis: "Este es un breve análisis y visualización del relato de una persona sobre su experiencia en un ataque de pánico.",
    viewDetailedAnalysis: "Ver datos de análisis detallados",
    originalTextSample: "Muestra de texto original",
    keyEmotionalPatterns: "Patrones emocionales clave",
    dominantThemes: "Temas dominantes",
    sentimentDistribution: "Distribución de sentimientos",
    negative: "Negativo",
    neutral: "Neutral",
    positive: "Positivo",
    linguisticMarkers: "Marcadores lingüísticos",
    wordComparison: "Comparación de palabras",
    
    // Document Analysis
    documentAnalysisWithBERT: "Análisis de documento con modelo BERT",
    selectedFile: "Archivo seleccionado",
    noFileSelected: "No hay archivo seleccionado",
    wordsExtracted: "palabras extraídas",
    analyzeWithBERT: "Analizar con BERT",
    analyzingWithBERT: "Analizando con BERT...",
    
    // Perfect Life Plan
    perfectLifeTitle: "¿Cómo es tu vida perfecta?",
    dailyPlan: "Diario",
    weeklyPlan: "Semanal",
    monthlyPlan: "Mensual",
    dailyPlanPlaceholder: "¿Cómo es tu día perfecto?",
    weeklyPlanPlaceholder: "¿Cómo es tu semana perfecta?",
    monthlyPlanPlaceholder: "¿Cómo es tu mes perfecto?",
    saveChanges: "Guardar cambios",
    
    // Specific translations
    uploadDocuments: "Cargar documentos",
    analyzeWithGemma3: "Analizar con Gemma 3",
    documentTextVisualization: "Visualización de texto de documento",
    emotionalAnalysisVisualization: "Visualización de análisis emocional",
    documentSummary: "Resumen del documento",
    viewDetailedAnalysisData: "Ver datos de análisis detallados",
    sentimentTimeline: "Cronología de sentimientos",
    sentimentOverview: "Visión general de sentimientos",
    entityAnalysis: "Análisis de entidades",
    keyPhrases: "Frases clave",
    latentEmotionalAnalysis: "Análisis emocional latente",
    noSummaryAvailable: "No hay resumen disponible para este documento.",
    noTextAvailable: "No hay texto disponible del documento",
    analyzedWords: "Palabras analizadas",
    summary: "Resumen",
    textSample: "Muestra de texto",
    showLess: "Mostrar menos",
    viewFullText: "Ver texto completo",
    fullText: "Texto completo",
    pageNumber: "Número de página",
    sentimentScore: "Puntuación de sentimiento",
    score: "Puntuación",
    sentiment: "Sentimiento",
    page: "Página",
    average: "Promedio",
    timelineDescription: "Este gráfico muestra los cambios de sentimiento a lo largo del documento",
    searchWordsOrEmotions: "Buscar palabras o emociones...",
    resetView: "Restablecer vista",
    hoverOrClick: "Pase el cursor o haga clic en los puntos para ver detalles",
    selected: "Seleccionado",
    searchWords: "Buscar palabras",
    noDataTabName: "No hay datos disponibles para la pestaña {tabName}",
    dataAvailableMissing: "Algunos datos necesarios para esta visualización no están disponibles. Intente analizar el documento de nuevo o pruebe con un documento diferente.",
    latentEmotionalAnalysisTab: "Análisis emocional",
    overviewTab: "Visión general",
    timelineTab: "Cronología",
    themesTab: "Temas",
    keywordsTab: "Palabras clave",
    hideEmotionalHighlights: "Ocultar resaltados emocionales",
    showEmotionalHighlights: "Mostrar resaltados emocionales",
    hideNonHighlighted: "Ocultar no resaltado",
    showAllText: "Mostrar todo el texto",
    noDataAvailable: "No hay datos disponibles",
    resources: "Recursos",
    actionPlans: "Planes de acción",
    tips: "Consejos",
    compareWords: "Comparar palabras",
    relationshipAnalysis: "Análisis de relaciones",
    selectAnotherWord: "Seleccione otra palabra para comparar",
    spatialSimilarity: "Similitud espacial",
    sentimentSimilarity: "Similitud de sentimiento",
    emotionalGrouping: "Agrupación emocional",
    viewResults: "Ver resultados",
    emotionalClusters: "Grupos emocionales",
    showClusters: "Mostrar grupos",
    wellbeingResources: "Recursos de bienestar",
    suggestedResources: "Recursos sugeridos",
    basedOnAnalysis: "Basado en el análisis de su documento, aquí hay algunos recursos que pueden ser útiles",
    learnMore: "Más información",
    journalInputTitle: "Diario de verificación diaria",
    journalPrompt: "¿Cómo te sientes hoy?",
    submitEntry: "Enviar entrada",
    journalPlaceholder: "Escribe sobre tus pensamientos, sentimientos y experiencias...",
    journalCache: "Entradas anteriores del diario",
    yesterdayEntry: "Ayer",
    todayEntry: "Hoy",
    lastWeekEntry: "La semana pasada",
    monthlyReflections: "Reflexiones mensuales",
    addToMonthly: "Añadir a la reflexión mensual",
    monthlyReflectionsTitle: "Reflexiones mensuales y progreso",
    monthlyReflectionsDescription: "Revisa tu viaje emocional y sigue el progreso a lo largo del tiempo",
  }
};

const supportedLanguages = [
  { code: "en", name: "English" },
  { code: "fr", name: "Français" },
  { code: "es", name: "Español" }
];

const LanguageContext = createContext<LanguageContextType>({
  language: "en",
  setLanguage: () => {},
  t: (key: string) => key,
  supportedLanguages
});

export const LanguageProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [language, setLanguage] = useState("en");
  
  // Restore language preference from local storage
  useEffect(() => {
    const savedLanguage = localStorage.getItem("preferredLanguage");
    if (savedLanguage && translations[savedLanguage]) {
      setLanguage(savedLanguage);
    }
  }, []);
  
  // Save language preference to local storage
  useEffect(() => {
    localStorage.setItem("preferredLanguage", language);
  }, [language]);
  
  // Translation function
  const t = (key: string) => {
    if (translations[language] && translations[language][key]) {
      return translations[language][key];
    }
    
    // Fallback to English if translation is missing
    if (translations.en && translations.en[key]) {
      return translations.en[key];
    }
    
    // Return the key itself if no translation is found
    return key;
  };
  
  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, supportedLanguages }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
