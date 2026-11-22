import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getArticles, getPopularArticles } from '../services/api';
import { IMPORTED_ARTICLES } from '../data/importedArticles';
import AdPlacement from '../components/AdPlacement';
import { Calendar, MapPin, Eye, ArrowRight, BookOpen, TrendingUp, Search } from 'lucide-react';
import { useTimezone } from '../contexts/TimezoneContext';
import { formatRdcDateTime } from '../utils/timeUtils';
import { getFullImageUrl, handleImageError } from '../utils/imageUtils';

// --- Composant Ticker (Fil d'Info Continu) ---
const Ticker = ({ items }) => {
  if (!items || items.length === 0) return null;
  return (
    <div style={styles.tickerContainer}>
      <div style={styles.tickerBadge}>FLASH INFO</div>
      <div style={styles.tickerTextWrapper}>
        <div style={styles.tickerText} className="marquee">
          {items.slice(0, 8).map((art, idx) => (
            <span key={art.id} style={styles.tickerItem}>
              <span style={styles.tickerTime}>
                {new Date(art.publicationDate || art.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
              </span>
              <Link to={`/articles/${art.id}`} style={styles.tickerLink}>
                {art.title}
              </Link>
              {idx < Math.min(items.length, 8) - 1 && <span style={styles.tickerSeparator}>◆</span>}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

// --- Coordonnées et référentiel météorologique en temps réel pour la RDC ---
const DRC_CITIES_COORDS = {
  "Kinshasa": { lat: -4.4419, lon: 15.2663, province: "Capitale" },
  "Lubumbashi": { lat: -11.6876, lon: 27.5026, province: "Haut-Katanga" },
  "Goma": { lat: -1.6585, lon: 29.2205, province: "Nord-Kivu" },
  "Bukavu": { lat: -2.5083, lon: 28.8608, province: "Sud-Kivu" },
  "Kisangani": { lat: 0.5153, lon: 25.1910, province: "Tshopo" },
  "Matadi": { lat: -5.8167, lon: 13.4500, province: "Kongo-Central" },
  "Mbuji-Mayi": { lat: -6.1360, lon: 23.5898, province: "Kasaï-Oriental" },
  "Kolwezi": { lat: -10.7167, lon: 25.4667, province: "Lualaba" },
  "Kananga": { lat: -5.8958, lon: 22.4178, province: "Kasaï-Central" }
};

const getWeatherConditionMeta = (code) => {
  if (code === 0) return { condition: "Ensoleillé", icon: "☀️" };
  if (code === 1) return { condition: "Peu nuageux", icon: "🌤️" };
  if (code === 2) return { condition: "Partiellement voilé", icon: "⛅" };
  if (code === 3) return { condition: "Couvert", icon: "☁️" };
  if (code === 45 || code === 48) return { condition: "Brumeux", icon: "🌫️" };
  if (code >= 51 && code <= 57) return { condition: "Bruine légère", icon: "🌦️" };
  if (code >= 61 && code <= 67) return { condition: "Pluie modérée", icon: "🌧️" };
  if (code >= 80 && code <= 82) return { condition: "Averses tropicales", icon: "🌧️" };
  if (code >= 95) return { condition: "Orages tropicaux", icon: "⛈️" };
  return { condition: "Temps variable", icon: "⛅" };
};

// --- Composant Météo des Régions en Temps Réel (Open-Meteo Satellite & Stations RDC) ---
const WeatherWidget = () => {
  const [city, setCity] = useState("Kinshasa");
  const [weatherState, setWeatherState] = useState({
    temp: "26°C",
    condition: "En direct...",
    humidity: "82%",
    wind: "6 km/h",
    icon: "⛅",
    loading: false
  });
  const [cache, setCache] = useState({});

  useEffect(() => {
    let isMounted = true;
    const fetchWeather = async (targetCity) => {
      if (cache[targetCity]) {
        setWeatherState(cache[targetCity]);
        return;
      }

      const coords = DRC_CITIES_COORDS[targetCity];
      if (!coords) return;

      setWeatherState(prev => ({ ...prev, loading: true }));
      try {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m`;
        const res = await fetch(url);
        if (!res.ok) throw new Error("Flux météo inaccessible");
        const json = await res.json();
        const cur = json.current;
        const meta = getWeatherConditionMeta(cur.weather_code);
        const newData = {
          temp: `${Math.round(cur.temperature_2m)}°C`,
          condition: meta.condition,
          humidity: `${Math.round(cur.relative_humidity_2m)}%`,
          wind: `${Math.round(cur.wind_speed_10m)} km/h`,
          icon: meta.icon,
          loading: false
        };

        if (isMounted) {
          setWeatherState(newData);
          setCache(prev => ({ ...prev, [targetCity]: newData }));
        }
      } catch (err) {
        console.warn("Météo live API indisponible, maintien des mesures:", err);
        if (isMounted) {
          setWeatherState(prev => ({ ...prev, loading: false }));
        }
      }
    };

    fetchWeather(city);
    return () => { isMounted = false; };
  }, [city]);

  return (
    <div className="glass-card" style={styles.weatherCard}>
      <div style={styles.weatherHeader}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={styles.livePulseDot} />
          <span style={styles.widgetTitle}>MÉTÉO RDC EN DIRECT</span>
        </div>
        <select 
          value={city} 
          onChange={(e) => setCity(e.target.value)}
          style={styles.weatherSelect}
          title="Sélectionnez une province de la RDC"
        >
          {Object.keys(DRC_CITIES_COORDS).map(c => (
            <option key={c} value={c}>{c} ({DRC_CITIES_COORDS[c].province})</option>
          ))}
        </select>
      </div>
      <div style={styles.weatherBody}>
        <span style={styles.weatherIcon}>{weatherState.icon}</span>
        <div style={styles.weatherInfo}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <span style={styles.weatherTemp}>{weatherState.temp}</span>
            {weatherState.loading && (
              <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Mise à jour...</span>
            )}
          </div>
          <span style={styles.weatherCondition}>{weatherState.condition}</span>
        </div>
      </div>
      <div style={styles.weatherDetails}>
        <span style={styles.weatherDetailItem}>Humidité : {weatherState.humidity}</span>
        <span style={styles.weatherDetailItem}>Vent : {weatherState.wind}</span>
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
    (art.title?.toLowerCase().includes(searchQuery.toLowerCase()) || 
     art.summary?.toLowerCase().includes(searchQuery.toLowerCase()))
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
            views: (4 - idx) * 1420 + 350
          }));
          setPopularArticles(fallbackPop);
        }
      } catch (error) {
        console.error("Erreur récupération articles populaires:", error);
        const fallbackPop = IMPORTED_ARTICLES.slice(0, 4).map((art, idx) => ({
          articleId: art.id,
          id: art.id,
          title: art.title,
          views: (4 - idx) * 1420 + 350
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

      {/* ========================================================
          1. HERO HEADER - Exactement selon le contenu d'origine
          Logo Officiel, Badge d'Accès, Titre LIFE CHANNEL & Slogan
          ======================================================== */}
      <div style={styles.hero}>
        <div className="container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
          <img 
            src="/logo.png" 
            alt="Life Channel Logo" 
            style={styles.heroLogo} 
            onError={(e) => handleImageError(e, null, '/logo.png')}
          />
          <span style={styles.badge}>PORTAIL D'INFORMATION • RDC • ACCÈS LIBRE ET SANS INSCRIPTION</span>
          <h1 style={styles.heroTitle}>
            LIFE <span style={styles.heroTitleAccent}>CHANNEL</span>
          </h1>
          <p style={styles.heroSubtitle}>
            make every life count • L'actualité en continu, podcasts et direct 24h/24 en libre consultation sans inscription
          </p>
        </div>
      </div>

      {/* ========================================================
          2. FIL D'INFO CONTINU (FLASH INFO DÉFILANT)
          ======================================================== */}
      <Ticker items={articles} />

      {/* ========================================================
          3. TITRE DE LA SECTION DU FLUX D'ACTUALITÉS
          ======================================================== */}
      <div className="container" style={styles.feedHeaderContainer}>
        <h2 style={styles.feedHeading}>Toute l’actualité</h2>
        <p style={styles.feedSubheading}>Découvrez l'ensemble des articles publiés par notre rédaction</p>
      </div>

      {/* ========================================================
          4. BARRE DE RECHERCHE & FILTRES EN CAPSULES
          ======================================================== */}
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

      {/* ========================================================
          5. GRILLE PRINCIPALE DES ARTICLES & SIDEBAR
          ======================================================== */}
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
                    </div>
                  </div>
                ))}
              </div>
            ) : (!filteredArticles || filteredArticles.length === 0) ? (
              <div className="glass-card" style={styles.emptyState}>
                <BookOpen size={48} style={{ color: 'var(--text-muted)', marginBottom: '16px' }} />
                <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '22px' }}>Aucun article disponible</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '14px', maxWidth: '400px', margin: '8px auto 0' }}>
                  Aucun article publié ne correspond aux filtres sélectionnés. Essayez de réinitialiser les critères.
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
                          <Calendar size={13} style={{ color: 'var(--primary)' }} />
                          {formatDate(article.publicationDate || article.createdAt)}
                        </span>
                        {article.region && (
                          <span style={styles.metaItem}>
                            <MapPin size={13} style={{ color: 'var(--primary)' }} />
                            {article.region}
                          </span>
                        )}
                      </div>
                      
                      <h3 className="article-card-title" style={styles.cardTitle}>
                        <Link to={`/articles/${article.id}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                          {article.title}
                        </Link>
                      </h3>
                      
                      <p className="article-card-summary" style={styles.cardSummary}>
                        {article.summary}
                      </p>
                      
                      <div className="article-card-footer" style={styles.cardFooter}>
                        <span style={styles.authorName}>Par {article.authorUsername}</span>
                        <Link to={`/articles/${article.id}`} className="btn-pill-outline" style={{ padding: '6px 16px', fontSize: '11px' }}>
                          Lire <ArrowRight size={13} />
                        </Link>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>

          {/* Colonne Latérale (Tendances, Météo Régionale, Publicité) */}
          <div className="sidebar-column" style={styles.sidebarColumn}>
            {/* Widget Tendances */}
            <div className="glass-card" style={styles.sidebarWidget}>
              <h3 style={styles.widgetTitle}>
                <TrendingUp size={15} style={{ color: 'var(--primary)' }} /> Tendances
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
                        <span style={styles.popularCount}>{pop.views || 0} lectures</span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Widget Météo Régionale RDC */}
            <WeatherWidget />

            {/* Publicité Latérale */}
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

  // --- Hero Section Styles (Fidèle à l'origine avec finition haute couture) ---
  hero: {
    background: 'linear-gradient(180deg, rgba(28, 21, 18, 0.85) 0%, rgba(11, 8, 7, 0) 100%)',
    padding: '32px 0 24px',
    textAlign: 'center',
    borderBottom: '1px solid rgba(192, 192, 192, 0.12)',
  },
  heroLogo: {
    height: '84px',
    width: 'auto',
    maxWidth: '240px',
    objectFit: 'contain',
    marginBottom: '14px',
    filter: 'drop-shadow(0 4px 20px rgba(216, 180, 254, 0.25))',
  },
  badge: {
    fontSize: '10.5px',
    fontWeight: '800',
    letterSpacing: '0.08em',
    color: 'var(--marron-light)',
    background: 'rgba(107, 79, 56, 0.16)',
    padding: '5px 16px',
    borderRadius: '9999px',
    border: '1px solid rgba(192, 192, 192, 0.22)',
    boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
    textTransform: 'uppercase',
    display: 'inline-block',
  },
  heroTitle: {
    fontSize: 'clamp(2rem, 3.5vw, 2.5rem)',
    fontWeight: '900',
    marginTop: '12px',
    marginBottom: '6px',
    letterSpacing: '0.04em',
    fontFamily: 'var(--font-sans)',
    color: '#F5F3F0',
  },
  heroTitleAccent: {
    color: '#E5A93C', // Accent doré d'origine selon la charte Life Channel
    display: 'inline-block',
  },
  heroSubtitle: {
    color: 'var(--argente)',
    fontSize: '13.5px',
    maxWidth: '680px',
    margin: '0 auto',
    lineHeight: '1.6',
    fontWeight: '500',
  },

  // --- Ticker Défilant (Flash Info) ---
  tickerContainer: {
    background: 'linear-gradient(90deg, rgba(18, 14, 12, 0.98) 0%, rgba(26, 20, 17, 0.98) 100%)',
    borderBottom: '1px solid rgba(192, 192, 192, 0.14)',
    display: 'flex',
    alignItems: 'center',
    height: '42px',
    overflow: 'hidden',
    position: 'relative',
    zIndex: 10,
  },
  tickerBadge: {
    background: '#ef4444',
    color: '#ffffff',
    padding: '0 16px',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    fontSize: '11px',
    fontWeight: '900',
    letterSpacing: '0.08em',
    flexShrink: 0,
    zIndex: 2,
    boxShadow: '2px 0 10px rgba(0,0,0,0.4)',
    textTransform: 'uppercase',
  },
  tickerTextWrapper: {
    flex: 1,
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
  },
  tickerText: {
    display: 'inline-flex',
    alignItems: 'center',
    whiteSpace: 'nowrap',
    willChange: 'transform',
  },
  tickerItem: {
    display: 'inline-flex',
    alignItems: 'center',
    fontSize: '13px',
    marginRight: '20px',
  },
  tickerTime: {
    color: 'var(--argente)',
    marginRight: '8px',
    fontWeight: '800',
    fontSize: '11.5px',
  },
  tickerLink: {
    color: '#F5F3F0',
    textDecoration: 'none',
    fontWeight: '600',
  },
  tickerSeparator: {
    color: 'var(--marron)',
    marginLeft: '16px',
    fontSize: '10px',
  },

  // --- Section En-Tête du Feed ---
  feedHeaderContainer: {
    marginTop: '28px',
    marginBottom: '14px',
    textAlign: 'left',
  },
  feedHeading: {
    fontSize: '26px',
    fontWeight: '800',
    letterSpacing: '-0.02em',
    margin: '0 0 4px',
    color: '#F5F3F0',
    fontFamily: 'var(--font-sans)',
  },
  feedSubheading: {
    fontSize: '13.5px',
    color: 'var(--argente)',
    margin: 0,
  },

  // --- Filtres & Barre de Recherche ---
  searchFilterWrapper: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
    marginBottom: '26px',
  },
  searchBarContainer: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    width: '100%',
  },
  searchIcon: {
    position: 'absolute',
    left: '18px',
    color: 'var(--argente)',
    pointerEvents: 'none',
  },
  searchInput: {
    width: '100%',
    padding: '11px 20px 11px 48px',
    borderRadius: '9999px',
    background: 'rgba(26, 20, 17, 0.75)',
    border: '1px solid rgba(192, 192, 192, 0.2)',
    color: '#F5F3F0',
    fontSize: '14px',
    outline: 'none',
    transition: 'all 0.25s ease',
  },
  pillsRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '18px',
    width: '100%',
  },
  pillsScroll: {
    display: 'flex',
    gap: '10px',
    overflowX: 'auto',
    flex: 1,
    paddingBottom: '4px',
  },
  pillBtn: {
    padding: '8px 18px',
    borderRadius: '9999px',
    border: '1px solid rgba(192, 192, 192, 0.2)',
    background: 'rgba(107, 79, 56, 0.14)',
    color: 'var(--argente)',
    cursor: 'pointer',
    fontWeight: '700',
    fontSize: '12px',
    letterSpacing: '0.04em',
    whiteSpace: 'nowrap',
    transition: 'all 0.25s ease',
    outline: 'none',
  },
  activePillBtn: {
    background: 'linear-gradient(135deg, #6B4F38 0%, #8E684D 100%)',
    borderColor: 'var(--primary)',
    color: '#ffffff',
    boxShadow: '0 4px 16px rgba(216, 180, 254, 0.28)',
  },
  regionSelectorContainer: {
    position: 'relative',
    flexShrink: 0,
  },
  regionSelect: {
    padding: '8px 20px',
    borderRadius: '9999px',
    background: 'rgba(107, 79, 56, 0.16)',
    border: '1px solid rgba(192, 192, 192, 0.25)',
    color: '#F5F3F0',
    cursor: 'pointer',
    fontWeight: '700',
    fontSize: '12px',
    letterSpacing: '0.04em',
    outline: 'none',
    transition: 'all 0.2s ease',
  },

  // --- Grille Principale & Cartes ---
  mainLayout: {
    width: '100%',
  },
  feedColumn: {
    minWidth: 0,
    width: '100%',
  },
  articlesGrid: {
    width: '100%',
  },
  card: {
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    height: '100%',
    border: '1px solid rgba(192, 192, 192, 0.16)',
  },
  cardImageContainer: {
    position: 'relative',
    height: '220px',
    width: '100%',
    overflow: 'hidden',
    backgroundColor: 'rgba(20, 15, 13, 0.85)',
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
    background: 'linear-gradient(135deg, #6B4F38 0%, #8E684D 100%)',
    color: '#F5F3F0',
    padding: '4px 12px',
    borderRadius: '9999px',
    fontSize: '10.5px',
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
    border: '1px solid rgba(192,192,192,0.22)',
  },
  cardBody: {
    padding: '22px',
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
  },
  cardMeta: {
    display: 'flex',
    gap: '16px',
    fontSize: '12px',
    color: 'var(--argente)',
    marginBottom: '12px',
  },
  metaItem: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
  },
  cardTitle: {
    fontSize: '19px',
    fontWeight: '700',
    fontFamily: 'var(--font-serif), Playfair Display, serif',
    lineHeight: '1.35',
    margin: '0 0 10px',
    color: '#F5F3F0',
  },
  cardSummary: {
    fontSize: '13.5px',
    color: 'var(--argente)',
    lineHeight: '1.6',
    margin: '0 0 20px',
    flex: 1,
  },
  cardFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTop: '1px solid rgba(192, 192, 192, 0.12)',
    paddingTop: '16px',
  },
  authorName: {
    fontSize: '12px',
    color: 'var(--text-muted)',
    fontWeight: '500',
  },
  emptyState: {
    padding: '60px 20px',
    textAlign: 'center',
    borderRadius: '16px',
  },

  // --- Sidebar Styles ---
  sidebarColumn: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  sidebarWidget: {
    padding: '22px',
    borderRadius: '16px',
  },
  widgetTitle: {
    fontSize: '13px',
    fontWeight: '800',
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    color: '#F5F3F0',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    margin: '0 0 16px',
  },
  popularList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
  },
  popularItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    textDecoration: 'none',
  },
  popularRank: {
    fontSize: '18px',
    fontWeight: '900',
    color: 'var(--primary)',
    lineHeight: '1',
    minWidth: '24px',
    fontFamily: 'var(--font-serif), Playfair Display, serif',
  },
  popularInfo: {
    flex: 1,
  },
  popularTitle: {
    fontSize: '13.5px',
    fontWeight: '600',
    color: '#F5F3F0',
    lineHeight: '1.35',
    display: 'block',
    marginBottom: '2px',
    transition: 'color 0.2s',
  },
  popularCount: {
    fontSize: '11px',
    color: 'var(--argente)',
  },

  // --- Weather Widget Styles ---
  livePulseDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    backgroundColor: '#10b981',
    boxShadow: '0 0 10px #10b981',
    display: 'inline-block',
  },
  weatherCard: {
    padding: '22px',
    borderRadius: '16px',
  },
  weatherHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
  },
  weatherSelect: {
    background: 'rgba(107, 79, 56, 0.2)',
    border: '1px solid rgba(192, 192, 192, 0.2)',
    color: '#F5F3F0',
    borderRadius: '9999px',
    padding: '4px 10px',
    fontSize: '11px',
    fontWeight: '600',
    outline: 'none',
  },
  weatherBody: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    marginBottom: '14px',
  },
  weatherIcon: {
    fontSize: '36px',
  },
  weatherInfo: {
    display: 'flex',
    flexDirection: 'column',
  },
  weatherTemp: {
    fontSize: '26px',
    fontWeight: '800',
    color: '#F5F3F0',
    lineHeight: '1.1',
  },
  weatherCondition: {
    fontSize: '12px',
    color: 'var(--argente)',
  },
  weatherDetails: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '11px',
    color: 'var(--text-muted)',
    borderTop: '1px solid rgba(192, 192, 192, 0.12)',
    paddingTop: '12px',
  },
  weatherDetailItem: {
    display: 'inline-block',
  },
};

export default Home;
