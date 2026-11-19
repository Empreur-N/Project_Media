import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getAllLives, scheduleLive, updateLiveStatus } from '../services/api';
import { Radio, Plus, Calendar, Clock, Tv, CheckCircle, AlertCircle, Play, Square } from 'lucide-react';

const ManageLives = () => {
  const { user, token } = useAuth();

  const [lives, setLives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  // Form fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [streamUrl, setStreamUrl] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');

  const fetchLives = async () => {
    setLoading(true);
    try {
      const data = await getAllLives();
      setLives(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLives();
  }, []);

  const showMessage = (text, type = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 5000);
  };

  const handleSchedule = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        title,
        description,
        streamUrl,
        startTime: startTime || null,
        endTime: endTime || null,
        status: 'UPCOMING'
      };

      await scheduleLive(payload, token);
      showMessage("La diffusion en direct a été planifiée avec succès !");
      
      // Reset form
      setTitle('');
      setDescription('');
      setStreamUrl('');
      setStartTime('');
      setEndTime('');
      setShowForm(false);
      fetchLives();
    } catch (error) {
      showMessage(error.message, 'error');
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    try {
      const nextStatus = currentStatus === 'UPCOMING' ? 'LIVE' : 'ENDED';
      await updateLiveStatus(id, nextStatus, token);
      showMessage(`Le statut du direct a été mis à jour à : ${nextStatus}`);
      fetchLives();
    } catch (error) {
      showMessage(error.message, 'error');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'LIVE':
        return <span style={{ ...styles.badge, backgroundColor: 'rgba(239, 68, 68, 0.15)', color: 'var(--error)', border: '1px solid rgba(239,68,68,0.3)' }}><Radio size={12} className="pulse" /> EN DIRECT</span>;
      case 'UPCOMING':
        return <span style={{ ...styles.badge, backgroundColor: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6', border: '1px solid rgba(59,130,246,0.3)' }}><Calendar size={12} /> PROGRAMMÉ</span>;
      case 'ENDED':
        return <span style={{ ...styles.badge, backgroundColor: 'rgba(156, 163, 175, 0.15)', color: '#9ca3af', border: '1px solid rgba(156,163,175,0.3)' }}><Square size={12} /> TERMINÉ</span>;
      default:
        return null;
    }
  };

  return (
    <div className="container animate-fade-in" style={styles.container}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>
            {user?.role === 'SUPERVISOR' ? 'Suivi des Directs Radio & TV' : 'Gestion des Directs'}
          </h1>
          <p style={styles.subtitle}>
            {user?.role === 'SUPERVISOR' 
              ? 'Supervision en temps réel des flux de streaming et émissions programmées' 
              : 'Planifiez des émissions télé/radio en direct ou commutez les flux actifs'}
          </p>
        </div>
        {user?.role !== 'SUPERVISOR' && (
          <button 
            onClick={() => setShowForm(!showForm)} 
            className="btn btn-primary"
            style={styles.addBtn}
          >
            <Plus size={18} /> {showForm ? "Annuler" : "Programmer un Direct"}
          </button>
        )}
      </div>

      {/* Messages d'alerte */}
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

      {/* Formulaire de planification */}
      {showForm && (
        <form onSubmit={handleSchedule} className="glass-card" style={styles.form}>
          <h3 style={styles.formTitle}>Programmer une Diffusion</h3>
          
          <div style={styles.formGrid}>
            <div className="form-group">
              <label className="form-label">Titre du direct *</label>
              <input
                type="text"
                className="form-input"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Journal Télévisé 20h"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Lien du flux (Stream URL / YouTube Embed) *</label>
              <input
                type="text"
                className="form-input"
                value={streamUrl}
                onChange={(e) => setStreamUrl(e.target.value)}
                placeholder="Ex: https://www.youtube.com/watch?v=..."
                required
              />
            </div>

            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label className="form-label">Description du programme *</label>
              <textarea
                className="form-input"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Présentez les thèmes qui seront abordés lors de la diffusion..."
                rows="3"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Date & Heure de début *</label>
              <input
                type="datetime-local"
                className="form-input"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Date & Heure de fin (Prévue)</label>
              <input
                type="datetime-local"
                className="form-input"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={styles.submitBtn}
          >
            Enregistrer le programme
          </button>
        </form>
      )}

      {/* Liste des directs existants */}
      <div className="glass-card" style={styles.listCard}>
        <h3 style={styles.listTitle}>Grille des Programmes</h3>

        {loading ? (
          <p style={{ color: 'var(--text-muted)' }}>Chargement de la grille...</p>
        ) : lives.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>Aucune diffusion planifiée.</p>
        ) : (
          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Statut</th>
                  <th style={styles.th}>Programme</th>
                  <th style={styles.th}>Début prévu</th>
                  <th style={styles.th}>Lien du flux</th>
                  <th style={styles.th} style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {lives.map((l) => (
                  <tr key={l.id} style={styles.tr}>
                    <td style={styles.td}>{getStatusBadge(l.status)}</td>
                    <td style={styles.td}>
                      <span style={{ fontWeight: '700', color: 'var(--text-main)' }}>{l.title}</span>
                      <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: 'var(--text-muted)' }}>{l.description}</p>
                    </td>
                    <td style={styles.td}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Clock size={13} style={{ color: 'var(--primary)' }} />
                        {new Date(l.startTime).toLocaleString('fr-FR')}
                      </div>
                    </td>
                    <td style={{ ...styles.td, fontSize: '12px', color: 'var(--text-muted)' }}>{l.streamUrl}</td>
                    <td style={{ ...styles.td, textAlign: 'right' }}>
                      {user?.role === 'SUPERVISOR' ? (
                        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Supervision</span>
                      ) : (
                        <>
                          {l.status === 'UPCOMING' && (
                            <button 
                              onClick={() => handleToggleStatus(l.id, l.status)}
                              className="btn btn-secondary"
                              style={{ ...styles.actionBtn, color: 'var(--error)', borderColor: 'rgba(239, 68, 68, 0.2)' }}
                            >
                              <Play size={12} fill="currentColor" /> Démarrer le live
                            </button>
                          )}
                          {l.status === 'LIVE' && (
                            <button 
                              onClick={() => handleToggleStatus(l.id, l.status)}
                              className="btn btn-secondary"
                              style={{ ...styles.actionBtn, color: 'var(--text-muted)', borderColor: 'var(--border-color)' }}
                            >
                              <Square size={12} fill="currentColor" /> Clôturer
                            </button>
                          )}
                          {l.status === 'ENDED' && (
                            <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontStyle: 'italic' }}>Diffusé</span>
                          )}
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
  addBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '10px 20px',
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
  form: {
    padding: '30px',
    marginBottom: '30px',
  },
  formTitle: {
    fontSize: '18px',
    marginBottom: '24px',
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '20px',
    marginBottom: '24px',
  },
  submitBtn: {
    padding: '12px 28px',
  },
  listCard: {
    padding: '30px',
  },
  listTitle: {
    fontSize: '18px',
    marginBottom: '20px',
  },
  tableWrapper: {
    overflowX: 'auto',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '14px',
  },
  th: {
    textAlign: 'left',
    padding: '12px 16px',
    borderBottom: '2px solid var(--border-color)',
    color: 'var(--text-secondary)',
    fontWeight: '700',
  },
  tr: {
    borderBottom: '1px solid rgba(255,255,255,0.04)',
  },
  td: {
    padding: '14px 16px',
    color: 'var(--text-secondary)',
    verticalAlign: 'middle',
  },
  badge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '11px',
    fontWeight: '700',
  },
  actionBtn: {
    padding: '4px 10px',
    fontSize: '12px',
    borderRadius: '4px',
  }
};

export default ManageLives;
