import React, { useState, useEffect } from 'react';
import { getEpisodes, getShows } from '../services/api';
import { useAudioPlayer } from '../contexts/AudioPlayerContext';
import { getFullImageUrl, handleImageError } from '../utils/imageUtils';
import { Play, Pause, Disc, Calendar, Clock, Radio, Headphones } from 'lucide-react';
import { getMediaUrl } from '../utils/urlUtils';

const FALLBACK_SHOWS = [
  "Life Channel Sports Talk",
  "Éco & Mines RDC",
  "Culture & Rumba Kin"
];

const FALLBACK_EPISODES = [
  {
    id: 101,
    title: "Léopards RDC : Analyse tactique de Sébastien Desabre et montée en puissance des binationaux",
    description: "Dans ce numéro spécial, notre Desk Sport analyse les choix offensifs du sélectionneur national et le rôle clé de Yoane Wissa.",
    showTitle: "Life Channel Sports Talk",
    authorUsername: "Life Channel Sports",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    coverUrl: "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?q=80&w=600",
    durationSeconds: 1845,
    publishDate: "2026-09-05T10:00:00Z"
  },
  {
    id: 102,
    title: "Grand Katanga : La transformation locale du cobalt et du cuivre, quel impact réel ?",
    description: "Table ronde avec des analystes économiques sur la chaîne de valeur minière à Kolwezi et Lubumbashi.",
    showTitle: "Éco & Mines RDC",
    authorUsername: "Desk Économie RDC",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    coverUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=600",
    durationSeconds: 2410,
    publishDate: "2026-09-03T14:30:00Z"
  },
  {
    id: 103,
    title: "Rumba Congolaise à l'UNESCO : Héritage, studios modernes et rayonnement continental",
    description: "Immersion dans les studios de Bandalungwa et Goma avec les artistes et arrangeurs qui réinventent le son congolais.",
    showTitle: "Culture & Rumba Kin",
    authorUsername: "Rédaction Culturelle Life",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
    coverUrl: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=600",
    durationSeconds: 1980,
    publishDate: "2026-09-02T16:00:00Z"
  }
];

