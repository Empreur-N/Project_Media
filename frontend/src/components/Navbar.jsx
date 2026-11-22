import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useAudioPlayer } from '../contexts/AudioPlayerContext';
import { useDataSaver } from '../contexts/DataSaverContext';
import { useTimezone } from '../contexts/TimezoneContext';
import { LogOut, LayoutDashboard, User as UserIcon, Radio, Newspaper, Search, Menu, X, ChevronDown, HelpCircle, Zap, Clock, Bell } from 'lucide-react';
import NotificationBell from './NotificationBell';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { playRadio, isRadioLive, isPlaying } = useAudioPlayer();
  const { dataSaver, toggleDataSaver } = useDataSaver();
  const { toggleTimezone, currentDetails } = useTimezone();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [pushActive, setPushActive] = useState(
    typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted'
  );
  const dropdownRef = useRef(null);

  const handleTogglePush = async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      alert("Votre navigateur ne prend pas en charge les notifications push.");
      return;
    }
    if (Notification.permission === 'granted') {
      alert("Les alertes Flash Info sont déjà activées sur votre navigateur !");
      return;
    }
    try {
      const res = await Notification.requestPermission();
      if (res === 'granted') {
        setPushActive(true);
        const notifTitle = '🔴 LIFE CHANNEL MEDIA';
        const notifOptions = {
          body: '✅ Alertes Flash activées ! Vous recevrez nos alertes urgentes et breaking news en direct.',
          icon: '/logo.png',
          badge: '/logo.png'
        };
        if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
          navigator.serviceWorker.ready.then((reg) => {
            reg.showNotification(notifTitle, notifOptions);
          });
        } else {
          new Notification(notifTitle, notifOptions);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    setDropdownOpen(false);
    navigate('/');
  };

  const handleLinkClick = () => {
    setMenuOpen(false);
    setDropdownOpen(false);
  };

  // Fermer le dropdown en cliquant à l'extérieur
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <nav className="navbar" style={styles.nav}>
      <div className="container" style={styles.container}>
        {/* Logo */}
        <Link to="/" style={styles.logoContainer} onClick={handleLinkClick}>
          <img src="/logo.png" alt="Life Channel Logo" style={styles.logoImage} />
          <span style={styles.logoText}>LIFE <span style={{ color: 'var(--secondary)' }}>CHANNEL</span></span>
        </Link>

        {/* Mobile Hamburger Button */}
        <button 
          onClick={() => setMenuOpen(!menuOpen)} 
          style={styles.mobileToggle}
          className="mobile-toggle-btn"
          aria-label="Toggle navigation"
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Navigation Wrapper (Links + Auth) */}
        <div className={`nav-menu-wrapper ${menuOpen ? 'mobile-open' : ''}`} style={styles.menuWrapper}>
          
          {/* Main Navigation Links */}
          <div className="nav-links-container" style={styles.navLinks}>
            <Link to="/" style={styles.navLink} onClick={handleLinkClick}>
              <Newspaper size={15} style={{ opacity: 0.8 }} /> Actualités
            </Link>
            <Link to="/search" style={styles.navLink} onClick={handleLinkClick}>
              <Search size={15} style={{ opacity: 0.8 }} /> Recherche
            </Link>
            <Link to="/podcasts" style={styles.navLink} onClick={handleLinkClick}>
              <Radio size={15} style={{ opacity: 0.8 }} /> Podcasts
            </Link>
            <Link to="/live" style={styles.navLink} onClick={handleLinkClick}>
              <Radio size={15} style={{ opacity: 0.8 }} /> Direct
            </Link>
            <button 
              onClick={() => {
                playRadio();
                handleLinkClick();
              }}
              className="nav-radio-btn"
              style={{
                ...styles.navLink,
                background: isRadioLive && isPlaying 
                  ? 'linear-gradient(135deg, rgba(216, 180, 254, 0.22) 0%, rgba(107, 79, 56, 0.28) 100%)' 
                  : 'rgba(255, 255, 255, 0.03)',
                border: isRadioLive && isPlaying 
                  ? '1px solid rgba(216, 180, 254, 0.5)' 
                  : '1px solid var(--border-color)',
                borderRadius: '9999px',
                padding: '5px 12px',
                cursor: 'pointer',
                color: isRadioLive && isPlaying ? 'var(--primary)' : 'var(--text-secondary)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '11px',
                fontWeight: '800',
                letterSpacing: '0.08em',
                textTransform: 'uppercase'
              }}
              title="Écouter la radio 24h/24 en direct"
            >
              <Radio size={14} /> 
              <span>Radio 24/7</span>
              {isRadioLive && isPlaying && (
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--primary)', boxShadow: '0 0 8px var(--primary)', animation: 'pulse 1.2s infinite' }} />
              )}
            </button>
            <Link to="/faq" style={styles.navLink} onClick={handleLinkClick}>
              <HelpCircle size={15} style={{ opacity: 0.8 }} /> FAQ
            </Link>

            {/* Quick settings: Mode Éco et Fuseau RDC */}
            <div className="nav-settings-group" style={styles.settingsGroup}>
              <button
                onClick={() => {
                  toggleDataSaver();
                  handleLinkClick();
                }}
                className="nav-setting-btn"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  padding: '4px 10px',
                  borderRadius: '9999px',
                  background: dataSaver ? 'rgba(216, 180, 254, 0.18)' : 'rgba(107, 79, 56, 0.15)',
                  border: dataSaver ? '1px solid rgba(216, 180, 254, 0.5)' : '1px solid var(--border-color)',
                  color: dataSaver ? 'var(--primary)' : 'var(--text-muted)',
                  fontSize: '10.5px',
                  fontWeight: '800',
                  letterSpacing: '0.06em',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  marginLeft: '2px'
                }}
                title={dataSaver ? "Mode Économie RDC activé (images allégées, flux basse conso)" : "Activer le Mode Économie de données (réseau lent RDC)"}
              >
                <Zap size={12} fill={dataSaver ? "var(--primary)" : "none"} />
                <span>{dataSaver ? "ÉCO" : "MODE ÉCO"}</span>
              </button>
              <button
                onClick={toggleTimezone}
                className="nav-setting-btn"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '4px 10px',
                  borderRadius: '9999px',
                  background: 'rgba(107, 79, 56, 0.18)',
                  border: '1px solid rgba(192, 192, 192, 0.22)',
                  color: 'var(--argente)',
                  fontSize: '10.5px',
                  fontWeight: '800',
                  letterSpacing: '0.06em',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  marginLeft: '2px'
                }}
                title="Fuseau RDC (Cliquez pour basculer entre Kinshasa GMT+1 et Lubumbashi GMT+2)"
              >
                <Clock size={12} />
                <span>{currentDetails.shortBadge} ({currentDetails.key === 'KINSHASA' ? 'Kin' : "L'shi"})</span>
              </button>

              {/* Bouton Alertes Flash Web Push */}
              <button
                onClick={handleTogglePush}
                className="nav-setting-btn"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '4px 10px',
                  borderRadius: '9999px',
                  background: pushActive ? 'rgba(216, 180, 254, 0.18)' : 'rgba(255, 255, 255, 0.03)',
                  border: pushActive ? '1px solid rgba(216, 180, 254, 0.5)' : '1px solid var(--border-color)',
                  color: pushActive ? 'var(--primary)' : 'var(--text-muted)',
                  fontSize: '10.5px',
                  fontWeight: '800',
                  letterSpacing: '0.06em',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  marginLeft: '2px'
                }}
                title={pushActive ? "Alertes Flash Info activées sur votre navigateur" : "Activer les notifications push pour recevoir les alertes d'urgence"}
              >
                <Bell size={12} fill={pushActive ? "var(--primary)" : "none"} />
                <span>{pushActive ? "ALERTES ON" : "ALERTES"}</span>
              </button>
            </div>
          </div>

          {/* Authentication & User Spaces Section */}
          {user && user.role !== 'USER' ? (
            <div className="nav-auth-container" style={styles.authSection}>
              <div className="nav-user-menu" style={styles.userMenu}>
                {/* Ligne Profil Utilisateur + Notification Bell intégrée */}
                <div className="nav-user-header" style={styles.userHeader}>
                  <div style={styles.userInfo}>
                    <UserIcon size={14} style={{ color: 'var(--primary)' }} />
                    <span style={styles.username}>{user.username}</span>
                    <span style={styles.roleBadge}>{user.role}</span>
                  </div>
                  <NotificationBell />
                </div>
                
                {/* Unified console dropdown for agents */}
                <div className="console-dropdown-container" style={styles.dropdownContainer} ref={dropdownRef}>
                  <button 
                    onClick={() => setDropdownOpen(!dropdownOpen)} 
                    className="btn btn-secondary console-dropdown-btn" 
                    style={styles.dropdownBtn}
                  >
                    <LayoutDashboard size={14} /> <span className="nav-console-text">Console</span> <ChevronDown size={13} />
                  </button>
                  {dropdownOpen && (
                    <div className="console-dropdown-menu" style={styles.dropdownMenu}>
                      
                      {/* Journalist shortcuts */}
                      {user.role === 'JOURNALIST' && (
                        <>
                          <Link to="/admin/journalist" className="dropdown-item" onClick={handleLinkClick}>
                            Écrire un article
                          </Link>
                          <Link to="/admin/podcasts" className="dropdown-item" onClick={handleLinkClick}>
                            Mes Podcasts
                          </Link>
                        </>
                      )}

                      {/* Supervisor / Direction shortcuts (Fondateurs) */}
                      {user.role === 'SUPERVISOR' && (
                        <>
                          <Link to="/admin" className="dropdown-item" onClick={handleLinkClick}>
                            📊 Cockpit Direction & KPIs
                          </Link>
                          <Link to="/admin/podcasts" className="dropdown-item" onClick={handleLinkClick}>
                            🎙️ Suivi des Podcasts
                          </Link>
                          <Link to="/admin/lives" className="dropdown-item" onClick={handleLinkClick}>
                            📡 Suivi des Directs
                          </Link>
                          <Link to="/admin/ads" className="dropdown-item" onClick={handleLinkClick}>
                            📈 Régie & Publicités
                          </Link>
                        </>
                      )}

                      {/* Editor shortcuts */}
                      {user.role === 'EDITOR' && (
                        <>
                          <Link to="/admin/editor" className="dropdown-item" onClick={handleLinkClick}>
                            Relire & Corriger
                          </Link>
                          <Link to="/admin/comments" className="dropdown-item" onClick={handleLinkClick}>
                            Modération
                          </Link>
                          <Link to="/admin/lives" className="dropdown-item" onClick={handleLinkClick}>
                            Flux Directs
                          </Link>
                        </>
                      )}

                      {/* Admin / Super Admin shortcuts */}
                      {(user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') && (
                        <>
                          <Link to="/admin" className="dropdown-item" onClick={handleLinkClick}>
                            Vue Générale
                          </Link>
                          <Link to="/admin/users" className="dropdown-item" onClick={handleLinkClick}>
                            Utilisateurs & Rôles
                          </Link>
                          <Link to="/admin/ads" className="dropdown-item" onClick={handleLinkClick}>
                            Publicités
                          </Link>
                          <Link to="/admin/comments" className="dropdown-item" onClick={handleLinkClick}>
                            Modération
                          </Link>
                          <Link to="/admin/podcasts" className="dropdown-item" onClick={handleLinkClick}>
                            Podcasts
                          </Link>
                          <Link to="/admin/lives" className="dropdown-item" onClick={handleLinkClick}>
                            Flux Directs
                          </Link>
                          <Link to="/admin/journalist" className="dropdown-item" onClick={handleLinkClick}>
                            Écrire
                          </Link>
                          <Link to="/admin/editor" className="dropdown-item" onClick={handleLinkClick}>
                            Relire
                          </Link>
                        </>
                      )}
                      <div style={{ borderTop: '1px solid var(--border-color)', margin: '4px 0' }} />
                      <button 
                        onClick={handleLogout} 
                        className="dropdown-item" 
                        style={{ color: '#ef4444', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
                      >
                        <LogOut size={14} /> Déconnexion
                      </button>
                    </div>
                  )}
                </div>
                
                <button 
                  onClick={handleLogout} 
                  className="btn btn-secondary logout-action-btn" 
                  style={styles.logoutBtn} 
                  title="Se déconnecter (Déconnexion)"
                >
                  <LogOut size={14} style={{ color: '#ef4444' }} />
                  <span style={styles.logoutText} className="nav-logout-text">Déconnexion</span>
                </button>
              </div>
            </div>
          ) : user && user.role === 'USER' ? (
            /* Profil Lecteur Citoyen connecté (Google / Facebook style Opera News) */
            <div className="nav-auth-container" style={styles.authSection}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 10px', borderRadius: '20px', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(192, 192, 192, 0.2)' }}>
                <div style={{
                  width: '26px',
                  height: '26px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #6B4F38 0%, #D8B4FE 100%)',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: '800',
                  fontSize: '11px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
                }}>
                  {(user.fullName || user.username).slice(0, 2).toUpperCase()}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '11px', fontWeight: '700', color: '#F5F3F0', lineHeight: 1.1 }}>
                    {user.fullName || user.username}
                  </span>
                  <span style={{ fontSize: '9px', color: '#D8B4FE', fontWeight: '600' }}>
                    Lecteur Vérifié
                  </span>
                </div>
                <button 
                  onClick={handleLogout} 
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#ef4444',
                    cursor: 'pointer',
                    padding: '2px 4px',
                    display: 'flex',
                    alignItems: 'center',
                    marginLeft: '4px',
                    opacity: 0.85
                  }}
                  title="Déconnexion lecteur"
                >
                  <LogOut size={13} />
                </button>
              </div>
            </div>
          ) : (
            /* Espace Agent discret pour visiteurs */
            <div className="nav-auth-container" style={styles.authSection}>
              <Link 
                to="/login" 
                style={styles.agentPillBtn}
                title="Accès réservé aux journalistes, éditeurs et à la direction"
                onClick={handleLinkClick}
              >
                <UserIcon size={13} style={{ color: 'var(--primary)' }} />
                <span>ESPACE AGENT</span>
              </Link>
            </div>
          )}

        </div>
      </div>
    </nav>
  );
};

