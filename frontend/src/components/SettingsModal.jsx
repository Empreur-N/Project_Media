import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import { useTimezone } from '../contexts/TimezoneContext';
import { useDataSaver } from '../contexts/DataSaverContext';
import { useAudioPlayer } from '../contexts/AudioPlayerContext';
import { 
  X, Globe, Moon, Sun, Clock, Zap, Bell, Check, ShieldCheck, 
  Radio, SlidersHorizontal, MapPin, ExternalLink, Sparkles 
} from 'lucide-react';

const EDITIONS = [
  { id: 'fr', code: 'FR', label: 'Français', desc: 'Édition RDC & Afrique', region: 'Kinshasa • Lubumbashi • Paris • Dakar' },
  { id: 'en', code: 'EN', label: 'English', desc: 'International Edition', region: 'Global English Desk • London • New York' },
  { id: 'es', code: 'ES', label: 'Español', desc: 'Edición Global', region: 'América Latina & Mundo' },
];

const SettingsModal = ({ isOpen, onClose }) => {
  const { lang, setLang, t } = useLanguage();
  const { theme, setTheme, isDark } = useTheme();
  const { toggleTimezone, currentDetails } = useTimezone();
  const { dataSaver, toggleDataSaver } = useDataSaver();
  const { radioQuality, toggleRadioQuality } = useAudioPlayer();

  const [pushActive, setPushActive] = useState(
    typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted'
  );
  const [notificationMsg, setNotificationMsg] = useState('');
  const [now, setNow] = useState(new Date());

  // Horloge en direct dans la modale
  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, [isOpen]);

  // Fermer la modale avec la touche Échap
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleTogglePush = async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      setNotificationMsg("Votre navigateur ne prend pas en charge les notifications push.");
      return;
    }
    if (Notification.permission === 'granted') {
      setNotificationMsg("Les alertes Flash Info sont déjà activées sur cet appareil.");
      return;
    }
    try {
      const res = await Notification.requestPermission();
      if (res === 'granted') {
        setPushActive(true);
        setNotificationMsg("Alertes Flash activées. Vous recevrez nos urgences éditoriales en direct.");
        if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
          navigator.serviceWorker.ready.then((reg) => {
            reg.showNotification('LIFE CHANNEL MEDIA', {
              body: 'Alertes Flash Info activées avec succès.',
              icon: '/logo.png',
              badge: '/logo.png'
            });
          });
        }
      } else {
        setNotificationMsg("Autorisation refusée par le navigateur.");
      }
    } catch (e) {
      console.error(e);
      setNotificationMsg("Erreur lors de la configuration des notifications.");
    }
  };

  // Formatage de l'heure locale selon le fuseau
  const formatTime = (offsetHours) => {
    const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
    const tzDate = new Date(utc + (3600000 * offsetHours));
    return tzDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  return (
    <div style={styles.overlay} onClick={onClose} role="dialog" aria-modal="true">
      <div 
        style={styles.modal} 
        onClick={(e) => e.stopPropagation()}
        className="glass-card animate-fade-in"
      >
        {/* En-tête éditorial style France 24 */}
        <div style={styles.header}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={styles.iconCircle}>
              <SlidersHorizontal size={18} style={{ color: 'var(--primary)' }} />
            </div>
            <div>
              <h2 style={styles.title}>{t('settingsTitle')}</h2>
              <p style={styles.subtitle}>{t('settingsSubtitle')}</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            style={styles.closeBtn} 
            aria-label={t('close')}
            title={t('close')}
          >
            <X size={18} />
          </button>
        </div>

        {/* Corps des réglages personnalisés */}
        <div style={styles.body}>

          {/* 1. Édition & Langue (Style France 24 avec codes typographiques élégants) */}
          <div style={styles.section}>
            <div style={styles.sectionHeader}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Globe size={16} style={{ color: 'var(--primary)' }} />
                <h3 style={styles.sectionTitle}>{t('languageSection')}</h3>
              </div>
              <span style={styles.currentBadge}>
                {lang.toUpperCase()} • {lang === 'fr' ? 'Français' : lang === 'en' ? 'English' : 'Español'}
              </span>
            </div>
            <p style={styles.sectionDesc}>{t('languageDesc')}</p>
            
            <div style={styles.grid3}>
              {EDITIONS.map((ed) => {
                const isActive = lang === ed.id;
                return (
                  <button
                    key={ed.id}
                    onClick={() => setLang(ed.id)}
                    style={{
                      ...styles.choiceCard,
                      ...(isActive ? styles.choiceCardActive : {})
                    }}
                    className={`settings-edition-card ${isActive ? 'active' : ''}`}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                      <span style={{
                        ...styles.editionCode,
                        backgroundColor: isActive ? 'var(--primary)' : 'rgba(255, 255, 255, 0.08)',
                        color: isActive ? '#171311' : '#F5F3F0'
                      }}>
                        {ed.code}
                      </span>
                      {isActive && <Check size={16} style={{ color: 'var(--primary)' }} />}
                    </div>
                    <span style={styles.choiceTitle}>{ed.label}</span>
                    <span style={styles.choiceSubtitle}>{ed.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Apparence & Confort visuel (Mode Sombre Obsidian / Mode Ivoire Jour) */}
          <div style={styles.section}>
            <div style={styles.sectionHeader}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {isDark ? <Moon size={16} style={{ color: 'var(--primary)' }} /> : <Sun size={16} style={{ color: 'var(--warning)' }} />}
                <h3 style={styles.sectionTitle}>{t('themeSection')}</h3>
              </div>
              <span style={styles.currentBadge}>
                {isDark ? 'Obsidienne Nuit' : 'Ivoire Jour'}
              </span>
            </div>
            <p style={styles.sectionDesc}>{t('themeDesc')}</p>

            <div style={styles.grid2}>
              <button
                onClick={() => setTheme('dark')}
                style={{
                  ...styles.themeCard,
                  ...(isDark ? styles.choiceCardActive : {}),
                  background: 'linear-gradient(135deg, rgba(22, 17, 14, 0.96) 0%, rgba(11, 8, 7, 0.98) 100%)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Moon size={18} style={{ color: 'var(--primary)' }} />
                    <span style={styles.choiceTitle}>{t('darkMode')}</span>
                  </div>
                  {isDark && <Check size={16} style={{ color: 'var(--primary)' }} />}
                </div>
                <span style={styles.choiceSubtitle}>{t('darkDesc')}</span>
              </button>

              <button
                onClick={() => setTheme('light')}
                style={{
                  ...styles.themeCard,
                  ...(!isDark ? styles.choiceCardActive : {}),
                  background: 'linear-gradient(135deg, #FAF7F2 0%, #EDE6DD 100%)',
                  color: '#1A1512'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Sun size={18} style={{ color: '#D97706' }} />
                    <span style={{ ...styles.choiceTitle, color: '#1A1512' }}>{t('lightMode')}</span>
                  </div>
                  {!isDark && <Check size={16} style={{ color: '#8A48D4' }} />}
                </div>
                <span style={{ ...styles.choiceSubtitle, color: '#6B5E52' }}>{t('lightDesc')}</span>
              </button>
            </div>
          </div>

          {/* 3. Fuseaux Horaires Officiels RDC avec Horloge Temps Réel */}
          <div style={styles.section}>
            <div style={styles.sectionHeader}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Clock size={16} style={{ color: 'var(--primary)' }} />
                <h3 style={styles.sectionTitle}>{t('timezoneSection')}</h3>
              </div>
              <span style={styles.currentBadge}>
                {currentDetails.key === 'KINSHASA' ? 'Kinshasa GMT+1' : 'Lubumbashi GMT+2'}
              </span>
            </div>
            <p style={styles.sectionDesc}>{t('timezoneDesc')}</p>

            <div style={styles.grid2}>
              <button
                onClick={() => {
                  if (currentDetails.key !== 'KINSHASA') toggleTimezone();
                }}
                style={{
                  ...styles.choiceCard,
                  ...(currentDetails.key === 'KINSHASA' ? styles.choiceCardActive : {})
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Clock size={15} style={{ color: currentDetails.key === 'KINSHASA' ? 'var(--primary)' : 'var(--text-muted)' }} />
                    <span style={{ fontSize: '11px', fontWeight: '800', letterSpacing: '0.04em' }}>
                      {formatTime(1)} (WAT)
                    </span>
                  </div>
                  {currentDetails.key === 'KINSHASA' && <Check size={16} style={{ color: 'var(--primary)' }} />}
                </div>
                <span style={styles.choiceTitle}>{t('kinshasaTz')}</span>
                <span style={styles.choiceSubtitle}>{t('kinshasaRegion')}</span>
              </button>

              <button
                onClick={() => {
                  if (currentDetails.key !== 'LUBUMBASHI') toggleTimezone();
                }}
                style={{
                  ...styles.choiceCard,
                  ...(currentDetails.key === 'LUBUMBASHI' ? styles.choiceCardActive : {})
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Clock size={15} style={{ color: currentDetails.key === 'LUBUMBASHI' ? 'var(--primary)' : 'var(--text-muted)' }} />
                    <span style={{ fontSize: '11px', fontWeight: '800', letterSpacing: '0.04em' }}>
                      {formatTime(2)} (CAT)
                    </span>
                  </div>
                  {currentDetails.key === 'LUBUMBASHI' && <Check size={16} style={{ color: 'var(--primary)' }} />}
                </div>
                <span style={styles.choiceTitle}>{t('lubumbashiTz')}</span>
                <span style={styles.choiceSubtitle}>{t('lubumbashiRegion')}</span>
              </button>
            </div>
          </div>

          {/* 4. Optimisation Réseau & Forfait Mobile RDC */}
          <div style={styles.section}>
            <div style={styles.subSectionRow}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', flex: 1, paddingRight: '16px' }}>
                <Zap size={18} fill={dataSaver ? 'var(--primary)' : 'none'} style={{ color: 'var(--primary)', flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <h3 style={styles.sectionTitle}>{t('dataSaverSection')}</h3>
                  <p style={styles.sectionDesc}>{t('dataSaverDesc')}</p>
                </div>
              </div>
              <button 
                onClick={toggleDataSaver}
                style={{
                  ...styles.toggleSwitch,
                  background: dataSaver ? 'var(--primary)' : 'rgba(255, 255, 255, 0.12)'
                }}
                aria-label={t('dataSaverSection')}
              >
                <div style={{
                  ...styles.toggleCircle,
                  transform: dataSaver ? 'translateX(22px)' : 'translateX(0)',
                  background: dataSaver ? '#171311' : '#ffffff'
                }} />
              </button>
            </div>

            {/* Qualité Audio du Direct Radio */}
            <div style={{ ...styles.subSectionRow, marginTop: '16px', paddingTop: '14px', borderTop: '1px dashed rgba(255, 255, 255, 0.08)' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', flex: 1, paddingRight: '16px' }}>
                <Radio size={18} style={{ color: 'var(--primary)', flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <h3 style={styles.sectionTitle}>{t('radioQualitySection')}</h3>
                  <p style={styles.sectionDesc}>{t('radioQualityDesc')}</p>
                </div>
              </div>
              <button
                onClick={toggleRadioQuality}
                style={{
                  padding: '6px 14px',
                  fontSize: '11.5px',
                  borderRadius: '9999px',
                  whiteSpace: 'nowrap',
                  background: radioQuality === 'standard' ? 'rgba(216, 180, 254, 0.14)' : 'rgba(255, 255, 255, 0.06)',
                  border: `1px solid ${radioQuality === 'standard' ? 'var(--primary)' : 'var(--border-color)'}`,
                  color: radioQuality === 'standard' ? 'var(--primary)' : 'var(--text-main)',
                  fontWeight: '700',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                title="Basculer le débit du direct radio"
              >
                {radioQuality === 'standard' ? t('radioHd') : t('radioEco')}
              </button>
            </div>
          </div>

          {/* 5. Alertes d'Actualité & Flash Info */}
          <div style={styles.section}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', flex: 1, paddingRight: '16px' }}>
                <Bell size={18} fill={pushActive ? 'var(--primary)' : 'none'} style={{ color: 'var(--primary)', flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <h3 style={styles.sectionTitle}>{t('pushAlertsSection')}</h3>
                  <p style={styles.sectionDesc}>{t('pushAlertsDesc')}</p>
                  {notificationMsg && (
                    <p style={{ fontSize: '11px', color: 'var(--primary)', marginTop: '4px', fontWeight: '600' }}>
                      {notificationMsg}
                    </p>
                  )}
                </div>
              </div>
              <button
                onClick={handleTogglePush}
                style={{
                  padding: '6px 14px',
                  fontSize: '11.5px',
                  borderRadius: '9999px',
                  whiteSpace: 'nowrap',
                  background: pushActive ? 'rgba(216, 180, 254, 0.18)' : 'rgba(255, 255, 255, 0.05)',
                  border: `1px solid ${pushActive ? 'var(--primary)' : 'var(--border-color)'}`,
                  color: pushActive ? 'var(--primary)' : 'var(--text-main)',
                  fontWeight: '700',
                  cursor: 'pointer'
                }}
              >
                {pushActive ? t('alertsActive') : t('alertsInactive')}
              </button>
            </div>
          </div>

          {/* 6. Mentions Éditoriales & Déontologie */}
          <div style={{ ...styles.section, borderBottom: 'none', paddingBottom: 0 }}>
            <div style={styles.aboutBox}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <ShieldCheck size={16} style={{ color: 'var(--primary)' }} />
                <span style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-main)', letterSpacing: '0.04em' }}>
                  {t('aboutSection')}
                </span>
                <span style={{ fontSize: '10px', color: 'var(--text-muted)', marginLeft: 'auto' }}>
                  {t('aboutVersion')}
                </span>
              </div>
              <p style={{ fontSize: '11px', color: 'var(--text-muted)', lineHeight: '1.45', margin: 0 }}>
                {t('aboutEditorial')}
              </p>
            </div>
          </div>

        </div>

        {/* Footer avec bouton d'enregistrement élégant */}
        <div style={styles.footer}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', color: 'var(--text-muted)' }}>
            <ShieldCheck size={14} style={{ color: 'var(--primary)' }} />
            <span>LIFE CHANNEL MEDIA • RDC</span>
          </div>
          <button 
            onClick={onClose} 
            className="btn btn-primary"
            style={styles.saveBtn}
          >
            {t('saveClose')}
          </button>
        </div>
      </div>
    </div>
  );
};

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.78)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999999,
    padding: '16px',
    boxSizing: 'border-box',
  },
  modal: {
    width: '100%',
    maxWidth: '580px',
    maxHeight: '92vh',
    background: 'linear-gradient(180deg, var(--bg-surface, #15100E) 0%, var(--bg-main, #0D0A08) 100%)',
    border: '1px solid var(--border-color, rgba(192, 192, 192, 0.2))',
    borderRadius: '20px',
    boxShadow: '0 24px 70px rgba(0, 0, 0, 0.75), 0 0 40px rgba(216, 180, 254, 0.12)',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    boxSizing: 'border-box',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '18px 24px',
    borderBottom: '1px solid var(--border-color, rgba(255, 255, 255, 0.08))',
    background: 'rgba(255, 255, 255, 0.02)',
  },
  iconCircle: {
    width: '38px',
    height: '38px',
    borderRadius: '10px',
    background: 'rgba(107, 79, 56, 0.25)',
    border: '1px solid rgba(192, 192, 192, 0.22)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  title: {
    fontSize: '15.5px',
    fontWeight: '800',
    color: 'var(--text-main, #F5F3F0)',
    letterSpacing: '0.04em',
    textTransform: 'uppercase',
    margin: 0,
    lineHeight: 1.2,
  },
  subtitle: {
    fontSize: '11px',
    color: 'var(--text-muted, #8E8A85)',
    margin: '3px 0 0 0',
  },
  closeBtn: {
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    color: 'var(--text-muted, #8E8A85)',
    cursor: 'pointer',
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s',
  },
  body: {
    padding: '18px 24px',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    maxHeight: 'calc(92vh - 140px)',
  },
  section: {
    display: 'flex',
    flexDirection: 'column',
    paddingBottom: '18px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
  },
  subSectionRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '4px',
  },
  sectionTitle: {
    fontSize: '13.5px',
    fontWeight: '800',
    color: 'var(--text-main, #F5F3F0)',
    letterSpacing: '0.02em',
    margin: 0,
  },
  currentBadge: {
    fontSize: '10px',
    fontWeight: '800',
    color: 'var(--primary, #D8B4FE)',
    background: 'rgba(216, 180, 254, 0.12)',
    padding: '3px 9px',
    borderRadius: '9999px',
    border: '1px solid rgba(216, 180, 254, 0.28)',
    letterSpacing: '0.04em',
  },
  sectionDesc: {
    fontSize: '11.5px',
    color: 'var(--text-muted, #8E8A85)',
    margin: '0 0 12px 0',
    lineHeight: 1.45,
  },
  grid3: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '10px',
  },
  grid2: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '10px',
  },
  choiceCard: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    padding: '12px 14px',
    borderRadius: '12px',
    background: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid var(--border-color, rgba(192, 192, 192, 0.18))',
    color: 'var(--text-main, #F5F3F0)',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    textAlign: 'left',
    boxSizing: 'border-box',
  },
  themeCard: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    padding: '14px',
    borderRadius: '14px',
    border: '1px solid var(--border-color, rgba(192, 192, 192, 0.18))',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    textAlign: 'left',
    boxSizing: 'border-box',
  },
  choiceCardActive: {
    borderColor: 'var(--primary, #D8B4FE)',
    background: 'rgba(216, 180, 254, 0.12)',
    boxShadow: '0 0 18px rgba(216, 180, 254, 0.18)',
  },
  editionCode: {
    fontSize: '11px',
    fontWeight: '900',
    padding: '3px 8px',
    borderRadius: '6px',
    letterSpacing: '0.08em',
  },
  choiceTitle: {
    fontSize: '12.5px',
    fontWeight: '800',
    marginTop: '6px',
    color: 'var(--text-main, #F5F3F0)',
  },
  choiceSubtitle: {
    fontSize: '10px',
    color: 'var(--text-muted, #8E8A85)',
    marginTop: '2px',
    lineHeight: 1.3,
  },
  toggleSwitch: {
    width: '46px',
    height: '24px',
    borderRadius: '12px',
    border: 'none',
    cursor: 'pointer',
    padding: '2px',
    display: 'flex',
    alignItems: 'center',
    transition: 'background-color 0.25s ease',
    flexShrink: 0,
  },
  toggleCircle: {
    width: '20px',
    height: '20px',
    borderRadius: '50%',
    transition: 'transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
  },
  aboutBox: {
    padding: '12px 14px',
    borderRadius: '12px',
    background: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid rgba(255, 255, 255, 0.06)',
  },
  footer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '14px 24px',
    borderTop: '1px solid var(--border-color, rgba(255, 255, 255, 0.08))',
    background: 'rgba(255, 255, 255, 0.02)',
  },
  saveBtn: {
    padding: '8px 22px',
    fontSize: '12px',
    fontWeight: '800',
    letterSpacing: '0.04em',
    borderRadius: '9999px',
  }
};

export default SettingsModal;