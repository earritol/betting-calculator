import { DixonColesCalculator } from './components/calculator/DixonColesCalculator';
import { TeamDataForm } from './components/data-input/TeamDataForm';
import { ValidationDashboard } from './components/validation/ValidationDashboard';
import { BettingCalculatorProvider } from './context/BettingCalculatorContext';
import { useBettingCalculator } from './hooks/useBettingCalculator';

function AppContent() {
  // Este componente ahora puede existir si necesitas acceder a `results` aquí,
  // pero para el `key` lo haremos de otra forma.

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 py-8">
      <div className="container mx-auto max-w-7xl px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            🎯 Calculadora Dixon-Coles
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Calcula probabilidades de fútbol y encuentra value bets usando el modelo Dixon-Coles
          </p>
        </div>
        
        {/* Grid principal */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Columna izquierda - Entrada de datos */}
          <div className="space-y-8">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
              <TeamDataForm />
            </div>
          </div>
          
          {/* Columna derecha - Cálculos y resultados */}
          <div className="space-y-8">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
              <DixonColesCalculator />
            </div>
            
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
              <ValidationDashboard />
            </div>
          </div>
        </div>
        
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

function App() {
  const calculator = useBettingCalculator();

  return (
    <BettingCalculatorProvider value={calculator}>
      <AppContent />
    </BettingCalculatorProvider>
  );
}

export default App;