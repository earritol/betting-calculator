import React from 'react';
import type { MatchData, Prediction } from './types';

interface PredictionPanelProps {
  matchData: MatchData;
  predictions: Prediction;
}

export const PredictionPanel: React.FC<PredictionPanelProps> = ({
  matchData,
  predictions
}) => {
  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">📈 PREDICCIÓN RESULTADO</h2>

      {/* Goles Esperados Finales */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <h3 className="text-lg font-semibold text-blue-800 mb-3">🏠 {matchData.home.name}</h3>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div><span className="text-sm text-gray-600">Mínimo</span><p className="text-xl font-bold">{predictions.minGoals}</p></div>
            <div><span className="text-sm text-gray-600">Más Probable</span><p className="text-2xl font-bold text-blue-600">{predictions.mostProbable}</p></div>
            <div><span className="text-sm text-gray-600">Máximo</span><p className="text-xl font-bold">{predictions.maxGoals}</p></div>
          </div>
        </div>
        
        <div className="bg-red-50 p-4 rounded-lg border border-red-200">
          <h3 className="text-lg font-semibold text-red-800 mb-3">✈️ {matchData.away.name}</h3>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div><span className="text-sm text-gray-600">Mínimo</span><p className="text-xl font-bold">{predictions.minGoals}</p></div>
            <div><span className="text-sm text-gray-600">Más Probable</span><p className="text-2xl font-bold text-red-600">{predictions.mostProbable}</p></div>
            <div><span className="text-sm text-gray-600">Máximo</span><p className="text-xl font-bold">{predictions.maxGoals}</p></div>
          </div>
        </div>
      </div>

      {/* Predicción Marcador */}
      <div className="bg-gradient-to-r from-blue-50 to-red-50 p-4 rounded-lg border border-gray-200 mb-6 text-center">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">PREDICCIÓN MARCADOR MÁS PROBABLE</h3>
        <div className="text-3xl font-bold">
          {matchData.home.name} {predictions.projectedHomeGoals.toFixed(2)} - {predictions.projectedAwayGoals.toFixed(2)} {matchData.away.name}
        </div>
      </div>

      {/* Probabilidades y Análisis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">📊 PROBABILIDADES RESULTADO FINAL</h3>
            <div className="space-y-2">
              <div className="flex justify-between"><span>Victoria Local:</span><span className="font-bold">{(predictions.homeWinProb * 100).toFixed(1)}%</span></div>
              <div className="flex justify-between"><span>Empate:</span><span className="font-bold">{(predictions.drawProb * 100).toFixed(1)}%</span></div>
              <div className="flex justify-between"><span>Victoria Visitante:</span><span className="font-bold">{(predictions.awayWinProb * 100).toFixed(1)}%</span></div>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">🎯 PROBABILIDADES OVER/UNDER</h3>
            <div className="space-y-2">
              <div className="flex justify-between"><span>Over 0.5:</span><span className="font-bold">{(predictions.over05 * 100).toFixed(1)}%</span></div>
              <div className="flex justify-between"><span>Over 1.5:</span><span className="font-bold">{(predictions.over15 * 100).toFixed(1)}%</span></div>
              <div className="flex justify-between"><span>Over 2.5:</span><span className="font-bold">{(predictions.over25 * 100).toFixed(1)}%</span></div>
              <div className="flex justify-between"><span>Ambos Marcando:</span><span className="font-bold">{(predictions.bothTeamsScore * 100).toFixed(1)}%</span></div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <h3 className="text-lg font-semibold text-yellow-800 mb-3">📋 ANÁLISIS Y RECOMENDACIONES</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span>Equipo con Mejor Proyección:</span><span className="font-bold">{predictions.bestTeam}</span></div>
              <div className="flex justify-between"><span>Diferencia de Eficacia:</span><span className="font-bold">{predictions.efficiencyDifference.toFixed(2)}</span></div>
              <div className="flex justify-between"><span>Proyección Goles Restantes:</span><span className="font-bold">{matchData.home.name} {predictions.projectedHomeGoals.toFixed(2)} - {predictions.projectedAwayGoals.toFixed(2)} {matchData.away.name}</span></div>
            </div>
          </div>

          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <h3 className="text-lg font-semibold text-green-800 mb-2">💡 RECOMENDACIÓN STL</h3>
            <p className="text-green-700 font-semibold">{predictions.recommendation}</p>
          </div>
        </div>
      </div>
    </div>
  );
};