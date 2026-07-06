import { useState } from 'react';
import { DixonColesCalculator } from '../components/calculator/DixonColesCalculator';
import { TeamDataForm } from '../components/data-input/TeamDataForm';
import { ValidationDashboard } from '../components/validation/ValidationDashboard';
import { BettingCalculatorProvider, useBettingCalculatorContext } from '../context/BettingCalculatorContext';
import { useBettingCalculator } from '../hooks/useBettingCalculator';
import { XGRealtimeModule } from '../components/modules/XGRealtimeModule';
import { MatchSelector } from '../components/auto/MatchSelector';
import type { SelectedMatchData } from '../components/auto/MatchSelector';
import { useAutoFill } from '../hooks/useAutoFill';

// Definir los módulos disponibles
const MODULES = {
  DIXON_COLES: 'dixon-coles',
  XG_REALTIME: 'xg-realtime'
} as const;

type AppModule = typeof MODULES[keyof typeof MODULES];

// Componente de Navegación
function AutoNavigation({ currentModule, setCurrentModule }: { 
  currentModule: AppModule; 
  setCurrentModule: (module: AppModule) => void;
}) {
  const menuItems = [
    {
      id: MODULES.DIXON_COLES,
      label: '🧮 Dixon-Coles',
      description: 'Calculadora de probabilidades pre-partido'
    },
    {
      id: MODULES.XG_REALTIME,
      label: '⚡ xG Online',
      description: 'Expected Goals en tiempo real'
    }
  ];

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 mb-8">
      <div className="p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Módulos de Análisis</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setCurrentModule(item.id)}
              className={`p-4 rounded-xl border-2 text-left transition-all ${
                currentModule === item.id
                  ? 'border-blue-500 bg-blue-50 shadow-md'
                  : 'border-gray-200 bg-gray-50 hover:bg-gray-100'
              }`}
            >
              <div className="flex items-center mb-2">
                <span className="text-2xl mr-3">{item.label.split(' ')[0]}</span>
                <span className="font-semibold text-gray-800">{item.label.split(' ').slice(1).join(' ')}</span>
              </div>
              <p className="text-sm text-gray-600">{item.description}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// Módulo Dixon-Coles con selector automático
function DixonColesAutoModule() {
  const { fillFromMatch, loading, status, error } = useAutoFill();
  const { updateMatchData } = useBettingCalculatorContext();

  const handleMatchSelected = (data: SelectedMatchData) => {
    const matchData = fillFromMatch(data);
    if (matchData) {
      updateMatchData(matchData);
    }
  };

  return (
    <div>
      {/* Selector de partidos */}
      <MatchSelector 
        onMatchSelected={handleMatchSelected}
        isLoading={loading}
      />

      {/* Status */}
      {status && !error && (
        <div className="bg-green-50 p-3 rounded-lg border border-green-200 mb-6">
          <p className="text-sm text-green-700">{status}</p>
        </div>
      )}
      {error && (
        <div className="bg-red-50 p-3 rounded-lg border border-red-200 mb-6">
          <p className="text-sm text-red-700">❌ {error}</p>
        </div>
      )}

      {/* Layout Dixon-Coles */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Columna izquierda - Entrada de datos */}
        <div className="space-y-8">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
            <TeamDataForm />
          </div>
          
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
            <ValidationDashboard />
          </div>
        </div>
        
        {/* Columna derecha - Cálculos y resultados */}
        <div className="space-y-8">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
            <DixonColesCalculator />
          </div>
        </div>
      </div>
    </div>
  );
}

// Renderizador de módulos
function ModuleRenderer({ currentModule }: { currentModule: AppModule }) {
  switch (currentModule) {
    case MODULES.DIXON_COLES:
      return <DixonColesAutoModule />;
    case MODULES.XG_REALTIME:
      return <XGRealtimeModule />;
    default:
      return <DixonColesAutoModule />;
  }
}

// Contenido principal de Auto
function AutoContent() {
  const [currentModule, setCurrentModule] = useState<AppModule>(MODULES.DIXON_COLES);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 py-8">
      <div className="container mx-auto max-w-7xl px-4">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            🤖 Suite de Análisis Deportivo — Auto
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Datos pre-llenados automáticamente vía football-data.org
          </p>
        </div>

        {/* Navegación */}
        <AutoNavigation 
          currentModule={currentModule} 
          setCurrentModule={setCurrentModule} 
        />

        {/* Módulo Actual */}
        <ModuleRenderer currentModule={currentModule} />

        {/* Footer */}
        <div className="text-center mt-12 pt-8 border-t border-gray-200">
          <p className="text-gray-500 text-sm">
            Diseñado para análisis profesional de apuestas deportivas
          </p>
        </div>
      </div>
    </div>
  );
}

// Auto Page con su propio provider
export default function AutoPage() {
  const calculator = useBettingCalculator();

  return (
    <BettingCalculatorProvider value={calculator}>
      <AutoContent />
    </BettingCalculatorProvider>
  );
}
