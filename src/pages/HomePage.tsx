import { useState } from 'react';
import { DixonColesCalculator } from '../components/calculator/DixonColesCalculator';
import { TeamDataForm } from '../components/data-input/TeamDataForm';
import { ValidationDashboard } from '../components/validation/ValidationDashboard';
import { BettingCalculatorProvider } from '../context/BettingCalculatorContext';
import { useBettingCalculator } from '../hooks/useBettingCalculator';
import { XGRealtimeModule } from '../components/modules/XGRealtimeModule';

// Definir los módulos disponibles
const MODULES = {
  DIXON_COLES: 'dixon-coles',
  XG_REALTIME: 'xg-realtime'
} as const;

type AppModule = typeof MODULES[keyof typeof MODULES];

// Componente de Navegación
function AppNavigation({ currentModule, setCurrentModule }: { 
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

// Módulo Dixon-Coles
function DixonColesModule() {
  return (
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
  );
}

// Renderizador de módulos
function ModuleRenderer({ currentModule }: { currentModule: AppModule }) {
  switch (currentModule) {
    case MODULES.DIXON_COLES:
      return <DixonColesModule />;
    case MODULES.XG_REALTIME:
      return <XGRealtimeModule />;
    default:
      return <DixonColesModule />;
  }
}

// Contenido principal de la App
function HomeContent() {
  const [currentModule, setCurrentModule] = useState<AppModule>(MODULES.DIXON_COLES);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 py-8">
      <div className="container mx-auto max-w-7xl px-4">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            🎯 Suite de Análisis Deportivo
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Herramientas profesionales para análisis de fútbol y apuestas
          </p>
        </div>

        {/* Navegación */}
        <AppNavigation 
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

// Home Page
export default function HomePage() {
  const calculator = useBettingCalculator();

  return (
    <BettingCalculatorProvider value={calculator}>
      <HomeContent />
    </BettingCalculatorProvider>
  );
}
