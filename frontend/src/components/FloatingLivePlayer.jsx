import React, { useState, useEffect } from 'react';
import { getActiveLive } from '../services/api';
import { Tv, X, Minimize2, Maximize2 } from 'lucide-react';

const FloatingLivePlayer = () => {
  const [live, setLive] = useState(null);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const checkActiveLive = async () => {
      try {
        const activeData = await getActiveLive();
        if (activeData && activeData.id && activeData.streamUrl) {
          setLive(activeData);
          setIsVisible(true);
        } else {
          setLive(null);
          setIsVisible(false);
        }
      } catch (error) {
        console.error("Erreur de récupération du live flottant:", error);
      }
    };

    checkActiveLive();
    // Check every 2 minutes
    const interval = setInterval(checkActiveLive, 120000);
    return () => clearInterval(interval);
  }, []);

  const getEmbedUrl = (url) => {
    if (!url) return '';
    let regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    let match = url.match(regExp);
    if (match && match[2].length === 11) {
      return `https://www.youtube.com/embed/${match[2]}?autoplay=1&mute=1&controls=1`;
    }
    return url;
  };

  const isYoutube = (url) => {
    if (!url) return false;
    return url.includes('youtube.com') || url.includes('youtu.be');
  };

  if (!isVisible || !live) return null;

  return (
    <div 
      style={{
        ...styles.wrapper,
        ...(isCollapsed ? styles.collapsedWrapper : {})
      }}
      className="glass-card floating-live-widget animate-slide-in"
    >
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.titleGroup}>
          <span style={styles.pulseDot} />
          <span style={styles.titleText}>DIRECT — {live.title}</span>
        </div>
        <div style={styles.actionGroup}>
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)} 
            style={styles.actionBtn}
            title={isCollapsed ? "Agrandir" : "Réduire"}
          >
            {isCollapsed ? <Maximize2 size={13} /> : <Minimize2 size={13} />}
          </button>
          <button 
            onClick={() => setIsVisible(false)} 
            style={styles.actionBtn}
            title="Fermer"
          >
            <X size={13} />
          </button>
        </div>
      </div>

      {/* Video Content */}
      {!isCollapsed && (
        <div style={styles.playerContainer}>
          {isYoutube(live.streamUrl) ? (
            <iframe
              src={getEmbedUrl(live.streamUrl)}
              title={live.title}
              style={styles.iframe}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <video 
              src={live.streamUrl} 
              controls 
              autoPlay 
              muted 
              style={styles.video}
            />
          )}
        </div>
      )}
    </div>
  );
};

const styles = {
  wrapper: {
    position: 'fixed',
    bottom: '90px', // Right above the audio player/footer space
    right: '24px',
    width: '320px',
    zIndex: 1000,
    overflow: 'hidden',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    boxShadow: '0 12px 40px rgba(0, 0, 0, 0.5)',
    transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
    borderRadius: '12px',
  },
  collapsedWrapper: {
    width: '200px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '8px 12px',
    background: '#0d1426',
    borderBottom: '1px solid rgba(255,255,255,0.05)',
  },
  titleGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    minWidth: 0,
  },
  pulseDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    backgroundColor: '#ef4444',
    boxShadow: '0 0 8px #ef4444',
    animation: 'pulse 1.5s infinite ease-in-out',
    flexShrink: 0,
  },
  titleText: {
    fontSize: '11px',
    fontWeight: '700',
    color: 'var(--text-main)',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  actionGroup: {
    display: 'flex',
    gap: '6px',
    flexShrink: 0,
  },
  actionBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--text-secondary)',
    cursor: 'pointer',
    padding: '2px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.7,
    transition: 'opacity 0.2s',
  },
  playerContainer: {
    width: '100%',
    height: '180px',
    backgroundColor: '#000',
  },
  iframe: {
    width: '100%',
    height: '100%',
    border: 'none',
  },
  video: {
    width: '100%',
    height: '100%',
    objectFit: 'contain',
  }
};

export default FloatingLivePlayer;
