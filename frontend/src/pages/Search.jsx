import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { searchArticles } from '../services/api';
import { IMPORTED_ARTICLES } from '../data/importedArticles';
import { REGION_GROUPS } from '../data/regions';
import { getFullImageUrl, handleImageError } from '../utils/imageUtils';
import { Search as SearchIcon, Calendar, Tag, MapPin, ArrowRight } from 'lucide-react';

const Search = () => {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('');
  const [region, setRegion] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const categories = ["Politique", "Économie", "Société", "Sport", "Culture", "Technologie", "Santé", "Environnement"];
  const regions = ["Kinshasa", "Haut-Katanga", "Lualaba", "Nord-Kivu", "Sud-Kivu", "Kongo-Central"];

  const getFallbackSearchResults = (q, cat, reg) => {
    let list = IMPORTED_ARTICLES;
    if (q && q.trim()) {
      const term = q.toLowerCase().trim();
      list = list.filter(a => 
        a.title?.toLowerCase().includes(term) || 
        a.summary?.toLowerCase().includes(term) || 
        a.tags?.toLowerCase().includes(term)
      );
    }
    if (cat) {
      list = list.filter(a => a.category?.toLowerCase() === cat.toLowerCase());
    }
    if (reg) {
      list = list.filter(a => a.region?.toLowerCase() === reg.toLowerCase());
    }
    return list;
  };

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    try {
      const data = await searchArticles(query, category, region);
      if (data && Array.isArray(data) && data.length > 0) {
        setResults(data);
      } else {
        setResults(getFallbackSearchResults(query, category, region));
      }
    } catch (error) {
      console.error("Erreur de recherche:", error);
      setResults(getFallbackSearchResults(query, category, region));
    } finally {
      setLoading(false);
    }
  };

  // Lancer une recherche initiale
  useEffect(() => {
    handleSearch();
  }, [category, region]);

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <div className="container animate-fade-in" style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Recherche Globale</h1>
        <p style={styles.subtitle}>Explorez l'ensemble des articles et des archives de la plateforme</p>
      </div>

      {/* Search Input and Filters */}
      <div className="glass-card" style={styles.searchBarCard}>
        <form onSubmit={handleSearch} style={styles.form}>
          <div style={styles.inputWrapper}>
            <SearchIcon size={20} style={styles.searchIcon} />
            <input
              type="text"
              className="form-input"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Tapez vos mots-clés... (ex: Élections, Kinshasa, Football)"
              style={styles.input}
            />
          </div>
          <button type="submit" className="btn btn-primary" style={styles.searchBtn}>
            Rechercher
          </button>
        </form>

        <div style={styles.filtersRow}>
          <div style={styles.filterGroup}>
            <label style={styles.filterLabel}>Catégorie</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              style={styles.select}
            >
              <option value="">Toutes</option>
              {categories.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div style={styles.filterGroup}>
            <label style={styles.filterLabel}>Zone Géographique / Région</label>
            <select
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              style={styles.select}
            >
              <option value="">Toutes les régions</option>
              {REGION_GROUPS.map((grp) => (
                <optgroup key={grp.group} label={grp.group}>
                  {grp.options.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Results */}
      <div style={styles.resultsSection}>
        <h2 style={styles.resultsCount}>
          {loading ? "Recherche en cours..." : `${results.length} résultat(s) trouvé(s)`}
        </h2>

        {loading ? (
          <div style={styles.grid}>
            {[1, 2].map((i) => (
              <div key={i} className="skeleton-card" style={{ height: '240px' }}>
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
        ) : results.length === 0 ? (
          <div style={styles.emptyState}>
            <SearchIcon size={40} style={{ color: 'var(--text-muted)', marginBottom: '12px' }} />
            <p style={{ color: 'var(--text-muted)' }}>Aucun article ne correspond à votre recherche.</p>
          </div>
        ) : (
          <div style={styles.grid}>
            {results.map((art) => (
              <div key={art.id} className="glass-card" style={styles.card}>
                <div style={styles.cardImageContainer}>
                  <img 
                    src={getFullImageUrl(art.mainImageUrl, art.category)} 
                    alt={art.title} 
                    className="img-cover-adaptive"
                    style={styles.cardImage} 
                    loading="lazy"
                    onError={(e) => handleImageError(e, art.category)}
                  />
                  <span style={styles.cardCategory}>{art.category}</span>
                </div>
                <div style={styles.cardBody}>
                  <div style={styles.cardMeta}>
                    <span style={styles.metaItem}>
                      <Calendar size={13} /> {formatDate(art.publicationDate || art.createdAt)}
                    </span>
                    <span style={styles.metaItem}>
                      <Tag size={13} /> {art.category}
                    </span>
                    {art.region && (
                      <span style={styles.metaItem}>
                        <MapPin size={13} /> {art.region}
                      </span>
                    )}
                  </div>
                  <h3 style={styles.cardTitle}>{art.title}</h3>
                  <p style={styles.cardSummary}>{art.summary}</p>
                  
                  <div style={styles.cardFooter}>
                    <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Par {art.authorUsername}</span>
                    <Link to={`/articles/${art.id}`} className="btn btn-secondary" style={styles.readBtn}>
                      Lire <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: {
    padding: '40px 24px 80px',
  },
  header: {
    marginBottom: '30px',
    borderBottom: '1px solid var(--border-color)',
    paddingBottom: '20px',
  },
  title: {
    fontSize: '28px',
    marginBottom: '6px',
  },
  subtitle: {
    fontSize: '14px',
    color: 'var(--text-muted)',
  },
  searchBarCard: {
    padding: '30px',
    marginBottom: '40px',
  },
  form: {
    display: 'flex',
    gap: '16px',
    marginBottom: '20px',
  },
  inputWrapper: {
    flex: 1,
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  searchIcon: {
    position: 'absolute',
    left: '16px',
    color: 'var(--text-muted)',
  },
  input: {
    paddingLeft: '48px',
  },
  searchBtn: {
    padding: '12px 28px',
  },
  filtersRow: {
    display: 'flex',
    gap: '24px',
    borderTop: '1px solid var(--border-color)',
    paddingTop: '20px',
    flexWrap: 'wrap',
  },
  filterGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  filterLabel: {
    fontSize: '13px',
    fontWeight: '600',
    color: 'var(--text-secondary)',
  },
  select: {
    padding: '6px 12px',
    background: 'rgba(15, 23, 42, 0.8)',
    border: '1px solid var(--border-color)',
    borderRadius: '6px',
    color: 'var(--text-main)',
    cursor: 'pointer',
    outline: 'none',
  },
  resultsSection: {
    marginTop: '20px',
  },
  resultsCount: {
    fontSize: '18px',
    fontWeight: '600',
    marginBottom: '20px',
  },
  emptyState: {
    textAlign: 'center',
    padding: '40px 0',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    gap: '24px',
  },
  card: {
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  cardImageContainer: {
    position: 'relative',
    height: '180px',
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
    transition: 'transform 0.4s ease',
  },
  cardCategory: {
    position: 'absolute',
    top: '12px',
    left: '12px',
    background: 'var(--primary)',
    color: 'white',
    padding: '3px 8px',
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
    flexWrap: 'wrap',
    gap: '12px',
    fontSize: '12px',
    color: 'var(--text-muted)',
    marginBottom: '10px',
  },
  metaItem: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
  },
  cardTitle: {
    fontSize: '18px',
    marginBottom: '8px',
    lineHeight: '1.3',
  },
  cardSummary: {
    fontSize: '14px',
    color: 'var(--text-secondary)',
    marginBottom: '20px',
    flex: 1,
    display: '-webkit-box',
    WebkitLineClamp: '2',
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
  },
  cardFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTop: '1px solid rgba(255,255,255,0.03)',
    paddingTop: '12px',
  },
  readBtn: {
    padding: '4px 10px',
    fontSize: '12px',
    borderRadius: '4px',
  }
};

export default Search;
