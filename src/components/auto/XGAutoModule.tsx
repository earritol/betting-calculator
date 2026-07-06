import React, { useState } from 'react';
import { MatchConfig } from '../xg/MatchConfig';
import { StatsInputPanel } from '../xg/StatsInputPanel';
import { XGCalculationsPanel } from '../xg/XGCalculationsPanel';
import { PredictionPanel } from '../xg/PredictionPanel';
import { calculateXGStats, calculatePredictions } from '../xg/calculations';
import { LiveMatchSelector } from './LiveMatchSelector';
import type { LiveMatchData } from './LiveMatchSelector';
import type { MatchData } from '../xg/types';

const initialMatchData: MatchData = {
  home: {
    name: 'Equipo Local',
    stats: {
      goals: 0,
      xG: 0,
      shots: 0,
      shotsOnTarget: 0,
      corners: 0,
      dangerousAttacks: 0,
      possession: 50
    }
  },
  away: {
    name: 'Equipo Visitante',
    stats: {
      goals: 0,
      xG: 0,
      shots: 0,
      shotsOnTarget: 0,
      corners: 0,
      dangerousAttacks: 0,
      possession: 50
    }
  },
  minute: 1
};

export const XGAutoModule: React.FC = () => {
  const [matchData, setMatchData] = useState<MatchData>(initialMatchData);

  // Handler para datos en vivo desde ESPN
  const handleLiveMatch = (data: LiveMatchData) => {
    setMatchData({
      home: {
        name: data.homeTeam,
        stats: {
          goals: data.stats.home.goals,
          xG: data.stats.home.xG,
          shots: data.stats.home.totalShots,
          shotsOnTarget: data.stats.home.shotsOnTarget,
          corners: data.stats.home.corners,
          dangerousAttacks: data.stats.home.dangerousAttacks,
          possession: data.stats.home.possession,
        }
      },
      away: {
        name: data.awayTeam,
        stats: {
          goals: data.stats.away.goals,
          xG: data.stats.away.xG,
          shots: data.stats.away.totalShots,
          shotsOnTarget: data.stats.away.shotsOnTarget,
          corners: data.stats.away.corners,
          dangerousAttacks: data.stats.away.dangerousAttacks,
          possession: data.stats.away.possession,
        }
      },
      minute: data.minute,
    });
  };

  // Cálculos
  const homeXG = calculateXGStats(matchData.home.stats, true, matchData.minute);
  const awayXG = calculateXGStats(matchData.away.stats, false, matchData.minute);
  const predictions = calculatePredictions(matchData.home.stats, matchData.away.stats, matchData.minute);

  // Handlers manuales
  const updateTeamName = (team: 'home' | 'away', name: string) => {
    setMatchData(prev => ({
      ...prev,
      [team]: { ...prev[team], name }
    }));
  };

  const updateMinute = (minute: number) => {
    setMatchData(prev => ({ ...prev, minute }));
  };

  const updateStats = (team: 'home' | 'away', field: keyof MatchData['home']['stats'], value: number) => {
    setMatchData(prev => ({
      ...prev,
      [team]: {
        ...prev[team],
        stats: { ...prev[team].stats, [field]: value }
      }
    }));
  };

  return (
    <div className="space-y-8">
      {/* Selector de partido en vivo */}
      <LiveMatchSelector onMatchSelected={handleLiveMatch} />

      {/* Configuración del partido */}
      <MatchConfig 
        matchData={matchData}
        onUpdateTeamName={updateTeamName}
        onUpdateMinute={updateMinute}
      />

      {/* Estadísticas del partido */}
      <StatsInputPanel 
        matchData={matchData}
        onUpdateStats={updateStats}
      />

      {/* Cálculos xG */}
      <XGCalculationsPanel 
        matchData={matchData}
        homeXG={homeXG}
        awayXG={awayXG}
      />

      {/* Predicciones */}
      <PredictionPanel 
        matchData={matchData}
        predictions={predictions}
      />
    </div>
  );
};
