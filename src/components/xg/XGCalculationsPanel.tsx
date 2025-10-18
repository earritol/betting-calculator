import React from 'react';
import type { MatchData, XGCalculations } from './types';

interface XGCalculationsPanelProps {
  matchData: MatchData;
  homeXG: XGCalculations;
  awayXG: XGCalculations;
}

const getInterpretation = (xGDifference: number, isHome: boolean): string => {
  if (xGDifference > 0.5) {
    return `⚡ ${isHome ? 'LOCAL' : 'VISITA'} DEBERÍA TENER +${Math.abs(xGDifference).toFixed(2)} GOLES`;
  } else if (xGDifference < -0.5) {
    return `📉 ${isHome ? 'LOCAL' : 'VISITA'} SOBREPERFORMA POR ${Math.abs(xGDifference).toFixed(2)} GOLES`;
  }
  return `⚖️ ${isHome ? 'LOCAL' : 'VISITA'} EN LÍNEA CON EXPECTATIVAS`;
};

export const XGCalculationsPanel: React.FC<XGCalculationsPanelProps> = ({
  matchData,
  homeXG,
  awayXG
}) => {
  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">🧮 CÁLCULOS xG - Minuto {matchData.minute}'</h2>
      
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* LOCAL */}
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-blue-800 mb-4">🏠 {matchData.home.name}</h3>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div><span className="text-gray-600">Eficacia Tiro Marco:</span><p className="font-bold">{homeXG.shotEfficiency}</p></div>
            <div><span className="text-gray-600">Eficacia Esquinas:</span><p className="font-bold">{homeXG.cornerEfficiency}</p></div>
            <div><span className="text-gray-600">Eficacia Ataques:</span><p className="font-bold">{homeXG.attackEfficiency}</p></div>
            <div><span className="text-gray-600">xG REAL DEBERÍA SER:</span><p className="font-bold text-green-600">{homeXG.expectedxG.toFixed(2)}</p></div>
            <div><span className="text-gray-600">DIFERENCIA xG:</span><p className={`font-bold ${homeXG.xGDifference > 0 ? 'text-green-600' : 'text-red-600'}`}>{homeXG.xGDifference.toFixed(2)}</p></div>
            <div><span className="text-gray-600">VELOCIDAD xG/min:</span><p className="font-bold">{homeXG.xGPerMinute.toFixed(4)}</p></div>
            <div><span className="text-gray-600">FACTOR URGENCIA:</span><p className="font-bold">{homeXG.urgencyFactor}</p></div>
            <div><span className="text-gray-600">PROYECCIÓN GOLES REST:</span><p className="font-bold">{homeXG.projectedRemainingGoals.toFixed(2)}</p></div>
            <div><span className="text-gray-600">GOLES ESPERADOS FINALES:</span><p className="font-bold text-blue-600">{homeXG.expectedFinalGoals.toFixed(2)}</p></div>
            <div><span className="text-gray-600">NIVEL CONFIANZA:</span><p className={`font-bold ${homeXG.confidenceLevel === 'ALTA' ? 'text-green-600' : homeXG.confidenceLevel === 'MEDIA' ? 'text-yellow-600' : 'text-red-600'}`}>{homeXG.confidenceLevel}</p></div>
          </div>
          
          <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
            <p className="text-blue-800 font-semibold">{getInterpretation(homeXG.xGDifference, true)}</p>
          </div>
        </div>

        {/* VISITANTE */}
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-red-800 mb-4">✈️ {matchData.away.name}</h3>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div><span className="text-gray-600">Eficacia Tiro Marco:</span><p className="font-bold">{awayXG.shotEfficiency}</p></div>
            <div><span className="text-gray-600">Eficacia Esquinas:</span><p className="font-bold">{awayXG.cornerEfficiency}</p></div>
            <div><span className="text-gray-600">Eficacia Ataques:</span><p className="font-bold">{awayXG.attackEfficiency}</p></div>
            <div><span className="text-gray-600">xG REAL DEBERÍA SER:</span><p className="font-bold text-green-600">{awayXG.expectedxG.toFixed(2)}</p></div>
            <div><span className="text-gray-600">DIFERENCIA xG:</span><p className={`font-bold ${awayXG.xGDifference > 0 ? 'text-green-600' : 'text-red-600'}`}>{awayXG.xGDifference.toFixed(2)}</p></div>
            <div><span className="text-gray-600">VELOCIDAD xG/min:</span><p className="font-bold">{awayXG.xGPerMinute.toFixed(4)}</p></div>
            <div><span className="text-gray-600">FACTOR URGENCIA:</span><p className="font-bold">{awayXG.urgencyFactor}</p></div>
            <div><span className="text-gray-600">PROYECCIÓN GOLES REST:</span><p className="font-bold">{awayXG.projectedRemainingGoals.toFixed(2)}</p></div>
            <div><span className="text-gray-600">GOLES ESPERADOS FINALES:</span><p className="font-bold text-red-600">{awayXG.expectedFinalGoals.toFixed(2)}</p></div>
            <div><span className="text-gray-600">NIVEL CONFIANZA:</span><p className={`font-bold ${awayXG.confidenceLevel === 'ALTA' ? 'text-green-600' : awayXG.confidenceLevel === 'MEDIA' ? 'text-yellow-600' : 'text-red-600'}`}>{awayXG.confidenceLevel}</p></div>
          </div>
          
          <div className="bg-red-50 p-3 rounded-lg border border-red-200">
            <p className="text-red-800 font-semibold">{getInterpretation(awayXG.xGDifference, false)}</p>
          </div>
        </div>
      </div>
    </div>
  );
};