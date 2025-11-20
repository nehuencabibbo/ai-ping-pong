import React, { useEffect, useRef } from 'react';
import { 
  CANVAS_WIDTH, 
  CANVAS_HEIGHT, 
  PADDLE_WIDTH, 
  PADDLE_HEIGHT, 
  BALL_RADIUS,
  THEME,
  INITIAL_BALL_SPEED,
  SPEED_INCREMENT,
  MAX_BALL_SPEED,
  PLAYER_PADDLE_SPEED,
  DIFFICULTY_SETTINGS
} from '../constants';
import { GameState, GameScore, Difficulty } from '../types';

interface GameCanvasProps {
  gameState: GameState;
  difficulty: Difficulty;
  onScoreUpdate: (scorer: 'Player' | 'Computer') => void;
  onGameOver: (winner: 'Player' | 'Computer') => void;
  winningScore: number;
  currentScore: GameScore;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({
  gameState,
  difficulty,
  onScoreUpdate,
  onGameOver,
  winningScore,
  currentScore
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>(0);
  
  // Mutable game state references to avoid re-renders on every frame
  const ballRef = useRef({ x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT / 2, vx: INITIAL_BALL_SPEED, vy: INITIAL_BALL_SPEED });
  const paddle1Ref = useRef({ y: CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2 });
  const paddle2Ref = useRef({ y: CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2 });
  const keysPressed = useRef<{ [key: string]: boolean }>({});
  
  // Reset ball helper
  const resetBall = (server: 'Player' | 'Computer') => {
    ballRef.current = {
      x: CANVAS_WIDTH / 2,
      y: CANVAS_HEIGHT / 2,
      vx: (server === 'Player' ? 1 : -1) * INITIAL_BALL_SPEED,
      vy: (Math.random() * 4 - 2) // Random minor Y deviation
    };
  };

  // Input handler (Keyboard)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'w', 's', 'W', 'S'].includes(e.key)) {
        // Prevent scrolling for arrow keys
        if (e.key === 'ArrowUp' || e.key === 'ArrowDown') e.preventDefault();
        keysPressed.current[e.key] = true;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'w', 's', 'W', 'S'].includes(e.key)) {
        keysPressed.current[e.key] = false;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Reset positions when game starts
  useEffect(() => {
    if (gameState === GameState.PLAYING && currentScore.player === 0 && currentScore.computer === 0) {
        resetBall('Player');
        paddle1Ref.current.y = CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2;
        paddle2Ref.current.y = CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2;
    }
  }, [gameState, currentScore]);

  // The Game Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const render = () => {
      // 1. Clear Canvas
      ctx.fillStyle = THEME.tableColor;
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // 2. Draw Table Elements
      // Center Line
      ctx.strokeStyle = THEME.lineColor;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(CANVAS_WIDTH / 2, 0);
      ctx.lineTo(CANVAS_WIDTH / 2, CANVAS_HEIGHT);
      ctx.stroke();

      // Center Circle
      ctx.beginPath();
      ctx.arc(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, 50, 0, Math.PI * 2);
      ctx.stroke();

      // Net
      ctx.fillStyle = THEME.netColor;
      for(let i = 0; i < CANVAS_HEIGHT; i += 20) {
        ctx.fillRect(CANVAS_WIDTH / 2 - 1, i, 2, 10);
      }

      // 3. Draw Paddles
      ctx.fillStyle = THEME.playerPaddleColor;
      ctx.shadowBlur = 10;
      ctx.shadowColor = THEME.playerPaddleColor;
      ctx.fillRect(10, paddle1Ref.current.y, PADDLE_WIDTH, PADDLE_HEIGHT);
      ctx.shadowBlur = 0;

      ctx.fillStyle = THEME.computerPaddleColor;
      ctx.shadowBlur = 10;
      ctx.shadowColor = THEME.computerPaddleColor;
      ctx.fillRect(CANVAS_WIDTH - 20, paddle2Ref.current.y, PADDLE_WIDTH, PADDLE_HEIGHT);
      ctx.shadowBlur = 0;

      // 4. Draw Ball
      ctx.fillStyle = THEME.ballColor;
      ctx.beginPath();
      ctx.arc(ballRef.current.x, ballRef.current.y, BALL_RADIUS, 0, Math.PI * 2);
      ctx.fill();

      // Add a slight glow to the ball
      ctx.fillStyle = 'rgba(250, 204, 21, 0.3)';
      ctx.beginPath();
      ctx.arc(ballRef.current.x, ballRef.current.y, BALL_RADIUS + 4, 0, Math.PI * 2);
      ctx.fill();
    };

