import React from 'react';
import { useBettingCalculatorContext } from '../../context/BettingCalculatorContext';

export const TeamDataForm: React.FC = () => {
  const { matchData, updateMatchData } = useBettingCalculatorContext();

  const handleTeamChange = (team: 'local' | 'visitor', field: string, value: number) => {
    const numericValue = isNaN(value) ? 0 : value;    
    updateMatchData({
      ...matchData,
      [team]: {
        ...matchData[team],
        [field]: numericValue
      }
    });
  };

  const handleOddsChange = (field: string, value: number) => {
    updateMatchData({
      ...matchData,
      odds: {
        ...matchData.odds,
        [field]: value
      }
    });
  };

  const handleLeagueChange = (field: string, value: number) => {
    updateMatchData({
      ...matchData,
      leagueAverages: {
        ...matchData.leagueAverages,
        [field]: value
      }
    });
  };

  return (
    <div className="p-8">
      <div className="flex items-center mb-6">
        <div className="w-2 h-8 bg-blue-500 rounded-full mr-3"></div>
        <h2 className="text-2xl font-bold text-gray-800">Datos del Partido</h2>
      </div>
      
      {/* Equipo Local */}
      <div className="mb-8 p-6 bg-blue-50 rounded-xl border border-blue-200">
        <h3 className="text-lg font-semibold text-blue-800 mb-4 flex items-center">
          <span className="w-3 h-3 bg-blue-500 rounded-full mr-2"></span>
          Equipo Local
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Goles a Favor (Local)
            </label>
            <input
              type="number"
              step="0.01"
              value={matchData.local.goalsFor}
              onChange={(e) => handleTeamChange('local', 'goalsFor', parseFloat(e.target.value) || 0)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="Ej: 2.2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Goles en Contra (Local)
            </label>
            <input
              type="number"
              step="0.01"
              value={matchData.local.goalsAgainst}
              onChange={(e) => handleTeamChange('local', 'goalsAgainst', parseFloat(e.target.value) || 0)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="Ej: 1.1"
            />
          </div>
        </div>
      </div>

      {/* Equipo Visitante */}
      <div className="mb-8 p-6 bg-red-50 rounded-xl border border-red-200">
        <h3 className="text-lg font-semibold text-red-800 mb-4 flex items-center">
          <span className="w-3 h-3 bg-red-500 rounded-full mr-2"></span>
          Equipo Visitante
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Goles a Favor (Visitante)
            </label>
            <input
              type="number"
              step="0.01"
              value={matchData.visitor.goalsFor}
              onChange={(e) => handleTeamChange('visitor', 'goalsFor', parseFloat(e.target.value) || 0)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
              placeholder="Ej: 1.6"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Goles en Contra (Visitante)
            </label>
            <input
              type="number"
              step="0.01"
              value={matchData.visitor.goalsAgainst}
              onChange={(e) => handleTeamChange('visitor', 'goalsAgainst', parseFloat(e.target.value) || 0)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
              placeholder="Ej: 1.3"
            />
          </div>
        </div>
      </div>

      {/* Cuotas */}
      <div className="mb-8 p-6 bg-green-50 rounded-xl border border-green-200">
        <h3 className="text-lg font-semibold text-green-800 mb-4 flex items-center">
          <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
          Cuotas de Apuesta
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Local
            </label>
            <input
              type="number"
              step="0.01"
              value={matchData.odds.local}
              onChange={(e) => handleOddsChange('local', parseFloat(e.target.value) || 0)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
              placeholder="Ej: 2.4"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Empate
            </label>
            <input
              type="number"
              step="0.01"
              value={matchData.odds.draw}
              onChange={(e) => handleOddsChange('draw', parseFloat(e.target.value) || 0)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
              placeholder="Ej: 3.5"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Visitante
            </label>
            <input
              type="number"
              step="0.01"
              value={matchData.odds.visitor}
              onChange={(e) => handleOddsChange('visitor', parseFloat(e.target.value) || 0)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
              placeholder="Ej: 2.8"
            />
          </div>
        </div>
      </div>

      {/* Medias de Liga */}
      <div className="p-6 bg-purple-50 rounded-xl border border-purple-200">
        <h3 className="text-lg font-semibold text-purple-800 mb-4 flex items-center">
          <span className="w-3 h-3 bg-purple-500 rounded-full mr-2"></span>
          Medias de la Liga
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              GF Promedio Liga
            </label>
            <input
              type="number"
              step="0.01"
              value={matchData.leagueAverages.avgGoalsFor}
              onChange={(e) => handleLeagueChange('avgGoalsFor', parseFloat(e.target.value) || 0)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              placeholder="Ej: 1.65"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              GC Promedio Liga
            </label>
            <input
              type="number"
              step="0.01"
              value={matchData.leagueAverages.avgGoalsAgainst}
              onChange={(e) => handleLeagueChange('avgGoalsAgainst', parseFloat(e.target.value) || 0)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              placeholder="Ej: 1.42"
            />
          </div>
        </div>
      </div>
    </div>
  );
};