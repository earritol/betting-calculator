import React from 'react';
import { TeamDataForm } from '../data-input/TeamDataForm';
import { DixonColesCalculator } from '../calculator/DixonColesCalculator';
import { ValidationDashboard } from '../validation/ValidationDashboard';

export const DixonColesModule: React.FC = () => {
  return (
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
  );
};