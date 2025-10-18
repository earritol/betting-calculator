import { useState, useCallback } from 'react';
import type { LiveMatch, MatchEvent, xGProbabilities } from '../types/xg-types';
import { xGCalculator } from '../utils/xg-calculator';

const initialMatch: LiveMatch = {
  homeTeam: {
    name: 'Equipo Local',
    xG: 0,
    shots: 0,
    shotsOnTarget: 0,
    goals: 0
  },
  awayTeam: {
    name: 'Equipo Visitante',
    xG: 0,
    shots: 0,
    shotsOnTarget: 0,
    goals: 0
  },
  events: [],
  currentMinute: 0,
  status: 'not_started'
};

export const useLiveMatch = () => {
  const [match, setMatch] = useState<LiveMatch>(initialMatch);
  const [probabilities, setProbabilities] = useState<xGProbabilities | null>(null);

  // Agregar evento al partido
  const addEvent = useCallback((event: Omit<MatchEvent, 'id' | 'xG'>) => {
    const newEvent: MatchEvent = {
      ...event,
      id: Date.now().toString(),
      xG: xGCalculator.calculatexG(event as MatchEvent)
    };

    setMatch(prev => {
      const newEvents = [...prev.events, newEvent];
      
      // Actualizar estadísticas del equipo
      const teamKey = event.team === 'home' ? 'homeTeam' : 'awayTeam';
      const updatedTeam = {
        ...prev[teamKey],
        xG: prev[teamKey].xG + newEvent.xG,
        shots: prev[teamKey].shots + 1,
        shotsOnTarget: prev[teamKey].shotsOnTarget + (event.type === 'goal' || event.result === 'saved' ? 1 : 0),
        goals: prev[teamKey].goals + (event.type === 'goal' ? 1 : 0)
      };

      const updatedMatch = {
        ...prev,
        events: newEvents,
        [teamKey]: updatedTeam,
        status: 'live' as const
      };

      // Recalcular probabilidades
      const newProbabilities = xGCalculator.calculateProbabilities(
        updatedMatch.homeTeam.xG,
        updatedMatch.awayTeam.xG
      );
      setProbabilities(newProbabilities);

      return updatedMatch;
    });
  }, []);

  // Iniciar partido
  const startMatch = useCallback((homeTeam: string, awayTeam: string) => {
    setMatch({
      ...initialMatch,
      homeTeam: { ...initialMatch.homeTeam, name: homeTeam },
      awayTeam: { ...initialMatch.awayTeam, name: awayTeam },
      status: 'live',
      currentMinute: 1
    });
    setProbabilities(xGCalculator.calculateProbabilities(0, 0));
  }, []);

  // Actualizar minuto actual
  const updateMinute = useCallback((minute: number) => {
    setMatch(prev => ({ ...prev, currentMinute: minute }));
  }, []);

  // Finalizar partido
  const finishMatch = useCallback(() => {
    setMatch(prev => ({ ...prev, status: 'finished' }));
  }, []);

  return {
    match,
    probabilities,
    addEvent,
    startMatch,
    updateMinute,
    finishMatch
  };
};