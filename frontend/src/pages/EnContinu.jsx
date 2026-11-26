import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getArticles } from '../services/api';
import { IMPORTED_ARTICLES } from '../data/importedArticles';
import { getFullImageUrl, handleImageError } from '../utils/imageUtils';
import AdPlacement from '../components/AdPlacement';
import { Play, Film, Video, Clock, ChevronRight, X, Radio, Sparkles } from 'lucide-react';

const CATEGORIES = [
  'TOUT',
  'RDC',
  'AFRIQUE',
  'MONDE',
  'MOYEN-ORIENT',
  'ÉCONOMIE',
  'SPORT',
  'CULTURE'
];

const EnContinu = () => {
  const [selectedCategory, setSelectedCategory] = useState('TOUT');
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedVideoModal, setSelectedVideoModal] = useState(null);

  useEffect(() => {
    const fetchContent = async () => {
      setLoading(true);
      try {
        const data = await getArticles(null, null, 'PUBLISHED');
        if (Array.isArray(data) && data.length > 0) {
          setArticles(data);
        } else {
          setArticles(IMPORTED_ARTICLES);
        }
      } catch (err) {
        console.warn("Utilisation du flux local pour En Continu:", err);
        setArticles(IMPORTED_ARTICLES);
      } finally {
        setLoading(false);
      }
    };
    fetchContent();
  }, []);

  // Filtrage selon la rubrique active
  const filteredArticles = articles.filter(art => {
    if (selectedCategory === 'TOUT') return true;
    const cat = (art.category || '').toUpperCase();
    const reg = (art.region || '').toUpperCase();
    const tag = (art.tags || '').toUpperCase();
    const matchKey = selectedCategory.toUpperCase();
    return cat.includes(matchKey) || reg.includes(matchKey) || tag.includes(matchKey);
  });

  const extractYouTubeId = (url) => {
    if (!url) return null;
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
    return match ? match[1] : null;
  };

  return (
    <div className="f24-page-container animate-fade-in">
      {/* Barre de navigation horizontale des rubriques (Style France 24 avec carrés cyan) */}
      <div className="f24-categories-bar">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            type="button"
            className={`f24-cat-btn ${selectedCategory === cat ? 'active' : ''}`}
            onClick={() => setSelectedCategory(cat)}
          >
            <span className="f24-cat-square" />
            <span>{cat}</span>
          </button>
        ))}
      </div>

      {/* Bannière Publicitaire Supérieure */}
      <AdPlacement placement="HEADER" style={{ marginBottom: '18px' }} />

      {/* Fil d'Ariane Style France 24 */}
      <div className="f24-breadcrumb">
        <Link to="/">Accueil</Link>
        <span>&gt;</span>
        <span>Dernières émissions de télévision</span>
      </div>

      {/* Grand Titre Style France 24 */}
      <h1 className="f24-page-title" style={{ fontSize: '24px', letterSpacing: '0.2px' }}>
        Dernières émissions de télévision
      </h1>

      {/* Paragraphe d'accroche éditorial officiel */}
      <p className="f24-intro-text">
        Reportages, débats, interviews, analyses et une dose quotidienne de culture... Retrouvez tous les derniers programmes diffusés sur LIFE CHANNEL. Découvrez toutes nos émissions.
      </p>

      {/* Titre de section "Dernières Nouvelles" avec carré cyan */}
      <div className="f24-section-header">
        <div className="f24-square-accent" />
        <h2 className="f24-section-title">
          {selectedCategory === 'TOUT' ? 'Dernières Nouvelles' : `Dernières Nouvelles — ${selectedCategory}`}
        </h2>
      </div>

      {/* Grille de programmes & émissions (Style France 24) */}
      {loading ? (
        <div style={{ padding: '40px 0', textAlign: 'center', color: '#94a3b8' }}>
          Chargement des émissions en continu...
        </div>
      ) : filteredArticles.length === 0 ? (
        <div className="glass-card" style={{ padding: '30px', textAlign: 'center', color: '#94a3b8' }}>
          Aucune émission disponible pour cette catégorie pour le moment.
        </div>
      ) : (
        <div className="f24-rec-grid">
          {filteredArticles.map((art) => {
            const matchUrl = art.tags && art.tags.match(/\[VIDEO_URL:([^\]]+)\]/);
            const vidUrl = matchUrl ? matchUrl[1] : (art.videoUrl || '');
            const categoryLabel = art.region || art.category || 'RDC';

            return (
              <div 
                key={art.id} 
                className="f24-rec-card"
                onClick={() => {
                  if (vidUrl) {
                    setSelectedVideoModal({
                      id: art.id,
                      title: art.title,
                      videoUrl: vidUrl,
                      summary: art.summary,
                      imageUrl: art.mainImageUrl
                    });
                  }
                }}
              >
                <div className="f24-rec-img-wrap">
                  <img 
                    src={getFullImageUrl(art.mainImageUrl, art.category)} 
                    alt={art.title} 
                    className="f24-rec-img"
                    onError={(e) => handleImageError(e, art.category)}
                  />
                  {vidUrl && (
                    <div style={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      width: '42px',
                      height: '42px',
                      borderRadius: '50%',
                      background: 'rgba(2, 132, 199, 0.9)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#fff',
                      boxShadow: '0 4px 16px rgba(0,0,0,0.6)'
                    }}>
                      <Play size={16} fill="#fff" />
                    </div>
                  )}
                </div>

                {/* Bandeau inférieur "PROGRAMME | [RÉGION/CATÉGORIE]" */}
                <div className="f24-rec-bottom-strip">
                  <Play size={10} fill="#38bdf8" />
                  <span>Programme | {categoryLabel}</span>
                </div>

                <div className="f24-rec-content">
                  <h3 className="f24-rec-item-title">{art.title}</h3>
                  {art.summary && (
                    <p className="f24-rec-item-desc">{art.summary}</p>
                  )}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto', paddingTop: '8px' }}>
                    <span style={{ fontSize: '11px', color: '#94a3b8' }}>
                      {art.publicationDate ? new Date(art.publicationDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }) : 'Récemment'}
                    </span>
                    <Link 
                      to={`/articles/${art.id}`} 
                      onClick={(e) => e.stopPropagation()} 
                      style={{ color: '#38bdf8', fontSize: '12px', fontWeight: '800', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                    >
                      Consulter <ChevronRight size={13} />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal vidéo interactif au clic */}
      {selectedVideoModal && (
        <div className="video-modal-backdrop" onClick={() => setSelectedVideoModal(null)}>
          <div className="video-modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <h3 style={{ margin: 0, fontSize: '16px', color: '#F5F3F0', fontWeight: '800' }}>
                {selectedVideoModal.title}
              </h3>
              <button
                type="button"
                onClick={() => setSelectedVideoModal(null)}
                style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', padding: '4px' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ position: 'relative', width: '100%', aspectRatio: '16 / 9', background: '#000' }}>
              {extractYouTubeId(selectedVideoModal.videoUrl) ? (
                <iframe
                  src={`https://www.youtube.com/embed/${extractYouTubeId(selectedVideoModal.videoUrl)}?autoplay=1`}
                  title={selectedVideoModal.title}
                  style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
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
              <div style={{ padding: '16px 20px' }}>
                <p style={{ margin: 0, fontSize: '13.5px', color: '#cbd5e1', lineHeight: '1.5' }}>
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

export default EnContinu;
