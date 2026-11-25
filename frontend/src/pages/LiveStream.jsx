import React, { useState, useEffect } from 'react';
import { getActiveLive, getUpcomingLives, getArticles } from '../services/api';
import { Radio, Calendar, Clock, Video, Tv, Play, Film, Sparkles, X, Share2, Flame, ExternalLink, Eye, ChevronRight, CheckCircle2 } from 'lucide-react';
import { getMediaUrl } from '../utils/urlUtils';
import { getFullImageUrl } from '../utils/imageUtils';
import { IMPORTED_ARTICLES } from '../data/importedArticles';
import { Link } from 'react-router-dom';

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

const FALLBACK_SHORTS = [
  {
    id: 's1',
    title: "Kinshasa Express : 3 décisions majeures du conseil des ministres",
    duration: "0:48",
    views: "24.5K",
    author: "Rédaction Life Channel",
    imageUrl: "https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=800&q=80",
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
  },
  {
    id: 's2',
    title: "Goma : Le point sécuritaire et humanitaire en 50 secondes",
    duration: "0:52",
    views: "38.2K",
    author: "Marc Kasongo",
    imageUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80",
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
  },
  {
    id: 's3',
    title: "Léopards RDC : L'ambiance au rassemblement avant le grand choc",
    duration: "0:42",
    views: "52.1K",
    author: "Life Sport",
    imageUrl: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=800&q=80",
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
  },
  {
    id: 's4',
    title: "Franc Congolais : Évolution du taux de change à Kinshasa",
    duration: "0:35",
    views: "19.8K",
    author: "Éco RDC",
    imageUrl: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=800&q=80",
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
  }
];

