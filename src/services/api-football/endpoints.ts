import { fetchApi } from './client';
import type { 
  Fixture, 
  TeamStatistics, 
  FixtureStatistic, 
  FixtureOdds, 
  League 
} from './types';

// Obtener ligas disponibles para la temporada actual
export async function getLeagues(season?: number): Promise<Array<{ league: League; country: { name: string; flag: string } }>> {
  const currentSeason = season || 2024; // Plan gratuito: acceso a 2022-2024
  return fetchApi('/leagues', { season: currentSeason, current: 'true' });
}

// Obtener fixtures (partidos) por liga y fecha o rango
export async function getFixtures(params: {
  league?: number;
  season?: number;
  date?: string; // YYYY-MM-DD
  from?: string;
  to?: string;
  status?: string; // NS, 1H, 2H, FT, etc.
  next?: number;
}): Promise<Fixture[]> {
  const queryParams: Record<string, string | number> = {};
  if (params.league) queryParams.league = params.league;
  if (params.season) queryParams.season = params.season;
  if (params.date) queryParams.date = params.date;
  if (params.from) queryParams.from = params.from;
  if (params.to) queryParams.to = params.to;
  if (params.status) queryParams.status = params.status;
  if (params.next) queryParams.next = params.next;

  return fetchApi('/fixtures', queryParams);
}

// Obtener estadísticas de un equipo en una liga/temporada
export async function getTeamStatistics(teamId: number, leagueId: number, season: number): Promise<TeamStatistics> {
  const result = await fetchApi<TeamStatistics>('/teams/statistics', {
    team: teamId,
    league: leagueId,
    season: season,
  });
  return result;
}

// Obtener estadísticas de un fixture específico (tiros, corners, etc.)
export async function getFixtureStatistics(fixtureId: number): Promise<FixtureStatistic[]> {
  return fetchApi('/fixtures/statistics', { fixture: fixtureId });
}

// Obtener los últimos N fixtures de un equipo (para calcular xG estimado)
export async function getTeamLastFixtures(teamId: number, last: number = 8): Promise<Fixture[]> {
  return fetchApi('/fixtures', { team: teamId, last });
}

// Obtener cuotas de un fixture
export async function getFixtureOdds(fixtureId: number): Promise<FixtureOdds[]> {
  return fetchApi('/odds', { fixture: fixtureId, bookmaker: 8 }); // 8 = Bet365
}

// Obtener estadísticas de fixtures pasados de un equipo (para calcular xG)
export async function getTeamFixtureStats(teamId: number, leagueId: number, season: number, last: number = 8): Promise<{
  fixtures: Fixture[];
  stats: FixtureStatistic[][];
}> {
  // Primero obtenemos los últimos fixtures del equipo en esa liga
  const fixtures = await fetchApi<Fixture[]>('/fixtures', {
    team: teamId,
    league: leagueId,
    season: season,
    last,
    status: 'FT', // Solo terminados
  });

  // Luego obtenemos las estadísticas de cada fixture
  const stats: FixtureStatistic[][] = [];
  for (const fixture of fixtures) {
    try {
      const fixtureStats = await getFixtureStatistics(fixture.id);
      stats.push(fixtureStats);
    } catch {
      // Si falla uno, continuamos con los demás
      stats.push([]);
    }
  }

  return { fixtures, stats };
}
