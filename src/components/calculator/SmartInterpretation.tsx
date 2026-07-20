import React from 'react';
import type { CalculationResult, MatchData } from '../../types/betting';
import { getScoreMatrix } from '../../utils/dixon-coles';

interface SmartInterpretationProps {
  results: CalculationResult;
  matchData: MatchData;
  attackLocal: number;
  defenseLocal: number;
  attackVisitor: number;
  defenseVisitor: number;
}

interface MarketCompatibility {
  market: string;
  stars: number;
  label: string;
}

export const SmartInterpretation: React.FC<SmartInterpretationProps> = ({
  results, matchData, attackLocal, defenseLocal, attackVisitor, defenseVisitor
}) => {
  const { lambdaFinalLocal, lambdaFinalVisitor } = results.params;
  const { draw: probDraw } = results.probabilities;
  const localName = matchData.local.name || 'Local';
  const visitorName = matchData.visitor.name || 'Visitante';

  // Top marcadores
  const scoreMatrix = getScoreMatrix(lambdaFinalLocal, lambdaFinalVisitor, results.params.rho);
  const topScores = scoreMatrix.slice(0, 3);

  // === CÁLCULOS BASE ===
  const diffAtaque = Math.abs(attackLocal - attackVisitor);
  const diffDefensa = Math.abs(defenseLocal - defenseVisitor);
  const diffLambda = Math.abs(lambdaFinalLocal - lambdaFinalVisitor);
  const lambdaTotal = lambdaFinalLocal + lambdaFinalVisitor;
  const empatePercent = probDraw * 100;

  // Determinar favorito
  const favoritoLocal = lambdaFinalLocal > lambdaFinalVisitor;
  const favoritoName = favoritoLocal ? localName : visitorName;

  // === PASO 2: Comparativa Ofensiva ===
  const getOfensiveMsg = (): string => {
    if (diffAtaque < 0.05) return 'Ambos equipos presentan un nivel ofensivo muy similar.';
    const mejor = attackLocal > attackVisitor ? localName : visitorName;
    if (diffAtaque <= 0.15) return `${mejor} presenta una ligera ventaja ofensiva.`;
    if (diffAtaque <= 0.30) return `${mejor} presenta una clara superioridad ofensiva.`;
    return `${mejor} domina ampliamente en ataque.`;
  };

  // === PASO 3: Comparativa Defensiva (menor = mejor) ===
  const getDefensiveMsg = (): string => {
    if (diffDefensa < 0.05) return 'Ambos equipos presentan una defensa muy similar.';
    const mejor = defenseLocal < defenseVisitor ? localName : visitorName;
    if (diffDefensa <= 0.15) return `${mejor} posee una ligera ventaja defensiva.`;
    if (diffDefensa <= 0.30) return `${mejor} posee una defensa claramente superior.`;
    return `${mejor} domina ampliamente en defensa.`;
  };

  // === PASO 4-5: Potencial Goleador ===
  const getGoalPotential = (lambda: number): string => {
    if (lambda < 0.70) return 'Muy pocas probabilidades de marcar. Lo más probable es 0-1 goles.';
    if (lambda < 1.00) return 'Alta probabilidad de marcar 1 gol.';
    if (lambda < 1.40) return 'Alta probabilidad de marcar 1 gol con opciones de llegar a 2.';
    if (lambda < 1.80) return 'Alta probabilidad de marcar entre 1 y 2 goles.';
    if (lambda < 2.30) return 'Muy alta probabilidad de marcar 2 goles con opciones de llegar a 3.';
    return 'Muy alta probabilidad de marcar 2 o más goles.';
  };

  // === PASO 6: Superioridad ===
  const getSuperiorityMsg = (): string => {
    if (diffLambda < 0.10) return 'Partido totalmente equilibrado.';
    if (diffLambda < 0.25) return 'Ligera ventaja para uno de los equipos.';
    if (diffLambda < 0.50) return 'Favorito moderado.';
    if (diffLambda < 0.70) return 'Favorito fuerte.';
    if (diffLambda < 1.00) return 'Favorito muy fuerte.';
    return 'Superioridad muy marcada.';
  };

  // === PASO 7: Ritmo ===
  const getRhythmMsg = (): string => {
    if (lambdaTotal < 2.0) return 'Partido muy cerrado.';
    if (lambdaTotal < 2.4) return 'Partido cerrado.';
    if (lambdaTotal < 2.8) return 'Partido de ritmo normal.';
    if (lambdaTotal < 3.2) return 'Partido abierto.';
    if (lambdaTotal < 3.6) return 'Partido muy abierto.';
    return 'Partido con muchas ocasiones de gol.';
  };

  // === PASO 8: Goles Esperados ===
  const getExpectedGoalsMsg = (): string => {
    if (lambdaTotal < 1.80) return 'Se espera un partido de 0-1 goles.';
    if (lambdaTotal < 2.30) return 'Se esperan entre 1 y 2 goles.';
    if (lambdaTotal < 2.90) return 'Se esperan entre 2 y 3 goles.';
    if (lambdaTotal < 3.50) return 'Se esperan entre 2 y 4 goles.';
    return 'Se esperan entre 3 y 5 goles.';
  };

  // === PASO 9: Empate ===
  const getDrawMsg = (): string => {
    if (empatePercent >= 30) return 'El empate es uno de los resultados más probables.';
    if (empatePercent >= 28) return 'El empate tiene buenas posibilidades de ocurrir.';
    if (empatePercent >= 25) return 'El empate mantiene una probabilidad normal.';
    if (empatePercent >= 22) return 'El empate parece poco probable.';
    return 'El empate tiene muy pocas probabilidades.';
  };

  // === PASO 10: Compatibilidad con Mercados ===
  const getMarketCompatibility = (): MarketCompatibility[] => {
    const markets: MarketCompatibility[] = [];

    // BTTS
    if (lambdaFinalLocal >= 1.10 && lambdaFinalVisitor >= 1.10) {
      markets.push({ market: 'Ambos Marcan', stars: 5, label: 'Muy Compatible' });
    } else if (lambdaFinalLocal >= 1.10 || lambdaFinalVisitor >= 1.10) {
      markets.push({ market: 'Ambos Marcan', stars: 3, label: 'Compatible' });
    } else {
      markets.push({ market: 'Ambos Marcan', stars: 2, label: 'Poco Compatible' });
    }

    // Over 1.5
    if (lambdaTotal >= 2) markets.push({ market: 'Over 1.5', stars: 5, label: 'Muy Compatible' });
    else if (lambdaTotal >= 1.5) markets.push({ market: 'Over 1.5', stars: 4, label: 'Compatible' });
    else markets.push({ market: 'Over 1.5', stars: 2, label: 'Poco Compatible' });

    // Over 2.5
    if (lambdaTotal >= 2.80) markets.push({ market: 'Over 2.5', stars: 5, label: 'Muy Compatible' });
    else if (lambdaTotal >= 2.50) markets.push({ market: 'Over 2.5', stars: 4, label: 'Compatible' });
    else if (lambdaTotal >= 2.20) markets.push({ market: 'Over 2.5', stars: 3, label: 'Moderado' });
    else markets.push({ market: 'Over 2.5', stars: 2, label: 'Poco Compatible' });

    // Under 3.5
    if (lambdaTotal < 3.20) markets.push({ market: 'Under 3.5', stars: 5, label: 'Muy Compatible' });
    else if (lambdaTotal < 3.60) markets.push({ market: 'Under 3.5', stars: 3, label: 'Moderado' });
    else markets.push({ market: 'Under 3.5', stars: 1, label: 'Poco Compatible' });

    return markets;
  };

  // === PASO 11: Factores Decisivos ===
  const getDecisiveFactors = (): string[] => {
    if (diffLambda < 0.10) return []; // Sin favorito claro
    const factors: string[] = [];
    if (favoritoLocal ? attackLocal > attackVisitor : attackVisitor > attackLocal) {
      if (diffAtaque > 0.10) factors.push('Superioridad ofensiva.');
    }
    if (favoritoLocal ? defenseLocal < defenseVisitor : defenseVisitor < defenseLocal) {
      if (diffDefensa > 0.10) factors.push('Mejor solidez defensiva.');
    }
    if (diffLambda > 0.25) factors.push('Mayor expectativa de gol.');
    if (empatePercent < 25) factors.push('Menor riesgo de empate.');
    if (diffLambda > 0.40) factors.push('El modelo muestra una ventaja clara.');
    return factors;
  };

  // === PASO 12: Riesgos ===
  const getRisks = (): string[] => {
    const risks: string[] = [];
    const lambdaNoFavorito = favoritoLocal ? lambdaFinalVisitor : lambdaFinalLocal;
    if (lambdaNoFavorito >= 1.00) risks.push('El rival también tiene capacidad para marcar.');
    if (diffLambda < 0.25) risks.push('Partido muy equilibrado.');
    if (empatePercent >= 28) risks.push('Alta probabilidad de empate.');
    if (diffLambda < 0.15 && diffLambda >= 0.10) risks.push('Diferencia de Lambda reducida.');
    if (diffAtaque < 0.10) risks.push('Ambos equipos presentan una expectativa ofensiva similar.');
    return risks;
  };

  // === PASO 15: Puntos Clave (solo los más relevantes) ===
  const getKeyPoints = (): string[] => {
    const points: string[] = [];
    
    // Solo agregar si es diferencial (no genérico)
    if (diffAtaque >= 0.15) points.push(getOfensiveMsg());
    if (diffDefensa >= 0.15) points.push(getDefensiveMsg());
    
    // Potencial goleador solo si es notable
    if (lambdaFinalLocal >= 1.80) points.push(`${localName} tiene una muy alta probabilidad de marcar 2+ goles.`);
    else if (lambdaFinalLocal >= 1.40) points.push(`${localName} tiene alta probabilidad de marcar entre 1 y 2 goles.`);
    
    if (lambdaFinalVisitor >= 1.80) points.push(`${visitorName} tiene una muy alta probabilidad de marcar 2+ goles.`);
    else if (lambdaFinalVisitor >= 1.40) points.push(`${visitorName} tiene alta probabilidad de marcar entre 1 y 2 goles.`);

    // Ritmo solo si es diferenciador
    if (lambdaTotal >= 3.2 || lambdaTotal < 2.0) points.push(getRhythmMsg());
    
    // Goles esperados
    points.push(getExpectedGoalsMsg());
    
    // Empate solo si es extremo
    if (empatePercent >= 30 || empatePercent < 22) points.push(getDrawMsg());

    // Favorito
    if (diffLambda >= 0.10) points.push(`${favoritoName} parte como favorito.`);

    return points;
  };

  // === PASO 16: Resumen Inteligente ===
  const buildSummary = (): string => {
    const parts: string[] = [];

    // Ofensiva
    if (diffAtaque >= 0.15) {
      const mejor = attackLocal > attackVisitor ? localName : visitorName;
      parts.push(`${mejor} presenta una clara superioridad ofensiva`);
    } else {
      parts.push('Ambos equipos muestran un nivel ofensivo similar');
    }

    // Defensiva
    if (diffDefensa >= 0.15) {
      parts.push(`mientras que defensivamente ${defenseLocal < defenseVisitor ? localName : visitorName} es superior`);
    } else {
      parts.push('mientras que defensivamente ambos equipos muestran un rendimiento similar');
    }

    // Ritmo
    if (lambdaTotal >= 3.2) parts.push(`Se espera un partido abierto con una producción estimada de ${Math.round(lambdaTotal)} goles`);
    else if (lambdaTotal < 2.0) parts.push('Se espera un partido cerrado con pocas ocasiones');
    else parts.push(`Se esperan alrededor de ${lambdaTotal.toFixed(1)} goles`);

    // BTTS
    if (lambdaFinalLocal >= 1.10 && lambdaFinalVisitor >= 1.10) {
      parts.push('Ambos equipos tienen capacidad para marcar');
    }

    // Empate
    if (empatePercent >= 30) parts.push('El empate aparece como un resultado muy probable');
    else if (empatePercent < 22) parts.push('El empate aparece como un resultado poco probable');

    // Favorito
    if (diffLambda >= 0.25) {
      parts.push(`El modelo señala a ${favoritoName} como favorito`);
    } else if (diffLambda >= 0.10) {
      parts.push(`${favoritoName} tiene una ligera ventaja según el modelo`);
    }

    return parts.join('. ') + '.';
  };

  const starDisplay = (count: number) => '⭐'.repeat(count) + '☆'.repeat(5 - count);
  const markets = getMarketCompatibility();
  const factors = getDecisiveFactors();
  const risks = getRisks();
  const keyPoints = getKeyPoints();

  return (
    <div className="mt-8">
      <div className="flex items-center mb-6">
        <div className="w-2 h-8 bg-violet-500 rounded-full mr-3"></div>
        <h2 className="text-2xl font-bold text-gray-800">🧠 Interpretación Inteligente del Partido</h2>
      </div>

      {/* Comparativa de Equipos */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-3">⚔️ Comparativa de Equipos</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <p className="text-sm font-medium text-blue-800 mb-1">Ofensiva</p>
            <p className="text-sm text-gray-700">{getOfensiveMsg()}</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <p className="text-sm font-medium text-green-800 mb-1">Defensiva</p>
            <p className="text-sm text-gray-700">{getDefensiveMsg()}</p>
          </div>
        </div>
      </div>

      {/* Potencial Goleador */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-3">⚽ Potencial Goleador</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <p className="text-sm font-medium text-gray-800 mb-1">🏠 {localName} (λ {lambdaFinalLocal.toFixed(2)})</p>
            <p className="text-sm text-gray-700">{getGoalPotential(lambdaFinalLocal)}</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <p className="text-sm font-medium text-gray-800 mb-1">✈️ {visitorName} (λ {lambdaFinalVisitor.toFixed(2)})</p>
            <p className="text-sm text-gray-700">{getGoalPotential(lambdaFinalVisitor)}</p>
          </div>
        </div>
      </div>

      {/* Ritmo + Goles Esperados */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
          <h3 className="text-sm font-semibold text-amber-800 mb-1">📈 Ritmo del Partido</h3>
          <p className="text-sm text-gray-700">{getRhythmMsg()}</p>
          <p className="text-xs text-gray-500 mt-1">λ Total: {lambdaTotal.toFixed(2)}</p>
        </div>
        <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
          <h3 className="text-sm font-semibold text-amber-800 mb-1">🎯 Goles Esperados</h3>
          <p className="text-sm text-gray-700">{getExpectedGoalsMsg()}</p>
        </div>
      </div>

      {/* Empate */}
      <div className="mb-6 bg-gray-50 p-4 rounded-lg border border-gray-200">
        <h3 className="text-sm font-semibold text-gray-800 mb-1">🤝 Interpretación del Empate ({empatePercent.toFixed(1)}%)</h3>
        <p className="text-sm text-gray-700">{getDrawMsg()}</p>
      </div>

      {/* Compatibilidad con Mercados */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-3">📊 Compatibilidad con Mercados</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {markets.map((m) => (
            <div key={m.market} className="bg-white p-3 rounded-lg border border-gray-200 text-center">
              <p className="text-xs font-medium text-gray-600 mb-1">{m.market}</p>
              <p className="text-sm">{starDisplay(m.stars)}</p>
              <p className="text-xs text-gray-500 mt-1">{m.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Factores Decisivos + Riesgos */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        {factors.length > 0 && (
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <h3 className="text-sm font-semibold text-green-800 mb-2">🔑 Factores que favorecen a {favoritoName}</h3>
            <ul className="space-y-1">
              {factors.map((f, i) => (
                <li key={i} className="text-sm text-green-700">✔ {f}</li>
              ))}
            </ul>
          </div>
        )}
        {risks.length > 0 && (
          <div className="bg-red-50 p-4 rounded-lg border border-red-200">
            <h3 className="text-sm font-semibold text-red-800 mb-2">⚠ Riesgos Detectados</h3>
            <ul className="space-y-1">
              {risks.map((r, i) => (
                <li key={i} className="text-sm text-red-700">• {r}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Pronóstico Principal */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-3">🏆 Pronóstico Principal</h3>
        <div className={`p-4 rounded-xl text-center ${
          diffLambda < 0.10 ? 'bg-gray-100 border border-gray-300' :
          diffLambda < 0.25 ? 'bg-blue-50 border border-blue-200' :
          diffLambda < 0.50 ? 'bg-blue-100 border border-blue-300' :
          'bg-blue-200 border border-blue-400'
        }`}>
          {diffLambda < 0.10 ? (
            <p className="text-lg font-bold text-gray-700">⚖ Partido Muy Equilibrado</p>
          ) : (
            <>
              <p className="text-lg font-bold text-blue-800">🟢 Favorito: {favoritoName}</p>
              <p className="text-sm mt-1">{getSuperiorityMsg()}</p>
              <p className="mt-1">{starDisplay(Math.min(5, Math.ceil(diffLambda * 5)))}</p>
            </>
          )}
        </div>
      </div>

      {/* Top 3 Marcadores */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-3">🥇 Top 3 Marcadores Esperados</h3>
        <div className="flex gap-4 justify-center">
          {topScores.map((score, i) => (
            <div key={i} className={`text-center p-4 rounded-xl border-2 ${
              i === 0 ? 'bg-yellow-50 border-yellow-300' :
              i === 1 ? 'bg-gray-50 border-gray-300' :
              'bg-orange-50 border-orange-200'
            }`}>
              <p className="text-xs text-gray-500">{i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉'}</p>
              <p className="text-2xl font-bold text-gray-800">{score.home}-{score.away}</p>
              <p className="text-xs text-gray-500">{(score.probability * 100).toFixed(1)}%</p>
            </div>
          ))}
        </div>
      </div>

      {/* Puntos Clave */}
      <div className="mb-6 bg-violet-50 p-5 rounded-xl border border-violet-200">
        <h3 className="text-lg font-semibold text-violet-800 mb-3">📋 Puntos Clave del Partido</h3>
        <ul className="space-y-2">
          {keyPoints.map((point, i) => (
            <li key={i} className="flex items-start text-sm text-gray-700">
              <span className="text-violet-500 mr-2 mt-0.5">✅</span>
              {point}
            </li>
          ))}
        </ul>
      </div>

      {/* Resumen Inteligente */}
      <div className="bg-gradient-to-r from-violet-50 to-blue-50 p-5 rounded-xl border border-violet-200">
        <h3 className="text-lg font-semibold text-violet-800 mb-3">🧠 Resumen Inteligente</h3>
        <p className="text-sm text-gray-700 leading-relaxed">{buildSummary()}</p>
      </div>
    </div>
  );
};
