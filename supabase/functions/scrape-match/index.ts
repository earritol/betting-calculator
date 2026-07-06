// Edge Function: scrape-match
// Scrapea datos de un partido desde APWin (HTML estático)
// Extrae: nombres, goles marcados/sufridos, cuotas (1xBet, Bet365), promedio liga
// xG/xGA requiere browser - se deja manual por ahora
// Uso: POST /scrape-match { "url": "https://www.apwin.com/es/partido/orgryte-hacken/bwnPVG/" }

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface TeamStats {
  name: string;
  goalsScored: number;
  goalsConceded: number;
  goalsScoredHome: number;
  goalsConcededHome: number;
  goalsScoredAway: number;
  goalsConcededAway: number;
}

interface OddsEntry {
  bookmaker: string;
  home: number;
  draw: number;
  away: number;
}

interface ScrapedResult {
  homeTeam: TeamStats;
  awayTeam: TeamStats;
  odds: OddsEntry[];
  league: {
    avgGoalsPerMatch: number;
  };
  matchDate: string;
}

function parseApwinHtml(html: string): ScrapedResult | null {
  try {
    // === NOMBRES desde <title> ===
    const titleMatch = html.match(/<title>\s*Estad[ií]sticas de (.+?) contra (.+?) \|/);
    const homeName = titleMatch ? titleMatch[1].trim() : "Local";
    const awayName = titleMatch ? titleMatch[2].trim() : "Visitante";

    // === GOLES MARCADOS/SUFRIDOS ===
    // Formato HTML: Marcados</td>\n<td>0.91</td>\n<td...>1.4</td>\n<td...>0.5</td>
    const statsRegex = (label: string) => {
      const pattern = new RegExp(
        label + `</td>\\s*<td[^>]*>([\\d.]+)</td>\\s*<td[^>]*>([\\d.]+)\\s*</td>\\s*<td[^>]*>([\\d.]+)</td>`,
        'g'
      );
      const matches = [...html.matchAll(pattern)];
      return matches.map(m => ({
        general: parseFloat(m[1]),
        home: parseFloat(m[2]),
        away: parseFloat(m[3]),
      }));
    };

    const marcados = statsRegex('Marcados');
    const sufridos = statsRegex('Sufridos');

    // Primera ocurrencia = equipo local, segunda = equipo visitante
    const homeStats: TeamStats = {
      name: homeName,
      goalsScored: marcados[0]?.general || 0,
      goalsConceded: sufridos[0]?.general || 0,
      goalsScoredHome: marcados[0]?.home || 0,
      goalsConcededHome: sufridos[0]?.home || 0,
      goalsScoredAway: marcados[0]?.away || 0,
      goalsConcededAway: sufridos[0]?.away || 0,
    };

    const awayStats: TeamStats = {
      name: awayName,
      goalsScored: marcados[1]?.general || 0,
      goalsConceded: sufridos[1]?.general || 0,
      goalsScoredHome: marcados[1]?.home || 0,
      goalsConcededHome: sufridos[1]?.home || 0,
      goalsScoredAway: marcados[1]?.away || 0,
      goalsConcededAway: sufridos[1]?.away || 0,
    };

    // === CUOTAS ===
    // Formato: market_name&quot;:&quot;1&quot;,&quot;odds_number&quot;:6,&quot;bookmaker&quot;:&quot;1xbet&quot;
    const oddsRegex = /market_name&quot;:&quot;([^&]+)&quot;,&quot;odds_number&quot;:([\d.]+),&quot;bookmaker&quot;:&quot;(\w+)&quot;/g;
    const oddsMatches = [...html.matchAll(oddsRegex)];

    // Agrupar por bookmaker
    const oddsMap: Record<string, { home: number; draw: number; away: number }> = {};
    
    for (const m of oddsMatches) {
      const marketName = m[1]; // "1", "2", "X"
      const oddValue = parseFloat(m[2]);
      const bookmaker = m[3];

      if (!oddsMap[bookmaker]) {
        oddsMap[bookmaker] = { home: 0, draw: 0, away: 0 };
      }

      if (marketName === "1") oddsMap[bookmaker].home = oddValue;
      else if (marketName === "2") oddsMap[bookmaker].away = oddValue;
      else if (marketName === "X") oddsMap[bookmaker].draw = oddValue;
    }

    // Solo incluir bookmakers que nos interesan
    const targetBookmakers = ["1xbet", "bet365", "pinnacle", "betsson"];
    const odds: OddsEntry[] = [];
    for (const bk of targetBookmakers) {
      if (oddsMap[bk] && oddsMap[bk].home > 0) {
        odds.push({ bookmaker: bk, ...oddsMap[bk] });
      }
    }

    // === PROMEDIO DE LIGA ===
    const leagueAvgMatch = html.match(/Liga:\s*([\d.]+)/);
    const avgGoals = leagueAvgMatch ? parseFloat(leagueAvgMatch[1]) : 0;

    // === FECHA ===
    const dateMatch = html.match(/(\w{3},\s*\d+\s+\w+\s+\d{4}\s*-\s*\d{2}:\d{2})/);
    const matchDate = dateMatch ? dateMatch[1] : "";

    return {
      homeTeam: homeStats,
      awayTeam: awayStats,
      odds,
      league: { avgGoalsPerMatch: avgGoals },
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
