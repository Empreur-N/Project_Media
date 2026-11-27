import React, { useState, useEffect } from 'react';
import { getActiveLive, getArticles } from '../services/api';
import { Radio, Tv, Play, Film, Video, Clock, X, Share2, Volume2, VolumeX, Eye, ChevronRight, ExternalLink } from 'lucide-react';
import { getFullImageUrl, handleImageError } from '../utils/imageUtils';
import { IMPORTED_ARTICLES } from '../data/importedArticles';
import { Link } from 'react-router-dom';
import { useAudioPlayer } from '../contexts/AudioPlayerContext';
import { useToast } from '../contexts/ToastContext';
import AdPlacement from '../components/AdPlacement';

// Vidéos officielles Life Channel Sports & Actualités
const FALLBACK_VIDEOS = [
  {
    id: 'lc-yt-1',
    title: "Premier entraînement des Léopards RDC sur le sol américain",
    summary: "Reportage exclusif Life Channel Sports : première séance d'entraînement des Léopards de la RDC avant leurs confrontations internationales.",
    category: "Léopards RDC",
    region: "Kinshasa / USA",
    duration: "8:24",
    views: "12.8K",
    authorUsername: "Life Channel Sports",
    createdAt: new Date(Date.now() - 3600 * 1000 * 4).toISOString(),
    mainImageUrl: "https://img.youtube.com/vi/td_posdnQ4M/hqdefault.jpg",
    videoUrl: "https://www.youtube.com/watch?v=td_posdnQ4M",
    isShort: false
  },
  {
    id: 'lc-yt-2',
    title: "RDC 1-1 Portugal : Les Léopards marquent l'histoire",
    summary: "Analyse tactique et résumé complet du match héroïque de la République Démocratique du Congo face au Portugal.",
    category: "Grands Formats",
    region: "International",
    duration: "10:04",
    views: "24.3K",
    authorUsername: "Life Channel Sports",
    createdAt: new Date(Date.now() - 3600 * 1000 * 12).toISOString(),
    mainImageUrl: "https://img.youtube.com/vi/MbXHwKpTJls/hqdefault.jpg",
    videoUrl: "https://www.youtube.com/watch?v=MbXHwKpTJls",
    isShort: false
  },
  {
    id: 'lc-short-1',
    title: "RDC vs Danemark : Les Léopards sont-ils fin prêts pour le défi ?",
    summary: "Format court 9:16 : état des troupes et dernières impressions du staff technique congolais.",
    category: "Shorts",
    region: "Kinshasa",
    duration: "0:58",
    views: "18.5K",
    authorUsername: "Life Channel Sports",
    createdAt: new Date(Date.now() - 3600 * 1000 * 16).toISOString(),
    mainImageUrl: "https://img.youtube.com/vi/792wSj2x0HY/hqdefault.jpg",
    videoUrl: "https://www.youtube.com/shorts/792wSj2x0HY",
    isShort: true
  },
  {
    id: 'lc-yt-3',
    title: "Gaël Kakuta Story : les adieux et l'hommage d'une légende du football congolais",
    summary: "Rétrospective exclusive Life Channel sur la carrière, l'impact et l'héritage de Gaël Kakuta sous le maillot national.",
    category: "Documentaire",
    region: "RDC",
    duration: "8:26",
    views: "31.9K",
    authorUsername: "Life Channel Sports",
    createdAt: new Date(Date.now() - 3600 * 1000 * 24).toISOString(),
    mainImageUrl: "https://img.youtube.com/vi/cdNCVIAKZTQ/hqdefault.jpg",
    videoUrl: "https://www.youtube.com/watch?v=cdNCVIAKZTQ",
    isShort: false
  },
  {
    id: 'lc-short-2',
    title: "Jorthy Mokio ciblé par le Real Madrid : Ce que l'on sait",
    summary: "Format court 9:16 : la pépite congolaise au centre de toutes les convoitises des géants européens.",
    category: "Shorts",
    region: "Europe",
    duration: "0:45",
    views: "42.1K",
    authorUsername: "Life Channel Sports",
    createdAt: new Date(Date.now() - 3600 * 1000 * 30).toISOString(),
    mainImageUrl: "https://img.youtube.com/vi/co5Mg2spHYk/hqdefault.jpg",
    videoUrl: "https://www.youtube.com/shorts/co5Mg2spHYk",
    isShort: true
  },
  {
    id: 'lc-yt-4',
    title: "Direct Match | RDC vs Angleterre : Les Léopards visent les 8èmes",
    summary: "Revue tactique, compositions probables et enjeux majeurs du face-à-face mondial.",
    category: "Direct Match",
    region: "International",
    duration: "8:12",
    views: "27.4K",
    authorUsername: "Life Channel Sports",
    createdAt: new Date(Date.now() - 3600 * 1000 * 36).toISOString(),
    mainImageUrl: "https://img.youtube.com/vi/R7cXbe4FsHg/hqdefault.jpg",
    videoUrl: "https://www.youtube.com/watch?v=R7cXbe4FsHg",
    isShort: false
  },
  {
    id: 'lc-short-3',
    title: "Aaron Wan-Bissaka arrive enfin chez les Léopards de la RDC",
    summary: "Format court 9:16 : officialisation et renfort de poids pour le couloir droit de la sélection.",
    category: "Shorts",
    region: "Kinshasa",
    duration: "0:55",
    views: "36.8K",
    authorUsername: "Life Channel Sports",
    createdAt: new Date(Date.now() - 3600 * 1000 * 42).toISOString(),
    mainImageUrl: "https://img.youtube.com/vi/AgFSeDz94AM/hqdefault.jpg",
    videoUrl: "https://www.youtube.com/shorts/AgFSeDz94AM",
    isShort: true
  },
  {
    id: 'lc-yt-5',
    title: "CAN 2027 : La CAF prend sa décision finale pour l'Afrique centrale",
    summary: "Décryptage des votes du comité exécutif et des retombées pour les infrastructures sportives de la sous-région.",
    category: "Actualités CAF",
    region: "Afrique",
    duration: "8:18",
    views: "19.2K",
    authorUsername: "Life Channel Sports",
    createdAt: new Date(Date.now() - 3600 * 1000 * 48).toISOString(),
    mainImageUrl: "https://img.youtube.com/vi/98sw6zqgpaw/hqdefault.jpg",
    videoUrl: "https://www.youtube.com/watch?v=98sw6zqgpaw",
    isShort: false
  }
];

