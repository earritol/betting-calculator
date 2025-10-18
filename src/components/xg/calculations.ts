import type { MatchStats, XGCalculations, Prediction } from './types';

export const calculateXGStats = (stats: MatchStats, isHome: boolean, minute: number): XGCalculations => {
  // FACTORES DE CONVERSIÓN EXACTOS de tu Google Sheets
  const shotEfficiency = isHome ? 0.165 : 0.158;
  const cornerEfficiency = isHome ? 0.035 : 0.032;
  const attackEfficiency = isHome ? 0.028 : 0.025;

  // xG REAL DEBERÍA SER (fórmula exacta)
  const expectedxG = 
    (stats.shotsOnTarget * shotEfficiency) +
    (stats.corners * cornerEfficiency) +
    (stats.dangerousAttacks * attackEfficiency);

  const xGDifference = expectedxG - stats.xG;
  
  // VELOCIDAD xG POR MINUTO
  const xGPerMinute = minute > 0 ? expectedxG / minute : 0;
  
  // FACTOR URGENCIA (basado en marcador)
  const urgencyFactor = calculateUrgencyFactor(stats.goals, isHome);
  
  // PROYECCIÓN GOLES RESTANTES (90 minutos total)
  const remainingMinutes = Math.max(0, 90 - minute);
  const projectedRemainingGoals = xGPerMinute * remainingMinutes * urgencyFactor;
  
  // GOLES ESPERADOS FINALES
  const expectedFinalGoals = stats.goals + projectedRemainingGoals;

  // EFICIENCIA OFENSIVA
  const offensiveEfficiency = stats.shots > 0 ? (stats.goals / stats.shots) * 100 : 0;

  // NIVEL DE CONFIANZA
  const confidenceLevel = calculateConfidenceLevel(minute);

  return {
    shotEfficiency,
    cornerEfficiency,
    attackEfficiency,
    expectedxG,
    xGDifference,
    xGPerMinute,
    urgencyFactor,
    projectedRemainingGoals,
    expectedFinalGoals,
    offensiveEfficiency,
    confidenceLevel
  };
};

export const calculatePredictions = (
  homeStats: MatchStats, 
  awayStats: MatchStats, 
  minute: number
): Prediction => {
  const homeXG = calculateXGStats(homeStats, true, minute);
  const awayXG = calculateXGStats(awayStats, false, minute);

  // GOLES ESPERADOS FINALES (usando xG real debería ser)
  const homeFinalGoals = homeXG.expectedxG;
  const awayFinalGoals = awayXG.expectedxG;

  // MÍNIMO, MÁS PROBABLE Y MÁXIMO
  const homeMin = Math.floor(homeFinalGoals);
  const homeMostProbable = Math.round(homeFinalGoals);
  const homeMax = Math.ceil(homeFinalGoals + 0.3);
  
 /*  const awayMin = Math.floor(awayFinalGoals);
  const awayMostProbable = Math.round(awayFinalGoals);
  const awayMax = Math.ceil(awayFinalGoals + 0.3); */

  // PROBABILIDADES USANDO POISSON
  const poisson = (k: number, lambda: number): number => {
    return (Math.exp(-lambda) * Math.pow(lambda, k)) / factorial(k);
  };

  let homeWinProb = 0;
  let drawProb = 0;
  let awayWinProb = 0;
  let bothTeamsScore = 0;
  let over05 = 0, over15 = 0, over25 = 0;

  // Calcular probabilidades para diferentes marcadores
  for (let i = 0; i <= 5; i++) {
    for (let j = 0; j <= 5; j++) {
      const prob = poisson(i, homeFinalGoals) * poisson(j, awayFinalGoals);
      const totalGoals = i + j;
      
      if (i > j) homeWinProb += prob;
      else if (i === j) drawProb += prob;
      else awayWinProb += prob;
      
      if (i > 0 && j > 0) bothTeamsScore += prob;
      if (totalGoals > 0.5) over05 += prob;
      if (totalGoals > 1.5) over15 += prob;
      if (totalGoals > 2.5) over25 += prob;
    }
  }

  // EQUIPO CON MEJOR PROYECCIÓN
  const efficiencyDifference = homeXG.expectedxG - awayXG.expectedxG;
  const bestTeam = efficiencyDifference > 0 ? 'LOCAL' : 'VISITANTE';
  
  // RECOMENDACIÓN
  const recommendation = homeXG.xGDifference > 0.5 
    ? 'ESPERAR MÁS GOLES LOCAL'
    : awayXG.xGDifference > 0.5 
    ? 'ESPERAR MÁS GOLES VISITANTE'
    : 'MANTENER EXPECTATIVAS';

  return {
    minGoals: homeMin,
    mostProbable: homeMostProbable,
    maxGoals: homeMax,
    homeWinProb,
    drawProb,
    awayWinProb,
    over05,
    over15,
    over25,
    bothTeamsScore,
    bestTeam,
    efficiencyDifference: Math.abs(efficiencyDifference),
    recommendation,
    projectedHomeGoals: homeXG.expectedxG,
    projectedAwayGoals: awayXG.expectedxG
  };
};

// Funciones auxiliares
const calculateUrgencyFactor = (goals: number, isHome: boolean): number => {
  // Simplificado - en tu Google Sheets es más complejo
  console.log(goals, isHome);
  return 1.0; // Por defecto
};

const calculateConfidenceLevel = (minute: number): string => {
  if (minute < 30) return 'BAJA';
  if (minute < 60) return 'MEDIA';
  return 'ALTA';
};

const factorial = (n: number): number => {
  if (n === 0 || n === 1) return 1;
  let result = 1;
  for (let i = 2; i <= n; i++) {
    result *= i;
  }
  return result;
};