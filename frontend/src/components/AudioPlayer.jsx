import React, { useEffect, useState } from 'react';
import { useAudioPlayer } from '../contexts/AudioPlayerContext';
import { Play, Pause, Volume2, X, Music, Radio, Zap } from 'lucide-react';
import { getMediaUrl as resolveMediaUrl } from '../utils/urlUtils';

const AudioPlayer = () => {
  const { 
    currentEpisode, 
    isPlaying, 
    isRadioLive, 
    radioQuality, 
    toggleRadioQuality, 
    togglePlay, 
    pauseEpisode, 
    audioRef 
  } = useAudioPlayer();
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [visible, setVisible] = useState(false);
  const [coverFailed, setCoverFailed] = useState(false);

  // Gérer la visibilité du lecteur si un épisode ou la radio est sélectionné
  useEffect(() => {
    if (currentEpisode) {
      setVisible(true);
      setCoverFailed(false);
    }
  }, [currentEpisode]);

  // Synchroniser la lecture avec l'état isPlaying
  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(err => {
          console.error("Lecture audio bloquée par le navigateur:", err);
          pauseEpisode();
        });
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, currentEpisode]);

  const handleTimeUpdate = () => {
    if (audioRef.current && !isRadioLive) {
      const cur = audioRef.current.currentTime;
      const dur = audioRef.current.duration || 0;
      setCurrentTime(cur);
      setProgress(dur > 0 ? (cur / dur) * 100 : 0);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current && !isRadioLive) {
      setDuration(audioRef.current.duration || 0);
    }
  };

  const handleSeek = (e) => {
    if (isRadioLive) return; // Pas de seek sur un direct continu
    const bar = e.target;
    const clickX = e.nativeEvent.offsetX;
    const width = bar.clientWidth;
    const newProgress = (clickX / width);
    if (audioRef.current && duration > 0) {
      audioRef.current.currentTime = newProgress * duration;
      setProgress(newProgress * 100);
    }
  };

  const handleVolumeChange = (e) => {
    const vol = parseFloat(e.target.value);
    setVolume(vol);
    if (audioRef.current) {
      audioRef.current.volume = vol;
    }
  };

  const formatTime = (secs) => {
    if (isNaN(secs)) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const getMediaUrl = (url) => {
    return resolveMediaUrl(url);
  };

  const getCoverUrl = (url) => {
    if (!url) return '/logo.png';
    return resolveMediaUrl(url);
  };

  if (!visible || !currentEpisode) {
    return (
      <div style={styles.floatingRadioBar}>
        <button
          onClick={() => {
            setVisible(true);
            playRadio();
          }}
          style={styles.floatingRadioBtn}
          title="Écouter le direct Radio Life Channel 24h/24"
        >
          <span style={styles.pulseRadioDot} />
          <Radio size={16} />
          <span style={styles.floatingRadioText}>
            {isPlaying && isRadioLive ? "Radio en Direct (En cours d'écoute)" : "Écouter la Radio en Direct 24/7"}
          </span>
          <Play size={14} fill="currentColor" style={{ marginLeft: '4px' }} />
        </button>
      </div>
    );
  }

  return (
    <div style={styles.playerContainer} className="glass-card audio-player-fixed">
      <audio
        ref={audioRef}
        src={getMediaUrl(currentEpisode.audioUrl)}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={pauseEpisode}
      />

      <div style={styles.playerContent}>
        {/* Info Épisode ou Radio */}
        <div style={styles.episodeInfo}>
          {currentEpisode.coverUrl && !coverFailed ? (
            <img 
              src={getCoverUrl(currentEpisode.coverUrl)} 
              alt={currentEpisode.title} 
              style={styles.cover} 
              onError={() => setCoverFailed(true)}
            />
          ) : (
            <div style={styles.coverFallback}>
              {isRadioLive ? <Radio size={18} style={{ color: 'var(--secondary)' }} /> : <Music size={16} />}
            </div>
          )}
          <div style={styles.textContainer}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {isRadioLive && (
                <span style={styles.liveBadgeTag}>
                  <span style={styles.pulseDot} /> EN DIRECT 24H/24
                </span>
              )}
              <div style={styles.title}>{currentEpisode.title}</div>
            </div>
            <div style={styles.showTitle}>{currentEpisode.showTitle || "Émission"}</div>
          </div>
        </div>

        {/* Contrôles Principaux */}
        <div style={styles.controlsSection}>
          <div style={styles.buttonsRow}>
            <button onClick={togglePlay} style={styles.playBtn} title={isPlaying ? "Pause" : "Écouter"}>
              {isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" style={{ marginLeft: '2px' }} />}
            </button>
          </div>
          
          {isRadioLive ? (
            <div style={styles.liveIndicatorRow}>
              <div style={styles.waveAnimation}>
                <span className="wave-bar" />
                <span className="wave-bar" />
                <span className="wave-bar" />
                <span className="wave-bar" />
              </div>
              <span style={styles.liveMetaLabel}>Streaming continu haute fidélité</span>
              <button 
                onClick={toggleRadioQuality} 
                style={styles.qualityBtn} 
                title="Basculer entre flux HD 128k et Éco 48k"
              >
                <Zap size={11} /> {radioQuality === 'standard' ? 'HD (128 kbps)' : 'ÉCO (48 kbps)'}
              </button>
            </div>
          ) : (
            <div style={styles.progressRow}>
              <span style={styles.timeLabel}>{formatTime(currentTime)}</span>
              <div style={styles.progressBarWrapper} onClick={handleSeek}>
                <div style={styles.progressBarBackground}>
                  <div style={{ ...styles.progressBarFill, width: `${progress}%` }} />
                </div>
              </div>
              <span style={styles.timeLabel}>{formatTime(duration)}</span>
            </div>
          )}
        </div>

        {/* Volume & Fermer */}
        <div style={styles.rightSection}>
          <div style={styles.volumeWrapper}>
            <Volume2 size={16} style={{ color: 'var(--text-muted)' }} />
            <input 
              type="range" 
              min="0" 
              max="1" 
              step="0.05" 
              value={volume} 
              onChange={handleVolumeChange} 
              style={styles.volumeSlider} 
            />
          </div>
          
          <button onClick={() => setVisible(false)} style={styles.closeBtn} title="Masquer le lecteur">
            <X size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

const styles = {
  playerContainer: {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    height: '80px',
    zIndex: 9999,
    borderTop: '1px solid rgba(192, 192, 192, 0.18)',
    borderRadius: 0,
    background: 'linear-gradient(180deg, rgba(28, 21, 18, 0.98) 0%, rgba(14, 10, 9, 0.98) 100%)',
    boxShadow: '0 -10px 35px rgba(0,0,0,0.6), 0 0 25px rgba(216, 180, 254, 0.1)',
    display: 'flex',
    alignItems: 'center',
    padding: '0 24px',
    boxSizing: 'border-box',
  },
  playerContent: {
    width: '100%',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  episodeInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    flex: '1 1 30%',
    minWidth: 0,
  },
  cover: {
    width: '48px',
    height: '48px',
    borderRadius: '4px',
    objectFit: 'contain',
    background: 'rgba(255,255,255,0.05)',
    padding: '2px',
  },
  coverFallback: {
    width: '48px',
    height: '48px',
    borderRadius: '4px',
    backgroundColor: 'rgba(255,255,255,0.05)',
    border: '1px solid var(--border-color)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'var(--text-muted)',
  },
  textContainer: {
    display: 'flex',
    flexDirection: 'column',
    minWidth: 0,
  },
  title: {
    fontSize: '14px',
    fontWeight: '700',
    color: 'var(--text-main)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  showTitle: {
    fontSize: '11px',
    color: 'var(--primary)',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginTop: '2px',
  },
  controlsSection: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
    flex: '1 1 40%',
  },
  buttonsRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  playBtn: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    backgroundColor: 'var(--primary)',
    color: '#000',
    border: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'transform 0.2s',
  },
  progressRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    width: '100%',
  },
  timeLabel: {
    fontSize: '11px',
    color: 'var(--text-muted)',
    width: '30px',
    textAlign: 'center',
  },
  progressBarWrapper: {
    flex: 1,
    height: '12px',
    display: 'flex',
    alignItems: 'center',
    cursor: 'pointer',
  },
  progressBarBackground: {
    width: '100%',
    height: '4px',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: '2px',
    position: 'relative',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: 'var(--primary)',
    borderRadius: '2px',
    position: 'absolute',
    left: 0,
    top: 0,
  },
  rightSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    flex: '1 1 30%',
    justifyContent: 'flex-end',
  },
  volumeWrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  volumeSlider: {
    width: '80px',
    cursor: 'pointer',
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--text-muted)',
    cursor: 'pointer',
    padding: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  liveBadgeTag: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '2px 8px',
    background: 'rgba(239, 68, 68, 0.15)',
    border: '1px solid rgba(239, 68, 68, 0.3)',
    borderRadius: '12px',
    fontSize: '10px',
    fontWeight: '800',
    color: '#ef4444',
    letterSpacing: '0.5px',
    flexShrink: 0,
  },
  pulseDot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    backgroundColor: '#ef4444',
    boxShadow: '0 0 8px #ef4444',
    animation: 'pulse 1.2s infinite ease-in-out',
  },
  liveIndicatorRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    width: '100%',
    justifyContent: 'center',
  },
  waveAnimation: {
    display: 'flex',
    alignItems: 'flex-end',
    gap: '3px',
    height: '14px',
  },
  liveMetaLabel: {
    fontSize: '12px',
    color: 'var(--text-secondary)',
    fontWeight: '500',
  },
  qualityBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    padding: '4px 10px',
    borderRadius: '16px',
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid var(--border-color)',
    color: 'var(--secondary)',
    fontSize: '11px',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  floatingRadioBar: {
    position: 'fixed',
    bottom: '24px',
    right: '24px',
    zIndex: 9998,
    animation: 'slideUp 0.3s ease-out',
  },
  floatingRadioBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    background: 'linear-gradient(135deg, rgba(42, 31, 26, 0.96) 0%, rgba(18, 14, 12, 0.98) 100%)',
    color: '#ffffff',
    border: '1px solid rgba(216, 180, 254, 0.45)',
    borderRadius: '9999px',
    padding: '10px 20px',
    boxShadow: '0 8px 30px rgba(0, 0, 0, 0.6), 0 0 20px rgba(216, 180, 254, 0.25)',
    cursor: 'pointer',
    fontWeight: '800',
    fontSize: '12px',
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    transition: 'all 0.25s ease',
  },
  pulseRadioDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    backgroundColor: 'var(--primary)',
    boxShadow: '0 0 10px var(--primary)',
    animation: 'pulse 1.2s infinite',
  },
  floatingRadioText: {
    letterSpacing: '0.3px',
  }
};

export default AudioPlayer;
