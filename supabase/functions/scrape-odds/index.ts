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
async function scrapePinnacleOdds(league: string, homeTeam: string, awayTeam: string): Promise<OddsResult[]> {
  try {
    const leagueMap: Record<string, number> = {
      "england": 1980, // Premier League
      "spain": 2196, // La Liga
      "italy": 2436, // Serie A
      "germany": 1842, // Bundesliga
      "france": 2036, // Ligue 1
      "brazil": 1834, // Serie A Brasil
      "mexico": 2242, // Liga MX
      "netherlands": 1928, // Eredivisie
      "portugal": 2386, // Primeira Liga
      "sweden": 1728, // Allsvenskan
      "champions_league": 2627, // UCL
      "world": 2686, // World Cup
    };

    const leagueId = leagueMap[league];
    if (!leagueId) return [];

    const headers = {
      "Accept": "application/json",
      "X-API-Key": "CmX2KcMrXuFmNg6YFbmTxE0y9CIrOi0R",
      "Referer": "https://www.pinnacle.com/",
    };

    // 1. Get matchups for the league
    const matchupsUrl = `https://guest.api.arcadia.pinnacle.com/0.1/leagues/${leagueId}/matchups`;
    const matchupsResp = await fetch(matchupsUrl, { headers });
    if (!matchupsResp.ok) return [];

    const matchups = await matchupsResp.json();

    // 2. Find the matchup that matches our teams
    const normalise = (s: string) => s.toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]/g, "");
    const homeNorm = normalise(homeTeam).substring(0, 5);
    const awayNorm = normalise(awayTeam).substring(0, 5);

    const matchup = matchups.find((m: any) => {
      if (m.type !== "matchup" || !m.participants) return false;
      const names = m.participants.map((p: any) => normalise(p.name));
      const homeMatch = names.some((n: string) => n.includes(homeNorm) || homeNorm.includes(n.substring(0, 5)));
      const awayMatch = names.some((n: string) => n.includes(awayNorm) || awayNorm.includes(n.substring(0, 5)));
      return homeMatch && awayMatch;
    });

    if (!matchup) {
      // If exact match not found, try all matchups and return all odds
      const results: OddsResult[] = [];
      for (const m of matchups.filter((x: any) => x.type === "matchup").slice(0, 5)) {
        const odds = await getPinnacleMatchOdds(m.id, headers);
        if (odds) {
          const participants = m.participants || [];
          const homeName = participants.find((p: any) => p.alignment === "home")?.name || "?";
          const awayName = participants.find((p: any) => p.alignment === "away")?.name || "?";
          results.push({ ...odds, source: `${homeName} vs ${awayName}` });
        }
      }
      return results;
    }

    // 3. Get odds for this specific matchup
    const odds = await getPinnacleMatchOdds(matchup.id, headers);
    if (odds) return [odds];

    return [];
  } catch (error) {
    console.error("Pinnacle scrape error:", error);
    return [];
  }
}

// Convert American odds to decimal
function americanToDecimal(american: number): number {
  if (american > 0) return 1 + (american / 100);
  return 1 + (100 / Math.abs(american));
}

// Get odds for a specific Pinnacle matchup
async function getPinnacleMatchOdds(matchupId: number, headers: Record<string, string>): Promise<OddsResult | null> {
  try {
    const url = `https://guest.api.arcadia.pinnacle.com/0.1/matchups/${matchupId}/markets/related/straight`;
    const response = await fetch(url, { headers });
    if (!response.ok) return null;

    const markets = await response.json();
    const moneyline = markets.find((m: any) => m.type === "moneyline" && m.period === 0);
    if (!moneyline || !moneyline.prices) return null;

    const homePrice = moneyline.prices.find((p: any) => p.designation === "home");
    const drawPrice = moneyline.prices.find((p: any) => p.designation === "draw");
    const awayPrice = moneyline.prices.find((p: any) => p.designation === "away");

    if (!homePrice || !drawPrice || !awayPrice) return null;

    return {
      bookmaker: "pinnacle",
      home: parseFloat(americanToDecimal(homePrice.price).toFixed(2)),
      draw: parseFloat(americanToDecimal(drawPrice.price).toFixed(2)),
      away: parseFloat(americanToDecimal(awayPrice.price).toFixed(2)),
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
    const { homeTeam, awayTeam, league, apwinUrl } = await req.json();

    const results: OddsResult[] = [];

    // 1. Pinnacle
    if (league) {
      const pinnacleAll = await scrapePinnacleOdds(league, homeTeam || '', awayTeam || '');
      if (pinnacleAll.length > 0) {
        results.push(...pinnacleAll);
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
