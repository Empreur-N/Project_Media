import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { useAudioPlayer } from '../contexts/AudioPlayerContext';
import { ChevronRight, X, LogOut, CheckCircle2, Star, Clock, HelpCircle, PenSquare, MessageSquare, ShieldCheck, UserCheck } from 'lucide-react';
import { IMPORTED_ARTICLES } from '../data/importedArticles';

// Icônes agrandies (24px) avec design haute précision
const NewsIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="18" height="18" x="3" y="3" rx="3.5" />
    <line x1="7" x2="17" y1="8" y2="8" />
    <line x1="7" x2="17" y1="12" y2="12" />
    <line x1="7" x2="13" y1="16" y2="16" />
  </svg>
);

const SoccerIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="8" cy="18" r="4" />
    <path d="M12 18V4l8 2v10" />
    <circle cx="16" cy="16" r="4" />
  </svg>
);

const SettingsHexIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#818cf8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2l7.5 4.3v8.6L12 19.2l-7.5-4.3V6.3L12 2z" />
    <circle cx="12" cy="10.6" r="2.8" />
  </svg>
);

const EditorialIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#a855f7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 20h9" />
    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
  </svg>
);

const MessageIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

const HelpIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#06b6d4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

const Moi = () => {
  const { user, logout } = useAuth();
  const { showToast } = useToast();
  const { togglePlay, isPlaying } = useAudioPlayer();
  const navigate = useNavigate();

  // Nom d'utilisateur personnalisé
  const displayName = user?.fullName || user?.username || localStorage.getItem('lifechannel_reader_name') || 'Ampereure Ngoy Modeste';

  // Masquer la top navbar desktop sur mobile quand on est sur la page Moi
  useEffect(() => {
    document.body.classList.add('hide-mobile-top-nav');
    return () => {
      document.body.classList.remove('hide-mobile-top-nav');
    };
  }, []);

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

  const handleLogout = () => {
    logout();
    showToast("Session clôturée avec succès.", "info");
    navigate('/');
  };

  const favoriteArticles = IMPORTED_ARTICLES.filter(a => likedArticleIds.includes(a.id) || likedArticleIds.includes(String(a.id)));
  const displayFavorites = favoriteArticles.length > 0 ? favoriteArticles : IMPORTED_ARTICLES.slice(0, 3);

  const getRoleLabel = () => {
    if (!user) return 'Lecteur Citoyen • Compte Actif';
    if (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') return 'Direction & Administration';
    if (user.role === 'EDITOR') return 'Éditeur & Contrôle Rédactionnel';
    if (user.role === 'JOURNALIST') return 'Journaliste Certifié Rédaction';
    return 'Membre Certifié • Life Channel';
  };

  return (
    <div className="moi-page-container animate-fade-in">
      {/* 1. Grand Titre Épuré "Moi" en haut à gauche */}
      <h1 className="moi-header-title">Moi</h1>

      {/* 2. Carte profil utilisateur aérée (Grand Avatar 74px + Bonjour + Nom + Statut) */}
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
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80" 
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
          <span className={`moi-user-role-badge ${!user ? 'reader' : ''}`}>
            <ShieldCheck size={13} />
            {getRoleLabel()}
          </span>
        </div>
      </div>

      {/* 3. Bloc 1 : Favoris & Historique */}
      <div className="moi-menu-group">
        <button
          type="button"
          className="moi-menu-item"
          onClick={() => setActiveModal('FAVORITES')}
        >
          <div className="moi-menu-left">
            <div className="moi-menu-icon">
              <Star size={24} color="#eab308" strokeWidth={2} fill="none" />
            </div>
            <div>
              <div className="moi-menu-label">Favoris</div>
              <div className="moi-menu-sublabel">Vos articles et vidéos enregistrés</div>
            </div>
          </div>
          <div className="moi-menu-right">
            <ChevronRight size={20} className="moi-chevron" />
          </div>
        </button>

        <button
          type="button"
          className="moi-menu-item"
          onClick={() => setActiveModal('HISTORY')}
        >
          <div className="moi-menu-left">
            <div className="moi-menu-icon">
              <Clock size={24} color="#0284c7" strokeWidth={2} />
            </div>
            <div>
              <div className="moi-menu-label">Historique</div>
              <div className="moi-menu-sublabel">Derniers contenus consultés</div>
            </div>
          </div>
          <div className="moi-menu-right">
            <ChevronRight size={20} className="moi-chevron" />
          </div>
        </button>
      </div>

      {/* 4. Bloc 2 : Mes actualités, Mon football, Ma musique */}
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
            <div>
              <div className="moi-menu-label">Mes actualités</div>
              <div className="moi-menu-sublabel">Sélection d'information personnalisée</div>
            </div>
          </div>
          <div className="moi-menu-right">
            <span className="moi-menu-badge">2</span>
            <ChevronRight size={20} className="moi-chevron" />
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
            <div>
              <div className="moi-menu-label">Mon football</div>
              <div className="moi-menu-sublabel">Léopards RDC, CAN & Championnats</div>
            </div>
          </div>
          <div className="moi-menu-right">
            <ChevronRight size={20} className="moi-chevron" />
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
            <div>
              <div className="moi-menu-label">Ma musique</div>
              <div className="moi-menu-sublabel">Signal Radio Life Channel 24/7</div>
            </div>
          </div>
          <div className="moi-menu-right">
            <ChevronRight size={20} className="moi-chevron" />
          </div>
        </button>
      </div>

      {/* 5. Bloc 3 : Section Essentielle Espace Journaliste & Rédaction */}
      <div className="moi-menu-group">
        <Link 
          to={user && ['JOURNALIST', 'EDITOR', 'ADMIN', 'SUPER_ADMIN'].includes(user.role) ? "/admin/journalist" : "/login"} 
          className="moi-menu-item"
        >
          <div className="moi-menu-left">
            <div className="moi-menu-icon">
              <EditorialIcon />
            </div>
            <div>
              <div className="moi-menu-label">Espace Journaliste & Rédaction</div>
              <div className="moi-menu-sublabel">Publication d'articles, reportages et vidéos</div>
            </div>
          </div>
          <div className="moi-menu-right">
            <ChevronRight size={20} className="moi-chevron" />
          </div>
        </Link>

        <Link 
          to={user && ['JOURNALIST', 'EDITOR', 'ADMIN', 'SUPER_ADMIN', 'SUPERVISOR'].includes(user.role) ? "/admin/messages" : "/login"} 
          className="moi-menu-item"
        >
          <div className="moi-menu-left">
            <div className="moi-menu-icon">
              <MessageIcon />
            </div>
            <div>
              <div className="moi-menu-label">Messagerie & Signalements</div>
              <div className="moi-menu-sublabel">Échanges en direct avec la Direction</div>
            </div>
          </div>
          <div className="moi-menu-right">
            <ChevronRight size={20} className="moi-chevron" />
          </div>
        </Link>
      </div>

      {/* 6. Bloc 4 : Paramètres & Assistance */}
      <div className="moi-menu-group">
        <Link to="/settings" className="moi-menu-item">
          <div className="moi-menu-left">
            <div className="moi-menu-icon">
              <SettingsHexIcon />
            </div>
            <div>
              <div className="moi-menu-label">Paramètres</div>
              <div className="moi-menu-sublabel">Préférences, alertes et sécurité</div>
            </div>
          </div>
          <div className="moi-menu-right">
            <ChevronRight size={20} className="moi-chevron" />
          </div>
        </Link>

        <Link to="/aide" className="moi-menu-item">
          <div className="moi-menu-left">
            <div className="moi-menu-icon">
              <HelpIcon />
            </div>
            <div>
              <div className="moi-menu-label">Aide & Contact Rédaction</div>
              <div className="moi-menu-sublabel">Assistance technique et FAQ</div>
            </div>
          </div>
          <div className="moi-menu-right">
            <ChevronRight size={20} className="moi-chevron" />
          </div>
        </Link>
      </div>

      {/* 7. Bloc 5 : Bouton d'action principal spacieux (Déconnexion / Connexion) */}
      {user ? (
        <button
          type="button"
          onClick={handleLogout}
          className="moi-action-card-btn moi-logout-btn"
        >
          <LogOut size={20} />
          <span>Se déconnecter de la session</span>
        </button>
      ) : (
        <Link
          to="/login"
          className="moi-action-card-btn moi-login-btn"
        >
          <UserCheck size={20} />
          <span>Connexion / Accès Collaborateur</span>
        </Link>
      )}

      {/* MODAL INTERACTIF POUR LES FAVORIS, L'HISTORIQUE ET LE PROFIL */}
      {activeModal && (
        <div className="phoenix-drawer-backdrop" onClick={() => setActiveModal(null)}>
          <div className="phoenix-drawer-card" onClick={(e) => e.stopPropagation()}>
            <div className="phoenix-drawer-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="phoenix-vertical-accent" />
                <h3 style={{ margin: 0, fontSize: '17px', color: '#F5F3F0', fontWeight: '800' }}>
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
                style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '6px' }}
              >
                <X size={20} />
              </button>
            </div>

            {activeModal === 'PROFILE' ? (
              <div style={{ padding: '10px 0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
                  <div className="moi-avatar-wrap" style={{ width: '68px', height: '68px' }}>
                    <img 
                      src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80" 
                      alt={displayName} 
                      className="moi-avatar-img" 
                    />
                  </div>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '18px', color: '#fff', fontWeight: '800' }}>{displayName}</h4>
                    <span style={{ fontSize: '13px', color: '#94a3b8' }}>
                      {user ? `Connecté sous @${user.username}` : 'Lecteur Citoyen • Life Channel'}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <Link
                    to="/settings"
                    onClick={() => setActiveModal(null)}
                    className="btn btn-secondary"
                    style={{ width: '100%', justifyContent: 'center', fontSize: '14px', padding: '12px' }}
                  >
                    Gérer mes préférences et alertes
                  </Link>

                  {user && ['JOURNALIST', 'EDITOR', 'ADMIN', 'SUPER_ADMIN'].includes(user.role) && (
                    <Link
                      to="/admin/journalist"
                      onClick={() => setActiveModal(null)}
                      className="btn btn-primary"
                      style={{ width: '100%', justifyContent: 'center', fontSize: '14px', padding: '12px' }}
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
                        border: '1px solid rgba(239, 68, 68, 0.25)',
                        color: '#ef4444',
                        padding: '12px',
                        borderRadius: '10px',
                        fontSize: '14px',
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
              <div style={{ maxHeight: '60vh', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
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
                      gap: '14px',
                      padding: '12px',
                      borderRadius: '12px',
                      background: 'rgba(255, 255, 255, 0.03)',
                      textDecoration: 'none',
                      border: '1px solid rgba(255, 255, 255, 0.05)'
                    }}
                  >
                    <img
                      src={art.mainImageUrl}
                      alt={art.title}
                      style={{ width: '68px', height: '50px', objectFit: 'cover', borderRadius: '8px', flexShrink: 0 }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h5 style={{ margin: '0 0 3px', fontSize: '14px', color: '#F5F3F0', fontWeight: '700', lineHeight: '1.3' }}>
                        {art.title}
                      </h5>
                      <span style={{ fontSize: '12px', color: '#94a3b8' }}>{art.category || 'Actualité'}</span>
                    </div>
                    <ChevronRight size={18} color="#64748b" />
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
