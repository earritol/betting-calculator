export type TeamSide = 'home' | 'away';

export type BodyPart = 'foot' | 'head' | 'other';

export type GameSituation = 'open_play' | 'counter_attack' | 'set_piece' | 'penalty';

export type AssistType = 'cross' | 'through_ball' | 'normal' | 'none';

export interface FieldPosition {
  x: number; // 0-100 (0 = línea de fondo propia, 100 = línea de fondo rival)
  y: number; // 0-100 (0 = banda izquierda, 100 = banda derecha)
}

export interface MatchEvent {
  id: string;
  minute: number;
  team: TeamSide;
  player: string;
  type: 'shot' | 'goal' | 'miss' | 'chance';
  position: FieldPosition;
  bodyPart: BodyPart;
  situation: GameSituation;
  assisted: boolean;
  assistType?: AssistType;
  xG: number; // Calculado automáticamente
  result?: 'goal' | 'miss' | 'saved' | 'blocked';
}

export interface TeamStats {
  name: string;
  xG: number;
  shots: number;
  shotsOnTarget: number;
  goals: number;
}

export interface LiveMatch {
  homeTeam: TeamStats;
  awayTeam: TeamStats;
  events: MatchEvent[];
  currentMinute: number;
  status: 'not_started' | 'live' | 'halftime' | 'finished';
}

export interface xGProbabilities {
  home: number;
  draw: number;
  away: number;
  homeGoals: number;
  awayGoals: number;
}