export interface User {
  id: string;
  name: string;
  points: number;
  total_points: number;
  record: string; // e.g., "4-1"
  streak: string; // e.g., "W3" or "L2"
}
