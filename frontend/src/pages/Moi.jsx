import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { useAudioPlayer } from '../contexts/AudioPlayerContext';
import { ChevronRight, X, LogOut, CheckCircle2, Star, Clock } from 'lucide-react';
import { IMPORTED_ARTICLES } from '../data/importedArticles';

// Icônes personnalisées reproduisant fidèlement la maquette de référence
const NewsIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="18" height="18" x="3" y="3" rx="3" />
    <line x1="7" x2="17" y1="8.5" y2="8.5" />
    <line x1="7" x2="17" y1="12" y2="12" />
    <line x1="7" x2="13" y1="15.5" y2="15.5" />
  </svg>
);

const SoccerIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polygon points="12 8 8.5 10.5 9.8 14.5 14.2 14.5 15.5 10.5" />
    <line x1="12" y1="2" x2="12" y2="8" />
    <line x1="2.5" y1="9" x2="8.5" y2="10.5" />
    <line x1="5.5" y1="19.5" x2="9.8" y2="14.5" />
    <line x1="18.5" y1="19.5" x2="14.2" y2="14.5" />
    <line x1="21.5" y1="9" x2="15.5" y2="10.5" />
  </svg>
);

const MusicIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="8" cy="18" r="4" />
    <path d="M12 18V4l8 2v10" />
    <circle cx="16" cy="16" r="4" />
  </svg>
);

const SettingsHexIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#818cf8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2l7.5 4.3v8.6L12 19.2l-7.5-4.3V6.3L12 2z" />
    <circle cx="12" cy="10.6" r="2.8" />
  </svg>
);

