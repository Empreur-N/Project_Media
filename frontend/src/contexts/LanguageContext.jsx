import React, { createContext, useContext, useState, useEffect } from 'react';

const translations = {
  fr: {
    // Navigation
    news: 'Actualités',
    search: 'Recherche',
    podcasts: 'Podcasts',
    live: 'Direct',
    radio: 'Radio 24/7',
    faq: 'FAQ',
    settings: 'Paramètres',
    console: 'Console',
    logout: 'Déconnexion',
    login: 'Connexion',
    verifiedReader: 'Lecteur Vérifié',

    // Settings Modal
    settingsTitle: 'Centre de Contrôle & Paramètres',
    settingsSubtitle: 'Personnalisez votre expérience de lecture et de diffusion LIFE CHANNEL',
    languageSection: 'Langue du portail',
    languageDesc: 'Sélectionnez votre langue d’affichage préférée',
    themeSection: 'Apparence & Thème visuel',
    themeDesc: 'Basculez entre le mode sombre luxueux et le mode clair haute lisibilité',
    darkMode: 'Mode Sombre',
    lightMode: 'Mode Clair',
    darkDesc: 'Obsidienne, or ambré et lavande',
    lightDesc: 'Ivoire chaud, encre noble et satin',
    timezoneSection: 'Fuseau horaire RDC',
    timezoneDesc: 'Basculez entre les deux fuseaux officiels de la République Démocratique du Congo',
    kinshasaTz: 'Kinshasa (GMT+1)',
    lubumbashiTz: "Lubumbashi (GMT+2)",
    kinshasaRegion: 'Ouest RDC, Équateur, Congo Central',
    lubumbashiRegion: 'Katanga, Kivu, Grand Orient, Kasaï',
    dataSaverSection: 'Mode Économie de données',
    dataSaverDesc: 'Optimise et allège le poids des images pour naviguer avec fluidité sur les connexions mobiles lentes en RDC.',
    dataSaverActive: 'Économie de données active',
    dataSaverInactive: 'Qualité maximale (HD)',
    pushAlertsSection: 'Alertes Flash Info & Breaking News',
    pushAlertsDesc: 'Recevez en temps réel les urgences et grands titres d’actualité directement sur votre appareil.',
    alertsActive: 'Alertes Flash activées',
    alertsInactive: 'Activer les alertes Flash',
    close: 'Fermer les paramètres',
    saveClose: 'Enregistrer & Fermer',

    // Ticker & Feed
    flashInfo: 'FLASH INFO',
    listenRadio: 'ÉCOUTER LA RADIO 24/7',
    readArticle: "Lire l'article",
    latestArticles: 'Dernières Actualités',
    loading: 'Chargement en cours...',

    // Mobile Bottom Nav & Regions
    bottomNavTopStories: 'À la une',
    bottomNavLive: 'Direct TV',
    bottomNavFeed: 'En continu',
    bottomNavReplays: 'Replays',
    bottomNavMenu: 'Menu',
    regionAll: 'À la une',
    regionRdc: 'RDC & Kinshasa',
    regionAfrica: 'Afrique',
    regionWorld: 'Monde',
    regionEurope: 'Europe',
    regionAmericas: 'Amérique',
    regionAsia: 'Asie',
    regionMiddleEast: 'Moyen-Orient',
    regionEconomy: 'Économie',
    regionSports: 'Sports',
    regionCulture: 'Culture & Société',

    // Agent Profile
    agentProfile: 'Mon Profil Agent',
    changePhoto: 'Modifier ma photo de profil',
    photoUrlPlaceholder: 'URL de votre photo ou image...',
    uploadPhoto: 'Téléverser une image',
    saveProfile: 'Mettre à jour le profil',
    photoSuccess: 'Photo de profil mise à jour avec succès !'
  },
  en: {
    // Navigation
    news: 'News',
    search: 'Search',
    podcasts: 'Podcasts',
    live: 'Live Stream',
    radio: 'Radio 24/7',
    faq: 'FAQ',
    settings: 'Settings',
    console: 'Console',
    logout: 'Logout',
    login: 'Login',
    verifiedReader: 'Verified Reader',

    // Settings Modal
    settingsTitle: 'Control Center & Settings',
    settingsSubtitle: 'Customize your LIFE CHANNEL reading and streaming experience',
    languageSection: 'Portal Language',
    languageDesc: 'Select your preferred display language',
    themeSection: 'Appearance & Visual Theme',
    themeDesc: 'Switch between luxury dark mode and high-readability light mode',
    darkMode: 'Dark Mode',
    lightMode: 'Light Mode',
    darkDesc: 'Obsidian, amber gold and lavender',
    lightDesc: 'Warm ivory, noble ink and satin',
    timezoneSection: 'DRC Timezone',
    timezoneDesc: 'Toggle between the two official timezones of the Democratic Republic of the Congo',
    kinshasaTz: 'Kinshasa (GMT+1)',
    lubumbashiTz: 'Lubumbashi (GMT+2)',
    kinshasaRegion: 'West DRC, Equateur, Central Congo',
    lubumbashiRegion: 'Katanga, Kivu, Great North, Kasai',
    dataSaverSection: 'Data Saver Mode',
    dataSaverDesc: 'Optimizes and lightens images for fluid browsing on low-bandwidth mobile networks across the DRC.',
    dataSaverActive: 'Data Saver enabled',
    dataSaverInactive: 'Maximum quality (HD)',
    pushAlertsSection: 'Flash Alerts & Breaking News',
    pushAlertsDesc: 'Receive urgent breaking news and top headlines in real-time directly on your device.',
    alertsActive: 'Flash alerts enabled',
    alertsInactive: 'Enable Flash alerts',
    close: 'Close settings',
    saveClose: 'Save & Close',

    // Ticker & Feed
    flashInfo: 'BREAKING NEWS',
    listenRadio: 'LISTEN TO RADIO 24/7',
    readArticle: 'Read article',
    latestArticles: 'Latest Stories',
    loading: 'Loading content...',

    // Mobile Bottom Nav & Regions
    bottomNavTopStories: 'Top Stories',
    bottomNavLive: 'Live TV',
    bottomNavFeed: 'Live Feed',
    bottomNavReplays: 'Replays',
    bottomNavMenu: 'Menu',
    regionAll: 'Top Stories',
    regionRdc: 'DRC & Kinshasa',
    regionAfrica: 'Africa',
    regionWorld: 'World',
    regionEurope: 'Europe',
    regionAmericas: 'Americas',
    regionAsia: 'Asia',
    regionMiddleEast: 'Middle East',
    regionEconomy: 'Economy',
    regionSports: 'Sports',
    regionCulture: 'Culture & Society',

    // Agent Profile
    agentProfile: 'My Agent Profile',
    changePhoto: 'Change profile picture',
    photoUrlPlaceholder: 'Image or photo URL...',
    uploadPhoto: 'Upload an image',
    saveProfile: 'Update profile',
    photoSuccess: 'Profile picture successfully updated!'
  },
  es: {
    // Navigation
    news: 'Noticias',
    search: 'Buscar',
    podcasts: 'Pódcasts',
    live: 'En directo',
    radio: 'Radio 24/7',
    faq: 'Preguntas',
    settings: 'Ajustes',
    console: 'Consola',
    logout: 'Cerrar sesión',
    login: 'Iniciar sesión',
    verifiedReader: 'Lector Verificado',

    // Settings Modal
    settingsTitle: 'Centro de Control y Ajustes',
    settingsSubtitle: 'Personalice su experiencia de lectura y emisión en LIFE CHANNEL',
    languageSection: 'Idioma del portal',
    languageDesc: 'Seleccione su idioma de visualización preferido',
    themeSection: 'Apariencia y Tema visual',
    themeDesc: 'Alterne entre el modo oscuro exclusivo y el modo claro de alta legibilidad',
    darkMode: 'Modo Oscuro',
    lightMode: 'Modo Claro',
    darkDesc: 'Obsidiana, oro ámbar y lavanda',
    lightDesc: 'Marfil cálido, tinta noble y satén',
    timezoneSection: 'Zona horaria RDC',
    timezoneDesc: 'Alterne entre las dos zonas horarias oficiales de la República Democrática del Congo',
    kinshasaTz: 'Kinshasa (GMT+1)',
    lubumbashiTz: 'Lubumbashi (GMT+2)',
    kinshasaRegion: 'Oeste RDC, Ecuador, Congo Central',
    lubumbashiRegion: 'Katanga, Kivu, Gran Norte, Kasái',
    dataSaverSection: 'Modo Ahorro de datos',
    dataSaverDesc: 'Optimiza y aligera las imágenes para navegar con fluidez en redes móviles lentas en RDC.',
    dataSaverActive: 'Ahorro de datos activo',
    dataSaverInactive: 'Máxima calidad (HD)',
    pushAlertsSection: 'Alertas de última hora y Flash',
    pushAlertsDesc: 'Reciba noticias urgentes y grandes titulares en tiempo real directamente en su dispositivo.',
    alertsActive: 'Alertas Flash activadas',
    alertsInactive: 'Activar alertas Flash',
    close: 'Cerrar ajustes',
    saveClose: 'Guardar y Cerrar',

    // Ticker & Feed
    flashInfo: 'ÚLTIMA HORA',
    listenRadio: 'ESCUCHAR RADIO 24/7',
    readArticle: 'Leer artículo',
    latestArticles: 'Últimas Noticias',
    loading: 'Cargando contenido...',

    // Mobile Bottom Nav & Regions
    bottomNavTopStories: 'A la una',
    bottomNavLive: 'Directo TV',
    bottomNavFeed: 'En continuo',
    bottomNavReplays: 'Replays',
    bottomNavMenu: 'Menú',
    regionAll: 'A la una',
    regionRdc: 'RDC y Kinshasa',
    regionAfrica: 'África',
    regionWorld: 'Mundo',
    regionEurope: 'Europa',
    regionAmericas: 'América',
    regionAsia: 'Asia',
    regionMiddleEast: 'Oriente Medio',
    regionEconomy: 'Economía',
    regionSports: 'Deportes',
    regionCulture: 'Cultura y Sociedad',

    // Agent Profile
    agentProfile: 'Mi Perfil de Agente',
    changePhoto: 'Cambiar foto de perfil',
    photoUrlPlaceholder: 'URL de su foto o imagen...',
    uploadPhoto: 'Subir una imagen',
    saveProfile: 'Actualizar perfil',
    photoSuccess: '¡Foto de perfil actualizada con éxito!'
  }
};

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [lang, setLangState] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('lc_lang');
      if (saved && ['fr', 'en', 'es'].includes(saved)) return saved;
    }
    return 'fr';
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('lc_lang', lang);
    }
  }, [lang]);

  const setLang = (newLang) => {
    if (['fr', 'en', 'es'].includes(newLang)) {
      setLangState(newLang);
    }
  };

  const t = (key) => {
    const currentDict = translations[lang] || translations.fr;
    return currentDict[key] || translations.fr[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t, availableLangs: ['fr', 'en', 'es'] }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
export default LanguageContext;
