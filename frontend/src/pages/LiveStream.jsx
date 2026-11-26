import React, { useState, useEffect } from 'react';
import { getActiveLive, getArticles } from '../services/api';
import { Radio, Tv, Play, Film, Video, Clock, X, Share2, Volume2, VolumeX, Eye, ChevronRight } from 'lucide-react';
import { getFullImageUrl, handleImageError } from '../utils/imageUtils';
import { IMPORTED_ARTICLES } from '../data/importedArticles';
import { Link } from 'react-router-dom';
import { useAudioPlayer } from '../contexts/AudioPlayerContext';
import { useToast } from '../contexts/ToastContext';
import AdPlacement from '../components/AdPlacement';

// Vidéos par défaut de démonstration si aucune vidéo n'est encore enregistrée en base
const FALLBACK_VIDEOS = [
  {
    id: 'v1',
    title: "Guerre à l'Est de la RDC : Immersion exclusive avec les FARDC sur la ligne de front",
    summary: "Grand format de nos envoyés spéciaux dans le Nord-Kivu au plus près des opérations sécuritaires.",
    category: "Politique",
    region: "Nord-Kivu",
    duration: "14:20",
    views: "48.5K",
    authorUsername: "Marc Kasongo",
    createdAt: new Date(Date.now() - 3600 * 1000 * 4).toISOString(),
    mainImageUrl: "https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=800&q=80",
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    isShort: false
  },
  {
    id: 'v2',
    title: "Léopards RDC : L'ambiance au rassemblement à Kinshasa avant le grand choc",
    summary: "Dans les coulisses de la tanière avec les joueurs et le sélectionneur national.",
    category: "Sport",
    region: "Kinshasa",
    duration: "0:45",
    views: "62.1K",
    authorUsername: "Life Sport",
    createdAt: new Date(Date.now() - 3600 * 1000 * 8).toISOString(),
    mainImageUrl: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=800&q=80",
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    isShort: true
  },
  {
    id: 'v3',
    title: "Mines du Katanga & Cobalt : Quelles retombées directes pour les populations ?",
    summary: "Enquête spéciale depuis Kolwezi et Lubumbashi sur les revenus miniers et le développement local.",
    category: "Économie",
    region: "Haut-Katanga",
    duration: "18:45",
    views: "34.8K",
    authorUsername: "Rédaction Économique",
    createdAt: new Date(Date.now() - 3600 * 1000 * 20).toISOString(),
    mainImageUrl: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=800&q=80",
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    isShort: false
  },
  {
    id: 'v4',
    title: "Kinshasa Express : 3 décisions majeures du conseil des ministres en 50 secondes",
    summary: "Synthèse rapide des mesures prises par le gouvernement pour le pouvoir d'achat.",
    category: "Société",
    region: "Kinshasa",
    duration: "0:50",
    views: "29.3K",
    authorUsername: "Rédaction Express",
    createdAt: new Date(Date.now() - 3600 * 1000 * 28).toISOString(),
    mainImageUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80",
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    isShort: true
  },
  {
    id: 'v5',
    title: "Rumba congolaise et scène urbaine : Quand les jeunes réinventent le patrimoine",
    summary: "Reportage culturel au cœur des studios d'enregistrement de Bandalungwa.",
    category: "Culture",
    region: "Kinshasa",
    duration: "11:15",
    views: "21.0K",
    authorUsername: "Culture & Rumba",
    createdAt: new Date(Date.now() - 3600 * 1000 * 48).toISOString(),
    mainImageUrl: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80",
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    isShort: false
  }
];

const extractYouTubeId = (url) => {
  if (!url) return null;
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
  return match ? match[1] : null;
};

