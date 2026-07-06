import React, { useState } from 'react';
import { setApiKey, getApiKey, hasApiKey } from '../../services/football-data/client';

interface ApiKeySetupProps {
  onConfigured: () => void;
}

export const ApiKeySetup: React.FC<ApiKeySetupProps> = ({ onConfigured }) => {
  const [key, setKey] = useState(getApiKey());
  const [saved, setSaved] = useState(hasApiKey());

  const handleSave = () => {
    if (key.trim()) {
      setApiKey(key.trim());
      setSaved(true);
      onConfigured();
    }
  };

  if (saved) {
    return (
      <div className="bg-green-50 p-4 rounded-xl border border-green-200 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <span className="text-green-600 mr-2">✅</span>
            <span className="text-sm text-green-800 font-medium">API Key configurada (football-data.org)</span>
          </div>
          <button
            onClick={() => setSaved(false)}
            className="text-xs text-green-600 hover:text-green-800 underline"
          >
            Cambiar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-amber-50 p-6 rounded-xl border border-amber-200 mb-6">
      <h3 className="text-lg font-semibold text-amber-800 mb-2">🔑 Configurar football-data.org</h3>
      <p className="text-sm text-amber-700 mb-4">
        Necesitas una API Key gratuita de{' '}
        <a href="https://www.football-data.org/" target="_blank" rel="noopener noreferrer" className="underline font-medium">
          football-data.org
        </a>{' '}
        (gratis, sin tarjeta, datos actuales de 12 ligas top).
      </p>
      <div className="flex gap-3">
        <input
          type="text"
          value={key}
          onChange={(e) => setKey(e.target.value)}
          placeholder="Tu API Key aquí..."
          className="flex-1 px-4 py-2 border border-amber-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
        />
        <button
          onClick={handleSave}
          disabled={!key.trim()}
          className="px-4 py-2 bg-amber-600 text-white rounded-lg text-sm font-medium hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          Guardar
        </button>
      </div>
    </div>
  );
};