const LiveStream = () => {
  const [activeLive, setActiveLive] = useState(null);
  const [upcoming, setUpcoming] = useState([]);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ALL'); // 'ALL' | 'LIVES' | 'SHORTS' | 'LONGS' | 'SOCIAL'
  const [selectedVideoModal, setSelectedVideoModal] = useState(null);

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
    }

    try {
      const articlesData = await getArticles(null, null, 'PUBLISHED');
      const allArts = (articlesData && Array.isArray(articlesData) && articlesData.length > 0) ? articlesData : IMPORTED_ARTICLES;

      // Filtrer les articles qui sont des vidéos ou reportages multimédias
      const videoItems = allArts.filter(a => {
        const t = (a.tags || '').toLowerCase();
        const c = (a.category || '').toLowerCase();
        return c === 'vidéos' || t.includes('video') || t.includes('youtube') || t.includes('tiktok') || t.includes('facebook') || t.includes('short') || t.includes('reportage');
      });

      setVideos(videoItems);
    } catch (err) {
      console.warn("Récupération des vidéos:", err);
      setVideos(IMPORTED_ARTICLES.filter(a => (a.category === 'Vidéos' || (a.tags && a.tags.toLowerCase().includes('video')))));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveInfo();
    const interval = setInterval(fetchLiveInfo, 60000);
    return () => clearInterval(interval);
  }, []);

  // Extraction d'ID YouTube
  const extractYouTubeId = (url) => {
    if (!url) return null;
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
    return match ? match[1] : null;
  };

  // Convertisseur d'URL YouTube pour iframe embed
  const getEmbedUrl = (url) => {
    if (!url) return '';
    const ytId = extractYouTubeId(url);
    if (ytId) {
      return `https://www.youtube.com/embed/${ytId}?autoplay=1&mute=0`;
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

  // Parse les vidéos courtes (Shorts / Reels)
  const shortVideos = [
    ...FALLBACK_SHORTS,
    ...videos.filter(v => {
      const t = (v.tags || '').toLowerCase();
      return t.includes('[video:short]') || t.includes('short') || t.includes('reel') || t.includes('tiktok');
    }).map(v => {
      const matchUrl = v.tags && v.tags.match(/\[VIDEO_URL:([^\]]+)\]/);
      const matchDur = v.tags && v.tags.match(/\[DURATION:([^\]]+)\]/);
      return {
        id: v.id,
        title: v.title,
        duration: matchDur ? matchDur[1] : '0:45',
        views: '12.4K',
        author: v.authorUsername || 'Journaliste Life Channel',
        imageUrl: v.mainImageUrl || 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=800&q=80',
        videoUrl: matchUrl ? matchUrl[1] : ''
      };
    })
  ];

  // Parse les grands formats (JT & Reportages)
  const longVideos = videos.filter(v => {
    const t = (v.tags || '').toLowerCase();
    return !t.includes('[video:short]') && !t.includes('tiktok');
  });

  // Synced social videos
  const socialVideos = videos.filter(v => {
    const t = (v.tags || '').toLowerCase();
    return t.includes('youtube') || t.includes('facebook') || t.includes('tiktok') || t.includes('social');
  });

  return (
    <div className="container animate-fade-in" style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <span style={{
            background: 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)',
            color: '#fff',
            fontSize: '11px',
            fontWeight: '900',
            padding: '3px 9px',
            borderRadius: '9999px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            letterSpacing: '1px'
          }}>
            <Radio size={12} className="pulse" /> DIRECT & VIDÉOS 24/7
          </span>
          <span style={{ color: 'var(--argente)', fontSize: '13px' }}>
            Portail Officiel Multimédia RDC
          </span>
        </div>
        <h1 style={styles.title}>Direct TV & Vidéos d'Actualité</h1>
        <p style={styles.subtitle}>
          Suivez la chaîne en direct continu, visionnez nos reportages de terrain (grands formats) et nos décryptages express (formats courts).
        </p>
      </div>

      {/* Tabs Navigation de la section Vidéos */}
      <div className="direct-tv-tabs-nav">
        <button
          type="button"
          onClick={() => setActiveTab('ALL')}
          className={`direct-tv-tab-pill ${activeTab === 'ALL' ? 'active' : ''}`}
        >
          <Sparkles size={15} />
          <span>Tous les flux & vidéos</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('LIVES')}
          className={`direct-tv-tab-pill ${activeTab === 'LIVES' ? 'active' : ''}`}
        >
          <Tv size={15} />
          <span>Direct TV & Grille</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('SHORTS')}
          className={`direct-tv-tab-pill ${activeTab === 'SHORTS' ? 'active' : ''}`}
        >
          <Film size={15} />
          <span>Formats Courts (Shorts & Reels 9:16)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('LONGS')}
          className={`direct-tv-tab-pill ${activeTab === 'LONGS' ? 'active' : ''}`}
        >
          <Video size={15} />
          <span>Grands Formats (JT & Reportages)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('SOCIAL')}
          className={`direct-tv-tab-pill ${activeTab === 'SOCIAL' ? 'active' : ''}`}
        >
          <ExternalLink size={15} />
          <span>Réseaux Synchronisés (YouTube, FB, TikTok)</span>
        </button>
      </div>

      {/* 1. SECTION PRINCIPALE : LECTEUR DU DIRECT TV EN CONTINU */}
      {(activeTab === 'ALL' || activeTab === 'LIVES') && (
        <div style={styles.mainLayout} className="admin-form-grid" style={{ marginBottom: '45px' }}>
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
                    <Radio size={14} className="pulse" /> DIRECT EN COURS
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
                      poster={activeLive.coverUrl ? getMediaUrl(activeLive.coverUrl) : undefined}
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
      )}

      {/* 2. SECTION FORMATS COURTS (SHORTS & REELS 9:16) */}
      {(activeTab === 'ALL' || activeTab === 'SHORTS') && (
        <div style={{ marginBottom: '45px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Film size={18} style={{ color: 'var(--primary)' }} />
                <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#F5F3F0', margin: 0 }}>
                  Formats Courts & Actualité Flash (Shorts)
                </h2>
              </div>
              <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'var(--argente)' }}>
                Les temps forts de l'actualité congolaise et internationale condensés en vidéos verticales de moins d'une minute.
              </p>
            </div>
          </div>

          <div className="shorts-reel-grid">
            {shortVideos.map((s) => (
              <div 
                key={s.id} 
                className="short-reel-card"
                onClick={() => setSelectedVideoModal(s)}
              >
                <img 
                  src={getFullImageUrl(s.imageUrl, 'Vidéos')} 
                  alt={s.title} 
                  className="short-reel-img"
                  onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=800&q=80'; }}
                />
                <div className="short-reel-overlay">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                    <span className="short-reel-tag">
                      <Film size={10} /> REEL
                    </span>
                    <span style={{ fontSize: '11px', fontWeight: '800', background: 'rgba(0,0,0,0.7)', color: '#fff', padding: '2px 6px', borderRadius: '4px' }}>
                      {s.duration}
                    </span>
                  </div>

                  <div className="short-reel-play-center">
                    <Play size={18} fill="#1a1412" />
                  </div>

                  <div>
                    <h4 className="short-reel-title">{s.title}</h4>
                    <div className="short-reel-meta">
                      <span>{s.author}</span>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                        <Eye size={11} /> {s.views}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. SECTION GRANDS FORMATS & REPORTAGES (16:9) */}
      {(activeTab === 'ALL' || activeTab === 'LONGS') && (
        <div style={{ marginBottom: '45px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Video size={18} style={{ color: 'var(--primary)' }} />
                <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#F5F3F0', margin: 0 }}>
                  Grands Formats, JT & Reportages de Terrain
                </h2>
              </div>
              <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'var(--argente)' }}>
                Émissions intégrales, dossiers d'investigation et analyses approfondies réalisés par nos correspondants en RDC.
              </p>
            </div>
          </div>

          <div className="long-video-grid">
            {longVideos.map((v) => {
              const matchUrl = v.tags && v.tags.match(/\[VIDEO_URL:([^\]]+)\]/);
              const matchDur = v.tags && v.tags.match(/\[DURATION:([^\]]+)\]/);
              const vidUrl = matchUrl ? matchUrl[1] : '';
              const duration = matchDur ? matchDur[1] : '15:20';

              return (
                <div 
                  key={v.id} 
                  className="long-video-card"
                  onClick={() => {
                    if (vidUrl) {
                      setSelectedVideoModal({
                        id: v.id,
                        title: v.title,
                        videoUrl: vidUrl,
                        duration,
                        author: v.authorUsername,
                        summary: v.summary,
                        imageUrl: v.mainImageUrl
                      });
                    }
                  }}
                >
                  <div className="long-video-thumb-wrap">
                    <img 
                      src={getFullImageUrl(v.mainImageUrl, 'Vidéos')} 
                      alt={v.title} 
                      className="long-video-thumb"
                      onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=800&q=80'; }}
                    />
                    <div style={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      width: '46px',
                      height: '46px',
                      borderRadius: '50%',
                      background: 'rgba(229, 169, 60, 0.9)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#1a1412',
                      boxShadow: '0 4px 16px rgba(0,0,0,0.6)'
                    }}>
                      <Play size={18} fill="#1a1412" />
                    </div>
                    <span className="long-video-duration">
                      <Clock size={11} style={{ display: 'inline', marginRight: '4px' }} />
                      {duration}
                    </span>
                  </div>

                  <div className="long-video-body">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      <span style={{ fontSize: '11px', fontWeight: '800', color: 'var(--primary)', textTransform: 'uppercase' }}>
                        {v.category || 'Vidéos'}
                      </span>
                      {v.region && (
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>• {v.region}</span>
                      )}
                    </div>
                    <h3 className="long-video-title">{v.title}</h3>
                    {v.summary && (
                      <p className="long-video-summary">{v.summary}</p>
                    )}
                    <div className="long-video-footer">
                      <span>Par {v.authorUsername || 'Rédaction'}</span>
                      <Link to={`/article/${v.id}`} onClick={(e) => e.stopPropagation()} style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: '700', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        Article <ChevronRight size={13} />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. SECTION RÉSEAUX SYNCHRONISÉS (YOUTUBE, TIKTOK, FACEBOOK) */}
      {(activeTab === 'ALL' || activeTab === 'SOCIAL') && (
        <div style={{ marginBottom: '45px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <ExternalLink size={18} style={{ color: 'var(--primary)' }} />
            <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#F5F3F0', margin: 0 }}>
              Vidéos Officielles Synchronisées (Réseaux Sociaux)
            </h2>
          </div>
          <p style={{ margin: '0 0 18px', fontSize: '13px', color: 'var(--argente)' }}>
            Les publications vidéo issues de nos comptes officiels YouTube, Facebook et TikTok remontent ici de manière automatisée.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
            <div className="glass-card" style={{ padding: '20px', borderRadius: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#ff0000', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                  <Play size={18} fill="#fff" />
                </div>
                <div>
                  <h4 style={{ margin: 0, fontSize: '15px', color: '#F5F3F0' }}>Chaîne YouTube Officielle</h4>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>@LifeChannelMedia</span>
                </div>
              </div>
              <p style={{ fontSize: '13px', color: 'var(--argente)', lineHeight: '1.5', margin: '0 0 14px' }}>
                Retrouvez toutes les éditions complètes de nos JT, grands débats politiques et reportages exclusifs en replay HD.
              </p>
              <a 
                href="https://www.youtube.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="btn btn-secondary" 
                style={{ width: '100%', justifyContent: 'center', fontSize: '13px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                Accéder à la chaîne YouTube <ExternalLink size={13} />
              </a>
            </div>

            <div className="glass-card" style={{ padding: '20px', borderRadius: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#1877F2', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: '900' }}>
                  f
                </div>
                <div>
                  <h4 style={{ margin: 0, fontSize: '15px', color: '#F5F3F0' }}>Page Facebook Officielle</h4>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Life Channel RDC</span>
                </div>
              </div>
              <p style={{ fontSize: '13px', color: 'var(--argente)', lineHeight: '1.5', margin: '0 0 14px' }}>
                Les directs Facebook Live en duplex avec nos correspondants à Goma, Bukavu, Lubumbashi et Kisangani.
              </p>
              <a 
                href="https://www.facebook.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="btn btn-secondary" 
                style={{ width: '100%', justifyContent: 'center', fontSize: '13px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                Suivre nos directs Facebook <ExternalLink size={13} />
              </a>
            </div>

            <div className="glass-card" style={{ padding: '20px', borderRadius: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#000', border: '1px solid #333', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#00f2fe' }}>
                  <Film size={18} />
                </div>
                <div>
                  <h4 style={{ margin: 0, fontSize: '15px', color: '#F5F3F0' }}>Compte TikTok Officiel</h4>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>@lifechannel_rdc</span>
                </div>
              </div>
              <p style={{ fontSize: '13px', color: 'var(--argente)', lineHeight: '1.5', margin: '0 0 14px' }}>
                Les vidéos buzz, réactions citoyennes, interviews trottoir et formats courts viraux pour la jeunesse congolaise.
              </p>
              <a 
                href="https://www.tiktok.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="btn btn-secondary" 
                style={{ width: '100%', justifyContent: 'center', fontSize: '13px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                Découvrir nos TikToks <ExternalLink size={13} />
              </a>
            </div>
          </div>
        </div>
      )}

      {/* MODAL LECTEUR VIDÉO INTERACTIF POPUP */}
      {selectedVideoModal && (
        <div className="video-modal-backdrop" onClick={() => setSelectedVideoModal(null)}>
          <div className="video-modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Video size={16} style={{ color: 'var(--primary)' }} />
                <h3 style={{ margin: 0, fontSize: '16px', color: '#F5F3F0', fontWeight: '800' }}>
                  {selectedVideoModal.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedVideoModal(null)}
                style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', padding: '4px' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{
              position: 'relative',
              width: '100%',
              aspectRatio: '16 / 9',
              background: '#000',
              overflow: 'hidden'
            }}>
              {extractYouTubeId(selectedVideoModal.videoUrl) ? (
                <iframe
                  src={`https://www.youtube.com/embed/${extractYouTubeId(selectedVideoModal.videoUrl)}?autoplay=1`}
                  title={selectedVideoModal.title}
                  style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <video
                  src={selectedVideoModal.videoUrl || 'https://www.w3schools.com/html/mov_bbb.mp4'}
                  controls
                  autoPlay
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                />
              )}
            </div>

            <div style={{ padding: '18px 20px', background: 'rgba(20, 15, 13, 0.95)' }}>
              <h4 style={{ margin: '0 0 6px', fontSize: '16px', color: '#F5F3F0' }}>{selectedVideoModal.title}</h4>
              <p style={{ margin: '0 0 14px', fontSize: '13px', color: 'var(--argente)', lineHeight: '1.5' }}>
                {selectedVideoModal.summary || "Retrouvez nos reportages vidéo exclusifs et analyses de nos journalistes sur la plateforme multimédia LIFE CHANNEL."}
              </p>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  Durée : <strong>{selectedVideoModal.duration || '0:45'}</strong> • {selectedVideoModal.author || 'Journaliste'}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    if (navigator.share) {
                      navigator.share({
                        title: selectedVideoModal.title,
                        url: window.location.href
                      });
                    } else {
                      navigator.clipboard.writeText(window.location.href);
                      alert("Lien de la vidéo copié !");
                    }
                  }}
                  className="btn btn-secondary"
                  style={{ fontSize: '12px', padding: '6px 14px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                >
                  <Share2 size={13} /> Partager la vidéo
                </button>
              </div>
            </div>
          </div>
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
  title: {
    fontSize: '30px',
    fontWeight: '800',
    color: '#F5F3F0',
    marginBottom: '8px',
    letterSpacing: '-0.02em'
  },
  subtitle: {
    fontSize: '14.5px',
    color: 'var(--argente)',
    maxWidth: '780px',
    lineHeight: '1.5'
  },
  mainLayout: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 3fr) minmax(320px, 1.3fr)',
    gap: '28px',
    alignItems: 'start'
  },
  playerContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    width: '100%'
  },
  sidebar: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%'
  },
  sidebarCard: {
    padding: '24px',
    borderRadius: '14px'
  },
  sidebarTitle: {
    fontSize: '17px',
    fontWeight: '800',
    color: '#F5F3F0',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '20px',
    borderBottom: '1px solid var(--border-color)',
    paddingBottom: '12px',
  },
  placeholderCard: {
    padding: '60px',
    textAlign: 'center',
    color: 'var(--text-muted)',
  },
  offlineCard: {
    padding: '70px 30px',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '360px',
  },
  offlineTitle: {
    fontSize: '22px',
    color: '#F5F3F0',
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
    gap: '14px',
    width: '100%'
  },
  badgeRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    flexWrap: 'wrap'
  },
  liveBadge: {
    backgroundColor: '#ef4444',
    color: 'white',
    padding: '4px 12px',
    borderRadius: '9999px',
    fontSize: '11px',
    fontWeight: '900',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    letterSpacing: '1px',
    boxShadow: '0 2px 10px rgba(239, 68, 68, 0.4)'
  },
  viewersCount: {
    fontSize: '14px',
    fontWeight: '700',
    color: '#F5F3F0',
  },
  videoWrapper: {
    position: 'relative',
    width: '100%',
    paddingTop: '56.25%', // Ratio 16:9
    backgroundColor: 'black',
    borderRadius: '14px',
    overflow: 'hidden',
    border: '1px solid var(--border-color)',
    boxShadow: '0 12px 36px rgba(0,0,0,0.6)',
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
    padding: '20px',
    borderRadius: '12px'
  },
  liveTitle: {
    fontSize: '20px',
    fontWeight: '800',
    color: '#F5F3F0',
    marginBottom: '8px',
  },
  liveDesc: {
    fontSize: '14px',
    color: 'var(--argente)',
    lineHeight: '1.6',
    margin: 0
  },
  timeline: {
    display: 'flex',
    flexDirection: 'column',
    gap: '18px',
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

export default LiveStream;
