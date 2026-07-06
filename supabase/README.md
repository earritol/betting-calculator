# Supabase Backend - Betting Calculator

## Setup

### 1. Crear proyecto en Supabase
1. Ve a [supabase.com](https://supabase.com) y crea un proyecto
2. Copia el `Project URL` y la `anon key` / `service_role key`

### 2. Ejecutar migraciones
En el SQL Editor de Supabase, ejecuta el contenido de:
```
supabase/migrations/001_create_tables.sql
```

### 3. Deploy de Edge Functions

```bash
# Instalar Supabase CLI
npm install -g supabase

# Login
supabase login

# Vincular proyecto
supabase link --project-ref TU_PROJECT_ID

# Deploy de la función
supabase functions deploy scrape-match
```

### 4. Configurar variables de entorno del frontend
Crea un archivo `.env` en la raíz del proyecto:
```
VITE_SUPABASE_URL=https://TU_PROYECTO.supabase.co
VITE_SUPABASE_ANON_KEY=tu_anon_key
```

## Uso

### Edge Function: scrape-match
Scrapea datos de un partido desde APWin.

**Request:**
```bash
curl -X POST https://TU_PROYECTO.supabase.co/functions/v1/scrape-match \
  -H "Authorization: Bearer TU_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://www.apwin.com/es/partido/orgryte-hacken/bwnPVG/"}'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "homeTeam": {
      "name": "Örgryte",
      "goalsScored": 0.91,
      "goalsConceded": 2.55,
      "xG": 1.23,
      "xGA": 1.94,
      "xGHome": 1.39,
      "xGAHome": 1.5
    },
    "awayTeam": {
      "name": "Hacken",
      "goalsScored": 2.0,
      "goalsConceded": 1.4,
      "xG": 1.61,
      "xGA": 1.52,
      "xGHome": 1.57,
      "xGAHome": 1.62
    },
    "odds": {
      "1xbet": { "home": 6.00, "draw": 4.71, "away": 1.53 }
    },
    "league": {
      "avgGoals": 3.18
    }
  }
}
```

## Tablas

| Tabla | Descripción |
|-------|-------------|
| `leagues` | Ligas disponibles |
| `teams` | Equipos |
| `matches` | Partidos (con URL fuente) |
| `match_team_stats` | Stats de cada equipo en un partido (xG, xGA, goles, etc.) |
| `match_odds` | Cuotas por casa de apuestas (bet365, 1xbet) |
| `league_averages` | Promedios de liga por temporada |

## Fuentes de datos

| Fuente | Datos | Método |
|--------|-------|--------|
| APWin | xG, xGA, goles, BTTS, Over/Under, cuotas 1xBet | Scraping HTML |
| Bet365 | Cuotas 1X2 | Scraping (futuro) |
| football-data.org | GF, GA, fixtures, standings | API REST (free tier) |
