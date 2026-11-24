import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getAllAds, createAd, uploadMedia } from '../services/api';
import { Plus, BarChart3, Image, Link2, CheckCircle, AlertCircle, FileImage, LayoutGrid, Smartphone, X } from 'lucide-react';
import MobileMoneyModal from '../components/MobileMoneyModal';
import { getMediaUrl as resolveMediaUrl } from '../utils/urlUtils';

const ManageAds = () => {
  const { user, token } = useAuth();

  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [paymentCampaign, setPaymentCampaign] = useState(null);
  const [message, setMessage] = useState({ text: '', type: '' });

  // Form fields
  const [title, setTitle] = useState('');
  const [targetUrl, setTargetUrl] = useState('');
  const [placement, setPlacement] = useState('SIDEBAR');
  const [imageFile, setImageFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const placements = [
    { value: 'HEADER', label: 'Bannière Haute (Header)' },
    { value: 'SIDEBAR', label: 'Bannière Latérale (Sidebar)' },
    { value: 'FOOTER', label: 'Bannière Basse (Footer)' }
  ];

  const fetchAds = async () => {
    setLoading(true);
    try {
      const data = await getAllAds(token);
      setAds(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAds();
  }, []);

  const showMessage = (text, type = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 5000);
  };

  const handleCreateAd = async (e) => {
    e.preventDefault();
    if (!imageFile) {
      showMessage("Veuillez sélectionner une image de bannière", "error");
      return;
    }

    setUploading(true);
    try {
      // 1. Upload de la bannière graphique vers media-service
      const imgRes = await uploadMedia(imageFile, null, token);
      const imageUrl = imgRes.fileUrl;

      // 2. Création de la pub dans advertisement-service
      const adData = {
        title,
        targetUrl,
        placement,
        imageUrl
      };

      await createAd(adData, token);
      showMessage("La campagne publicitaire a été publiée avec succès !");

      // Reset
      setTitle('');
      setTargetUrl('');
      setImageFile(null);
      setShowForm(false);
      fetchAds();
    } catch (error) {
      showMessage(error.message, 'error');
    } finally {
      setUploading(false);
    }
  };

  const getCTR = (clicks, impressions) => {
    if (!impressions) return '0.00%';
    const ctr = (clicks / impressions) * 100;
    return `${ctr.toFixed(2)}%`;
  };

  const getMediaUrl = (url) => {
    return resolveMediaUrl(url);
  };

  return (
    <div className="container animate-fade-in admin-page-container">
      <div className="admin-page-header">
        <div>
          <h1 style={styles.title}>
            {user?.role === 'SUPERVISOR' ? 'Suivi Régie Publicitaire' : 'Régie Publicitaire'}
          </h1>
          <p style={styles.subtitle}>
            {user?.role === 'SUPERVISOR'
              ? 'Consultation des campagnes annonceurs, impressions et performances de conversion (CTR)'
              : 'Gérez les bannières publicitaires et suivez les performances de conversion (CTR)'}
          </p>
        </div>
        {user?.role !== 'SUPERVISOR' && (
          <button 
            onClick={() => setShowForm(!showForm)} 
            className={`btn ${showForm ? "btn-secondary" : "btn-primary"}`}
            style={styles.addBtn}
          >
            {showForm ? <X size={18} /> : <Plus size={18} />}
            <span>{showForm ? "Annuler" : "Créer une Campagne"}</span>
          </button>
        )}
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

      {/* Formulaire de création */}
      {showForm && (
        <form onSubmit={handleCreateAd} className="glass-card admin-form-card">
          <h3 style={styles.formTitle}>Nouvelle Bannière</h3>
          
          <div className="admin-form-grid">
            <div className="form-group">
              <label className="form-label">Nom de la campagne *</label>
              <input
                type="text"
                className="form-input"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Campagne Lancement Boisson"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Emplacement *</label>
              <select
                value={placement}
                onChange={(e) => setPlacement(e.target.value)}
                className="form-input"
                style={{ appearance: 'auto' }}
              >
                {placements.map((p) => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Lien de redirection (Target URL) *</label>
              <input
                type="url"
                className="form-input"
                value={targetUrl}
                onChange={(e) => setTargetUrl(e.target.value)}
                placeholder="https://sponsor.com/landing-page"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Image de la Bannière *</label>
              <div style={styles.fileInputContainer}>
                <FileImage size={20} style={{ color: 'var(--primary)' }} />
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImageFile(e.target.files[0])}
                  style={styles.fileInput}
                  required
                />
              </div>
              {imageFile && <span style={styles.fileName}>{imageFile.name}</span>}
            </div>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary admin-submit-btn" 
            disabled={uploading}
          >
            {uploading ? "Publication de la campagne..." : "Lancer la campagne"}
          </button>
        </form>
      )}

      {/* Liste des pubs existantes */}
      <div className="glass-card" style={styles.listCard}>
        <h3 style={styles.listTitle}>Statistiques des Campagnes</h3>

        {loading ? (
          <p style={{ color: 'var(--text-muted)' }}>Chargement des statistiques...</p>
        ) : ads.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>Aucune publicité active.</p>
        ) : (
          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Bannière</th>
                  <th style={styles.th}>Emplacement</th>
                  <th style={styles.th}>Impressions</th>
                  <th style={styles.th}>Clics</th>
                  <th style={styles.th}>CTR</th>
                  <th style={styles.th}>Facturation Mobile Money</th>
                </tr>
              </thead>
              <tbody>
                {ads.map((a) => (
                  <tr key={a.id} style={styles.tr}>
                    <td style={styles.td}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <img 
                          src={getMediaUrl(a.imageUrl)} 
                          alt={a.title} 
                          style={styles.previewImage} 
                        />
                        <div>
                          <span style={{ fontWeight: '700', color: 'var(--text-main)' }}>{a.title}</span>
                          <a 
                            href={a.targetUrl} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            style={{ display: 'block', fontSize: '11px', color: 'var(--primary)', marginTop: '2px' }}
                          >
                            <Link2 size={10} style={{ display: 'inline', marginRight: '4px' }} /> Visiter
                          </a>
                        </div>
                      </div>
                    </td>
                    <td style={styles.td}>
                      <span style={styles.placementBadge}>{a.placement}</span>
                    </td>
                    <td style={{ ...styles.td, fontWeight: '600' }}>{a.impressionCount}</td>
                    <td style={{ ...styles.td, fontWeight: '600' }}>{a.clickCount}</td>
                    <td style={{ ...styles.td, fontWeight: '700', color: 'var(--accent)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <BarChart3 size={14} />
                        {getCTR(a.clickCount, a.impressionCount)}
                      </div>
                    </td>
                    <td style={styles.td}>
                      {a.active ? (
                        <span style={{ color: '#22c55e', fontSize: '11px', fontWeight: '700', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <CheckCircle size={13} /> Actif & Payé
                        </span>
                      ) : user?.role === 'SUPERVISOR' ? (
                        <span style={{ color: '#ff4d4d', fontSize: '11px', fontWeight: '600' }}>
                          En attente paiement
                        </span>
                      ) : (
                        <button
                          onClick={() => setPaymentCampaign(a)}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            backgroundColor: 'rgba(230, 0, 0, 0.15)',
                            border: '1px solid rgba(230, 0, 0, 0.4)',
                            color: '#ff4d4d',
                            borderRadius: '16px',
                            padding: '4px 10px',
                            fontSize: '11px',
                            fontWeight: '700',
                            cursor: 'pointer',
                          }}
                        >
                          <Smartphone size={12} /> Payer (Mobile Money)
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Modal de Facturation Mobile Money */}
        {paymentCampaign && (
          <MobileMoneyModal 
            campaign={paymentCampaign} 
            onClose={() => setPaymentCampaign(null)} 
            onPaymentSuccess={() => {
              fetchAds();
              setPaymentCampaign(null);
            }} 
          />
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
  previewImage: {
    width: '80px',
    height: '40px',
    objectFit: 'cover',
    borderRadius: '4px',
    border: '1px solid var(--border-color)',
    backgroundColor: 'rgba(255,255,255,0.01)',
  },
  placementBadge: {
    display: 'inline-block',
    padding: '3px 8px',
    borderRadius: '4px',
    fontSize: '11px',
    fontWeight: '700',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    border: '1px solid var(--border-color)',
    color: 'var(--text-secondary)',
  }
};

export default ManageAds;
