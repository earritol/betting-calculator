-- =============================================
-- Schema para betting-calculator
-- Almacena datos scrapeados de APWin + cuotas
-- =============================================

-- Ligas
CREATE TABLE IF NOT EXISTS leagues (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  country TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE, -- ej: "suecia/allsvenskan"
  source_url TEXT, -- URL base en APWin
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Equipos
CREATE TABLE IF NOT EXISTS teams (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE, -- ej: "bk-hacken"
  league_id UUID REFERENCES leagues(id),
  logo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Partidos (fixture scrapeado)
CREATE TABLE IF NOT EXISTS matches (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  home_team_id UUID REFERENCES teams(id),
  away_team_id UUID REFERENCES teams(id),
  league_id UUID REFERENCES leagues(id),
  match_date TIMESTAMPTZ,
  source_url TEXT NOT NULL UNIQUE, -- URL del partido en APWin
  source_id TEXT, -- ID interno de APWin (ej: "bwnPVG")
  status TEXT DEFAULT 'upcoming', -- upcoming, live, finished
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Estadísticas de equipo por partido (datos scrapeados)
CREATE TABLE IF NOT EXISTS match_team_stats (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
  team_id UUID REFERENCES teams(id),
  side TEXT NOT NULL CHECK (side IN ('home', 'away')),
  -- Goles
  goals_scored_avg NUMERIC(4,2), -- General
  goals_conceded_avg NUMERIC(4,2),
  goals_scored_home NUMERIC(4,2), -- Como local
  goals_conceded_home NUMERIC(4,2),
  goals_scored_away NUMERIC(4,2), -- Como visitante
  goals_conceded_away NUMERIC(4,2),
  -- xG
  xg NUMERIC(4,2), -- General
  xga NUMERIC(4,2),
  xg_home NUMERIC(4,2),
  xga_home NUMERIC(4,2),
  xg_away NUMERIC(4,2),
  xga_away NUMERIC(4,2),
  -- Otros
  btts_pct INTEGER, -- % ambos marcan
  over25_pct INTEGER, -- % over 2.5
  clean_sheet_pct INTEGER,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(match_id, side)
);

-- Cuotas del partido
CREATE TABLE IF NOT EXISTS match_odds (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
  bookmaker TEXT NOT NULL CHECK (bookmaker IN ('bet365', '1xbet')),
  home_odd NUMERIC(5,2),
  draw_odd NUMERIC(5,2),
  away_odd NUMERIC(5,2),
  scraped_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(match_id, bookmaker)
);

-- Promedios de liga (para cálculo de fuerzas)
CREATE TABLE IF NOT EXISTS league_averages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  league_id UUID REFERENCES leagues(id) ON DELETE CASCADE UNIQUE,
  avg_goals_per_match NUMERIC(4,2),
  avg_goals_for NUMERIC(4,2),
  avg_goals_against NUMERIC(4,2),
  season TEXT, -- ej: "2025-2026"
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Índices para búsquedas frecuentes
CREATE INDEX idx_matches_league ON matches(league_id);
CREATE INDEX idx_matches_date ON matches(match_date);
CREATE INDEX idx_matches_status ON matches(status);
CREATE INDEX idx_match_team_stats_match ON match_team_stats(match_id);
CREATE INDEX idx_match_odds_match ON match_odds(match_id);

-- RLS (Row Level Security) - acceso público de lectura
ALTER TABLE leagues ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_team_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_odds ENABLE ROW LEVEL SECURITY;
ALTER TABLE league_averages ENABLE ROW LEVEL SECURITY;

-- Políticas: lectura pública, escritura solo con service_role
CREATE POLICY "Public read leagues" ON leagues FOR SELECT USING (true);
CREATE POLICY "Public read teams" ON teams FOR SELECT USING (true);
CREATE POLICY "Public read matches" ON matches FOR SELECT USING (true);
CREATE POLICY "Public read match_team_stats" ON match_team_stats FOR SELECT USING (true);
CREATE POLICY "Public read match_odds" ON match_odds FOR SELECT USING (true);
CREATE POLICY "Public read league_averages" ON league_averages FOR SELECT USING (true);
