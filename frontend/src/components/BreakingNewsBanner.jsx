import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, X, ArrowRight, Bell, Check } from 'lucide-react';
import { getApiUrl } from '../utils/urlUtils';

const BreakingNewsBanner = () => {
  const [alert, setAlert] = useState(null);
  const [pushSubscribed, setPushSubscribed] = useState(
    typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted'
  );

  const handleEnablePush = async () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      try {
        const perm = await Notification.requestPermission();
        if (perm === 'granted') {
          setPushSubscribed(true);
          const notifTitle = '🔴 LIFE CHANNEL MEDIA';
          const notifOptions = {
            body: '✅ Alertes Flash activées ! Vous recevrez désormais les urgences en direct sur cet appareil.',
            icon: '/logo.png',
            badge: '/logo.png'
          };
          if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
            navigator.serviceWorker.ready.then((reg) => {
              reg.showNotification(notifTitle, notifOptions);
            });
          } else {
            new Notification(notifTitle, notifOptions);
          }
        }
      } catch (err) {
        console.error('Erreur demande permission Web Push:', err);
      }
    }
  };

  useEffect(() => {
    let eventSource = null;
    let reconnectTimeout = null;

    const connectSSE = () => {
      try {
        eventSource = new EventSource(`${getApiUrl()}/notifications/stream`);

        eventSource.addEventListener('breaking-news', (event) => {
          try {
            const data = JSON.parse(event.data);
            setAlert(data);

            // Déclenchement de la notification native Web Push (Desktop & Mobile Android)
            if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
              const notifTitle = data.title ? `🔴 ALERTE INFO : ${data.title}` : '🔴 ALERTE INFO — LIFE CHANNEL';
              const notifOptions = {
                body: data.message || 'Information urgente en direct.',
                icon: '/logo.png',
                badge: '/logo.png',
                tag: 'breaking-' + (data.id || Date.now()),
                vibrate: [200, 100, 200],
                data: { url: data.articleId ? `/articles/${data.articleId}` : '/' }
              };

              if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
                navigator.serviceWorker.ready.then((reg) => {
                  reg.showNotification(notifTitle, notifOptions);
                }).catch(() => {
                  new Notification(notifTitle, notifOptions);
                });
              } else {
                new Notification(notifTitle, notifOptions);
              }
            }
          } catch (err) {
            console.error('Erreur parsing SSE Breaking News:', err);
          }
        });

        eventSource.onerror = () => {
          if (eventSource) {
            eventSource.close();
          }
          // Reconnexion automatique avec délai de sécurité
          reconnectTimeout = setTimeout(connectSSE, 10000);
        };
      } catch (e) {
        console.warn('SSE non disponible:', e);
      }
    };

    connectSSE();

    return () => {
      if (eventSource) eventSource.close();
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
    };
  }, []);

  if (!alert) return null;

  return (
    <div style={styles.bannerContainer} className="animate-fade-in">
      <div className="container" style={styles.contentWrapper}>
        <div style={styles.badgeWrapper}>
          <span style={styles.pulseDot} />
          <span style={styles.badgeText}>ALERTE INFO</span>
        </div>

        <div style={styles.textContainer}>
          <strong style={styles.title}>{alert.title} :</strong>
          <span style={styles.message}> {alert.message}</span>
        </div>

        <div style={styles.actionWrapper}>
          {!pushSubscribed && (
            <button 
              onClick={handleEnablePush} 
              style={styles.pushBtn} 
              title="Recevoir les prochaines alertes d'urgence sur votre téléphone ou PC"
            >
              <Bell size={12} />
              <span>Activer alertes</span>
            </button>
          )}

          {alert.articleId && (
            <Link 
              to={`/articles/${alert.articleId}`} 
              style={styles.detailLink}
              onClick={() => setAlert(null)}
            >
              <span>Lire</span>
              <ArrowRight size={13} />
            </Link>
          )}

          <button 
            onClick={() => setAlert(null)} 
            style={styles.closeBtn} 
            title="Masquer l'alerte"
          >
            <X size={15} />
          </button>
        </div>
      </div>
    </div>
  );
};

const styles = {
  bannerContainer: {
    width: '100%',
    backgroundColor: '#dc2626',
    background: 'linear-gradient(90deg, #b91c1c 0%, #dc2626 50%, #991b1b 100%)',
    color: '#ffffff',
    padding: '8px 16px',
    boxSizing: 'border-box',
    borderBottom: '2px solid rgba(255, 255, 255, 0.2)',
    boxShadow: '0 4px 12px rgba(220, 38, 38, 0.4)',
    zIndex: 10000,
    position: 'relative',
  },
  contentWrapper: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '12px',
    flexWrap: 'wrap',
  },
  badgeWrapper: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    padding: '3px 8px',
    borderRadius: '4px',
    flexShrink: 0,
  },
  pulseDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    backgroundColor: '#ffffff',
    boxShadow: '0 0 8px #ffffff',
    animation: 'pulse 1s infinite alternate',
  },
  badgeText: {
    fontSize: '11px',
    fontWeight: '900',
    letterSpacing: '0.8px',
    color: '#ffffff',
  },
  textContainer: {
    flex: '1 1 auto',
    fontSize: '13px',
    lineHeight: '1.4',
    minWidth: '200px',
  },
  title: {
    fontWeight: '800',
    color: '#fef08a',
  },
  message: {
    fontWeight: '500',
    color: '#ffffff',
  },
  actionWrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    flexShrink: 0,
  },
  detailLink: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    backgroundColor: '#ffffff',
    color: '#b91c1c',
    padding: '3px 10px',
    borderRadius: '12px',
    fontSize: '11px',
    fontWeight: '700',
    textDecoration: 'none',
    transition: 'opacity 0.2s',
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    color: 'rgba(255, 255, 255, 0.8)',
    cursor: 'pointer',
    padding: '2px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pushBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '5px',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    border: '1px solid rgba(255, 255, 255, 0.4)',
    color: '#ffffff',
    padding: '3px 10px',
    borderRadius: '12px',
    fontSize: '11px',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
};

export default BreakingNewsBanner;