import type { MatchEvent, FieldPosition, BodyPart, GameSituation, AssistType, xGProbabilities } from '../types/xg-types';

export class xGCalculator {
    // Calcular xG basado en múltiples factores (como tu Google Sheets)
    static calculatexG(event: MatchEvent): number {
        const { position, bodyPart, situation, assisted, assistType } = event;

        // Factor de distancia (basado en posición)
        const distanceFactor = this.calculateDistanceFactor(position);

        // Factor de ángulo
        const angleFactor = this.calculateAngleFactor(position);

        // Factor de parte del cuerpo
        const bodyPartFactor = this.calculateBodyPartFactor(bodyPart);

        // Factor de situación de juego
        const situationFactor = this.calculateSituationFactor(situation);

        // Factor de asistencia
        const assistFactor = this.calculateAssistFactor(assisted, assistType);

        // xG base combinando todos los factores
        let xG = distanceFactor * angleFactor * bodyPartFactor * situationFactor * assistFactor;

        // Ajustar límites (0.01 - 0.99)
        xG = Math.max(0.01, Math.min(0.99, xG));

        // ✅ Asegurar que siempre retorne número
        return Number(xG.toFixed(3));
    }

    private static calculateDistanceFactor(position: FieldPosition): number {
        // Distancia al centro del arco (simplificado)
        const goalCenter = { x: 100, y: 50 };
        const distance = Math.sqrt(
            Math.pow(position.x - goalCenter.x, 2) +
            Math.pow(position.y - goalCenter.y, 2)
        );

        // xG disminuye con la distancia (valores de ejemplo)
        if (distance <= 10) return 0.8;    // Área pequeña
        if (distance <= 20) return 0.4;    // Área grande
        if (distance <= 30) return 0.15;   // Fuera del área
        if (distance <= 40) return 0.05;   // Media distancia
        return 0.01;                       // Larga distancia
    }

    private static calculateAngleFactor(position: FieldPosition): number {
        // Ángulo respecto al centro del arco
        const goalCenter = { x: 100, y: 50 };
        const angle = Math.atan2(
            Math.abs(position.y - goalCenter.y),
            goalCenter.x - position.x
        ) * (180 / Math.PI);

        // xG disminuye con ángulos más cerrados
        if (angle <= 15) return 1.0;    // Centro del arco
        if (angle <= 30) return 0.8;    // Buen ángulo
        if (angle <= 45) return 0.6;    // Ángulo medio
        if (angle <= 60) return 0.4;    // Ángulo difícil
        return 0.2;                     // Ángulo muy difícil
    }

    private static calculateBodyPartFactor(bodyPart: BodyPart): number {
        const factors = {
            'foot': 1.0,
            'head': 0.7,    // Remates de cabeza menos probables
            'other': 0.5    // Otras partes del cuerpo
        };
        return factors[bodyPart];
    }

    private static calculateSituationFactor(situation: GameSituation): number {
        const factors = {
            'penalty': 0.76,      // xG típico de penalti
            'counter_attack': 1.2, // Mayor probabilidad en contraataques
            'set_piece': 1.1,     // Tiros de falta/córner
            'open_play': 1.0      // Jugada normal
        };
        return factors[situation];
    }

    private static calculateAssistFactor(assisted: boolean, assistType?: AssistType): number {
        if (!assisted) return 1.0;

        const factors = {
            'through_ball': 1.3,  // Pase filtrado aumenta xG
            'cross': 1.2,         // Centro al área
            'normal': 1.1,        // Pase normal
            'none': 1.0
        };
        return factors[assistType || 'none'];
    }

    // Calcular probabilidades usando Poisson (como en tu Sheets)
    static calculateProbabilities(homexG: number, awayxG: number): xGProbabilities {
        // Ajustar por ventaja de local (como en tu Sheets: +5%/-5%)
        const adjustedHomexG = homexG * 1.05;
        const adjustedAwayxG = awayxG * 0.95;

        // Usar distribución de Poisson para calcular probabilidades
        const homeWinProb = this.poissonProbability(adjustedHomexG, adjustedAwayxG, 'home');
        const drawProb = this.poissonProbability(adjustedHomexG, adjustedAwayxG, 'draw');
        const awayWinProb = this.poissonProbability(adjustedHomexG, adjustedAwayxG, 'away');

        // Calcular resultado más probable
        const homeGoals = Math.round(adjustedHomexG * 10) / 10;
        const awayGoals = Math.round(adjustedAwayxG * 10) / 10;

        return {
            home: homeWinProb,
            draw: drawProb,
            away: awayWinProb,
            homeGoals,
            awayGoals
        };
    }

    private static poissonProbability(lambdaHome: number, lambdaAway: number, outcome: 'home' | 'draw' | 'away'): number {
        // Implementación simplificada de Poisson
        // En una versión completa, usaríamos más términos como en tu Sheets

        const poisson = (k: number, lambda: number): number => {
            return (Math.exp(-lambda) * Math.pow(lambda, k)) / this.factorial(k);
        };

        if (outcome === 'home') {
            // Probabilidad de que home marque más goles que away
            let prob = 0;
            for (let i = 1; i <= 10; i++) {
                for (let j = 0; j < i; j++) {
                    prob += poisson(i, lambdaHome) * poisson(j, lambdaAway);
                }
            }
            return prob;
        } else if (outcome === 'away') {
            // Probabilidad de que away marque más goles que home
            let prob = 0;
            for (let i = 1; i <= 10; i++) {
                for (let j = 0; j < i; j++) {
                    prob += poisson(i, lambdaAway) * poisson(j, lambdaHome);
                }
            }
            return prob;
        } else {
            // Empate
            let prob = 0;
            for (let i = 0; i <= 10; i++) {
                prob += poisson(i, lambdaHome) * poisson(i, lambdaAway);
            }
            return prob;
        }
    }

    private static factorial(n: number): number {
        if (n === 0 || n === 1) return 1;
        let result = 1;
        for (let i = 2; i <= n; i++) {
            result *= i;
        }
        return result;
    }
}