import React from 'react';

export const TestComponent: React.FC = () => {
  return (
    <div className="p-4 bg-green-100 border border-green-400 rounded">
      <h2 className="text-lg font-semibold">¡Componente funcionando!</h2>
      <p>Si ves esto, React está funcionando correctamente.</p>
    </div>
  );
};