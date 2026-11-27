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
    settingsTitle: 'Réglages & Préférences',
    settingsSubtitle: 'Personnalisez votre édition, votre affichage et votre consommation de données',
    languageSection: 'Édition & Langue',
    languageDesc: 'Sélectionnez l’édition éditoriale correspondant à votre zone de lecture',
    editionFr: 'Édition RDC & Afrique',
    editionEn: 'International Edition',
    editionEs: 'Edición Global',
    themeSection: 'Apparence & Confort visuel',
    themeDesc: 'Basculez entre le mode sombre obsidian et le mode ivoire clair',
    darkMode: 'Mode Sombre',
    lightMode: 'Mode Clair',
    darkDesc: 'Obsidienne, or ambré et reflets argentés',
    lightDesc: 'Ivoire chaud, typographie haute lisibilité',
    timezoneSection: 'Fuseau horaire & Horodatage',
    timezoneDesc: 'Basculez entre les deux fuseaux officiels de la République Démocratique du Congo',
    kinshasaTz: 'Kinshasa & Ouest (UTC+1)',
    lubumbashiTz: 'Lubumbashi & Est (UTC+2)',
    kinshasaRegion: 'Kinshasa, Kongo Central, Équateur, Kwilu',
    lubumbashiRegion: 'Haut-Katanga, Lualaba, Nord & Sud-Kivu, Kasaï',
    dataSaverSection: 'Économie de données mobiles',
    dataSaverDesc: 'Compresse les images et réduit la bande passante sur les réseaux mobiles 3G/4G.',
    dataSaverActive: 'Mode Éco actif (Données préservées)',
    dataSaverInactive: 'Qualité maximale (HD intégrale)',
    radioQualitySection: 'Qualité du direct Radio 24/7',
    radioQualityDesc: 'Ajustez le débit du flux radio pour préserver votre forfait mobile',
    radioHd: 'Haute Définition (128 kbps)',
    radioEco: 'Basse consommation (48 kbps)',
    pushAlertsSection: 'Alertes d’actualité (Flash Info)',
    pushAlertsDesc: 'Recevez les breaking news et notifications urgentes en temps réel sur cet appareil.',
    alertsActive: 'Alertes Flash activées',
    alertsInactive: 'Activer les alertes Flash',
    aboutSection: 'À propos de Life Channel',
    aboutVersion: 'Version 2.4.0 (Édition Média RDC)',
    aboutEditorial: 'Information certifiée, indépendante et libre d’accès.',
    close: 'Fermer les paramètres',
    saveClose: 'Enregistrer les préférences',

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
    settingsTitle: 'Settings & Preferences',
    settingsSubtitle: 'Customize your edition, display style, and mobile data usage',
    languageSection: 'Edition & Language',
    languageDesc: 'Select the editorial edition corresponding to your reading region',
    editionFr: 'DRC & Africa Edition',
    editionEn: 'International Edition',
    editionEs: 'Global Edition',
    themeSection: 'Appearance & Visual Comfort',
    themeDesc: 'Switch between obsidian dark mode and warm ivory light mode',
    darkMode: 'Dark Mode',
    lightMode: 'Light Mode',
    darkDesc: 'Obsidian, amber gold and subtle silver accents',
    lightDesc: 'Warm ivory, high-legibility typography',
    timezoneSection: 'Timezone & Timestamps',
    timezoneDesc: 'Toggle between the two official timezones of the Democratic Republic of the Congo',
    kinshasaTz: 'Kinshasa & West (UTC+1)',
    lubumbashiTz: 'Lubumbashi & East (UTC+2)',
    kinshasaRegion: 'Kinshasa, Kongo Central, Equateur, Kwilu',
    lubumbashiRegion: 'Katanga, Kivu, Great Orient, Kasai',
    dataSaverSection: 'Mobile Data Saver',
    dataSaverDesc: 'Compresses images and saves bandwidth across 3G/4G mobile networks.',
    dataSaverActive: 'Data Saver active (Data preserved)',
    dataSaverInactive: 'Full quality (High-resolution media)',
    radioQualitySection: 'Radio 24/7 Stream Quality',
    radioQualityDesc: 'Adjust live radio stream bitrate to preserve your mobile plan',
    radioHd: 'High Definition (128 kbps)',
    radioEco: 'Low consumption (48 kbps)',
    pushAlertsSection: 'Breaking News Alerts',
    pushAlertsDesc: 'Receive instant breaking news and urgent notices directly on this device.',
    alertsActive: 'Flash alerts enabled',
    alertsInactive: 'Enable Flash alerts',
    aboutSection: 'About Life Channel',
    aboutVersion: 'Version 2.4.0 (DRC Media Edition)',
    aboutEditorial: 'Certified, independent, open-access journalism.',
    close: 'Close settings',
    saveClose: 'Save preferences',

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
    settingsTitle: 'Ajustes y Preferencias',
    settingsSubtitle: 'Personalice su edición, apariencia y consumo de datos móviles',
    languageSection: 'Edición e Idioma',
    languageDesc: 'Seleccione la edición editorial correspondiente a su región de lectura',
    editionFr: 'Edición RDC y África',
    editionEn: 'Edición Internacional',
    editionEs: 'Edición Global',
    themeSection: 'Apariencia y Confort visual',
    themeDesc: 'Alterne entre el modo oscuro obsidiana y el modo claro marfil',
    darkMode: 'Modo Oscuro',
    lightMode: 'Modo Claro',
    darkDesc: 'Obsidiana, oro ámbar y sutiles toques plateados',
    lightDesc: 'Marfil cálido, tipografía de alta legibilidad',
    timezoneSection: 'Zona horaria y Marcas de tiempo',
    timezoneDesc: 'Alterne entre las dos zonas horarias oficiales de la República Democrática del Congo',
    kinshasaTz: 'Kinshasa y Oeste (UTC+1)',
    lubumbashiTz: 'Lubumbashi y Este (UTC+2)',
    kinshasaRegion: 'Kinshasa, Kongo Central, Ecuador, Kwilu',
    lubumbashiRegion: 'Katanga, Kivu, Gran Oriente, Kasái',
    dataSaverSection: 'Ahorro de datos móviles',
    dataSaverDesc: 'Comprime las imágenes y reduce el ancho de banda en redes móviles 3G/4G.',
    dataSaverActive: 'Modo Ahorro activo (Datos preservados)',
    dataSaverInactive: 'Calidad máxima (Medios en alta resolución)',
    radioQualitySection: 'Calidad de Radio 24/7 en directo',
    radioQualityDesc: 'Ajuste la tasa de bits del flujo de radio para cuidar su plan móvil',
    radioHd: 'Alta Definición (128 kbps)',
    radioEco: 'Bajo consumo (48 kbps)',
    pushAlertsSection: 'Alertas de noticias urgentes (Flash Info)',
    pushAlertsDesc: 'Reciba noticias de última hora y avisos urgentes en tiempo real en este dispositivo.',
    alertsActive: 'Alertas Flash activadas',
    alertsInactive: 'Activar alertas Flash',
    aboutSection: 'Acerca de Life Channel',
    aboutVersion: 'Versión 2.4.0 (Edición Medios RDC)',
    aboutEditorial: 'Periodismo certificado, independiente y de libre acceso.',
    close: 'Cerrar ajustes',
    saveClose: 'Guardar preferencias',

    // Ticker & Feed
    flashInfo: 'ÚLTIMA HORA',
    listenRadio: 'ESCUCHAR RADIO 24/7',
    readArticle: 'Leer artículo',
    latestArticles: 'Últimas Noticias',
    loading: 'Cargando contenido...',

    // Mobile Bottom Nav & Regions
    bottomNavTopStories: 'À la une',
    bottomNavLive: 'Direct TV',
    bottomNavFeed: 'En continu',
    bottomNavReplays: 'Replays',
    bottomNavMenu: 'Menu',
    regionAll: 'À la une',
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
