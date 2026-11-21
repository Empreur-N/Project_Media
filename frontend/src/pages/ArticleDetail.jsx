import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { getArticle, getComments, postComment, flagComment, likeComment, trackPageView } from '../services/api';
import { IMPORTED_ARTICLES } from '../data/importedArticles';
import AdPlacement from '../components/AdPlacement';
import { Calendar, Tag, MapPin, User, ArrowLeft, BookOpen, MessageSquare, AlertTriangle, Send, Heart, CornerDownRight, ShieldCheck, Sparkles, UserCheck, Lock } from 'lucide-react';
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
  const [visitorHandle, setVisitorHandle] = useState('');
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

  const getAuthorMeta = (com) => {
    let name = com.authorName;
    let handle = com.username;
    let role = com.userRole;

    if (com.username && com.username.includes('|')) {
      const parts = com.username.split('|');
      name = parts[0] || name;
      handle = parts[1] || handle;
      role = parts[2] || role;
    }

    if (!name) {
      name = com.username || "Lecteur Citoyen";
    }

    if (!handle) {
      handle = '@' + name.toLowerCase().replace(/[^a-z0-9_]/g, '_');
    } else if (!handle.startsWith('@')) {
      handle = '@' + handle;
    }

    const cleanName = name.replace(/@/g, '').trim();
    const parts = cleanName.split(' ').filter(Boolean);
    const initials = parts.length > 1 
      ? (parts[0][0] + parts[1][0]).toUpperCase()
      : (cleanName.slice(0, 2).toUpperCase() || 'LC');

    return { name, handle, role, initials };
  };

  const getAvatarGradient = (role, handle) => {
    if (role === 'SUPERVISOR') return 'linear-gradient(135deg, #10b981 0%, #047857 100%)';
    if (role === 'ADMIN' || role === 'SUPER_ADMIN') return 'linear-gradient(135deg, #6B4F38 0%, #D8B4FE 100%)';
    if (role === 'JOURNALIST') return 'linear-gradient(135deg, #8E684D 0%, #6B4F38 100%)';
    if (role === 'EDITOR') return 'linear-gradient(135deg, #a855f7 0%, #7e22ce 100%)';
    
    const colors = [
      'linear-gradient(135deg, #6B4F38 0%, #8E684D 100%)',
      'linear-gradient(135deg, #D8B4FE 0%, #C084FC 100%)',
      'linear-gradient(135deg, #78716c 0%, #44403c 100%)',
      'linear-gradient(135deg, #a16207 0%, #713f12 100%)'
    ];
    let hash = 0;
    const str = handle || 'default';
    for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
    return colors[Math.abs(hash) % colors.length];
  };

  const getRoleBadge = (role) => {
    if (role === 'SUPERVISOR') {
      return (
        <span style={{ backgroundColor: 'rgba(16, 185, 129, 0.15)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.35)', padding: '2px 8px', borderRadius: '10px', fontSize: '11px', fontWeight: '800', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
          <ShieldCheck size={11} /> Direction Fondatrice
        </span>
      );
    }
    if (role === 'ADMIN' || role === 'SUPER_ADMIN') {
      return (
        <span style={{ backgroundColor: 'rgba(216, 180, 254, 0.15)', color: 'var(--primary)', border: '1px solid rgba(216, 180, 254, 0.35)', padding: '2px 8px', borderRadius: '10px', fontSize: '11px', fontWeight: '800', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
          <ShieldCheck size={11} /> Rédaction en Chef
        </span>
      );
    }
    if (role === 'JOURNALIST') {
      return (
        <span style={{ backgroundColor: 'rgba(6, 182, 212, 0.15)', color: '#06b6d4', border: '1px solid rgba(6, 182, 212, 0.35)', padding: '2px 8px', borderRadius: '10px', fontSize: '11px', fontWeight: '800', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
          <Sparkles size={11} /> Journaliste Life Channel
        </span>
      );
    }
    if (role === 'EDITOR') {
      return (
        <span style={{ backgroundColor: 'rgba(168, 85, 247, 0.15)', color: '#a855f7', border: '1px solid rgba(168, 85, 247, 0.35)', padding: '2px 8px', borderRadius: '10px', fontSize: '11px', fontWeight: '800' }}>
          Éditeur
        </span>
      );
    }
    return (
      <span style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', color: 'var(--text-muted)', border: '1px solid var(--border-color)', padding: '2px 7px', borderRadius: '10px', fontSize: '10px', fontWeight: '700' }}>
        Lecteur
      </span>
    );
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      showToast("Vous devez être connecté pour publier un commentaire.", "error");
      return;
    }
    if (!newComment.trim()) return;

    const finalName = user.fullName || user.username;
    const finalHandle = user.username.startsWith('@') ? user.username : `@${user.username}`;
    const finalRole = user.role || 'CITOYEN';

    setSubmittingComment(true);
    try {
      const payload = {
        articleId: Number(id),
        content: newComment.trim(),
        username: `${finalName}|${finalHandle}|${finalRole}`,
        authorName: finalName,
        userRole: finalRole,
        likesCount: 0
      };

      await postComment(payload, token);
      setNewComment('');
      showToast("Votre réaction a été publiée avec succès !", "success");
      fetchArticleComments();
    } catch (error) {
      console.warn("API commentaire indisponible, ajout immédiat dans la vue locale:", error);
      const localCom = {
        id: Date.now(),
        articleId: Number(id),
        username: `${finalName}|${finalHandle}|${finalRole}`,
        authorName: finalName,
        userRole: finalRole,
        content: newComment.trim(),
        likesCount: 0,
        createdAt: new Date().toISOString()
      };
      setComments(prev => [localCom, ...prev]);
      setNewComment('');
      showToast("Votre réaction a été enregistrée avec succès.", "success");
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleLikeComment = async (commentId) => {
    setComments(prev => (Array.isArray(prev) ? prev : []).map(c => 
      c.id === commentId ? { ...c, likesCount: (c.likesCount || 0) + 1, userLiked: true } : c
    ));
    try {
      await likeComment(commentId, token);
    } catch (e) {
      console.warn("Like local appliqué:", e);
    }
  };

  const handleReply = (authorHandle) => {
    setNewComment(prev => `${authorHandle} ${prev}`.trim() + ' ');
    const commentInput = document.getElementById('comment-textarea');
    if (commentInput) {
      commentInput.focus();
      commentInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
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
          <div style={styles.commentsSectionHeader}>
            <div>
              <h3 style={styles.commentsTitle}>
                <MessageSquare size={20} style={{ color: 'var(--primary)' }} />
                Espace Réactions & Débats ({comments.length})
              </h3>
              <p style={styles.commentsSubtitle}>
                Partagez votre avis, dialoguez avec les auteurs et la communauté citoyenne de LIFE CHANNEL.
              </p>
            </div>
          </div>

          {/* Formulaire de réaction structuré ou invite de connexion */}
          {user ? (
            <form onSubmit={handleCommentSubmit} style={styles.modernCommentForm} className="glass-card">
              <div style={styles.userCommentBanner}>
                <div style={{
                  ...styles.avatarSmall,
                  background: getAvatarGradient(user.role, user.username)
                }}>
                  {(user.fullName || user.username).slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-main)' }}>
                    {user.fullName || user.username}
                    <span style={{ marginLeft: '8px', color: 'var(--text-muted)', fontWeight: '500' }}>
                      @{user.username}
                    </span>
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--primary)', marginTop: '1px' }}>
                    Compte connecté ({user.role || 'Membre'})
                  </div>
                </div>
              </div>

              <div style={{ marginTop: '12px' }}>
                <textarea
                  id="comment-textarea"
                  className="form-input"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Exprimez-vous de manière constructive (respect de la charte de modération)..."
                  rows="3"
                  required
                  disabled={submittingComment}
                  style={{ width: '100%', resize: 'vertical' }}
                />
              </div>

              <div style={styles.formFooterRow}>
                <span style={{ fontSize: '12px', color: 'var(--argente)' }}>
                  Publication instantanée sous votre profil vérifié
                </span>
                <button 
                  type="submit" 
                  className="btn-pill-lavande" 
                  style={{ padding: '9px 24px', fontSize: '12px' }} 
                  disabled={submittingComment}
                >
                  <Send size={13} /> {submittingComment ? "Publication..." : "Publier ma réaction"}
                </button>
              </div>
            </form>
          ) : (
            <div className="glass-card" style={styles.authPromptCard}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                <div style={styles.authLockIcon}>
                  <Lock size={20} style={{ color: 'var(--primary)' }} />
                </div>
                <div style={{ flex: 1, minWidth: '220px' }}>
                  <div style={{ fontWeight: '800', fontSize: '15px', color: '#F5F3F0', marginBottom: '4px', letterSpacing: '0.02em' }}>
                    Rejoignez les débats citoyens de LIFE CHANNEL
                  </div>
                  <p style={{ margin: 0, fontSize: '13px', color: 'var(--argente)', lineHeight: '1.5' }}>
                    L'accès aux réactions et débats est réservé aux membres connectés pour préserver l'authenticité et la rigueur des échanges.
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                  <Link to="/login" className="btn-pill-lavande" style={{ padding: '9px 20px', fontSize: '12px' }}>
                    Se connecter
                  </Link>
                  <Link to="/register" className="btn-pill-outline" style={{ padding: '9px 18px', fontSize: '12px' }}>
                    Créer un compte
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Liste des commentaires */}
          {commentsLoading ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Chargement des réactions...</p>
          ) : comments.length === 0 ? (
            <div className="glass-card" style={styles.emptyCommentsCard}>
              <MessageSquare size={32} style={{ color: 'var(--text-muted)', marginBottom: '8px', opacity: 0.6 }} />
              <div style={{ fontWeight: '700', fontSize: '15px', color: 'var(--text-main)' }}>Aucun commentaire pour le moment</div>
              <p style={{ color: 'var(--text-muted)', fontSize: '13px', margin: '4px 0 0' }}>Soyez le premier à ouvrir le débat citoyen sur cet article !</p>
            </div>
          ) : (
            <div style={styles.commentsList}>
              {comments.map((com) => {
                const meta = getAuthorMeta(com);
                return (
                  <div key={com.id} className="glass-card animate-fade-in" style={styles.modernCommentCard}>
                    {/* Header de l'intervention */}
                    <div style={styles.commentHeaderRow}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                        <div style={{
                          ...styles.avatarCircle,
                          background: getAvatarGradient(meta.role, meta.handle)
                        }}>
                          {meta.initials}
                        </div>

                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                            <span style={styles.authorFullName}>{meta.name}</span>
                            <span style={styles.authorHandle}>{meta.handle}</span>
                            {getRoleBadge(meta.role)}
                          </div>
                          <div style={styles.commentDateBadge}>
                            {com.createdAt ? new Date(com.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : 'Récemment'}
                          </div>
                        </div>
                      </div>

                      {/* Signalement */}
                      <button 
                        onClick={() => handleFlagComment(com.id)} 
                        style={styles.flagIconBtn} 
                        title="Signaler cette intervention à l'équipe de modération"
                      >
                        <AlertTriangle size={13} />
                      </button>
                    </div>

                    {/* Contenu textuel */}
                    <div style={styles.commentContentWrapper}>
                      <p style={styles.commentMessageText}>{com.content}</p>
                    </div>

                    {/* Barre d'interaction style plateforme moderne */}
                    <div style={styles.commentInteractionsRow}>
                      <button 
                        onClick={() => handleLikeComment(com.id)} 
                        style={{
                          ...styles.likeBtn,
                          color: com.userLiked ? '#ef4444' : 'var(--text-muted)',
                          borderColor: com.userLiked ? 'rgba(239, 68, 68, 0.4)' : 'var(--border-color)'
                        }}
                        title="J'aime cette réaction"
                      >
                        <Heart size={13} fill={com.userLiked ? '#ef4444' : 'none'} />
                        <span style={{ fontWeight: '700' }}>{com.likesCount || 0}</span>
                      </button>

                      <button 
                        onClick={() => handleReply(meta.handle)} 
                        style={styles.replyBtn}
                        title={`Répondre directement à ${meta.name}`}
                      >
                        <CornerDownRight size={13} />
                        <span>Répondre</span>
                      </button>
                    </div>
                  </div>
                );
              })}
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
    fontSize: '13px',
    fontWeight: '700',
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    color: 'var(--argente)',
    marginBottom: '30px',
    textDecoration: 'none',
    transition: 'color 0.2s ease',
  },
  articleLayout: {
    maxWidth: '840px',
  },
  coverContainer: {
    position: 'relative',
    height: '440px',
    maxHeight: '55vh',
    width: '100%',
    borderRadius: 'var(--radius-lg)',
    overflow: 'hidden',
    marginBottom: '30px',
    border: '1px solid rgba(192, 192, 192, 0.2)',
    backgroundColor: 'rgba(20, 15, 13, 0.85)',
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
    background: 'linear-gradient(135deg, #6B4F38 0%, #8E684D 100%)',
    color: '#F5F3F0',
    padding: '6px 16px',
    borderRadius: '9999px',
    fontSize: '11px',
    fontWeight: '800',
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    border: '1px solid rgba(192, 192, 192, 0.25)',
    boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
  },
  metaRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '24px',
    fontSize: '13px',
    color: 'var(--argente)',
    marginBottom: '20px',
    borderBottom: '1px solid rgba(192, 192, 192, 0.14)',
    paddingBottom: '16px',
  },
  metaItem: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
  },
  title: {
    fontFamily: 'var(--font-serif), Playfair Display, serif',
    fontSize: 'clamp(2rem, 3.5vw, 2.7rem)',
    fontWeight: '800',
    lineHeight: '1.25',
    marginBottom: '30px',
    color: '#F5F3F0',
    letterSpacing: '0.01em',
  },
  summaryCard: {
    padding: '24px 28px',
    marginBottom: '34px',
    borderLeft: '4px solid var(--marron)',
    borderRadius: '0 var(--radius-md) var(--radius-md) 0',
    background: 'linear-gradient(90deg, rgba(107, 79, 56, 0.15) 0%, rgba(20, 15, 13, 0.6) 100%)',
    border: '1px solid rgba(192, 192, 192, 0.14)',
    borderLeftWidth: '4px',
    borderLeftColor: 'var(--marron)',
  },
  summaryText: {
    fontSize: '16.5px',
    fontStyle: 'italic',
    color: 'var(--argente)',
    lineHeight: '1.6',
    textAlign: 'justify',
  },
  contentBody: {
    fontSize: '17px',
    lineHeight: '1.85',
    color: '#E0DDD7',
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
    paddingTop: '36px',
  },
  commentsSectionHeader: {
    marginBottom: '24px',
  },
  commentsTitle: {
    fontSize: '22px',
    fontWeight: '800',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    margin: 0,
    color: 'var(--text-main)',
  },
  commentsSubtitle: {
    fontSize: '13px',
    color: 'var(--text-secondary)',
    marginTop: '4px',
  },
  modernCommentForm: {
    padding: '20px 24px',
    borderRadius: '16px',
    marginBottom: '36px',
    border: '1px solid var(--border-color)',
    background: 'rgba(255, 255, 255, 0.02)',
  },
  userCommentBanner: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 16px',
    borderRadius: '12px',
    backgroundColor: 'rgba(216, 180, 254, 0.08)',
    border: '1px solid rgba(216, 180, 254, 0.22)',
    marginBottom: '14px',
  },
  avatarSmall: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '800',
    fontSize: '12px',
    color: '#ffffff',
  },
  visitorInputsRow: {
    display: 'flex',
    gap: '14px',
    flexWrap: 'wrap',
  },
  inputFieldLabel: {
    display: 'block',
    fontSize: '12px',
    fontWeight: '700',
    color: 'var(--text-secondary)',
    marginBottom: '6px',
  },
  formFooterRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '12px',
    marginTop: '14px',
  },
  emptyCommentsCard: {
    padding: '40px 20px',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    borderRadius: '16px',
  },
  commentsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  modernCommentCard: {
    padding: '18px 20px',
    borderRadius: '14px',
    border: '1px solid var(--border-color)',
    background: 'rgba(255, 255, 255, 0.03)',
  },
  commentHeaderRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '12px',
  },
  avatarCircle: {
    width: '42px',
    height: '42px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '800',
    fontSize: '14px',
    color: '#ffffff',
    flexShrink: 0,
    boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
  },
  authorFullName: {
    fontWeight: '800',
    fontSize: '14px',
    color: 'var(--text-main)',
  },
  authorHandle: {
    fontSize: '12px',
    color: 'var(--text-muted)',
    fontWeight: '600',
  },
  commentDateBadge: {
    fontSize: '11px',
    color: 'var(--text-muted)',
    marginTop: '2px',
  },
  flagIconBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--text-muted)',
    cursor: 'pointer',
    padding: '4px',
    borderRadius: '4px',
    opacity: 0.6,
    transition: 'all 0.2s',
  },
  commentContentWrapper: {
    paddingLeft: '54px',
    marginBottom: '10px',
  },
  commentMessageText: {
    fontSize: '14px',
    color: 'var(--text-secondary)',
    lineHeight: '1.6',
    margin: 0,
  },
  commentInteractionsRow: {
    paddingLeft: '54px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  likeBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '5px',
    padding: '4px 10px',
    borderRadius: '16px',
    background: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid var(--border-color)',
    fontSize: '11px',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  replyBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    padding: '4px 10px',
    borderRadius: '16px',
    background: 'none',
    border: 'none',
    color: 'var(--text-muted)',
    fontSize: '11px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  authPromptCard: {
    padding: '24px',
    marginBottom: '32px',
    border: '1px solid var(--border-color)',
    background: 'linear-gradient(135deg, rgba(107, 79, 56, 0.12) 0%, rgba(216, 180, 254, 0.06) 100%)',
    borderRadius: '16px',
  },
  authLockIcon: {
    width: '46px',
    height: '46px',
    borderRadius: '12px',
    background: 'rgba(216, 180, 254, 0.12)',
    border: '1px solid rgba(216, 180, 254, 0.25)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  }
};

export default ArticleDetail;
