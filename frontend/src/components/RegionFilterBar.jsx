import React, { useRef } from 'react';
import { useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const REGIONS = [
  { id: 'ALL', labelKey: 'regionAll', defaultLabel: 'À la une', color: '#D8B4FE' },
  { id: 'RDC', labelKey: 'regionRdc', defaultLabel: 'RDC & Kinshasa', color: '#38bdf8' },
  { id: 'AFRIQUE', labelKey: 'regionAfrica', defaultLabel: 'Afrique', color: '#f59e0b' },
  { id: 'MONDE', labelKey: 'regionWorld', defaultLabel: 'Monde', color: '#10b981' },
  { id: 'EUROPE', labelKey: 'regionEurope', defaultLabel: 'Europe', color: '#60a5fa' },
  { id: 'AMERIQUE', labelKey: 'regionAmericas', defaultLabel: 'Amérique', color: '#f43f5e' },
  { id: 'ASIE', labelKey: 'regionAsia', defaultLabel: 'Asie', color: '#ec4899' },
  { id: 'MOYEN_ORIENT', labelKey: 'regionMiddleEast', defaultLabel: 'Moyen-Orient', color: '#fb923c' },
  { id: 'ECONOMIE', labelKey: 'regionEconomy', defaultLabel: 'Économie', color: '#34d399' },
  { id: 'SPORT', labelKey: 'regionSports', defaultLabel: 'Sports', color: '#a78bfa' },
  { id: 'CULTURE', labelKey: 'regionCulture', defaultLabel: 'Culture & Société', color: '#fbbf24' },
];

const RegionFilterBar = () => {
  const { t } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const scrollRef = useRef(null);

  // Masquer sur les pages d'administration, d'authentification et de réglages
  if (
    location.pathname.startsWith('/admin') ||
    location.pathname.startsWith('/login') ||
    location.pathname.startsWith('/register') ||
    location.pathname === '/log' ||
    location.pathname === '/staff' ||
    location.pathname === '/settings' ||
    location.pathname === '/parametres' ||
    location.pathname === '/reglages'
  ) {
    return null;
  }

  const currentTopic = searchParams.get('topic') || 'ALL';

  const handleSelect = (id) => {
    if (location.pathname !== '/') {
      navigate(id === 'ALL' ? '/' : `/?topic=${id}`);
    } else {
      const newParams = new URLSearchParams(searchParams);
      if (id === 'ALL') {
        newParams.delete('topic');
      } else {
        newParams.set('topic', id);
      }
      setSearchParams(newParams);
      
      // Petit scroll fluide vers les articles
      const feedElem = document.getElementById('articles-feed') || document.querySelector('.articles-grid');
      if (feedElem) {
        feedElem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  };

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -220 : 220;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <div style={styles.outerContainer} className="region-filter-bar-wrapper">
      <div className="container" style={styles.barContainer}>
        {/* Bouton défilement gauche sur desktop */}
        <button 
          onClick={() => scroll('left')} 
          style={styles.arrowBtn}
          aria-label="Défiler vers la gauche"
          className="region-arrow-btn"
        >
          <ChevronLeft size={16} />
        </button>

        {/* Liste défilante des régions style France 24 */}
        <div ref={scrollRef} style={styles.scrollList} className="region-scroll-list">
          {REGIONS.map((reg) => {
            const isActive = currentTopic === reg.id;
            const label = t(reg.labelKey) || reg.defaultLabel;

            return (
              <button
                key={reg.id}
                onClick={() => handleSelect(reg.id)}
                style={{
                  ...styles.tabBtn,
                  ...(isActive ? styles.tabBtnActive : {})
                }}
                className={`region-tab-item ${isActive ? 'active' : ''}`}
                title={label}
              >
                {/* Carré coloré emblématique style France 24 */}
                <span 
                  style={{
                    ...styles.squareIndicator,
                    backgroundColor: reg.color,
                    boxShadow: isActive ? `0 0 8px ${reg.color}` : 'none'
                  }} 
                />
                <span style={{
                  ...styles.tabText,
                  fontWeight: isActive ? '800' : '700',
                  color: isActive ? '#ffffff' : 'var(--text-secondary)'
                }}>
                  {label.toUpperCase()}
                </span>
                {isActive && <span style={styles.activeLine} />}
              </button>
            );
          })}
        </div>

        {/* Bouton défilement droite sur desktop */}
        <button 
          onClick={() => scroll('right')} 
          style={styles.arrowBtn}
          aria-label="Défiler vers la droite"
          className="region-arrow-btn"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};

const styles = {
  outerContainer: {
    width: '100%',
    backgroundColor: 'var(--navbar-bg, rgba(18, 14, 12, 0.95))',
    borderBottom: '1px solid var(--border-color, rgba(192, 192, 192, 0.16))',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    position: 'sticky',
    top: '66px',
    zIndex: 999,
  },
  barContainer: {
    display: 'flex',
    alignItems: 'center',
    position: 'relative',
    padding: '0 8px',
    boxSizing: 'border-box',
    maxWidth: '1440px',
    margin: '0 auto',
  },
  scrollList: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    overflowX: 'auto',
    scrollBehavior: 'smooth',
    whiteSpace: 'nowrap',
    padding: '6px 4px',
    scrollbarWidth: 'none',
    msOverflowStyle: 'none',
    flex: 1,
  },
  tabBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 12px',
    background: 'transparent',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    position: 'relative',
    transition: 'all 0.2s ease',
    flexShrink: 0,
  },
  tabBtnActive: {
    background: 'rgba(255, 255, 255, 0.05)',
  },
  squareIndicator: {
    width: '7px',
    height: '7px',
    borderRadius: '1.5px',
    flexShrink: 0,
    transition: 'transform 0.2s ease',
  },
  tabText: {
    fontSize: '11px',
    letterSpacing: '0.08em',
    transition: 'color 0.2s ease',
  },
  activeLine: {
    position: 'absolute',
    bottom: '-6px',
    left: '10px',
    right: '10px',
    height: '2px',
    backgroundColor: 'var(--primary, #D8B4FE)',
    borderRadius: '2px',
    boxShadow: '0 0 8px var(--primary, #D8B4FE)',
  },
  arrowBtn: {
    background: 'rgba(255, 255, 255, 0.04)',
    border: '1px solid var(--border-color, rgba(192, 192, 192, 0.16))',
    color: 'var(--text-main)',
    width: '26px',
    height: '26px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    flexShrink: 0,
    margin: '0 2px',
    transition: 'all 0.2s ease',
  }
};

export default RegionFilterBar;
