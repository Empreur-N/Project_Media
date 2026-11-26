import React, { useState, useEffect } from 'react';
import { getActiveLive, getUpcomingLives, getArticles } from '../services/api';
import { Radio, Calendar, Clock, Video, Tv, Play, Film, Sparkles, X, Share2, Flame, ExternalLink, Eye, ChevronRight, CheckCircle2, Volume2, VolumeX } from 'lucide-react';
import { getMediaUrl } from '../utils/urlUtils';
import { getFullImageUrl } from '../utils/imageUtils';
import { IMPORTED_ARTICLES } from '../data/importedArticles';
import { Link } from 'react-router-dom';
import AdPlacement from '../components/AdPlacement';

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

const FALLBACK_RECOMMENDED = [
  {
    id: 'rec1',
    title: "Guerre à l'Est : immersion exclusive avec les FARDC sur la ligne de front",
    summary: "Reportage grand format de nos envoyés spéciaux dans le Nord-Kivu.",
    category: "Afrique",
    badge: "Reporters",
    imageUrl: "https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=800&q=80",
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
  },
  {
    id: 'rec2',
    title: "Diplomatie : La RDC face aux enjeux du bassin du Congo et du climat",
    summary: "Décryptage des pourparlers régionaux et des accords environnementaux.",
    category: "International",
    badge: "Invité du Jour",
    imageUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80",
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
  },
  {
    id: 'rec3',
    title: "Léopards RDC : Préparatifs intensifs pour la Coupe d'Afrique des Nations",
    summary: "Au cœur des vestiaires avec les stars du onze national congolais.",
    category: "Sport",
    badge: "Édition Spéciale",
    imageUrl: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=800&q=80",
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
  },
  {
    id: 'rec4',
    title: "Rumba congolaise & patrimoine mondial de l'UNESCO : voyage musical à Kinshasa",
    summary: "Rencontre avec les maîtres guitaristes qui perpétuent la tradition musicale.",
    category: "Culture",
    badge: "Culture Mag",
    imageUrl: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80",
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
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
  const [isMuted, setIsMuted] = useState(false);

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
    <div className="f24-page-container animate-fade-in">
      {/* Bannière Publicitaire Supérieure */}
      <AdPlacement placement="HEADER" style={{ marginBottom: '16px' }} />

      {/* Fil d'Ariane Style France 24 */}
      <div className="f24-breadcrumb">
        <Link to="/">Accueil</Link>
        <span>&gt;</span>
        <span>Télévision en direct</span>
      </div>

      {/* Grand Titre Style France 24 */}
      <h1 className="f24-page-title">
        <Tv size={24} style={{ color: '#0284c7', flexShrink: 0 }} />
        <span>Regardez Life Channel en direct</span>
      </h1>

      {/* LECTEUR DU DIRECT EN CONTINU (Style France 24 - 16/9 Plein Cadre) */}
      <div className="f24-player-wrap">
        <div className="f24-player-overlay">
          <span className="f24-live-pill">
            <Radio size={11} className="pulse" /> EN DIRECT
          </span>
          <button
            type="button"
            onClick={() => setIsMuted(prev => !prev)}
            className="f24-audio-btn"
            title={isMuted ? "Activer le son" : "Couper le son"}
          >
            {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>
        </div>

        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#94a3b8' }}>
            Chargement du direct Life Channel...
          </div>
        ) : activeLive && activeLive.streamUrl ? (
          isYoutube(activeLive.streamUrl) ? (
            <iframe
              title="Direct Life Channel TV"
              src={`${getEmbedUrl(activeLive.streamUrl)}${isMuted ? '&mute=1' : ''}`}
              className="f24-player-iframe"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          ) : (
            <video 
              src={activeLive.streamUrl} 
              controls 
              autoPlay 
              muted={isMuted}
              className="f24-player-video"
              poster={activeLive.coverUrl ? getMediaUrl(activeLive.coverUrl) : undefined}
            />
          )
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#94a3b8', padding: '20px', textAlign: 'center' }}>
            <Tv size={48} style={{ color: '#64748b', marginBottom: '12px' }} />
            <h3 style={{ margin: '0 0 6px', color: '#fff' }}>Diffusion en direct momentanément interrompue</h3>
            <p style={{ margin: 0, fontSize: '13px' }}>Nos équipes techniques rétablissent le signal. Visionnez nos replays et reportages ci-dessous.</p>
          </div>
        )}
      </div>

      {/* Bannière d'information sur le programme en cours */}
      {activeLive && (
        <div className="f24-live-info-banner">
          <h2 className="f24-live-info-title">{activeLive.title}</h2>
          <p className="f24-live-info-desc">{activeLive.description}</p>
        </div>
      )}

      {/* SECTION "LIFE CHANNEL RECOMMANDE" (Style France 24 avec carré bleu/cyan) */}
      <div className="f24-section-header">
        <div className="f24-square-accent" />
        <h3 className="f24-section-title">Life Channel Recommande</h3>
      </div>

      <div className="f24-rec-grid">
        {(videos.length > 0 ? videos.slice(0, 4) : FALLBACK_RECOMMENDED).map((prog) => {
          const matchUrl = prog.tags && prog.tags.match(/\[VIDEO_URL:([^\]]+)\]/);
          const vidUrl = matchUrl ? matchUrl[1] : (prog.videoUrl || '');
          const imgUrl = prog.mainImageUrl || prog.imageUrl || 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=800&q=80';
          const badgeText = prog.badge || (prog.category === 'Vidéos' ? 'Reporters' : (prog.category || 'Magazine'));

          return (
            <div 
              key={prog.id} 
              className="f24-rec-card"
              onClick={() => {
                if (vidUrl) {
                  setSelectedVideoModal({
                    id: prog.id,
                    title: prog.title,
                    videoUrl: vidUrl,
                    duration: '12:30',
                    author: prog.authorUsername || 'Life Channel',
                    summary: prog.summary,
                    imageUrl: imgUrl
                  });
                }
              }}
            >
              <div className="f24-rec-img-wrap">
                <img 
                  src={getFullImageUrl(imgUrl, prog.category || 'Vidéos')} 
                  alt={prog.title} 
                  className="f24-rec-img"
                  onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=800&q=80'; }}
                />
                <span className="f24-rec-badge">{badgeText}</span>
              </div>
              <div className="f24-rec-bottom-strip">
                <Play size={10} fill="#38bdf8" />
                <span>Programme | {prog.region || prog.category || 'Afrique'}</span>
              </div>
              <div className="f24-rec-content">
                <h4 className="f24-rec-item-title">{prog.title}</h4>
                {prog.summary && <p className="f24-rec-item-desc">{prog.summary}</p>}
              </div>
            </div>
          );
        })}
      </div>

      {/* SECTION "PROCHAINS DIRECTS SUR LIFE CHANNEL TV" */}
      <div className="f24-section-header" style={{ marginTop: '36px' }}>
        <div className="f24-square-accent" />
        <h3 className="f24-section-title">Prochains Directs & Grille</h3>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px', marginBottom: '35px' }}>
        {upcoming.map((up) => (
          <div key={up.id} className="glass-card" style={{ padding: '18px 20px', borderRadius: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#38bdf8', fontSize: '12px', fontWeight: '800', marginBottom: '8px' }}>
              <Clock size={13} />
              <span>{formatDate(up.startTime)} à {formatTime(up.startTime)}</span>
            </div>
            <h4 style={{ margin: '0 0 6px', fontSize: '15px', color: '#F5F3F0', fontWeight: '800' }}>{up.title}</h4>
            <p style={{ margin: 0, fontSize: '13px', color: '#94a3b8', lineHeight: '1.45' }}>{up.description}</p>
          </div>
        ))}
      </div>

      {/* Onglets pour Explorer les Autres Formats Multimédias */}
      <div className="direct-tv-tabs-nav" style={{ marginTop: '20px', marginBottom: '24px' }}>
        <button
          type="button"
          onClick={() => setActiveTab(activeTab === 'SHORTS' ? 'ALL' : 'SHORTS')}
          className={`direct-tv-tab-pill ${activeTab === 'SHORTS' ? 'active' : ''}`}
        >
          <Film size={15} />
          <span>Formats Courts (Shorts & Reels 9:16)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab(activeTab === 'LONGS' ? 'ALL' : 'LONGS')}
          className={`direct-tv-tab-pill ${activeTab === 'LONGS' ? 'active' : ''}`}
        >
          <Video size={15} />
          <span>Grands Formats (JT & Reportages)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab(activeTab === 'SOCIAL' ? 'ALL' : 'SOCIAL')}
          className={`direct-tv-tab-pill ${activeTab === 'SOCIAL' ? 'active' : ''}`}
        >
          <ExternalLink size={15} />
          <span>Réseaux Synchronisés (YouTube, FB, TikTok)</span>
        </button>
      </div>

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