const extractYouTubeId = (url) => {
  if (!url) return null;
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([\w-]{11})/);
  return match ? match[1] : null;
};

const LiveStream = () => {
  const [activeLive, setActiveLive] = useState(null);
  const [videoList, setVideoList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [videoFilter, setVideoFilter] = useState('ALL'); // 'ALL' | 'LONGS' | 'SHORTS'
  const [selectedVideoModal, setSelectedVideoModal] = useState(null);
  const [currentVideo, setCurrentVideo] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isPlayingLive, setIsPlayingLive] = useState(false);

  const { isPlaying, togglePlay } = useAudioPlayer();
  const { showToast } = useToast();

  const handleSelectVideo = (vid) => {
    setCurrentVideo(vid);
    setIsPlayingLive(true);
    const playerElem = document.getElementById('main-video-player');
    if (playerElem) {
      playerElem.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

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
    if (!currentVideo && !validLiveYtId) {
      setCurrentVideo(FALLBACK_VIDEOS[0]);
    }
    setIsPlayingLive(true);
    showToast("Diffusion en direct lancée !", "success");
  };

  // Filtrage selon le format sélectionné
  const displayedVideos = videoList.filter(vid => {
    if (videoFilter === 'SHORTS') return vid.isShort;
    if (videoFilter === 'LONGS') return !vid.isShort;
    return true;
  });

  const validLiveYtId = activeLive && activeLive.streamUrl ? extractYouTubeId(activeLive.streamUrl) : null;
  const activeYtId = currentVideo ? extractYouTubeId(currentVideo.videoUrl) : validLiveYtId;
  const activeStreamUrl = currentVideo ? currentVideo.videoUrl : activeLive?.streamUrl;

  return (
    <div className="f24-page-container animate-fade-in">
      {/* En-tête Mobile Épuré (Style France 24 officiel) */}
      <div className="live-mobile-header">
        <div className="f24-breadcrumb">
          <Link to="/">ACCUEIL</Link>
          <span>&gt;</span>
          <span>TÉLÉVISION EN DIRECT</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', marginTop: '6px' }}>
          <div>
            <h1 className="live-mobile-title" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Tv size={22} color="var(--primary)" />
              REGARDEZ LIFE CHANNEL EN DIRECT
            </h1>
          </div>
        </div>
      </div>

      {/* LECTEUR DU DIRECT PRINCIPAL (Centré, responsive 16:9, embed officiel immédiat) */}
      <div className="clean-video-player-box" id="main-video-player">
        {activeYtId ? (
          <iframe
            title={currentVideo?.title || "Direct TV Life Channel"}
            src={`https://www.youtube-nocookie.com/embed/${activeYtId}?autoplay=1&mute=${isMuted ? 1 : 0}&rel=0&playsinline=1&enablejsapi=1`}
            style={{ width: '100%', height: '100%', border: 'none', display: 'block' }}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          />
        ) : isPlayingLive && activeStreamUrl && !activeStreamUrl.includes('youtube') ? (
          <video
            src={activeStreamUrl}
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
                {currentVideo?.title || activeLive?.title || "LIFE CHANNEL TV : Premier entraînement des Léopards"}
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
            {currentVideo?.title || activeLive?.title || "Édition Continue d'Information RDC"}
          </h3>
          <p className="clean-player-info-sub">
            {currentVideo?.summary || activeLive?.description || "Suivez en direct et en continu les actualités, reportages et débats sur Life Channel."}
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {activeYtId && (
            <a
              href={`https://www.youtube.com/watch?v=${activeYtId}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.35)',
                borderRadius: '20px',
                padding: '6px 12px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                color: '#f87171',
                fontSize: '12px',
                fontWeight: 700,
                textDecoration: 'none',
                cursor: 'pointer',
                flexShrink: 0
              }}
              title="Regarder directement sur l'application YouTube"
            >
              <ExternalLink size={13} /> YouTube
            </a>
          )}
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
      </div>

      {/* Bannière Publicitaire Légère */}
      <AdPlacement placement="HEADER" style={{ marginBottom: '22px' }} />

      {/* Titre de section épuré & Filtres par format de vidéo */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
        <div className="f24-section-header" style={{ margin: 0 }}>
          <div className="f24-square-accent" />
          <h2 className="f24-section-title">LIFE CHANNEL RECOMMANDE</h2>
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
              onClick={() => handleSelectVideo(vid)}
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
              onClick={() => handleSelectVideo(vid)}
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
