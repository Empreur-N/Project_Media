import React, { useState, useEffect } from 'react';
import { getActiveLive, getUpcomingLives } from '../services/api';
import { Radio, Calendar, Clock, Video, Tv } from 'lucide-react';

const FALLBACK_ACTIVE_LIVE = {
  id: 1,
  title: "LIFE CHANNEL TV : Le Fil d'Information en Continu de RDC",
  description: "Suivez en direct 24h/24 les journaux d'actualité, les éditions spéciales Kinshasa-Goma-Lubumbashi et les grands magazines de la rédaction.",
  streamUrl: "https://www.youtube.com/watch?v=live_stream?channel=LifeChannelSports",
  coverUrl: null
};

const FALLBACK_UPCOMING = [
  {
    id: 201,
    title: "Le Grand Journal du Soir - Édition Spéciale Kinshasa & Goma",
    description: "Tour d'horizon complet de l'actualité politique, sécuritaire et économique de la journée.",
    startTime: new Date(Date.now() + 3600 * 1000 * 2).toISOString()
  },
  {
    id: 202,
    title: "Life Sport Club : Débriefing Éliminatoires Léopards & RDC",
    description: "Retrouvez nos consultants pour l'analyse des tactiques de Sébastien Desabre et des talents congolais.",
    startTime: new Date(Date.now() + 3600 * 1000 * 5).toISOString()
  },
  {
    id: 203,
    title: "Débat Économie : Mines du Katanga & Pouvoir d'Achat",
    description: "Émission spéciale en duplex depuis Lubumbashi et Kolwezi sur la transformation locale des minerais.",
    startTime: new Date(Date.now() + 3600 * 1000 * 24).toISOString()
  }
];

