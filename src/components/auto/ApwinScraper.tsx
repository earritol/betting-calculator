import React, { useState } from 'react';
import { callEdgeFunction } from '../../services/supabase/client';

interface ScrapedMatchData {
  homeTeam: {
    name: string;
    goalsScored: number;
    goalsConceded: number;
    goalsScoredHome: number;
    goalsConcededHome: number;
    goalsScoredAway: number;
    goalsConcededAway: number;
    xG: number;
    xGA: number;
    xGHome: number;
    xGAHome: number;
    xGAway: number;
    xGAAway: number;
  };
  awayTeam: {
    name: string;
    goalsScored: number;
    goalsConceded: number;
    goalsScoredHome: number;
    goalsConcededHome: number;
    goalsScoredAway: number;
    goalsConcededAway: number;
    xG: number;
    xGA: number;
    xGHome: number;
    xGAHome: number;
    xGAway: number;
    xGAAway: number;
  };
  odds: Array<{
    bookmaker: string;
    home: number;
    draw: number;
    away: number;
  }>;
  league: {
    avgGoalsPerMatch: number;
    detectedCode?: string;
  };
  matchDate: string;
}

interface OddsData {
  bookmaker: string;
  home: number;
  draw: number;
  away: number;
}

interface ApwinScraperProps {
  onDataScraped: (data: {
    xG: { home: number; away: number };
    xGA: { home: number; away: number };
    odds: { bookmaker: string; home: number; draw: number; away: number }[];
    goalsFor?: { home: number; away: number };
    goalsAgainst?: { home: number; away: number };
    leagueAvg?: number;
    names?: { home: string; away: string };
  }) => void;
}

