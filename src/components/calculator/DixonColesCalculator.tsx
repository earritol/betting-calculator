import React from 'react';
import { useBettingCalculatorContext } from '../../context/BettingCalculatorContext';

export const DixonColesCalculator: React.FC = () => {
  const { results, matchData } = useBettingCalculatorContext();

  if (!results) return (
    <div className="p-8 text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
      <p className="mt-4 text-gray-600">Calculando probabilidades...</p>
    </div>
  );

  const calculateAttackDefense = () => {
    const { local, visitor, leagueAverages } = matchData;
    
    const limitValue = (value: number) => Math.min(Math.max(value, 0.7), 1.3);
    
    const attackLocal = limitValue(local.goalsFor / leagueAverages.avgGoalsFor);
    const defenseLocal = limitValue(local.goalsAgainst / leagueAverages.avgGoalsAgainst);
    const attackVisitor = limitValue(visitor.goalsFor / leagueAverages.avgGoalsFor);
    const defenseVisitor = limitValue(visitor.goalsAgainst / leagueAverages.avgGoalsAgainst);

    return { attackLocal, defenseLocal, attackVisitor, defenseVisitor };
  };

  const { attackLocal, defenseLocal, attackVisitor, defenseVisitor } = calculateAttackDefense();

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center mb-8">
        <div className="w-2 h-8 bg-purple-500 rounded-full mr-3"></div>
        <h2 className="text-2xl font-bold text-gray-800">Cálculos Dixon-Coles</h2>
      </div>

      {/* Fuerzas de Ataque y Defensa */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
          <span className="w-2 h-2 bg-gray-400 rounded-full mr-2"></span>
          Fuerzas Normalizadas
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h4 className="font-medium text-gray-800 mb-3">Equipo Local</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Ataque:</span>
                <span className="font-semibold">{attackLocal.toFixed(4)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Defensa:</span>
                <span className="font-semibold">{defenseLocal.toFixed(4)}</span>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h4 className="font-medium text-gray-800 mb-3">Equipo Visitante</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Ataque:</span>
                <span className="font-semibold">{attackVisitor.toFixed(4)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Defensa:</span>
                <span className="font-semibold">{defenseVisitor.toFixed(4)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Parámetros Poisson */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
          <span className="w-2 h-2 bg-gray-400 rounded-full mr-2"></span>
          Parámetros Poisson
        </h3>
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <span className="text-sm text-gray-600">Lambda Local</span>
              <p className="text-lg font-bold text-blue-700">{results.params.lambdaLocal.toFixed(4)}</p>
            </div>
            <div>
              <span className="text-sm text-gray-600">Lambda Visitante</span>
              <p className="text-lg font-bold text-blue-700">{results.params.lambdaVisitor.toFixed(4)}</p>
            </div>
            <div>
              <span className="text-sm text-gray-600">Correlación (ρ)</span>
              <p className="text-lg font-bold text-blue-700">{results.params.rho.toFixed(4)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Probabilidades Finales */}
      <div>
        <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
          <span className="w-2 h-2 bg-gray-400 rounded-full mr-2"></span>
          Probabilidades Finales
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-xl text-center shadow-lg">
            <p className="font-semibold text-blue-100 mb-2">Local</p>
            <p className="text-3xl font-bold">{Math.round(results.probabilities.local * 100)}%</p>
            <p className="text-blue-200 text-sm mt-2">Victoria Local</p>
          </div>
          <div className="bg-gradient-to-br from-gray-500 to-gray-600 text-white p-6 rounded-xl text-center shadow-lg">
            <p className="font-semibold text-gray-100 mb-2">Empate</p>
            <p className="text-3xl font-bold">{Math.round(results.probabilities.draw * 100)}%</p>
            <p className="text-gray-200 text-sm mt-2">Resultado Empate</p>
          </div>
          <div className="bg-gradient-to-br from-red-500 to-red-600 text-white p-6 rounded-xl text-center shadow-lg">
            <p className="font-semibold text-red-100 mb-2">Visitante</p>
            <p className="text-3xl font-bold">{Math.round(results.probabilities.visitor * 100)}%</p>
            <p className="text-red-200 text-sm mt-2">Victoria Visitante</p>
          </div>
        </div>
      </div>
    </div>
  );
};