import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useAudioPlayer } from '../contexts/AudioPlayerContext';
import { useDataSaver } from '../contexts/DataSaverContext';
import { useTimezone } from '../contexts/TimezoneContext';
import { LogOut, LayoutDashboard, User as UserIcon, Radio, Newspaper, Search, Menu, X, ChevronDown, HelpCircle, Zap, Clock } from 'lucide-react';
import NotificationBell from './NotificationBell';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { playRadio, isRadioLive, isPlaying } = useAudioPlayer();
  const { dataSaver, toggleDataSaver } = useDataSaver();
  const { toggleTimezone, currentDetails } = useTimezone();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

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
              <Newspaper size={18} /> Actualités
            </Link>
            <Link to="/search" style={styles.navLink} onClick={handleLinkClick}>
              <Search size={18} /> Recherche
            </Link>
            <Link to="/podcasts" style={styles.navLink} onClick={handleLinkClick}>
              <Radio size={18} /> Podcasts
            </Link>
            <Link to="/live" style={styles.navLink} onClick={handleLinkClick}>
              <Radio size={18} /> Direct
            </Link>
            <button 
              onClick={() => {
                playRadio();
                handleLinkClick();
              }}
              className="nav-radio-btn"
              style={{
                ...styles.navLink,
                background: isRadioLive && isPlaying ? 'rgba(239, 68, 68, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                border: isRadioLive && isPlaying ? '1px solid rgba(239, 68, 68, 0.4)' : '1px solid var(--border-color)',
                borderRadius: '20px',
                padding: '4px 10px',
                cursor: 'pointer',
                color: isRadioLive && isPlaying ? '#ef4444' : 'var(--text-secondary)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                fontSize: '13px'
              }}
              title="Écouter la radio 24h/24 en direct"
            >
              <Radio size={15} /> 
              <span>Radio 24/7</span>
              {isRadioLive && isPlaying && (
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#ef4444', animation: 'pulse 1.2s infinite' }} />
              )}
            </button>
            <Link to="/faq" style={styles.navLink} onClick={handleLinkClick}>
              <HelpCircle size={16} /> FAQ
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
                  borderRadius: '20px',
                  background: dataSaver ? 'rgba(34, 197, 94, 0.18)' : 'rgba(255, 255, 255, 0.04)',
                  border: dataSaver ? '1px solid rgba(34, 197, 94, 0.5)' : '1px solid var(--border-color)',
                  color: dataSaver ? '#22c55e' : 'var(--text-muted)',
                  fontSize: '11px',
                  fontWeight: '800',
                  letterSpacing: '0.5px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  marginLeft: '2px'
                }}
                title={dataSaver ? "Mode Économie RDC activé (images allégées, flux basse conso)" : "Activer le Mode Économie de données (réseau lent RDC)"}
              >
                <Zap size={13} fill={dataSaver ? "#22c55e" : "none"} />
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
                  borderRadius: '20px',
                  background: 'rgba(217, 119, 6, 0.12)',
                  border: '1px solid rgba(217, 119, 6, 0.4)',
                  color: '#f59e0b',
                  fontSize: '11px',
                  fontWeight: '800',
                  letterSpacing: '0.5px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  marginLeft: '2px'
                }}
                title="Fuseau RDC (Cliquez pour basculer entre Kinshasa GMT+1 et Lubumbashi GMT+2)"
              >
                <Clock size={13} />
                <span>{currentDetails.shortBadge} ({currentDetails.key === 'KINSHASA' ? 'Kin' : "L'shi"})</span>
              </button>
            </div>
          </div>

          {/* Authentication & User Spaces Section (Exclusif aux agents connectés - Modèle Africanews) */}
          {user && user.role !== 'USER' && (
            <div className="nav-auth-container" style={styles.authSection}>
              <div className="nav-user-menu" style={styles.userMenu}>
                {/* Ligne Profil Utilisateur + Notification Bell intégrée */}
                <div className="nav-user-header" style={styles.userHeader}>
                  <div style={styles.userInfo}>
                    <UserIcon size={15} style={{ color: 'var(--primary)' }} />
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
                  <LogOut size={15} style={{ color: '#ef4444' }} />
                  <span style={styles.logoutText} className="nav-logout-text">Déconnexion</span>
                </button>
              </div>
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
    background: 'rgba(6, 9, 19, 0.85)',
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
    fontSize: '17px',
    fontWeight: '800',
    letterSpacing: '0.5px',
    fontFamily: 'var(--font-sans)',
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
    gap: '5px',
    fontSize: '13px',
    fontWeight: '500',
    color: 'var(--text-secondary)',
    whiteSpace: 'nowrap',
    padding: '4px 6px',
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
    gap: '5px',
    background: 'rgba(255,255,255,0.03)',
    padding: '3px 8px',
    borderRadius: '30px',
    border: '1px solid var(--border-color)',
    flexShrink: 0,
  },
  username: {
    fontSize: '12px',
    fontWeight: '600',
    maxWidth: '90px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  roleBadge: {
    fontSize: '9px',
    fontWeight: '700',
    backgroundColor: 'var(--primary)',
    color: 'white',
    padding: '2px 5px',
    borderRadius: '8px',
    textTransform: 'uppercase',
  },
  dropdownContainer: {
    position: 'relative',
    display: 'inline-block',
    flexShrink: 0,
  },
  dropdownBtn: {
    padding: '4px 10px',
    fontSize: '12px',
    height: '30px',
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    borderRadius: '20px',
  },
  dropdownMenu: {
    position: 'absolute',
    top: '36px',
    right: 0,
    backgroundColor: '#0a0f1d',
    border: '1px solid var(--border-color)',
    borderRadius: '8px',
    boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
    padding: '8px 0',
    minWidth: '200px',
    zIndex: 1002,
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  logoutBtn: {
    padding: '4px 10px',
    height: '30px',
    borderRadius: '20px',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '5px',
    background: 'rgba(239, 68, 68, 0.12)',
    border: '1px solid rgba(239, 68, 68, 0.35)',
    color: '#ef4444',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: '700',
    transition: 'all 0.2s ease',
    flexShrink: 0,
  },
  logoutText: {
    color: '#ef4444',
    fontSize: '12px',
    fontWeight: '700',
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
    background: 'rgba(245, 158, 11, 0.08)',
    border: '1px solid rgba(245, 158, 11, 0.28)',
    color: 'var(--secondary)',
    padding: '4px 9px',
    borderRadius: '20px',
    fontSize: '11px',
    fontWeight: '700',
    letterSpacing: '0.3px',
    textTransform: 'uppercase',
    userSelect: 'none',
  }
};

export default Navbar;