    const update = () => {
      if (gameState !== GameState.PLAYING) return;

      const ball = ballRef.current;
      const p1 = paddle1Ref.current;
      const p2 = paddle2Ref.current;

      // --- Player Movement (Keyboard) ---
      if (keysPressed.current['ArrowUp'] || keysPressed.current['w'] || keysPressed.current['W']) {
        p1.y -= PLAYER_PADDLE_SPEED;
      }
      if (keysPressed.current['ArrowDown'] || keysPressed.current['s'] || keysPressed.current['S']) {
        p1.y += PLAYER_PADDLE_SPEED;
      }
      // Clamp
      p1.y = Math.max(0, Math.min(CANVAS_HEIGHT - PADDLE_HEIGHT, p1.y));

      // --- AI Movement ---
      const aiSettings = DIFFICULTY_SETTINGS[difficulty];
      const targetAIY = ball.y - PADDLE_HEIGHT / 2;
      
      // Add reaction delay/error based on difficulty
      // We interpolate current pos towards ball Y
      let diff = targetAIY - p2.y;
      
      // Add some "jitter" or error if the ball is far away or moving fast on easier modes
      if (Math.abs(ball.x - (CANVAS_WIDTH - 20)) > 200 && Math.random() * 100 < aiSettings.errorMargin) {
         // AI hesitates
         diff = 0; 
      }

      p2.y += diff * aiSettings.speed;
      p2.y = Math.max(0, Math.min(CANVAS_HEIGHT - PADDLE_HEIGHT, p2.y));


      // --- Ball Physics ---
      ball.x += ball.vx;
      ball.y += ball.vy;

      // Wall Collisions (Top/Bottom)
      if (ball.y - BALL_RADIUS < 0) {
        ball.y = BALL_RADIUS;
        ball.vy = -ball.vy;
      } else if (ball.y + BALL_RADIUS > CANVAS_HEIGHT) {
        ball.y = CANVAS_HEIGHT - BALL_RADIUS;
        ball.vy = -ball.vy;
      }

      // Paddle Collisions
      
      // Player Paddle (Left)
      // Hitbox: x: 10 to 10+PADDLE_WIDTH, y: p1.y to p1.y + PADDLE_HEIGHT
      if (
        ball.x - BALL_RADIUS < 10 + PADDLE_WIDTH && 
        ball.x + BALL_RADIUS > 10 &&
        ball.y > p1.y && 
        ball.y < p1.y + PADDLE_HEIGHT
      ) {
        // Calculate relative impact point (-0.5 to 0.5)
        const relativeIntersectY = (p1.y + (PADDLE_HEIGHT / 2)) - ball.y;
        const normalizedRelativeIntersectionY = (relativeIntersectY / (PADDLE_HEIGHT / 2));
        
        // Bounce angle
        const bounceAngle = normalizedRelativeIntersectionY * (Math.PI / 4); // Max 45 deg
        
        // Speed up slightly on hit, cap at MAX
        const speed = Math.min(Math.sqrt(ball.vx * ball.vx + ball.vy * ball.vy) + SPEED_INCREMENT, MAX_BALL_SPEED);
        
        ball.vx = speed * Math.cos(bounceAngle);
        ball.vy = speed * -Math.sin(bounceAngle);
        ball.x = 10 + PADDLE_WIDTH + BALL_RADIUS + 1; // Push out of paddle to avoid sticky glitches
      }

      // Computer Paddle (Right)
      // Hitbox: x: CANVAS_WIDTH - 20 to CANVAS_WIDTH - 20 + PADDLE_WIDTH
      if (
        ball.x + BALL_RADIUS > CANVAS_WIDTH - 20 &&
        ball.x - BALL_RADIUS < CANVAS_WIDTH - 20 + PADDLE_WIDTH &&
        ball.y > p2.y &&
        ball.y < p2.y + PADDLE_HEIGHT
      ) {
        const relativeIntersectY = (p2.y + (PADDLE_HEIGHT / 2)) - ball.y;
        const normalizedRelativeIntersectionY = (relativeIntersectY / (PADDLE_HEIGHT / 2));
        const bounceAngle = normalizedRelativeIntersectionY * (Math.PI / 4);
        
        const speed = Math.min(Math.sqrt(ball.vx * ball.vx + ball.vy * ball.vy) + SPEED_INCREMENT, MAX_BALL_SPEED);
        
        ball.vx = -speed * Math.cos(bounceAngle);
        ball.vy = speed * -Math.sin(bounceAngle);
        ball.x = CANVAS_WIDTH - 20 - BALL_RADIUS - 1;
      }

      // Scoring
      if (ball.x < 0) {
        // Computer scores
        onScoreUpdate('Computer');
        resetBall('Player');
      } else if (ball.x > CANVAS_WIDTH) {
        // Player scores
        onScoreUpdate('Player');
        resetBall('Computer');
      }
    };

    const loop = () => {
      update();
      render();
      requestRef.current = requestAnimationFrame(loop);
    };

    requestRef.current = requestAnimationFrame(loop);

    return () => cancelAnimationFrame(requestRef.current);
  }, [gameState, difficulty, onScoreUpdate]);

  return (
    <div className="relative rounded-xl overflow-hidden border-4 border-slate-700 shadow-2xl bg-black">
      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        className="block w-full h-auto cursor-none touch-none"
        style={{ maxWidth: '100%' }}
      />
      
      {/* Overlay for Menu/Pause states */}
      {gameState !== GameState.PLAYING && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center flex-col z-10">
          {gameState === GameState.MENU && (
             <div className="text-center animate-fade-in">
                <h1 className="text-5xl font-black text-white mb-2 tracking-tighter">GEMINI <span className="text-blue-500">PONG</span></h1>
                <p className="text-slate-300 mb-8">AI-Powered Sports Simulation</p>
                <p className="text-sm text-slate-400 animate-pulse">Select difficulty below to start</p>
             </div>
          )}
          
          {gameState === GameState.PAUSED && (
             <h2 className="text-4xl font-bold text-white">PAUSED</h2>
          )}

          {gameState === GameState.GAME_OVER && (
            <div className="text-center">
               <h2 className="text-5xl font-bold text-white mb-4">
                 {currentScore.player >= winningScore ? <span className="text-green-500">VICTORY</span> : <span className="text-red-500">DEFEAT</span>}
               </h2>
               <p className="text-xl text-slate-300 mb-6">
                 Final Score: {currentScore.player} - {currentScore.computer}
               </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};