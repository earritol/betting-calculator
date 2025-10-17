import { createContext, useContext } from 'react';
import type { MatchData, CalculationResult } from '../types/betting';

interface BettingCalculatorContextType {
  matchData: MatchData;
  results: CalculationResult | null;
  updateMatchData: (newData: MatchData) => void;
}

// Creamos un contexto con un valor por defecto que arrojará un error si se usa fuera del proveedor.
const BettingCalculatorContext = createContext<BettingCalculatorContextType | undefined>(undefined);

export const useBettingCalculatorContext = () => {
  const context = useContext(BettingCalculatorContext);
  if (context === undefined) {
    throw new Error('useBettingCalculatorContext must be used within a BettingCalculatorProvider');
  }
  return context;
};

export const BettingCalculatorProvider = BettingCalculatorContext.Provider;