const Podcasts = () => {
  const { currentEpisode, isPlaying, playEpisode, togglePlay } = useAudioPlayer();
  const [episodes, setEpisodes] = useState([]);
  const [shows, setShows] = useState([]);
  const [selectedShow, setSelectedShow] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchPodcasts = async () => {
    setLoading(true);
    try {
      const episodesData = await getEpisodes(selectedShow);
      if (episodesData && Array.isArray(episodesData) && episodesData.length > 0) {
        // Nettoyer les épisodes pour éliminer les objets invalides ou null
        const validEpisodes = episodesData.filter(ep => ep && typeof ep === 'object' && (ep.id || ep._id));
        if (validEpisodes.length > 0) {
          setEpisodes(validEpisodes);
        } else {
          const filtered = selectedShow 
            ? FALLBACK_EPISODES.filter(e => e.showTitle === selectedShow || String(e.id) === String(selectedShow))
            : FALLBACK_EPISODES;
          setEpisodes(filtered);
        }
      } else {
        const filtered = selectedShow 
          ? FALLBACK_EPISODES.filter(e => e.showTitle === selectedShow || String(e.id) === String(selectedShow))
          : FALLBACK_EPISODES;
        setEpisodes(filtered);
      }
      
      const showsData = await getShows();
      if (showsData && Array.isArray(showsData) && showsData.length > 0) {
        // Éliminer strictement les valeurs null, vides ou malformées
        const validShows = showsData
          .filter(s => s !== null && s !== undefined)
          .map(s => (typeof s === 'object' ? (s.title || s.name || s.id) : String(s)))
          .filter(s => s && String(s).trim() !== '' && s !== 'null' && s !== 'undefined');

        if (validShows.length > 0) {
          setShows(validShows);
        } else {
          setShows(FALLBACK_SHOWS);
        }
      } else {
        setShows(FALLBACK_SHOWS);
      }
    } catch (error) {
      console.warn("Utilisation des podcasts de secours:", error);
      const filtered = selectedShow 
        ? FALLBACK_EPISODES.filter(e => e.showTitle === selectedShow || String(e.id) === String(selectedShow))
        : FALLBACK_EPISODES;
      setEpisodes(filtered);
      setShows(FALLBACK_SHOWS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPodcasts();
  }, [selectedShow]);

  const formatDuration = (seconds) => {
    if (!seconds || isNaN(seconds)) return '--:--';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m} min ${s < 10 ? '0' : ''}${s}s`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const handlePlayClick = (episode) => {
    if (!episode) return;
    const epId = episode.id || episode._id;
    if (currentEpisode && (currentEpisode.id === epId || currentEpisode.id === episode.id)) {
      togglePlay();
    } else {
      playEpisode({
        ...episode,
        id: epId,
        audioUrl: episode.audioUrl || (episode.fileUrl ? getMediaUrl(episode.fileUrl) : '')
      });
    }
  };

  return (
    <div className="container animate-fade-in" style={styles.container}>
      <div style={styles.header}>
        <div style={styles.headerBadge}>
          <Headphones size={14} /> AUDIO À LA DEMANDE • DIFFUSION NATIONALE RDC
        </div>
        <h1 style={styles.title}>Podcasts & Émissions Audio</h1>
        <p style={styles.subtitle}>Écoutez nos analyses, débats et reportages audio à la demande avec une faible consommation de données</p>
      </div>

      {/* Shows Filter */}
      <div style={styles.filterBar}>
        <button 
          onClick={() => setSelectedShow('')} 
          style={{
            ...styles.filterBtn,
            backgroundColor: selectedShow === '' ? 'var(--primary)' : 'rgba(255,255,255,0.03)',
            color: selectedShow === '' ? '#000' : 'var(--text-main)'
          }}
        >
          Tous les épisodes
        </button>
        {shows.map((show, idx) => {
          if (!show) return null;
          const showName = (typeof show === 'object' && show !== null)
            ? (show.title || show.name || show.id || '')
            : String(show);
          if (!showName || showName.trim() === '' || showName === 'null') return null;
          const showKey = (typeof show === 'object' && show !== null)
            ? (show.id || show.title || idx)
            : `${showName}-${idx}`;
          return (
            <button
              key={showKey}
              onClick={() => setSelectedShow(showName)}
              style={{
                ...styles.filterBtn,
                backgroundColor: selectedShow === showName ? 'var(--primary)' : 'rgba(255,255,255,0.03)',
                color: selectedShow === showName ? '#000' : 'var(--text-main)'
              }}
            >
              {showName}
            </button>
          );
        })}
      </div>

      {/* Grid List */}
      {loading ? (
        <p style={{ color: 'var(--text-muted)' }}>Chargement des émissions...</p>
      ) : episodes.length === 0 ? (
        <div style={styles.emptyState}>
          <Radio size={40} style={{ color: 'var(--text-muted)', marginBottom: '12px' }} />
          <p style={{ color: 'var(--text-muted)' }}>Aucun épisode disponible pour le moment.</p>
        </div>
      ) : (
        <div style={styles.grid}>
          {episodes.map((ep, idx) => {
            if (!ep || typeof ep !== 'object') return null;
            const episodeId = ep.id || ep._id || `ep-${idx}`;
            const isCurrent = currentEpisode && (currentEpisode.id === episodeId || currentEpisode.id === ep.id);
            const isCurrentPlaying = isCurrent && isPlaying;
            const title = ep.title || "Épisode sans titre";
            const desc = ep.description || "";
            const showTitle = ep.showTitle || "Life Channel";

            return (
              <div key={episodeId} className="glass-card" style={styles.card}>
                <div style={styles.cardCoverWrapper}>
                  {ep.coverUrl ? (
                    <img 
                      src={getFullImageUrl(ep.coverUrl, 'Culture')} 
                      alt={title} 
                      className="img-cover-adaptive"
                      style={styles.cardCover} 
                      loading="lazy"
                      onError={(e) => handleImageError(e, 'Culture')}
                    />
                  ) : (
                    <div style={styles.cardCoverFallback}>
                      <Disc size={32} className={isCurrentPlaying ? "spin" : ""} style={{ color: 'var(--text-muted)' }} />
                    </div>
                  )}
                  
                  <button 
                    onClick={() => handlePlayClick(ep)} 
                    style={styles.playOverlayBtn}
                    title={isCurrentPlaying ? "Mettre en pause" : "Écouter"}
                  >
                    {isCurrentPlaying ? <Pause size={24} fill="#000" /> : <Play size={24} fill="#000" style={{ marginLeft: '2px' }} />}
                  </button>
                </div>

                <div style={styles.cardBody}>
                  <span style={styles.cardShowTitle}>{showTitle}</span>
                  <h3 style={styles.cardTitle}>{title}</h3>
                  <p style={styles.cardDesc}>{desc}</p>
                  
                  <div style={styles.cardFooter}>
                    <span style={styles.metaItem}>
                      <Calendar size={13} /> {formatDate(ep.publishDate || ep.releaseDate || ep.createdAt)}
                    </span>
                    <span style={styles.metaItem}>
                      <Clock size={13} /> {formatDuration(ep.durationSeconds || ep.duration)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    padding: '40px 24px 120px',
  },
  header: {
    marginBottom: '30px',
    borderBottom: '1px solid var(--border-color)',
    paddingBottom: '20px',
  },
  headerBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    background: 'rgba(0, 124, 255, 0.12)',
    border: '1px solid rgba(0, 124, 255, 0.3)',
    color: 'var(--primary)',
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '11px',
    fontWeight: '800',
    letterSpacing: '0.5px',
    marginBottom: '12px',
  },
  title: {
    fontSize: '28px',
    fontWeight: '800',
    marginBottom: '6px',
    color: 'var(--text-main)',
  },
  subtitle: {
    fontSize: '14px',
    color: 'var(--text-muted)',
    lineHeight: '1.4',
  },
  filterBar: {
    display: 'flex',
    gap: '12px',
    marginBottom: '36px',
    flexWrap: 'wrap',
  },
  filterBtn: {
    padding: '8px 16px',
    borderRadius: '20px',
    border: '1px solid var(--border-color)',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '600',
    transition: 'all 0.2s',
    outline: 'none',
  },
  emptyState: {
    textAlign: 'center',
    padding: '60px 0',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '26px',
  },
  card: {
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    height: '100%',
    borderRadius: '12px',
    border: '1px solid var(--border-color)',
  },
  cardCoverWrapper: {
    position: 'relative',
    width: '100%',
    height: '170px',
    backgroundColor: '#0a0f1d',
    overflow: 'hidden',
  },
  cardCover: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  cardCoverFallback: {
    width: '100%',
    height: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#060913',
  },
  playOverlayBtn: {
    position: 'absolute',
    bottom: '12px',
    right: '12px',
    width: '46px',
    height: '46px',
    borderRadius: '50%',
    backgroundColor: 'var(--primary)',
    border: 'none',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    cursor: 'pointer',
    boxShadow: '0 4px 15px rgba(0,0,0,0.5)',
    transition: 'transform 0.2s ease',
  },
  cardBody: {
    padding: '18px',
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
  },
  cardShowTitle: {
    fontSize: '11px',
    textTransform: 'uppercase',
    letterSpacing: '0.8px',
    color: 'var(--primary)',
    fontWeight: '700',
    marginBottom: '6px',
  },
  cardTitle: {
    fontSize: '15px',
    fontWeight: '700',
    marginBottom: '8px',
    lineHeight: '1.35',
    color: 'var(--text-main)',
  },
  cardDesc: {
    fontSize: '13px',
    color: 'var(--text-secondary)',
    lineHeight: '1.45',
    marginBottom: '16px',
    flex: 1,
  },
  cardFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    borderTop: '1px solid rgba(255,255,255,0.05)',
    paddingTop: '12px',
  },
  metaItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    fontSize: '11px',
    color: 'var(--text-muted)',
  }
};

export default Podcasts;
