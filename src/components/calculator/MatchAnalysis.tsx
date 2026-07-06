import React from 'react';
import type { CalculationResult, MatchData } from '../../types/betting';
import { getScoreMatrix } from '../../utils/dixon-coles';

interface MatchAnalysisProps {
  results: CalculationResult;
  matchData: MatchData;
}

export const MatchAnalysis: React.FC<MatchAnalysisProps> = ({ results, matchData }) => {
  const { lambdaFinalLocal, lambdaFinalVisitor, lambdaLocal, lambdaVisitor } = results.params;
  const { draw: probDraw } = results.probabilities;

  // PASO 3: Diferencia Lambda
  const diferenciaLambda = Math.abs(lambdaFinalLocal - lambdaFinalVisitor);

  // PASO 6: Lambda Total
  const lambdaTotal = lambdaFinalLocal + lambdaFinalVisitor;

  // PASO 4: Equipo con mayor expectativa ofensiva
  const mayorExpectativa = lambdaFinalLocal > lambdaFinalVisitor
    ? 'El equipo local tiene mayor expectativa de gol.'
    : 'El equipo visitante tiene mayor expectativa de gol.';

  // PASO 5: Equilibrio del partido
  const equilibrio = diferenciaLambda <= 0.20
    ? 'Partido muy equilibrado.'
    : diferenciaLambda <= 0.50
    ? 'Ligera ventaja para uno de los equipos.'
    : 'Existe un favorito claro.';

  // PASO 6: Ritmo esperado
  const ritmo = lambdaTotal < 2.00
    ? 'Se espera un partido de pocos goles.'
    : lambdaTotal <= 3.00
    ? 'Se espera un partido con cantidad media de goles.'
    : 'Se espera un partido con muchos goles.';

  // PASO 7: Probabilidad de empate
  const empatePercent = probDraw * 100;
  const analisisEmpate = empatePercent >= 35
    ? 'Alta probabilidad de empate.'
    : empatePercent >= 30
    ? 'Empate con posibilidades importantes.'
    : 'Empate poco probable.';

  // PASO 8: Efecto del xG
  const hasXgData = !!(matchData.local.xG || matchData.local.xGA || matchData.visitor.xG || matchData.visitor.xGA);

  let efectoXgLocal = '';
  let efectoXgVisitor = '';
  if (hasXgData) {
    if (lambdaFinalLocal > lambdaLocal) {
      efectoXgLocal = 'El xG incrementó la expectativa ofensiva del equipo local.';
    } else if (lambdaFinalLocal < lambdaLocal) {
      efectoXgLocal = 'El xG redujo la expectativa ofensiva del equipo local.';
    }

    if (lambdaFinalVisitor > lambdaVisitor) {
      efectoXgVisitor = 'El xG incrementó la expectativa ofensiva del equipo visitante.';
    } else if (lambdaFinalVisitor < lambdaVisitor) {
      efectoXgVisitor = 'El xG redujo la expectativa ofensiva del equipo visitante.';
    }
  }

  // PASO 9-10: Marcadores más probables desde la matriz Poisson
  const scoreMatrix = getScoreMatrix(lambdaFinalLocal, lambdaFinalVisitor, results.params.rho);
  const topScores = scoreMatrix.slice(0, 5);
  const mostProbableScore = topScores[0];

  // PASO 11: Resumen
  const resumen: string[] = [];
  resumen.push(equilibrio);
  resumen.push(ritmo);
  resumen.push(mayorExpectativa);
  resumen.push(analisisEmpate);
  if (efectoXgLocal) resumen.push(efectoXgLocal);
  if (efectoXgVisitor) resumen.push(efectoXgVisitor);
  resumen.push(`Marcador más probable: ${mostProbableScore.home}-${mostProbableScore.away}.`);

  // === ÍNDICE DEL PARTIDO (0-100) ===

  // Equilibrio (0-25): más equilibrado = más puntos
  // diferenciaLambda 0 → 25pts, diferenciaLambda >= 1.0 → 0pts
  const puntosEquilibrio = Math.round(Math.max(0, 25 - (diferenciaLambda * 25)));

  // Tendencia al empate (0-25): mayor prob empate = más puntos
  // empate 40%+ → 25pts, empate 20% → 0pts
  const puntosEmpate = Math.round(Math.max(0, Math.min(25, ((empatePercent - 20) / 20) * 25)));

  // Ritmo de goles (0-25): más goles esperados = más puntos
  // lambdaTotal 0 → 0pts, lambdaTotal 4+ → 25pts
  const puntosRitmo = Math.round(Math.max(0, Math.min(25, (lambdaTotal / 4) * 25)));

  // Consistencia modelo-xG (0-25): menor diferencia entre lambdas del modelo y xG = más puntos
  let puntosConsistencia = 25; // Por defecto máximo si no hay xG
  if (hasXgData) {
    const diffLocal = Math.abs(lambdaFinalLocal - lambdaLocal);
    const diffVisitor = Math.abs(lambdaFinalVisitor - lambdaVisitor);
    const avgDiff = (diffLocal + diffVisitor) / 2;
    // avgDiff 0 → 25pts, avgDiff >= 0.5 → 0pts
    puntosConsistencia = Math.round(Math.max(0, 25 - (avgDiff * 50)));
  }

  const indicePartido = puntosEquilibrio + puntosEmpate + puntosRitmo + puntosConsistencia;

  const getIndiceColor = (indice: number) => {
    if (indice >= 75) return 'text-emerald-700 bg-emerald-100 border-emerald-300';
    if (indice >= 50) return 'text-blue-700 bg-blue-100 border-blue-300';
    if (indice >= 25) return 'text-amber-700 bg-amber-100 border-amber-300';
    return 'text-red-700 bg-red-100 border-red-300';
  };

  const getIndiceLabel = (indice: number) => {
    if (indice >= 75) return 'Partido muy interesante';
    if (indice >= 50) return 'Partido con potencial';
    if (indice >= 25) return 'Partido moderado';
    return 'Partido poco atractivo';
  };

  return (
    <div className="mt-8">
      <div className="flex items-center mb-6">
        <div className="w-2 h-8 bg-emerald-500 rounded-full mr-3"></div>
        <h2 className="text-2xl font-bold text-gray-800">Análisis del Partido</h2>
      </div>

      {/* Análisis detallado */}
      <div className="space-y-4 mb-6">
        {/* Expectativa ofensiva */}
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <div className="flex items-start">
            <span className="text-lg mr-2">⚽</span>
            <div>
              <p className="font-medium text-gray-800">{mayorExpectativa}</p>
              <p className="text-sm text-gray-500">Diferencia Lambda: {diferenciaLambda.toFixed(3)}</p>
            </div>
          </div>
        </div>

        {/* Equilibrio */}
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <div className="flex items-start">
            <span className="text-lg mr-2">⚖️</span>
            <p className="font-medium text-gray-800">{equilibrio}</p>
          </div>
        </div>

        {/* Ritmo */}
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <div className="flex items-start">
            <span className="text-lg mr-2">🎯</span>
            <div>
              <p className="font-medium text-gray-800">{ritmo}</p>
              <p className="text-sm text-gray-500">Lambda Total: {lambdaTotal.toFixed(3)}</p>
            </div>
          </div>
        </div>

        {/* Empate */}
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <div className="flex items-start">
            <span className="text-lg mr-2">🤝</span>
            <div>
              <p className="font-medium text-gray-800">{analisisEmpate}</p>
              <p className="text-sm text-gray-500">Probabilidad empate: {empatePercent.toFixed(1)}%</p>
            </div>
          </div>
        </div>

        {/* Efecto xG */}
        {hasXgData && (efectoXgLocal || efectoXgVisitor) && (
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <div className="flex items-start">
              <span className="text-lg mr-2">📊</span>
              <div className="space-y-1">
                {efectoXgLocal && <p className="font-medium text-gray-800">{efectoXgLocal}</p>}
                {efectoXgVisitor && <p className="font-medium text-gray-800">{efectoXgVisitor}</p>}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Marcadores más probables */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-3 flex items-center">
          <span className="w-2 h-2 bg-gray-400 rounded-full mr-2"></span>
          Top 5 Marcadores Más Probables
        </h3>
        <div className="grid grid-cols-5 gap-3">
          {topScores.map((score, index) => (
            <div
              key={`${score.home}-${score.away}`}
              className={`text-center p-3 rounded-lg border ${
                index === 0
                  ? 'bg-emerald-50 border-emerald-300'
                  : 'bg-gray-50 border-gray-200'
              }`}
            >
              <p className={`text-xl font-bold ${index === 0 ? 'text-emerald-700' : 'text-gray-800'}`}>
                {score.home}-{score.away}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {(score.probability * 100).toFixed(1)}%
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Resumen final */}
      <div className="bg-emerald-50 p-5 rounded-xl border border-emerald-200 mb-6">
        <h3 className="text-lg font-semibold text-emerald-800 mb-3">📋 Resumen</h3>
        <ul className="space-y-2">
          {resumen.map((item, index) => (
            <li key={index} className="flex items-start">
              <span className="text-emerald-500 mr-2 mt-0.5">•</span>
              <span className="text-gray-700">{item}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Índice del Partido */}
      <div className="mt-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
          <span className="w-2 h-2 bg-gray-400 rounded-full mr-2"></span>
          Índice del Partido
        </h3>

        {/* Puntuación principal */}
        <div className={`text-center p-6 rounded-xl border-2 mb-4 ${getIndiceColor(indicePartido)}`}>
          <p className="text-5xl font-bold">{indicePartido}</p>
          <p className="text-sm font-medium mt-1">/100</p>
          <p className="text-lg font-semibold mt-2">{getIndiceLabel(indicePartido)}</p>
        </div>

        {/* Desglose de puntos */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">⚖️ Equilibrio</span>
              <span className="text-sm font-bold text-gray-800">{puntosEquilibrio}/25</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all"
                style={{ width: `${(puntosEquilibrio / 25) * 100}%` }}
              ></div>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">🤝 Tendencia al Empate</span>
              <span className="text-sm font-bold text-gray-800">{puntosEmpate}/25</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-amber-500 h-2 rounded-full transition-all"
                style={{ width: `${(puntosEmpate / 25) * 100}%` }}
              ></div>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">🎯 Ritmo de Goles</span>
              <span className="text-sm font-bold text-gray-800">{puntosRitmo}/25</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-emerald-500 h-2 rounded-full transition-all"
                style={{ width: `${(puntosRitmo / 25) * 100}%` }}
              ></div>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">📊 Consistencia Modelo/xG</span>
              <span className="text-sm font-bold text-gray-800">{puntosConsistencia}/25</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-purple-500 h-2 rounded-full transition-all"
                style={{ width: `${(puntosConsistencia / 25) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
