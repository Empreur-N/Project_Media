import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getArticlesByAuthor, getArticles, getArticle, createArticle, updateArticle, submitArticle, publishArticleDirectly, uploadMedia } from '../services/api';
import { IMPORTED_ARTICLES } from '../data/importedArticles';
import { FileText, Send, Edit, Image as ImageIcon, CheckCircle, AlertCircle, PlusCircle, List, UserCheck, Globe, LifeBuoy } from 'lucide-react';

const JournalistSpace = () => {
  const { user, token } = useAuth();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('edit');
  
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('list'); // 'list' or 'form'
  
  // Form State
  const [articleId, setArticleId] = useState(null);
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('Politique');
  const [region, setRegion] = useState('Kinshasa');
  const [tags, setTags] = useState('');
  const [mainImageUrl, setMainImageUrl] = useState('');
  
  // Planification éditoriale & Spécificité Fuseaux RDC (Article 46)
  const [scheduledDate, setScheduledDate] = useState('');
  const [planningTimezone, setPlanningTimezone] = useState('Africa/Kinshasa');
  
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' }); // 'success' or 'error'

  const categories = ["Politique", "Économie", "Société", "Sport", "Culture", "Technologie", "Santé", "Environnement"];
  const regions = ["Kinshasa", "Haut-Katanga", "Lualaba", "Nord-Kivu", "Sud-Kivu", "Kongo-Central"];

  const fetchMyArticles = async () => {
    setLoading(true);
    try {
      let data = await getArticlesByAuthor(user.username, token);
      if ((!data || !Array.isArray(data) || data.length === 0) && (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN')) {
        // En tant qu'administrateur, si aucun brouillon personnel n'est trouvé, afficher l'ensemble des publications
        const all = await getArticles(null, null, null, token);
        data = (all && Array.isArray(all) && all.length > 0) ? all : IMPORTED_ARTICLES;
      }
      setArticles(data || []);
    } catch (error) {
      console.error("Erreur de chargement des articles:", error);
      if (user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN') {
        setArticles(IMPORTED_ARTICLES);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchMyArticles();
    }
  }, [user]);

  // Si un paramètre ?edit=ID est passé dans l'URL, charger directement l'article en mode édition
  useEffect(() => {
    if (editId) {
      const loadForEdit = async () => {
        let art = articles.find(a => String(a.id) === String(editId));
        if (!art) {
          art = IMPORTED_ARTICLES.find(a => String(a.id) === String(editId));
        }
        if (!art) {
          try {
            art = await getArticle(editId, token);
          } catch (e) {
            console.warn("Impossible de charger l'article spécifié:", e);
          }
        }
        if (art) {
          handleEditClick(art);
        }
      };
      loadForEdit();
    }
  }, [editId, articles]);

  const showMessage = (text, type = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 5000);
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUploadImage = async () => {
    if (!selectedFile) {
      showMessage("Veuillez sélectionner un fichier d'abord", "error");
      return;
    }
    setUploading(true);
    try {
      const media = await uploadMedia(selectedFile, null, token);
      setMainImageUrl(media.fileUrl);
      showMessage("Image de couverture téléchargée avec succès !");
    } catch (error) {
      showMessage("Erreur lors du téléchargement de l'image: " + error.message, "error");
    } finally {
      setUploading(false);
    }
  };

  const resetForm = () => {
    setArticleId(null);
    setTitle('');
    setSummary('');
    setContent('');
    setCategory('Politique');
    setRegion('Kinshasa');
    setTags('');
    setMainImageUrl('');
    setScheduledDate('');
    setPlanningTimezone('Africa/Kinshasa');
    setSelectedFile(null);
  };

  const handleSave = async (e, targetStatus = 'DRAFT') => {
    if (e && e.preventDefault) e.preventDefault();
    if (!title || !content || !category) {
      showMessage("Veuillez remplir les champs obligatoires (Titre, Contenu, Catégorie)", "error");
      return;
    }

    // Conversion UTC stricte selon le fuseau de référence sélectionné (Article 46)
    let utcPublicationDate = null;
    if (scheduledDate) {
      const tzOffset = planningTimezone === 'Africa/Lubumbashi' ? '+02:00' : '+01:00';
      const parsed = new Date(scheduledDate + ':00' + tzOffset);
      if (!isNaN(parsed.getTime())) {
        utcPublicationDate = parsed.toISOString();
      }
    } else if (targetStatus === 'PUBLISHED') {
      utcPublicationDate = new Date().toISOString();
    }

    const payload = {
      title,
      summary,
      content,
      category,
      region,
      tags,
      mainImageUrl,
      publicationDate: utcPublicationDate,
      authorUsername: user.username,
      status: targetStatus
    };

    try {
      if (articleId) {
        // Mode modification
        await updateArticle(articleId, payload, token);
        if (targetStatus === 'PUBLISHED') {
          await publishArticleDirectly(articleId, token);
          showMessage("Article publié en direct avec succès ! La direction a été notifiée.");
        } else {
          showMessage("Brouillon mis à jour avec succès !");
        }
      } else {
        // Mode création
        await createArticle(payload, token);
        if (targetStatus === 'PUBLISHED') {
          showMessage("Article mis en ligne immédiatement ! La direction a été notifiée.");
        } else {
          showMessage("Nouveau brouillon enregistré !");
        }
      }
      resetForm();
      setView('list');
      fetchMyArticles();
    } catch (error) {
      showMessage(error.message, "error");
    }
  };

  const handleDirectPublish = async (id) => {
    try {
      await publishArticleDirectly(id, token);
      showMessage("Article mis en ligne immédiatement avec succès ! La direction a été notifiée.");
      fetchMyArticles();
    } catch (error) {
      showMessage(error.message, "error");
    }
  };

  const handleEditClick = (article) => {
    setArticleId(article.id);
    setTitle(article.title);
    setSummary(article.summary || '');
    setContent(article.content);
    setCategory(article.category);
    setRegion(article.region || 'Kinshasa');
    setTags(article.tags || '');
    setMainImageUrl(article.mainImageUrl || '');

    if (article.publicationDate) {
      const d = new Date(article.publicationDate);
      const pad = (n) => String(n).padStart(2, '0');
      const localStr = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
      setScheduledDate(localStr);
    } else {
      setScheduledDate('');
    }

    setView('form');
  };

  const handleSubmitToReview = async (id) => {
    try {
      await submitArticle(id, token);
      showMessage("Article soumis au Rédacteur en Chef pour relecture !");
      fetchMyArticles();
    } catch (error) {
      showMessage(error.message, "error");
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'DRAFT': return { color: '#94a3b8', background: 'rgba(148,163,184,0.1)' };
      case 'SUBMITTED': return { color: '#D8B4FE', background: 'rgba(216,180,254,0.15)' };
      case 'REVISION_REQUIRED': return { color: '#ef4444', background: 'rgba(239,68,68,0.1)' };
      case 'PUBLISHED': return { color: '#10b981', background: 'rgba(16,185,129,0.1)' };
      default: return { color: 'white', background: 'rgba(255,255,255,0.1)' };
    }
  };

  return (
    <div className="container animate-fade-in" style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Espace Journaliste</h1>
          <p style={styles.subtitle}>Gérez vos articles, rédigez de nouvelles actualités et suivez vos publications</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Link 
            to="/admin/messages?category=TECH_SUPPORT" 
            className="btn btn-secondary" 
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}
            title="Poser une question technique ou contacter l'administration"
          >
            <LifeBuoy size={16} style={{ color: 'var(--primary)' }} />
            <span>Support & Direction</span>
          </Link>
          {view === 'list' ? (
            <button className="btn btn-primary" onClick={() => { resetForm(); setView('form'); }}>
              <PlusCircle size={18} /> Rédiger un Article
            </button>
          ) : (
            <button className="btn btn-secondary" onClick={() => setView('list')}>
              <List size={18} /> Liste de mes Articles
            </button>
          )}
        </div>
      </div>

      {/* Messages */}
      {message.text && (
        <div style={{
          ...styles.alert,
          backgroundColor: message.type === 'error' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
          borderColor: message.type === 'error' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)',
          color: message.type === 'error' ? 'var(--error)' : 'var(--accent)'
        }}>
          {message.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle size={18} />}
          <span>{message.text}</span>
        </div>
      )}

      {/* Main Panel */}
      {view === 'list' ? (
        <div className="glass-card" style={styles.panel}>
          <h2 style={styles.panelTitle}>
            {user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN' 
              ? 'Supervision & Rédaction des Articles' 
              : 'Mes Publications'}
          </h2>
          {loading ? (
            <p style={{ color: 'var(--text-muted)' }}>Chargement...</p>
          ) : articles.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <FileText size={48} style={{ color: 'var(--text-muted)', marginBottom: '16px' }} />
              <h3>Aucun article</h3>
              <p style={{ color: 'var(--text-muted)' }}>Vous n'avez pas encore rédigé d'articles.</p>
            </div>
          ) : (
            <div style={styles.tableContainer}>
              <table style={styles.table}>
                <thead>
                  <tr style={styles.tr}>
                    <th style={styles.th}>Titre</th>
                    {(user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN') && (
                      <th style={styles.th}>Auteur / Rédaction</th>
                    )}
                    <th style={styles.th}>Catégorie</th>
                    <th style={styles.th}>Région</th>
                    <th style={styles.th}>Statut</th>
                    <th style={styles.th}>Date</th>
                    <th style={styles.th}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {articles.map((art) => (
                    <tr key={art.id} style={styles.trBody}>
                      <td style={{ ...styles.td, fontWeight: '600' }}>{art.title}</td>
                      {(user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN') && (
                        <td style={styles.td}>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '12px', fontWeight: '700', color: 'var(--primary)' }}>
                            <UserCheck size={13} /> {art.authorUsername || user.username}
                          </span>
                        </td>
                      )}
                      <td style={styles.td}>{art.category}</td>
                      <td style={styles.td}>{art.region || '-'}</td>
                      <td style={styles.td}>
                        <span style={{ ...styles.statusBadge, ...getStatusStyle(art.status) }}>
                          {art.status}
                        </span>
                      </td>
                      <td style={styles.td}>{new Date(art.createdAt || art.publicationDate).toLocaleDateString('fr-FR')}</td>
                      <td style={styles.td}>
                        <div style={styles.actionRow}>
                          {(art.status === 'DRAFT' || art.status === 'REVISION_REQUIRED' || user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN') && (
                            <button onClick={() => handleEditClick(art)} className="btn btn-secondary" style={styles.smallBtn}>
                              <Edit size={14} /> Modifier
                            </button>
                          )}
                          {(art.status === 'DRAFT' || art.status === 'REVISION_REQUIRED' || art.status === 'SUBMITTED') && (
                            <button 
                              onClick={() => handleDirectPublish(art.id)} 
                              className="btn btn-primary" 
                              style={{ ...styles.smallBtn, background: 'linear-gradient(135deg, #E5A93C 0%, #D97706 100%)', color: '#1a1412', fontWeight: '700' }}
                              title="Mettre immédiatement cet article en ligne"
                            >
                              <Globe size={13} /> Mettre en ligne
                            </button>
                          )}
                          {art.status === 'PUBLISHED' && user?.role !== 'ADMIN' && user?.role !== 'SUPER_ADMIN' && (
                            <span style={{ fontSize: '13px', color: 'var(--accent)' }}>En ligne</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        /* Form Creation */
        <div className="glass-card" style={styles.panel}>
          <h2 style={styles.panelTitle}>{articleId ? "Modifier l'article" : "Rédiger un nouvel article"}</h2>
          <form onSubmit={handleSaveDraft}>
            <div style={styles.formGrid}>
              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label className="form-label">Titre de l'article *</label>
                <input
                  type="text"
                  className="form-input"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Saisissez un titre percutant"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Catégorie *</label>
                <select className="form-input" value={category} onChange={(e) => setCategory(e.target.value)}>
                  {categories.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Région</label>
                <select className="form-input" value={region} onChange={(e) => setRegion(e.target.value)}>
                  <option value="">Aucune région</option>
                  {regions.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>

              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label className="form-label">Mots-clés (séparés par des virgules)</label>
                <input
                  type="text"
                  className="form-input"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="Ex: Politique, Élections, Kinshasa"
                />
              </div>

              {/* Planification éditoriale & Spécificité Fuseaux RDC (Article 46) */}
              <div className="form-group">
                <label className="form-label">Programmer la publication (Date & Heure)</label>
                <input
                  type="datetime-local"
                  className="form-input"
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Fuseau de référence (RDC)</label>
                <select
                  className="form-input"
                  value={planningTimezone}
                  onChange={(e) => setPlanningTimezone(e.target.value)}
                >
                  <option value="Africa/Kinshasa">Kinshasa / Ouest (WAT - UTC+1)</option>
                  <option value="Africa/Lubumbashi">Lubumbashi / Goma / Est (CAT - UTC+2)</option>
                </select>
              </div>

              {/* Cover Image upload (Media Service Integration) */}
              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label className="form-label">Image Principale / Couverture</label>
                <div style={styles.uploadRow}>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    style={styles.fileInput}
                  />
                  <button
                    type="button"
                    onClick={handleUploadImage}
                    className="btn btn-secondary"
                    disabled={uploading || !selectedFile}
                  >
                    <ImageIcon size={16} /> {uploading ? "Upload..." : "Télécharger"}
                  </button>
                </div>
                {mainImageUrl && (
                  <div style={styles.imageUrlDisplay}>
                    <span>URL de l'image de couverture : <code>{mainImageUrl}</code></span>
                  </div>
                )}
              </div>

              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label className="form-label">Résumé de l'article (max. 1000 caractères)</label>
                <textarea
                  className="form-input"
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  rows="3"
                  placeholder="Saisissez une brève description ou accroche pour l'article"
                  maxLength="1000"
                />
              </div>

              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label className="form-label">Contenu de l'article *</label>
                <textarea
                  className="form-input"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows="12"
                  placeholder="Rédigez le corps de l'article. Utilisez des doubles retours à la ligne pour créer des paragraphes."
                  required
                />
              </div>
            </div>

            <div style={styles.formActions}>
              <button type="button" className="btn btn-secondary" onClick={() => setView('list')}>
                Annuler
              </button>
              <button 
                type="button" 
                className="btn btn-secondary"
                onClick={(e) => handleSave(e, 'DRAFT')}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
              >
                <FileText size={16} /> Enregistrer comme Brouillon
              </button>
              <button 
                type="button" 
                className="btn btn-primary"
                onClick={(e) => handleSave(e, 'PUBLISHED')}
                style={{ 
                  display: 'inline-flex', 
                  alignItems: 'center', 
                  gap: '8px',
                  background: 'linear-gradient(135deg, #E5A93C 0%, #D97706 100%)',
                  color: '#1a1412',
                  fontWeight: '800',
                  boxShadow: '0 4px 16px rgba(229, 169, 60, 0.3)'
                }}
              >
                <Globe size={16} /> Publier immédiatement en ligne
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    padding: '40px 24px 80px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  alert: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    border: '1px solid',
    padding: '12px 16px',
    borderRadius: '8px',
    marginBottom: '20px',
    fontSize: '14px',
  },
  panel: {
    padding: '30px',
  },
  panelTitle: {
    fontSize: '20px',
    marginBottom: '24px',
  },
  tableContainer: {
    overflowX: 'auto',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'left',
  },
  tr: {
    borderBottom: '1px solid var(--border-color)',
  },
  th: {
    padding: '12px 16px',
    color: 'var(--text-muted)',
    fontSize: '14px',
    fontWeight: '600',
  },
  trBody: {
    borderBottom: '1px solid rgba(255,255,255,0.02)',
    transition: 'background 0.2s',
  },
  td: {
    padding: '16px',
    fontSize: '14px',
  },
  statusBadge: {
    fontSize: '11px',
    fontWeight: '700',
    padding: '3px 8px',
    borderRadius: '4px',
    textTransform: 'uppercase',
  },
  actionRow: {
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
  },
  smallBtn: {
    padding: '6px 12px',
    fontSize: '12px',
    borderRadius: '6px',
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '20px',
  },
  uploadRow: {
    display: 'flex',
    gap: '12px',
    alignItems: 'center',
  },
  fileInput: {
    flex: 1,
    padding: '8px 12px',
    background: 'rgba(255,255,255,0.02)',
    border: '1px solid var(--border-color)',
    borderRadius: '8px',
    color: 'var(--text-main)',
  },
  imageUrlDisplay: {
    marginTop: '8px',
    fontSize: '12px',
    color: 'var(--text-muted)',
  },
  formActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
    marginTop: '30px',
    borderTop: '1px solid var(--border-color)',
    paddingTop: '20px',
  }
};

export default JournalistSpace;
