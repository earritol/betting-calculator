// Tipos para football-data.org v4

export interface Competition {
  id: number;
  name: string;
  code: string;
  type: string;
  emblem: string;
  area: {
    id: number;
    name: string;
    flag: string;
  };
  currentSeason: {
    id: number;
    startDate: string;
    endDate: string;
    currentMatchday: number;
  };
}

export interface StandingTeam {
  id: number;
  name: string;
  shortName: string;
  tla: string;
  crest: string;
}

export interface TableEntry {
  position: number;
  team: StandingTeam;
  playedGames: number;
  won: number;
  draw: number;
  lost: number;
  points: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
}

export interface Standing {
  stage: string;
  type: string;
  group: string | null;
  table: TableEntry[];
}

export interface MatchTeam {
  id: number;
  name: string;
  shortName: string;
  tla: string;
  crest: string;
}

export interface Match {
  id: number;
  utcDate: string;
  status: string; // SCHEDULED, TIMED, IN_PLAY, PAUSED, FINISHED, etc.
  matchday: number;
  competition: {
    id: number;
    name: string;
    emblem: string;
  };
  homeTeam: MatchTeam;
  awayTeam: MatchTeam;
  score: {
    fullTime: { home: number | null; away: number | null };
    halfTime: { home: number | null; away: number | null };
  };
}

// Ligas disponibles en el plan gratuito
export const FREE_COMPETITIONS = [
  { id: 2001, code: 'CL', name: 'Champions League', country: 'Europe' },
  { id: 2002, code: 'BL1', name: 'Bundesliga', country: 'Germany' },
  { id: 2003, code: 'DED', name: 'Eredivisie', country: 'Netherlands' },
  { id: 2013, code: 'BSA', name: 'Serie A', country: 'Brazil' },
  { id: 2014, code: 'PD', name: 'La Liga', country: 'Spain' },
  { id: 2015, code: 'FL1', name: 'Ligue 1', country: 'France' },
  { id: 2016, code: 'ELC', name: 'Championship', country: 'England' },
  { id: 2017, code: 'PPL', name: 'Primeira Liga', country: 'Portugal' },
  { id: 2019, code: 'SA', name: 'Serie A', country: 'Italy' },
  { id: 2021, code: 'PL', name: 'Premier League', country: 'England' },
  { id: 2000, code: 'WC', name: 'World Cup', country: 'World' },
  { id: 2018, code: 'EC', name: 'European Championship', country: 'Europe' },
] as const;
