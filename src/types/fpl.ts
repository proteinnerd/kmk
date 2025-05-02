export interface Player {
  id: number;
  name: string;
  totalPoints: number;
  gameweekPoints: number;
  penaltyMeters: number;
}

export interface Gameweek {
  id: number;
  name: string;
  isFinished: boolean;
  isCurrent: boolean;
  deadline: string;
}

export interface GameweekResult {
  gameweek: number;
  rankings: Player[];
  timestamp: string;
}

export interface PenaltyConfig {
  positions: {
    1: number; // 0 meters
    2: number; // 100 meters
    3: number; // 200 meters
    default: number; // 400 meters
  };
} 