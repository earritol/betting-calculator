import { useState, useEffect, useMemo } from 'react';
import type { MatchData, CalculationResult } from '../types/betting';
import { calculateDixonColesProbabilities } from '../utils/dixon-coles';

const calculateKelly = (probability: number, odds: number): number => {
  if (odds <= 1 || probability <= 0) return 0;
  const edge = (probability * odds) - 1;
  if (edge <= 0) return 0;
  const kellyFraction = edge / (odds - 1);
  return Math.min(kellyFraction, 0.10);
};

const initialMatchData: MatchData = {
  local: { name: 'Local', goalsFor: 2.2, goalsAgainst: 1.1 },
  visitor: { name: 'Visitante', goalsFor: 1.6, goalsAgainst: 1.3 },
  odds: { local: 2.4, draw: 3.5, visitor: 2.8 },
  leagueAverages: { avgGoalsFor: 1.65, avgGoalsAgainst: 1.42 }
};

export const useBettingCalculator = () => {
  const [matchData, setMatchData] = useState<MatchData>(initialMatchData);
  const [results, setResults] = useState<CalculationResult | null>(null);

  // El cálculo se ejecuta cada vez que matchData cambia.
  useEffect(() => {
    const calculateResults = () => {
      try {
        console.log('🧮 Recalculando con datos:', matchData);
        
        // Calcular fuerzas
        const limitValue = (value: number) => Math.min(Math.max(value, 0.7), 1.3);
        const attackLocal = limitValue(matchData.local.goalsFor / matchData.leagueAverages.avgGoalsFor);
        const defenseLocal = limitValue(matchData.local.goalsAgainst / matchData.leagueAverages.avgGoalsAgainst);
        const attackVisitor = limitValue(matchData.visitor.goalsFor / matchData.leagueAverages.avgGoalsFor);
        const defenseVisitor = limitValue(matchData.visitor.goalsAgainst / matchData.leagueAverages.avgGoalsAgainst);

        // Calcular lambdas
        const lambdaLocal = attackLocal * defenseVisitor * matchData.leagueAverages.avgGoalsFor;
        const lambdaVisitor = attackVisitor * defenseLocal * matchData.leagueAverages.avgGoalsFor;
        const correctionFactor = 1 - (0.03 * Math.abs(lambdaLocal - lambdaVisitor));
        const lambdaLocalAdjusted = lambdaLocal * correctionFactor * 0.8;
        const lambdaVisitorAdjusted = lambdaVisitor * correctionFactor;

        const params = {
          lambdaLocal: lambdaLocalAdjusted,
          lambdaVisitor: lambdaVisitorAdjusted,
          rho: 0.02
        };

        const probabilities = calculateDixonColesProbabilities(
          params.lambdaLocal,
          params.lambdaVisitor,
          params.rho
        );

        const value = (probabilities.local * matchData.odds.local) - 1;
        const kellyPercentage = calculateKelly(probabilities.local, matchData.odds.local);
        const suggestedStake = Math.min(kellyPercentage * 100, 10);

        let decision = 'NO APOSTAR';
        if (value > 0.1) decision = 'APOSTAR';
        else if (value > 0.05) decision = 'CONSIDERAR';

        const newResults = {
          params,
          probabilities,
          value,
          kellyPercentage,
          suggestedStake,
          decision
        };

        console.log('📊 Resultados calculados:', newResults);
        setResults(newResults);
        
      } catch (error) {
        console.error('Error en cálculos:', error);
        setResults(null);
      }
    };

    calculateResults();
  }, [matchData]); // Solo depende de matchData

  const updateMatchData = (newData: MatchData) => {
    console.log('📝 Actualizando datos:', newData);
    setMatchData(newData);
  };

  // Usamos useMemo para asegurar que el objeto de contexto no se recree innecesariamente
  const contextValue = useMemo(() => ({
      matchData,
      results,
      updateMatchData,
  }), [matchData, results]);

  return contextValue;
};