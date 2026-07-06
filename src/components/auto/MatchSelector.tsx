import React, { useState, useEffect } from 'react';
import { getUpcomingMatches, getStandings } from '../../services/football-data/endpoints';
import { hasApiKey } from '../../services/football-data/client';
import { FREE_COMPETITIONS } from '../../services/football-data/types';
import type { Match, Standing, TableEntry } from '../../services/football-data/types';

export interface SelectedMatchData {
  match: Match;
  homeEntry: TableEntry | null;
  awayEntry: TableEntry | null;
  leagueAvgGF: number;
  leagueAvgGA: number;
}

interface MatchSelectorProps {
  onMatchSelected: (data: SelectedMatchData) => void;
  isLoading: boolean;
}

export const MatchSelector: React.FC<MatchSelectorProps> = ({ onMatchSelected, isLoading }) => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [standings, setStandings] = useState<Standing[]>([]);
  const [selectedCompetition, setSelectedCompetition] = useState<string>('');
  const [selectedMatchId, setSelectedMatchId] = useState<number | null>(null);
  const [loadingMatches, setLoadingMatches] = useState(false);
  const [loadingStandings, setLoadingStandings] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cargar standings cuando se selecciona una competición
  useEffect(() => {
    if (!selectedCompetition) return;

    const loadStandings = async () => {
      setLoadingStandings(true);
      try {
        const data = await getStandings(selectedCompetition);
        setStandings(data);
      } catch (err) {
        // Algunas competiciones (copas) no tienen standings
        setStandings([]);
        console.warn('No standings for this competition:', err);
      } finally {
        setLoadingStandings(false);
      }
    };

    loadStandings();
  }, [selectedCompetition]);

  const handleCompetitionChange = async (code: string) => {
    setSelectedCompetition(code);
    setMatches([]);
    setSelectedMatchId(null);
    setError(null);

    if (!code) return;

    setLoadingMatches(true);
    try {
      const data = await getUpcomingMatches(code);
      setMatches(data.filter(m => m.status === 'TIMED' || m.status === 'SCHEDULED'));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error cargando partidos');
    } finally {
      setLoadingMatches(false);
    }
  };

  const handleMatchSelect = (match: Match) => {
    setSelectedMatchId(match.id);

    // Buscar equipos en standings para obtener GF/GA
    const mainTable = standings.find(s => s.type === 'TOTAL')?.table || standings[0]?.table || [];
    
    const homeEntry = mainTable.find(e => e.team.id === match.homeTeam.id) || null;
    const awayEntry = mainTable.find(e => e.team.id === match.awayTeam.id) || null;

    // Calcular promedios de liga
    let leagueAvgGF = 1.5;
    let leagueAvgGA = 1.5;
    if (mainTable.length > 0) {
      const totalGames = mainTable.reduce((sum, e) => sum + e.playedGames, 0);
      const totalGF = mainTable.reduce((sum, e) => sum + e.goalsFor, 0);
      if (totalGames > 0) {
        leagueAvgGF = totalGF / totalGames;
        leagueAvgGA = leagueAvgGF; // En una liga, GF total = GA total
      }
    }

    onMatchSelected({ match, homeEntry, awayEntry, leagueAvgGF, leagueAvgGA });
  };

  if (!hasApiKey()) return null;

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 mb-8">
      <div className="flex items-center mb-6">
        <div className="w-2 h-8 bg-blue-500 rounded-full mr-3"></div>
        <h2 className="text-xl font-bold text-gray-800">Seleccionar Partido</h2>
      </div>

      {error && (
        <div className="bg-red-50 p-3 rounded-lg border border-red-200 mb-4">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Selector de Liga */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Liga</label>
        <select
          value={selectedCompetition}
          onChange={(e) => handleCompetitionChange(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
        >
          <option value="">— Selecciona una liga —</option>
          {FREE_COMPETITIONS.map((comp) => (
            <option key={comp.id} value={comp.code}>
              {comp.country} — {comp.name}
            </option>
          ))}
        </select>
      </div>

      {/* Lista de partidos */}
      {selectedCompetition && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Próximos Partidos
          </label>
          {loadingMatches || loadingStandings ? (
            <div className="flex items-center text-sm text-gray-500 py-3">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500 mr-2"></div>
              Cargando...
            </div>
          ) : matches.length === 0 ? (
            <p className="text-sm text-gray-500 py-2">No hay partidos próximos en esta liga</p>
          ) : (
            <div className="space-y-2 max-h-72 overflow-y-auto">
              {matches.map((match) => {
                const date = new Date(match.utcDate);
                const dateStr = date.toLocaleDateString('es', { weekday: 'short', day: 'numeric', month: 'short' });
                const timeStr = date.toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' });

                return (
                  <button
                    key={match.id}
                    onClick={() => handleMatchSelect(match)}
                    disabled={isLoading}
                    className={`w-full p-3 rounded-lg border-2 text-left transition-all ${
                      selectedMatchId === match.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 bg-gray-50 hover:bg-gray-100'
                    } ${isLoading ? 'opacity-50 cursor-wait' : ''}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 flex-1">
                        <span className="text-sm font-medium text-gray-800 text-right flex-1">
                          {match.homeTeam.shortName || match.homeTeam.name}
                        </span>
                        <span className="text-xs text-gray-400 font-bold px-2">vs</span>
                        <span className="text-sm font-medium text-gray-800 text-left flex-1">
                          {match.awayTeam.shortName || match.awayTeam.name}
                        </span>
                      </div>
                      <span className="text-xs text-gray-500 ml-3 whitespace-nowrap">
                        {dateStr} {timeStr}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Indicador de procesamiento */}
      {isLoading && (
        <div className="mt-4 bg-blue-50 p-3 rounded-lg border border-blue-200">
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500 mr-3"></div>
            <span className="text-sm text-blue-700">Pre-llenando datos del partido...</span>
          </div>
        </div>
      )}
    </div>
  );
};
