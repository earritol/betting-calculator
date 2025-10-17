import type { DixonColesParams, Probabilities } from '../types/betting';
import { poissonPDF } from './poisson';

export function calculateDixonColesProbabilities(
  lambdaLocal: number,
  lambdaVisitor: number,
  rho: number = 0.02
): Probabilities {
  // Validar y limitar parámetros
  const localLambda = Math.max(lambdaLocal, 0.1);
  const visitorLambda = Math.max(lambdaVisitor, 0.1);
  const correlation = Math.max(Math.min(rho, 0.15), -0.15);
  
  let probLocal = 0;
  let probDraw = 0;
  let probVisitor = 0;
  let probUnder25 = 0;
  let probOver25 = 0;
  
  // Aumentar rango a 12 goles
  for (let i = 0; i < 12; i++) {
    for (let j = 0; j < 12; j++) {
      const baseProb = poissonPDF(i, localLambda) * poissonPDF(j, visitorLambda);
      
      // Ajuste Dixon-Coles
      let tau = 1;
      if (i === 0 && j === 0) {
        tau = 1 - (localLambda * visitorLambda * correlation);
      } else if (i === 0 && j === 1) {
        tau = 1 + (localLambda * correlation);
      } else if (i === 1 && j === 0) {
        tau = 1 + (visitorLambda * correlation);
      } else if (i === 1 && j === 1) {
        tau = 1 - correlation;
      }
      
      const adjustedProb = baseProb * tau;
      
      // Acumular probabilidades
      if (i > j) probLocal += adjustedProb;
      if (i === j) probDraw += adjustedProb;
      if (i < j) probVisitor += adjustedProb;
      
      // Over/Under 2.5
      if (i + j < 2.5) probUnder25 += adjustedProb;
      if (i + j > 2.5) probOver25 += adjustedProb;
    }
  }
  
  // Normalizar
  const total = probLocal + probDraw + probVisitor;
  if (total === 0) {
    // Fallback a Poisson simple
    return {
      local: 0.5,
      draw: 0.3,
      visitor: 0.2,
      under25: 0,
      over25: 0
    };
  }
  
  return {
    local: probLocal / total,
    draw: probDraw / total,
    visitor: probVisitor / total,
    under25: probUnder25 / total,
    over25: probOver25 / total
  };
}