const LiveStream = () => {
  const [activeLive, setActiveLive] = useState(null);
  const [videoList, setVideoList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [videoFilter, setVideoFilter] = useState('ALL'); // 'ALL' | 'LONGS' | 'SHORTS'
  const [selectedVideoModal, setSelectedVideoModal] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isPlayingLive, setIsPlayingLive] = useState(false);

  const { isPlaying, togglePlay } = useAudioPlayer();
  const { showToast } = useToast();

  useEffect(() => {
    const fetchLiveDataAndVideos = async () => {
      setLoading(true);
      try {
        // 1. Récupération du flux en direct configuré par l'administrateur
        const liveData = await getActiveLive();
        if (liveData && liveData.id) {
          setActiveLive(liveData);
        } else {
          setActiveLive({
            title: "LIFE CHANNEL TV : Antenne Kinshasa 24/7",
            description: "Information en continu, débats et grands journaux de la rédaction de Kinshasa et des provinces.",
            streamUrl: null
          });
        }
      } catch (err) {
        console.warn("Direct TV:", err);
      }

      // 2. Récupération des vidéos publiées par les journalistes
      try {
        const articlesData = await getArticles(null, null, 'PUBLISHED');
        const all = Array.isArray(articlesData) && articlesData.length > 0 ? articlesData : IMPORTED_ARTICLES;

        const curatedVideos = all.filter(a => {
          const t = (a.tags || '').toLowerCase();
          const c = (a.category || '').toLowerCase();
          return c === 'vidéos' || t.includes('video') || t.includes('short') || t.includes('reel') || t.includes('youtube') || t.includes('[video');
        }).map(v => {
          const matchUrl = v.tags && v.tags.match(/\[VIDEO_URL:([^\]]+)\]/);
          const matchDur = v.tags && v.tags.match(/\[DURATION:([^\]]+)\]/);
          const isShort = (v.tags || '').toLowerCase().includes('[video:short]') || (v.tags || '').toLowerCase().includes('short');
          return {
            id: v.id,
            title: v.title,
            summary: v.summary,
            category: v.category || 'Actualité',
            region: v.region || 'RDC',
            duration: matchDur ? matchDur[1] : (isShort ? '0:50' : '12:30'),
            views: '24K',
            authorUsername: v.authorUsername || 'Life Channel',
            createdAt: v.publicationDate || v.createdAt,
            mainImageUrl: v.mainImageUrl,
            videoUrl: matchUrl ? matchUrl[1] : (v.videoUrl || 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'),
            isShort
          };
        });

        if (curatedVideos.length > 0) {
          setVideoList(curatedVideos);
        } else {
          setVideoList(FALLBACK_VIDEOS);
        }
      } catch (e) {
        setVideoList(FALLBACK_VIDEOS);
      } finally {
        setLoading(false);
      }
    };

    fetchLiveDataAndVideos();
  }, []);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: "Life Channel Direct TV",
        url: window.location.href
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      showToast("Lien du direct copié !", "success");
    }
  };

  const handleStartLivePlayer = () => {
    setIsPlayingLive(true);
    if (!isPlaying) {
      togglePlay();
    }
    showToast("Diffusion en direct lancée !", "success");
  };

  // Filtrage selon le format sélectionné
  const displayedVideos = videoList.filter(vid => {
    if (videoFilter === 'SHORTS') return vid.isShort;
    if (videoFilter === 'LONGS') return !vid.isShort;
    return true;
  });

  const validLiveYtId = activeLive && activeLive.streamUrl ? extractYouTubeId(activeLive.streamUrl) : null;

  return (
    <div className="f24-page-container animate-fade-in">
      {/* En-tête Mobile Épuré (Sans overflow ni texte tronqué) */}
      <div className="live-mobile-header">
        <div className="f24-breadcrumb">
          <Link to="/">Accueil</Link>
          <span>&gt;</span>
          <span>Direct TV & Vidéos</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
          <div>
            <span className="live-badge-pulse">
              <Radio size={11} className="pulse" /> EN DIRECT 24/7
            </span>
            <h1 className="live-mobile-title">Life Channel en direct</h1>
          </div>
        </div>
      </div>

      {/* LECTEUR DU DIRECT PRINCIPAL (Pro-grade, aucun message d'erreur YouTube) */}
      <div className="clean-video-player-box">
        {validLiveYtId ? (
          <iframe
            title="Direct TV Life Channel"
            src={`https://www.youtube-nocookie.com/embed/${validLiveYtId}?autoplay=1&mute=${isMuted ? 1 : 0}`}
            style={{ width: '100%', height: '100%', border: 'none', display: 'block' }}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : isPlayingLive && activeLive?.streamUrl && !activeLive.streamUrl.includes('youtube') ? (
          <video
            src={activeLive.streamUrl}
            controls
            autoPlay
            muted={isMuted}
            style={{ width: '100%', height: '100%', display: 'block' }}
          />
        ) : (
          /* Écran d'accueil direct TV officiel Life Channel */
          <div className="clean-video-slate" onClick={handleStartLivePlayer}>
            <div className="clean-slate-top">
              <span className="clean-slate-live-pill">
                <Radio size={11} className="pulse" /> SIGNAL EN DIRECT
              </span>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setIsMuted(!isMuted); }}
                className="f24-audio-btn"
                title={isMuted ? "Activer le son" : "Couper le son"}
              >
                {isMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
              </button>
            </div>

            <div className="clean-slate-center">
              <div className="clean-slate-play-btn">
                <Play size={24} fill="#1a1412" style={{ marginLeft: '3px' }} />
              </div>
              <h2 className="clean-slate-title">
                {activeLive?.title || "LIFE CHANNEL TV : Antenne 24/7"}
              </h2>
            </div>

            <div className="clean-slate-bottom">
              <span>Kinshasa • Goma • Lubumbashi</span>
              <span>1080p HD</span>
            </div>
          </div>
        )}
      </div>

      {/* Barre d'info sous le lecteur */}
      <div className="clean-player-info">
        <div style={{ flex: 1, minWidth: 0 }}>
          <h3 className="clean-player-info-title">
            {activeLive?.title || "Édition Continue d'Information RDC"}
          </h3>
          <p className="clean-player-info-sub">
            {activeLive?.description || "Suivez en continu l'actualité politique, économique et sociétale."}
          </p>
        </div>
        <button
          type="button"
          onClick={handleShare}
          style={{
            background: 'rgba(255, 255, 255, 0.08)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            borderRadius: '50%',
            width: '38px',
            height: '38px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            cursor: 'pointer',
            flexShrink: 0
          }}
          title="Partager le direct"
        >
          <Share2 size={16} />
        </button>
      </div>

      {/* Bannière Publicitaire Légère */}
      <AdPlacement placement="HEADER" style={{ marginBottom: '22px' }} />

      {/* Titre de section épuré & Filtres par format de vidéo */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
        <div className="f24-section-header" style={{ margin: 0 }}>
          <div className="f24-square-accent" />
          <h2 className="f24-section-title">Vidéos de la Rédaction</h2>
        </div>

        {/* Pilules de filtres par format */}
        <div className="video-format-pills" style={{ margin: 0, padding: 0 }}>
          <button
            type="button"
            className={`video-pill-btn ${videoFilter === 'ALL' ? 'active' : ''}`}
            onClick={() => setVideoFilter('ALL')}
          >
            <span>Toutes ({videoList.length})</span>
          </button>
          <button
            type="button"
            className={`video-pill-btn ${videoFilter === 'LONGS' ? 'active' : ''}`}
            onClick={() => setVideoFilter('LONGS')}
          >
            <Video size={13} />
            <span>Grands Formats</span>
          </button>
          <button
            type="button"
            className={`video-pill-btn ${videoFilter === 'SHORTS' ? 'active' : ''}`}
            onClick={() => setVideoFilter('SHORTS')}
          >
            <Film size={13} />
            <span>Shorts (9:16)</span>
          </button>
        </div>
      </div>

      {/* Grille Vidéo Épurée (Spécialement pensée pour le format vidéo mobile) */}
      {videoFilter === 'SHORTS' ? (
        /* Formats Courts Verticaux (9:16) */
        <div className="clean-shorts-grid">
          {displayedVideos.map((vid) => (
            <div
              key={vid.id}
              className="short-reel-card"
              style={{ height: '240px', borderRadius: '12px', overflow: 'hidden' }}
              onClick={() => setSelectedVideoModal(vid)}
            >
              <img
                src={getFullImageUrl(vid.mainImageUrl, 'Vidéos')}
                alt={vid.title}
                className="short-reel-img"
                onError={(e) => handleImageError(e, 'Vidéos')}
              />
              <div className="short-reel-overlay" style={{ padding: '10px' }}>
                <span className="short-reel-tag" style={{ fontSize: '9px', padding: '2px 5px' }}>
                  <Film size={9} /> SHORT
                </span>
                <div className="short-reel-play-center">
                  <Play size={16} fill="#1a1412" />
                </div>
                <div>
                  <h4 className="short-reel-title" style={{ fontSize: '12px', lineHeight: '1.25' }}>
                    {vid.title}
                  </h4>
                  <span style={{ fontSize: '10px', color: '#94a3b8' }}>{vid.duration}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Formats Grands Formats & Toutes les vidéos (16:9 immersifs) */
        <div className="clean-video-grid">
          {displayedVideos.map((vid) => (
            <div
              key={vid.id}
              className="clean-video-card"
              onClick={() => setSelectedVideoModal(vid)}
            >
              <div className="clean-video-thumb-box">
                <img
                  src={getFullImageUrl(vid.mainImageUrl, 'Vidéos')}
                  alt={vid.title}
                  className="clean-video-thumb-img"
                  onError={(e) => handleImageError(e, 'Vidéos')}
                />
                <div className="clean-video-play-overlay">
                  <Play size={18} fill="currentColor" style={{ marginLeft: '2px' }} />
                </div>
                <span className="clean-video-cat-tag">
                  {vid.category}
                </span>
                <span className="clean-video-duration-tag">
                  {vid.duration}
                </span>
              </div>

              <div className="clean-video-info-box">
                <h3 className="clean-video-card-title">{vid.title}</h3>
                <div className="clean-video-card-meta">
                  <span>{vid.region || 'RDC'} • {vid.authorUsername}</span>
                  <Link
                    to={`/articles/${vid.id}`}
                    onClick={(e) => e.stopPropagation()}
                    style={{ color: '#E5A93C', textDecoration: 'none', fontWeight: '700', display: 'inline-flex', alignItems: 'center', gap: '3px' }}
                  >
                    Lire <ChevronRight size={12} />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL LECTEUR VIDÉO IMMERSIF */}
      {selectedVideoModal && (
        <div className="video-modal-backdrop" onClick={() => setSelectedVideoModal(null)}>
          <div className="video-modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <h3 style={{ margin: 0, fontSize: '15px', color: '#F5F3F0', fontWeight: '800' }}>
                {selectedVideoModal.title}
              </h3>
              <button
                type="button"
                onClick={() => setSelectedVideoModal(null)}
                style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', padding: '4px' }}
                title="Fermer"
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ position: 'relative', width: '100%', aspectRatio: '16 / 9', background: '#000' }}>
              {extractYouTubeId(selectedVideoModal.videoUrl) ? (
                <iframe
                  src={`https://www.youtube-nocookie.com/embed/${extractYouTubeId(selectedVideoModal.videoUrl)}?autoplay=1`}
                  title={selectedVideoModal.title}
                  style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <video
                  src={selectedVideoModal.videoUrl}
                  controls
                  autoPlay
                  style={{ width: '100%', height: '100%' }}
                />
              )}
            </div>

            {selectedVideoModal.summary && (
              <div style={{ padding: '14px 18px' }}>
                <p style={{ margin: 0, fontSize: '13px', color: '#cbd5e1', lineHeight: '1.45' }}>
                  {selectedVideoModal.summary}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default LiveStream;
