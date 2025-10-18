import React from 'react';
import { useLiveMatch } from '../../hooks/useLiveMatch';

export const XGDashboard: React.FC = () => {
  const { match, probabilities } = useLiveMatch();

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        📊 Dashboard en Tiempo Real - Minuto {match.currentMinute}'
      </h2>

      {/* Estadísticas de equipos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Equipo Local */}
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <h3 className="text-lg font-semibold text-blue-800 mb-3">
            🏠 {match.homeTeam.name}
          </h3>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-gray-600">xG Total:</span>
              <p className="font-bold text-blue-700">{match.homeTeam.xG.toFixed(2)}</p>
            </div>
            <div>
              <span className="text-gray-600">Tiros:</span>
              <p className="font-bold">{match.homeTeam.shots}</p>
            </div>
            <div>
              <span className="text-gray-600">A puerta:</span>
              <p className="font-bold">{match.homeTeam.shotsOnTarget}</p>
            </div>
            <div>
              <span className="text-gray-600">Goles:</span>
              <p className="font-bold text-green-600">{match.homeTeam.goals}</p>
            </div>
          </div>
        </div>

        {/* Equipo Visitante */}
        <div className="bg-red-50 p-4 rounded-lg border border-red-200">
          <h3 className="text-lg font-semibold text-red-800 mb-3">
            ✈️ {match.awayTeam.name}
          </h3>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-gray-600">xG Total:</span>
              <p className="font-bold text-red-700">{match.awayTeam.xG.toFixed(2)}</p>
            </div>
            <div>
              <span className="text-gray-600">Tiros:</span>
              <p className="font-bold">{match.awayTeam.shots}</p>
            </div>
            <div>
              <span className="text-gray-600">A puerta:</span>
              <p className="font-bold">{match.awayTeam.shotsOnTarget}</p>
            </div>
            <div>
              <span className="text-gray-600">Goles:</span>
              <p className="font-bold text-green-600">{match.awayTeam.goals}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Probabilidades */}
      {probabilities && (
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">
            📈 Probabilidades Basadas en xG
          </h3>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="bg-blue-100 p-3 rounded-lg">
              <p className="font-semibold text-blue-800">Local</p>
              <p className="text-2xl font-bold text-blue-600">
                {(probabilities.home * 100).toFixed(1)}%
              </p>
            </div>
            <div className="bg-gray-100 p-3 rounded-lg">
              <p className="font-semibold text-gray-800">Empate</p>
              <p className="text-2xl font-bold text-gray-600">
                {(probabilities.draw * 100).toFixed(1)}%
              </p>
            </div>
            <div className="bg-red-100 p-3 rounded-lg">
              <p className="font-semibold text-red-800">Visitante</p>
              <p className="text-2xl font-bold text-red-600">
                {(probabilities.away * 100).toFixed(1)}%
              </p>
            </div>
          </div>
          <p className="text-center text-sm text-gray-600 mt-3">
            Resultado más probable: {match.homeTeam.name} {probabilities.homeGoals} - {probabilities.awayGoals} {match.awayTeam.name}
          </p>
        </div>
      )}
    </div>
  );
};