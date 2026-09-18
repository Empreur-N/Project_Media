import React, { createContext, useContext, useState, useEffect } from 'react';

const DataSaverContext = createContext(null);

export const DataSaverProvider = ({ children }) => {
  const [dataSaver, setDataSaver] = useState(() => {
    return localStorage.getItem('dataSaverMode') === 'true';
  });

  useEffect(() => {
    localStorage.setItem('dataSaverMode', dataSaver ? 'true' : 'false');
  }, [dataSaver]);

  const toggleDataSaver = () => {
    setDataSaver(prev => !prev);
  };

  return (
    <DataSaverContext.Provider value={{ dataSaver, toggleDataSaver }}>
      {children}
    </DataSaverContext.Provider>
  );
};

export const useDataSaver = () => {
  const context = useContext(DataSaverContext);
  if (!context) {
    throw new Error('useDataSaver doit être utilisé dans un DataSaverProvider');
  }
  return context;
};