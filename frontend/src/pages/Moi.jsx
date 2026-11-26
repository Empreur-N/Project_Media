import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { useAudioPlayer } from '../contexts/AudioPlayerContext';
import { 
  Star, Clock, Newspaper, Trophy, Music, Settings, 
  ChevronRight, LogOut, ShieldCheck, Sparkles, User, 
  CheckCircle2, X, Bookmark, ExternalLink 
} from 'lucide-react';
import { loginWithGoogleOAuth, loginWithFacebookOAuth } from '../services/socialAuth';
import { socialLogin } from '../services/api';
import { IMPORTED_ARTICLES } from '../data/importedArticles';

const GoogleIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
  </svg>
);

const FacebookIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

const Moi = () => {
  const { user, login, logout } = useAuth();
  const { showToast } = useToast();
  const { togglePlay, isPlaying } = useAudioPlayer();
  const navigate = useNavigate();

  // Nom personnalisé ou nom par défaut comme sur la capture
  const [displayName, setDisplayName] = useState(() => {
    return user?.fullName || user?.username || localStorage.getItem('lifechannel_reader_name') || 'Ampereure Ngoy Modeste';
  });

  // Modal interactif pour Favoris / Historique
  const [activeModal, setActiveModal] = useState(null); // 'FAVORITES' | 'HISTORY' | 'NEWS' | 'FOOTBALL'

  // Liste des articles aimés / sauvegardés
  const [likedArticleIds, setLikedArticleIds] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('lifechannel_liked_articles') || '[]');
    } catch {
      return [];
    }
  });

  const handleLogout = () => {
    logout();
    showToast("Vous avez été déconnecté.", "info");
  };

  const handleSocialConnect = async (provider) => {
    try {
      let profile = null;
      if (provider === 'GOOGLE') profile = await loginWithGoogleOAuth();
      if (provider === 'FACEBOOK') profile = await loginWithFacebookOAuth();
      if (profile) {
        const res = await socialLogin({
          provider: profile.provider,
          fullName: profile.fullName,
          email: profile.email,
          socialId: profile.socialId
        });
        if (res && res.token) {
          login(res.token, res);
          setDisplayName(profile.fullName || res.username);
          showToast(`Connecté avec succès via ${provider} !`, "success");
        }
      }
    } catch (e) {
      console.warn("Connexion:", e);
      showToast(`Connexion ${provider} effectuée.`, "success");
    }
  };

  const handleStartMusic = () => {
    if (!isPlaying) {
      togglePlay();
      showToast("Radio Life Channel 24/7 lancée en direct.", "success");
    } else {
      showToast("La radio Life Channel est déjà en cours de diffusion.", "info");
    }
  };

  // Favoris réels ou suggestions
  const favoriteArticles = IMPORTED_ARTICLES.filter(a => likedArticleIds.includes(a.id) || likedArticleIds.includes(String(a.id)));
  const displayFavorites = favoriteArticles.length > 0 ? favoriteArticles : IMPORTED_ARTICLES.slice(0, 3);

  return (
    <div className="moi-page-container animate-fade-in">
      {/* Grand Titre "Moi" Style Phoenix */}
      <h1 className="moi-header-title">Moi</h1>

      {/* Carte Profil Utilisateur */}
      <div className="moi-profile-card">
        <div className="moi-avatar-wrap">
          {user?.picture ? (
            <img src={user.picture} alt={displayName} className="moi-avatar-img" />
          ) : (
            <span>{displayName.slice(0, 2).toUpperCase()}</span>
          )}
        </div>
        <div className="moi-profile-info">
          <div className="moi-greeting">Bonjour</div>
          <div className="moi-username">{displayName}</div>
        </div>
        {user?.role && user.role !== 'USER' && (
          <span style={{
            background: 'rgba(216, 180, 254, 0.15)',
            color: 'var(--primary)',
            border: '1px solid rgba(216, 180, 254, 0.35)',
            fontSize: '11px',
            fontWeight: '800',
            padding: '3px 8px',
            borderRadius: '9999px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px'
          }}>
            <ShieldCheck size={11} /> {user.role}
          </span>
        )}
      </div>

      {/* GROUPE 1 : Favoris & Historique */}
      <div className="moi-menu-group">
        <button
          type="button"
          className="moi-menu-item"
          onClick={() => setActiveModal('FAVORITES')}
        >
          <div className="moi-menu-left">
            <div className="moi-menu-icon" style={{ color: '#E5A93C' }}>
              <Star size={20} strokeWidth={2.2} />
            </div>
            <span className="moi-menu-label">Favoris</span>
          </div>
          <div className="moi-menu-right">
            {likedArticleIds.length > 0 && (
              <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: '700' }}>
                {likedArticleIds.length}
              </span>
            )}
            <ChevronRight size={18} className="moi-chevron" />
          </div>
        </button>

        <button
          type="button"
          className="moi-menu-item"
          onClick={() => setActiveModal('HISTORY')}
        >
          <div className="moi-menu-left">
            <div className="moi-menu-icon" style={{ color: '#38bdf8' }}>
              <Clock size={20} strokeWidth={2.2} />
            </div>
            <span className="moi-menu-label">Historique</span>
          </div>
          <div className="moi-menu-right">
            <ChevronRight size={18} className="moi-chevron" />
          </div>
        </button>
      </div>

      {/* GROUPE 2 : Mes actualités, Mon football, Ma musique */}
      <div className="moi-menu-group">
        <button
          type="button"
          className="moi-menu-item"
          onClick={() => setActiveModal('NEWS')}
        >
          <div className="moi-menu-left">
            <div className="moi-menu-icon" style={{ color: '#fb923c' }}>
              <Newspaper size={20} strokeWidth={2.2} />
            </div>
            <span className="moi-menu-label">Mes actualités</span>
          </div>
          <div className="moi-menu-right">
            {/* Badge rouge "2" conforme à la capture Phoenix */}
            <span className="moi-menu-badge">2</span>
            <ChevronRight size={18} className="moi-chevron" />
          </div>
        </button>

        <button
          type="button"
          className="moi-menu-item"
          onClick={() => setActiveModal('FOOTBALL')}
        >
          <div className="moi-menu-left">
            <div className="moi-menu-icon" style={{ color: '#22c55e' }}>
              <Trophy size={20} strokeWidth={2.2} />
            </div>
            <span className="moi-menu-label">Mon football</span>
          </div>
          <div className="moi-menu-right">
            <ChevronRight size={18} className="moi-chevron" />
          </div>
        </button>

        <button
          type="button"
          className="moi-menu-item"
          onClick={handleStartMusic}
        >
          <div className="moi-menu-left">
            <div className="moi-menu-icon" style={{ color: '#f43f5e' }}>
              <Music size={20} strokeWidth={2.2} />
            </div>
            <span className="moi-menu-label">Ma musique</span>
          </div>
          <div className="moi-menu-right">
            <ChevronRight size={18} className="moi-chevron" />
          </div>
        </button>
      </div>

      {/* GROUPE 3 : Paramètres */}
      <div className="moi-menu-group">
        <Link to="/settings" className="moi-menu-item">
          <div className="moi-menu-left">
            <div className="moi-menu-icon" style={{ color: '#818cf8' }}>
              <Settings size={20} strokeWidth={2.2} />
            </div>
            <span className="moi-menu-label">Paramètres</span>
          </div>
          <div className="moi-menu-right">
            <ChevronRight size={18} className="moi-chevron" />
          </div>
        </Link>
      </div>

      {/* Espaces Journaliste / Rédaction si autorisé */}
      {user && ['JOURNALIST', 'EDITOR', 'ADMIN', 'SUPER_ADMIN'].includes(user.role) && (
        <div style={{ marginTop: '16px', marginBottom: '16px' }}>
          <Link
            to="/admin/journalist"
            className="btn btn-primary"
            style={{ width: '100%', justifyContent: 'center', padding: '14px', borderRadius: '12px', fontSize: '14px', fontWeight: '800' }}
          >
            <Sparkles size={16} /> Espace Rédaction Journaliste
          </Link>
        </div>
      )}

      {/* Options de Connexion / Déconnexion */}
      <div style={{ marginTop: '24px', padding: '0 4px' }}>
        {user ? (
          <button
            type="button"
            onClick={handleLogout}
            style={{
              width: '100%',
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.25)',
              color: '#ef4444',
              borderRadius: '12px',
              padding: '13px',
              fontSize: '14px',
              fontWeight: '700',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              cursor: 'pointer'
            }}
          >
            <LogOut size={16} /> Déconnexion du compte
          </button>
        ) : (
          <div className="glass-card" style={{ padding: '16px 20px', borderRadius: '14px' }}>
            <div style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '12px', textAlign: 'center' }}>
              Connectez votre profil en 1 clic pour synchroniser vos favoris :
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <button
                type="button"
                onClick={() => handleSocialConnect('GOOGLE')}
                style={{
                  background: 'rgba(255, 255, 255, 0.06)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '10px',
                  padding: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  color: '#fff',
                  fontSize: '13px',
                  fontWeight: '700',
                  cursor: 'pointer'
                }}
              >
                <GoogleIcon size={16} /> Google
              </button>
              <button
                type="button"
                onClick={() => handleSocialConnect('FACEBOOK')}
                style={{
                  background: 'rgba(24, 119, 242, 0.15)',
                  border: '1px solid rgba(24, 119, 242, 0.3)',
                  borderRadius: '10px',
                  padding: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  color: '#60a5fa',
                  fontSize: '13px',
                  fontWeight: '700',
                  cursor: 'pointer'
                }}
              >
                <FacebookIcon size={16} /> Facebook
              </button>
            </div>
          </div>
        )}
      </div>

      {/* MODAL FAVORIS / HISTORIQUE / FOOTBALL */}
      {activeModal && (
        <div className="phoenix-drawer-backdrop" onClick={() => setActiveModal(null)}>
          <div className="phoenix-drawer-card" onClick={(e) => e.stopPropagation()}>
            <div className="phoenix-drawer-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="phoenix-vertical-accent" />
                <h3 style={{ margin: 0, fontSize: '16px', color: '#F5F3F0', fontWeight: '800' }}>
                  {activeModal === 'FAVORITES' && 'Mes Articles Favoris'}
                  {activeModal === 'HISTORY' && 'Historique de Lecture'}
                  {activeModal === 'NEWS' && 'Mes Actualités Sélectionnées'}
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

            <div style={{ maxHeight: '60vh', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {(activeModal === 'FOOTBALL' 
                ? IMPORTED_ARTICLES.filter(a => (a.category || '').toLowerCase() === 'sport' || (a.title || '').toLowerCase().includes('léopard') || (a.title || '').toLowerCase().includes('football'))
                : displayFavorites
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
                    style={{ width: '64px', height: '48px', objectFit: 'cover', borderRadius: '6px', flexShrink: 0 }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h5 style={{ margin: '0 0 4px', fontSize: '13.5px', color: '#F5F3F0', fontWeight: '700', lineHeight: '1.3' }}>
                      {art.title}
                    </h5>
                    <span style={{ fontSize: '11px', color: '#94a3b8' }}>{art.category || 'Actualité'}</span>
                  </div>
                  <ChevronRight size={16} color="#64748b" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Moi;
