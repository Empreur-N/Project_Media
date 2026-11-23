import React from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Home, Tv, Flame, PlayCircle, Menu } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const MobileBottomNav = () => {
  const { t } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();

  // Masquer sur les pages d'administration et d'authentification pour laisser place aux claviers & éditeurs
  if (
    location.pathname.startsWith('/admin') ||
    location.pathname.startsWith('/login') ||
    location.pathname.startsWith('/register') ||
    location.pathname === '/log' ||
    location.pathname === '/staff'
  ) {
    return null;
  }

  const handleEnContinuClick = (e) => {
    e.preventDefault();
    if (location.pathname === '/') {
      const feedElem = document.getElementById('articles-feed') || document.querySelector('.articles-grid') || document.querySelector('.home-layout');
      if (feedElem) {
        feedElem.scrollIntoView({ behavior: 'smooth' });
      } else {
        window.scrollTo({ top: 350, behavior: 'smooth' });
      }
    } else {
      navigate('/?scroll=feed');
    }
  };

  const handleMenuClick = () => {
    window.dispatchEvent(new CustomEvent('lc:toggle-mobile-menu'));
  };

  return (
    <nav className="mobile-bottom-nav" style={styles.container} aria-label="Navigation mobile">
      {/* 1. À la une (Accueil) */}
      <NavLink 
        to="/" 
        end
        style={({ isActive }) => ({
          ...styles.tabItem,
          color: isActive ? 'var(--primary)' : 'var(--text-muted)'
        })}
      >
        {({ isActive }) => (
          <>
            <div style={styles.iconWrapper}>
              <Home size={20} strokeWidth={isActive ? 2.5 : 1.8} />
              {isActive && <div style={styles.activeDot} />}
            </div>
            <span style={{ ...styles.tabLabel, fontWeight: isActive ? '800' : '600' }}>
              {t('bottomNavTopStories')}
            </span>
          </>
        )}
      </NavLink>

      {/* 2. Direct TV & Radio */}
      <NavLink 
        to="/live" 
        style={({ isActive }) => ({
          ...styles.tabItem,
          color: isActive ? 'var(--primary)' : 'var(--text-muted)'
        })}
      >
        {({ isActive }) => (
          <>
            <div style={styles.iconWrapper}>
              <Tv size={20} strokeWidth={isActive ? 2.5 : 1.8} />
              {/* Point rouge clignotant Direct */}
              <span style={styles.livePulseDot} />
            </div>
            <span style={{ ...styles.tabLabel, fontWeight: isActive ? '800' : '600' }}>
              {t('bottomNavLive')}
            </span>
          </>
        )}
      </NavLink>

      {/* 3. En continu (Fil d'actualité en direct) */}
      <button 
        onClick={handleEnContinuClick}
        style={{
          ...styles.tabItem,
          background: 'none',
          border: 'none',
          color: 'var(--text-muted)'
        }}
        title={t('bottomNavFeed')}
      >
        <div style={styles.iconWrapper}>
          <Flame size={20} strokeWidth={1.8} style={{ color: '#f59e0b' }} />
        </div>
        <span style={styles.tabLabel}>
          {t('bottomNavFeed')}
        </span>
      </button>

      {/* 4. Replays & Podcasts */}
      <NavLink 
        to="/podcasts" 
        style={({ isActive }) => ({
          ...styles.tabItem,
          color: isActive ? 'var(--primary)' : 'var(--text-muted)'
        })}
      >
        {({ isActive }) => (
          <>
            <div style={styles.iconWrapper}>
              <PlayCircle size={20} strokeWidth={isActive ? 2.5 : 1.8} />
              {isActive && <div style={styles.activeDot} />}
            </div>
            <span style={{ ...styles.tabLabel, fontWeight: isActive ? '800' : '600' }}>
              {t('bottomNavReplays')}
            </span>
          </>
        )}
      </NavLink>

      {/* 5. Menu / Tiroir & Paramètres */}
      <button 
        onClick={handleMenuClick}
        style={{
          ...styles.tabItem,
          background: 'none',
          border: 'none',
          color: 'var(--text-muted)'
        }}
        title={t('bottomNavMenu')}
        aria-label={t('bottomNavMenu')}
      >
        <div style={styles.iconWrapper}>
          <Menu size={20} strokeWidth={1.8} />
        </div>
        <span style={styles.tabLabel}>
          {t('bottomNavMenu')}
        </span>
      </button>
    </nav>
  );
};

const styles = {
  container: {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    height: '60px',
    backgroundColor: 'var(--navbar-bg, rgba(15, 13, 12, 0.96))',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    borderTop: '1px solid var(--border-color, rgba(192, 192, 192, 0.16))',
    boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.5)',
    zIndex: 99999,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-around',
    padding: '0 8px',
    paddingBottom: 'env(safe-area-inset-bottom, 0px)',
    boxSizing: 'border-box',
  },
  tabItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    height: '100%',
    textDecoration: 'none',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    padding: '4px 0',
  },
  iconWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '24px',
  },
  tabLabel: {
    fontSize: '10px',
    letterSpacing: '0.02em',
    marginTop: '2px',
    whiteSpace: 'nowrap',
    transition: 'color 0.2s ease',
  },
  activeDot: {
    position: 'absolute',
    top: '-3px',
    right: '-4px',
    width: '5px',
    height: '5px',
    borderRadius: '50%',
    backgroundColor: 'var(--primary)',
    boxShadow: '0 0 6px var(--primary)',
  },
  livePulseDot: {
    position: 'absolute',
    top: '-2px',
    right: '-5px',
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    backgroundColor: '#ef4444',
    boxShadow: '0 0 8px #ef4444',
    animation: 'pulse 1.4s infinite',
  }
};

export default MobileBottomNav;
