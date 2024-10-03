export interface Pick {
  id: number;
  user_id: string; // UUID in Postgres is represented as string in TypeScript
  game_id: number; // This is correct, it's an INTEGER in your DB
  team_picked: number;
  week: number;
  did_win?: boolean;
  points_earned?: number; // Change this to allow for decimal values
  spread_at_time?: number; // Add this field
}
