import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getUsers, updateUserActivation, updateUserRole, deleteUser, register, getUserLoginHistory } from '../services/api';
import { Shield, UserPlus, Trash2, Power, UserCheck, AlertCircle, CheckCircle, Search, Mail, ShieldAlert, Mic, X, Clock, History, Smartphone, Monitor } from 'lucide-react';

const ManageUsers = () => {
  const { token, user: currentUser } = useAuth();
  
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [message, setMessage] = useState({ text: '', type: '' });

  // Creation form state
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('USER');
  const [creating, setCreating] = useState(false);

  const [activeFilter, setActiveFilter] = useState('ALL'); // 'ALL', 'PENDING', 'JOURNALISTS'
  const [mainTab, setMainTab] = useState('ACCOUNTS'); // 'ACCOUNTS' | 'SESSIONS'
  const [sessions, setSessions] = useState([]);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const rolesList = ['VISITOR', 'USER', 'JOURNALIST', 'EDITOR', 'SUPERVISOR', 'ADMIN', 'SUPER_ADMIN'];

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await getUsers(token);
      setUsers(data);
    } catch (error) {
      console.error(error);
      showMessage("Échec de chargement des utilisateurs", "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchSessions = async () => {
    setLoadingSessions(true);
    try {
      const data = await getUserLoginHistory(token);
      setSessions(Array.isArray(data) ? data : []);
    } catch (error) {
      console.warn("Échec de chargement des sessions:", error);
    } finally {
      setLoadingSessions(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchSessions();
  }, []);

  const showMessage = (text, type = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 5000);
  };

  // Création / Pré-création de compte
  const handleCreateUser = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      const registerData = {
        username,
        email,
        password,
        role
      };
      
      // Utilise le endpoint d'inscription générique (qui gère l'état d'activation et le droit de rôle côté Spring Boot)
      const res = await register(registerData);
      
      showMessage(res.message || "Utilisateur créé avec succès !");
      
      // Reset
      setUsername('');
      setEmail('');
      setPassword('');
      setRole('USER');
      setShowForm(false);
      fetchUsers();
    } catch (error) {
      showMessage(error.message, 'error');
    } finally {
      setCreating(false);
    }
  };

  // Activer / Désactiver un compte utilisateur
  const handleToggleActivation = async (userToUpdate) => {
    if (userToUpdate.username === currentUser.username) {
      showMessage("Vous ne pouvez pas désactiver votre propre compte !", "error");
      return;
    }
    try {
      await updateUserActivation(userToUpdate.id, !userToUpdate.active, token);
      showMessage(`Compte de ${userToUpdate.username} ${!userToUpdate.active ? 'activé' : 'désactivé'} avec succès.`);
      fetchUsers();
    } catch (error) {
      showMessage(error.message, 'error');
    }
  };

  // Modifier le rôle
  const handleRoleChange = async (userId, username, newRole) => {
    if (username === currentUser.username) {
      showMessage("Vous ne pouvez pas modifier votre propre rôle !", "error");
      return;
    }
    try {
      await updateUserRole(userId, newRole, token);
      showMessage(`Rôle de ${username} modifié en ${newRole} avec succès.`);
      fetchUsers();
    } catch (error) {
      showMessage(error.message, 'error');
    }
  };

  // Supprimer un utilisateur
  const handleDeleteUser = async (userToDelete) => {
    if (userToDelete.username === currentUser.username) {
      showMessage("Vous ne pouvez pas supprimer votre propre compte !", "error");
      return;
    }
    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer définitivement le compte de ${userToDelete.username} ?`)) {
      return;
    }
    try {
      await deleteUser(userToDelete.id, token);
      showMessage(`Le compte de ${userToDelete.username} a été supprimé.`);
      fetchUsers();
    } catch (error) {
      showMessage(error.message, 'error');
    }
  };

  // Filtrage de recherche et statut
  const filteredUsers = users.filter(u => {
    const matchesSearch = 
      (u.username && u.username.toLowerCase().includes(searchQuery.toLowerCase())) || 
      (u.email && u.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (u.fullName && u.fullName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (u.role && u.role.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    if (activeFilter === 'PENDING') {
      return !u.active;
    }
    if (activeFilter === 'JOURNALISTS') {
      return u.role === 'JOURNALIST' || u.role === 'EDITOR';
    }
    return true;
  });

  const pendingCount = users.filter(u => !u.active).length;

  return (
    <div className="container animate-fade-in admin-page-container">
      <div className="admin-page-header">
        <div>
          <h1 style={styles.title}>Gestion des Rôles & Comptes</h1>
          <p style={styles.subtitle}>
            Activez les comptes des journalistes/rédacteurs pré-inscrits et gérez les autorisations de rôles.
          </p>
        </div>
        <button 
          onClick={() => setShowForm(!showForm)} 
          className={`btn ${showForm ? "btn-secondary" : "btn-primary"}`}
          style={styles.addBtn}
        >
          {showForm ? <X size={18} /> : <UserPlus size={18} />}
          <span>{showForm ? "Annuler" : "Créer/Pré-créer un agent"}</span>
        </button>
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

      {/* Formulaire de création / pré-inscription */}
      {showForm && (
        <form onSubmit={handleCreateUser} className="glass-card animate-fade-in admin-form-card">
          <h3 style={styles.formTitle}>Créer / Pré-inscrire un agent</h3>
          <p style={styles.formSubtitle}>
            Les comptes créés par les administrateurs sont actifs immédiatement. Les comptes pré-inscrits par les journalistes ou rédacteurs requièrent l'activation d'un admin.
          </p>
          
          <div className="admin-form-grid">
            <div className="form-group">
              <label className="form-label">Nom d'utilisateur *</label>
              <input
                type="text"
                className="form-input"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Ex: mika_journalist"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Adresse Email *</label>
              <input
                type="email"
                className="form-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="mika@lifechannel.cd"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Mot de Passe *</label>
              <input
                type="password"
                className="form-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Rôle d'Agent Assigné *</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="form-input"
                style={{ appearance: 'auto' }}
              >
                {rolesList.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary admin-submit-btn" 
            disabled={creating}
          >
            {creating ? "Création en cours..." : "Créer le compte"}
          </button>
        </form>
      )}

      {/* Sélecteur d'onglets principal */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '12px' }}>
        <button
          onClick={() => setMainTab('ACCOUNTS')}
          className={`btn ${mainTab === 'ACCOUNTS' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '14px', padding: '10px 18px' }}
        >
          <Shield size={16} />
          <span>Comptes & Accréditations ({users.length})</span>
        </button>
        <button
          onClick={() => { setMainTab('SESSIONS'); fetchSessions(); }}
          className={`btn ${mainTab === 'SESSIONS' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '14px', padding: '10px 18px' }}
        >
          <History size={16} />
          <span>Journal des Connexions des Agents ({sessions.length})</span>
        </button>
      </div>

      {mainTab === 'ACCOUNTS' && (
        <>
          {/* Filtres Rapides & Barre de Recherche */}
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center', marginBottom: '16px' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button 
            type="button"
            onClick={() => setActiveFilter('ALL')}
            className={`btn ${activeFilter === 'ALL' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ fontSize: '13px', padding: '8px 14px' }}
          >
            Tous les comptes ({users.length})
          </button>
          <button 
            type="button"
            onClick={() => setActiveFilter('PENDING')}
            className={`btn ${activeFilter === 'PENDING' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ 
              fontSize: '13px', 
              padding: '8px 14px',
              backgroundColor: activeFilter === 'PENDING' ? '#f59e0b' : 'rgba(245, 158, 11, 0.1)',
              borderColor: '#f59e0b',
              color: activeFilter === 'PENDING' ? '#000' : '#f59e0b',
              fontWeight: 'bold',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Clock size={14} />
            <span>En attente d'approbation ({pendingCount})</span>
          </button>
          <button 
            type="button"
            onClick={() => setActiveFilter('JOURNALISTS')}
            className={`btn ${activeFilter === 'JOURNALISTS' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ fontSize: '13px', padding: '8px 14px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <Mic size={14} />
            <span>Journalistes & Staff</span>
          </button>
        </div>

        <div style={{ ...styles.searchBar, flex: 1, margin: 0, minWidth: '240px' }}>
          <Search size={18} style={{ color: 'var(--text-muted)', marginLeft: '12px' }} />
          <input 
            type="text" 
            placeholder="Rechercher par nom, email, rôle..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={styles.searchInput}
          />
        </div>
      </div>

      {/* Table des Utilisateurs */}
      <div className="glass-card" style={styles.tableCard}>
        {loading ? (
          <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '20px' }}>Chargement des comptes...</p>
        ) : filteredUsers.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', fontStyle: 'italic', textAlign: 'center', padding: '20px' }}>
            Aucun compte trouvé.
          </p>
        ) : (
          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Identité / Utilisateur</th>
                  <th style={styles.th}>Adresse Email</th>
                  <th style={styles.th}>Statut d'Activation</th>
                  <th style={styles.th}>Rôle Assigné</th>
                  <th style={{ ...styles.th, textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u) => {
                  const isSelf = u.username === currentUser.username;
                  return (
                    <tr key={u.id} style={styles.tr}>
                      <td style={styles.td}>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontWeight: '700', color: 'var(--text-main)', fontSize: '14px' }}>
                              {u.fullName || u.username}
                            </span>
                            {isSelf && <span style={styles.selfBadge}>Moi</span>}
                          </div>
                          {u.fullName && (
                            <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>@{u.username}</span>
                          )}
                        </div>
                      </td>
                      <td style={styles.td}>
                        <span style={styles.emailText}>
                          <Mail size={12} style={{ display: 'inline', marginRight: '6px' }} />
                          {u.email}
                        </span>
                        {u.emailVerified && (
                          <span style={{ marginLeft: '6px', fontSize: '10px', color: '#10b981', fontWeight: 'bold', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                            <CheckCircle size={10} /> OTP Vérifié
                          </span>
                        )}
                      </td>
                      <td style={styles.td}>
                        {u.active ? (
                          <span style={styles.statusActiveBadge}><UserCheck size={12} /> Actif</span>
                        ) : (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={styles.statusPendingBadge}><ShieldAlert size={12} /> En attente</span>
                            <button
                              type="button"
                              onClick={() => handleToggleActivation(u)}
                              style={{
                                background: '#10b981',
                                color: '#ffffff',
                                border: 'none',
                                borderRadius: '6px',
                                padding: '4px 10px',
                                fontSize: '11px',
                                fontWeight: 'bold',
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px'
                              }}
                              title="Valider l'accréditation du journaliste"
                            >
                              <CheckCircle size={12} /> Approuver
                            </button>
                          </div>
                        )}
                      </td>
                      <td style={styles.td}>
                        <select
                          value={u.role}
                          onChange={(e) => handleRoleChange(u.id, u.username, e.target.value)}
                          className="form-input"
                          style={styles.roleSelect}
                          disabled={isSelf}
                        >
                          {rolesList.map(r => (
                            <option key={r} value={r}>{r}</option>
                          ))}
                        </select>
                      </td>
                      <td style={{ ...styles.td, textAlign: 'right' }}>
                        <div style={styles.actions}>
                          <button
                            onClick={() => handleToggleActivation(u)}
                            style={{
                              ...styles.actionBtn,
                              color: u.active ? 'var(--error)' : 'var(--accent)'
                            }}
                            title={u.active ? "Désactiver le compte" : "Activer et valider"}
                            disabled={isSelf}
                          >
                            <Power size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteUser(u)}
                            style={{
                              ...styles.actionBtn,
                              color: 'var(--error)',
                              opacity: isSelf ? 0.3 : 1
                            }}
                            title="Supprimer le compte"
                            disabled={isSelf}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
      </>
      )}

      {/* Onglet 2 : Journal des Connexions & Traçabilité des Sessions */}
      {mainTab === 'SESSIONS' && (
        <div className="glass-card" style={styles.tableCard}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <h3 style={{ margin: '0 0 4px', fontSize: '18px', color: '#fff', fontWeight: '800' }}>
                Journal des Connexions & Sessions des Rédacteurs
              </h3>
              <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-muted)' }}>
                Traçabilité continue de l'heure exacte de connexion, heure de déconnexion et type d'appareil (mobile & desktop).
              </p>
            </div>
            <button onClick={fetchSessions} className="btn btn-secondary" style={{ fontSize: '13px', padding: '8px 14px' }}>
              Actualiser le journal
            </button>
          </div>

          {loadingSessions ? (
            <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '20px' }}>Chargement du journal des sessions...</p>
          ) : sessions.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontStyle: 'italic', textAlign: 'center', padding: '20px' }}>
              Aucune session enregistrée pour le moment.
            </p>
          ) : (
            <div style={styles.tableWrapper}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Agent / Rédacteur</th>
                    <th style={styles.th}>Rôle</th>
                    <th style={styles.th}>Appareil Détecté</th>
                    <th style={styles.th}>Heure de Connexion</th>
                    <th style={styles.th}>Heure de Déconnexion</th>
                    <th style={styles.th}>État</th>
                    <th style={{ ...styles.th, textAlign: 'right' }}>Adresse IP</th>
                  </tr>
                </thead>
                <tbody>
                  {sessions.map((sess) => {
                    const isMobile = sess.deviceType && sess.deviceType.toLowerCase().includes('mobile');
                    const isActive = sess.status === 'ACTIVE' && !sess.logoutTime;
                    return (
                      <tr key={sess.id} style={styles.tr}>
                        <td style={styles.td}>
                          <div style={{ fontWeight: '700', color: 'var(--text-main)' }}>
                            {sess.fullName || sess.username}
                          </div>
                          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>@{sess.username}</div>
                        </td>
                        <td style={styles.td}>
                          <span style={{ fontSize: '12px', padding: '3px 8px', borderRadius: '4px', background: 'rgba(229,169,60,0.1)', color: 'var(--primary)', fontWeight: '700' }}>
                            {sess.role}
                          </span>
                        </td>
                        <td style={styles.td}>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}>
                            {isMobile ? <Smartphone size={16} color="#38bdf8" /> : <Monitor size={16} color="#94a3b8" />}
                            <span>{sess.deviceType || 'Appareil Connecté'}</span>
                          </span>
                        </td>
                        <td style={styles.td}>
                          <span style={{ color: '#10b981', fontWeight: '600' }}>
                            {sess.loginTime ? new Date(sess.loginTime).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'medium' }) : '-'}
                          </span>
                        </td>
                        <td style={styles.td}>
                          {sess.logoutTime ? (
                            <span style={{ color: '#94a3b8' }}>
                              {new Date(sess.logoutTime).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'medium' })}
                            </span>
                          ) : (
                            <span style={{ color: '#10b981', fontStyle: 'italic', fontWeight: '600' }}>
                              Session active
                            </span>
                          )}
                        </td>
                        <td style={styles.td}>
                          {isActive ? (
                            <span style={{ ...styles.statusActiveBadge, backgroundColor: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}>
                              <CheckCircle size={13} /> En ligne
                            </span>
                          ) : (
                            <span style={{ ...styles.statusActiveBadge, backgroundColor: 'rgba(148, 163, 184, 0.1)', color: '#94a3b8', borderColor: 'rgba(148, 163, 184, 0.2)' }}>
                              Clôturée
                            </span>
                          )}
                        </td>
                        <td style={{ ...styles.td, textAlign: 'right', fontFamily: 'monospace', fontSize: '12px', color: 'var(--text-muted)' }}>
                          {sess.ipAddress || '127.0.0.1'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
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
    marginBottom: '6px',
  },
  formSubtitle: {
    fontSize: '13px',
    color: 'var(--text-muted)',
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
  searchBar: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.02)',
    border: '1px solid var(--border-color)',
    borderRadius: '8px',
    marginBottom: '20px',
  },
  searchInput: {
    width: '100%',
    background: 'none',
    border: 'none',
    color: 'var(--text-main)',
    padding: '12px',
    fontSize: '14px',
    outline: 'none',
  },
  tableCard: {
    padding: '20px',
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
  selfBadge: {
    backgroundColor: 'var(--primary-light)',
    color: 'var(--primary)',
    fontSize: '10px',
    fontWeight: '800',
    padding: '2px 6px',
    borderRadius: '4px',
    textTransform: 'uppercase',
  },
  emailText: {
    color: 'var(--text-muted)',
    fontSize: '13px',
  },
  statusActiveBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    color: 'var(--accent)',
    border: '1px solid rgba(16, 185, 129, 0.2)',
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: '700',
  },
  statusPendingBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    color: 'var(--secondary)',
    border: '1px solid rgba(245, 158, 11, 0.2)',
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: '700',
  },
  roleSelect: {
    padding: '6px 12px',
    fontSize: '13px',
    borderRadius: '6px',
    background: 'rgba(10,15,30,0.95)',
    border: '1px solid var(--border-color)',
    color: 'var(--text-main)',
    cursor: 'pointer',
    appearance: 'auto',
  },
  actions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '10px',
  },
  actionBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '6px',
    borderRadius: '4px',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'background-color 0.2s',
    '&:hover': {
      backgroundColor: 'rgba(255,255,255,0.03)',
    }
  }
};

export default ManageUsers;
