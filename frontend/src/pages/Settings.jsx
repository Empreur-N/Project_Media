import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import { useTimezone } from '../contexts/TimezoneContext';
import { useDataSaver } from '../contexts/DataSaverContext';
import { useAudioPlayer } from '../contexts/AudioPlayerContext';
import { 
  ArrowLeft, Globe, Moon, Sun, Clock, Zap, Radio, Bell, 
  ShieldCheck, Check, RefreshCw, Phone, Mail, SlidersHorizontal, 
  Sparkles, CheckCircle2, FileText, ChevronRight
} from 'lucide-react';

const EDITIONS = [
  { 
    id: 'fr', 
    code: 'FR', 
    title: 'Français — Édition RDC & Afrique', 
    subtitle: 'Kinshasa • Lubumbashi • Goma • Paris • Dakar', 
    badge: 'Langue officielle RDC',
    coverage: 'Couverture complète des 26 provinces de la RDC, actualités panafricaines et internationales en continu.'
  },
  { 
    id: 'en', 
    code: 'EN', 
    title: 'English — International Edition', 
    subtitle: 'Global English Desk • London • Washington • Nairobi', 
    badge: 'International',
    coverage: 'Comprehensive African affairs, global diplomacy, business and Central African market intelligence.'
  },
  { 
    id: 'es', 
    code: 'ES', 
    title: 'Español — Edición Global', 
    subtitle: 'Mundo hispanohablante • América Latina & Europa', 
    badge: 'Edición Global',
    coverage: 'Actualidad internacional, diplomacia mundial y cobertura de acontecimientos económicos africanos.'
  },
];

