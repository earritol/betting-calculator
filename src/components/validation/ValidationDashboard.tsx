import React from 'react';
import { useBettingCalculator } from '../../hooks/useBettingCalculator';

export const ValidationDashboard: React.FC = () => {
  const { results, matchData } = useBettingCalculator();

  if (!results) return (
    <div className="p-8 text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
      <p className="mt-4 text-gray-600">Preparando validación...</p>
    </div>
  );

  const calculateRealProbabilities = () => {
    const { local, draw, visitor } = matchData.odds;
    const totalImplied = (1/local) + (1/draw) + (1/visitor);
    
    return {
      local: (1/local) / totalImplied,
      draw: (1/draw) / totalImplied,
      visitor: (1/visitor) / totalImplied
    };
  };

  const realProbs = calculateRealProbabilities();

  const getDecisionColor = (decision: string) => {
    switch (decision) {
      case 'APOSTAR': 
        return 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg';
      case 'CONSIDERAR': 
        return 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white shadow-lg';
      default: 
        return 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg';
    }
  };

  const getValueColor = (value: number) => {
    if (value > 0.1) return 'text-green-600 bg-green-50 border-green-200';
    if (value > 0.05) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center mb-8">
        <div className="w-2 h-8 bg-green-500 rounded-full mr-3"></div>
        <h2 className="text-2xl font-bold text-gray-800">Validación y Decisiones</h2>
      </div>

      {/* Comparación de Probabilidades */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
          <span className="w-2 h-2 bg-gray-400 rounded-full mr-2"></span>
          Comparación de Probabilidades
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { type: 'Local', model: results.probabilities.local, real: realProbs.local, color: 'blue' },
            { type: 'Empate', model: results.probabilities.draw, real: realProbs.draw, color: 'gray' },
            { type: 'Visitante', model: results.probabilities.visitor, real: realProbs.visitor, color: 'red' }
          ].map((item, index) => (
            <div key={index} className={`bg-${item.color}-50 p-4 rounded-lg border border-${item.color}-200`}>
              <h4 className="font-semibold text-gray-800 mb-3">{item.type}</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Modelo:</span>
                  <span className="font-bold">{(item.model * 100).toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Mercado:</span>
                  <span className="font-bold">{(item.real * 100).toFixed(1)}%</span>
                </div>
                <div className="flex justify-between border-t border-gray-200 pt-2">
                  <span className="text-gray-600">Diferencia:</span>
                  <span className={`font-bold ${item.model > item.real ? 'text-green-600' : 'text-red-600'}`}>
                    {((item.model - item.real) * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Análisis de Valor y Decisión */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Valor y Kelly */}
        <div>
          <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
            <span className="w-2 h-2 bg-gray-400 rounded-full mr-2"></span>
            Análisis de Valor
          </h3>
          <div className="space-y-4">
            <div className={`p-4 rounded-lg border-2 ${getValueColor(results.value)}`}>
              <div className="flex justify-between items-center">
                <span className="font-semibold">Valor Local</span>
                <span className="text-2xl font-bold">{(results.value * 100).toFixed(1)}%</span>
              </div>
              <p className="text-sm mt-2">
                {results.value > 0 ? '✅ Edge positivo encontrado' : '❌ Sin ventaja significativa'}
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-orange-50 p-3 rounded-lg border border-orange-200">
                <span className="text-sm text-gray-600">Kelly %</span>
                <p className="text-lg font-bold text-orange-700">{(results.kellyPercentage * 100).toFixed(1)}%</p>
              </div>
              <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
                <span className="text-sm text-gray-600">Stake Sugerido</span>
                <p className="text-lg font-bold text-purple-700">{results.suggestedStake.toFixed(1)}%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Decisión Final */}
        <div>
          <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
            <span className="w-2 h-2 bg-gray-400 rounded-full mr-2"></span>
            Decisión Final
          </h3>
          <div className={`p-6 rounded-xl text-center ${getDecisionColor(results.decision)}`}>
            <p className="text-2xl font-bold mb-2">{results.decision}</p>
            {results.suggestedStake > 0 && (
              <p className="text-lg opacity-90">Stake recomendado: {results.suggestedStake.toFixed(1)}%</p>
            )}
            <p className="text-sm opacity-80 mt-2">
              {results.decision === 'APOSTAR' && '✅ Oportunidad de value bet identificada'}
              {results.decision === 'CONSIDERAR' && '⚠️ Valor marginal, considera cuidadosamente'}
              {results.decision === 'NO APOSTAR' && '❌ Sin ventaja sobre el mercado'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};