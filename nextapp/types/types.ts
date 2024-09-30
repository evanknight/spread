export interface Team {
  id: number;
  name: string;
}

export interface Game {
  id: number;
  commence_time: string;
  home_team: Team;
  away_team: Team;
  home_spread: number;
  away_spread: number;
  week: number | null;
}

export interface User {
  id: string;
  name: string;
  total_points: number;
}

export interface Pick {
  id: number;
  user_id: string;
  game_id: number;
  team_picked: number;
  week: number;
}
