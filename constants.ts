import { Difficulty } from './types';

export const CANVAS_WIDTH = 800;
export const CANVAS_HEIGHT = 500;

export const PADDLE_WIDTH = 10;
export const PADDLE_HEIGHT = 80;
export const BALL_RADIUS = 8;

export const INITIAL_BALL_SPEED = 4;
export const MAX_BALL_SPEED = 12;
export const SPEED_INCREMENT = 0.5;
export const PLAYER_PADDLE_SPEED = 6;

export const DIFFICULTY_SETTINGS = {
  [Difficulty.EASY]: { speed: 0.05, errorMargin: 40 },
  [Difficulty.MEDIUM]: { speed: 0.09, errorMargin: 25 },
  [Difficulty.HARD]: { speed: 0.15, errorMargin: 10 },
  [Difficulty.IMPOSSIBLE]: { speed: 0.25, errorMargin: 0 },
};

export const THEME = {
  tableColor: '#1e293b', // Slate 800
  lineColor: '#334155', // Slate 700
  netColor: '#94a3b8', // Slate 400
  ballColor: '#facc15', // Yellow 400
  playerPaddleColor: '#3b82f6', // Blue 500
  computerPaddleColor: '#ef4444', // Red 500
};