import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getInternalMessages, sendInternalMessage, toggleResolveInternalMessage } from '../services/api';
import { MessageSquare, LifeBuoy, Send, CheckCircle2, Clock, User, Shield, Tag, Search, RefreshCw, AlertCircle, ArrowLeft, PenSquare } from 'lucide-react';

const StaffChat = () => {
  const { user, token } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get('category') || 'TECH_SUPPORT';

  const [activeTab, setActiveTab] = useState(initialCategory);
  const [mobileView, setMobileView] = useState('feed'); // 'feed' | 'compose'
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Form state
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState(initialCategory === 'ALL' ? 'TECH_SUPPORT' : initialCategory);
  const [sending, setSending] = useState(false);
  const [statusFeedback, setStatusFeedback] = useState({ text: '', type: '' });

  const fetchMessages = async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    try {
      const data = await getInternalMessages(activeTab === 'ALL' ? null : activeTab, token);
      if (Array.isArray(data)) {
        setMessages(data);
      }
    } catch (err) {
      console.error("Erreur de récupération des échanges:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(() => {
      fetchMessages(true);
    }, 12000); // Rafraîchissement automatique toutes les 12 secondes
    return () => clearInterval(interval);
  }, [activeTab]);

  const handleTabChange = (newTab) => {
    setActiveTab(newTab);
    const newParams = new URLSearchParams(searchParams);
    newParams.set('category', newTab);
    setSearchParams(newParams);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!subject.trim() || !content.trim()) {
      setStatusFeedback({ text: "Veuillez préciser le sujet et le message.", type: "error" });
      return;
    }

    setSending(true);
    setStatusFeedback({ text: "", type: "" });
    try {
      await sendInternalMessage({
        senderUsername: user?.username || 'Collaborateur',
        senderRole: user?.role || 'JOURNALIST',
        subject: subject.trim(),
        content: content.trim(),
        category: category
      }, token);

      setStatusFeedback({ text: "Message transmis avec succès à l'équipe et à la direction !", type: "success" });
      setSubject('');
      setContent('');
      fetchMessages(true);
      setTimeout(() => {
        setStatusFeedback({ text: '', type: '' });
        setMobileView('feed');
      }, 1500);
    } catch (err) {
      setStatusFeedback({ text: err.message || "Erreur d'envoi du message", type: "error" });
    } finally {
      setSending(false);
    }
  };

  const handleToggleResolve = async (id) => {
    try {
      await toggleResolveInternalMessage(id, token);
      fetchMessages(true);
    } catch (err) {
      console.error("Erreur de mise à jour du statut:", err);
    }
  };

  const filteredMessages = messages.filter((m) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (m.subject && m.subject.toLowerCase().includes(q)) ||
      (m.content && m.content.toLowerCase().includes(q)) ||
      (m.senderUsername && m.senderUsername.toLowerCase().includes(q))
    );
  });

  const getRoleBadgeStyle = (role) => {
    switch (role) {
      case 'ADMIN':
      case 'SUPER_ADMIN':
        return { background: 'rgba(239, 68, 68, 0.15)', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.3)' };
      case 'SUPERVISOR':
        return { background: 'rgba(229, 169, 60, 0.15)', color: '#E5A93C', border: '1px solid rgba(229, 169, 60, 0.3)' };
      case 'EDITOR':
        return { background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', border: '1px solid rgba(56, 189, 248, 0.3)' };
      default:
        return { background: 'rgba(216, 180, 254, 0.15)', color: '#D8B4FE', border: '1px solid rgba(216, 180, 254, 0.3)' };
    }
  };

  const getRoleLabel = (role) => {
    switch (role) {
      case 'SUPER_ADMIN': return 'Super Administrateur';
      case 'ADMIN': return 'Administration';
      case 'SUPERVISOR': return 'Direction';
      case 'EDITOR': return 'Rédacteur en Chef';
      case 'JOURNALIST': return 'Journaliste';
      default: return role || 'Collaborateur';
    }
  };

  return (
    <div className="container animate-fade-in" style={styles.page}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <Link to="/admin/journalist" style={styles.backLink}>
              <ArrowLeft size={14} /> Retour à l'espace rédaction
            </Link>
          </div>
          <h1 style={styles.pageTitle}>Messagerie Interne & Support Collaborateurs</h1>
          <p style={styles.pageSubtitle}>
            Échangez directement avec la direction et signalez tout incident technique sur la plateforme sans quitter l'application.
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button 
            onClick={() => fetchMessages(true)} 
            disabled={refreshing}
            style={styles.refreshBtn}
            title="Rafraîchir les échanges"
          >
            <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
            <span>{refreshing ? 'Actualisation...' : 'Actualiser'}</span>
          </button>
        </div>
      </div>

      {/* Tabs Row */}
      <div style={styles.tabsRow}>
        <button 
          onClick={() => handleTabChange('TECH_SUPPORT')}
          style={{
            ...styles.tabBtn,
            ...(activeTab === 'TECH_SUPPORT' ? styles.activeTabBtn : {})
          }}
        >
          <LifeBuoy size={15} style={{ marginRight: '6px' }} />
          Support Technique & Direction
        </button>
        <button 
          onClick={() => handleTabChange('EDITORIAL')}
          style={{
            ...styles.tabBtn,
            ...(activeTab === 'EDITORIAL' ? styles.activeTabBtn : {})
          }}
        >
          <MessageSquare size={15} style={{ marginRight: '6px' }} />
          Échanges Rédaction
        </button>
        <button 
          onClick={() => handleTabChange('ALL')}
          style={{
            ...styles.tabBtn,
            ...(activeTab === 'ALL' ? styles.activeTabBtn : {})
          }}
        >
          <Tag size={15} style={{ marginRight: '6px' }} />
          Tous les Sujets
        </button>
      </div>

      {/* Mobile Navigation Tabs (visible on smartphone / tablet) */}
      <div className="staff-mobile-view-tabs">
        <button 
          type="button" 
          className={`staff-mobile-tab-btn ${mobileView === 'feed' ? 'active' : ''}`}
          onClick={() => setMobileView('feed')}
        >
          <MessageSquare size={16} />
          <span>Discussions ({filteredMessages.length})</span>
        </button>
        <button 
          type="button" 
          className={`staff-mobile-tab-btn ${mobileView === 'compose' ? 'active' : ''}`}
          onClick={() => setMobileView('compose')}
        >
          <Send size={16} />
          <span>Écrire à la Direction</span>
        </button>
      </div>

      {/* Main Layout : 2 Columns on desktop, single column on mobile */}
      <div className="staff-chat-grid">
        {/* Left Column : Messages list */}
        <div className={`staff-feed-col ${mobileView === 'compose' ? 'staff-feed-col-hidden' : ''}`} style={styles.feedCol}>
          {/* Search bar inside feed */}
          <div style={styles.searchBar}>
            <Search size={16} style={{ color: 'var(--text-muted)' }} />
            <input 
              type="text"
              placeholder="Rechercher par mot-clé, sujet ou collègue..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={styles.searchInput}
            />
          </div>

          {loading ? (
            <div className="glass-card" style={styles.emptyCard}>
              <p style={{ color: 'var(--text-muted)' }}>Chargement des messages...</p>
            </div>
          ) : filteredMessages.length === 0 ? (
            <div className="glass-card" style={styles.emptyCard}>
              <LifeBuoy size={40} style={{ color: 'var(--text-muted)', marginBottom: '14px' }} />
              <h3 style={{ fontSize: '18px', color: '#F5F3F0', marginBottom: '6px' }}>Aucun échange pour le moment</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '13.5px', maxWidth: '380px', margin: '0 auto' }}>
                Utilisez le formulaire ci-contre pour transmettre votre première remarque technique ou éditoriale à la direction.
              </p>
            </div>
          ) : (
            <div style={styles.messagesStack}>
              {filteredMessages.map((msg) => (
                <div key={msg.id} className="glass-card" style={styles.messageCard}>
                  <div style={styles.msgHeader}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <span style={{
                        ...styles.categoryTag,
                        backgroundColor: msg.category === 'TECH_SUPPORT' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(56, 189, 248, 0.15)',
                        color: msg.category === 'TECH_SUPPORT' ? '#f87171' : '#38bdf8'
                      }}>
                        {msg.category === 'TECH_SUPPORT' ? 'Support Technique' : 'Rédaction'}
                      </span>
                      <span style={styles.msgSubject}>{msg.subject}</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {msg.isResolved ? (
                        <span style={styles.resolvedBadge}>
                          <CheckCircle2 size={12} /> Résolu
                        </span>
                      ) : (
                        <span style={styles.openBadge}>
                          <Clock size={12} /> En cours
                        </span>
                      )}

                      {/* Résolution pour directeurs / admins */}
                      {(user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN' || user?.role === 'SUPERVISOR') && (
                        <button 
                          onClick={() => handleToggleResolve(msg.id)} 
                          style={styles.resolveToggleBtn}
                          title={msg.isResolved ? "Rouvrir le signalement" : "Marquer comme résolu"}
                        >
                          {msg.isResolved ? "Rouvrir" : "Marquer résolu"}
                        </button>
                      )}
                    </div>
                  </div>

                  <p style={styles.msgContent}>{msg.content}</p>

                  <div style={styles.msgFooter}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={styles.senderAvatar}>
                        <User size={13} />
                      </span>
                      <span style={styles.senderName}>{msg.senderUsername}</span>
                      <span style={{ ...styles.roleBadge, ...getRoleBadgeStyle(msg.senderRole) }}>
                        {getRoleLabel(msg.senderRole)}
                      </span>
                    </div>
                    <span style={styles.msgDate}>
                      {new Date(msg.createdAt).toLocaleString('fr-FR', {
                        day: '2-digit',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column : Compose New Message */}
        <div className={`staff-form-col ${mobileView === 'feed' ? 'staff-compose-col-hidden' : ''}`} style={styles.formCol}>
          <div className="glass-card staff-compose-card" style={styles.composeCard}>
            <div style={styles.composeHeader}>
              <MessageSquare size={18} style={{ color: 'var(--primary)' }} />
              <h2 style={styles.composeTitle}>Nouveau Message ou Signalement</h2>
            </div>
            <p style={styles.composeHelp}>
              Ce message sera notifié en direct à la direction et aux administrateurs pour une prise en charge immédiate.
            </p>

            {statusFeedback.text && (
              <div style={{
                ...styles.feedbackBox,
                backgroundColor: statusFeedback.type === 'error' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                color: statusFeedback.type === 'error' ? '#f87171' : '#34d399',
                borderColor: statusFeedback.type === 'error' ? 'rgba(239, 68, 68, 0.3)' : 'rgba(16, 185, 129, 0.3)'
              }}>
                {statusFeedback.type === 'error' ? <AlertCircle size={15} /> : <CheckCircle2 size={15} />}
                <span>{statusFeedback.text}</span>
              </div>
            )}

            <form onSubmit={handleSendMessage} style={styles.form}>
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Catégorie de la demande</label>
                <select 
                  value={category} 
                  onChange={(e) => setCategory(e.target.value)}
                  style={styles.selectInput}
                >
                  <option value="TECH_SUPPORT">Support Technique (Bug, Blocage, Image, Plateforme)</option>
                  <option value="EDITORIAL">Rédaction & Échanges Équipe</option>
                  <option value="GENERAL">Question Générale & Direction</option>
                </select>
              </div>

              <div style={styles.fieldGroup}>
                <label style={styles.label}>Sujet explicite *</label>
                <input 
                  type="text" 
                  placeholder="Ex : Problème d'affichage de mon article / Question direction"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  required
                  style={styles.textInput}
                />
              </div>

              <div style={styles.fieldGroup}>
                <label style={styles.label}>Message détaillé *</label>
                <textarea 
                  rows="6"
                  placeholder="Expliquez la situation avec précision pour permettre une résolution rapide..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  required
                  style={styles.textareaInput}
                />
              </div>

              <button 
                type="submit" 
                disabled={sending}
                style={styles.submitBtn}
              >
                <Send size={15} />
                <span>{sending ? 'Transmission en cours...' : 'Envoyer à la Direction'}</span>
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Floating Action Button on mobile when viewing feed */}
      {mobileView === 'feed' && (
        <button 
          type="button"
          className="staff-mobile-fab"
          onClick={() => setMobileView('compose')}
          title="Écrire un nouveau message à la direction"
        >
          <PenSquare size={17} />
          <span>Nouveau Message</span>
        </button>
      )}
    </div>
  );
};

const styles = {
  page: {
    padding: '36px 20px 80px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '24px',
    borderBottom: '1px solid rgba(192, 192, 192, 0.15)',
    paddingBottom: '20px',
    flexWrap: 'wrap',
    gap: '16px'
  },
  backLink: {
    color: 'var(--primary)',
    fontSize: '12.5px',
    textDecoration: 'none',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    fontWeight: '700'
  },
  pageTitle: {
    fontSize: '26px',
    fontWeight: '800',
    color: '#F5F3F0',
    margin: '4px 0 6px',
    letterSpacing: '-0.02em'
  },
  pageSubtitle: {
    fontSize: '13.5px',
    color: 'var(--argente)',
    margin: 0,
    maxWidth: '680px'
  },
  refreshBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(192, 192, 192, 0.2)',
    color: '#F5F3F0',
    padding: '8px 14px',
    borderRadius: '8px',
    fontSize: '12px',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  tabsRow: {
    display: 'flex',
    gap: '10px',
    marginBottom: '24px',
    flexWrap: 'wrap'
  },
  tabBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '9px 18px',
    borderRadius: '10px',
    background: 'rgba(28, 21, 18, 0.7)',
    border: '1px solid rgba(192, 192, 192, 0.15)',
    color: 'var(--text-muted)',
    fontSize: '13px',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  activeTabBtn: {
    background: 'linear-gradient(135deg, rgba(229, 169, 60, 0.2) 0%, rgba(217, 119, 6, 0.1) 100%)',
    borderColor: 'var(--primary)',
    color: '#F5F3F0',
    boxShadow: '0 4px 12px rgba(229, 169, 60, 0.15)'
  },
  mainGrid: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1.4fr) minmax(320px, 1fr)',
    gap: '24px',
    alignItems: 'start'
  },
  feedCol: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  searchBar: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    background: 'rgba(28, 21, 18, 0.85)',
    border: '1px solid rgba(192, 192, 192, 0.18)',
    borderRadius: '10px',
    padding: '10px 14px'
  },
  searchInput: {
    background: 'transparent',
    border: 'none',
    outline: 'none',
    color: '#F5F3F0',
    fontSize: '13px',
    width: '100%'
  },
  emptyCard: {
    padding: '48px 24px',
    textAlign: 'center',
    borderRadius: '14px',
    background: 'rgba(28, 21, 18, 0.75)',
    border: '1px solid rgba(192, 192, 192, 0.15)'
  },
  messagesStack: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px'
  },
  messageCard: {
    padding: '18px 20px',
    borderRadius: '14px',
    background: 'rgba(28, 21, 18, 0.8)',
    border: '1px solid rgba(192, 192, 192, 0.18)',
    transition: 'border-color 0.2s'
  },
  msgHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '12px',
    marginBottom: '10px',
    flexWrap: 'wrap'
  },
  categoryTag: {
    fontSize: '11px',
    fontWeight: '800',
    padding: '3px 8px',
    borderRadius: '4px',
    textTransform: 'uppercase',
    letterSpacing: '0.04em'
  },
  msgSubject: {
    fontSize: '15px',
    fontWeight: '800',
    color: '#F5F3F0'
  },
  resolvedBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    background: 'rgba(16, 185, 129, 0.15)',
    color: '#34d399',
    fontSize: '11px',
    fontWeight: '800',
    padding: '3px 8px',
    borderRadius: '9999px',
    border: '1px solid rgba(16, 185, 129, 0.3)'
  },
  openBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    background: 'rgba(229, 169, 60, 0.15)',
    color: '#E5A93C',
    fontSize: '11px',
    fontWeight: '800',
    padding: '3px 8px',
    borderRadius: '9999px',
    border: '1px solid rgba(229, 169, 60, 0.3)'
  },
  resolveToggleBtn: {
    background: 'transparent',
    border: '1px solid rgba(192, 192, 192, 0.2)',
    color: 'var(--argente)',
    fontSize: '11px',
    padding: '3px 8px',
    borderRadius: '6px',
    cursor: 'pointer'
  },
  msgContent: {
    color: '#E5E2DC',
    fontSize: '13.5px',
    lineHeight: '1.6',
    margin: '0 0 14px',
    whiteSpace: 'pre-wrap'
  },
  msgFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTop: '1px solid rgba(255, 255, 255, 0.05)',
    paddingTop: '10px',
    fontSize: '12px'
  },
  senderAvatar: {
    width: '22px',
    height: '22px',
    borderRadius: '50%',
    background: 'rgba(255, 255, 255, 0.08)',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'var(--primary)'
  },
  senderName: {
    fontWeight: '700',
    color: '#F5F3F0'
  },
  roleBadge: {
    fontSize: '10px',
    fontWeight: '700',
    padding: '2px 6px',
    borderRadius: '4px'
  },
  msgDate: {
    color: 'var(--text-muted)'
  },
  formCol: {
  },
  composeCard: {
    padding: '24px',
    borderRadius: '14px',
    background: 'rgba(28, 21, 18, 0.92)',
    border: '1px solid rgba(192, 192, 192, 0.22)',
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.4)'
  },
  composeHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '6px'
  },
  composeTitle: {
    fontSize: '18px',
    fontWeight: '800',
    color: '#F5F3F0',
    margin: 0
  },
  composeHelp: {
    fontSize: '12.5px',
    color: 'var(--argente)',
    margin: '0 0 16px',
    lineHeight: '1.5'
  },
  feedbackBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 14px',
    borderRadius: '8px',
    border: '1px solid',
    fontSize: '12.5px',
    marginBottom: '16px'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px'
  },
  fieldGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px'
  },
  label: {
    fontSize: '12px',
    fontWeight: '700',
    color: '#F5F3F0',
    textTransform: 'uppercase',
    letterSpacing: '0.04em'
  },
  selectInput: {
    background: 'rgba(18, 14, 12, 0.95)',
    border: '1px solid rgba(192, 192, 192, 0.25)',
    borderRadius: '10px',
    color: '#F5F3F0',
    padding: '12px 14px',
    fontSize: '13.5px',
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box'
  },
  textInput: {
    background: 'rgba(18, 14, 12, 0.95)',
    border: '1px solid rgba(192, 192, 192, 0.25)',
    borderRadius: '10px',
    color: '#F5F3F0',
    padding: '12px 14px',
    fontSize: '13.5px',
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box'
  },
  textareaInput: {
    background: 'rgba(18, 14, 12, 0.95)',
    border: '1px solid rgba(192, 192, 192, 0.25)',
    borderRadius: '10px',
    color: '#F5F3F0',
    padding: '12px 14px',
    fontSize: '13.5px',
    outline: 'none',
    resize: 'vertical',
    minHeight: '120px',
    fontFamily: 'inherit',
    lineHeight: '1.6',
    width: '100%',
    boxSizing: 'border-box'
  },
  submitBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    background: 'linear-gradient(135deg, #E5A93C 0%, #D97706 100%)',
    color: '#1a1412',
    border: 'none',
    borderRadius: '10px',
    padding: '14px 20px',
    fontSize: '14px',
    fontWeight: '800',
    cursor: 'pointer',
    marginTop: '6px',
    boxShadow: '0 4px 16px rgba(229, 169, 60, 0.35)',
    transition: 'all 0.2s',
    width: '100%',
    boxSizing: 'border-box'
  }
};

export default StaffChat;
