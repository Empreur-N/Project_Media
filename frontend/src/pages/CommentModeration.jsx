import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getFlaggedComments, moderateComment } from '../services/api';
import { MessageSquare, AlertTriangle, ShieldCheck, Trash2, CheckCircle, AlertCircle } from 'lucide-react';

const CommentModeration = () => {
  const { user, token } = useAuth();

  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ text: '', type: '' });

  const fetchFlagged = async () => {
    setLoading(true);
    try {
      const data = await getFlaggedComments(token);
      setComments(data);
    } catch (error) {
      console.error("Erreur de récupération des commentaires signalés:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchFlagged();
    }
  }, [user]);

  const showMessage = (text, type = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 5000);
  };

  const handleModerate = async (id, action) => {
    try {
      await moderateComment(id, action, token);
      showMessage(`Le commentaire a été modéré avec succès (Action : ${action})`);
      fetchFlagged();
    } catch (error) {
      showMessage(error.message, 'error');
    }
  };

  return (
    <div className="container animate-fade-in" style={styles.container}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Modération des Commentaires</h1>
          <p style={styles.subtitle}>Gérez les messages signalés par la communauté ou suspendus par la modération automatique</p>
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

      {/* Moderation Panel */}
      <div className="glass-card" style={styles.panel}>
        <h2 style={styles.panelTitle}>Commentaires Signalés</h2>
        
        {loading ? (
          <p style={{ color: 'var(--text-muted)' }}>Chargement des signalements...</p>
        ) : comments.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <MessageSquare size={40} style={{ color: 'var(--text-muted)', marginBottom: '12px' }} />
            <p style={{ color: 'var(--text-muted)' }}>Aucun commentaire signalé ou en attente d'approbation.</p>
          </div>
        ) : (
          <div style={styles.commentsList}>
            {comments.map((com) => (
              <div key={com.id} style={styles.commentItem}>
                <div style={styles.itemHeader}>
                  <div style={styles.userInfo}>
                    <span style={styles.username}>{com.username}</span>
                    <span style={styles.metaText}>sur l'article #{com.articleId}</span>
                    <span style={styles.metaText}>• {new Date(com.createdAt).toLocaleString('fr-FR')}</span>
                  </div>
                  
                  <div style={styles.flagBadge}>
                    <AlertTriangle size={14} /> {com.flagCount} signalement(s)
                  </div>
                </div>

                <div style={styles.commentContent}>
                  <p>"{com.content}"</p>
                  {com.status === 'PENDING' && (
                    <span style={styles.pendingIndicator}>Bloqué temporairement (Modération automatique)</span>
                  )}
                </div>

                <div style={styles.actions}>
                  <button 
                    onClick={() => handleModerate(com.id, 'APPROVED')} 
                    className="btn btn-secondary" 
                    style={{ ...styles.actionBtn, color: 'var(--accent)', borderColor: 'rgba(16, 185, 129, 0.2)' }}
                  >
                    <ShieldCheck size={16} /> Approuver (Conserver)
                  </button>

                  <button 
                    onClick={() => handleModerate(com.id, 'REJECTED')} 
                    className="btn btn-secondary" 
                    style={{ ...styles.actionBtn, color: 'var(--error)', borderColor: 'rgba(239, 68, 68, 0.2)' }}
                  >
                    <Trash2 size={16} /> Rejeter & Masquer
                  </button>
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
  commentsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  commentItem: {
    borderBottom: '1px solid var(--border-color)',
    paddingBottom: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  commentItemLast: {
    borderBottom: 'none',
    paddingBottom: 0,
  },
  itemHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '10px',
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    flexWrap: 'wrap',
  },
  username: {
    fontWeight: '700',
    fontSize: '14px',
  },
  metaText: {
    fontSize: '12px',
    color: 'var(--text-muted)',
  },
  flagBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    color: 'var(--error)',
    padding: '4px 10px',
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: '700',
  },
  commentContent: {
    background: 'rgba(255, 255, 255, 0.01)',
    borderLeft: '2px solid var(--border-color)',
    padding: '10px 16px',
    fontSize: '14px',
    color: 'var(--text-secondary)',
    borderRadius: '0 4px 4px 0',
  },
  pendingIndicator: {
    display: 'block',
    marginTop: '6px',
    fontSize: '11px',
    color: 'var(--warning)',
    fontWeight: '600',
  },
  actions: {
    display: 'flex',
    gap: '12px',
    flexWrap: 'wrap',
  },
  actionBtn: {
    padding: '6px 12px',
    fontSize: '13px',
    borderRadius: '6px',
  }
};

export default CommentModeration;
