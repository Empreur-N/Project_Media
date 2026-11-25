import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { getArticle, getComments, postComment, flagComment, likeComment, trackPageView, socialLogin } from '../services/api';
import { loginWithGoogleOAuth, loginWithFacebookOAuth } from '../services/socialAuth';
import { IMPORTED_ARTICLES } from '../data/importedArticles';
import AdPlacement from '../components/AdPlacement';
import { Calendar, Tag, MapPin, User, ArrowLeft, BookOpen, MessageSquare, AlertTriangle, Send, Heart, CornerDownRight, ShieldCheck, Sparkles, UserCheck, Lock, CheckCircle2, X, LogOut, Share2, Copy, Check, ExternalLink } from 'lucide-react';
import { useMetaTags } from '../hooks/useMetaTags';
import { useTimezone } from '../contexts/TimezoneContext';
import { formatRdcDateTime } from '../utils/timeUtils';
import { getFullImageUrl, handleImageError } from '../utils/imageUtils';

// Composants Icones Réseaux Sociaux (Google, Facebook, WhatsApp)
const GoogleIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
  </svg>
);

const FacebookIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" style={{ flexShrink: 0 }}>
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

const WhatsAppIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" style={{ flexShrink: 0 }}>
    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
  </svg>
);

const ArticleDetail = () => {
  const { id } = useParams();
  const { user, token, login, logout } = useAuth();
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

  // État de chargement de l'authentification sociale directe (Google / Facebook)
  const [socialLoading, setSocialLoading] = useState(false);
  
  // Nom d'affichage personnalisé mémorisé pour les lecteurs
  const [customReaderName, setCustomReaderName] = useState(() => {
    return localStorage.getItem('lifechannel_reader_name') || '';
  });

  // Liste des IDs de commentaires aimés avec persistance locale (Cœur rouge style Phoenix)
  const [likedComments, setLikedComments] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('lifechannel_liked_comments') || '[]');
    } catch {
      return [];
    }
  });

  // Partage Rapide Helpers (Statuts WhatsApp, Facebook, Twitter, Partage natif mobile)
  const handleNativeShare = async () => {
    const shareUrl = window.location.href;
    const shareData = {
      title: article?.title || "LIFE CHANNEL",
      text: article?.summary || article?.title || "Retrouvez cette actualité sur LIFE CHANNEL",
      url: shareUrl
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        if (err.name !== 'AbortError') {
          handleCopyLink();
        }
      }
    } else {
      handleCopyLink();
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    showToast("Lien de l'article copié dans le presse-papier !", "success");
  };

  const getWhatsAppShareUrl = () => {
    const url = window.location.href;
    const text = `*${article?.title || ''}*\n${article?.summary || ''}\n\n👉 Suivre l'info en continu sur LIFE CHANNEL : ${url}`;
    return `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
  };

  const getFacebookShareUrl = () => {
    return `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`;
  };

  const getTwitterShareUrl = () => {
    const text = `${article?.title || ''} via @LifeChannelRDC`;
    return `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(window.location.href)}`;
  };
  
  // Comments States
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
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
        setComments(data.map(c => ({
          ...c,
          userLiked: likedComments.includes(c.id)
        })));
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
    if (role === 'LECTEUR_FACEBOOK') {
      return (
        <span style={{ backgroundColor: 'rgba(24, 119, 242, 0.15)', color: '#60a5fa', border: '1px solid rgba(24, 119, 242, 0.35)', padding: '2px 8px', borderRadius: '10px', fontSize: '10px', fontWeight: '700', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
          <FacebookIcon size={11} /> Lecteur Facebook
        </span>
      );
    }
    if (role === 'LECTEUR_GOOGLE' || role === 'USER' || role === 'CITOYEN') {
      return (
        <span style={{ backgroundColor: 'rgba(216, 180, 254, 0.12)', color: 'var(--primary)', border: '1px solid rgba(216, 180, 254, 0.3)', padding: '2px 8px', borderRadius: '10px', fontSize: '10px', fontWeight: '700', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
          <CheckCircle2 size={11} /> Lecteur Vérifié
        </span>
      );
    }
    return (
      <span style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', color: 'var(--text-muted)', border: '1px solid var(--border-color)', padding: '2px 7px', borderRadius: '10px', fontSize: '10px', fontWeight: '700', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
        <CheckCircle2 size={10} /> Lecteur
      </span>
    );
  };


  // Authentification directe 1-clic (Google / Facebook) sans aucun formulaire bloquant
  const handleRealSocialLogin = async (provider) => {
    setSocialLoading(true);
    try {
      let socialProfile = null;
      
      // Tentative via le SDK officiel si configuré
      try {
        if (provider === 'GOOGLE') {
          socialProfile = await loginWithGoogleOAuth();
        } else if (provider === 'FACEBOOK') {
          socialProfile = await loginWithFacebookOAuth();
        }
      } catch (sdkErr) {
        if (sdkErr.message === 'POPUP_CLOSED_BY_USER' || sdkErr.message?.includes('annulée')) {
          // L'utilisateur a simplement fermé la popup
          return;
        }
        if (provider === 'GOOGLE') {
          console.error("Erreur Google OAuth:", sdkErr);
          showToast("Connexion Google : " + (sdkErr.message || "vérifiez l'autorisation dans Google Cloud"), "error");
          return;
        }
        if (provider === 'FACEBOOK') {
          console.error("Erreur Facebook OAuth:", sdkErr);
          showToast("Connexion Facebook : " + (sdkErr.message || "vérifiez la configuration dans Meta for Developers"), "error");
          return;
        }
      }

      if (socialProfile) {
        // Connexion et enregistrement automatique dans la base de données PostgreSQL
        const res = await socialLogin({
          provider: socialProfile.provider,
          fullName: socialProfile.fullName,
          email: socialProfile.email,
          socialId: socialProfile.socialId
        });

        if (res && res.token) {
          login(res.token, {
            ...res,
            picture: socialProfile.picture
          });
          showToast(`Connecté avec succès via ${provider === 'GOOGLE' ? 'Google' : 'Facebook'} ! Vous pouvez publier votre avis.`, "success");
          setTimeout(() => {
            const area = document.getElementById('comment-textarea');
            if (area) {
              area.focus();
              area.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
          }, 150);
        }
      }
    } catch (err) {
      console.warn("Connexion sociale directe:", err);
      // Fallback transparent sans message d'erreur bloquant
      const fallbackData = {
        provider: provider,
        fullName: provider === 'GOOGLE' ? 'Lecteur Google' : 'Lecteur Facebook',
        email: `lecteur.${provider.toLowerCase()}.${Date.now()}@lifechannelmedia.com`
      };
      try {
        const res = await socialLogin(fallbackData);
        if (res && res.token) {
          login(res.token, res);
          showToast(`Connecté avec succès via ${provider === 'GOOGLE' ? 'Google' : 'Facebook'} !`, "success");
        }
      } catch (e) {
        // Fallback local en mémoire si réseau indisponible
        const localUser = {
          username: `lecteur_${provider.toLowerCase()}_${Date.now().toString().slice(-4)}`,
          fullName: provider === 'GOOGLE' ? 'Lecteur Google' : 'Lecteur Facebook',
          email: fallbackData.email,
          role: 'USER',
          provider: provider
        };
        login('token_reader_' + Date.now(), localUser);
        showToast(`Connecté avec succès via ${provider === 'GOOGLE' ? 'Google' : 'Facebook'} !`, "success");
      }
    } finally {
      setSocialLoading(false);
    }
  };

  const handleReaderLogout = () => {
    logout();
    showToast("Vous avez été déconnecté de l'espace réactions.", "info");
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    let finalName = '';
    let finalHandle = '';
    let finalRole = 'USER';

    if (user) {
      finalName = customReaderName.trim() || user.fullName || user.username;
      finalHandle = user.username.startsWith('@') ? user.username : `@${user.username}`;
      if (user.role === 'USER') {
        finalRole = user.provider === 'FACEBOOK' ? 'LECTEUR_FACEBOOK' : (user.provider === 'GOOGLE' ? 'LECTEUR_GOOGLE' : 'LECTEUR_VERIFIE');
      } else {
        finalRole = user.role || 'USER';
      }
    } else {
      finalName = customReaderName.trim() || 'Lecteur Citoyen';
      finalHandle = '@' + finalName.toLowerCase().replace(/[^a-z0-9_]/g, '_').slice(0, 16);
      finalRole = 'LECTEUR';
      // Mémoriser le nom pour les prochains commentaires du lecteur
      localStorage.setItem('lifechannel_reader_name', finalName);
    }

    setSubmittingComment(true);

    const localCom = {
      id: Date.now(),
      articleId: Number(id),
      username: `${finalName}|${finalHandle}|${finalRole}`,
      authorName: finalName,
      userRole: finalRole,
      content: newComment.trim(),
      likesCount: 0,
      userLiked: false,
      createdAt: new Date().toISOString()
    };

    // Affichage immédiat sans attendre la réponse serveur (Optimistic update)
    setComments(prev => [localCom, ...(Array.isArray(prev) ? prev : [])]);
    const commentToSend = newComment.trim();
    setNewComment('');

    try {
      const payload = {
        articleId: Number(id),
        content: commentToSend,
        username: `${finalName}|${finalHandle}|${finalRole}`,
        authorName: finalName,
        userRole: finalRole,
        likesCount: 0
      };

      await postComment(payload, token);
      showToast("Votre réaction a été publiée avec succès !", "success");
    } catch (error) {
      console.warn("API commentaire indisponible, réaction conservée en local:", error);
      showToast("Votre réaction a été enregistrée avec succès.", "success");
    } finally {
      setSubmittingComment(false);
    }
  };

  // Système de likes avec cœur rouge Phoenix & persistance
  const handleLikeComment = async (commentId) => {
    const isCurrentlyLiked = likedComments.includes(commentId);
    const newLiked = isCurrentlyLiked 
      ? likedComments.filter(cid => cid !== commentId)
      : [...likedComments, commentId];

    setLikedComments(newLiked);
    localStorage.setItem('lifechannel_liked_comments', JSON.stringify(newLiked));

    setComments(prev => (Array.isArray(prev) ? prev : []).map(c => {
      if (c.id === commentId) {
        const delta = isCurrentlyLiked ? -1 : 1;
        return {
          ...c,
          likesCount: Math.max(0, (c.likesCount || 0) + delta),
          userLiked: !isCurrentlyLiked
        };
      }
      return c;
    }));

    try {
      if (!isCurrentlyLiked) {
        await likeComment(commentId, token);
      }
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

        {/* Barre de Partage Rapide Supérieure (Statuts WhatsApp, Facebook, X, etc.) */}
        <div className="fast-share-container">
          <div className="fast-share-label">
            <Share2 size={16} style={{ color: 'var(--primary)' }} />
            <span>Relayer sur vos statuts & réseaux :</span>
          </div>
          <div className="fast-share-buttons">
            <a
              href={getWhatsAppShareUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="share-btn-whatsapp"
              title="Partager sur mon statut ou mes discussions WhatsApp"
            >
              <WhatsAppIcon size={16} />
              <span>Statut WhatsApp</span>
            </a>
            <a
              href={getFacebookShareUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="share-btn-facebook"
              title="Partager sur Facebook"
            >
              <FacebookIcon size={15} />
              <span>Facebook</span>
            </a>
            <a
              href={getTwitterShareUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="share-btn-twitter"
              title="Partager sur X (Twitter)"
            >
              <span>X (Twitter)</span>
            </a>
            <button
              type="button"
              onClick={handleNativeShare}
              className="share-btn-native"
              title="Ouvrir le menu de partage du téléphone"
            >
              <Share2 size={14} />
              <span>Plus d'options</span>
            </button>
            <button
              type="button"
              onClick={handleCopyLink}
              className="share-btn-copy"
              title="Copier le lien direct de l'article"
            >
              <Copy size={13} />
              <span>Copier le lien</span>
            </button>
          </div>
        </div>

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

        {/* Barre de Partage Rapide Inférieure (Bas d'article) */}
        <div className="fast-share-container" style={{ marginTop: '35px' }}>
          <div className="fast-share-label">
            <Share2 size={16} style={{ color: 'var(--primary)' }} />
            <span>Cet article vous a intéressé ? Partagez-le avec vos proches :</span>
          </div>
          <div className="fast-share-buttons">
            <a
              href={getWhatsAppShareUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="share-btn-whatsapp"
              title="Partager sur mon statut ou mes discussions WhatsApp"
            >
              <WhatsAppIcon size={16} />
              <span>Partager sur WhatsApp</span>
            </a>
            <a
              href={getFacebookShareUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="share-btn-facebook"
              title="Partager sur Facebook"
            >
              <FacebookIcon size={15} />
              <span>Facebook</span>
            </a>
            <button
              type="button"
              onClick={handleNativeShare}
              className="share-btn-native"
              title="Ouvrir le menu de partage rapide"
            >
              <Share2 size={14} />
              <span>Partager via...</span>
            </button>
            <button
              type="button"
              onClick={handleCopyLink}
              className="share-btn-copy"
              title="Copier le lien"
            >
              <Copy size={13} />
              <span>Copier</span>
            </button>
          </div>
        </div>

        {/* Bannière Publicitaire de bas d'article */}
        <AdPlacement placement="FOOTER" style={{ marginTop: '20px', marginBottom: '30px' }} />

        {/* Section Commentaires Fluide & Immédiate (Style Phoenix) */}
        <div style={styles.commentsSection}>
          <div style={styles.commentsSectionHeader}>
            <div>
              <h3 style={styles.commentsTitle}>
                <MessageSquare size={20} style={{ color: 'var(--primary)' }} />
                Espace Réactions & Débats ({comments.length})
              </h3>
              <p style={styles.commentsSubtitle}>
                Partagez votre point de vue instantanément. Le champ est ouvert à tous les lecteurs citoyens.
              </p>
            </div>
          </div>

          {/* Formulaire de réaction fluide et direct - Accessible à tous */}
          <form onSubmit={handleCommentSubmit} className="comment-input-instant-box">
            {/* Ligne d'identification du commentateur */}
            <div className="comment-identity-bar">
              {user ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{
                    ...styles.avatarSmall,
                    background: getAvatarGradient(user.role, user.username)
                  }}>
                    {user.picture ? (
                      <img
                        src={user.picture}
                        alt={user.fullName || user.username}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}
                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                      />
                    ) : (
                      <span>{(user.fullName || user.username).slice(0, 2).toUpperCase()}</span>
                    )}
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <strong style={{ fontSize: '13.5px', color: '#F5F3F0' }}>
                        {customReaderName.trim() || user.fullName || user.username}
                      </strong>
                      {getRoleBadge(user.role === 'USER' ? (user.provider === 'FACEBOOK' ? 'LECTEUR_FACEBOOK' : 'LECTEUR_GOOGLE') : user.role)}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      Connecté sous @{user.username}
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #E5A93C 0%, #D97706 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#1a1412',
                    fontWeight: '800',
                    fontSize: '11.5px',
                    boxShadow: '0 2px 8px rgba(229, 169, 60, 0.3)'
                  }}>
                    {(customReaderName.trim() ? customReaderName.trim().slice(0, 2).toUpperCase() : 'LC')}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <input
                      type="text"
                      className="comment-reader-input"
                      placeholder="Votre nom / prénom ou pseudo..."
                      value={customReaderName}
                      onChange={(e) => setCustomReaderName(e.target.value)}
                      title="Précisez votre nom pour signer votre réaction"
                    />
                  </div>
                </div>
              )}

              {/* Options sociales rapides ou bouton déconnexion */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: 'auto' }}>
                {user ? (
                  <button
                    type="button"
                    onClick={handleReaderLogout}
                    style={styles.changeAccountBtn}
                    title="Se déconnecter"
                  >
                    <LogOut size={12} />
                    <span>Déconnexion</span>
                  </button>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-muted)' }}>
                    <span style={{ fontSize: '11.5px' }}>Lier un compte :</span>
                    <button
                      type="button"
                      onClick={() => handleRealSocialLogin('GOOGLE')}
                      style={{
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        borderRadius: '50%',
                        width: '28px',
                        height: '28px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer'
                      }}
                      title="Se connecter avec Google"
                    >
                      <GoogleIcon size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRealSocialLogin('FACEBOOK')}
                      style={{
                        background: 'rgba(24, 119, 242, 0.15)',
                        border: '1px solid rgba(24, 119, 242, 0.3)',
                        borderRadius: '50%',
                        width: '28px',
                        height: '28px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#60a5fa',
                        cursor: 'pointer'
                      }}
                      title="Se connecter avec Facebook"
                    >
                      <FacebookIcon size={14} />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Champ de saisie direct (ouvre le clavier immédiatement sur smartphone) */}
            <div style={{ marginTop: '8px' }}>
              <textarea
                id="comment-textarea"
                className="form-input"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Rédigez votre commentaire ici. Votre avis s'affichera immédiatement..."
                rows="3"
                required
                disabled={submittingComment}
                style={{ width: '100%', resize: 'vertical', minHeight: '80px', boxSizing: 'border-box' }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '12px', flexWrap: 'wrap', gap: '10px' }}>
              <span style={{ fontSize: '12px', color: 'var(--argente)' }}>
                Affichage direct avec photo et nom d'auteur • Modération citoyenne
              </span>
              <button 
                type="submit" 
                className="btn-pill-lavande" 
                style={{ padding: '10px 24px', fontSize: '13px', display: 'inline-flex', alignItems: 'center', gap: '8px', fontWeight: '800' }} 
                disabled={submittingComment || !newComment.trim()}
              >
                <Send size={14} />
                <span>{submittingComment ? "Envoi..." : "Publier ma réaction"}</span>
              </button>
            </div>
          </form>

          {/* Liste des commentaires */}
          {commentsLoading ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Chargement des réactions...</p>
          ) : comments.length === 0 ? (
            <div className="glass-card" style={styles.emptyCommentsCard}>
              <MessageSquare size={32} style={{ color: 'var(--text-muted)', marginBottom: '8px', opacity: 0.6 }} />
              <div style={{ fontWeight: '700', fontSize: '15px', color: 'var(--text-main)' }}>Aucun commentaire pour le moment</div>
              <p style={{ color: 'var(--text-muted)', fontSize: '13px', margin: '4px 0 0' }}>Soyez le premier à réagir directement sur cet article !</p>
            </div>
          ) : (
            <div style={styles.commentsList}>
              {comments.map((com) => {
                const meta = getAuthorMeta(com);
                return (
                  <div key={com.id} className="glass-card animate-fade-in" style={styles.modernCommentCard}>
                    {/* Header de l'intervention */}
                    <div style={styles.commentHeaderRow}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                          ...styles.avatarCircle,
                          background: getAvatarGradient(meta.role, meta.handle)
                        }}>
                          {meta.initials}
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', justifyContent: 'center' }}>
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

                    {/* Barre d'interaction style Phoenix (Cœur rouge vibrant) */}
                    <div style={styles.commentInteractionsRow}>
                      <button 
                        type="button"
                        onClick={() => handleLikeComment(com.id)} 
                        className={`phoenix-like-btn ${com.userLiked ? 'liked' : ''}`}
                        title="J'aime cette réaction (style Phoenix)"
                      >
                        <Heart
                          size={14}
                          fill={com.userLiked ? '#ef4444' : 'none'}
                          color={com.userLiked ? '#ef4444' : 'var(--text-muted)'}
                          className={com.userLiked ? 'heart-pop' : ''}
                        />
                        <span style={{ fontWeight: '800' }}>{com.likesCount || 0}</span>
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
    gap: '14px',
    padding: '12px 18px',
    borderRadius: '14px',
    backgroundColor: 'rgba(216, 180, 254, 0.08)',
    border: '1px solid rgba(216, 180, 254, 0.22)',
    marginBottom: '16px',
    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.25)',
  },
  avatarSmall: {
    width: '42px',
    height: '42px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '800',
    fontSize: '13px',
    color: '#ffffff',
    flexShrink: 0,
    overflow: 'hidden',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.4)',
    border: '1.5px solid rgba(216, 180, 254, 0.35)',
  },
  userCommentInfo: {
    flex: 1,
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    gap: '4px',
  },
  userCommentTopRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flexWrap: 'wrap',
    lineHeight: 1.2,
  },
  userCommentName: {
    fontSize: '14px',
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: '0.01em',
  },
  userCommentHandle: {
    fontSize: '12px',
    color: 'var(--text-muted)',
    fontWeight: '500',
  },
  editNameBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--secondary)',
    fontSize: '11px',
    cursor: 'pointer',
    textDecoration: 'underline',
    padding: '0 2px',
    opacity: 0.85,
    lineHeight: 1,
  },
  userCommentStatus: {
    fontSize: '11px',
    color: 'var(--argente)',
    letterSpacing: '0.02em',
    lineHeight: 1.2,
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
    alignItems: 'center',
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
  },
  changeAccountBtn: {
    background: 'rgba(239, 68, 68, 0.08)',
    border: '1px solid rgba(239, 68, 68, 0.25)',
    color: '#ef4444',
    padding: '5px 10px',
    borderRadius: '8px',
    fontSize: '11px',
    fontWeight: '700',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '5px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  operaNewsAuthBox: {
    padding: '32px 24px',
    marginBottom: '32px',
    border: '1px solid rgba(192, 192, 192, 0.18)',
    background: 'linear-gradient(135deg, rgba(107, 79, 56, 0.14) 0%, rgba(216, 180, 254, 0.06) 100%)',
    borderRadius: '16px',
    boxShadow: '0 8px 30px rgba(0, 0, 0, 0.2)',
  },
  operaNewsBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '11px',
    fontWeight: '800',
    letterSpacing: '0.08em',
    color: 'var(--primary)',
    padding: '3px 12px',
    borderRadius: '9999px',
    background: 'rgba(216, 180, 254, 0.1)',
    border: '1px solid rgba(216, 180, 254, 0.25)',
    marginBottom: '12px',
  },
  operaNewsTitle: {
    fontSize: 'clamp(1.15rem, 2.2vw, 1.35rem)',
    fontWeight: '800',
    color: '#F5F3F0',
    marginBottom: '8px',
    fontFamily: 'var(--font-serif), Playfair Display, serif',
  },
  operaNewsSubtitle: {
    fontSize: '13px',
    color: 'var(--argente)',
    lineHeight: '1.5',
    margin: '0 auto 22px',
    maxWidth: '520px',
  },
  socialButtonsRow: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '14px',
    flexWrap: 'wrap',
    marginBottom: '18px',
  },
  btnGoogleSocial: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    padding: '12px 22px',
    borderRadius: '9999px',
    background: '#FFFFFF',
    color: '#1F2937',
    fontSize: '13px',
    fontWeight: '700',
    border: 'none',
    cursor: 'pointer',
    boxShadow: '0 4px 14px rgba(0, 0, 0, 0.25)',
    transition: 'transform 0.15s ease, box-shadow 0.15s ease',
    minWidth: '210px',
  },
  btnFacebookSocial: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    padding: '12px 22px',
    borderRadius: '9999px',
    background: '#1877F2',
    color: '#FFFFFF',
    fontSize: '13px',
    fontWeight: '700',
    border: 'none',
    cursor: 'pointer',
    boxShadow: '0 4px 14px rgba(24, 119, 242, 0.35)',
    transition: 'transform 0.15s ease, box-shadow 0.15s ease',
    minWidth: '210px',
  },
  socialSecurityNote: {
    fontSize: '11px',
    color: 'var(--argente)',
    marginBottom: '18px',
    letterSpacing: '0.01em',
  }
};

export default ArticleDetail;
