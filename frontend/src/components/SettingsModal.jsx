import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import { useTimezone } from '../contexts/TimezoneContext';
import { useDataSaver } from '../contexts/DataSaverContext';
import { X, Globe, Moon, Sun, Clock, Zap, Bell, Check, Shield } from 'lucide-react';

const SettingsModal = ({ isOpen, onClose }) => {
  const { lang, setLang, t } = useLanguage();
  const { theme, setTheme, isDark } = useTheme();
  const { toggleTimezone, currentDetails } = useTimezone();
  const { dataSaver, toggleDataSaver } = useDataSaver();

  const [pushActive, setPushActive] = useState(
    typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted'
  );
  const [notificationMsg, setNotificationMsg] = useState('');

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
      setNotificationMsg("Votre navigateur ne prend pas en charge les alertes push.");
      return;
    }
    if (Notification.permission === 'granted') {
      setNotificationMsg("Les alertes Flash sont déjà autorisées et actives sur votre appareil.");
      return;
    }
    try {
      const res = await Notification.requestPermission();
      if (res === 'granted') {
        setPushActive(true);
        setNotificationMsg("✅ Alertes Flash activées ! Vous recevrez nos breaking news en direct.");
        if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
          navigator.serviceWorker.ready.then((reg) => {
            reg.showNotification('🔴 LIFE CHANNEL MEDIA', {
              body: '✅ Alertes Flash activées avec succès !',
              icon: '/logo.png',
              badge: '/logo.png'
            });
          });
        }
      } else {
        setNotificationMsg("Autorisation refusée dans le navigateur.");
      }
    } catch (e) {
      console.error(e);
      setNotificationMsg("Erreur lors de la configuration des notifications.");
    }
  };

  return (
    <div style={styles.overlay} onClick={onClose} role="dialog" aria-modal="true">
      <div 
        style={styles.modal} 
        onClick={(e) => e.stopPropagation()}
        className="glass-card animate-fade-in"
      >
        {/* Header */}
        <div style={styles.header}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={styles.iconCircle}>
              <span style={{ fontSize: '18px' }}>⚙️</span>
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
            <X size={20} />
          </button>
        </div>

        {/* Content body */}
        <div style={styles.body}>

          {/* 1. Choix de la Langue */}
          <div style={styles.section}>
            <div style={styles.sectionHeader}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Globe size={16} style={{ color: 'var(--primary)' }} />
                <h3 style={styles.sectionTitle}>{t('languageSection')}</h3>
              </div>
              <span style={styles.currentBadge}>
                {lang === 'fr' ? '🇫🇷 Français' : lang === 'en' ? '🇬🇧 English' : '🇪🇸 Español'}
              </span>
            </div>
            <p style={styles.sectionDesc}>{t('languageDesc')}</p>
            
            <div style={styles.grid3}>
              <button
                onClick={() => setLang('fr')}
                style={{
                  ...styles.choiceCard,
                  ...(lang === 'fr' ? styles.choiceCardActive : {})
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                  <span style={styles.flagEmoji}>🇫🇷</span>
                  {lang === 'fr' && <Check size={16} style={{ color: 'var(--primary)' }} />}
                </div>
                <span style={styles.choiceTitle}>Français</span>
                <span style={styles.choiceSubtitle}>Langue officielle RDC</span>
              </button>

              <button
                onClick={() => setLang('en')}
                style={{
                  ...styles.choiceCard,
                  ...(lang === 'en' ? styles.choiceCardActive : {})
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                  <span style={styles.flagEmoji}>🇬🇧</span>
                  {lang === 'en' && <Check size={16} style={{ color: 'var(--primary)' }} />}
                </div>
                <span style={styles.choiceTitle}>English</span>
                <span style={styles.choiceSubtitle}>International</span>
              </button>

              <button
                onClick={() => setLang('es')}
                style={{
                  ...styles.choiceCard,
                  ...(lang === 'es' ? styles.choiceCardActive : {})
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                  <span style={styles.flagEmoji}>🇪🇸</span>
                  {lang === 'es' && <Check size={16} style={{ color: 'var(--primary)' }} />}
                </div>
                <span style={styles.choiceTitle}>Español</span>
                <span style={styles.choiceSubtitle}>Hispanoamérica</span>
              </button>
            </div>
          </div>

          {/* 2. Thème visuel (Clair / Sombre) */}
          <div style={styles.section}>
            <div style={styles.sectionHeader}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {isDark ? <Moon size={16} style={{ color: 'var(--primary)' }} /> : <Sun size={16} style={{ color: 'var(--warning)' }} />}
                <h3 style={styles.sectionTitle}>{t('themeSection')}</h3>
              </div>
              <span style={styles.currentBadge}>
                {isDark ? '🌙 Sombre' : '☀️ Clair'}
              </span>
            </div>
            <p style={styles.sectionDesc}>{t('themeDesc')}</p>

            <div style={styles.grid2}>
              <button
                onClick={() => setTheme('dark')}
                style={{
                  ...styles.themeCard,
                  ...(isDark ? styles.choiceCardActive : {}),
                  background: 'linear-gradient(135deg, rgba(20, 16, 14, 0.95) 0%, rgba(10, 8, 7, 0.98) 100%)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                  <Moon size={22} style={{ color: 'var(--primary)' }} />
                  {isDark && <Check size={16} style={{ color: 'var(--primary)' }} />}
                </div>
                <div style={{ marginTop: '6px' }}>
                  <div style={styles.choiceTitle}>{t('darkMode')}</div>
                  <div style={styles.choiceSubtitle}>{t('darkDesc')}</div>
                </div>
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
                  <Sun size={22} style={{ color: '#D97706' }} />
                  {!isDark && <Check size={16} style={{ color: '#8A48D4' }} />}
                </div>
                <div style={{ marginTop: '6px' }}>
                  <div style={{ ...styles.choiceTitle, color: '#1A1512' }}>{t('lightMode')}</div>
                  <div style={{ ...styles.choiceSubtitle, color: '#6B5E52' }}>{t('lightDesc')}</div>
                </div>
              </button>
            </div>
          </div>

          {/* 3. Fuseau Horaire RDC */}
          <div style={styles.section}>
            <div style={styles.sectionHeader}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Clock size={16} style={{ color: 'var(--primary)' }} />
                <h3 style={styles.sectionTitle}>{t('timezoneSection')}</h3>
              </div>
              <span style={styles.currentBadge}>
                {currentDetails.shortBadge} ({currentDetails.key === 'KINSHASA' ? 'Kin' : "L'shi"})
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
                  <span style={styles.clockIcon}>🏙️</span>
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
                  <span style={styles.clockIcon}>⛏️</span>
                  {currentDetails.key === 'LUBUMBASHI' && <Check size={16} style={{ color: 'var(--primary)' }} />}
                </div>
                <span style={styles.choiceTitle}>{t('lubumbashiTz')}</span>
                <span style={styles.choiceSubtitle}>{t('lubumbashiRegion')}</span>
              </button>
            </div>
          </div>

          {/* 4. Mode Économie de Données */}
          <div style={styles.section}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
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
          </div>

          {/* 5. Alertes Flash Info Push */}
          <div style={{ ...styles.section, borderBottom: 'none' }}>
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
                className="btn btn-secondary"
                style={{
                  padding: '6px 14px',
                  fontSize: '11.5px',
                  borderRadius: '9999px',
                  whiteSpace: 'nowrap',
                  background: pushActive ? 'rgba(216, 180, 254, 0.18)' : 'rgba(255, 255, 255, 0.05)',
                  borderColor: pushActive ? 'var(--primary)' : 'var(--border-color)',
                  color: pushActive ? 'var(--primary)' : 'var(--text-main)',
                  fontWeight: '700'
                }}
              >
                {pushActive ? t('alertsActive') : t('alertsInactive')}
              </button>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div style={styles.footer}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'var(--text-muted)' }}>
            <Shield size={13} />
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
    backgroundColor: 'rgba(0, 0, 0, 0.72)',
    backdropFilter: 'blur(8px)',
    WebkitBackdropFilter: 'blur(8px)',
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
    maxHeight: '90vh',
    background: 'linear-gradient(180deg, var(--bg-surface, #140F0D) 0%, var(--bg-main, #0B0807) 100%)',
    border: '1px solid var(--border-color, rgba(192, 192, 192, 0.2))',
    borderRadius: '20px',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.7), 0 0 35px rgba(216, 180, 254, 0.12)',
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
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    background: 'rgba(107, 79, 56, 0.25)',
    border: '1px solid var(--border-color)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: '16px',
    fontWeight: '800',
    color: 'var(--text-main, #F5F3F0)',
    letterSpacing: '0.02em',
    margin: 0,
    lineHeight: 1.2,
  },
  subtitle: {
    fontSize: '11px',
    color: 'var(--text-muted, #8E8A85)',
    margin: '3px 0 0 0',
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--text-muted, #8E8A85)',
    cursor: 'pointer',
    padding: '6px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s',
  },
  body: {
    padding: '16px 24px',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    maxHeight: 'calc(90vh - 140px)',
  },
  section: {
    display: 'flex',
    flexDirection: 'column',
    paddingBottom: '16px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
  },
  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '4px',
  },
  sectionTitle: {
    fontSize: '13.5px',
    fontWeight: '700',
    color: 'var(--text-main, #F5F3F0)',
    margin: 0,
  },
  currentBadge: {
    fontSize: '10px',
    fontWeight: '700',
    color: 'var(--primary, #D8B4FE)',
    background: 'rgba(216, 180, 254, 0.12)',
    padding: '2px 8px',
    borderRadius: '9999px',
    border: '1px solid rgba(216, 180, 254, 0.3)',
  },
  sectionDesc: {
    fontSize: '11.5px',
    color: 'var(--text-muted, #8E8A85)',
    margin: '0 0 12px 0',
    lineHeight: 1.4,
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
    padding: '12px',
    borderRadius: '12px',
    background: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid var(--border-color, rgba(192, 192, 192, 0.18))',
    color: 'var(--text-main, #F5F3F0)',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    textAlign: 'left',
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
  },
  choiceCardActive: {
    borderColor: 'var(--primary, #D8B4FE)',
    background: 'rgba(216, 180, 254, 0.12)',
    boxShadow: '0 0 16px rgba(216, 180, 254, 0.18)',
  },
  flagEmoji: {
    fontSize: '20px',
  },
  clockIcon: {
    fontSize: '18px',
  },
  choiceTitle: {
    fontSize: '12.5px',
    fontWeight: '700',
    marginTop: '6px',
    color: 'var(--text-main, #F5F3F0)',
  },
  choiceSubtitle: {
    fontSize: '10px',
    color: 'var(--text-muted, #8E8A85)',
    marginTop: '2px',
    lineHeight: 1.25,
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
  footer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '14px 24px',
    borderTop: '1px solid var(--border-color, rgba(255, 255, 255, 0.08))',
    background: 'rgba(255, 255, 255, 0.02)',
  },
  saveBtn: {
    padding: '7px 18px',
    fontSize: '12px',
    fontWeight: '800',
    letterSpacing: '0.04em',
    borderRadius: '9999px',
  }
};

export default SettingsModal;