const styles = {
  nav: {
    height: '66px',
    borderBottom: '1px solid var(--border-color)',
    background: 'rgba(15, 13, 12, 0.88)',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    position: 'sticky',
    top: 0,
    zIndex: 1000,
    display: 'flex',
    alignItems: 'center',
    width: '100%',
  },
  container: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    maxWidth: '1280px',
    margin: '0 auto',
    padding: '0 16px',
    boxSizing: 'border-box',
  },
  logoContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    zIndex: 1001,
    flexShrink: 0,
  },
  logoImage: {
    height: '34px',
    width: 'auto',
    objectFit: 'contain',
    borderRadius: 0,
    border: 'none',
    filter: 'drop-shadow(0 2px 10px rgba(245, 158, 11, 0.3))',
  },
  logoText: {
    fontSize: '18px',
    fontWeight: '800',
    letterSpacing: '0.12em',
    fontFamily: 'var(--font-luxury), Playfair Display, serif',
    textTransform: 'uppercase',
  },
  mobileToggle: {
    display: 'none',
    background: 'none',
    border: 'none',
    color: 'var(--text-main)',
    cursor: 'pointer',
    padding: '8px',
    zIndex: 1001,
  },
  menuWrapper: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flex: 1,
    marginLeft: '14px',
    minWidth: 0,
  },
  navLinks: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flexShrink: 1,
  },
  settingsGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    flexShrink: 0,
  },
  navLink: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '11.5px',
    fontWeight: '700',
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    color: 'var(--argente)',
    whiteSpace: 'nowrap',
    padding: '6px 8px',
    transition: 'all 0.2s ease',
  },
  authSection: {
    display: 'flex',
    alignItems: 'center',
    flexShrink: 0,
    marginLeft: '8px',
  },
  userMenu: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    flexShrink: 0,
  },
  userHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    flexShrink: 0,
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    background: 'rgba(107, 79, 56, 0.2)',
    padding: '4px 10px',
    borderRadius: '9999px',
    border: '1px solid rgba(192, 192, 192, 0.22)',
    flexShrink: 0,
  },
  username: {
    fontSize: '12px',
    fontWeight: '700',
    maxWidth: '90px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    color: '#F5F3F0',
  },
  roleBadge: {
    fontSize: '9px',
    fontWeight: '800',
    backgroundColor: 'var(--primary)',
    color: '#171311',
    padding: '2px 6px',
    borderRadius: '8px',
    textTransform: 'uppercase',
  },
  dropdownContainer: {
    position: 'relative',
    display: 'inline-block',
    flexShrink: 0,
  },
  dropdownBtn: {
    padding: '4px 12px',
    fontSize: '11px',
    height: '30px',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    borderRadius: '9999px',
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
  },
  dropdownMenu: {
    position: 'absolute',
    top: '38px',
    right: 0,
    background: 'linear-gradient(180deg, rgba(34, 26, 22, 0.98) 0%, rgba(20, 15, 13, 0.98) 100%)',
    border: '1px solid rgba(192, 192, 192, 0.2)',
    borderRadius: '12px',
    boxShadow: '0 14px 35px rgba(0,0,0,0.6), 0 0 20px rgba(216, 180, 254, 0.12)',
    padding: '8px 0',
    minWidth: '220px',
    zIndex: 1002,
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  logoutBtn: {
    padding: '4px 10px',
    height: '30px',
    borderRadius: '9999px',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '5px',
    background: 'rgba(239, 68, 68, 0.12)',
    border: '1px solid rgba(239, 68, 68, 0.35)',
    color: '#ef4444',
    cursor: 'pointer',
    fontSize: '11px',
    fontWeight: '700',
    letterSpacing: '0.04em',
    textTransform: 'uppercase',
    transition: 'all 0.2s ease',
    flexShrink: 0,
  },
  logoutText: {
    color: '#ef4444',
    fontSize: '11px',
    fontWeight: '700',
  },
  agentPillBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 14px',
    borderRadius: '9999px',
    background: 'rgba(107, 79, 56, 0.22)',
    border: '1px solid rgba(192, 192, 192, 0.28)',
    color: '#F5F3F0',
    fontSize: '11px',
    fontWeight: '800',
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    textDecoration: 'none',
    transition: 'all 0.25s ease',
  },
  guestMenu: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flexShrink: 0,
  },
  guestAuthBtns: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  visitorBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '5px',
    background: 'rgba(107, 79, 56, 0.12)',
    border: '1px solid rgba(192, 192, 192, 0.22)',
    color: 'var(--argente)',
    padding: '4px 9px',
    borderRadius: '9999px',
    fontSize: '11px',
    fontWeight: '700',
    letterSpacing: '0.3px',
    textTransform: 'uppercase',
    userSelect: 'none',
  }
};

export default Navbar;
