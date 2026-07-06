// Edge Function: scrape-live
// Obtiene estadísticas en vivo de partidos desde ESPN API (gratis, sin auth)
// Uso: 
//   GET  /scrape-live?league=mex.1  → lista partidos en vivo/hoy
//   POST /scrape-live { "league": "mex.1", "eventId": "12345" } → stats de un partido específico

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Mapeo de ligas a códigos ESPN
const LEAGUE_MAP: Record<string, { code: string; name: string }> = {
  "england": { code: "eng.1", name: "Premier League" },
  "spain": { code: "esp.1", name: "La Liga" },
  "italy": { code: "ita.1", name: "Serie A" },
  "germany": { code: "ger.1", name: "Bundesliga" },
  "france": { code: "fra.1", name: "Ligue 1" },
  "mexico": { code: "mex.1", name: "Liga MX" },
  "brazil": { code: "bra.1", name: "Serie A Brasil" },
  "usa": { code: "usa.1", name: "MLS" },
  "netherlands": { code: "ned.1", name: "Eredivisie" },
  "portugal": { code: "por.1", name: "Primeira Liga" },
  "sweden": { code: "swe.1", name: "Allsvenskan" },
  "world_cup": { code: "fifa.world", name: "World Cup" },
  "champions_league": { code: "uefa.champions", name: "Champions League" },
  "europa_league": { code: "uefa.europa", name: "Europa League" },
  "argentina": { code: "arg.1", name: "Liga Profesional" },
  "colombia": { code: "col.1", name: "Liga BetPlay" },
};

interface MatchEvent {
  id: string;
  name: string;
  status: string; // pre, in, post
  statusDetail: string; // "1st Half", "2nd Half", "Halftime", "Full Time", etc.
  minute: number;
  homeTeam: {
    name: string;
    logo: string;
    score: number;
  };
  awayTeam: {
    name: string;
    logo: string;
    score: number;
  };
  stats: {
    home: TeamLiveStats;
    away: TeamLiveStats;
  } | null;
}

interface TeamLiveStats {
  goals: number;
  totalShots: number;
  shotsOnTarget: number;
  corners: number;
  possession: number;
  fouls: number;
  // Estimados
  dangerousAttacks: number; // estimado desde tiros
  xG: number; // estimado desde tiros a puerta
}

function estimateXG(shotsOnTarget: number, totalShots: number, corners: number): number {
  // Estimación simplificada de xG
  const shotsOff = totalShots - shotsOnTarget;
  const xg = (shotsOnTarget * 0.12) + (shotsOff * 0.03) + (corners * 0.035);
  return parseFloat(xg.toFixed(2));
}

function estimateDangerousAttacks(totalShots: number, corners: number, possession: number): number {
  // Estimación: ataques peligrosos correlaciona con tiros + corners + posesión
  return Math.round(totalShots * 1.5 + corners * 2 + possession * 0.3);
}

function parseESPNEvent(event: any): MatchEvent {
  const competition = event.competitions?.[0];
  const homeComp = competition?.competitors?.find((c: any) => c.homeAway === "home");
  const awayComp = competition?.competitors?.find((c: any) => c.homeAway === "away");

  // Parse stats
  const parseStats = (comp: any): TeamLiveStats => {
    const getStatValue = (name: string): number => {
      const stat = comp?.statistics?.find((s: any) => s.name === name);
      return stat ? parseFloat(stat.displayValue) || 0 : 0;
    };

    const goals = parseInt(comp?.score) || 0;
    const totalShots = getStatValue("totalShots");
    const shotsOnTarget = getStatValue("shotsOnTarget");
    const corners = getStatValue("wonCorners");
    const possession = getStatValue("possessionPct");
    const fouls = getStatValue("foulsCommitted");

    return {
      goals,
      totalShots,
      shotsOnTarget,
      corners,
      possession,
      fouls,
      dangerousAttacks: estimateDangerousAttacks(totalShots, corners, possession),
      xG: estimateXG(shotsOnTarget, totalShots, corners),
    };
  };

  // Determine minute
  let minute = 0;
  const clock = event.status?.displayClock;
  if (clock) {
    const parts = clock.split(":");
    minute = parseInt(parts[0]) || 0;
  }

  const hasStats = homeComp?.statistics?.length > 0;

  return {
    id: event.id,
    name: event.name,
    status: event.status?.type?.state || "pre", // pre, in, post
    statusDetail: event.status?.type?.detail || "",
    minute,
    homeTeam: {
      name: homeComp?.team?.displayName || homeComp?.team?.name || "Home",
      logo: homeComp?.team?.logo || "",
      score: parseInt(homeComp?.score) || 0,
    },
    awayTeam: {
      name: awayComp?.team?.displayName || awayComp?.team?.name || "Away",
      logo: awayComp?.team?.logo || "",
      score: parseInt(awayComp?.score) || 0,
    },
    stats: hasStats ? {
      home: parseStats(homeComp),
      away: parseStats(awayComp),
    } : null,
  };
}

async function getMatches(leagueCode: string): Promise<MatchEvent[]> {
  const url = `https://site.api.espn.com/apis/site/v2/sports/soccer/${leagueCode}/scoreboard`;
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`ESPN API error: ${response.status}`);
  }

  const data = await response.json();
  const events = data.events || [];

  return events.map(parseESPNEvent);
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    let league = "";

    if (req.method === "GET") {
      const url = new URL(req.url);
      league = url.searchParams.get("league") || "world_cup";
    } else {
      const body = await req.json();
      league = body.league || "world_cup";
    }

    // Resolve league code
    const leagueInfo = LEAGUE_MAP[league];
    if (!leagueInfo) {
      return new Response(
        JSON.stringify({ 
          error: `Liga no encontrada: ${league}`, 
          available: Object.entries(LEAGUE_MAP).map(([key, val]) => ({ key, name: val.name }))
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const matches = await getMatches(leagueInfo.code);

    return new Response(
      JSON.stringify({
        success: true,
        league: leagueInfo.name,
        leagueCode: leagueInfo.code,
        matches,
        liveCount: matches.filter(m => m.status === "in").length,
        totalCount: matches.length,
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
