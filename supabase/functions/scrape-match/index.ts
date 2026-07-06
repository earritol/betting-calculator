// Edge Function: scrape-match
// Scrapea datos de un partido desde APWin
// Uso: POST /scrape-match { "url": "https://www.apwin.com/es/partido/orgryte-hacken/bwnPVG/" }

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ScrapedData {
  homeTeam: {
    name: string;
    slug: string;
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
  };
  awayTeam: {
    name: string;
    slug: string;
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
  };
  odds: {
    "1xbet": { home: number; draw: number; away: number };
  };
  league: {
    name: string;
    country: string;
    avgGoals: number;
  };
  matchDate: string;
}

// Parsea el HTML de APWin y extrae los datos
function parseApwinHtml(html: string): ScrapedData | null {
  try {
    // Extraer cuotas 1xBet (formato: "6.00 Local", "4.71 Empate", "1.53 Visitante")
    const oddsRegex = /1xbet.*?(\d+\.\d+)\s*Local.*?(\d+\.\d+)\s*Empate.*?(\d+\.\d+)\s*Visitante/s;
    const oddsMatch = html.match(oddsRegex);
    const odds1xbet = oddsMatch
      ? { home: parseFloat(oddsMatch[1]), draw: parseFloat(oddsMatch[2]), away: parseFloat(oddsMatch[3]) }
      : { home: 0, draw: 0, away: 0 };

    // Extraer estadísticas de equipo local y visitante
    // La tabla tiene columnas: General | Local | Visitante
    // Filas: Marcados, Sufridos, xG, xGA
    const teamStatsRegex = (teamSection: string) => {
      const marcados = teamSection.match(/Marcados\s*\|\s*([\d.]+)\s*\|\s*([\d.]+)\s*\|\s*([\d.]+)/);
      const sufridos = teamSection.match(/Sufridos\s*\|\s*([\d.]+)\s*\|\s*([\d.]+)\s*\|\s*([\d.]+)/);
      const xgRow = teamSection.match(/xG\s*\|\s*([\d.]+)\s*\|\s*([\d.]+)\s*\|\s*([\d.]+)/);
      const xgaRow = teamSection.match(/xGA\s*\|\s*([\d.]+)\s*\|\s*([\d.]+)\s*\|\s*([\d.]+)/);
      const btts = teamSection.match(/Ambos Marcan\s*\|\s*(\d+)%/);
      const over25Section = html.match(/Más de 2\.5\+.*?(\d+)%/s);

      return {
        goalsScored: marcados ? parseFloat(marcados[1]) : 0,
        goalsScoredHome: marcados ? parseFloat(marcados[2]) : 0,
        goalsScoredAway: marcados ? parseFloat(marcados[3]) : 0,
        goalsConceded: sufridos ? parseFloat(sufridos[1]) : 0,
        goalsConcededHome: sufridos ? parseFloat(sufridos[2]) : 0,
        goalsConcededAway: sufridos ? parseFloat(sufridos[3]) : 0,
        xG: xgRow ? parseFloat(xgRow[1]) : 0,
        xGHome: xgRow ? parseFloat(xgRow[2]) : 0,
        xGAway: xgRow ? parseFloat(xgRow[3]) : 0,
        xGA: xgaRow ? parseFloat(xgaRow[1]) : 0,
        xGAHome: xgaRow ? parseFloat(xgaRow[2]) : 0,
        xGAAway: xgaRow ? parseFloat(xgaRow[3]) : 0,
        bttsPct: btts ? parseInt(btts[1]) : 0,
        over25Pct: over25Section ? parseInt(over25Section[1]) : 0,
      };
    };

    // Dividir el HTML en secciones de equipo local y visitante
    const sections = html.split("Equipo de Fuera");
    if (sections.length < 2) return null;

    const homeSection = sections[0].split("Equipo Local").pop() || "";
    const awaySection = sections[1];

    const homeStats = teamStatsRegex(homeSection);
    const awayStats = teamStatsRegex(awaySection);

    // Extraer nombres de equipo
    const homeNameMatch = homeSection.match(/###\s*(.+?)(?:\n|Suecia|España|México|Brasil|Inglaterra|Francia|Alemania|Italia)/);
    const awayNameMatch = awaySection.match(/###\s*(.+?)(?:\n|Suecia|España|México|Brasil|Inglaterra|Francia|Alemania|Italia)/);

    // Liga y promedio de goles
    const leagueMatch = html.match(/Liga:\s*([\d.]+)/);
    const leagueNameMatch = html.match(/\[(.+?)\s+logo\]/);

    // Fecha del partido
    const dateMatch = html.match(/(\w+,\s*\d+\s+\w+\s+\d{4})/);

    return {
      homeTeam: {
        name: homeNameMatch ? homeNameMatch[1].trim() : "Local",
        slug: "unknown",
        ...homeStats,
      },
      awayTeam: {
        name: awayNameMatch ? awayNameMatch[1].trim() : "Visitante",
        slug: "unknown",
        ...awayStats,
      },
      odds: { "1xbet": odds1xbet },
      league: {
        name: leagueNameMatch ? leagueNameMatch[1] : "Unknown",
        country: "Unknown",
        avgGoals: leagueMatch ? parseFloat(leagueMatch[1]) : 2.5,
      },
      matchDate: dateMatch ? dateMatch[1] : new Date().toISOString(),
    };
  } catch (error) {
    console.error("Parse error:", error);
    return null;
  }
}

serve(async (req) => {
  // Handle CORS preflight
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
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        "Accept": "text/html,application/xhtml+xml",
        "Accept-Language": "es-ES,es;q=0.9",
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
        JSON.stringify({ error: "No se pudieron parsear los datos de APWin" }),
        { status: 422, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Guardar en Supabase (opcional, si se proporciona la conexión)
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (supabaseUrl && supabaseKey) {
      const supabase = createClient(supabaseUrl, supabaseKey);

      // Upsert en la base de datos (cache)
      // Por ahora solo retornamos los datos; el upsert se puede activar después
      console.log("Data scraped successfully, could be cached in DB");
    }

    // Retornar datos al frontend
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
