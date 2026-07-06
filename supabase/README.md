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
Scrapea datos de un partido desde APWin (xG, xGA, goles, etc.).

**Request:**
```bash
curl -X POST https://TU_PROYECTO.supabase.co/functions/v1/scrape-match \
  -H "Authorization: Bearer TU_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://www.apwin.com/es/partido/orgryte-hacken/bwnPVG/"}'
```

### Edge Function: scrape-odds
Obtiene cuotas de Pinnacle, 1xBet y Bet365.

**Request:**
```bash
curl -X POST https://TU_PROYECTO.supabase.co/functions/v1/scrape-odds \
  -H "Authorization: Bearer TU_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "homeTeam": "Arsenal",
    "awayTeam": "Chelsea",
    "league": "england",
    "apwinUrl": "https://www.apwin.com/es/partido/arsenal-chelsea/xxxxx/"
  }'
```

**Response:**
```json
{
  "success": true,
  "odds": [
    { "bookmaker": "pinnacle", "home": 1.85, "draw": 3.70, "away": 4.20, "source": "pinnacle_matchup_123" },
    { "bookmaker": "1xbet", "home": 1.90, "draw": 3.60, "away": 4.10, "source": "apwin" }
  ],
  "available": { "pinnacle": true, "1xbet": true, "bet365": false }
}
```

**Fuentes de cuotas:**
| Bookmaker | Fuente | Método |
|-----------|--------|--------|
| Pinnacle | guest.api.arcadia.pinnacle.com | API interna (JSON, sin auth) |
| 1xBet | APWin | Scraping HTML |
| Bet365 | Manual (futuro: OddsPortal) | Pendiente |

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
| Pinnacle | Cuotas 1X2 (sharp) | Guest API interna (JSON) |
| Bet365 | Cuotas 1X2 | Manual / futuro scraping |
| football-data.org | GF, GA, fixtures, standings | API REST (free tier) |
