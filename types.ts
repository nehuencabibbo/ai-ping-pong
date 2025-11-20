export enum GameState {
  MENU = 'MENU',
  PLAYING = 'PLAYING',
  PAUSED = 'PAUSED',
  GAME_OVER = 'GAME_OVER'
}

export enum Difficulty {
  EASY = 'EASY',
  MEDIUM = 'MEDIUM',
  HARD = 'HARD',
  IMPOSSIBLE = 'IMPOSSIBLE'
}

export interface GameScore {
  player: number;
  computer: number;
}

export interface CommentaryMessage {
  id: string;
  text: string;
  timestamp: number;
  type: 'system' | 'commentary';
}

export interface GameSettings {
  difficulty: Difficulty;
  winningScore: number;
}