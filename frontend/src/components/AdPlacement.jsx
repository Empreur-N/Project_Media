import React, { useState, useEffect } from 'react';
import { getActiveAds, trackAdClick } from '../services/api';
import { getFullImageUrl, handleImageError } from '../utils/imageUtils';

const AdPlacement = ({ placement, style = {} }) => {
  const [ad, setAd] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAd = async () => {
      try {
        const adsList = await getActiveAds(placement);
        if (adsList && adsList.length > 0) {
          // Choisir une pub au hasard parmi les pubs actives pour cet emplacement
          const randomIndex = Math.floor(Math.random() * adsList.length);
          setAd(adsList[randomIndex]);
        } else {
          setAd(null);
        }
      } catch (error) {
        console.error(`Erreur chargement pub (${placement}):`, error);
        setAd(null);
      } finally {
        setLoading(false);
      }
    };

    fetchAd();
  }, [placement]);

  const handleAdClick = async () => {
    if (!ad) return;
    try {
      // Comptabiliser le clic dans le service de publicité
      await trackAdClick(ad.id);
    } catch (error) {
      console.error("Erreur de traçage de clic pub:", error);
    }
  };

  if (loading || !ad) return null;

  return (
    <div style={{ ...styles.container, ...style }}>
      <span style={styles.sponsorLabel}>Sponsorisé</span>
      <a 
        href={ad.targetUrl} 
        target="_blank" 
        rel="noopener noreferrer" 
        onClick={handleAdClick}
        style={styles.link}
      >
        <img 
          src={getFullImageUrl(ad.imageUrl, 'Économie')} 
          alt={ad.title} 
          className="img-cover-adaptive"
          style={styles.bannerImage} 
          loading="lazy"
          onError={(e) => handleImageError(e, 'Économie')}
        />
      </a>
    </div>
  );
};

const styles = {
  container: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    margin: '20px 0',
    position: 'relative',
  },
  sponsorLabel: {
    fontSize: '9px',
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    marginBottom: '6px',
    alignSelf: 'center',
  },
  link: {
    display: 'block',
    width: '100%',
    maxWidth: '100%',
    overflow: 'hidden',
    borderRadius: '8px',
    border: '1px solid var(--border-color)',
    boxShadow: '0 4px 15px rgba(0,0,0,0.15)',
    transition: 'transform 0.2s',
  },
  bannerImage: {
    width: '100%',
    height: 'auto',
    display: 'block',
    objectFit: 'contain',
  }
};

export default AdPlacement;
