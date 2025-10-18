import React from 'react';
import type { MatchData } from './types';

interface MatchConfigProps {
  matchData: MatchData;
  onUpdateTeamName: (team: 'home' | 'away', name: string) => void;
  onUpdateMinute: (minute: number) => void;
}

export const MatchConfig: React.FC<MatchConfigProps> = ({
  matchData,
  onUpdateTeamName,
  onUpdateMinute
}) => {
  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">⚽ Configuración del Partido</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Equipo Local</label>
          <input
            type="text"
            value={matchData.home.name}
            onChange={(e) => onUpdateTeamName('home', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Equipo Visitante</label>
          <input
            type="text"
            value={matchData.away.name}
            onChange={(e) => onUpdateTeamName('away', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Minuto Actual</label>
          <input
            type="number"
            min="1"
            max="120"
            value={matchData.minute}
            onChange={(e) => onUpdateMinute(parseInt(e.target.value) || 1)}
            className="w-24 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
    </div>
  );
};