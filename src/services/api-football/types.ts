// Tipos para API-Football v3

export interface League {
  id: number;
  name: string;
  country: string;
  logo: string;
  flag: string;
  season: number;
}

export interface Team {
  id: number;
  name: string;
  logo: string;
}

export interface Fixture {
  id: number;
  date: string;
  status: {
    short: string;
    long: string;
  };
  league: League;
  teams: {
    home: Team;
    away: Team;
  };
  goals: {
    home: number | null;
    away: number | null;
  };
}

export interface TeamStatistics {
  team: Team;
  league: League;
  goals: {
    for: {
      total: { home: number; away: number; total: number };
      average: { home: string; away: string; total: string };
    };
    against: {
      total: { home: number; away: number; total: number };
      average: { home: string; away: string; total: string };
    };
  };
  fixtures: {
    played: { home: number; away: number; total: number };
  };
  penalty: {
    scored: { total: number; percentage: string };
    missed: { total: number; percentage: string };
  };
}

export interface FixtureStatistic {
  team: Team;
  statistics: Array<{
    type: string;
    value: number | string | null;
  }>;
}

export interface OddsValue {
  value: string;
  odd: string;
}

export interface OddsBookmaker {
  id: number;
  name: string;
  bets: Array<{
    id: number;
    name: string;
    values: OddsValue[];
  }>;
}

export interface FixtureOdds {
  fixture: { id: number };
  bookmakers: OddsBookmaker[];
}

// Datos procesados para nuestro modelo
export interface ProcessedMatchData {
  homeTeam: string;
  awayTeam: string;
  goalsFor: { home: number; away: number };
  goalsAgainst: { home: number; away: number };
  odds: { local: number; draw: number; visitor: number };
  leagueAverages: { avgGoalsFor: number; avgGoalsAgainst: number };
  xGEstimated: { home: number; away: number };
  xGAEstimated: { home: number; away: number };
}
