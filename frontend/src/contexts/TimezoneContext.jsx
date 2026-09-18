import React, { createContext, useContext, useState, useEffect } from 'react';
import { RDC_TIMEZONES } from '../utils/timeUtils';

const TimezoneContext = createContext(null);

export const TimezoneProvider = ({ children }) => {
  const [timezone, setTimezoneState] = useState(() => {
    return localStorage.getItem('userRdcTimezone') || 'KINSHASA';
  });

  useEffect(() => {
    localStorage.setItem('userRdcTimezone', timezone);
  }, [timezone]);

  const toggleTimezone = () => {
    setTimezoneState((prev) => (prev === 'KINSHASA' ? 'LUBUMBASHI' : 'KINSHASA'));
  };

  const setTimezone = (key) => {
    if (RDC_TIMEZONES[key]) {
      setTimezoneState(key);
    }
  };

  const currentDetails = RDC_TIMEZONES[timezone] || RDC_TIMEZONES.KINSHASA;

  return (
    <TimezoneContext.Provider value={{ timezone, toggleTimezone, setTimezone, currentDetails }}>
      {children}
    </TimezoneContext.Provider>
  );
};

export const useTimezone = () => {
  const context = useContext(TimezoneContext);
  if (!context) {
    throw new Error('useTimezone doit être utilisé à l\'intérieur d\'un TimezoneProvider');
  }
  return context;
};