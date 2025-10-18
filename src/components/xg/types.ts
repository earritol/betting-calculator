export interface MatchStats {
  goals: number;
  xG: number;
  shots: number;
  shotsOnTarget: number;
  corners: number;
  dangerousAttacks: number;
  possession: number;
}

export interface TeamData {
  name: string;
  stats: MatchStats;
}

export interface MatchData {
  home: TeamData;
  away: TeamData;
  minute: number;
}

export interface XGCalculations {
  shotEfficiency: number;
  cornerEfficiency: number;
  attackEfficiency: number;
  expectedxG: number;
  xGDifference: number;
  xGPerMinute: number;
  urgencyFactor: number;
  projectedRemainingGoals: number;
  expectedFinalGoals: number;
  offensiveEfficiency: number;
  confidenceLevel: string;
}

export interface Prediction {
  minGoals: number;
  mostProbable: number;
  maxGoals: number;
  homeWinProb: number;
  drawProb: number;
  awayWinProb: number;
  over05: number;
  over15: number;
  over25: number;
  bothTeamsScore: number;
  bestTeam: string;
  efficiencyDifference: number;
  recommendation: string;
  projectedHomeGoals: number;
  projectedAwayGoals: number;
}