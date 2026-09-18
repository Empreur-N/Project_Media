import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, X, ArrowRight } from 'lucide-react';

const BreakingNewsBanner = () => {
  const [alert, setAlert] = useState(null);

  useEffect(() => {
    let eventSource = null;
    let reconnectTimeout = null;

    const connectSSE = () => {
      try {
        eventSource = new EventSource('http://localhost:8080/api/notifications/stream');

        eventSource.addEventListener('breaking-news', (event) => {
          try {
            const data = JSON.parse(event.data);
            setAlert(data);
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
};

export default BreakingNewsBanner;