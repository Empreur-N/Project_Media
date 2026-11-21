import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTimezone } from '../contexts/TimezoneContext';
import { getArticles } from '../services/api';
import { IMPORTED_ARTICLES } from '../data/importedArticles';
import { formatRdcDateTime } from '../utils/timeUtils';
import { getFullImageUrl, handleImageError } from '../utils/imageUtils';
import { 
  Activity, Users, FileText, Radio, PlayCircle, PlusCircle, 
  CheckCircle2, ShieldCheck, Search, Filter, Eye, Edit, 
  ExternalLink, Calendar, MapPin, Tag, UserCheck, RefreshCw,
  Tv, MessageSquare, ArrowRight, BookOpen, Share2, Globe, Check, AlertCircle
} from 'lucide-react';

const Dashboard = () => {
  const { user, token } = useAuth();
  const { timezone, currentDetails } = useTimezone();
  const navigate = useNavigate();

  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedAuthor, setSelectedAuthor] = useState('ALL');
  const [selectedRegion, setSelectedRegion] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [socialSyncing, setSocialSyncing] = useState(false);
  const [socialSyncMsg, setSocialSyncMsg] = useState(null);

  const handleTriggerSocialSync = async () => {
    setSocialSyncing(true);
    setSocialSyncMsg(null);
    try {
      const res = await fetch('/api/contents/social-sync/pull-youtube', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Social-Sync-Key': 'lifechannel_social_sync_secret_2026'
        }
      });
      const data = await res.json();
      setSocialSyncMsg({ type: 'success', text: data.message || "Passerelle interrogée avec succès." });
      fetchAllPublications();
    } catch (e) {
      setSocialSyncMsg({ type: 'error', text: "Erreur de connexion à la passerelle de synchronisation." });
    } finally {
      setSocialSyncing(false);
    }
  };

  // Chargement des articles (API avec fallback automatique vers IMPORTED_ARTICLES)
  const fetchAllPublications = async () => {
    setLoading(true);
    try {
      const data = await getArticles(null, null, null, token);
      if (data && Array.isArray(data) && data.length > 0) {
        setArticles(data);
      } else {
        setArticles(IMPORTED_ARTICLES);
      }
    } catch (err) {
      console.warn("Utilisation du registre des articles locaux (API hors ligne):", err);
      setArticles(IMPORTED_ARTICLES);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllPublications();
  }, [token]);

  // Liste dynamique et unique des auteurs/journalistes ayant publié
  const uniqueAuthors = useMemo(() => {
    const set = new Set();
    articles.forEach(a => {
      if (a.authorUsername) set.add(a.authorUsername);
    });
    return Array.from(set);
  }, [articles]);

  // Liste dynamique des catégories
  const uniqueCategories = useMemo(() => {
    const set = new Set();
    articles.forEach(a => {
      if (a.category) set.add(a.category);
    });
    return Array.from(set);
  }, [articles]);

  // Filtrage combiné en temps réel
  const filteredArticles = useMemo(() => {
    return articles.filter(art => {
      const matchSearch = searchQuery === '' || 
        art.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        art.summary?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        art.authorUsername?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        art.tags?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchCategory = selectedCategory === 'ALL' || art.category === selectedCategory;
      const matchAuthor = selectedAuthor === 'ALL' || art.authorUsername === selectedAuthor;
      const matchRegion = selectedRegion === 'ALL' || art.region === selectedRegion;
      const matchStatus = selectedStatus === 'ALL' || (art.status || 'PUBLISHED') === selectedStatus;

      return matchSearch && matchCategory && matchAuthor && matchRegion && matchStatus;
    });
  }, [articles, searchQuery, selectedCategory, selectedAuthor, selectedRegion, selectedStatus]);

  // Calcul des métriques globales
  const stats = [
    { 
      label: "Articles au Registre", 
      value: String(articles.length), 
      icon: <FileText size={22} />, 
      hint: `${articles.filter(a => (a.status || 'PUBLISHED') === 'PUBLISHED').length} publiés`,
      color: 'var(--primary)'
    },
    { 
      label: "Journalistes / Rédactions", 
      value: String(uniqueAuthors.length), 
      icon: <Users size={22} />, 
      hint: "Contributeurs identifiés",
      color: '#10b981'
    },
    { 
      label: "Podcasts & Émissions", 
      value: "3 séries", 
      icon: <PlayCircle size={22} />, 
      hint: "Life Talk & Culture",
      color: '#f59e0b'
    },
    { 
      label: "Diffusion Direct TV", 
      value: "Opérationnel", 
      icon: <Radio size={22} />, 
      hint: "Canal 24/7 configuré",
      color: '#ef4444'
    }
  ];

  return (
    <div className="container animate-fade-in" style={styles.container}>
      {/* Header Administration */}
      {user?.role === 'SUPERVISOR' && (
        <div style={{
          background: 'linear-gradient(135deg, rgba(107, 79, 56, 0.25), rgba(216, 180, 254, 0.12))',
          border: '1px solid rgba(216, 180, 254, 0.35)',
          borderRadius: '12px',
          padding: '18px 22px',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          gap: '16px'
        }}>
          <div style={{ fontSize: '32px' }}>🏛️</div>
          <div>
            <div style={{ fontWeight: '700', fontSize: '1.1rem', color: 'var(--primary)' }}>
              Cockpit de Supervision & Direction Fondatrice (Mode Consultation & Audit)
            </div>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Bienvenue aux Fondateurs et à la Direction Générale. Vous disposez d'un accès de contrôle en temps réel sur l'ensemble des flux d'information, des diffusions et de la régie, garantissant l'intégrité opérationnelle de la chaîne sans modifier le contenu opérationnel.
            </div>
          </div>
        </div>
      )}

      <div style={styles.header}>
        <div>
          <div style={styles.badgeRow}>
            <span style={styles.adminBadge}>
              <ShieldCheck size={14} /> {user?.role === 'SUPERVISOR' ? 'SUPERVISION GÉNÉRALE & DIRECTION' : 'PORTAIL D\'ADMINISTRATION & SUPERVISION'}
            </span>
            <span style={styles.tzBadge}>
              Fuseau : {currentDetails.shortBadge} ({currentDetails.key === 'KINSHASA' ? 'Kinshasa GMT+1' : 'Lubumbashi GMT+2'})
            </span>
          </div>
          <h1 style={styles.title}>
            {user?.role === 'SUPERVISOR' ? 'Cockpit de Supervision Direction' : 'Registre & Supervision des Publications'}
          </h1>
          <p style={styles.subtitle}>
            Connecté en tant que <strong style={{ color: 'var(--text-main)' }}>{user?.username}</strong> ({user?.role}) — Vue centrale de tous les articles, auteurs et diffusions multimédias.
          </p>
        </div>

        {/* Boutons d'actions rapides du panneau supérieur */}
        <div style={styles.actionButtonGroup}>
          {user?.role === 'SUPERVISOR' ? (
            <>
              <Link to="/admin/podcasts" className="btn btn-secondary" style={styles.actionBtn}>
                <PlayCircle size={16} /> Suivi Podcasts
              </Link>
              <Link to="/admin/lives" className="btn btn-secondary" style={styles.actionBtn}>
                <Radio size={16} /> Suivi Directs
              </Link>
              <Link to="/admin/ads" className="btn btn-secondary" style={styles.actionBtn}>
                <Activity size={16} /> Régie Publicitaire
              </Link>
            </>
          ) : (
            <>
              <Link to="/admin/journalist" className="btn btn-primary" style={styles.actionBtn}>
                <PlusCircle size={16} /> Rédiger un Article
              </Link>
              <Link to="/admin/editor" className="btn btn-secondary" style={styles.actionBtn}>
                <CheckCircle2 size={16} /> Relire & Valider
              </Link>
            </>
          )}
          <button onClick={fetchAllPublications} className="btn btn-secondary" style={styles.refreshBtn} title="Actualiser le registre">
            <RefreshCw size={15} />
          </button>
        </div>
      </div>

      {/* Raccourcis Modules Administration */}
      <div style={styles.shortcutsGrid}>
        <Link to="/admin/journalist" className="glass-card" style={styles.shortcutCard}>
          <div style={{ ...styles.shortcutIcon, background: 'rgba(216, 180, 254, 0.12)', color: 'var(--primary)' }}>
            <Edit size={20} />
          </div>
          <div>
            <div style={styles.shortcutTitle}>Espace Journaliste</div>
            <div style={styles.shortcutDesc}>Rédiger de nouveaux articles & programmer des sorties</div>
          </div>
        </Link>

        <Link to="/admin/editor" className="glass-card" style={styles.shortcutCard}>
          <div style={{ ...styles.shortcutIcon, background: 'rgba(16, 185, 129, 0.12)', color: '#10b981' }}>
            <CheckCircle2 size={20} />
          </div>
          <div>
            <div style={styles.shortcutTitle}>Espace Rédacteur en Chef</div>
            <div style={styles.shortcutDesc}>Modérer, valider ou refuser les soumissions en attente</div>
          </div>
        </Link>

        <Link to="/admin/users" className="glass-card" style={styles.shortcutCard}>
          <div style={{ ...styles.shortcutIcon, background: 'rgba(168, 85, 247, 0.12)', color: '#a855f7' }}>
            <UserCheck size={20} />
          </div>
          <div>
            <div style={styles.shortcutTitle}>Utilisateurs & Rôles</div>
            <div style={styles.shortcutDesc}>Gérer les agents (Journalistes, Rédacteurs, Admins)</div>
          </div>
        </Link>

        <Link to="/admin/podcasts" className="glass-card" style={styles.shortcutCard}>
          <div style={{ ...styles.shortcutIcon, background: 'rgba(245, 158, 11, 0.12)', color: '#f59e0b' }}>
            <PlayCircle size={20} />
          </div>
          <div>
            <div style={styles.shortcutTitle}>Gestion des Podcasts</div>
            <div style={styles.shortcutDesc}>Uploader des épisodes et gérer les émissions audio</div>
          </div>
        </Link>

        <Link to="/admin/lives" className="glass-card" style={styles.shortcutCard}>
          <div style={{ ...styles.shortcutIcon, background: 'rgba(239, 68, 68, 0.12)', color: '#ef4444' }}>
            <Tv size={20} />
          </div>
          <div>
            <div style={styles.shortcutTitle}>Gestion des Directs TV</div>
            <div style={styles.shortcutDesc}>Configurer les flux vidéo live et planifier la grille</div>
          </div>
        </Link>

        <Link to="/admin/comments" className="glass-card" style={styles.shortcutCard}>
          <div style={{ ...styles.shortcutIcon, background: 'rgba(14, 165, 233, 0.12)', color: '#0ea5e9' }}>
            <MessageSquare size={20} />
          </div>
          <div>
            <div style={styles.shortcutTitle}>Modération Commentaires</div>
            <div style={styles.shortcutDesc}>Filtrer les messages et avis des téléspectateurs</div>
          </div>
        </Link>
      </div>

      {/* KPI Cards */}
      <div style={styles.statsGrid}>
        {stats.map((s, i) => (
          <div key={i} className="glass-card" style={styles.statCard}>
            <div style={{ ...styles.statIcon, color: s.color }}>{s.icon}</div>
            <div style={{ flex: 1 }}>
              <div style={styles.statLabel}>{s.label}</div>
              <div style={styles.statValue}>{s.value}</div>
              <div style={styles.statHint}>{s.hint}</div>
            </div>
          </div>
        ))}
      </div>

      {/* PASSERELLE SYNCHRONISATION RÉSEAUX SOCIAUX */}
      <div className="glass-card" style={{
        padding: '20px 24px',
        marginBottom: '28px',
        borderRadius: '16px',
        background: 'rgba(255, 255, 255, 0.03)',
        border: '1px solid var(--border-color)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', marginBottom: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '22px' }}>🔄</span>
              <h2 style={{ fontSize: '1.2rem', fontWeight: '800', margin: 0, color: 'var(--text-main)' }}>
                Passerelle de Synchronisation Automatique des Réseaux Sociaux
              </h2>
              <span style={{
                backgroundColor: 'rgba(34, 197, 94, 0.15)',
                color: '#22c55e',
                border: '1px solid rgba(34, 197, 94, 0.3)',
                padding: '2px 8px',
                borderRadius: '10px',
                fontSize: '11px',
                fontWeight: '800'
              }}>
                PASSERELLE ACTIVE
              </span>
            </div>
            <p style={{ margin: '6px 0 0', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
              Ingère et publie automatiquement sur le site web dès qu'un post ou vidéo est mis en ligne sur nos canaux officiels.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              onClick={handleTriggerSocialSync}
              disabled={socialSyncing}
              className="btn btn-primary"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 16px', fontSize: '13px' }}
            >
              <RefreshCw size={14} className={socialSyncing ? "pulse" : ""} />
              <span>{socialSyncing ? "Synchronisation en cours..." : "Synchroniser YouTube & Flux"}</span>
            </button>
          </div>
        </div>

        {socialSyncMsg && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 14px',
            borderRadius: '8px',
            marginBottom: '16px',
            backgroundColor: socialSyncMsg.type === 'success' ? 'rgba(34, 197, 94, 0.12)' : 'rgba(239, 68, 68, 0.12)',
            border: `1px solid ${socialSyncMsg.type === 'success' ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
            color: socialSyncMsg.type === 'success' ? '#22c55e' : '#ef4444',
            fontSize: '13px'
          }}>
            {socialSyncMsg.type === 'success' ? <Check size={16} /> : <AlertCircle size={16} />}
            <span>{socialSyncMsg.text}</span>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
          <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '12px 14px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '700', fontSize: '13px', color: '#ff0000' }}>
              ▶️ YouTube
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Importation vidéo automatique + iframe intégrée
            </div>
            <div style={{ fontSize: '11px', color: '#22c55e', marginTop: '6px', fontWeight: '600' }}>● Auto-polling 30 min & RSS actif</div>
          </div>

          <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '12px 14px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '700', fontSize: '13px', color: '#1877f2' }}>
              📲 Facebook
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Webhook instantané vers l'actualité web
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '6px' }}>Endpoint Webhook configuré</div>
          </div>

          <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '12px 14px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '700', fontSize: '13px', color: '#fe2c55' }}>
              🎵 TikTok
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Vidéos courtes & buzz éditoriaux
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '6px' }}>Formatage vertical optimisé</div>
          </div>

          <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '12px 14px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '700', fontSize: '13px', color: '#e1306c' }}>
              📸 Instagram
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Photos de reportage et publications
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '6px' }}>Galerie et légendes intégrées</div>
          </div>
        </div>

        <div style={{ marginTop: '14px', padding: '10px 14px', borderRadius: '8px', background: 'rgba(0, 0, 0, 0.25)', fontSize: '12px', color: 'var(--text-muted)' }}>
          <strong style={{ color: 'var(--text-main)' }}>URL du Webhook d'ingestion : </strong>
          <code>https://lifechannelmedia.com/api/contents/social-sync</code>
          <span style={{ marginLeft: '12px' }}>
            <strong style={{ color: 'var(--text-main)' }}>Entête d'autorisation : </strong>
            <code>X-Social-Sync-Key: lifechannel_social_sync_secret_2026</code>
          </span>
        </div>
      </div>

      {/* SECTION CENTRALE : Tableau de bord des publications */}
      <div className="glass-card" style={styles.tableCard}>
        <div style={styles.tableCardHeader}>
          <div>
            <h2 style={styles.tableCardTitle}>
              <FileText size={20} style={{ color: 'var(--primary)', marginRight: '8px' }} />
              Registre de Toutes les Publications ({filteredArticles.length})
            </h2>
            <p style={styles.tableCardSubtitle}>
              Retrouvez ici qui a publié quoi, avec l'auteur / journaliste, la date de diffusion et le statut.
            </p>
          </div>
        </div>

        {/* Barre de Recherche et Filtres */}
        <div style={styles.filterBar}>
          {/* Recherche textuelle */}
          <div style={styles.searchWrapper}>
            <Search size={16} style={styles.searchIcon} />
            <input
              type="text"
              placeholder="Rechercher par titre, auteur, résumé..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={styles.searchInput}
            />
          </div>

          {/* Filtre Auteur / Journaliste */}
          <div style={styles.filterGroup}>
            <label style={styles.filterLabel}>Auteur / Journaliste :</label>
            <select 
              value={selectedAuthor} 
              onChange={(e) => setSelectedAuthor(e.target.value)}
              style={styles.selectInput}
            >
              <option value="ALL">Tous les journalistes ({uniqueAuthors.length})</option>
              {uniqueAuthors.map(author => (
                <option key={author} value={author}>{author}</option>
              ))}
            </select>
          </div>

          {/* Filtre Catégorie */}
          <div style={styles.filterGroup}>
            <label style={styles.filterLabel}>Catégorie :</label>
            <select 
              value={selectedCategory} 
              onChange={(e) => setSelectedCategory(e.target.value)}
              style={styles.selectInput}
            >
              <option value="ALL">Toutes les rubriques</option>
              {uniqueCategories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Filtre Région */}
          <div style={styles.filterGroup}>
            <label style={styles.filterLabel}>Région :</label>
            <select 
              value={selectedRegion} 
              onChange={(e) => setSelectedRegion(e.target.value)}
              style={styles.selectInput}
            >
              <option value="ALL">Toutes les régions</option>
              <option value="Kinshasa">Kinshasa</option>
              <option value="Nord-Kivu">Nord-Kivu</option>
              <option value="Haut-Katanga">Haut-Katanga</option>
              <option value="Sud-Kivu">Sud-Kivu</option>
              <option value="Lualaba">Lualaba</option>
            </select>
          </div>

          {/* Bouton Reset */}
          {(searchQuery || selectedAuthor !== 'ALL' || selectedCategory !== 'ALL' || selectedRegion !== 'ALL') && (
            <button 
              onClick={() => {
                setSearchQuery('');
                setSelectedAuthor('ALL');
                setSelectedCategory('ALL');
                setSelectedRegion('ALL');
              }}
              style={styles.resetFilterBtn}
            >
              Réinitialiser
            </button>
          )}
        </div>

        {/* Table des Publications */}
        {loading ? (
          <div style={styles.emptyContainer}>
            <Activity size={32} className="pulse-icon" style={{ color: 'var(--primary)' }} />
            <p style={{ marginTop: '12px', color: 'var(--text-muted)' }}>Chargement des publications...</p>
          </div>
        ) : filteredArticles.length === 0 ? (
          <div style={styles.emptyContainer}>
            <BookOpen size={40} style={{ color: 'var(--text-muted)', marginBottom: '12px' }} />
            <h3 style={{ fontSize: '16px', marginBottom: '6px' }}>Aucune publication trouvée</h3>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
              Aucun article ne correspond aux filtres de recherche actuels.
            </p>
          </div>
        ) : (
          <div style={styles.tableResponsiveWrapper}>
            <table style={styles.table}>
              <thead>
                <tr style={styles.tableHeadRow}>
                  <th style={{ ...styles.th, width: '60px' }}>Visuel</th>
                  <th style={{ ...styles.th, minWidth: '280px' }}>Titre & Extrait</th>
                  <th style={{ ...styles.th, minWidth: '170px' }}>Auteur / Publié Par</th>
                  <th style={{ ...styles.th, minWidth: '130px' }}>Rubrique & Région</th>
                  <th style={{ ...styles.th, minWidth: '140px' }}>Date de Publication</th>
                  <th style={{ ...styles.th, width: '100px', textAlign: 'center' }}>Statut</th>
                  <th style={{ ...styles.th, width: '130px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredArticles.map((art) => {
                  const status = art.status || 'PUBLISHED';
                  return (
                    <tr key={art.id} style={styles.tableBodyRow}>
                      {/* Image Miniature */}
                      <td style={styles.td}>
                        <div style={styles.thumbnailWrapper}>
                          <img
                            src={getFullImageUrl(art.mainImageUrl, art.category)}
                            alt={art.title}
                            style={styles.thumbnail}
                            onError={(e) => handleImageError(e, art.category)}
                          />
                        </div>
                      </td>

                      {/* Titre & Extrait */}
                      <td style={styles.td}>
                        <Link to={`/articles/${art.id}`} style={styles.articleTitleLink}>
                          {art.title}
                        </Link>
                        {art.summary && (
                          <div style={styles.articleExcerpt}>
                            {art.summary.length > 95 ? art.summary.substring(0, 95) + '...' : art.summary}
                          </div>
                        )}
                        {art.tags && (
                          <div style={styles.tagsRow}>
                            {art.tags.split(',').slice(0, 3).map((t, idx) => (
                              <span key={idx} style={styles.tagBadge}>#{t.trim()}</span>
                            ))}
                          </div>
                        )}
                      </td>

                      {/* Auteur / Journaliste */}
                      <td style={styles.td}>
                        <div style={styles.authorBadge}>
                          <UserCheck size={14} style={{ color: 'var(--primary)', flexShrink: 0 }} />
                          <span style={styles.authorName}>{art.authorUsername || 'Rédaction Life Channel'}</span>
                        </div>
                      </td>

                      {/* Rubrique & Région */}
                      <td style={styles.td}>
                        <div style={styles.metaBadges}>
                          <span style={styles.categoryBadge}>
                            <Tag size={11} style={{ marginRight: '4px' }} />
                            {art.category}
                          </span>
                          {art.region && (
                            <span style={styles.regionBadge}>
                              <MapPin size={11} style={{ marginRight: '4px' }} />
                              {art.region}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Date de Publication */}
                      <td style={styles.td}>
                        <div style={styles.dateCell}>
                          <div style={styles.dateMain}>
                            <Calendar size={12} style={{ marginRight: '5px' }} />
                            {formatRdcDateTime(art.publicationDate || art.createdAt, timezone)}
                          </div>
                        </div>
                      </td>

                      {/* Statut */}
                      <td style={{ ...styles.td, textAlign: 'center' }}>
                        {status === 'PUBLISHED' && (
                          <span style={styles.statusBadgePublished}>PUBLIÉ</span>
                        )}
                        {status === 'SUBMITTED' && (
                          <span style={styles.statusBadgeSubmitted}>EN ATTENTE</span>
                        )}
                        {status === 'DRAFT' && (
                          <span style={styles.statusBadgeDraft}>BROUILLON</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td style={{ ...styles.td, textAlign: 'right' }}>
                        <div style={styles.actionsRow}>
                          <Link 
                            to={`/articles/${art.id}`} 
                            className="btn btn-secondary" 
                            style={styles.actionViewBtn}
                            title="Consulter l'article côté lecteur"
                          >
                            <Eye size={13} /> Lire
                          </Link>
                          {user?.role !== 'SUPERVISOR' && (
                            <Link 
                              to={`/admin/journalist?edit=${art.id}`} 
                              className="btn btn-secondary" 
                              style={styles.actionEditBtn}
                              title="Modifier cet article dans l'espace éditorial"
                            >
                              <Edit size={13} />
                            </Link>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Raccourcis Direct & Podcasts rapides pour supervision */}
      <div style={styles.dualSection}>
        <div className="glass-card" style={styles.halfCard}>
          <div style={styles.halfCardHeader}>
            <Radio size={20} style={{ color: '#ef4444' }} />
            <div>
              <h3 style={styles.halfCardTitle}>Supervision Diffusion Direct (Live)</h3>
              <p style={styles.halfCardSubtitle}>Vérification du flux vidéo et de la programmation en direct</p>
            </div>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.5', margin: '14px 0' }}>
            Le direct permet aux téléspectateurs de suivre les éditions spéciales de LIFE CHANNEL TV. Vous pouvez configurer l'URL du flux ou planifier les prochaines émissions.
          </p>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <Link to="/admin/lives" className="btn btn-primary" style={{ fontSize: '12px', padding: '6px 14px' }}>
              Configurer le Direct
            </Link>
            <Link to="/live" className="btn btn-secondary" style={{ fontSize: '12px', padding: '6px 14px' }}>
              <ExternalLink size={13} /> Voir la page Direct
            </Link>
          </div>
        </div>

        <div className="glass-card" style={styles.halfCard}>
          <div style={styles.halfCardHeader}>
            <PlayCircle size={20} style={{ color: '#f59e0b' }} />
            <div>
              <h3 style={styles.halfCardTitle}>Supervision Podcasts & Émissions Audio</h3>
              <p style={styles.halfCardSubtitle}>Gestion des séries, chroniques et épisodes à la demande</p>
            </div>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.5', margin: '14px 0' }}>
            Les podcasts audio permettent aux auditeurs congolais d'écouter les émissions avec une faible consommation de données. Téléchargez de nouveaux fichiers MP3.
          </p>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <Link to="/admin/podcasts" className="btn btn-primary" style={{ fontSize: '12px', padding: '6px 14px' }}>
              Gérer les Épisodes
            </Link>
            <Link to="/podcasts" className="btn btn-secondary" style={{ fontSize: '12px', padding: '6px 14px' }}>
              <ExternalLink size={13} /> Voir les Podcasts
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    padding: '30px 20px 80px',
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '28px',
    borderBottom: '1px solid var(--border-color)',
    paddingBottom: '22px',
    flexWrap: 'wrap',
    gap: '18px',
  },
  badgeRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '10px',
    flexWrap: 'wrap',
  },
  adminBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    background: 'rgba(216, 180, 254, 0.15)',
    border: '1px solid rgba(216, 180, 254, 0.35)',
    color: 'var(--primary)',
    padding: '4px 14px',
    borderRadius: '9999px',
    fontSize: '11px',
    fontWeight: '800',
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
  },
  tzBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    background: 'rgba(217, 119, 6, 0.12)',
    border: '1px solid rgba(217, 119, 6, 0.3)',
    color: '#f59e0b',
    padding: '4px 10px',
    borderRadius: '20px',
    fontSize: '11px',
    fontWeight: '600',
  },
  title: {
    fontSize: '26px',
    fontWeight: '800',
    marginBottom: '6px',
    color: 'var(--text-main)',
  },
  subtitle: {
    fontSize: '14px',
    color: 'var(--text-secondary)',
    lineHeight: '1.4',
  },
  actionButtonGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    flexWrap: 'wrap',
  },
  actionBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '13px',
    fontWeight: '600',
    padding: '9px 18px',
    borderRadius: '8px',
  },
  refreshBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '38px',
    height: '38px',
    padding: 0,
    borderRadius: '8px',
  },
  shortcutsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '14px',
    marginBottom: '28px',
  },
  shortcutCard: {
    padding: '16px',
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    textDecoration: 'none',
    transition: 'all 0.2s ease',
    border: '1px solid var(--border-color)',
    borderRadius: '10px',
  },
  shortcutIcon: {
    width: '42px',
    height: '42px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  shortcutTitle: {
    fontSize: '14px',
    fontWeight: '700',
    color: 'var(--text-main)',
    marginBottom: '2px',
  },
  shortcutDesc: {
    fontSize: '11px',
    color: 'var(--text-secondary)',
    lineHeight: '1.3',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
    gap: '16px',
    marginBottom: '32px',
  },
  statCard: {
    padding: '18px 20px',
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  statIcon: {
    width: '48px',
    height: '48px',
    borderRadius: '12px',
    background: 'rgba(255,255,255,0.03)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    border: '1px solid var(--border-color)',
    flexShrink: 0,
  },
  statLabel: {
    fontSize: '12px',
    color: 'var(--text-muted)',
    marginBottom: '4px',
    fontWeight: '600',
  },
  statValue: {
    fontSize: '22px',
    fontWeight: '800',
    color: 'var(--text-main)',
    lineHeight: '1.2',
  },
  statHint: {
    fontSize: '11px',
    color: 'var(--text-secondary)',
    marginTop: '3px',
  },
  tableCard: {
    padding: '24px',
    marginBottom: '32px',
  },
  tableCardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '20px',
    flexWrap: 'wrap',
    gap: '12px',
  },
  tableCardTitle: {
    fontSize: '20px',
    fontWeight: '800',
    display: 'flex',
    alignItems: 'center',
    marginBottom: '4px',
    color: 'var(--text-main)',
  },
  tableCardSubtitle: {
    fontSize: '13px',
    color: 'var(--text-secondary)',
  },
  filterBar: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    flexWrap: 'wrap',
    padding: '16px',
    background: 'rgba(255,255,255,0.02)',
    borderRadius: '10px',
    border: '1px solid var(--border-color)',
    marginBottom: '20px',
  },
  searchWrapper: {
    position: 'relative',
    flex: '1 1 240px',
  },
  searchIcon: {
    position: 'absolute',
    left: '12px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: 'var(--text-muted)',
    pointerEvents: 'none',
  },
  searchInput: {
    width: '100%',
    padding: '9px 12px 9px 36px',
    borderRadius: '8px',
    background: 'rgba(0,0,0,0.3)',
    border: '1px solid var(--border-color)',
    color: '#fff',
    fontSize: '13px',
    outline: 'none',
  },
  filterGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  filterLabel: {
    fontSize: '12px',
    color: 'var(--text-muted)',
    fontWeight: '600',
    whiteSpace: 'nowrap',
  },
  selectInput: {
    padding: '8px 12px',
    borderRadius: '8px',
    background: 'rgba(0,0,0,0.3)',
    border: '1px solid var(--border-color)',
    color: '#fff',
    fontSize: '13px',
    outline: 'none',
    cursor: 'pointer',
  },
  resetFilterBtn: {
    background: 'none',
    border: '1px solid var(--border-color)',
    color: 'var(--text-secondary)',
    padding: '7px 12px',
    borderRadius: '6px',
    fontSize: '12px',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  emptyContainer: {
    padding: '48px 20px',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tableResponsiveWrapper: {
    width: '100%',
    overflowX: 'auto',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'left',
  },
  tableHeadRow: {
    borderBottom: '1px solid var(--border-color)',
    background: 'rgba(255,255,255,0.02)',
  },
  th: {
    padding: '12px 14px',
    fontSize: '12px',
    fontWeight: '700',
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  tableBodyRow: {
    borderBottom: '1px solid rgba(255,255,255,0.04)',
    transition: 'background-color 0.15s ease',
  },
  td: {
    padding: '14px 14px',
    verticalAlign: 'middle',
    fontSize: '13px',
  },
  thumbnailWrapper: {
    width: '56px',
    height: '42px',
    borderRadius: '6px',
    overflow: 'hidden',
    backgroundColor: 'rgba(20, 15, 13, 0.9)',
    border: '1px solid rgba(192, 192, 192, 0.16)',
    flexShrink: 0,
  },
  thumbnail: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  articleTitleLink: {
    color: 'var(--text-main)',
    fontWeight: '700',
    fontSize: '14px',
    textDecoration: 'none',
    display: 'block',
    marginBottom: '4px',
    lineHeight: '1.35',
  },
  articleExcerpt: {
    color: 'var(--text-secondary)',
    fontSize: '12px',
    lineHeight: '1.4',
    marginBottom: '6px',
  },
  tagsRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '4px',
  },
  tagBadge: {
    fontSize: '10px',
    color: 'var(--text-muted)',
    background: 'rgba(255,255,255,0.04)',
    padding: '2px 6px',
    borderRadius: '4px',
  },
  authorBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    background: 'rgba(107, 79, 56, 0.18)',
    border: '1px solid rgba(192, 192, 192, 0.2)',
    padding: '5px 10px',
    borderRadius: '6px',
  },
  authorName: {
    fontWeight: '700',
    fontSize: '12px',
    color: 'var(--text-main)',
  },
  metaBadges: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  categoryBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    fontSize: '11px',
    fontWeight: '700',
    color: 'var(--primary)',
    background: 'rgba(216, 180, 254, 0.1)',
    border: '1px solid rgba(216, 180, 254, 0.25)',
    padding: '2px 8px',
    borderRadius: '4px',
    width: 'fit-content',
  },
  regionBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    fontSize: '11px',
    color: 'var(--text-secondary)',
    background: 'rgba(255,255,255,0.04)',
    padding: '2px 8px',
    borderRadius: '4px',
    width: 'fit-content',
  },
  dateCell: {
    display: 'flex',
    flexDirection: 'column',
  },
  dateMain: {
    display: 'flex',
    alignItems: 'center',
    fontSize: '12px',
    color: 'var(--text-secondary)',
    fontWeight: '500',
  },
  statusBadgePublished: {
    display: 'inline-block',
    fontSize: '11px',
    fontWeight: '800',
    color: '#10b981',
    background: 'rgba(16, 185, 129, 0.12)',
    border: '1px solid rgba(16, 185, 129, 0.3)',
    padding: '3px 8px',
    borderRadius: '12px',
    letterSpacing: '0.5px',
  },
  statusBadgeSubmitted: {
    display: 'inline-block',
    fontSize: '11px',
    fontWeight: '800',
    color: '#f59e0b',
    background: 'rgba(245, 158, 11, 0.12)',
    border: '1px solid rgba(245, 158, 11, 0.3)',
    padding: '3px 8px',
    borderRadius: '12px',
  },
  statusBadgeDraft: {
    display: 'inline-block',
    fontSize: '11px',
    fontWeight: '800',
    color: '#94a3b8',
    background: 'rgba(148, 163, 184, 0.12)',
    border: '1px solid rgba(148, 163, 184, 0.3)',
    padding: '3px 8px',
    borderRadius: '12px',
  },
  actionsRow: {
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: '6px',
  },
  actionViewBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '11px',
    padding: '5px 10px',
    borderRadius: '6px',
  },
  actionEditBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '28px',
    height: '28px',
    padding: 0,
    borderRadius: '6px',
    color: 'var(--primary)',
  },
  dualSection: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
    gap: '20px',
  },
  halfCard: {
    padding: '22px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  halfCardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  halfCardTitle: {
    fontSize: '16px',
    fontWeight: '700',
    color: 'var(--text-main)',
    marginBottom: '2px',
  },
  halfCardSubtitle: {
    fontSize: '12px',
    color: 'var(--text-muted)',
  },
};

export default Dashboard;
