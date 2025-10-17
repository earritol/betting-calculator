import type { MatchData, CalculationResult } from '../types/betting';
import { useState, useEffect } from 'react';
import { calculateDixonColesProbabilities } from '../utils/dixon-coles';


// Añadir función calculateKelly que falta
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

  const calculateAttackDefense = () => {
    const { local, visitor, leagueAverages } = matchData;
    
    const limitValue = (value: number) => Math.min(Math.max(value, 0.7), 1.3);
    
    const attackLocal = limitValue(local.goalsFor / leagueAverages.avgGoalsFor);
    const defenseLocal = limitValue(local.goalsAgainst / leagueAverages.avgGoalsAgainst);
    const attackVisitor = limitValue(visitor.goalsFor / leagueAverages.avgGoalsFor);
    const defenseVisitor = limitValue(visitor.goalsAgainst / leagueAverages.avgGoalsAgainst);

    return { attackLocal, defenseLocal, attackVisitor, defenseVisitor };
  };

  const calculateLambdas = () => {
    const { leagueAverages } = matchData;
    const { attackLocal, defenseLocal, attackVisitor, defenseVisitor } = calculateAttackDefense();

    const lambdaLocal = attackLocal * defenseVisitor * leagueAverages.avgGoalsFor;
    const lambdaVisitor = attackVisitor * defenseLocal * leagueAverages.avgGoalsFor;

    const correctionFactor = 1 - (0.03 * Math.abs(lambdaLocal - lambdaVisitor));
    
    const lambdaLocalAdjusted = lambdaLocal * correctionFactor * 0.8;
    const lambdaVisitorAdjusted = lambdaVisitor * correctionFactor;

    return {
      lambdaLocal: lambdaLocalAdjusted,
      lambdaVisitor: lambdaVisitorAdjusted,
      rho: 0.02
    };
  };

  const calculateResults = () => {
    const params = calculateLambdas();
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

    setResults({
      params,
      probabilities,
      value,
      kellyPercentage,
      suggestedStake,
      decision
    });
  };

  useEffect(() => {
    calculateResults();
  }, [matchData]);

  return {
    matchData,
    results,
    updateMatchData: setMatchData
  };
};