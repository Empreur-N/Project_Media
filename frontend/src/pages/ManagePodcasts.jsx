import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getEpisodes, createEpisode, uploadMedia } from '../services/api';
import { Radio, Plus, Play, Trash, CheckCircle, AlertCircle, FileAudio, FileImage, Clock } from 'lucide-react';

const ManagePodcasts = () => {
  const { user, token } = useAuth();

  const [episodes, setEpisodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  // Form fields
  const [title, setTitle] = useState('');
  const [showTitle, setShowTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Politique');
  const [duration, setDuration] = useState('');
  const [audioFile, setAudioFile] = useState(null);
  const [coverFile, setCoverFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const categories = ["Politique", "Économie", "Société", "Sport", "Culture", "Technologie", "Santé", "Environnement"];

  const fetchEpisodes = async () => {
    setLoading(true);
    try {
      const data = await getEpisodes();
      setEpisodes(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEpisodes();
  }, []);

  const showMessage = (text, type = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 5000);
  };

  const handleCreateEpisode = async (e) => {
    e.preventDefault();
    if (!audioFile) {
      showMessage("Veuillez sélectionner un fichier audio MP3", "error");
      return;
    }

    setUploading(true);
    try {
      // 1. Upload du fichier audio vers media-service
      const audioUploadRes = await uploadMedia(audioFile, null, token);
      const audioUrl = audioUploadRes.fileUrl;

      // 2. Upload de l'image de couverture si présente
      let coverUrl = '';
      if (coverFile) {
        const coverUploadRes = await uploadMedia(coverFile, null, token);
        coverUrl = coverUploadRes.fileUrl;
      }

      // 3. Enregistrer l'épisode dans podcast-service
      const durationSec = parseInt(duration) || 0;
      const episodeData = {
        title,
        showTitle,
        description,
        category,
        durationSeconds: durationSec,
        audioUrl,
        coverUrl
      };

      await createEpisode(episodeData, token);
      showMessage("L'épisode de podcast a été publié avec succès !");
      
      // Reset form
      setTitle('');
      setShowTitle('');
      setDescription('');
      setDuration('');
      setAudioFile(null);
      setCoverFile(null);
      setShowForm(false);
      fetchEpisodes();
    } catch (error) {
      showMessage(error.message, 'error');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="container animate-fade-in" style={styles.container}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Gestion des Podcasts</h1>
          <p style={styles.subtitle}>Uploadez des fichiers audios et publiez de nouveaux épisodes d'émissions</p>
        </div>
        <button 
          onClick={() => setShowForm(!showForm)} 
          className="btn btn-primary"
          style={styles.addBtn}
        >
          <Plus size={18} /> {showForm ? "Annuler" : "Créer un Épisode"}
        </button>
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

      {/* Formulaire de création */}
      {showForm && (
        <form onSubmit={handleCreateEpisode} className="glass-card" style={styles.form}>
          <h3 style={styles.formTitle}>Nouvel Épisode</h3>
          
          <div style={styles.formGrid}>
            <div className="form-group">
              <label className="form-label">Titre de l'épisode *</label>
              <input
                type="text"
                className="form-input"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Le rôle du commerce régional"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Nom de l'émission *</label>
              <input
                type="text"
                className="form-input"
                value={showTitle}
                onChange={(e) => setShowTitle(e.target.value)}
                placeholder="Ex: Décryptage"
                required
              />
            </div>

            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label className="form-label">Description *</label>
              <textarea
                className="form-input"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Présentez brièvement le contenu de l'épisode..."
                rows="3"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Catégorie</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="form-input"
                style={{ appearance: 'auto' }}
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Durée (en secondes) *</label>
              <input
                type="number"
                className="form-input"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="Ex: 1800 (pour 30 minutes)"
                required
              />
            </div>

            {/* Fichiers */}
            <div className="form-group">
              <label className="form-label">Fichier Audio (MP3) *</label>
              <div style={styles.fileInputContainer}>
                <FileAudio size={20} style={{ color: 'var(--primary)' }} />
                <input
                  type="file"
                  accept="audio/*"
                  onChange={(e) => setAudioFile(e.target.files[0])}
                  style={styles.fileInput}
                  required
                />
              </div>
              {audioFile && <span style={styles.fileName}>{audioFile.name}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Image de Couverture (Optionnel)</label>
              <div style={styles.fileInputContainer}>
                <FileImage size={20} style={{ color: 'var(--secondary)' }} />
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setCoverFile(e.target.files[0])}
                  style={styles.fileInput}
                />
              </div>
              {coverFile && <span style={styles.fileName}>{coverFile.name}</span>}
            </div>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={styles.submitBtn}
            disabled={uploading}
          >
            {uploading ? "Upload & Traitement en cours..." : "Publier l'épisode"}
          </button>
        </form>
      )}

      {/* Liste des podcasts existants */}
      <div className="glass-card" style={styles.listCard}>
        <h3 style={styles.listTitle}>Tous les Épisodes</h3>

        {loading ? (
          <p style={{ color: 'var(--text-muted)' }}>Chargement des épisodes...</p>
        ) : episodes.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>Aucun épisode enregistré.</p>
        ) : (
          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Émission</th>
                  <th style={styles.th}>Titre de l'épisode</th>
                  <th style={styles.th}>Catégorie</th>
                  <th style={styles.th}>Durée</th>
                  <th style={styles.th}>Date de publication</th>
                </tr>
              </thead>
              <tbody>
                {episodes.map((ep) => (
                  <tr key={ep.id} style={styles.tr}>
                    <td style={{ ...styles.td, fontWeight: '700', color: 'var(--primary)' }}>{ep.showTitle}</td>
                    <td style={styles.td}>{ep.title}</td>
                    <td style={styles.td}>{ep.category}</td>
                    <td style={styles.td}>{Math.floor(ep.durationSeconds / 60)} min</td>
                    <td style={styles.td}>{new Date(ep.publishDate).toLocaleDateString('fr-FR')}</td>
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
  fileInputContainer: {
    border: '1px dashed var(--border-color)',
    borderRadius: '6px',
    padding: '10px 16px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    cursor: 'pointer',
    position: 'relative',
    background: 'rgba(255,255,255,0.01)',
  },
  fileInput: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    opacity: 0,
    cursor: 'pointer',
  },
  fileName: {
    display: 'block',
    fontSize: '12px',
    color: 'var(--text-muted)',
    marginTop: '6px',
    wordBreak: 'break-all',
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
  }
};

export default ManagePodcasts;
