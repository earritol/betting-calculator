import React, { createContext, useContext, useState } from 'react';
import { AppModule } from '../types/betting';

interface NavigationContextType {
  currentModule: AppModule;
  setCurrentModule: (module: AppModule) => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export const NavigationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentModule, setCurrentModule] = useState<AppModule>(AppModule.DIXON_COLES);

  return (
    <NavigationContext.Provider value={{ currentModule, setCurrentModule }}>
      {children}
    </NavigationContext.Provider>
  );
};

export const useNavigation = () => {
  const context = useContext(NavigationContext);
  if (context === undefined) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
};