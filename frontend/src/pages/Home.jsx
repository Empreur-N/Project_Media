import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getArticles, getPopularArticles } from '../services/api';
import { IMPORTED_ARTICLES } from '../data/importedArticles';
import AdPlacement from '../components/AdPlacement';
import { Calendar, Tag, MapPin, Eye, ArrowRight, BookOpen, TrendingUp, Search } from 'lucide-react';
import { useTimezone } from '../contexts/TimezoneContext';
import { formatRdcDateTime } from '../utils/timeUtils';
import { getFullImageUrl, handleImageError } from '../utils/imageUtils';

// --- Composant Ticker (Fil d'Info continu) ---
const Ticker = ({ items }) => {
  if (!items || items.length === 0) return null;
  return (
    <div style={styles.tickerContainer}>
      <div style={styles.tickerBadge}>FLASH INFO</div>
      <div style={styles.tickerTextWrapper}>
        <div style={styles.tickerText} className="marquee">
          {items.slice(0, 5).map((art, idx) => (
            <span key={art.id} style={styles.tickerItem}>
              <span style={styles.tickerTime}>
                {new Date(art.publicationDate || art.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
              </span>
              <Link to={`/articles/${art.id}`} style={styles.tickerLink}>
                {art.title}
              </Link>
              {idx < Math.min(items.length, 5) - 1 && <span style={styles.tickerSeparator}>•</span>}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

// --- Composant Météo des Régions ---
const WeatherWidget = () => {
  const weatherData = {
    "Kinshasa": { temp: "30°C", condition: "Orageux", humidity: "75%", wind: "14 km/h", icon: "⛈️" },
    "Lubumbashi": { temp: "26°C", condition: "Ensoleillé", humidity: "40%", wind: "8 km/h", icon: "☀️" },
    "Goma": { temp: "21°C", condition: "Pluvieux", humidity: "85%", wind: "12 km/h", icon: "🌧️" },
    "Kisangani": { temp: "29°C", condition: "Nuageux", humidity: "80%", wind: "10 km/h", icon: "☁️" }
  };
  const [city, setCity] = useState("Kinshasa");
  const current = weatherData[city];

  return (
    <div className="glass-card" style={styles.weatherCard}>
      <div style={styles.weatherHeader}>
        <span style={styles.widgetTitle}>Météo RDC</span>
        <select 
          value={city} 
          onChange={(e) => setCity(e.target.value)}
          style={styles.weatherSelect}
        >
          {Object.keys(weatherData).map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>
      <div style={styles.weatherBody}>
        <span style={styles.weatherIcon}>{current.icon}</span>
        <div style={styles.weatherInfo}>
          <span style={styles.weatherTemp}>{current.temp}</span>
          <span style={styles.weatherCondition}>{current.condition}</span>
        </div>
      </div>
      <div style={styles.weatherDetails}>
        <span style={styles.weatherDetailItem}>Hum: {current.humidity}</span>
        <span style={styles.weatherDetailItem}>Vent: {current.wind}</span>
      </div>
    </div>
  );
};

const Home = () => {
  const { timezone } = useTimezone();
  const [articles, setArticles] = useState([]);
  const [popularArticles, setPopularArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('');
  const [region, setRegion] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = ["Politique", "Économie", "Société", "Sport", "Culture", "Technologie", "Santé", "Environnement"];
  const regions = ["Kinshasa", "Haut-Katanga", "Lualaba", "Nord-Kivu", "Sud-Kivu", "Kongo-Central"];

  const filteredArticles = articles.filter(art => 
    art.title?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    art.summary?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getFallbackArticles = (cat, reg) => {
    let list = IMPORTED_ARTICLES;
    if (cat) list = list.filter(a => a.category?.toLowerCase() === cat.toLowerCase());
    if (reg) list = list.filter(a => a.region?.toLowerCase() === reg.toLowerCase());
    return list;
  };

  useEffect(() => {
    const fetchArticles = async () => {
      setLoading(true);
      try {
        const data = await getArticles(
          category || null,
          region || null,
          'PUBLISHED'
        );
        if (data && Array.isArray(data) && data.length > 0) {
          setArticles(data);
        } else {
          setArticles(getFallbackArticles(category, region));
        }
      } catch (error) {
        console.error("Erreur de récupération des articles:", error);
        setArticles(getFallbackArticles(category, region));
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, [category, region]);

  useEffect(() => {
    const fetchPopular = async () => {
      try {
        const data = await getPopularArticles();
        if (data && Array.isArray(data) && data.length > 0) {
          setPopularArticles(data);
        } else {
          const fallbackPop = IMPORTED_ARTICLES.slice(0, 4).map((art, idx) => ({
            articleId: art.id,
            id: art.id,
            title: art.title,
            viewCount: (4 - idx) * 1420 + 350
          }));
          setPopularArticles(fallbackPop);
        }
      } catch (error) {
        console.error("Erreur récupération articles populaires:", error);
        const fallbackPop = IMPORTED_ARTICLES.slice(0, 4).map((art, idx) => ({
          articleId: art.id,
          id: art.id,
          title: art.title,
          viewCount: (4 - idx) * 1420 + 350
        }));
        setPopularArticles(fallbackPop);
      }
    };
    fetchPopular();
  }, []);

  const formatDate = (dateString) => {
    return formatRdcDateTime(dateString, timezone);
  };

  return (
    <div className="animate-fade-in" style={styles.page}>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes marquee {
          0% { transform: translate3d(0, 0, 0); }
          100% { transform: translate3d(-100%, 0, 0); }
        }
        .marquee {
          animation: marquee 30s linear infinite;
        }
        .marquee:hover {
          animation-play-state: paused;
        }
      `}} />
      {/* Hero Header - Compact & Élégant */}
      <div style={styles.hero}>
        <div className="container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
          <img 
            src="/logo.png" 
            alt="Life Channel Logo" 
            style={styles.heroLogo} 
            onError={(e) => handleImageError(e, null, '/logo.png')}
          />
          <span style={styles.badge}>PORTAIL D'INFORMATION • RDC • ACCÈS LIBRE EN LECTURE SEULE</span>
          <h1 style={styles.heroTitle}>LIFE <span style={{ color: 'var(--secondary)' }}>CHANNEL</span></h1>
          <p style={styles.heroSubtitle}>
            make every life count • L'actualité en continu, podcasts et direct 24h/24 en libre consultation sans inscription
          </p>
        </div>
      </div>

      {/* Ticker Défilant (Fil d'Info continu) - Heuristique #1 Visibilité de l'état */}
      <Ticker items={articles} />

      {/* Feed Title and Subtitle - UB Medias Style */}
      <div className="container" style={styles.feedHeaderContainer}>
        <h2 style={styles.feedHeading}>Toutes les actualités</h2>
        <p style={styles.feedSubheading}>Découvrez l'ensemble des articles publiés par nos rédactions</p>
      </div>

      {/* Modern Filter & Search Bar - UB Medias Style */}
      <div className="container" style={styles.searchFilterWrapper}>
        {/* Search Bar Input */}
        <div style={styles.searchBarContainer}>
          <Search size={18} style={styles.searchIcon} />
          <input 
            type="text" 
            placeholder="Rechercher un article..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={styles.searchInput}
          />
        </div>

        {/* Pills & Region Row */}
        <div style={styles.pillsRow}>
          <div className="category-pills-scroll" style={styles.pillsScroll}>
            <button 
              onClick={() => setCategory('')} 
              style={{
                ...styles.pillBtn,
                ...(category === '' ? styles.activePillBtn : {})
              }}
            >
              Tout
            </button>
            {categories.map((c) => (
              <button 
                key={c}
                onClick={() => setCategory(c)} 
                style={{
                  ...styles.pillBtn,
                  ...(category === c ? styles.activePillBtn : {})
                }}
              >
                {c}
              </button>
            ))}
          </div>

          {/* Region Dropdown Filter */}
          <div style={styles.regionSelectorContainer}>
            <select 
              value={region} 
              onChange={(e) => setRegion(e.target.value)}
              style={styles.regionSelect}
            >
              <option value="">Régions</option>
              {regions.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Articles Feed */}
      <div className="container" style={{ marginTop: '20px' }}>
        <AdPlacement placement="HEADER" style={{ marginBottom: '30px' }} />

        <div className="home-layout" style={styles.mainLayout}>
          <div className="feed-column" style={styles.feedColumn}>
            {loading ? (
              <div className="articles-grid" style={styles.articlesGrid}>
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="skeleton-card">
                    <div className="skeleton-image skeleton-pulse" />
                    <div className="skeleton-body">
                      <div className="skeleton-meta skeleton-pulse" />
                      <div className="skeleton-title skeleton-pulse" />
                      <div className="skeleton-text skeleton-pulse" />
                      <div className="skeleton-text short skeleton-pulse" />
                      <div className="skeleton-footer">
                        <div className="skeleton-meta skeleton-pulse" style={{ width: '80px', margin: 0 }} />
                        <div className="skeleton-btn skeleton-pulse" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredArticles.length === 0 ? (
              <div className="glass-card" style={styles.emptyState}>
                <BookOpen size={48} style={{ color: 'var(--text-muted)', marginBottom: '16px' }} />
                <h3>Aucun article disponible</h3>
                <p style={{ color: 'var(--text-muted)' }}>
                  Aucun article publié ne correspond aux filtres sélectionnés pour le moment.
                </p>
              </div>
            ) : (
              <div className="articles-grid" style={styles.articlesGrid}>
                {filteredArticles.map((article) => (
                  <article key={article.id} className="glass-card article-card" style={styles.card}>
                    <div className="article-card-image-wrapper" style={styles.cardImageContainer}>
                      <img 
                        src={getFullImageUrl(article.mainImageUrl, article.category)} 
                        alt={article.title} 
                        className="img-cover-adaptive"
                        style={styles.cardImage} 
                        loading="lazy"
                        onError={(e) => handleImageError(e, article.category)}
                      />
                      <span style={styles.cardCategory}>{article.category}</span>
                    </div>
                    
                    <div className="article-card-body" style={styles.cardBody}>
                      <div style={styles.cardMeta}>
                        <span style={styles.metaItem}>
                          <Calendar size={13} /> {formatDate(article.publicationDate || article.createdAt)}
                        </span>
                        {article.region && (
                          <span style={styles.metaItem}>
                            <MapPin size={13} /> {article.region}
                          </span>
                        )}
                      </div>
                      
                      <h3 className="article-card-title" style={styles.cardTitle}>{article.title}</h3>
                      <p className="article-card-summary" style={styles.cardSummary}>{article.summary}</p>
                      
                      <div className="article-card-footer" style={styles.cardFooter}>
                        <span style={styles.author}>Par {article.authorUsername}</span>
                        <Link to={`/articles/${article.id}`} className="btn btn-secondary" style={styles.readBtn}>
                          Lire <ArrowRight size={14} />
                        </Link>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="sidebar-column" style={styles.sidebarColumn}>
            {/* Widget Tendances */}
            <div className="glass-card" style={styles.sidebarWidget}>
              <h3 style={styles.widgetTitle}>
                <TrendingUp size={15} /> Tendances
              </h3>
              {popularArticles.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', fontSize: '13px', fontStyle: 'italic' }}>
                  Aucune statistique disponible
                </p>
              ) : (
                <div style={styles.popularList}>
                  {popularArticles.map((pop, index) => (
                    <Link key={pop.articleId} to={`/articles/${pop.articleId}`} style={styles.popularItem}>
                      <span style={styles.popularRank}>0{index + 1}</span>
                      <div style={styles.popularInfo}>
                        <span style={styles.popularTitle}>{pop.title}</span>
                        <span style={styles.popularCount}>{pop.viewCount} lectures</span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Widget Météo Régionale RDC - Heuristique #2 Correspondance réel */}
            <WeatherWidget />

            {/* Pub Sidebar */}
            <AdPlacement placement="SIDEBAR" />
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  page: {
    paddingBottom: '80px',
  },
  hero: {
    background: 'linear-gradient(180deg, rgba(0, 124, 255, 0.08) 0%, rgba(6, 9, 19, 0) 100%)',
    padding: '24px 0 16px',
    textAlign: 'center',
    borderBottom: '1px solid var(--border-color)',
  },
  heroLogo: {
    height: '80px',
    width: 'auto',
    maxWidth: '240px',
    objectFit: 'contain',
    marginBottom: '12px',
    filter: 'drop-shadow(0 4px 20px rgba(245, 158, 11, 0.4))',
  },
  badge: {
    fontSize: '10px',
    fontWeight: '700',
    letterSpacing: '1.5px',
    color: 'var(--secondary)',
    background: 'rgba(245, 158, 11, 0.12)',
    padding: '4px 14px',
    borderRadius: '30px',
    border: '1px solid rgba(245, 158, 11, 0.25)',
  },
  heroTitle: {
    fontSize: '32px',
    fontWeight: '900',
    marginTop: '10px',
    marginBottom: '4px',
    letterSpacing: '1.5px',
  },
  heroSubtitle: {
    color: 'var(--text-secondary)',
    fontSize: '13px',
    maxWidth: '550px',
    margin: '0 auto',
  },
  feedHeaderContainer: {
    marginTop: '20px',
    marginBottom: '12px',
    textAlign: 'left',
  },
  feedHeading: {
    fontSize: '24px',
    fontWeight: '800',
    letterSpacing: '-0.3px',
    margin: '0 0 4px',
    color: 'var(--text-main)',
    fontFamily: 'var(--font-sans)',
  },
  feedSubheading: {
    fontSize: '13px',
    color: 'var(--text-muted)',
    margin: 0,
  },
  searchFilterWrapper: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    marginBottom: '20px',
  },
  searchBarContainer: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    width: '100%',
  },
  searchIcon: {
    position: 'absolute',
    left: '16px',
    color: 'var(--text-muted)',
    pointerEvents: 'none',
  },
  searchInput: {
    width: '100%',
    padding: '10px 18px 10px 44px',
    borderRadius: '30px',
    background: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid var(--border-color)',
    color: 'var(--text-main)',
    fontSize: '14px',
    outline: 'none',
    transition: 'all 0.2s ease',
  },
  pillsRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '20px',
    width: '100%',
  },
  pillsScroll: {
    display: 'flex',
    gap: '10px',
    overflowX: 'auto',
    flex: 1,
    paddingRight: '10px',
  },
  pillBtn: {
    padding: '8px 18px',
    borderRadius: '30px',
    border: '1px solid var(--border-color)',
    background: 'rgba(255, 255, 255, 0.02)',
    color: 'var(--text-secondary)',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '13px',
    whiteSpace: 'nowrap',
    transition: 'all 0.2s ease',
    outline: 'none',
  },
  activePillBtn: {
    background: 'var(--primary)',
    borderColor: 'var(--primary)',
    color: '#fff',
    boxShadow: '0 0 15px rgba(0, 124, 255, 0.3)',
  },
  regionSelectorContainer: {
    position: 'relative',
    flexShrink: 0,
  },
  regionSelect: {
    padding: '8px 20px',
    borderRadius: '30px',
    background: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid var(--border-color)',
    color: 'var(--text-secondary)',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '13px',
    outline: 'none',
    transition: 'all 0.2s ease',
  },
  articlesGrid: {
    width: '100%',
  },
  card: {
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    height: '100%',
  },
  cardImageContainer: {
    position: 'relative',
    height: '210px',
    width: '100%',
    overflow: 'hidden',
    backgroundColor: 'rgba(13, 20, 38, 0.8)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    objectPosition: 'center',
    transition: 'transform 0.5s ease',
  },
  cardCategory: {
    position: 'absolute',
    top: '16px',
    left: '16px',
    background: 'var(--primary)',
    color: 'white',
    padding: '4px 10px',
    borderRadius: '4px',
    fontSize: '11px',
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  cardBody: {
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
  },
  cardMeta: {
    display: 'flex',
    gap: '16px',
    fontSize: '12px',
    color: 'var(--text-muted)',
    marginBottom: '12px',
  },
  metaItem: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
  },
  cardTitle: {
    fontSize: '20px',
    marginBottom: '10px',
    lineHeight: '1.3',
    fontFamily: 'var(--font-sans)',
  },
  cardSummary: {
    fontSize: '14px',
    color: 'var(--text-secondary)',
    marginBottom: '20px',
    flex: 1,
    display: '-webkit-box',
    WebkitLineClamp: '3',
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
    textAlign: 'justify',
  },
  cardFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTop: '1px solid rgba(255,255,255,0.03)',
    paddingTop: '16px',
  },
  author: {
    fontSize: '13px',
    fontWeight: '600',
    color: 'var(--text-muted)',
  },
  readBtn: {
    padding: '6px 12px',
    fontSize: '13px',
    borderRadius: '6px',
  },
  infoState: {
    textAlign: 'center',
    padding: '60px 0',
    color: 'var(--text-muted)',
  },
  emptyState: {
    textAlign: 'center',
    padding: '80px 40px',
    maxWidth: '500px',
    margin: '0 auto',
  },
  mainLayout: {
    width: '100%',
  },
  feedColumn: {
    minWidth: 0,
    width: '100%',
  },
  sidebarColumn: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
    width: '100%',
  },
  sidebarWidget: {
    padding: '24px',
  },
  widgetTitle: {
    fontSize: '15px',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    marginBottom: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    borderBottom: '1px solid var(--border-color)',
    paddingBottom: '10px',
  },
  popularList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  popularItem: {
    display: 'flex',
    gap: '14px',
    textDecoration: 'none',
    alignItems: 'flex-start',
  },
  popularRank: {
    fontSize: '22px',
    fontWeight: '900',
    color: 'var(--primary)',
    lineHeight: '1',
    opacity: 0.8,
  },
  popularInfo: {
    display: 'flex',
    flexDirection: 'column',
    minWidth: 0,
  },
  popularTitle: {
    fontSize: '13px',
    fontWeight: '700',
    color: 'var(--text-main)',
    lineHeight: '1.4',
    display: '-webkit-box',
    WebkitLineClamp: '2',
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
  },
  popularCount: {
    fontSize: '11px',
    color: 'var(--text-muted)',
    marginTop: '4px',
  },
  // --- Style Ticker Défilant ---
  tickerContainer: {
    display: 'flex',
    backgroundColor: '#0a0f1d',
    borderBottom: '1px solid var(--border-color)',
    height: '40px',
    alignItems: 'center',
    overflow: 'hidden',
    fontSize: '13px',
  },
  tickerBadge: {
    backgroundColor: 'var(--error)',
    color: 'white',
    padding: '0 16px',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    fontWeight: '900',
    letterSpacing: '1px',
    fontSize: '11px',
    zIndex: 2,
    boxShadow: '4px 0 10px rgba(0,0,0,0.5)',
  },
  tickerTextWrapper: {
    flex: 1,
    overflow: 'hidden',
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  tickerText: {
    display: 'inline-flex',
    whiteSpace: 'nowrap',
    paddingLeft: '100%',
    gap: '24px',
  },
  tickerItem: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
  },
  tickerTime: {
    color: 'var(--secondary)',
    fontWeight: '700',
  },
  tickerLink: {
    color: 'var(--text-main)',
    textDecoration: 'none',
    fontWeight: '600',
  },
  tickerSeparator: {
    color: 'var(--text-muted)',
    marginLeft: '16px',
  },

  // --- Style Weather Card ---
  weatherCard: {
    padding: '20px',
  },
  weatherHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
  },
  weatherSelect: {
    background: 'rgba(255,255,255,0.02)',
    border: '1px solid var(--border-color)',
    borderRadius: '4px',
    color: 'var(--text-main)',
    padding: '3px 8px',
    fontSize: '12px',
    cursor: 'pointer',
    outline: 'none',
  },
  weatherBody: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    marginBottom: '16px',
  },
  weatherIcon: {
    fontSize: '32px',
  },
  weatherInfo: {
    display: 'flex',
    flexDirection: 'column',
  },
  weatherTemp: {
    fontSize: '24px',
    fontWeight: '800',
    color: 'var(--text-main)',
  },
  weatherCondition: {
    fontSize: '12px',
    color: 'var(--text-secondary)',
  },
  weatherDetails: {
    display: 'flex',
    justifyContent: 'space-between',
    borderTop: '1px solid rgba(255,255,255,0.03)',
    paddingTop: '10px',
    fontSize: '11px',
    color: 'var(--text-muted)',
  }
};

export default Home;
