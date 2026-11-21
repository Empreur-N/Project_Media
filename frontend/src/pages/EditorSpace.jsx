import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getArticles, reviewArticle, publishBreakingNews, getAllAuditLogs } from '../services/api';
import { FileText, Eye, CheckCircle2, XCircle, ArrowLeft, Calendar, User, Tag, MapPin, AlertCircle, CheckCircle, Radio, X, ShieldCheck } from 'lucide-react';
import { getFullImageUrl } from '../utils/imageUtils';

const EditorSpace = () => {
  const { user, token } = useAuth();
  
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [submitting, setSubmitting] = useState(false);

  // Motif de refus pour traçabilité et conformité légale (Article 49)
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  // Déclencheur Alerte Info / Breaking News en temps réel (Article 47)
  const [breakingModalOpen, setBreakingModalOpen] = useState(false);
  const [breakingTitle, setBreakingTitle] = useState('');
  const [breakingMessage, setBreakingMessage] = useState('');
  const [broadcasting, setBroadcasting] = useState(false);

  // Registre d'Audit Légal (Article 49)
  const [auditModalOpen, setAuditModalOpen] = useState(false);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loadingAudit, setLoadingAudit] = useState(false);

  const handleOpenAuditModal = async () => {
    setAuditModalOpen(true);
    setLoadingAudit(true);
    try {
      const data = await getAllAuditLogs(token);
      setAuditLogs(data || []);
    } catch (err) {
      showMessage("Erreur lors de la récupération des logs d'audit : " + err.message, "error");
    } finally {
      setLoadingAudit(false);
    }
  };

  const fetchSubmittedArticles = async () => {
    setLoading(true);
    try {
      // Récupérer les articles avec le statut SUBMITTED
      const data = await getArticles(null, null, 'SUBMITTED', token);
      setArticles(data);
    } catch (error) {
      console.error("Erreur de récupération des articles soumis:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchSubmittedArticles();
    }
  }, [user]);

  const showMessage = (text, type = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 5000);
  };

  const handleReviewAction = async (action) => {
    if (!selectedArticle) return;
    
    if (action === 'REVISION_REQUIRED') {
      setRejectModalOpen(true);
      return;
    }

    setSubmitting(true);
    try {
      await reviewArticle(selectedArticle.id, action, user.username, token);
      showMessage("Article publié avec succès sur le portail public !");
      setSelectedArticle(null);
      fetchSubmittedArticles();
    } catch (error) {
      showMessage(error.message, "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmRejection = async () => {
    if (!rejectionReason.trim()) {
      showMessage("Veuillez indiquer le motif de refus pour guider le journaliste.", "error");
      return;
    }

    setSubmitting(true);
    try {
      await reviewArticle(selectedArticle.id, 'REVISION_REQUIRED', user.username, token, rejectionReason.trim());
      showMessage("Article renvoyé au journaliste avec motif consigné au registre d'audit légal.");
      setRejectModalOpen(false);
      setRejectionReason('');
      setSelectedArticle(null);
      fetchSubmittedArticles();
    } catch (error) {
      showMessage(error.message, "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleBroadcastBreakingNews = async (e) => {
    e.preventDefault();
    if (!breakingTitle.trim() || !breakingMessage.trim()) return;

    setBroadcasting(true);
    try {
      await publishBreakingNews({
        title: breakingTitle.trim(),
        message: breakingMessage.trim(),
        articleId: selectedArticle ? String(selectedArticle.id) : null,
      }, token);
      showMessage("🔴 Alerte Info diffusée en direct sur tous les écrans connectés sans rechargement !", "success");
      setBreakingModalOpen(false);
      setBreakingTitle('');
      setBreakingMessage('');
    } catch (error) {
      showMessage("Erreur lors de la diffusion : " + error.message, "error");
    } finally {
      setBroadcasting(false);
    }
  };

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
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Espace Rédacteur en Chef</h1>
          <p style={styles.subtitle}>Relisez les articles soumis, validez les publications ou demandez des modifications</p>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          <button 
            className="btn btn-secondary"
            onClick={handleOpenAuditModal}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', fontSize: '13px' }}
          >
            <ShieldCheck size={16} /> Registre d'Audit Légal
          </button>
          <button 
            className="btn btn-secondary"
            onClick={() => setBreakingModalOpen(true)}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ef4444', borderColor: 'rgba(239,68,68,0.3)', padding: '8px 16px', fontSize: '13px' }}
          >
            <Radio size={16} /> Diffuser une Alerte Info (Breaking News)
          </button>
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

      {/* Subsections */}
      {!selectedArticle ? (
        /* LIST VIEW */
        <div className="glass-card" style={styles.panel}>
          <h2 style={styles.panelTitle}>Articles en attente de validation</h2>
          {loading ? (
            <p style={{ color: 'var(--text-muted)' }}>Chargement des articles soumis...</p>
          ) : articles.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <FileText size={40} style={{ color: 'var(--text-muted)', marginBottom: '12px' }} />
              <p style={{ color: 'var(--text-muted)' }}>Aucun article en attente de relecture pour le moment.</p>
            </div>
          ) : (
            <div style={styles.tableContainer}>
              <table style={styles.table}>
                <thead>
                  <tr style={styles.tr}>
                    <th style={styles.th}>Titre</th>
                    <th style={styles.th}>Auteur</th>
                    <th style={styles.th}>Catégorie</th>
                    <th style={styles.th}>Région</th>
                    <th style={styles.th}>Date de soumission</th>
                    <th style={styles.th}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {articles.map((art) => (
                    <tr key={art.id} style={styles.trBody}>
                      <td style={{ ...styles.td, fontWeight: '600' }}>{art.title}</td>
                      <td style={styles.td}>{art.authorUsername}</td>
                      <td style={styles.td}>{art.category}</td>
                      <td style={styles.td}>{art.region || '-'}</td>
                      <td style={styles.td}>{formatDate(art.createdAt)}</td>
                      <td style={styles.td}>
                        <button onClick={() => setSelectedArticle(art)} className="btn btn-secondary" style={styles.smallBtn}>
                          <Eye size={14} /> Relire
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        /* DETAIL REVISE VIEW */
        <div style={styles.reviewLayout}>
          {/* Back button */}
          <button onClick={() => setSelectedArticle(null)} style={styles.backLink}>
            <ArrowLeft size={16} /> Retour à la liste
          </button>

          <div style={styles.splitScreen}>
            {/* Left side: content */}
            <div className="glass-card" style={styles.articleBodyCard}>
              <div style={styles.metaRow}>
                <span style={styles.metaItem}><User size={14} /> Rédigé par : <strong>{selectedArticle.authorUsername}</strong></span>
                <span style={styles.metaItem}><Calendar size={14} /> Date : {formatDate(selectedArticle.createdAt)}</span>
                <span style={styles.metaItem}><Tag size={14} /> {selectedArticle.category}</span>
                {selectedArticle.region && <span style={styles.metaItem}><MapPin size={14} /> {selectedArticle.region}</span>}
              </div>

              <h2 style={styles.articleTitle}>{selectedArticle.title}</h2>

              {selectedArticle.summary && (
                <div style={styles.summaryBlock}>
                  <p style={{ fontStyle: 'italic', color: 'var(--text-secondary)' }}>{selectedArticle.summary}</p>
                </div>
              )}

              <div style={styles.articleText}>
                {selectedArticle.content.split('\n\n').map((para, i) => (
                  <p key={i} style={{ marginBottom: '16px' }}>{para}</p>
                ))}
              </div>

              {selectedArticle.mainImageUrl && (
                <div style={{ marginTop: '20px' }}>
                  <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Image principale associée :</span>
                  <img 
                    src={getFullImageUrl(selectedArticle.mainImageUrl, selectedArticle.category)} 
                    alt="Main" 
                    style={styles.previewImage} 
                  />
                </div>
              )}
            </div>

            {/* Right side: review panel */}
            <div className="glass-card" style={styles.controlPanel}>
              <h3 style={styles.panelTitle}>Évaluation de l'Article</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '24px' }}>
                Prenez une décision pour cet article. La publication le rendra immédiatement visible pour tous les visiteurs.
              </p>

              <div style={styles.actionBlock}>
                <button
                  onClick={() => handleReviewAction('PUBLISHED')}
                  className="btn btn-primary"
                  style={{ ...styles.actionBtn, background: 'var(--accent)' }}
                  disabled={submitting}
                >
                  <CheckCircle2 size={18} /> Approuver & Publier
                </button>

                <button
                  onClick={() => handleReviewAction('REVISION_REQUIRED')}
                  className="btn btn-secondary"
                  style={{ ...styles.actionBtn, color: 'var(--error)', borderColor: 'rgba(239,68,68,0.2)' }}
                  disabled={submitting}
                >
                  <XCircle size={18} /> Demander des corrections
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Modal Motif de Refus / Rejet (Article 49 - Traçabilité & Audit Légal) */}
      {rejectModalOpen && (
        <div style={styles.modalOverlay}>
          <div className="glass-card animate-fade-in" style={styles.modalContent}>
            <div style={styles.modalHeader}>
              <h3 style={{ color: 'var(--error)', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <XCircle size={20} /> Motif de Refus / Demande de Corrections
              </h3>
              <button onClick={() => setRejectModalOpen(false)} style={styles.closeBtn}>
                <X size={18} />
              </button>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px' }}>
              Conformément aux exigences légales de traçabilité éditoriale (Article 49), veuillez expliciter le motif de rejet. Ce motif sera consigné dans le journal d'audit inaltérable.
            </p>
            <textarea
              className="form-input"
              rows="4"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Ex: Préciser les sources chiffrées au paragraphe 2 et vérifier l'orthographe du nom du ministre."
              style={{ width: '100%', marginBottom: '20px' }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button className="btn btn-secondary" onClick={() => setRejectModalOpen(false)}>
                Annuler
              </button>
              <button 
                className="btn btn-primary" 
                onClick={handleConfirmRejection}
                style={{ background: 'var(--error)', borderColor: 'var(--error)' }}
                disabled={submitting}
              >
                Confirmer le refus & Consigner à l'audit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Déclenchement Alerte Info / Breaking News en temps réel (Article 47) */}
      {breakingModalOpen && (
        <div style={styles.modalOverlay}>
          <div className="glass-card animate-fade-in" style={styles.modalContent}>
            <div style={styles.modalHeader}>
              <h3 style={{ color: '#ef4444', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Radio size={20} /> Déclencher une Alerte Info (Temps Réel)
              </h3>
              <button onClick={() => setBreakingModalOpen(false)} style={styles.closeBtn}>
                <X size={18} />
              </button>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px' }}>
              Cette notification urgente s'affichera instantanément en bandeau rouge au sommet de l'écran pour <strong>tous les visiteurs connectés sans rechargement de page</strong> (Canal SSE direct).
            </p>
            <form onSubmit={handleBroadcastBreakingNews}>
              <div className="form-group" style={{ marginBottom: '14px' }}>
                <label className="form-label">Titre de l'alerte urgente *</label>
                <input
                  type="text"
                  className="form-input"
                  value={breakingTitle}
                  onChange={(e) => setBreakingTitle(e.target.value)}
                  placeholder="Ex: Élections RDC : Déclaration conjointe de la CENI"
                  required
                />
              </div>
              <div className="form-group" style={{ marginBottom: '20px' }}>
                <label className="form-label">Message d'urgence détaillé *</label>
                <textarea
                  className="form-input"
                  rows="3"
                  value={breakingMessage}
                  onChange={(e) => setBreakingMessage(e.target.value)}
                  placeholder="Ex: La commission électorale annonce le calendrier révisé. Les bureaux de vote fermeront à 18h00."
                  required
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setBreakingModalOpen(false)}>
                  Annuler
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  style={{ background: '#ef4444', borderColor: '#ef4444' }}
                  disabled={broadcasting}
                >
                  {broadcasting ? "Diffusion en cours..." : "Diffuser l'Alerte Info"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Registre d'Audit Légal (Article 49) */}
      {auditModalOpen && (
        <div style={styles.modalOverlay}>
          <div className="glass-card animate-fade-in" style={{ ...styles.modalContent, maxWidth: '900px', maxHeight: '85vh', display: 'flex', flexDirection: 'column' }}>
            <div style={styles.modalHeader}>
              <h3 style={{ color: 'var(--text-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldCheck size={20} style={{ color: 'var(--accent)' }} /> Registre d'Audit Légal & Traçabilité (Article 49)
              </h3>
              <button onClick={() => setAuditModalOpen(false)} style={styles.closeBtn}>
                <X size={18} />
              </button>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px' }}>
              Journal immuable consignant chaque modification, publication, demande de correction, adresse IP et horodatage UTC.
            </p>
            <div style={{ flex: 1, overflowY: 'auto', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
              {loadingAudit ? (
                <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)' }}>Chargement des logs d'audit...</div>
              ) : auditLogs.length === 0 ? (
                <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)' }}>Aucune trace d'audit enregistrée pour le moment.</div>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                  <thead>
                    <tr style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid var(--border-color)', textAlign: 'left' }}>
                      <th style={{ padding: '10px 12px' }}>Date / Heure</th>
                      <th style={{ padding: '10px 12px' }}>Action</th>
                      <th style={{ padding: '10px 12px' }}>Auteur / Réviseur</th>
                      <th style={{ padding: '10px 12px' }}>IP</th>
                      <th style={{ padding: '10px 12px' }}>Titre / Détails</th>
                      <th style={{ padding: '10px 12px' }}>Motif de Refus</th>
                    </tr>
                  </thead>
                  <tbody>
                    {auditLogs.map((log) => (
                      <tr key={log.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                        <td style={{ padding: '10px 12px', whiteSpace: 'nowrap', color: 'var(--text-muted)' }}>
                          {log.timestamp ? new Date(log.timestamp).toLocaleString('fr-FR') : '-'}
                        </td>
                        <td style={{ padding: '10px 12px' }}>
                          <span style={{
                            padding: '2px 8px',
                            borderRadius: '4px',
                            fontSize: '11px',
                            fontWeight: '600',
                            backgroundColor: log.action && log.action.includes('REVISION_REQUIRED') ? 'rgba(239,68,68,0.15)' :
                                           log.action && log.action.includes('PUBLISHED') ? 'rgba(16,185,129,0.15)' :
                                           'rgba(216,180,254,0.15)',
                            color: log.action && log.action.includes('REVISION_REQUIRED') ? '#ef4444' :
                                   log.action && log.action.includes('PUBLISHED') ? '#10b981' :
                                   '#D8B4FE'
                          }}>
                            {log.action}
                          </span>
                        </td>
                        <td style={{ padding: '10px 12px', fontWeight: '500' }}>{log.authorUsername || '-'}</td>
                        <td style={{ padding: '10px 12px', color: 'var(--text-muted)', fontFamily: 'monospace' }}>{log.ipAddress || '-'}</td>
                        <td style={{ padding: '10px 12px', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={log.articleTitle}>
                          {log.articleTitle || '-'}
                        </td>
                        <td style={{ padding: '10px 12px', color: log.rejectionReason ? '#ef4444' : 'var(--text-muted)' }}>
                          {log.rejectionReason || '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
              <button className="btn btn-secondary" onClick={() => setAuditModalOpen(false)}>
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    padding: '40px 24px 80px',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    padding: '20px',
  },
  modalContent: {
    maxWidth: '550px',
    width: '100%',
    padding: '28px',
    backgroundColor: 'var(--bg-secondary)',
    borderRadius: '12px',
    border: '1px solid var(--border-color)',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
  },
  closeBtn: {
    background: 'transparent',
    border: 'none',
    color: 'var(--text-muted)',
    cursor: 'pointer',
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
  smallBtn: {
    padding: '6px 12px',
    fontSize: '12px',
    borderRadius: '6px',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
  },
  reviewLayout: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  backLink: {
    background: 'none',
    border: 'none',
    color: 'var(--primary)',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '14px',
    width: 'fit-content',
    marginBottom: '10px',
  },
  splitScreen: {
    display: 'grid',
    gridTemplateColumns: '1.2fr 0.8fr',
    gap: '30px',
    alignItems: 'start',
  },
  articleBodyCard: {
    padding: '30px',
  },
  metaRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '16px',
    fontSize: '13px',
    color: 'var(--text-muted)',
    marginBottom: '16px',
  },
  metaItem: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
  },
  articleTitle: {
    fontSize: '26px',
    marginBottom: '20px',
    lineHeight: '1.3',
  },
  summaryBlock: {
    padding: '12px 16px',
    borderLeft: '3px solid var(--secondary)',
    background: 'rgba(255,255,255,0.01)',
    marginBottom: '20px',
  },
  articleText: {
    fontSize: '15px',
    lineHeight: '1.6',
    color: 'var(--text-secondary)',
  },
  previewImage: {
    width: '100%',
    maxHeight: '250px',
    objectFit: 'cover',
    borderRadius: 'var(--radius-md)',
    marginTop: '10px',
    border: '1px solid var(--border-color)',
  },
  controlPanel: {
    padding: '30px',
    position: 'sticky',
    top: '100px',
  },
  actionBlock: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  actionBtn: {
    width: '100%',
    padding: '14px',
    display: 'flex',
    justifyContent: 'center',
    gap: '10px',
  }
};

export default EditorSpace;
