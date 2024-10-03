export interface Pick {
  id: number;
  user_id: string;
  game_id: number; // Change this from string to number
  team_picked: number;
  week: number;
  did_win?: boolean;
  points_earned?: number;
}
