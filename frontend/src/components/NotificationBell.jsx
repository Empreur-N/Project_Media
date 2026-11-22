import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getNotifications, markNotifAsRead } from '../services/api';
import { Bell, Check, MessageCircle, AlertCircle, X } from 'lucide-react';

const NotificationBell = () => {
  const { user, token } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  const fetchNotifs = async () => {
    if (!user || !user.username) return;
    try {
      const data = await getNotifications(user.username);
      if (Array.isArray(data)) {
        setNotifications(data);
      } else {
        setNotifications([]);
      }
    } catch (error) {
      // Fallback silencieux si le service de notifications est hors-ligne
      setNotifications([]);
    }
  };

  useEffect(() => {
    fetchNotifs();
    // Polling toutes les 30 secondes pour les notifications temps réel
    const interval = setInterval(fetchNotifs, 30000);
    return () => clearInterval(interval);
  }, [user]);

  // Fermer le dropdown en cliquant à l'extérieur
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      await markNotifAsRead(id, token);
      setNotifications(prev => 
        (Array.isArray(prev) ? prev : []).map(n => n.id === id ? { ...n, read: true } : n)
      );
      fetchNotifs();
    } catch (error) {
      // Ignore silencieusement
    }
  };

  const safeNotifications = Array.isArray(notifications) ? notifications : [];
  const unreadCount = safeNotifications.filter(n => !n.read).length;

  if (!user) return null;

  return (
    <div ref={dropdownRef} style={styles.container}>
      <button 
        onClick={() => setShowDropdown(!showDropdown)} 
        style={styles.bellBtn}
        title="Notifications"
        aria-label="Notifications"
      >
        <Bell size={15} />
        {unreadCount > 0 && (
          <span style={styles.badge}>{unreadCount}</span>
        )}
      </button>

      {showDropdown && (
        <div className="glass-card dropdown-menu notification-dropdown" style={styles.dropdown}>
          <div style={styles.dropdownHeader}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontWeight: '700' }}>Notifications</span>
              {unreadCount > 0 && (
                <span style={styles.unreadSummary}>{unreadCount} non lue(s)</span>
              )}
            </div>
            <button 
              onClick={() => setShowDropdown(false)}
              style={styles.closeBtn}
              aria-label="Fermer les notifications"
              title="Fermer"
            >
              <X size={15} />
            </button>
          </div>

          <div style={styles.notificationsList}>
            {safeNotifications.length === 0 ? (
              <div style={styles.emptyState}>
                <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Aucune notification récente.</p>
              </div>
            ) : (
              safeNotifications.map((notif) => (
                <div 
                  key={notif.id} 
                  style={{
                    ...styles.notificationItem,
                    backgroundColor: notif.read ? 'transparent' : 'rgba(255,255,255,0.02)'
                  }}
                >
                  <div style={styles.itemBody}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{
                        ...styles.itemTitle,
                        fontWeight: notif.read ? '600' : '800',
                        color: notif.read ? 'var(--text-secondary)' : 'var(--text-main)'
                      }}>
                        {notif.title}
                      </span>
                      {!notif.read && (
                        <button 
                          onClick={() => handleMarkAsRead(notif.id)} 
                          style={styles.markReadBtn} 
                          title="Marquer comme lu"
                        >
                          <Check size={14} />
                        </button>
                      )}
                    </div>
                    <p style={styles.itemText}>{notif.message}</p>
                    <span style={styles.itemDate}>
                      {new Date(notif.createdAt).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  bellBtn: {
    background: 'rgba(255, 255, 255, 0.04)',
    border: '1px solid var(--border-color)',
    color: 'var(--text-main)',
    cursor: 'pointer',
    position: 'relative',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '32px',
    height: '32px',
    padding: 0,
    borderRadius: '50%',
    transition: 'all 0.2s',
    boxSizing: 'border-box',
    flexShrink: 0,
  },
  badge: {
    position: 'absolute',
    top: '-2px',
    right: '-2px',
    backgroundColor: 'var(--error)',
    color: 'white',
    fontSize: '9px',
    fontWeight: '800',
    minWidth: '14px',
    height: '14px',
    borderRadius: '7px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0 3px',
    boxSizing: 'border-box',
    border: '1.5px solid var(--bg-main)',
  },
  dropdown: {
    position: 'absolute',
    top: '44px',
    right: 0,
    width: 'min(320px, calc(100vw - 32px))',
    maxHeight: '400px',
    zIndex: 9999,
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
    padding: 0,
    overflow: 'hidden',
  },
  dropdownHeader: {
    padding: '16px',
    borderBottom: '1px solid var(--border-color)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(10,15,30,0.98)',
  },
  unreadSummary: {
    fontSize: '11px',
    fontWeight: '700',
    color: 'var(--primary)',
  },
  notificationsList: {
    overflowY: 'auto',
    flex: 1,
    backgroundColor: 'rgba(10,15,30,0.95)',
  },
  emptyState: {
    padding: '30px',
    textAlign: 'center',
  },
  notificationItem: {
    display: 'flex',
    padding: '14px 16px',
    borderBottom: '1px solid rgba(255,255,255,0.03)',
    transition: 'background-color 0.2s',
  },
  itemBody: {
    flex: 1,
    minWidth: 0,
  },
  itemTitle: {
    fontSize: '13px',
  },
  itemText: {
    fontSize: '12px',
    color: 'var(--text-secondary)',
    margin: '6px 0',
    lineHeight: '1.4',
  },
  itemDate: {
    fontSize: '10px',
    color: 'var(--text-muted)',
  },
  markReadBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--accent)',
    cursor: 'pointer',
    padding: '4px',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '4px',
    transition: 'background-color 0.2s',
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--text-muted)',
    cursor: 'pointer',
    padding: '4px',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '4px',
    transition: 'color 0.2s, background 0.2s',
  }
};

export default NotificationBell;
