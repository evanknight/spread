export interface Team {
  id: number;
  name: string;
}

export interface Game {
  id: number;
  sport_key: string;
  commence_time: string;
  home_team_id: number;
  away_team_id: number;
  home_spread: number;
  away_spread: number;
  week: number | null;
  odds_api_id: string;
  home_team?: Team;
  away_team?: Team;
}

export interface User {
  id: string;
  name: string;
  total_points: number;
  points: number; // Add this line
}

export interface Pick {
  id: number;
  user_id: string;
  game_id: number;
  team_picked: number;
  week: number;
}
