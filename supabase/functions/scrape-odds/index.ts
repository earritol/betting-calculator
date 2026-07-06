// Edge Function: scrape-odds
// Obtiene cuotas de Pinnacle (API interna), 1xBet (APWin), y Bet365 (OddsPortal)
// Uso: POST /scrape-odds { "homeTeam": "Arsenal", "awayTeam": "Chelsea", "league": "england" }

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface OddsResult {
  bookmaker: string;
  home: number;
  draw: number;
  away: number;
  source: string;
}

// ========================================
// PINNACLE - Guest API (no auth required)
// ========================================
async function scrapePinnacleOdds(league: string): Promise<OddsResult[]> {
  try {
    // Pinnacle expone su línea en un endpoint guest para soccer
    // Sport ID 29 = Soccer
    const leagueMap: Record<string, number> = {
      "england": 1980, // Premier League
      "spain": 2196, // La Liga
      "italy": 2436, // Serie A
      "germany": 1842, // Bundesliga
      "france": 2036, // Ligue 1
      "brazil": 1617, // Serie A Brasil
      "mexico": 2095, // Liga MX
      "netherlands": 2081, // Eredivisie
      "portugal": 2160, // Primeira Liga
      "sweden": 2221, // Allsvenskan
      "champions_league": 1843, // UCL
    };

    const leagueId = leagueMap[league];
    if (!leagueId) return [];

    // Pinnacle guest matchups endpoint
    const url = `https://guest.api.arcadia.pinnacle.com/0.1/leagues/${leagueId}/matchups`;
    const response = await fetch(url, {
      headers: {
        "Accept": "application/json",
        "X-API-Key": "CmX2KcMrXuFmNg6YFbmTxE0y9CIrOi0R",
        "Referer": "https://www.pinnacle.com/",
      },
    });

    if (!response.ok) return [];

    const matchups = await response.json();
    const results: OddsResult[] = [];

    for (const matchup of matchups) {
      if (matchup.type !== "matchup" || !matchup.prices) continue;

      const homePrice = matchup.prices?.find((p: any) => p.designation === "home" && p.period === 0);
      const drawPrice = matchup.prices?.find((p: any) => p.designation === "draw" && p.period === 0);
      const awayPrice = matchup.prices?.find((p: any) => p.designation === "away" && p.period === 0);

      if (homePrice && drawPrice && awayPrice) {
        results.push({
          bookmaker: "pinnacle",
          home: homePrice.price,
          draw: drawPrice.price,
          away: awayPrice.price,
          source: `matchup_${matchup.id}`,
        });
      }
    }

    return results;
  } catch (error) {
    console.error("Pinnacle scrape error:", error);
    return [];
  }
}

// Intento alternativo: Pinnacle straight odds endpoint
async function scrapePinnacleMatchOdds(matchupId: number): Promise<OddsResult | null> {
  try {
    const url = `https://guest.api.arcadia.pinnacle.com/0.1/matchups/${matchupId}/markets/related/straight`;
    const response = await fetch(url, {
      headers: {
        "Accept": "application/json",
        "X-API-Key": "CmX2KcMrXuFmNg6YFbmTxE0y9CIrOi0R",
        "Referer": "https://www.pinnacle.com/",
      },
    });

    if (!response.ok) return null;

    const data = await response.json();
    // Parse 1X2 market (period 0 = full match)
    const market = data.find((m: any) => m.type === "moneyline" && m.period === 0);
    if (!market || !market.prices) return null;

    const home = market.prices.find((p: any) => p.designation === "home");
    const draw = market.prices.find((p: any) => p.designation === "draw");
    const away = market.prices.find((p: any) => p.designation === "away");

    if (!home || !draw || !away) return null;

    return {
      bookmaker: "pinnacle",
      home: home.price,
      draw: draw.price,
      away: away.price,
      source: `pinnacle_matchup_${matchupId}`,
    };
  } catch {
    return null;
  }
}

// ========================================
// 1xBET - Via APWin (already parsed in scrape-match)
// ========================================
async function scrape1xbetFromApwin(apwinUrl: string): Promise<OddsResult | null> {
  try {
    const response = await fetch(apwinUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        "Accept-Language": "es-ES,es;q=0.9",
      },
    });

    if (!response.ok) return null;

    const html = await response.text();

    // Buscar cuotas de 1xBet en el HTML
    // Formato típico: "1xbet logo 6.00 Local ... 4.71 Empate ... 1.53 Visitante"
    const oddsRegex = /(\d+\.\d+)\s*Local.*?(\d+\.\d+)\s*Empate.*?(\d+\.\d+)\s*Visitante/s;
    const match = html.match(oddsRegex);

    if (!match) return null;

    return {
      bookmaker: "1xbet",
      home: parseFloat(match[1]),
      draw: parseFloat(match[2]),
      away: parseFloat(match[3]),
      source: apwinUrl,
    };
  } catch {
    return null;
  }
}

// ========================================
// BET365 - Via football-data.co.uk CSV (historical closing odds)
// O via scraping de comparadores
// ========================================
async function scrapeBet365Fallback(homeTeam: string, awayTeam: string): Promise<OddsResult | null> {
  // Bet365 es extremadamente difícil de scrapear directamente
  // Opciones de fallback:
  // 1. Usar datos de football-data.co.uk (CSVs con odds de Bet365)
  // 2. Scraping de comparadores como oddspedia/oddsportal
  // Por ahora retornamos null y el usuario puede ingresar manualmente
  console.log(`Bet365 odds for ${homeTeam} vs ${awayTeam}: no automated source available yet`);
  return null;
}

// ========================================
// HANDLER PRINCIPAL
// ========================================
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { homeTeam, awayTeam, league, apwinUrl, pinnacleMatchupId } = await req.json();

    const results: OddsResult[] = [];

    // 1. Pinnacle
    if (pinnacleMatchupId) {
      const pinnacle = await scrapePinnacleMatchOdds(pinnacleMatchupId);
      if (pinnacle) results.push(pinnacle);
    } else if (league) {
      const pinnacleAll = await scrapePinnacleOdds(league);
      // Intentar matchear por nombre de equipo
      const matched = pinnacleAll.find(r => 
        r.source.includes(homeTeam?.toLowerCase()) || 
        r.source.includes(awayTeam?.toLowerCase())
      );
      if (matched) results.push(matched);
      // Si no matchea, devolver todas de esa liga para que el frontend elija
      if (!matched && pinnacleAll.length > 0) {
        results.push(...pinnacleAll.slice(0, 10)); // Primeras 10
      }
    }

    // 2. 1xBet (via APWin)
    if (apwinUrl) {
      const oneXbet = await scrape1xbetFromApwin(apwinUrl);
      if (oneXbet) results.push(oneXbet);
    }

    // 3. Bet365 (fallback)
    if (homeTeam && awayTeam) {
      const bet365 = await scrapeBet365Fallback(homeTeam, awayTeam);
      if (bet365) results.push(bet365);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        odds: results,
        available: {
          pinnacle: results.some(r => r.bookmaker === "pinnacle"),
          "1xbet": results.some(r => r.bookmaker === "1xbet"),
          bet365: results.some(r => r.bookmaker === "bet365"),
        }
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
