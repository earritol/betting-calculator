import { useState } from 'react';
import type { MatchData } from '../types/betting';
import type { SelectedMatchData } from '../components/auto/MatchSelector';

export function useAutoFill() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [error, setError] = useState<string | null>(null);

  const fillFromMatch = (data: SelectedMatchData): MatchData | null => {
    setLoading(true);
    setError(null);
    setStatus('Procesando datos...');

    try {
      const { match, homeEntry, awayEntry, leagueAvgGF, leagueAvgGA } = data;

      // GF/GA promedio por partido desde standings
      const homeGamesPlayed = homeEntry?.playedGames || 1;
      const awayGamesPlayed = awayEntry?.playedGames || 1;

      const homeGFAvg = homeEntry ? homeEntry.goalsFor / homeGamesPlayed : leagueAvgGF;
      const homeGAAvg = homeEntry ? homeEntry.goalsAgainst / homeGamesPlayed : leagueAvgGA;
      const awayGFAvg = awayEntry ? awayEntry.goalsFor / awayGamesPlayed : leagueAvgGF;
      const awayGAAvg = awayEntry ? awayEntry.goalsAgainst / awayGamesPlayed : leagueAvgGA;

      const matchData: MatchData = {
        local: {
          name: match.homeTeam.shortName || match.homeTeam.name,
          goalsFor: parseFloat(homeGFAvg.toFixed(2)),
          goalsAgainst: parseFloat(homeGAAvg.toFixed(2)),
          xG: 0, // Manual o futuro scraping
          xGA: 0,
        },
        visitor: {
          name: match.awayTeam.shortName || match.awayTeam.name,
          goalsFor: parseFloat(awayGFAvg.toFixed(2)),
          goalsAgainst: parseFloat(awayGAAvg.toFixed(2)),
          xG: 0,
          xGA: 0,
        },
        odds: { local: 0, draw: 0, visitor: 0 }, // Manual por ahora
        leagueAverages: {
          avgGoalsFor: parseFloat(leagueAvgGF.toFixed(2)),
          avgGoalsAgainst: parseFloat(leagueAvgGA.toFixed(2)),
        },
        weights: { modelo: 0.70, xG: 0.30 },
      };

      setStatus('✅ Datos pre-llenados correctamente. Agrega cuotas y xG manualmente.');
      setLoading(false);
      return matchData;

    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error procesando datos';
      setError(errorMsg);
      setStatus('');
      setLoading(false);
      return null;
    }
  };

  return { fillFromMatch, loading, status, error };
}
