import React from 'react';
import { useNavigation } from '../../context/NavigationContext';
import { AppModule } from '../../types/betting';

export const AppNavigation: React.FC = () => {
  const { currentModule, setCurrentModule } = useNavigation();

  const menuItems = [
    {
      id: AppModule.DIXON_COLES,
      label: '🧮 Dixon-Coles',
      description: 'Calculadora de probabilidades pre-partido'
    },
    {
      id: AppModule.XG_REALTIME,
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
};