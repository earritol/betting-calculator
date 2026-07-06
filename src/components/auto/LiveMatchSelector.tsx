import React, { useState } from 'react';
import { callEdgeFunction } from '../../services/supabase/client';

interface TeamLiveStats {
  goals: number;
  totalShots: number;
  shotsOnTarget: number;
  corners: number;
  possession: number;
  fouls: number;
  dangerousAttacks: number;
  xG: number;
}

interface MatchEvent {
  id: string;
  name: string;
  status: string;
  statusDetail: string;
  minute: number;
  homeTeam: { name: string; logo: string; score: number };
  awayTeam: { name: string; logo: string; score: number };
  stats: { home: TeamLiveStats; away: TeamLiveStats } | null;
}

interface LiveResponse {
  success: boolean;
  league: string;
  matches: MatchEvent[];
  liveCount: number;
  totalCount: number;
}

const LEAGUES = [
  { key: 'world_cup', name: '🏆 World Cup' },
  { key: 'champions_league', name: '⭐ Champions League' },
  { key: 'england', name: '🏴 Premier League' },
  { key: 'spain', name: '🇪🇸 La Liga' },
  { key: 'italy', name: '🇮🇹 Serie A' },
  { key: 'germany', name: '🇩🇪 Bundesliga' },
  { key: 'france', name: '🇫🇷 Ligue 1' },
  { key: 'mexico', name: '🇲🇽 Liga MX' },
  { key: 'brazil', name: '🇧🇷 Serie A Brasil' },
  { key: 'usa', name: '🇺🇸 MLS' },
  { key: 'netherlands', name: '🇳🇱 Eredivisie' },
  { key: 'portugal', name: '🇵🇹 Primeira Liga' },
  { key: 'sweden', name: '🇸🇪 Allsvenskan' },
  { key: 'argentina', name: '🇦🇷 Liga Profesional' },
  { key: 'colombia', name: '🇨🇴 Liga BetPlay' },
];

export interface LiveMatchData {
  homeTeam: string;
  awayTeam: string;
  minute: number;
  stats: {
    home: TeamLiveStats;
    away: TeamLiveStats;
  };
}

interface LiveMatchSelectorProps {
  onMatchSelected: (data: LiveMatchData) => void;
}

export const LiveMatchSelector: React.FC<LiveMatchSelectorProps> = ({ onMatchSelected }) => {
  const [selectedLeague, setSelectedLeague] = useState('');
  const [matches, setMatches] = useState<MatchEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null);

  const loadMatches = async (league: string) => {
    setSelectedLeague(league);
    setLoading(true);
    setError(null);
    setMatches([]);
    setSelectedMatchId(null);

    try {
      const data = await callEdgeFunction<LiveResponse>('scrape-live', { league });
      if (data.success) {
        setMatches(data.matches);
      } else {
        setError('No se pudieron obtener los partidos');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  const handleMatchSelect = (match: MatchEvent) => {
    setSelectedMatchId(match.id);

    if (match.stats) {
      onMatchSelected({
        homeTeam: match.homeTeam.name,
        awayTeam: match.awayTeam.name,
        minute: match.minute || 90,
        stats: match.stats,
      });
    }
  };

  const refreshMatch = async () => {
    if (!selectedLeague) return;
    setLoading(true);
    try {
      const data = await callEdgeFunction<LiveResponse>('scrape-live', { league: selectedLeague });
      if (data.success) {
        setMatches(data.matches);
        // Re-select the same match to update stats
        if (selectedMatchId) {
          const updated = data.matches.find(m => m.id === selectedMatchId);
          if (updated?.stats) {
            onMatchSelected({
              homeTeam: updated.homeTeam.name,
              awayTeam: updated.awayTeam.name,
              minute: updated.minute || 90,
              stats: updated.stats,
            });
          }
        }
      }
    } catch {
      // silently fail on refresh
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (match: MatchEvent) => {
    if (match.status === 'in') return <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded-full font-bold">🔴 EN VIVO</span>;
    if (match.status === 'post') return <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">Finalizado</span>;
    return <span className="px-2 py-0.5 bg-blue-100 text-blue-600 text-xs rounded-full">Próximo</span>;
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 mb-8">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <div className="w-2 h-8 bg-red-500 rounded-full mr-3"></div>
          <h2 className="text-xl font-bold text-gray-800">Partido en Vivo (ESPN)</h2>
        </div>
        {selectedLeague && (
          <button
            onClick={refreshMatch}
            disabled={loading}
            className="px-3 py-1.5 bg-red-100 text-red-700 rounded-lg text-sm font-medium hover:bg-red-200 disabled:opacity-50 transition-all"
          >
            🔄 Actualizar
          </button>
        )}
      </div>

      {/* Selector de liga */}
      <div className="mb-4">
        <select
          value={selectedLeague}
          onChange={(e) => loadMatches(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
        >
          <option value="">— Selecciona una liga —</option>
          {LEAGUES.map((l) => (
            <option key={l.key} value={l.key}>{l.name}</option>
          ))}
        </select>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 p-3 rounded-lg border border-red-200 mb-4">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex items-center text-sm text-gray-500 py-3">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-500 mr-2"></div>
          Cargando partidos...
        </div>
      )}

      {/* Lista de partidos */}
      {!loading && matches.length > 0 && (
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {matches.map((match) => (
            <button
              key={match.id}
              onClick={() => handleMatchSelect(match)}
              disabled={!match.stats}
              className={`w-full p-3 rounded-lg border-2 text-left transition-all ${
                selectedMatchId === match.id
                  ? 'border-red-500 bg-red-50'
                  : match.stats
                  ? 'border-gray-200 bg-gray-50 hover:bg-gray-100'
                  : 'border-gray-100 bg-gray-50 opacity-60 cursor-not-allowed'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 flex-1">
                  <span className="text-sm font-medium text-gray-800 text-right flex-1">
                    {match.homeTeam.name}
                  </span>
                  <span className="text-sm font-bold text-gray-900 px-2">
                    {match.homeTeam.score} - {match.awayTeam.score}
                  </span>
                  <span className="text-sm font-medium text-gray-800 text-left flex-1">
                    {match.awayTeam.name}
                  </span>
                </div>
                <div className="ml-3">
                  {getStatusBadge(match)}
                </div>
              </div>
              {!match.stats && (
                <p className="text-xs text-gray-400 mt-1 text-center">Sin estadísticas aún</p>
              )}
            </button>
          ))}
        </div>
      )}

      {!loading && selectedLeague && matches.length === 0 && (
        <p className="text-sm text-gray-500 py-2">No hay partidos disponibles en esta liga hoy</p>
      )}
    </div>
  );
};
