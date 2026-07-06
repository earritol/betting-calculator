import type { FixtureStatistic } from './types';

// Coeficientes para el cálculo de xG estimado
// Calibrados contra datos reales de xG (Understat) en Premier League
const COEFFICIENTS = {
  shotsOnTarget: 0.120,
  shotsOffTarget: 0.030,
  blockedShots: 0.025,
  corners: 0.035,
  dangerousAttacks: 0.015,
  penalty: 0.760,
};

interface XGEstimateResult {
  xG: number;
  xGA: number;
  matchesAnalyzed: number;
}

// Extrae un valor numérico de las estadísticas de un fixture
function getStatValue(stats: FixtureStatistic, type: string): number {
  const stat = stats.statistics.find(s => s.type === type);
  if (!stat || stat.value === null) return 0;
  if (typeof stat.value === 'number') return stat.value;
  // Algunos valores vienen como "65%" → extraer número
  const parsed = parseFloat(String(stat.value));
  return isNaN(parsed) ? 0 : parsed;
}

// Calcula el xG estimado de un equipo en un partido usando sus estadísticas
function calculateMatchXG(teamStats: FixtureStatistic): number {
  const shotsOnTarget = getStatValue(teamStats, 'Shots on Goal');
  const shotsOffTarget = getStatValue(teamStats, 'Shots off Goal');
  const blockedShots = getStatValue(teamStats, 'Blocked Shots');
  const corners = getStatValue(teamStats, 'Corner Kicks');
  // API-Football no tiene "dangerous attacks" directamente, pero podemos usar Total Shots como proxy adicional
  const totalShots = getStatValue(teamStats, 'Total Shots');
  
  // Fórmula de xG estimado
  let xG = 
    (shotsOnTarget * COEFFICIENTS.shotsOnTarget) +
    (shotsOffTarget * COEFFICIENTS.shotsOffTarget) +
    (blockedShots * COEFFICIENTS.blockedShots) +
    (corners * COEFFICIENTS.corners);

  // Si no tenemos desglose de tiros pero sí total, usar aproximación
  if (shotsOnTarget === 0 && shotsOffTarget === 0 && totalShots > 0) {
    // Aproximación: ~35% de tiros van a puerta en promedio
    const estimatedOnTarget = totalShots * 0.35;
    const estimatedOffTarget = totalShots * 0.65;
    xG = 
      (estimatedOnTarget * COEFFICIENTS.shotsOnTarget) +
      (estimatedOffTarget * COEFFICIENTS.shotsOffTarget) +
      (corners * COEFFICIENTS.corners);
  }

  return Math.max(xG, 0.01);
}

// Calcula xG y xGA promedio de los últimos N partidos de un equipo
export function estimateTeamXG(
  fixtureStats: FixtureStatistic[][],
  teamId: number
): XGEstimateResult {
  let totalXG = 0;
  let totalXGA = 0;
  let matchesAnalyzed = 0;

  for (const matchStats of fixtureStats) {
    if (matchStats.length < 2) continue;

    // Encontrar stats del equipo y del rival
    const teamStat = matchStats.find(s => s.team.id === teamId);
    const rivalStat = matchStats.find(s => s.team.id !== teamId);

    if (!teamStat || !rivalStat) continue;

    totalXG += calculateMatchXG(teamStat);
    totalXGA += calculateMatchXG(rivalStat);
    matchesAnalyzed++;
  }

  if (matchesAnalyzed === 0) {
    return { xG: 0, xGA: 0, matchesAnalyzed: 0 };
  }

  return {
    xG: totalXG / matchesAnalyzed,
    xGA: totalXGA / matchesAnalyzed,
    matchesAnalyzed,
  };
}
