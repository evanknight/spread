export interface Game {
  id: number; // BIGINT in Postgres is represented as number in TypeScript
  sport_key: string;
  commence_time: string;
  home_team_id: number;
  away_team_id: number;
  home_spread: number;
  away_spread: number;
  week: number;
  odds_api_id: string;
  completed: boolean;
  home_score: number | null;
  away_score: number | null;
  processed: boolean;
  home_team?: Team;
  away_team?: Team;
}

export interface Team {
  id: number;
  name: string;
  logo_name?: string;
}
