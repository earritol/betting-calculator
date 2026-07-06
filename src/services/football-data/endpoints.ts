import { fetchApi } from './client';
import type { Competition, Standing, Match } from './types';

// Obtener todas las competiciones disponibles
export async function getCompetitions(): Promise<Competition[]> {
  const data = await fetchApi<{ competitions: Competition[] }>('/competitions');
  return data.competitions;
}

// Obtener standings (tabla de posiciones) de una competición
export async function getStandings(competitionCode: string): Promise<Standing[]> {
  const data = await fetchApi<{ standings: Standing[] }>(`/competitions/${competitionCode}/standings`);
  return data.standings;
}

// Obtener partidos de una competición (próximos por defecto)
export async function getMatches(competitionCode: string, params?: {
  status?: string; // SCHEDULED, TIMED, FINISHED
  matchday?: number;
  dateFrom?: string;
  dateTo?: string;
}): Promise<Match[]> {
  let endpoint = `/competitions/${competitionCode}/matches`;
  const queryParts: string[] = [];

  if (params?.status) queryParts.push(`status=${params.status}`);
  if (params?.matchday) queryParts.push(`matchday=${params.matchday}`);
  if (params?.dateFrom) queryParts.push(`dateFrom=${params.dateFrom}`);
  if (params?.dateTo) queryParts.push(`dateTo=${params.dateTo}`);

  if (queryParts.length > 0) {
    endpoint += `?${queryParts.join('&')}`;
  }

  const data = await fetchApi<{ matches: Match[] }>(endpoint);
  return data.matches;
}

// Obtener próximos partidos de una competición (schedulados/timed)
export async function getUpcomingMatches(competitionCode: string): Promise<Match[]> {
  // Buscar partidos de los próximos 14 días
  const today = new Date().toISOString().split('T')[0];
  const twoWeeks = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  return getMatches(competitionCode, {
    dateFrom: today,
    dateTo: twoWeeks,
  });
}

// Obtener partidos de un equipo específico
export async function getTeamMatches(teamId: number, params?: {
  status?: string;
  limit?: number;
}): Promise<Match[]> {
  let endpoint = `/teams/${teamId}/matches`;
  const queryParts: string[] = [];

  if (params?.status) queryParts.push(`status=${params.status}`);
  if (params?.limit) queryParts.push(`limit=${params.limit}`);

  if (queryParts.length > 0) {
    endpoint += `?${queryParts.join('&')}`;
  }

  const data = await fetchApi<{ matches: Match[] }>(endpoint);
  return data.matches;
}
