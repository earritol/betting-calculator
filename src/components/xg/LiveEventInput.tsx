import React, { useState } from 'react';
import { useLiveMatch } from '../../hooks/useLiveMatch';
import type { TeamSide, BodyPart, GameSituation, AssistType, FieldPosition } from '../../types/xg-types';

export const LiveEventInput: React.FC = () => {
  const { match, addEvent, updateMinute } = useLiveMatch();
  const [currentEvent, setCurrentEvent] = useState({
    minute: match.currentMinute,
    team: 'home' as TeamSide,
    player: '',
    type: 'shot' as 'shot' | 'goal' | 'miss' | 'chance',
    position: { x: 50, y: 50 } as FieldPosition,
    bodyPart: 'foot' as BodyPart,
    situation: 'open_play' as GameSituation,
    assisted: false,
    assistType: 'none' as AssistType,
    result: 'miss' as 'goal' | 'miss' | 'saved' | 'blocked'
  });

  const handlePositionSelect = (x: number, y: number) => {
    setCurrentEvent(prev => ({
      ...prev,
      position: { x, y }
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentEvent.player.trim()) {
      alert('Por favor ingresa el nombre del jugador');
      return;
    }

    addEvent({
      minute: currentEvent.minute,
      team: currentEvent.team,
      player: currentEvent.player,
      type: currentEvent.type,
      position: currentEvent.position,
      bodyPart: currentEvent.bodyPart,
      situation: currentEvent.situation,
      assisted: currentEvent.assisted,
      assistType: currentEvent.assistType,
      result: currentEvent.result
    });

    // Resetear formulario (mantener minuto y equipo)
    setCurrentEvent(prev => ({
      ...prev,
      player: '',
      type: 'shot',
      position: { x: 50, y: 50 },
      bodyPart: 'foot',
      situation: 'open_play',
      assisted: false,
      assistType: 'none',
      result: 'miss'
    }));
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">📝 Registrar Evento</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Minuto y Equipo */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Minuto
            </label>
            <input
              type="number"
              min="1"
              max="120"
              value={currentEvent.minute}
              onChange={(e) => {
                setCurrentEvent(prev => ({ ...prev, minute: parseInt(e.target.value) || 1 }));
                updateMinute(parseInt(e.target.value) || 1);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Equipo
            </label>
            <select
              value={currentEvent.team}
              onChange={(e) => setCurrentEvent(prev => ({ ...prev, team: e.target.value as TeamSide }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="home">{match.homeTeam.name}</option>
              <option value="away">{match.awayTeam.name}</option>
            </select>
          </div>
        </div>

        {/* Jugador */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Jugador
          </label>
          <input
            type="text"
            value={currentEvent.player}
            onChange={(e) => setCurrentEvent(prev => ({ ...prev, player: e.target.value }))}
            placeholder="Nombre del jugador"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Tipo de Evento y Resultado */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de Evento
            </label>
            <select
              value={currentEvent.type}
              onChange={(e) => setCurrentEvent(prev => ({ ...prev, type: e.target.value as any }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="shot">Tiro</option>
              <option value="goal">Gol</option>
              <option value="miss">Tiro fallado</option>
              <option value="chance">Oportunidad clara</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Resultado
            </label>
            <select
              value={currentEvent.result}
              onChange={(e) => setCurrentEvent(prev => ({ ...prev, result: e.target.value as any }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="miss">Fallado</option>
              <option value="saved">Atajado</option>
              <option value="blocked">Bloqueado</option>
              <option value="goal">Gol</option>
            </select>
          </div>
        </div>

        {/* Posición en el Campo */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Posición del Tiro
          </label>
          <div className="bg-green-100 border-2 border-green-300 rounded-lg p-4 relative h-64">
            {/* Campo de fútbol simplificado */}
            <div className="absolute inset-4 bg-green-500 border-2 border-white rounded-lg">
              
              {/* Área pequeña */}
              <div className="absolute bottom-0 left-1/4 w-1/2 h-8 border-2 border-white"></div>
              
              {/* Área grande */}
              <div className="absolute bottom-0 left-1/6 w-2/3 h-16 border-2 border-white"></div>
              
              {/* Punto de penalti */}
              <div className="absolute bottom-8 left-1/2 w-2 h-2 bg-white rounded-full transform -translate-x-1/2"></div>
              
              {/* Punto central */}
              <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-white rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>
              
              {/* Punto de posición actual */}
              <div 
                className="absolute w-4 h-4 bg-red-500 rounded-full border-2 border-white transform -translate-x-2 -translate-y-2 cursor-pointer"
                style={{
                  left: `${currentEvent.position.x}%`,
                  top: `${currentEvent.position.y}%`
                }}
                onClick={(e) => {
                  const rect = e.currentTarget.parentElement?.getBoundingClientRect();
                  if (rect) {
                    const x = ((e.clientX - rect.left) / rect.width) * 100;
                    const y = ((e.clientY - rect.top) / rect.height) * 100;
                    handlePositionSelect(Math.max(0, Math.min(100, x)), Math.max(0, Math.min(100, y)));
                  }
                }}
              ></div>
            </div>
            
            {/* Coordenadas */}
            <div className="absolute bottom-2 left-2 text-xs text-white bg-black bg-opacity-50 px-2 py-1 rounded">
              X: {currentEvent.position.x.toFixed(0)}% | Y: {currentEvent.position.y.toFixed(0)}%
            </div>
          </div>
        </div>

        {/* Características del Tiro */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Parte del Cuerpo
            </label>
            <select
              value={currentEvent.bodyPart}
              onChange={(e) => setCurrentEvent(prev => ({ ...prev, bodyPart: e.target.value as BodyPart }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="foot">Pie</option>
              <option value="head">Cabeza</option>
              <option value="other">Otro</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Situación
            </label>
            <select
              value={currentEvent.situation}
              onChange={(e) => setCurrentEvent(prev => ({ ...prev, situation: e.target.value as GameSituation }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="open_play">Jugada</option>
              <option value="counter_attack">Contraataque</option>
              <option value="set_piece">Balón parado</option>
              <option value="penalty">Penalti</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Asistencia
            </label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={currentEvent.assisted}
                  onChange={(e) => setCurrentEvent(prev => ({ 
                    ...prev, 
                    assisted: e.target.checked,
                    assistType: e.target.checked ? 'normal' : 'none'
                  }))}
                  className="mr-2"
                />
                <span className="text-sm">Con asistencia</span>
              </label>
              
              {currentEvent.assisted && (
                <select
                  value={currentEvent.assistType}
                  onChange={(e) => setCurrentEvent(prev => ({ ...prev, assistType: e.target.value as AssistType }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  <option value="normal">Pase normal</option>
                  <option value="through_ball">Pase filtrado</option>
                  <option value="cross">Centro</option>
                </select>
              )}
            </div>
          </div>
        </div>

        {/* Botón de Envío */}
        <div className="flex justify-end pt-4">
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            📊 Registrar Evento
          </button>
        </div>
      </form>
    </div>
  );
};