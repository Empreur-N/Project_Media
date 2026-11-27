import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getArticlesByAuthor, getArticles, getArticle, createArticle, updateArticle, submitArticle, publishArticleDirectly, uploadMedia, updateUserProfile } from '../services/api';
import { IMPORTED_ARTICLES } from '../data/importedArticles';
import { REGION_GROUPS } from '../data/regions';
import { getMediaUrl } from '../utils/urlUtils';
import { FileText, Send, Edit, Image as ImageIcon, CheckCircle, AlertCircle, PlusCircle, List, UserCheck, Globe, LifeBuoy, UploadCloud, Trash2, RefreshCw, X, Video, Film, Play, Tv, Sparkles, FileVideo, Camera, ShieldCheck } from 'lucide-react';

const extractYouTubeId = (url) => {
  if (!url) return null;
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([\w-]{11})/);
  return match ? match[1] : null;
};

const JournalistSpace = () => {
  const { user, token, updateUser } = useAuth();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('edit');
  
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('list'); // 'list' or 'form'
  const [profileUploading, setProfileUploading] = useState(false);
  const [showCustomThumbnail, setShowCustomThumbnail] = useState(false);

  const handleProfilePhotoChange = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    try {
      setProfileUploading(true);
      const media = await uploadMedia(file, null, token);
      if (media && media.fileUrl) {
        const fullUrl = getMediaUrl(media.fileUrl);
        await updateUserProfile({ username: user.username, picture: fullUrl }, token);
        if (updateUser) {
          updateUser({ picture: fullUrl });
        }
        showMessage("Photo de profil mise à jour avec succès !", "success");
      }
    } catch (err) {
      showMessage("Erreur lors du changement de photo: " + err.message, "error");
    } finally {
      setProfileUploading(false);
    }
  };
  
  // Form State
  const [articleId, setArticleId] = useState(null);
  const [publicationType, setPublicationType] = useState('ARTICLE'); // 'ARTICLE' | 'VIDEO'
  const [videoFormat, setVideoFormat] = useState('LONG'); // 'SHORT' (9:16) | 'LONG' (16:9)
  const [videoSourceType, setVideoSourceType] = useState('URL'); // 'URL' | 'UPLOAD'
  const [videoUrl, setVideoUrl] = useState('');
  const [videoFile, setVideoFile] = useState(null);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState(null);
  const [videoDuration, setVideoDuration] = useState('');
  const [videoUploading, setVideoUploading] = useState(false);

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
  const [previewUrl, setPreviewUrl] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' }); // 'success' or 'error'

  const categories = ["Politique", "Économie", "Société", "Sport", "Culture", "Technologie", "Santé", "Environnement", "Vidéos"];

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
      const file = e.target.files[0];
      setSelectedFile(file);
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleClearImage = () => {
    setSelectedFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setMainImageUrl('');
  };

  const handleUploadImage = async () => {
    if (!selectedFile) {
      showMessage("Veuillez sélectionner un fichier d'abord", "error");
      return;
    }
    setUploading(true);
    try {
      const media = await uploadMedia(selectedFile, null, token);
      if (media && media.fileUrl) {
        setMainImageUrl(media.fileUrl);
        showMessage("Image de couverture téléchargée avec succès !");
      }
    } catch (error) {
      showMessage("Erreur lors du téléchargement de l'image: " + error.message, "error");
    } finally {
      setUploading(false);
    }
  };

  const handleVideoFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setVideoFile(file);
      if (videoPreviewUrl) URL.revokeObjectURL(videoPreviewUrl);
      setVideoPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleClearVideo = () => {
    setVideoFile(null);
    if (videoPreviewUrl) URL.revokeObjectURL(videoPreviewUrl);
    setVideoPreviewUrl(null);
    setVideoUrl('');
  };

  const resetForm = () => {
    setArticleId(null);
    setPublicationType('ARTICLE');
    setVideoFormat('LONG');
    setVideoSourceType('URL');
    setVideoUrl('');
    setVideoFile(null);
    if (videoPreviewUrl) URL.revokeObjectURL(videoPreviewUrl);
    setVideoPreviewUrl(null);
    setVideoDuration('');

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
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
  };

  const handleSave = async (e, targetStatus = 'DRAFT') => {
    if (e && e.preventDefault) e.preventDefault();
    if (!title) {
      showMessage("Veuillez saisir au minimum le titre de la publication", "error");
      return;
    }

    if (publicationType === 'VIDEO') {
      if (videoSourceType === 'URL' && !videoUrl.trim() && !videoFile) {
        showMessage("Veuillez renseigner le lien de la vidéo (YouTube, TikTok, Facebook ou lien direct)", "error");
        return;
      }
      if (videoSourceType === 'UPLOAD' && !videoFile && !videoUrl.trim()) {
        showMessage("Veuillez sélectionner un fichier vidéo à téléverser", "error");
        return;
      }
    } else {
      if (!content || !category) {
        showMessage("Veuillez remplir les champs obligatoires (Titre, Contenu, Catégorie)", "error");
        return;
      }
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

    // Téléversement vidéo si fichier sélectionné
    let finalVideoUrl = videoUrl.trim();
    if (publicationType === 'VIDEO' && videoFile) {
      try {
        setVideoUploading(true);
        const media = await uploadMedia(videoFile, null, token);
        if (media && media.fileUrl) {
          finalVideoUrl = media.fileUrl;
          setVideoUrl(media.fileUrl);
        }
      } catch (vidErr) {
        console.warn("Téléversement vidéo:", vidErr);
      } finally {
        setVideoUploading(false);
      }
    }

    // Téléversement automatique de l'image de couverture si sélectionnée
    let finalImageUrl = mainImageUrl;
    if (selectedFile) {
      try {
        setUploading(true);
        const media = await uploadMedia(selectedFile, null, token);
        if (media && media.fileUrl) {
          finalImageUrl = media.fileUrl;
          setMainImageUrl(media.fileUrl);
        }
      } catch (uploadErr) {
        console.warn("Téléversement automatique de l'image:", uploadErr);
      } finally {
        setUploading(false);
      }
    }

    // Auto-vignette YouTube si aucune image de couverture n'a été spécifiée
    if (publicationType === 'VIDEO' && !finalImageUrl && finalVideoUrl) {
      const ytId = extractYouTubeId(finalVideoUrl);
      if (ytId) {
        finalImageUrl = `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`;
      }
    }

    // Préparation des métadonnées et balises vidéo
    let finalTags = tags.trim();
    let finalContent = content.trim();

    if (publicationType === 'VIDEO') {
      const videoTag = `[VIDEO:${videoFormat}]`;
      const videoUrlTag = finalVideoUrl ? `[VIDEO_URL:${finalVideoUrl}]` : '';
      const durTag = videoDuration ? `[DURATION:${videoDuration.trim()}]` : (videoFormat === 'SHORT' ? '[DURATION:0:45]' : '[DURATION:10:00]');
      
      const tagList = [finalTags, videoTag, videoUrlTag, durTag, '#video', '#lifechannel_tv', (videoFormat === 'SHORT' ? '#shorts' : '#reportage')].filter(Boolean);
      finalTags = tagList.join(', ');

      if (!finalContent) {
        finalContent = summary.trim() || `Vidéo d'actualité au format ${videoFormat === 'SHORT' ? 'court (Reel/Short)' : 'grand format (Reportage/JT)'} disponible en visionnage haute définition sur LIFE CHANNEL Direct TV.`;
      }
    }

    const payload = {
      title,
      summary: summary.trim() || (publicationType === 'VIDEO' ? `Reportage vidéo : ${title}` : ''),
      content: finalContent,
      category: publicationType === 'VIDEO' ? 'Vidéos' : category,
      region,
      tags: finalTags,
      mainImageUrl: finalImageUrl,
      publicationDate: utcPublicationDate,
      authorUsername: user?.username || 'redaction',
      status: targetStatus
    };

    try {
      if (articleId) {
        // Mode modification
        await updateArticle(articleId, payload, token);
        showMessage("Publication mise à jour avec succès !");
      } else {
        // Mode création immédiate sans délai ni restriction de fréquence
        await createArticle(payload, token);
        if (targetStatus === 'PUBLISHED') {
          showMessage("Publication mise en ligne immédiatement ! La direction a été notifiée.");
        } else {
          showMessage("Nouveau brouillon enregistré !");
        }
      }
      resetForm();
      setView('list');
      fetchMyArticles();
    } catch (error) {
      showMessage("Erreur lors de la publication : " + (error.message || "Vérifiez votre connexion."), "error");
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
    setContent(article.content || '');
    setCategory(article.category);
    setRegion(article.region || 'Kinshasa');
    setTags(article.tags || '');
    setMainImageUrl(article.mainImageUrl || '');
    setSelectedFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);

    // Détection si c'est une vidéo
    const isVideo = article.category === 'Vidéos' || (article.tags && article.tags.includes('VIDEO'));
    if (isVideo) {
      setPublicationType('VIDEO');
      if (article.tags && article.tags.includes('[VIDEO:SHORT]')) {
        setVideoFormat('SHORT');
      } else {
        setVideoFormat('LONG');
      }
      const matchUrl = article.tags && article.tags.match(/\[VIDEO_URL:([^\]]+)\]/);
      if (matchUrl) {
        setVideoUrl(matchUrl[1]);
        setVideoSourceType('URL');
      }
      const matchDur = article.tags && article.tags.match(/\[DURATION:([^\]]+)\]/);
      if (matchDur) {
        setVideoDuration(matchDur[1]);
      }
    } else {
      setPublicationType('ARTICLE');
    }

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
    <div className="container animate-fade-in journalist-container">
      {/* Header */}
      <div className="journalist-header">
        <div>
          <h1 style={styles.title}>Espace Journaliste</h1>
          <p style={styles.subtitle}>Gérez vos articles, rédigez de nouvelles actualités et suivez vos publications</p>
        </div>
        <div className="journalist-header-actions">
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

      {/* Profil de l'Agent Journaliste avec Photo Obligatoire & Nom Complet */}
      <div className="agent-profile-header-card">
        <div className="agent-profile-avatar-container">
          <div className="agent-profile-avatar-wrap">
            {user?.picture ? (
              <img src={user.picture} alt={user?.fullName || user?.username} className="agent-profile-avatar-img" />
            ) : (
              <div className="agent-profile-avatar-placeholder">
                <Camera size={26} color="var(--primary)" />
              </div>
            )}
          </div>
          <label className="agent-profile-photo-btn" title="Modifier votre photo de profil professionnelle">
            <Camera size={14} />
            <span>{profileUploading ? 'Envoi...' : (user?.picture ? 'Changer ma photo' : 'Photo obligatoire *')}</span>
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleProfilePhotoChange} 
              style={{ display: 'none' }} 
              disabled={profileUploading}
            />
          </label>
        </div>

        <div className="agent-profile-meta">
          <div className="agent-profile-fullname">{user?.fullName || user?.username || 'Journaliste Rédaction'}</div>
          <div className="agent-profile-username">Identifiant officiel : @{user?.username} • Statut : Actif</div>
          <div className="agent-profile-badge-row">
            <span className="agent-badge-accredited">
              <ShieldCheck size={13} />
              Journaliste Accrédité • Rédaction Life Channel
            </span>
            <span className="agent-badge-unlimited">
              Publication en continu sans délai
            </span>
          </div>
        </div>
      </div>

      {/* Alerte Photo Obligatoire si manquante */}
      {!user?.picture && (
        <div className="agent-mandatory-photo-banner">
          <AlertCircle size={20} color="#f59e0b" style={{ flexShrink: 0 }} />
          <div style={{ flex: 1, fontSize: '13px', lineHeight: 1.4 }}>
            <strong style={{ color: '#fbbf24' }}>Photo de profil obligatoire :</strong> Conformément à la déontologie rédactionnelle, chaque rédacteur doit être clairement identifiable. Veuillez charger votre photo portrait ci-dessus pour signer vos publications.
          </div>
        </div>
      )}

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
                          {(art.status === 'DRAFT' || art.status === 'REVISION_REQUIRED' || art.status === 'PUBLISHED' || art.authorUsername === user?.username || user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN' || user?.role === 'SUPERVISOR') && (
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
        <div className="glass-card journalist-panel">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
            <h2 style={{ ...styles.panelTitle, margin: 0 }}>
              {articleId ? (publicationType === 'VIDEO' ? "Modifier la vidéo" : "Modifier l'article") : (publicationType === 'VIDEO' ? "Publier une Vidéo d'Actualité" : "Rédiger un nouvel article")}
            </h2>
            
            {/* Bouton de retour direct */}
            <button type="button" className="btn btn-secondary" onClick={() => setView('list')} style={{ fontSize: '13px', padding: '6px 14px' }}>
              <List size={14} /> Retour à la liste
            </button>
          </div>

          {/* Toggle Type de Contenu : Article Standard vs Vidéo Direct TV */}
          <div style={{
            display: 'flex',
            gap: '10px',
            background: 'rgba(20, 15, 13, 0.95)',
            border: '1px solid rgba(192, 192, 192, 0.18)',
            padding: '6px',
            borderRadius: '12px',
            marginBottom: '26px'
          }}>
            <button
              type="button"
              onClick={() => {
                setPublicationType('ARTICLE');
                if (category === 'Vidéos') setCategory('Politique');
              }}
              style={{
                flex: 1,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '12px 16px',
                borderRadius: '8px',
                border: publicationType === 'ARTICLE' ? '1px solid var(--primary)' : 'none',
                background: publicationType === 'ARTICLE' ? 'linear-gradient(135deg, rgba(229, 169, 60, 0.22) 0%, rgba(217, 119, 6, 0.12) 100%)' : 'transparent',
                color: publicationType === 'ARTICLE' ? '#F5F3F0' : 'var(--text-muted)',
                fontWeight: '700',
                fontSize: '13.5px',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              <FileText size={16} style={{ color: publicationType === 'ARTICLE' ? 'var(--primary)' : 'inherit' }} />
              <span>Article Rédactionnel Standard</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setPublicationType('VIDEO');
                setCategory('Vidéos');
              }}
              style={{
                flex: 1,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '12px 16px',
                borderRadius: '8px',
                border: publicationType === 'VIDEO' ? '1px solid rgba(239, 68, 68, 0.5)' : 'none',
                background: publicationType === 'VIDEO' ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.22) 0%, rgba(185, 28, 28, 0.12) 100%)' : 'transparent',
                color: publicationType === 'VIDEO' ? '#F5F3F0' : 'var(--text-muted)',
                fontWeight: '700',
                fontSize: '13.5px',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              <Video size={16} style={{ color: publicationType === 'VIDEO' ? '#f87171' : 'inherit' }} />
              <span>Vidéo d'Actualité / Reportage</span>
              <span style={{
                background: 'linear-gradient(135deg, #E5A93C 0%, #D97706 100%)',
                color: '#1a1412',
                fontSize: '10px',
                fontWeight: '900',
                padding: '2px 7px',
                borderRadius: '9999px',
                letterSpacing: '0.5px'
              }}>
                DIRECT TV
              </span>
            </button>
          </div>

          <form onSubmit={(e) => handleSave(e, 'PUBLISHED')}>
            <div className="journalist-form-grid">
              <div className="form-group journalist-col-full">
                <label className="form-label">{publicationType === 'VIDEO' ? "Titre de la vidéo / Reportage *" : "Titre de l'article *"}</label>
                <input
                  type="text"
                  className="form-input"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={publicationType === 'VIDEO' ? "Ex: JT 20h : Déclaration exclusive du président à Kinshasa" : "Saisissez un titre percutant"}
                  required
                />
              </div>

              {/* MODULE DÉDIÉ PUBLICATION VIDÉO */}
              {publicationType === 'VIDEO' && (
                <div className="form-group journalist-col-full video-config-module">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(229, 169, 60, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Film size={18} style={{ color: 'var(--primary)' }} />
                    </div>
                    <div>
                      <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#F5F3F0', margin: 0 }}>
                        Configuration & Format de la Vidéo
                      </h3>
                      <p style={{ margin: '2px 0 0', fontSize: '12px', color: 'var(--text-muted)' }}>
                        Choisissez le format d'affichage adapté aux smartphones ou aux grands écrans.
                      </p>
                    </div>
                  </div>

                  {/* Choix du format : Format Court (Shorts 9:16) vs Grand Format (16:9) */}
                  <div style={{ marginBottom: '20px' }}>
                    <label className="form-label" style={{ marginBottom: '10px', display: 'block', fontSize: '13px' }}>
                      Format d'affichage de la vidéo *
                    </label>
                    <div className="video-format-grid">
                      <button
                        type="button"
                        onClick={() => setVideoFormat('SHORT')}
                        className={`video-format-card ${videoFormat === 'SHORT' ? 'active' : ''}`}
                      >
                        <div className="video-format-icon-wrap short">
                          <Play size={15} style={{ color: 'var(--primary)' }} />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: '800', fontSize: '14px', color: '#ffffff' }}>Format Court (9:16)</div>
                          <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px', lineHeight: 1.3 }}>
                            Short / Reel vertical • Idéal smartphone & buzz
                          </div>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setVideoFormat('LONG')}
                        className={`video-format-card ${videoFormat === 'LONG' ? 'active' : ''}`}
                      >
                        <div className="video-format-icon-wrap long">
                          <Tv size={15} style={{ color: 'var(--primary)' }} />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: '800', fontSize: '14px', color: '#ffffff' }}>Grand Format (16:9)</div>
                          <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px', lineHeight: 1.3 }}>
                            JT, Reportage & Débat • Format paysage classique
                          </div>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Source de la vidéo : Lien externe vs Upload fichier */}
                  <div style={{ marginBottom: '20px' }}>
                    <label className="form-label" style={{ marginBottom: '10px', display: 'block', fontSize: '13px' }}>
                      Origine de la vidéo *
                    </label>
                    <div className="video-source-switcher">
                      <button
                        type="button"
                        onClick={() => setVideoSourceType('URL')}
                        className={`btn ${videoSourceType === 'URL' ? 'btn-primary' : 'btn-secondary'}`}
                        style={{ fontSize: '13px', padding: '10px 18px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                      >
                        <Globe size={15} />
                        <span>Lien vidéo (Réseaux / Web)</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setVideoSourceType('UPLOAD')}
                        className={`btn ${videoSourceType === 'UPLOAD' ? 'btn-primary' : 'btn-secondary'}`}
                        style={{ fontSize: '13px', padding: '10px 18px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                      >
                        <UploadCloud size={15} />
                        <span>Téléverser un fichier MP4</span>
                      </button>
                    </div>

                    {videoSourceType === 'URL' ? (
                      <div>
                        <input
                          type="text"
                          className="form-input"
                          value={videoUrl}
                          onChange={(e) => setVideoUrl(e.target.value)}
                          placeholder="Collez ici le lien YouTube, TikTok, Facebook ou direct .mp4..."
                          style={{ width: '100%', boxSizing: 'border-box', fontSize: '14px', padding: '12px 14px' }}
                        />
                        <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '6px' }}>
                          Intégration directe de vos comptes officiels YouTube, TikTok, Facebook et liens vidéo.
                        </div>
                      </div>
                    ) : (
                      <div>
                        {videoPreviewUrl || videoUrl ? (
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: 'rgba(255, 255, 255, 0.04)', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <FileVideo size={22} style={{ color: 'var(--primary)' }} />
                              <div>
                                <div style={{ fontSize: '13.5px', fontWeight: '700', color: '#F5F3F0' }}>
                                  {videoFile ? videoFile.name : videoUrl.split('/').pop()}
                                </div>
                                <div style={{ fontSize: '11.5px', color: '#10b981' }}>
                                  {videoFile ? `${((videoFile.size) / (1024 * 1024)).toFixed(1)} Mo • Fichier prêt` : 'Vidéo active'}
                                </div>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={handleClearVideo}
                              className="btn btn-secondary"
                              style={{ color: 'var(--error)', padding: '6px 12px', fontSize: '12px' }}
                            >
                              <Trash2 size={14} /> Retirer
                            </button>
                          </div>
                        ) : (
                          <label className="image-dropzone" style={{ minHeight: '100px', padding: '20px' }}>
                            <input
                              type="file"
                              accept="video/mp4,video/webm,video/quicktime"
                              onChange={handleVideoFileChange}
                              style={{ display: 'none' }}
                            />
                            <div className="dropzone-icon-circle">
                              <Video size={22} style={{ color: 'var(--primary)' }} />
                            </div>
                            <div style={{ textAlign: 'center' }}>
                              <p style={{ margin: 0, fontWeight: 700, fontSize: '14px', color: 'var(--text-main)' }}>
                                Cliquez pour choisir votre vidéo (.mp4, .webm, .mov)
                              </p>
                              <p style={{ margin: '3px 0 0', fontSize: '12px', color: 'var(--text-muted)' }}>
                                Import direct haute définition
                              </p>
                            </div>
                          </label>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Durée estimée de la vidéo */}
                  <div style={{ maxWidth: '260px' }}>
                    <label className="form-label" style={{ fontSize: '13px', marginBottom: '6px' }}>Durée estimée (ex: 0:45 ou 8:30)</label>
                    <input
                      type="text"
                      className="form-input"
                      value={videoDuration}
                      onChange={(e) => setVideoDuration(e.target.value)}
                      placeholder={videoFormat === 'SHORT' ? '0:45' : '12:30'}
                      style={{ fontSize: '14px' }}
                    />
                  </div>

                  {/* Aperçu vidéo en direct si lien YouTube ou fichier présent */}
                  {(videoUrl || videoPreviewUrl) && (
                    <div style={{ marginTop: '20px', paddingTop: '18px', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
                      <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--primary)', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Play size={14} /> Aperçu du lecteur vidéo :
                      </div>
                      <div style={{
                        position: 'relative',
                        width: '100%',
                        maxWidth: videoFormat === 'SHORT' ? '240px' : '480px',
                        aspectRatio: videoFormat === 'SHORT' ? '9 / 16' : '16 / 9',
                        background: '#000',
                        borderRadius: '12px',
                        overflow: 'hidden',
                        border: '1px solid var(--border-color)',
                        boxShadow: '0 8px 24px rgba(0,0,0,0.5)'
                      }}>
                        {extractYouTubeId(videoUrl) ? (
                          <iframe
                            src={`https://www.youtube.com/embed/${extractYouTubeId(videoUrl)}`}
                            title="Aperçu vidéo"
                            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
                            allowFullScreen
                          />
                        ) : (
                          <video
                            src={videoPreviewUrl || videoUrl}
                            controls
                            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                          />
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="form-group">
                <label className="form-label">Catégorie *</label>
                <select className="form-input" value={category} onChange={(e) => setCategory(e.target.value)}>
                  {categories.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Zone Géographique / Région *</label>
                <select className="form-input" value={region} onChange={(e) => setRegion(e.target.value)}>
                  <option value="">Aucune région spécifique (Global)</option>
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

              <div className="form-group journalist-col-full">
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

              {/* MODULE COUVERTURE & VIGNETTE (Facultatif pour les vidéos, automatique par défaut) */}
              {publicationType === 'ARTICLE' ? (
                <div className="form-group journalist-col-full">
                  <label className="form-label" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span>Image Principale / Vignette de Couverture</span>
                    {(previewUrl || mainImageUrl) && (
                      <span style={{ fontSize: '11px', color: '#10b981', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <CheckCircle size={13} /> {previewUrl ? "Nouvelle image prête" : "Image active sur le serveur"}
                      </span>
                    )}
                  </label>

                  {previewUrl || mainImageUrl ? (
                    <div className="image-preview-card">
                      <div className="image-preview-wrapper">
                        <img 
                          src={previewUrl || getMediaUrl(mainImageUrl)} 
                          alt="Aperçu couverture" 
                          className="image-preview-img"
                        />
                        <div className="image-preview-overlay">
                          {previewUrl && (
                            <div className="image-preview-tag">
                              <ImageIcon size={14} /> Fichier : {selectedFile?.name} ({((selectedFile?.size || 0) / 1024).toFixed(0)} Ko)
                            </div>
                          )}
                          {!previewUrl && mainImageUrl && (
                            <div className="image-preview-tag">
                              <CheckCircle size={14} /> Image : {mainImageUrl.split('/').pop()}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="image-preview-actions">
                        <label htmlFor="article-cover-file" className="btn btn-secondary" style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}>
                          <RefreshCw size={15} /> Remplacer l'image
                          <input
                            id="article-cover-file"
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            style={{ display: 'none' }}
                          />
                        </label>
                        {selectedFile && !uploading && (
                          <button
                            type="button"
                            onClick={handleUploadImage}
                            className="btn btn-secondary"
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}
                          >
                            <UploadCloud size={15} /> Téléverser maintenant
                          </button>
                        )}
                        {uploading && (
                          <span style={{ fontSize: '12px', color: 'var(--primary)', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                            <span className="spin"><RefreshCw size={14} /></span> Téléversement...
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={handleClearImage}
                          className="btn btn-secondary"
                          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--error)' }}
                          title="Retirer l'image"
                        >
                          <Trash2 size={15} /> Supprimer
                        </button>
                      </div>
                    </div>
                  ) : (
                    <label htmlFor="article-cover-file" className="image-dropzone">
                      <input
                        id="article-cover-file"
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        style={{ display: 'none' }}
                      />
                      <div className="dropzone-icon-circle">
                        <UploadCloud size={24} style={{ color: 'var(--primary)' }} />
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <p style={{ margin: 0, fontWeight: 700, fontSize: '15px', color: 'var(--text-main)' }}>
                          Choisir une photo d'illustration ou vignette
                        </p>
                        <p style={{ margin: '4px 0 0', fontSize: '12px', color: 'var(--text-muted)' }}>
                          Cliquez ici pour sélectionner une photo depuis votre appareil (JPG, PNG, WEBP)
                        </p>
                      </div>
                    </label>
                  )}
                </div>
              ) : (
                /* Module Vignette Automatique / Facultatif pour publication VIDÉO */
                <div className="form-group journalist-col-full video-thumbnail-card">
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', marginBottom: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <CheckCircle2 size={17} color="#10b981" />
                      <span style={{ fontSize: '14px', fontWeight: '800', color: '#F5F3F0' }}>
                        Image de couverture : Automatique (Aucune photo requise)
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowCustomThumbnail(!showCustomThumbnail)}
                      className="btn btn-secondary"
                      style={{ fontSize: '12px', padding: '6px 12px', borderRadius: '8px', border: '1px solid rgba(229, 169, 60, 0.3)' }}
                    >
                      {showCustomThumbnail ? "Masquer la sélection d'image" : "Vignette personnalisée (Facultatif)"}
                    </button>
                  </div>
                  <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', margin: '0 0 12px', lineHeight: '1.45' }}>
                    Pour les reportages et vidéos, l'image de couverture est facultative : elle est générée automatiquement à partir de votre vidéo. Vous pouvez publier directement sans importer de photo supplémentaire.
                  </p>

                  {/* Aperçu automatique si aucune vignette manuelle n'est sélectionnée */}
                  {!showCustomThumbnail && !previewUrl && !mainImageUrl && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(0,0,0,0.3)', padding: '10px 14px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)' }}>
                      <div style={{ width: '64px', height: '40px', borderRadius: '6px', overflow: 'hidden', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        {extractYouTubeId(videoUrl) ? (
                          <img 
                            src={`https://img.youtube.com/vi/${extractYouTubeId(videoUrl)}/hqdefault.jpg`} 
                            alt="Vignette auto" 
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        ) : (
                          <Film size={18} color="var(--primary)" />
                        )}
                      </div>
                      <div style={{ fontSize: '12px', color: '#10b981', fontWeight: 600 }}>
                        {extractYouTubeId(videoUrl) ? "Vignette YouTube détectée et prête à être utilisée" : "Vignette générée automatiquement à la publication"}
                      </div>
                    </div>
                  )}

                  {/* Sélection manuelle d'une image si l'auteur le souhaite */}
                  {(showCustomThumbnail || previewUrl || mainImageUrl) && (
                    <div style={{ marginTop: '14px', paddingTop: '14px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                      {previewUrl || mainImageUrl ? (
                        <div className="image-preview-card">
                          <div className="image-preview-wrapper" style={{ maxHeight: '180px' }}>
                            <img 
                              src={previewUrl || getMediaUrl(mainImageUrl)} 
                              alt="Vignette personnalisée" 
                              className="image-preview-img"
                            />
                          </div>
                          <div className="image-preview-actions">
                            <label htmlFor="article-cover-file-video" className="btn btn-secondary" style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}>
                              <RefreshCw size={14} /> Changer la vignette
                              <input
                                id="article-cover-file-video"
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                style={{ display: 'none' }}
                              />
                            </label>
                            <button
                              type="button"
                              onClick={handleClearImage}
                              className="btn btn-secondary"
                              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--error)' }}
                            >
                              <Trash2 size={14} /> Supprimer
                            </button>
                          </div>
                        </div>
                      ) : (
                        <label htmlFor="article-cover-file-video" className="image-dropzone" style={{ minHeight: '90px', padding: '16px' }}>
                          <input
                            id="article-cover-file-video"
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            style={{ display: 'none' }}
                          />
                          <div className="dropzone-icon-circle" style={{ width: '36px', height: '36px' }}>
                            <UploadCloud size={18} style={{ color: 'var(--primary)' }} />
                          </div>
                          <div style={{ textAlign: 'center' }}>
                            <p style={{ margin: 0, fontWeight: 700, fontSize: '13px', color: 'var(--text-main)' }}>
                              Sélectionner une vignette personnalisée (Optionnel)
                            </p>
                            <p style={{ margin: '2px 0 0', fontSize: '11px', color: 'var(--text-muted)' }}>
                              JPG, PNG ou WEBP
                            </p>
                          </div>
                        </label>
                      )}
                    </div>
                  )}
                </div>
              )}

              <div className="form-group journalist-col-full">
                <label className="form-label">{publicationType === 'VIDEO' ? "Description courte de la vidéo" : "Résumé de l'article (max. 1000 caractères)"}</label>
                <textarea
                  className="form-input"
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  rows="3"
                  placeholder={publicationType === 'VIDEO' ? "Présentation synthétique du reportage ou de la vidéo..." : "Saisissez une brève description ou accroche pour l'article"}
                  maxLength="1000"
                />
              </div>

              <div className="form-group journalist-col-full">
                <label className="form-label">{publicationType === 'VIDEO' ? "Transcription ou notes éditoriales (Optionnel)" : "Contenu de l'article *"}</label>
                <textarea
                  className="form-input"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={publicationType === 'VIDEO' ? "6" : "12"}
                  placeholder={publicationType === 'VIDEO' ? "Notes de contexte, résumé des déclarations ou transcription du reportage..." : "Rédigez le corps de l'article. Utilisez des doubles retours à la ligne pour créer des paragraphes."}
                  required={publicationType !== 'VIDEO'}
                />
              </div>
            </div>

            <div className="journalist-form-actions">
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
                <Globe size={16} /> {articleId ? "Enregistrer les modifications" : (publicationType === 'VIDEO' ? "Publier la vidéo en direct" : "Publier immédiatement en ligne")}
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