const Moi = () => {
  const { user, logout } = useAuth();
  const { showToast } = useToast();
  const { togglePlay, isPlaying } = useAudioPlayer();
  const navigate = useNavigate();

  // Nom d'utilisateur conforme à la maquette
  const displayName = user?.fullName || user?.username || localStorage.getItem('lifechannel_reader_name') || 'Ampereure Ngoy Modeste';

  // Modal interactif au clic sur une section
  const [activeModal, setActiveModal] = useState(null); // 'PROFILE' | 'FAVORITES' | 'HISTORY' | 'NEWS' | 'FOOTBALL'

  const [likedArticleIds] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('lifechannel_liked_articles') || '[]');
    } catch {
      return [];
    }
  });

  const handleStartMusic = () => {
    if (!isPlaying) {
      togglePlay();
      showToast("Radio Life Channel 24/7 en cours de diffusion.", "success");
    } else {
      showToast("La radio Life Channel est déjà en direct.", "info");
    }
  };

  const favoriteArticles = IMPORTED_ARTICLES.filter(a => likedArticleIds.includes(a.id) || likedArticleIds.includes(String(a.id)));
  const displayFavorites = favoriteArticles.length > 0 ? favoriteArticles : IMPORTED_ARTICLES.slice(0, 3);

  return (
    <div className="moi-page-container animate-fade-in">
      {/* 1. Titre épuré "Moi" en haut à gauche */}
      <h1 className="moi-header-title">Moi</h1>

      {/* 2. Carte profil utilisateur (Avatar + Bonjour + Nom en italique) */}
      <div 
        className="moi-profile-card"
        onClick={() => setActiveModal('PROFILE')}
        title="Gérer mon compte"
      >
        <div className="moi-avatar-wrap">
          {user?.picture ? (
            <img src={user.picture} alt={displayName} className="moi-avatar-img" />
          ) : (
            <img 
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80" 
              alt={displayName} 
              className="moi-avatar-img" 
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          )}
        </div>
        <div className="moi-profile-info">
          <div className="moi-greeting">Bonjour</div>
          <div className="moi-username">{displayName}</div>
        </div>
      </div>

      {/* 3. Premier bloc de cartes : Favoris & Historique */}
      <div className="moi-menu-group">
        <button
          type="button"
          className="moi-menu-item"
          onClick={() => setActiveModal('FAVORITES')}
        >
          <div className="moi-menu-left">
            <div className="moi-menu-icon">
              <Star size={19} color="#eab308" strokeWidth={1.8} fill="none" />
            </div>
            <span className="moi-menu-label">Favoris</span>
          </div>
          <div className="moi-menu-right">
            <ChevronRight size={16} className="moi-chevron" />
          </div>
        </button>

        <button
          type="button"
          className="moi-menu-item"
          onClick={() => setActiveModal('HISTORY')}
        >
          <div className="moi-menu-left">
            <div className="moi-menu-icon">
              <Clock size={19} color="#0284c7" strokeWidth={1.8} />
            </div>
            <span className="moi-menu-label">Historique</span>
          </div>
          <div className="moi-menu-right">
            <ChevronRight size={16} className="moi-chevron" />
          </div>
        </button>
      </div>

      {/* 4. Deuxième bloc de cartes : Mes actualités, Mon football, Ma musique */}
      <div className="moi-menu-group">
        <button
          type="button"
          className="moi-menu-item"
          onClick={() => setActiveModal('NEWS')}
        >
          <div className="moi-menu-left">
            <div className="moi-menu-icon">
              <NewsIcon />
            </div>
            <span className="moi-menu-label">Mes actualités</span>
          </div>
          <div className="moi-menu-right">
            {/* Badge rouge "2" conforme à la capture */}
            <span className="moi-menu-badge">2</span>
            <ChevronRight size={16} className="moi-chevron" />
          </div>
        </button>

        <button
          type="button"
          className="moi-menu-item"
          onClick={() => setActiveModal('FOOTBALL')}
        >
          <div className="moi-menu-left">
            <div className="moi-menu-icon">
              <SoccerIcon />
            </div>
            <span className="moi-menu-label">Mon football</span>
          </div>
          <div className="moi-menu-right">
            <ChevronRight size={16} className="moi-chevron" />
          </div>
        </button>

        <button
          type="button"
          className="moi-menu-item"
          onClick={handleStartMusic}
        >
          <div className="moi-menu-left">
            <div className="moi-menu-icon">
              <MusicIcon />
            </div>
            <span className="moi-menu-label">Ma musique</span>
          </div>
          <div className="moi-menu-right">
            <ChevronRight size={16} className="moi-chevron" />
          </div>
        </button>
      </div>

      {/* 5. Troisième bloc de cartes : Paramètres */}
      <div className="moi-menu-group">
        <Link to="/settings" className="moi-menu-item">
          <div className="moi-menu-left">
            <div className="moi-menu-icon">
              <SettingsHexIcon />
            </div>
            <span className="moi-menu-label">Paramètres</span>
          </div>
          <div className="moi-menu-right">
            <ChevronRight size={16} className="moi-chevron" />
          </div>
        </Link>
      </div>

      {/* MODAL INTERACTIF POUR LES FAVORIS, L'HISTORIQUE ET LE PROFIL */}
      {activeModal && (
        <div className="phoenix-drawer-backdrop" onClick={() => setActiveModal(null)}>
          <div className="phoenix-drawer-card" onClick={(e) => e.stopPropagation()}>
            <div className="phoenix-drawer-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="phoenix-vertical-accent" />
                <h3 style={{ margin: 0, fontSize: '16px', color: '#F5F3F0', fontWeight: '800' }}>
                  {activeModal === 'PROFILE' && 'Mon Profil Utilisateur'}
                  {activeModal === 'FAVORITES' && 'Mes Articles Favoris'}
                  {activeModal === 'HISTORY' && 'Historique de Lecture'}
                  {activeModal === 'NEWS' && 'Mes 2 Actualités Récentes'}
                  {activeModal === 'FOOTBALL' && 'Mon Football RDC & Léopards'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }}
              >
                <X size={18} />
              </button>
            </div>

            {activeModal === 'PROFILE' ? (
              <div style={{ padding: '8px 0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
                  <div className="moi-avatar-wrap" style={{ width: '56px', height: '56px' }}>
                    <img 
                      src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80" 
                      alt={displayName} 
                      className="moi-avatar-img" 
                    />
                  </div>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '16px', color: '#fff', fontWeight: '800' }}>{displayName}</h4>
                    <span style={{ fontSize: '12px', color: '#94a3b8' }}>
                      {user ? `Connecté sous @${user.username}` : 'Lecteur Citoyen • Life Channel'}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <Link
                    to="/settings"
                    onClick={() => setActiveModal(null)}
                    className="btn btn-secondary"
                    style={{ width: '100%', justifyContent: 'center', fontSize: '13px' }}
                  >
                    Gérer mes préférences et alertes
                  </Link>

                  {user && ['JOURNALIST', 'EDITOR', 'ADMIN', 'SUPER_ADMIN'].includes(user.role) && (
                    <Link
                      to="/admin/journalist"
                      onClick={() => setActiveModal(null)}
                      className="btn btn-primary"
                      style={{ width: '100%', justifyContent: 'center', fontSize: '13px' }}
                    >
                      Accéder à l'espace rédaction
                    </Link>
                  )}

                  {user && (
                    <button
                      type="button"
                      onClick={() => {
                        logout();
                        setActiveModal(null);
                        showToast("Déconnecté avec succès.", "info");
                      }}
                      style={{
                        background: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid rgba(239, 68, 68, 0.2)',
                        color: '#ef4444',
                        padding: '10px',
                        borderRadius: '8px',
                        fontSize: '13px',
                        fontWeight: '700',
                        cursor: 'pointer'
                      }}
                    >
                      Se déconnecter
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div style={{ maxHeight: '60vh', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {(activeModal === 'FOOTBALL' 
                  ? IMPORTED_ARTICLES.filter(a => (a.category || '').toLowerCase() === 'sport' || (a.title || '').toLowerCase().includes('léopard') || (a.title || '').toLowerCase().includes('football'))
                  : (activeModal === 'NEWS' ? IMPORTED_ARTICLES.slice(0, 2) : displayFavorites)
                ).map((art) => (
                  <Link
                    key={art.id}
                    to={`/articles/${art.id}`}
                    onClick={() => setActiveModal(null)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '10px',
                      borderRadius: '10px',
                      background: 'rgba(255, 255, 255, 0.03)',
                      textDecoration: 'none',
                      border: '1px solid rgba(255, 255, 255, 0.05)'
                    }}
                  >
                    <img
                      src={art.mainImageUrl}
                      alt={art.title}
                      style={{ width: '60px', height: '44px', objectFit: 'cover', borderRadius: '6px', flexShrink: 0 }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h5 style={{ margin: '0 0 2px', fontSize: '13px', color: '#F5F3F0', fontWeight: '700', lineHeight: '1.3' }}>
                        {art.title}
                      </h5>
                      <span style={{ fontSize: '11px', color: '#94a3b8' }}>{art.category || 'Actualité'}</span>
                    </div>
                    <ChevronRight size={15} color="#4b5563" />
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Moi;
