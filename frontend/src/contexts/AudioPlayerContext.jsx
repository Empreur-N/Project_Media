import React, { createContext, useState, useContext, useRef } from 'react';

const AudioPlayerContext = createContext(null);

export const AudioPlayerProvider = ({ children }) => {
  const [currentEpisode, setCurrentEpisode] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRadioLive, setIsRadioLive] = useState(false);
  const [radioQuality, setRadioQuality] = useState('standard'); // 'standard' (128 kbps) ou 'low' (48 kbps)
  const [radioMetadata, setRadioMetadata] = useState({
    title: "LIFE CHANNEL RADIO EN DIRECT",
    showTitle: "Le Journal Continu & Débats de Kinshasa",
    onAir: true
  });
  const audioRef = useRef(null);

  // Configuration des flux radio découplés (Serveur Icecast/AzuraCast direct en HTTPS)
  // Flux de secours public fiable pour garantir une écoute immédiate en local/démo
  const RADIO_STREAMS = {
    standard: "https://icecast.skyrock.net/s/natio_mp3_128k", // Flux direct 128 kbps
    low: "https://icecast.skyrock.net/s/natio_aac_64k"       // Flux compressé basse conso
  };

  const playEpisode = (episode) => {
    setIsRadioLive(false);
    setCurrentEpisode(episode);
    setIsPlaying(true);
  };

  const playRadio = (quality = 'standard') => {
    setIsRadioLive(true);
    setRadioQuality(quality);
    setCurrentEpisode({
      id: 'radio-live',
      title: radioMetadata.title,
      showTitle: radioMetadata.showTitle,
      audioUrl: RADIO_STREAMS[quality] || RADIO_STREAMS.standard,
      isLive: true,
      coverUrl: '/logo.png'
    });
    setIsPlaying(true);
  };

  const toggleRadioQuality = () => {
    const nextQuality = radioQuality === 'standard' ? 'low' : 'standard';
    setRadioQuality(nextQuality);
    if (isRadioLive) {
      playRadio(nextQuality);
    }
  };

  const togglePlay = () => {
    if (!currentEpisode) {
      playRadio();
      return;
    }
    setIsPlaying(!isPlaying);
  };

  const pauseEpisode = () => {
    setIsPlaying(false);
  };

  const resumeEpisode = () => {
    if (currentEpisode) {
      setIsPlaying(true);
    } else {
      playRadio();
    }
  };

  return (
    <AudioPlayerContext.Provider
      value={{
        currentEpisode,
        isPlaying,
        isRadioLive,
        radioQuality,
        radioMetadata,
        setRadioMetadata,
        playEpisode,
        playRadio,
        toggleRadioQuality,
        togglePlay,
        pauseEpisode,
        resumeEpisode,
        setIsPlaying,
        audioRef
      }}
    >
      {children}
    </AudioPlayerContext.Provider>
  );
};

export const useAudioPlayer = () => {
  const context = useContext(AudioPlayerContext);
  if (!context) {
    throw new Error("useAudioPlayer doit être utilisé dans un AudioPlayerProvider");
  }
  return context;
};
