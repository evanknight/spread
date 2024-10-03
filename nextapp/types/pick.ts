export interface Pick {
  id: number;
  user_id: string;
  game_id: string;
  team_picked: number;
  week: number;
  did_win?: boolean;
  points_earned?: number;
}