export const ApwinScraper: React.FC<ApwinScraperProps> = ({ onDataScraped }) => {
  const [apwinUrl, setApwinUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [selectedBookmaker, setSelectedBookmaker] = useState<string>('1xbet');
  const [scrapedData, setScrapedData] = useState<ScrapedMatchData | null>(null);

  // Cuando cambia el bookmaker seleccionado, re-enviar datos con esa cuota
  const sendDataWithBookmaker = (data: ScrapedMatchData, bookmaker: string) => {
    const allOdds: OddsData[] = data.odds || [];
    
    // Buscar la cuota del bookmaker seleccionado, o fallback a la primera disponible
    const selectedOdd = allOdds.find(o => o.bookmaker === bookmaker) || allOdds[0];
    const oddsToSend = selectedOdd ? [selectedOdd] : [];

    onDataScraped({
      xG: { home: data.homeTeam.xG || 0, away: data.awayTeam.xG || 0 },
      xGA: { home: data.homeTeam.xGA || 0, away: data.awayTeam.xGA || 0 },
      odds: oddsToSend,
      goalsFor: { home: data.homeTeam.goalsScored, away: data.awayTeam.goalsScored },
      goalsAgainst: { home: data.homeTeam.goalsConceded, away: data.awayTeam.goalsConceded },
      leagueAvg: data.league?.avgGoalsPerMatch || 0,
      names: { home: data.homeTeam.name, away: data.awayTeam.name },
    });
  };

  const handleBookmakerChange = (bk: string) => {
    setSelectedBookmaker(bk);
    if (scrapedData) {
      sendDataWithBookmaker(scrapedData, bk);
    }
  };

  const handleScrape = async () => {
    if (!apwinUrl.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const matchData = await callEdgeFunction<{ success: boolean; data: ScrapedMatchData }>('scrape-match', {
        url: apwinUrl.trim(),
      });

      if (!matchData.success || !matchData.data) {
        throw new Error('No se pudieron extraer datos de APWin');
      }

      const { data } = matchData;

      // Intentar obtener cuotas de Pinnacle vía scrape-odds
      const leagueCode = data.league?.detectedCode || detectLeague(apwinUrl);
      if (leagueCode) {
        try {
          const pinnacleData = await callEdgeFunction<{ success: boolean; odds: OddsData[] }>('scrape-odds', {
            homeTeam: data.homeTeam.name,
            awayTeam: data.awayTeam.name,
            league: leagueCode,
          });

          if (pinnacleData.success && pinnacleData.odds) {
            const pinnacleOdds = pinnacleData.odds.filter((o: OddsData) => o.bookmaker === 'pinnacle');
            if (pinnacleOdds.length > 0) {
              data.odds = [...(data.odds || []), ...pinnacleOdds];
            }
          }
        } catch {
          console.warn('Pinnacle odds not available');
        }
      }

      setScrapedData(data);
      sendDataWithBookmaker(data, selectedBookmaker);

      const bookmakers = (data.odds || []).map((o: OddsData) => o.bookmaker).join(', ') || 'ninguna';
      setResult(`✅ Datos extraídos. Cuotas disponibles: ${bookmakers}`);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  // Detectar liga desde la URL de APWin para buscar en Pinnacle
  const detectLeague = (url: string): string => {
    const leaguePatterns: Record<string, string[]> = {
      'england': ['premier-league', 'england', 'epl'],
      'spain': ['la-liga', 'spain', 'espana'],
      'italy': ['serie-a', 'italy', 'italia'],
      'germany': ['bundesliga', 'germany', 'alemania'],
      'france': ['ligue-1', 'france', 'francia'],
      'brazil': ['serie-a', 'brazil', 'brasil'],
      'mexico': ['liga-mx', 'mexico'],
      'netherlands': ['eredivisie', 'netherlands', 'holanda'],
      'portugal': ['primeira', 'portugal'],
      'sweden': ['allsvenskan', 'suecia', 'sweden'],
      'champions_league': ['champions', 'ucl'],
      'world': ['copa-del-mundo', 'world-cup', 'mundial'],
    };

    const urlLower = url.toLowerCase();
    for (const [league, patterns] of Object.entries(leaguePatterns)) {
      if (patterns.some(p => urlLower.includes(p))) return league;
    }
    return '';
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 mb-8">
      <div className="flex items-center mb-4">
        <div className="w-2 h-8 bg-purple-500 rounded-full mr-3"></div>
        <h2 className="text-xl font-bold text-gray-800">Datos Avanzados (APWin)</h2>
      </div>

      <p className="text-sm text-gray-600 mb-4">
        Pega la URL del partido en APWin para obtener xG, xGA y cuotas automáticamente.
      </p>

      {/* Input URL */}
      <div className="flex gap-3 mb-4">
        <input
          type="text"
          value={apwinUrl}
          onChange={(e) => setApwinUrl(e.target.value)}
          placeholder="https://www.apwin.com/es/partido/equipo1-equipo2/xxxxx/"
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
        />
        <button
          onClick={handleScrape}
          disabled={loading || !apwinUrl.trim()}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {loading ? '⏳ Cargando...' : '🔍 Obtener datos'}
        </button>
      </div>

      {/* Selector de bookmaker preferido */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Casa de apuestas preferida (para cuotas)
        </label>
        <div className="flex gap-2">
          {['pinnacle', '1xbet', 'bet365'].map((bk) => {
            const isAvailable = scrapedData?.odds?.some(o => o.bookmaker === bk);
            return (
              <button
                key={bk}
                onClick={() => handleBookmakerChange(bk)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-all ${
                  selectedBookmaker === bk
                    ? 'border-purple-500 bg-purple-50 text-purple-700'
                    : isAvailable
                    ? 'border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100'
                    : 'border-gray-100 bg-gray-50 text-gray-400'
                }`}
              >
                {bk === 'pinnacle' ? '📌 Pinnacle' : bk === '1xbet' ? '1️⃣ 1xBet' : '🎰 Bet365'}
                {scrapedData && !isAvailable && <span className="ml-1 text-xs">(N/D)</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Status */}
      {loading && (
        <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-500 mr-3"></div>
            <span className="text-sm text-purple-700">Scrapeando datos del partido...</span>
          </div>
        </div>
      )}
      {result && (
        <div className="bg-green-50 p-3 rounded-lg border border-green-200">
          <p className="text-sm text-green-700">{result}</p>
        </div>
      )}
      {error && (
        <div className="bg-red-50 p-3 rounded-lg border border-red-200">
          <p className="text-sm text-red-700">❌ {error}</p>
        </div>
      )}
    </div>
  );
};
