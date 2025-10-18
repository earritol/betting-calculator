import React, { useState } from 'react';
import { MatchConfig } from '../xg/MatchConfig';
import { StatsInputPanel } from '../xg/StatsInputPanel';
import { XGCalculationsPanel } from '../xg/XGCalculationsPanel';
import { PredictionPanel } from '../xg/PredictionPanel';
import { calculateXGStats, calculatePredictions } from '../xg/calculations';
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

export const XGRealtimeModule: React.FC = () => {
  const [matchData, setMatchData] = useState<MatchData>(initialMatchData);

  // Cálculos
  const homeXG = calculateXGStats(matchData.home.stats, true, matchData.minute);
  const awayXG = calculateXGStats(matchData.away.stats, false, matchData.minute);
  const predictions = calculatePredictions(matchData.home.stats, matchData.away.stats, matchData.minute);

  // Handlers
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
      <MatchConfig 
        matchData={matchData}
        onUpdateTeamName={updateTeamName}
        onUpdateMinute={updateMinute}
      />

      <StatsInputPanel 
        matchData={matchData}
        onUpdateStats={updateStats}
      />

      <XGCalculationsPanel 
        matchData={matchData}
        homeXG={homeXG}
        awayXG={awayXG}
      />

      <PredictionPanel 
        matchData={matchData}
        predictions={predictions}
      />
    </div>
  );
};