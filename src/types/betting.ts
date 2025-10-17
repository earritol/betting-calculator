export interface TeamData {
  name: string;
  goalsFor: number;
  goalsAgainst: number;
}

export interface MatchData {
  local: TeamData;
  visitor: TeamData;
  odds: {
    local: number;
    draw: number;
    visitor: number;
  };
  leagueAverages: {
    avgGoalsFor: number;
    avgGoalsAgainst: number;
  };
}

export interface DixonColesParams {
  lambdaLocal: number;
  lambdaVisitor: number;
  rho: number;
}

export interface Probabilities {
  local: number;
  draw: number;
  visitor: number;
  under25: number;
  over25: number;
}

export interface CalculationResult {
  params: DixonColesParams;
  probabilities: Probabilities;
  value: number;
  kellyPercentage: number;
  suggestedStake: number;
  decision: string;
}