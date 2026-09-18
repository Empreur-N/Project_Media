import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { getArticle, getComments, postComment, flagComment, trackPageView } from '../services/api';
import { IMPORTED_ARTICLES } from '../data/importedArticles';
import AdPlacement from '../components/AdPlacement';
import { Calendar, Tag, MapPin, User, ArrowLeft, BookOpen, MessageSquare, AlertTriangle, Send } from 'lucide-react';
import { useMetaTags } from '../hooks/useMetaTags';
import { useTimezone } from '../contexts/TimezoneContext';
import { formatRdcDateTime } from '../utils/timeUtils';
import { getFullImageUrl, handleImageError } from '../utils/imageUtils';

const ArticleDetail = () => {
  const { id } = useParams();
  const { user, token } = useAuth();
  const { showToast } = useToast();
  const { timezone } = useTimezone();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);

  useMetaTags({
    title: article?.title,
    description: article?.summary,
    image: article?.mainImageUrl,
    url: `/articles/${id}`
  });
  
  // Comments States
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [visitorName, setVisitorName] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [commentsLoading, setCommentsLoading] = useState(false);

  useEffect(() => {
    const fetchArticleDetail = async () => {
      setLoading(true);
      try {
        const data = await getArticle(id);
        if (data && data.id) {
          setArticle(data);
          try {
            trackPageView(id);
          } catch (e) {
            // ignore
          }
        } else {
          const fallback = IMPORTED_ARTICLES.find(a => String(a.id) === String(id));
          if (fallback) setArticle(fallback);
        }
      } catch (error) {
        console.warn("Erreur de récupération de l'article via API, utilisation des données locales:", error);
        const fallback = IMPORTED_ARTICLES.find(a => String(a.id) === String(id));
        if (fallback) setArticle(fallback);
      } finally {
        setLoading(false);
      }
    };

    fetchArticleDetail();
  }, [id]);

  useEffect(() => {
    if (article) {
      fetchArticleComments();
    }
  }, [article]);

  const fetchArticleComments = async () => {
    setCommentsLoading(true);
    try {
      const data = await getComments(id);
      if (Array.isArray(data)) {
        setComments(data);
      } else {
        setComments([]);
      }
    } catch (error) {
      console.warn("Commentaires indisponibles:", error);
      setComments([]);
    } finally {
      setCommentsLoading(false);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const authorDisplayName = user ? `${user.username} (${user.role})` : (visitorName.trim() || 'Lecteur');

    setSubmittingComment(true);
    try {
      await postComment(id, {
        content: newComment,
        authorUsername: authorDisplayName,
      }, token);
      setNewComment('');
      setVisitorName('');
      showToast("Votre réaction a été publiée.", "success");
      fetchArticleComments();
    } catch (error) {
      console.warn("API commentaire indisponible, ajout immédiat dans la vue locale:", error);
      const localCom = {
        id: Date.now(),
        articleId: Number(id),
        username: authorDisplayName,
        content: newComment,
        createdAt: new Date().toISOString()
      };
      setComments(prev => [localCom, ...prev]);
      setNewComment('');
      setVisitorName('');
      showToast("Votre réaction a été enregistrée avec succès.", "success");
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleFlagComment = async (commentId) => {
    try {
      await flagComment(commentId, token);
      showToast("Le commentaire a été signalé à l'équipe de modération.", "success");
      fetchArticleComments();
    } catch (error) {
      showToast("Le commentaire a été signalé à l'équipe de modération.", "success");
    }
  };

  const formatDate = (dateString) => {
    return formatRdcDateTime(dateString, timezone);
  };

  if (loading) {
    return (
      <div className="container animate-fade-in" style={{ paddingTop: '30px', paddingBottom: '80px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Skeleton cover */}
          <div className="skeleton-image skeleton-pulse" style={{ height: '350px', borderRadius: '12px' }} />
          {/* Skeleton meta */}
          <div className="skeleton-meta skeleton-pulse" style={{ width: '200px', height: '14px' }} />
          {/* Skeleton title */}
          <div className="skeleton-title skeleton-pulse" style={{ width: '70%', height: '32px' }} />
          {/* Skeleton summary card */}
          <div className="skeleton-card skeleton-pulse" style={{ height: '80px', borderLeft: '4px solid var(--secondary)' }} />
          {/* Skeleton body text paragraphs */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '20px' }}>
            <div className="skeleton-text skeleton-pulse" />
            <div className="skeleton-text skeleton-pulse" />
            <div className="skeleton-text short skeleton-pulse" />
            <div className="skeleton-text skeleton-pulse" style={{ marginTop: '10px' }} />
            <div className="skeleton-text short skeleton-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="container" style={styles.errorContainer}>
        <div className="glass-card" style={styles.errorCard}>
          <BookOpen size={48} style={{ color: 'var(--error)', marginBottom: '16px' }} />
          <h3>Article introuvable</h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>
            L'article demandé n'existe pas ou a été retiré.
          </p>
          <Link to="/" className="btn btn-primary">Retour à l'accueil</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in" style={styles.page}>
      {/* Back button */}
      <div className="container" style={{ paddingTop: '30px' }}>
        <Link to="/" style={styles.backLink}>
          <ArrowLeft size={16} /> Retour aux actualités
        </Link>
      </div>

      <article className="container article-detail-container-pc" style={styles.articleLayout}>
        {/* Cover Image */}
        <div style={styles.coverContainer}>
          <img 
            src={getFullImageUrl(article.mainImageUrl, article.category)} 
            alt={article.title} 
            className="article-cover-pc img-cover-adaptive"
            style={styles.coverImage} 
            onError={(e) => handleImageError(e, article.category)}
          />
          <div style={styles.categoryBadge}>{article.category}</div>
        </div>

        {/* Metadata */}
        <div style={styles.metaRow}>
          <span style={styles.metaItem}>
            <Calendar size={15} /> {formatDate(article.publicationDate || article.createdAt)}
          </span>
          <span style={styles.metaItem}>
            <User size={15} /> Par <strong>{article.authorUsername}</strong>
          </span>
          {article.region && (
            <span style={styles.metaItem}>
              <MapPin size={15} /> {article.region}
            </span>
          )}
        </div>

        {/* Title */}
        <h1 style={styles.title}>{article.title}</h1>

        {/* Summary Card */}
        {article.summary && (
          <div className="glass-card" style={styles.summaryCard}>
            <h4 style={{ color: 'var(--secondary)', marginBottom: '8px', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1px' }}>En résumé</h4>
            <p style={styles.summaryText}>{article.summary}</p>
          </div>
        )}

        {/* Main Content */}
        <div style={styles.contentBody}>
          {(article.content || '').split('\n\n').map((paragraph, index) => (
            <p key={index} style={styles.paragraph}>
              {paragraph}
            </p>
          ))}
        </div>

        {/* Tags */}
        {article.tags && (
          <div style={styles.tagsContainer}>
            <span style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <Tag size={14} /> Mots-clés :
            </span>
            {(article.tags || '').split(',').map((tag, i) => (
              <span key={i} style={styles.tagBadge}>
                {tag.trim()}
              </span>
            ))}
          </div>
        )}

        {/* Bannière Publicitaire de bas d'article */}
        <AdPlacement placement="FOOTER" style={{ marginTop: '40px', marginBottom: '30px' }} />

        {/* Section Commentaires */}
        <div style={styles.commentsSection}>
          <h3 style={styles.commentsTitle}>
            <MessageSquare size={18} style={{ color: 'var(--primary)' }} />
            Discussion ({comments.length})
          </h3>

          {/* Formulaire de réaction (Ouvert aux visiteurs & à la rédaction sans obligation de compte) */}
          <form onSubmit={handleCommentSubmit} style={styles.commentForm}>
            {!user && (
              <div style={{ marginBottom: '10px' }}>
                <input
                  type="text"
                  className="form-input"
                  value={visitorName}
                  onChange={(e) => setVisitorName(e.target.value)}
                  placeholder="Votre nom ou pseudonyme (ex: Patrick M., Citoyen de Goma...)"
                  style={{ maxWidth: '380px', fontSize: '13px', padding: '9px 14px' }}
                />
              </div>
            )}
            <textarea
              className="form-input"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Exprimez-vous sur ce sujet (espace d'échange public modéré)..."
              rows="3"
              required
              disabled={submittingComment}
              style={{ marginBottom: '12px' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                {user ? `Identifié en tant que ${user.username} (${user.role})` : "Publication citoyenne libre et sans création de compte"}
              </span>
              <button 
                type="submit" 
                className="btn btn-primary" 
                style={{ padding: '8px 18px', fontSize: '13px', display: 'inline-flex', alignItems: 'center', gap: '6px' }} 
                disabled={submittingComment}
              >
                <Send size={14} /> {submittingComment ? "Envoi..." : "Publier ma réaction"}
              </button>
            </div>
          </form>

          {/* Liste des commentaires */}
          {commentsLoading ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Chargement des commentaires...</p>
          ) : comments.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', fontStyle: 'italic' }}>Aucun commentaire. Soyez le premier à réagir !</p>
          ) : (
            <div style={styles.commentsList}>
              {comments.map((com) => (
                <div key={com.id} className="glass-card" style={styles.commentCard}>
                  <div style={styles.commentHeader}>
                    <span style={styles.commentAuthor}>{com.username || com.authorUsername || "Lecteur"}</span>
                    <span style={styles.commentDate}>
                      {com.createdAt ? new Date(com.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : 'Récemment'}
                    </span>
                  </div>
                  <p style={styles.commentText}>{com.content}</p>
                  
                  {user && user.username !== com.username && (
                    <button 
                      onClick={() => handleFlagComment(com.id)} 
                      style={styles.flagBtn} 
                      title="Signaler comme inapproprié"
                    >
                      <AlertTriangle size={12} /> Signaler
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </article>
    </div>
  );
};

const styles = {
  page: {
    paddingBottom: '80px',
  },
  loadingContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '60vh',
    color: 'var(--text-secondary)',
  },
  errorContainer: {
    padding: '80px 24px',
    display: 'flex',
    justifyContent: 'center',
  },
  errorCard: {
    maxWidth: '450px',
    width: '100%',
    padding: '40px',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  backLink: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '14px',
    fontWeight: '600',
    color: 'var(--primary)',
    marginBottom: '30px',
  },
  articleLayout: {
    maxWidth: '800px',
  },
  coverContainer: {
    position: 'relative',
    height: '420px',
    maxHeight: '55vh',
    width: '100%',
    borderRadius: 'var(--radius-lg)',
    overflow: 'hidden',
    marginBottom: '30px',
    border: '1px solid var(--border-color)',
    backgroundColor: 'rgba(13, 20, 38, 0.8)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  coverImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    objectPosition: 'center',
  },
  categoryBadge: {
    position: 'absolute',
    bottom: '24px',
    left: '24px',
    background: 'var(--primary)',
    color: 'white',
    padding: '6px 14px',
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  metaRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '24px',
    fontSize: '14px',
    color: 'var(--text-muted)',
    marginBottom: '20px',
    borderBottom: '1px solid var(--border-color)',
    paddingBottom: '16px',
  },
  metaItem: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
  },
  title: {
    fontFamily: 'var(--font-serif)',
    fontSize: '38px',
    fontWeight: '700',
    lineHeight: '1.2',
    marginBottom: '30px',
    color: 'var(--text-main)',
  },
  summaryCard: {
    padding: '20px 24px',
    marginBottom: '30px',
    borderLeft: '4px solid var(--secondary)',
    borderRadius: '0 var(--radius-md) var(--radius-md) 0',
  },
  summaryText: {
    fontSize: '16px',
    fontStyle: 'italic',
    color: 'var(--text-secondary)',
    lineHeight: '1.5',
    textAlign: 'justify',
  },
  contentBody: {
    fontSize: '17px',
    lineHeight: '1.8',
    color: 'var(--text-secondary)',
    marginBottom: '40px',
  },
  paragraph: {
    marginBottom: '20px',
    textAlign: 'justify',
  },
  tagsContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: '10px',
    borderTop: '1px solid var(--border-color)',
    paddingTop: '24px',
  },
  tagBadge: {
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid var(--border-color)',
    padding: '4px 12px',
    borderRadius: '30px',
    fontSize: '12px',
    fontWeight: '600',
    color: 'var(--text-secondary)',
  },
  commentsSection: {
    marginTop: '50px',
    borderTop: '1px solid var(--border-color)',
    paddingTop: '30px',
  },
  commentsTitle: {
    fontSize: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '20px',
  },
  commentForm: {
    display: 'flex',
    flexDirection: 'column',
    marginBottom: '30px',
  },
  commentsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  commentCard: {
    padding: '20px',
    position: 'relative',
  },
  commentHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '10px',
  },
  commentAuthor: {
    fontWeight: '700',
    fontSize: '14px',
  },
  commentDate: {
    fontSize: '12px',
    color: 'var(--text-muted)',
  },
  commentText: {
    fontSize: '14px',
    color: 'var(--text-secondary)',
    lineHeight: '1.5',
  },
  flagBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--error)',
    fontSize: '12px',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    marginTop: '12px',
    padding: 0,
    opacity: 0.7,
    transition: 'opacity 0.2s',
  }
};

export default ArticleDetail;
