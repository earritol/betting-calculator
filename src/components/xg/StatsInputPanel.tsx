import React from 'react';
import type { MatchData } from './types';

interface StatsInputPanelProps {
  matchData: MatchData;
  onUpdateStats: (team: 'home' | 'away', field: keyof MatchData['home']['stats'], value: number) => void;
}

const StatInput: React.FC<{
  label: string;
  value: number;
  onChange: (value: number) => void;
  step?: number;
  max?: number;
}> = ({ label, value, onChange, step = 1, max }) => {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <input
        type="number"
        min="0"
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );
};

export const StatsInputPanel: React.FC<StatsInputPanelProps> = ({
  matchData,
  onUpdateStats
}) => {
  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">📊 Estadísticas del Partido</h2>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Equipo Local */}
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-blue-800">🏠 {matchData.home.name}</h3>
          <StatInput 
            label="Goles"
            value={matchData.home.stats.goals}
            onChange={(value) => onUpdateStats('home', 'goals', value)}
          />
          <StatInput 
            label="xG Actual"
            value={matchData.home.stats.xG}
            onChange={(value) => onUpdateStats('home', 'xG', value)}
            step={0.1}
          />
          <StatInput 
            label="Tiros Total"
            value={matchData.home.stats.shots}
            onChange={(value) => onUpdateStats('home', 'shots', value)}
          />
          <StatInput 
            label="Tiros Marco"
            value={matchData.home.stats.shotsOnTarget}
            onChange={(value) => onUpdateStats('home', 'shotsOnTarget', value)}
          />
          <StatInput 
            label="Corners"
            value={matchData.home.stats.corners}
            onChange={(value) => onUpdateStats('home', 'corners', value)}
          />
          <StatInput 
            label="Ataques Peligrosos"
            value={matchData.home.stats.dangerousAttacks}
            onChange={(value) => onUpdateStats('home', 'dangerousAttacks', value)}
          />
          <StatInput 
            label="Posesión %"
            value={matchData.home.stats.possession}
            onChange={(value) => onUpdateStats('home', 'possession', value)}
            max={100}
          />
        </div>

        {/* Equipo Visitante */}
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-red-800">✈️ {matchData.away.name}</h3>
          <StatInput 
            label="Goles"
            value={matchData.away.stats.goals}
            onChange={(value) => onUpdateStats('away', 'goals', value)}
          />
          <StatInput 
            label="xG Actual"
            value={matchData.away.stats.xG}
            onChange={(value) => onUpdateStats('away', 'xG', value)}
            step={0.1}
          />
          <StatInput 
            label="Tiros Total"
            value={matchData.away.stats.shots}
            onChange={(value) => onUpdateStats('away', 'shots', value)}
          />
          <StatInput 
            label="Tiros Marco"
            value={matchData.away.stats.shotsOnTarget}
            onChange={(value) => onUpdateStats('away', 'shotsOnTarget', value)}
          />
          <StatInput 
            label="Corners"
            value={matchData.away.stats.corners}
            onChange={(value) => onUpdateStats('away', 'corners', value)}
          />
          <StatInput 
            label="Ataques Peligrosos"
            value={matchData.away.stats.dangerousAttacks}
            onChange={(value) => onUpdateStats('away', 'dangerousAttacks', value)}
          />
          <StatInput 
            label="Posesión %"
            value={matchData.away.stats.possession}
            onChange={(value) => onUpdateStats('away', 'possession', value)}
            max={100}
          />
        </div>
      </div>
    </div>
  );
};