const LiveStream = () => {
  const [activeLive, setActiveLive] = useState(null);
  const [upcoming, setUpcoming] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchLiveInfo = async () => {
    try {
      const activeData = await getActiveLive();
      if (activeData && activeData.id) {
        setActiveLive(activeData);
      } else {
        setActiveLive(FALLBACK_ACTIVE_LIVE);
      }

      const upcomingData = await getUpcomingLives();
      if (upcomingData && Array.isArray(upcomingData) && upcomingData.length > 0) {
        setUpcoming(upcomingData);
      } else {
        setUpcoming(FALLBACK_UPCOMING);
      }
    } catch (error) {
      console.warn("Utilisation du flux de secours pour le direct:", error);
      setActiveLive(FALLBACK_ACTIVE_LIVE);
      setUpcoming(FALLBACK_UPCOMING);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveInfo();
    // Rafraîchir toutes les minutes
    const interval = setInterval(fetchLiveInfo, 60000);
    return () => clearInterval(interval);
  }, []);

  // Convertisseur d'URL YouTube pour iframe embed
  const getEmbedUrl = (url) => {
    if (!url) return '';
    
    // Youtube standard (youtube.com/watch?v=...)
    let regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    let match = url.match(regExp);

    if (match && match[2].length === 11) {
      return `https://www.youtube.com/embed/${match[2]}?autoplay=1&mute=0`;
    }

    return url;
  };

  const isYoutube = (url) => {
    if (!url) return false;
    return url.includes('youtube.com') || url.includes('youtu.be');
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    });
  };

  const formatTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="container animate-fade-in" style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Direct Télé & Émissions</h1>
        <p style={styles.subtitle}>Suivez nos émissions, reportages et débats en direct vidéo</p>
      </div>

      <div style={styles.mainLayout}>
        {/* Left Side: Active Live Player */}
        <div style={styles.playerContainer}>
          {loading ? (
            <div className="glass-card" style={styles.placeholderCard}>
              <p>Chargement du flux en direct...</p>
            </div>
          ) : activeLive ? (
            <div style={styles.liveContent}>
              <div style={styles.badgeRow}>
                <span style={styles.liveBadge}>
                  <Radio size={14} className="pulse" /> DIRECT
                </span>
                <span style={styles.viewersCount}>{activeLive.title}</span>
              </div>

              {/* Video Player */}
              <div style={styles.videoWrapper}>
                {isYoutube(activeLive.streamUrl) ? (
                  <iframe
                    title="Direct Video"
                    src={getEmbedUrl(activeLive.streamUrl)}
                    style={styles.iframe}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  />
                ) : (
                  <video 
                    src={activeLive.streamUrl} 
                    controls 
                    autoPlay 
                    style={styles.videoPlayer}
                    poster={activeLive.coverUrl ? `http://localhost:8080${activeLive.coverUrl}` : undefined}
                  />
                )}
              </div>

              <div className="glass-card" style={styles.liveInfoCard}>
                <h2 style={styles.liveTitle}>{activeLive.title}</h2>
                <p style={styles.liveDesc}>{activeLive.description}</p>
              </div>
            </div>
          ) : (
            <div className="glass-card" style={styles.offlineCard}>
              <Tv size={60} style={{ color: 'var(--text-muted)', marginBottom: '20px' }} />
              <h2 style={styles.offlineTitle}>Média Hors Ligne</h2>
              <p style={styles.offlineDesc}>
                Aucun direct n'est diffusé pour le moment. Consultez notre planning ci-contre pour ne rien rater de nos prochains rendez-vous.
              </p>
            </div>
          )}
        </div>

        {/* Right Side: Upcoming Timeline */}
        <div style={styles.sidebar}>
          <div className="glass-card" style={styles.sidebarCard}>
            <h3 style={styles.sidebarTitle}>
              <Calendar size={18} style={{ color: 'var(--primary)' }} /> Prochains Directs
            </h3>

            {upcoming.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '13px', fontStyle: 'italic' }}>
                Aucune émission n'est programmée pour l'instant.
              </p>
            ) : (
              <div style={styles.timeline}>
                {upcoming.map((up) => (
                  <div key={up.id} style={styles.timelineItem}>
                    <div style={styles.timelineDot} />
                    <div style={styles.timelineContent}>
                      <div style={styles.timeLabel}>
                        <Clock size={12} /> {formatDate(up.startTime)} à {formatTime(up.startTime)}
                      </div>
                      <h4 style={styles.upcomingTitle}>{up.title}</h4>
                      <p style={styles.upcomingDesc}>{up.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    padding: '40px 24px 80px',
  },
  header: {
    marginBottom: '35px',
    borderBottom: '1px solid var(--border-color)',
    paddingBottom: '20px',
  },
  title: {
    fontSize: '28px',
    marginBottom: '6px',
  },
  subtitle: {
    fontSize: '14px',
    color: 'var(--text-muted)',
  },
  mainLayout: {
    display: 'grid',
    gridTemplateColumns: '3fr 1.3fr',
    gap: '30px',
  },
  playerContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  sidebar: {
    display: 'flex',
    flexDirection: 'column',
  },
  sidebarCard: {
    padding: '24px',
    height: '100%',
  },
  sidebarTitle: {
    fontSize: '18px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '24px',
    borderBottom: '1px solid var(--border-color)',
    paddingBottom: '12px',
  },
  placeholderCard: {
    padding: '60px',
    textAlign: 'center',
    color: 'var(--text-muted)',
  },
  offlineCard: {
    padding: '80px 40px',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '400px',
  },
  offlineTitle: {
    fontSize: '22px',
    marginBottom: '10px',
  },
  offlineDesc: {
    fontSize: '14px',
    color: 'var(--text-secondary)',
    maxWidth: '460px',
    lineHeight: '1.6',
  },
  liveContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  badgeRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  liveBadge: {
    backgroundColor: 'var(--error)',
    color: 'white',
    padding: '4px 10px',
    borderRadius: '4px',
    fontSize: '11px',
    fontWeight: '800',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    letterSpacing: '1px',
  },
  viewersCount: {
    fontSize: '13px',
    fontWeight: '600',
    color: 'var(--text-muted)',
  },
  videoWrapper: {
    position: 'relative',
    width: '100%',
    paddingTop: '56.25%', // Ratio 16:9
    backgroundColor: 'black',
    borderRadius: '12px',
    overflow: 'hidden',
    border: '1px solid var(--border-color)',
    boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
  },
  iframe: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    border: 'none',
  },
  videoPlayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
  },
  liveInfoCard: {
    padding: '24px',
  },
  liveTitle: {
    fontSize: '22px',
    marginBottom: '10px',
  },
  liveDesc: {
    fontSize: '15px',
    color: 'var(--text-secondary)',
    lineHeight: '1.6',
  },
  timeline: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    position: 'relative',
    borderLeft: '1px solid var(--border-color)',
    paddingLeft: '16px',
    marginLeft: '6px',
  },
  timelineItem: {
    position: 'relative',
  },
  timelineDot: {
    position: 'absolute',
    left: '-21px',
    top: '4px',
    width: '9px',
    height: '9px',
    borderRadius: '50%',
    backgroundColor: 'var(--primary)',
    border: '2px solid var(--bg-main)',
  },
  timelineContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  timeLabel: {
    fontSize: '11px',
    fontWeight: '700',
    color: 'var(--primary)',
    textTransform: 'uppercase',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
  },
  upcomingTitle: {
    fontSize: '14px',
    fontWeight: '700',
    color: 'var(--text-main)',
  },
  upcomingDesc: {
    fontSize: '12px',
    color: 'var(--text-muted)',
    lineHeight: '1.4',
  }
};

// CSS media queries simulation
if (window.innerWidth < 850) {
  styles.mainLayout.gridTemplateColumns = '1fr';
}

export default LiveStream;