const Settings = () => {
  const navigate = useNavigate();
  const { lang, setLang, t } = useLanguage();
  const { theme, setTheme, isDark } = useTheme();
  const { timezone, toggleTimezone, currentDetails } = useTimezone();
  const { dataSaver, toggleDataSaver } = useDataSaver();
  const { radioQuality, toggleRadioQuality } = useAudioPlayer();

  const [pushActive, setPushActive] = useState(
    typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted'
  );
  const [notificationMsg, setNotificationMsg] = useState('');
  const [now, setNow] = useState(new Date());
  const [cacheClearing, setCacheClearing] = useState(false);
  const [cacheSuccess, setCacheSuccess] = useState(false);
  const [fontSize, setFontSize] = useState(localStorage.getItem('lc_font_size') || 'normal'); // 'normal' | 'comfort' | 'large'

  // Horloge en direct pour les fuseaux RDC
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (offsetHours) => {
    const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
    const tzDate = new Date(utc + (3600000 * offsetHours));
    return tzDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const handleTogglePush = async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      setNotificationMsg("Votre navigateur ne prend pas en charge les notifications push.");
      return;
    }
    if (Notification.permission === 'granted') {
      setNotificationMsg("Les alertes Flash Info sont déjà activées et synchronisées.");
      return;
    }
    try {
      const res = await Notification.requestPermission();
      if (res === 'granted') {
        setPushActive(true);
        setNotificationMsg("Alertes Flash Info activées. Vous recevrez nos urgences éditoriales en direct.");
        if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
          navigator.serviceWorker.ready.then((reg) => {
            reg.showNotification('LIFE CHANNEL MEDIA', {
              body: 'Alertes Flash Info activées avec succès sur cet appareil.',
              icon: '/logo.png',
              badge: '/logo.png'
            });
          });
        }
      } else {
        setNotificationMsg("Autorisation refusée dans les paramètres de votre navigateur.");
      }
    } catch (e) {
      console.error(e);
      setNotificationMsg("Erreur lors de la configuration des notifications.");
    }
  };

  const handleClearCache = async () => {
    setCacheClearing(true);
    try {
      if ('caches' in window) {
        const keys = await caches.keys();
        await Promise.all(keys.map(key => caches.delete(key)));
      }
      localStorage.removeItem('lc_articles_cache');
      setCacheSuccess(true);
      setTimeout(() => {
        window.location.reload();
      }, 800);
    } catch (err) {
      console.error("Erreur de purge du cache:", err);
      window.location.reload();
    }
  };

  const handleFontSizeChange = (size) => {
    setFontSize(size);
    localStorage.setItem('lc_font_size', size);
    document.documentElement.setAttribute('data-font-size', size);
  };

  return (
    <div style={styles.pageWrapper} className="settings-page-container">
      <div className="container" style={styles.container}>
        
        {/* Fil d'Ariane & Bouton retour */}
        <div style={styles.breadcrumbBar}>
          <button 
            onClick={() => navigate(-1)} 
            style={styles.backBtn}
            className="settings-back-btn"
            title="Revenir à la page précédente"
          >
            <ArrowLeft size={16} />
            <span>Retour</span>
          </button>
          <div style={styles.breadcrumbPath}>
            <Link to="/" style={styles.breadcrumbLink}>Accueil</Link>
            <span style={styles.breadcrumbSep}>/</span>
            <span style={styles.breadcrumbCurrent}>Réglages & Préférences</span>
          </div>
        </div>

        {/* En-tête Principal de la page (Bespoke Editorial Standard France 24) */}
        <header style={styles.pageHeader}>
          <div style={styles.headerTitleRow}>
            <div style={styles.titleIconBox}>
              <SlidersHorizontal size={26} style={{ color: 'var(--primary)' }} />
            </div>
            <div>
              <div style={styles.kicker}>PORTAIL MULTIMÉDIA RDC</div>
              <h1 style={styles.mainTitle}>RÉGLAGES & PRÉFÉRENCES ÉDITORIALES</h1>
            </div>
          </div>
          <p style={styles.leadText}>
            Configurez sur mesure votre expérience de consultation : choix de l'édition internationale, confort visuel de lecture, optimisation des données mobiles et alertes d'actualité en direct.
          </p>
        </header>

        {/* Grille principale des réglages */}
        <div style={styles.settingsGrid} className="settings-sections-grid">
          
          {/* ========================================================
              BLOC 1 : ÉDITION & COUVERTURE ÉDITORIALE
              ======================================================== */}
          <section style={styles.card} className="glass-card settings-card">
            <div style={styles.cardHeader}>
              <div style={styles.cardHeaderTitle}>
                <Globe size={18} style={{ color: 'var(--primary)' }} />
                <h2>Édition Régionale & Langue</h2>
              </div>
              <span style={styles.headerBadge}>
                {lang === 'fr' ? 'ÉDITION RDC' : lang === 'en' ? 'INTERNATIONAL' : 'GLOBAL'}
              </span>
            </div>
            <p style={styles.cardDesc}>
              Sélectionnez l'édition éditoriale qui régit le traitement de l'information et les langues des dépêches.
            </p>

            <div style={styles.editionList}>
              {EDITIONS.map((ed) => {
                const isSelected = lang === ed.id;
                return (
                  <div
                    key={ed.id}
                    onClick={() => setLang(ed.id)}
                    style={{
                      ...styles.editionItem,
                      ...(isSelected ? styles.editionItemActive : {})
                    }}
                    className={`edition-choice-row ${isSelected ? 'active' : ''}`}
                    role="button"
                    tabIndex={0}
                  >
                    <div style={styles.editionCodeBadge}>
                      <span style={{
                        ...styles.editionCodeText,
                        backgroundColor: isSelected ? 'var(--primary)' : 'rgba(255, 255, 255, 0.06)',
                        color: isSelected ? '#15100E' : '#F5F3F0'
                      }}>
                        {ed.code}
                      </span>
                    </div>

                    <div style={styles.editionDetails}>
                      <div style={styles.editionTitleRow}>
                        <span style={styles.editionName}>{ed.title}</span>
                        <span style={styles.editionTag}>{ed.badge}</span>
                      </div>
                      <div style={styles.editionSubtitle}>{ed.subtitle}</div>
                      <div style={styles.editionCoverage}>{ed.coverage}</div>
                    </div>

                    <div style={styles.editionRadioCircle}>
                      {isSelected ? (
                        <div style={styles.radioSelected}>
                          <Check size={14} style={{ color: '#15100E' }} />
                        </div>
                      ) : (
                        <div style={styles.radioUnselected} />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* ========================================================
              BLOC 2 : APPARENCE & CONFORT DE LECTURE
              ======================================================== */}
          <section style={styles.card} className="glass-card settings-card">
            <div style={styles.cardHeader}>
              <div style={styles.cardHeaderTitle}>
                {isDark ? <Moon size={18} style={{ color: 'var(--primary)' }} /> : <Sun size={18} style={{ color: '#d97706' }} />}
                <h2>Apparence & Confort de Lecture</h2>
              </div>
              <span style={styles.headerBadge}>
                {isDark ? 'MODE OBSIDIENNE' : 'MODE IVOIRE'}
              </span>
            </div>
            <p style={styles.cardDesc}>
              Adaptez le contraste lumineux de l'interface pour un confort optimal de lecture le jour comme la nuit.
            </p>

            {/* Sélecteur de Thème Sombre / Clair */}
            <div style={styles.themeGrid}>
              <button
                type="button"
                onClick={() => setTheme('dark')}
                style={{
                  ...styles.themeOptionCard,
                  ...(isDark ? styles.themeOptionActive : {}),
                  background: 'linear-gradient(135deg, rgba(24, 18, 15, 0.98) 0%, rgba(12, 9, 8, 1) 100%)',
                }}
                className={`theme-selector-box ${isDark ? 'active' : ''}`}
              >
                <div style={styles.themePreviewHeader}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Moon size={18} style={{ color: 'var(--primary)' }} />
                    <span style={styles.themeOptionTitle}>Obsidienne Nuit</span>
                  </div>
                  {isDark && (
                    <span style={styles.activePill}>Actif</span>
                  )}
                </div>
                <p style={styles.themeOptionDesc}>
                  Fond noir profond, touches d'ambre doré et lavande. Reposant pour les yeux en faible éclairage.
                </p>
                <div style={styles.colorPalettePreview}>
                  <span style={{ ...styles.paletteDot, background: '#120E0C' }} />
                  <span style={{ ...styles.paletteDot, background: '#6B4F38' }} />
                  <span style={{ ...styles.paletteDot, background: '#D8B4FE' }} />
                  <span style={{ ...styles.paletteDot, background: '#C0C0C0' }} />
                </div>
              </button>

              <button
                type="button"
                onClick={() => setTheme('light')}
                style={{
                  ...styles.themeOptionCard,
                  ...(!isDark ? styles.themeOptionActive : {}),
                  background: 'linear-gradient(135deg, #FAF7F2 0%, #EDE6DD 100%)',
                  color: '#1A1512'
                }}
                className={`theme-selector-box ${!isDark ? 'active' : ''}`}
              >
                <div style={styles.themePreviewHeader}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Sun size={18} style={{ color: '#d97706' }} />
                    <span style={{ ...styles.themeOptionTitle, color: '#1A1512' }}>Ivoire Jour</span>
                  </div>
                  {!isDark && (
                    <span style={{ ...styles.activePill, background: '#8A48D4', color: '#fff' }}>Actif</span>
                  )}
                </div>
                <p style={{ ...styles.themeOptionDesc, color: '#6B5E52' }}>
                  Fond crème satiné et typographie d'encre noble pour une lisibilité parfaite sous le soleil.
                </p>
                <div style={styles.colorPalettePreview}>
                  <span style={{ ...styles.paletteDot, background: '#FAF7F2', border: '1px solid #d4c8b8' }} />
                  <span style={{ ...styles.paletteDot, background: '#8A48D4' }} />
                  <span style={{ ...styles.paletteDot, background: '#D97706' }} />
                  <span style={{ ...styles.paletteDot, background: '#1A1512' }} />
                </div>
              </button>
            </div>

            {/* Calibrage de la taille de police pour les articles */}
            <div style={styles.fontSizeSection}>
              <div style={styles.fontSizeHeader}>
                <span style={styles.subSettingTitle}>Taille de la typographie éditoriale</span>
                <span style={styles.fontSizeCurrentLabel}>
                  {fontSize === 'normal' ? 'Standard (100%)' : fontSize === 'comfort' ? 'Confort (115%)' : 'Grand Format (130%)'}
                </span>
              </div>
              <div style={styles.fontSizeButtonsRow}>
                <button
                  type="button"
                  onClick={() => handleFontSizeChange('normal')}
                  style={{
                    ...styles.fontSizeBtn,
                    ...(fontSize === 'normal' ? styles.fontSizeBtnActive : {})
                  }}
                >
                  <span style={{ fontSize: '13px' }}>A</span>
                  <span>Standard</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleFontSizeChange('comfort')}
                  style={{
                    ...styles.fontSizeBtn,
                    ...(fontSize === 'comfort' ? styles.fontSizeBtnActive : {})
                  }}
                >
                  <span style={{ fontSize: '15px', fontWeight: '700' }}>A+</span>
                  <span>Confort</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleFontSizeChange('large')}
                  style={{
                    ...styles.fontSizeBtn,
                    ...(fontSize === 'large' ? styles.fontSizeBtnActive : {})
                  }}
                >
                  <span style={{ fontSize: '18px', fontWeight: '800' }}>A++</span>
                  <span>Grand</span>
                </button>
              </div>
            </div>
          </section>

          {/* ========================================================
              BLOC 3 : RÉSEAU & OPTIMISATION MOBILE RDC
              ======================================================== */}
          <section style={styles.card} className="glass-card settings-card">
            <div style={styles.cardHeader}>
              <div style={styles.cardHeaderTitle}>
                <Zap size={18} style={{ color: 'var(--primary)' }} />
                <h2>Réseau Mobile RDC & Économie de Données</h2>
              </div>
              <span style={styles.headerBadge}>
                {dataSaver ? 'MODE ÉCO ACTIF' : 'QUALITÉ HD'}
              </span>
            </div>
            <p style={styles.cardDesc}>
              Outils spécialement conçus pour préserver votre forfait mobile et assurer une fluidité maximale sur les réseaux 3G/4G en RDC (Vodacom, Airtel, Orange, Africell).
            </p>

            <div style={styles.toggleRowBox}>
              <div style={styles.toggleTextGroup}>
                <div style={styles.subSettingTitle}>Mode Économie de données (Data Saver)</div>
                <div style={styles.subSettingDesc}>
                  Compresse les visuels en basse résolution et bloque la lecture automatique des vidéos pour économiser vos mégas.
                </div>
              </div>
              <button
                type="button"
                onClick={toggleDataSaver}
                style={{
                  ...styles.iosToggleSwitch,
                  backgroundColor: dataSaver ? 'var(--primary)' : 'rgba(255, 255, 255, 0.15)'
                }}
                aria-label="Activer le mode économie de données"
              >
                <div style={{
                  ...styles.iosToggleKnob,
                  transform: dataSaver ? 'translateX(24px)' : 'translateX(0)',
                  backgroundColor: dataSaver ? '#171311' : '#ffffff'
                }} />
              </button>
            </div>

            {/* Qualité audio du direct Radio 24/7 */}
            <div style={{ ...styles.toggleRowBox, borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <div style={styles.toggleTextGroup}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Radio size={16} style={{ color: 'var(--primary)' }} />
                  <span style={styles.subSettingTitle}>Débit du flux Radio en Direct 24/7</span>
                </div>
                <div style={styles.subSettingDesc}>
                  Choisissez entre le flux acoustique haute fidélité ou le flux compressé optimisé pour les connexions lentes.
                </div>
              </div>
              <button
                type="button"
                onClick={toggleRadioQuality}
                style={{
                  ...styles.qualitySelectorBtn,
                  borderColor: radioQuality === 'standard' ? 'var(--primary)' : 'var(--border-color)',
                  background: radioQuality === 'standard' ? 'rgba(216, 180, 254, 0.14)' : 'rgba(255, 255, 255, 0.05)',
                  color: radioQuality === 'standard' ? 'var(--primary)' : 'var(--text-main)',
                }}
                title="Basculer la qualité du flux radio"
              >
                {radioQuality === 'standard' ? 'Haute Définition (128 kbps)' : 'Basse consommation (48 kbps)'}
              </button>
            </div>

            {/* Bouton de purge du cache local */}
            <div style={{ ...styles.toggleRowBox, borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <div style={styles.toggleTextGroup}>
                <div style={styles.subSettingTitle}>Maintenance du cache de l'appareil</div>
                <div style={styles.subSettingDesc}>
                  Supprime la mémoire tampon locale pour forcer le chargement immédiat des toutes dernières mises à jour du site.
                </div>
                {cacheSuccess && (
                  <div style={{ fontSize: '11px', color: '#10b981', marginTop: '4px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <CheckCircle2 size={13} /> Cache vidé avec succès ! Actualisation en cours...
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={handleClearCache}
                disabled={cacheClearing}
                style={styles.clearCacheBtn}
                title="Purger le cache local du navigateur"
              >
                <RefreshCw size={14} className={cacheClearing ? 'spin' : ''} />
                <span>{cacheClearing ? 'Purge en cours...' : 'Vider le cache'}</span>
              </button>
            </div>
          </section>

          {/* ========================================================
              BLOC 4 : FUSEAUX HORAIRES OFFICIELS RDC (AVEC HORLOGE LIVE)
              ======================================================== */}
          <section style={styles.card} className="glass-card settings-card">
            <div style={styles.cardHeader}>
              <div style={styles.cardHeaderTitle}>
                <Clock size={18} style={{ color: 'var(--primary)' }} />
                <h2>Fuseaux Horaires & Horodatage RDC</h2>
              </div>
              <span style={styles.headerBadge}>
                {currentDetails.key === 'KINSHASA' ? 'FUSEAU KINSHASA' : 'FUSEAU LUBUMBASHI'}
              </span>
            </div>
            <p style={styles.cardDesc}>
              Synchronisation des dépêches et des éditions télé/radio selon l'heure officielle de votre province.
            </p>

            <div style={styles.timezoneGrid}>
              {/* Option Kinshasa UTC+1 */}
              <div
                onClick={() => {
                  if (currentDetails.key !== 'KINSHASA') toggleTimezone();
                }}
                style={{
                  ...styles.timezoneCard,
                  ...(currentDetails.key === 'KINSHASA' ? styles.timezoneCardActive : {})
                }}
                className={`timezone-select-box ${currentDetails.key === 'KINSHASA' ? 'active' : ''}`}
                role="button"
                tabIndex={0}
              >
                <div style={styles.tzTopRow}>
                  <div style={styles.tzTimeBadge}>
                    <Clock size={14} style={{ color: currentDetails.key === 'KINSHASA' ? 'var(--primary)' : 'var(--text-muted)' }} />
                    <span style={styles.tzLiveClock}>{formatTime(1)}</span>
                    <span style={styles.tzUtcTag}>WAT (UTC+1)</span>
                  </div>
                  {currentDetails.key === 'KINSHASA' && (
                    <span style={styles.tzActiveDot}>Actif</span>
                  )}
                </div>
                <div style={styles.tzTitle}>Kinshasa & Ouest de la RDC</div>
                <div style={styles.tzProvinces}>
                  Kinshasa, Kongo Central, Kwango, Kwilu, Mai-Ndombe, Équateur, Mongala, Nord/Sud-Ubangi, Tshuapa.
                </div>
              </div>

              {/* Option Lubumbashi UTC+2 */}
              <div
                onClick={() => {
                  if (currentDetails.key !== 'LUBUMBASHI') toggleTimezone();
                }}
                style={{
                  ...styles.timezoneCard,
                  ...(currentDetails.key === 'LUBUMBASHI' ? styles.timezoneCardActive : {})
                }}
                className={`timezone-select-box ${currentDetails.key === 'LUBUMBASHI' ? 'active' : ''}`}
                role="button"
                tabIndex={0}
              >
                <div style={styles.tzTopRow}>
                  <div style={styles.tzTimeBadge}>
                    <Clock size={14} style={{ color: currentDetails.key === 'LUBUMBASHI' ? 'var(--primary)' : 'var(--text-muted)' }} />
                    <span style={styles.tzLiveClock}>{formatTime(2)}</span>
                    <span style={styles.tzUtcTag}>CAT (UTC+2)</span>
                  </div>
                  {currentDetails.key === 'LUBUMBASHI' && (
                    <span style={styles.tzActiveDot}>Actif</span>
                  )}
                </div>
                <div style={styles.tzTitle}>Lubumbashi, Goma & Est de la RDC</div>
                <div style={styles.tzProvinces}>
                  Haut-Katanga, Lualaba, Haut-Lomami, Tanganyika, Nord-Kivu, Sud-Kivu, Ituri, Kasaï, Maniema, Tshopo.
                </div>
              </div>
            </div>
          </section>

          {/* ========================================================
              BLOC 5 : NOTIFICATIONS FLASH & BREAKING NEWS
              ======================================================== */}
          <section style={styles.card} className="glass-card settings-card">
            <div style={styles.cardHeader}>
              <div style={styles.cardHeaderTitle}>
                <Bell size={18} style={{ color: 'var(--primary)' }} />
                <h2>Alertes d'Actualité & Breaking News</h2>
              </div>
              <span style={styles.headerBadge}>
                {pushActive ? 'ALERTES ACTIVÉES' : 'ALERTES DÉSACTIVÉES'}
              </span>
            </div>
            <p style={styles.cardDesc}>
              Recevez les notifications d'extrême urgence et flashs d'information directement sur votre écran, même lorsque le portail est fermé.
            </p>

            <div style={styles.toggleRowBox}>
              <div style={styles.toggleTextGroup}>
                <div style={styles.subSettingTitle}>Diffusion native des alertes d'urgence</div>
                <div style={styles.subSettingDesc}>
                  Flashs vérifiés par la rédaction centrale. Aucun spam ni message publicitaire.
                </div>
                {notificationMsg && (
                  <div style={{ fontSize: '11px', color: 'var(--primary)', marginTop: '4px', fontWeight: '700' }}>
                    {notificationMsg}
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={handleTogglePush}
                style={{
                  ...styles.actionPillBtn,
                  background: pushActive ? 'rgba(216, 180, 254, 0.18)' : 'rgba(255, 255, 255, 0.06)',
                  borderColor: pushActive ? 'var(--primary)' : 'var(--border-color)',
                  color: pushActive ? 'var(--primary)' : 'var(--text-main)',
                }}
              >
                {pushActive ? 'Désactiver les alertes' : 'Activer les alertes flash'}
              </button>
            </div>
          </section>

          {/* ========================================================
              BLOC 6 : DÉONTOLOGIE, RÉDACTION & COORDONNÉES OFFICIELLES
              ======================================================== */}
          <section style={styles.card} className="glass-card settings-card">
            <div style={styles.cardHeader}>
              <div style={styles.cardHeaderTitle}>
                <ShieldCheck size={18} style={{ color: 'var(--primary)' }} />
                <h2>Charte Déontologique & Contact Rédaction</h2>
              </div>
              <span style={styles.headerBadge}>CERTIFIÉ CONGO</span>
            </div>
            
            <p style={styles.cardDesc}>
              LIFE CHANNEL adhère aux principes fondamentaux de la liberté de la presse, de l'indépendance éditoriale et de la vérification rigoureuse des faits.
            </p>

            <div style={styles.contactDetailsBox}>
              <div style={styles.contactItem}>
                <Phone size={15} style={{ color: 'var(--primary)', flexShrink: 0 }} />
                <div>
                  <div style={styles.contactLabel}>Ligne Rédaction & Alertes WhatsApp :</div>
                  <div style={styles.contactValue}>+243 979 208 109 &nbsp;•&nbsp; +1 403 362-1837</div>
                </div>
              </div>

              <div style={styles.contactItem}>
                <Mail size={15} style={{ color: 'var(--primary)', flexShrink: 0 }} />
                <div>
                  <div style={styles.contactLabel}>Courriel officiel :</div>
                  <div style={styles.contactValue}>lifechannelactualites@gmail.com</div>
                </div>
              </div>
            </div>

            <div style={styles.aboutFooterRow}>
              <div>
                <span style={{ fontWeight: '800', color: 'var(--text-main)' }}>LIFE CHANNEL MEDIA</span>
                <span style={{ margin: '0 8px', opacity: 0.4 }}>•</span>
                <span style={{ color: 'var(--text-muted)' }}>Version 2.4.0 (Build officiel 2026)</span>
              </div>
              <Link to="/faq" style={styles.faqLink}>
                Consulter la FAQ & Aide <ChevronRight size={14} />
              </Link>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
};

const styles = {
  pageWrapper: {
    padding: '30px 0 80px',
    minHeight: '85vh',
    background: 'var(--bg-main, #0B0807)',
  },
  container: {
    maxWidth: '1100px',
    margin: '0 auto',
    padding: '0 20px',
    boxSizing: 'border-box',
  },
  breadcrumbBar: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    marginBottom: '24px',
    flexWrap: 'wrap',
  },
  backBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 14px',
    borderRadius: '9999px',
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(192, 192, 192, 0.2)',
    color: 'var(--text-main)',
    fontSize: '12px',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  breadcrumbPath: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '12px',
    color: 'var(--text-muted)',
  },
  breadcrumbLink: {
    color: 'var(--text-muted)',
    textDecoration: 'none',
  },
  breadcrumbSep: {
    opacity: 0.4,
  },
  breadcrumbCurrent: {
    color: 'var(--primary)',
    fontWeight: '700',
  },
  pageHeader: {
    borderBottom: '1px solid rgba(192, 192, 192, 0.16)',
    paddingBottom: '24px',
    marginBottom: '32px',
  },
  headerTitleRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    marginBottom: '12px',
  },
  titleIconBox: {
    width: '52px',
    height: '52px',
    borderRadius: '14px',
    background: 'rgba(107, 79, 56, 0.22)',
    border: '1px solid rgba(192, 192, 192, 0.25)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.4)',
  },
  kicker: {
    fontSize: '10.5px',
    fontWeight: '800',
    letterSpacing: '0.12em',
    color: 'var(--marron-light, #C0A080)',
    textTransform: 'uppercase',
  },
  mainTitle: {
    fontSize: '26px',
    fontWeight: '900',
    letterSpacing: '0.04em',
    color: 'var(--text-main, #F5F3F0)',
    margin: '2px 0 0',
    fontFamily: 'var(--font-luxury), Playfair Display, serif',
  },
  leadText: {
    fontSize: '14px',
    lineHeight: '1.6',
    color: 'var(--text-secondary, #B8B3AD)',
    maxWidth: '820px',
    margin: 0,
  },
  settingsGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  card: {
    borderRadius: '16px',
    border: '1px solid rgba(192, 192, 192, 0.18)',
    padding: '24px',
    background: 'linear-gradient(180deg, rgba(22, 17, 14, 0.85) 0%, rgba(13, 10, 8, 0.95) 100%)',
    boxShadow: '0 12px 35px rgba(0, 0, 0, 0.4)',
    boxSizing: 'border-box',
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: '12px',
    marginBottom: '8px',
  },
  cardHeaderTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    fontSize: '16px',
    fontWeight: '800',
    color: 'var(--text-main, #F5F3F0)',
  },
  headerBadge: {
    fontSize: '10px',
    fontWeight: '800',
    letterSpacing: '0.08em',
    padding: '3px 10px',
    borderRadius: '9999px',
    background: 'rgba(216, 180, 254, 0.12)',
    border: '1px solid rgba(216, 180, 254, 0.28)',
    color: 'var(--primary)',
  },
  cardDesc: {
    fontSize: '12.5px',
    color: 'var(--text-muted, #8E8A85)',
    margin: '0 0 20px',
    lineHeight: '1.5',
  },
  editionList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  editionItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    padding: '16px',
    borderRadius: '12px',
    border: '1px solid rgba(192, 192, 192, 0.14)',
    background: 'rgba(255, 255, 255, 0.02)',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  editionItemActive: {
    borderColor: 'var(--primary, #D8B4FE)',
    background: 'rgba(216, 180, 254, 0.08)',
    boxShadow: '0 0 20px rgba(216, 180, 254, 0.12)',
  },
  editionCodeBadge: {
    flexShrink: 0,
  },
  editionCodeText: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '42px',
    height: '42px',
    borderRadius: '10px',
    fontSize: '15px',
    fontWeight: '900',
    letterSpacing: '0.06em',
  },
  editionDetails: {
    flex: 1,
    minWidth: 0,
  },
  editionTitleRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    flexWrap: 'wrap',
  },
  editionName: {
    fontSize: '14px',
    fontWeight: '800',
    color: 'var(--text-main, #F5F3F0)',
  },
  editionTag: {
    fontSize: '9.5px',
    fontWeight: '700',
    padding: '1px 6px',
    borderRadius: '4px',
    background: 'rgba(255, 255, 255, 0.06)',
    color: 'var(--text-secondary)',
    textTransform: 'uppercase',
  },
  editionSubtitle: {
    fontSize: '11.5px',
    color: 'var(--marron-light, #C0A080)',
    marginTop: '2px',
    fontWeight: '600',
  },
  editionCoverage: {
    fontSize: '11px',
    color: 'var(--text-muted, #8E8A85)',
    marginTop: '4px',
    lineHeight: '1.35',
  },
  editionRadioCircle: {
    flexShrink: 0,
  },
  radioSelected: {
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    backgroundColor: 'var(--primary, #D8B4FE)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioUnselected: {
    width: '22px',
    height: '22px',
    borderRadius: '50%',
    border: '2px solid rgba(192, 192, 192, 0.3)',
  },
  themeGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '16px',
    marginBottom: '20px',
  },
  themeOptionCard: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    padding: '18px',
    borderRadius: '14px',
    border: '1px solid rgba(192, 192, 192, 0.16)',
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'all 0.2s ease',
    boxSizing: 'border-box',
  },
  themeOptionActive: {
    borderColor: 'var(--primary, #D8B4FE)',
    boxShadow: '0 0 24px rgba(216, 180, 254, 0.18)',
  },
  themePreviewHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: '8px',
  },
  themeOptionTitle: {
    fontSize: '14px',
    fontWeight: '800',
    color: 'var(--text-main, #F5F3F0)',
  },
  activePill: {
    fontSize: '9.5px',
    fontWeight: '800',
    padding: '2px 8px',
    borderRadius: '9999px',
    background: 'var(--primary)',
    color: '#15100E',
    letterSpacing: '0.04em',
    textTransform: 'uppercase',
  },
  themeOptionDesc: {
    fontSize: '11.5px',
    color: 'var(--text-muted, #8E8A85)',
    margin: '0 0 14px',
    lineHeight: '1.4',
  },
  colorPalettePreview: {
    display: 'flex',
    gap: '6px',
    marginTop: 'auto',
  },
  paletteDot: {
    width: '18px',
    height: '18px',
    borderRadius: '50%',
  },
  fontSizeSection: {
    padding: '16px',
    borderRadius: '12px',
    background: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid rgba(255, 255, 255, 0.06)',
  },
  fontSizeHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '12px',
  },
  subSettingTitle: {
    fontSize: '13px',
    fontWeight: '800',
    color: 'var(--text-main, #F5F3F0)',
  },
  fontSizeCurrentLabel: {
    fontSize: '11.5px',
    color: 'var(--primary)',
    fontWeight: '700',
  },
  fontSizeButtonsRow: {
    display: 'flex',
    gap: '10px',
  },
  fontSizeBtn: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '4px',
    padding: '10px',
    borderRadius: '8px',
    background: 'rgba(255, 255, 255, 0.04)',
    border: '1px solid rgba(192, 192, 192, 0.15)',
    color: 'var(--text-main)',
    cursor: 'pointer',
    fontSize: '11.5px',
    transition: 'all 0.2s',
  },
  fontSizeBtnActive: {
    borderColor: 'var(--primary)',
    background: 'rgba(216, 180, 254, 0.12)',
    color: 'var(--primary)',
    fontWeight: '800',
  },
  toggleRowBox: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '16px 0',
    gap: '16px',
  },
  toggleTextGroup: {
    flex: 1,
  },
  subSettingDesc: {
    fontSize: '11.5px',
    color: 'var(--text-muted, #8E8A85)',
    marginTop: '3px',
    lineHeight: '1.4',
  },
  iosToggleSwitch: {
    width: '50px',
    height: '26px',
    borderRadius: '13px',
    border: 'none',
    cursor: 'pointer',
    padding: '2px',
    display: 'flex',
    alignItems: 'center',
    transition: 'background-color 0.25s ease',
    flexShrink: 0,
  },
  iosToggleKnob: {
    width: '22px',
    height: '22px',
    borderRadius: '50%',
    transition: 'transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
  },
  qualitySelectorBtn: {
    padding: '8px 16px',
    fontSize: '12px',
    fontWeight: '700',
    borderRadius: '9999px',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    transition: 'all 0.2s',
    border: '1px solid',
  },
  clearCacheBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 16px',
    borderRadius: '9999px',
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(192, 192, 192, 0.25)',
    color: 'var(--text-main)',
    fontSize: '12px',
    fontWeight: '700',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    transition: 'all 0.2s',
  },
  timezoneGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '14px',
  },
  timezoneCard: {
    display: 'flex',
    flexDirection: 'column',
    padding: '16px',
    borderRadius: '12px',
    border: '1px solid rgba(192, 192, 192, 0.16)',
    background: 'rgba(255, 255, 255, 0.02)',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  timezoneCardActive: {
    borderColor: 'var(--primary, #D8B4FE)',
    background: 'rgba(216, 180, 254, 0.08)',
    boxShadow: '0 0 20px rgba(216, 180, 254, 0.14)',
  },
  tzTopRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '8px',
  },
  tzTimeBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  tzLiveClock: {
    fontSize: '13px',
    fontWeight: '900',
    letterSpacing: '0.04em',
    color: 'var(--text-main)',
  },
  tzUtcTag: {
    fontSize: '10px',
    color: 'var(--text-muted)',
  },
  tzActiveDot: {
    fontSize: '9.5px',
    fontWeight: '800',
    color: '#15100E',
    background: 'var(--primary)',
    padding: '1px 6px',
    borderRadius: '4px',
    textTransform: 'uppercase',
  },
  tzTitle: {
    fontSize: '13.5px',
    fontWeight: '800',
    color: 'var(--text-main)',
    marginBottom: '4px',
  },
  tzProvinces: {
    fontSize: '11px',
    color: 'var(--text-muted)',
    lineHeight: '1.4',
  },
  actionPillBtn: {
    padding: '8px 18px',
    fontSize: '12px',
    fontWeight: '800',
    borderRadius: '9999px',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    border: '1px solid',
    transition: 'all 0.2s',
  },
  contactDetailsBox: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    padding: '16px',
    borderRadius: '12px',
    background: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid rgba(255, 255, 255, 0.06)',
    marginBottom: '16px',
  },
  contactItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  contactLabel: {
    fontSize: '11px',
    color: 'var(--text-muted)',
  },
  contactValue: {
    fontSize: '13px',
    fontWeight: '800',
    color: 'var(--text-main)',
    letterSpacing: '0.02em',
  },
  aboutFooterRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: '10px',
    fontSize: '11.5px',
  },
  faqLink: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    color: 'var(--primary)',
    fontWeight: '700',
    textDecoration: 'none',
  }
};

export default Settings;