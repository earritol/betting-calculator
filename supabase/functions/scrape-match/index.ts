// Edge Function: scrape-match
// Scrapea TODOS los datos de un partido desde APWin
// Una sola URL → xG, xGA, goles, cuotas, promedios de liga
// Uso: POST /scrape-match { "url": "https://www.apwin.com/es/partido/orgryte-hacken/bwnPVG/" }

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface TeamStats {
  name: string;
  // General | Local | Visitante
  goalsScored: number;
  goalsConceded: number;
  goalsScoredHome: number;
  goalsConcededHome: number;
  goalsScoredAway: number;
  goalsConcededAway: number;
  xG: number;
  xGA: number;
  xGHome: number;
  xGAHome: number;
  xGAway: number;
  xGAAway: number;
  bttsPct: number;
  over25Pct: number;
}

interface ScrapedResult {
  homeTeam: TeamStats;
  awayTeam: TeamStats;
  odds: {
    "1xbet": { home: number; draw: number; away: number };
  };
  league: {
    name: string;
    country: string;
    avgGoalsPerMatch: number;
  };
  matchDate: string;
}

function extractTeamStats(section: string): Partial<TeamStats> {
  // Las tablas de APWin tienen formato:
  // | Marcados | 0.91 | 1.4 | 0.5 |  (General | Local | Visitante)
  // | Sufridos | 2.55 | 1.8 | 3.17 |
  // | xG  | 1.23 | 1.39 | 1.09 |
  // | xGA  | 1.94 | 1.5 | 2.3 |

  const getRowValues = (label: string): number[] => {
    // Match pattern: "label | val1 | val2 | val3"
    const regex = new RegExp(`${label}\\s*\\|\\s*([\\d.]+)\\s*\\|\\s*([\\d.]+)\\s*\\|\\s*([\\d.]+)`, 'i');
    const match = section.match(regex);
    if (match) {
      return [parseFloat(match[1]), parseFloat(match[2]), parseFloat(match[3])];
    }
    // Alternativa: buscar en formato sin pipes (texto plano renderizado)
    const regex2 = new RegExp(`${label}[^\\d]*(\\d+\\.?\\d*)\\s+(\\d+\\.?\\d*)\\s+(\\d+\\.?\\d*)`, 'i');
    const match2 = section.match(regex2);
    if (match2) {
      return [parseFloat(match2[1]), parseFloat(match2[2]), parseFloat(match2[3])];
    }
    return [0, 0, 0];
  };

  const marcados = getRowValues('Marcados');
  const sufridos = getRowValues('Sufridos');
  const xgValues = getRowValues('xG\\s');
  const xgaValues = getRowValues('xGA');
  
  // BTTS
  const bttsMatch = section.match(/Ambos Marcan\s*\|?\s*(\d+)%/i);
  const bttsPct = bttsMatch ? parseInt(bttsMatch[1]) : 0;

  // Nombre del equipo
  const nameMatch = section.match(/###\s*(.+?)(?:\n|$)/);
  const name = nameMatch ? nameMatch[1].trim() : '';

  return {
    name,
    goalsScored: marcados[0],
    goalsScoredHome: marcados[1],
    goalsScoredAway: marcados[2],
    goalsConceded: sufridos[0],
    goalsConcededHome: sufridos[1],
    goalsConcededAway: sufridos[2],
    xG: xgValues[0],
    xGHome: xgValues[1],
    xGAway: xgValues[2],
    xGA: xgaValues[0],
    xGAHome: xgaValues[1],
    xGAAway: xgaValues[2],
    bttsPct,
    over25Pct: 0,
  };
}

function parseApwinHtml(html: string): ScrapedResult | null {
  try {
    // === CUOTAS 1xBet ===
    // Formato: "6.00 Local" ... "4.71 Empate" ... "1.53 Visitante"
    const oddsRegex = /(\d+\.\d+)\s*Local.*?(\d+\.\d+)\s*Empate.*?(\d+\.\d+)\s*Visitante/s;
    const oddsMatch = html.match(oddsRegex);
    const odds1xbet = oddsMatch
      ? { home: parseFloat(oddsMatch[1]), draw: parseFloat(oddsMatch[2]), away: parseFloat(oddsMatch[3]) }
      : { home: 0, draw: 0, away: 0 };

    // === PROMEDIO DE GOLES DE LIGA ===
    const leagueAvgMatch = html.match(/Liga:\s*([\d.]+)/);
    const leagueAvg = leagueAvgMatch ? parseFloat(leagueAvgMatch[1]) : 2.5;

    // === NOMBRE DE LIGA ===
    const leagueNameMatch = html.match(/\[([^\]]+)\s+logo\]/i);
    const leagueName = leagueNameMatch ? leagueNameMatch[1].trim() : 'Unknown';
    
    // País desde la URL de liga o del texto
    const countryMatch = html.match(/(\w+)\s*-\s*\w+/);

    // === FECHA ===
    const dateMatch = html.match(/(\w+,\s*\d+\s+\w+\s+\d{4}\s*-?\s*\d{2}:\d{2})/);
    const matchDate = dateMatch ? dateMatch[1] : '';

    // === OVER 2.5 ===
    const over25Match = html.match(/Más de 2\.5\+.*?(\d+)%.*?(\d+)%.*?Promedio.*?(\d+)%/s);

    // === EQUIPOS ===
    // Dividir por "Equipo de Fuera" o "Equipo Visitante"
    let homeSection = '';
    let awaySection = '';

    const splitMarker = html.indexOf('Equipo de Fuera');
    if (splitMarker > -1) {
      const localStart = html.indexOf('Equipo Local');
      homeSection = html.substring(localStart > -1 ? localStart : 0, splitMarker);
      awaySection = html.substring(splitMarker);
    } else {
      // Intentar otro separador
      const parts = html.split(/#{2,3}\s*(?:Equipo|Visitante)/i);
      if (parts.length >= 3) {
        homeSection = parts[1] || '';
        awaySection = parts[2] || '';
      }
    }

    const homeStats = extractTeamStats(homeSection);
    const awayStats = extractTeamStats(awaySection);

    // Over 2.5 por equipo
    const homeOver25 = over25Match ? parseInt(over25Match[1]) : 0;
    const awayOver25 = over25Match ? parseInt(over25Match[3]) : 0;

    return {
      homeTeam: {
        name: homeStats.name || 'Local',
        goalsScored: homeStats.goalsScored || 0,
        goalsConceded: homeStats.goalsConceded || 0,
        goalsScoredHome: homeStats.goalsScoredHome || 0,
        goalsConcededHome: homeStats.goalsConcededHome || 0,
        goalsScoredAway: homeStats.goalsScoredAway || 0,
        goalsConcededAway: homeStats.goalsConcededAway || 0,
        xG: homeStats.xG || 0,
        xGA: homeStats.xGA || 0,
        xGHome: homeStats.xGHome || 0,
        xGAHome: homeStats.xGAHome || 0,
        xGAway: homeStats.xGAway || 0,
        xGAAway: homeStats.xGAAway || 0,
        bttsPct: homeStats.bttsPct || 0,
        over25Pct: homeOver25,
      },
      awayTeam: {
        name: awayStats.name || 'Visitante',
        goalsScored: awayStats.goalsScored || 0,
        goalsConceded: awayStats.goalsConceded || 0,
        goalsScoredHome: awayStats.goalsScoredHome || 0,
        goalsConcededHome: awayStats.goalsConcededHome || 0,
        goalsScoredAway: awayStats.goalsScoredAway || 0,
        goalsConcededAway: awayStats.goalsConcededAway || 0,
        xG: awayStats.xG || 0,
        xGA: awayStats.xGA || 0,
        xGHome: awayStats.xGHome || 0,
        xGAHome: awayStats.xGAHome || 0,
        xGAway: awayStats.xGAway || 0,
        xGAAway: awayStats.xGAAway || 0,
        bttsPct: awayStats.bttsPct || 0,
        over25Pct: awayOver25,
      },
      odds: { "1xbet": odds1xbet },
      league: {
        name: leagueName,
        country: countryMatch ? countryMatch[1] : 'Unknown',
        avgGoalsPerMatch: leagueAvg,
      },
      matchDate,
    };
  } catch (error) {
    console.error("Parse error:", error);
    return null;
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { url } = await req.json();

    if (!url || !url.includes("apwin.com")) {
      return new Response(
        JSON.stringify({ error: "URL de APWin requerida" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch de la página de APWin
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "es-ES,es;q=0.9,en;q=0.8",
      },
    });

    if (!response.ok) {
      return new Response(
        JSON.stringify({ error: `Error fetching APWin: ${response.status}` }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const html = await response.text();
    const data = parseApwinHtml(html);

    if (!data) {
      return new Response(
        JSON.stringify({ error: "No se pudieron parsear los datos. Verifica la URL." }),
        { status: 422, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, data }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
