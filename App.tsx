import React, { useState, useCallback, useEffect } from 'react';
import { GameCanvas } from './components/GameCanvas';
import { ScoreBoard } from './components/ScoreBoard';
import { CommentaryPanel } from './components/CommentaryPanel';
import { GameState, GameScore, Difficulty, CommentaryMessage } from './types';
import { generateMatchCommentary, generateMatchSummary } from './services/geminiService';
import { DIFFICULTY_SETTINGS } from './constants';

const WINNING_SCORE = 11;

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.MENU);
  const [difficulty, setDifficulty] = useState<Difficulty>(Difficulty.MEDIUM);
  const [score, setScore] = useState<GameScore>({ player: 0, computer: 0 });
  const [commentaryLog, setCommentaryLog] = useState<CommentaryMessage[]>([
    { id: 'init', text: 'System initialized. Waiting for match start.', timestamp: Date.now(), type: 'system' }
  ]);
  const [isGeneratingCommentary, setIsGeneratingCommentary] = useState(false);
  const [winner, setWinner] = useState<'Player' | 'Computer' | null>(null);

  // Helper to add messages
  const addCommentary = (text: string, type: 'system' | 'commentary') => {
    setCommentaryLog(prev => [
      ...prev,
      { id: Date.now().toString() + Math.random(), text, timestamp: Date.now(), type }
    ]);
  };

  const startGame = (diff: Difficulty) => {
    setDifficulty(diff);
    setScore({ player: 0, computer: 0 });
    setGameState(GameState.PLAYING);
    setWinner(null);
    setCommentaryLog([{ id: 'start', text: `Match started. Difficulty: ${diff}`, timestamp: Date.now(), type: 'system' }]);
  };

  const togglePause = () => {
    if (gameState === GameState.PLAYING) setGameState(GameState.PAUSED);
    else if (gameState === GameState.PAUSED) setGameState(GameState.PLAYING);
  };

  const handleGameOver = useCallback(async (matchWinner: 'Player' | 'Computer') => {
    setGameState(GameState.GAME_OVER);
    setWinner(matchWinner);
    addCommentary(`Game Over. ${matchWinner} wins!`, 'system');
    
    setIsGeneratingCommentary(true);
    const summary = await generateMatchSummary(score, difficulty);
    addCommentary(summary, 'commentary');
    setIsGeneratingCommentary(false);
  }, [score, difficulty]);

  const handleScoreUpdate = useCallback(async (scorer: 'Player' | 'Computer') => {
    let newScore = { ...score }; // This will be stale inside the callback due to closure if not careful
    
    // Functional update to ensure we have latest state
    setScore(prev => {
      const updated = { ...prev };
      if (scorer === 'Player') updated.player += 1;
      else updated.computer += 1;
      newScore = updated; // Capture for logic below
      return updated;
    });

    // Check Win Condition
    if (newScore.player >= WINNING_SCORE && newScore.player >= newScore.computer + 2) {
      handleGameOver('Player');
      return;
    } else if (newScore.computer >= WINNING_SCORE && newScore.computer >= newScore.player + 2) {
      handleGameOver('Computer');
      return;
    }
    
    // Trigger Gemini Commentary
    // Don't block the UI
    setIsGeneratingCommentary(true);
    const isMatchPoint = (newScore.player === WINNING_SCORE - 1) || (newScore.computer === WINNING_SCORE - 1);
    
    // Calculate streak (simple logic)
    // In a real app, we'd track history better, here we just pass a dummy streak or derive simpler context
    const streak = 1; 

    try {
      const text = await generateMatchCommentary(newScore, scorer, streak, isMatchPoint);
      addCommentary(text, 'commentary');
    } catch (e) {
      console.error(e);
    } finally {
      setIsGeneratingCommentary(false);
    }

  }, [score, handleGameOver]);

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans selection:bg-blue-500 selection:text-white flex flex-col">
      
      {/* Header */}
      <header className="py-4 px-6 border-b border-slate-800 bg-slate-900/50 backdrop-blur flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20">
            <div className="w-3 h-3 bg-white rounded-full"></div>
          </div>
          <h1 className="text-xl font-bold tracking-tight">Gemini<span className="text-slate-400 font-light">Pong</span></h1>
        </div>
        
        <div className="flex gap-4">
           <button 
             onClick={() => window.open('https://ai.google.dev/', '_blank')}
             className="text-xs text-slate-400 hover:text-white transition-colors"
           >
             Powered by Google Gemini
           </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 md:p-8">
        
        <ScoreBoard score={score} maxScore={WINNING_SCORE} />

        <div className="relative group">
           <GameCanvas 
             gameState={gameState} 
             difficulty={difficulty}
             onScoreUpdate={handleScoreUpdate}
             onGameOver={handleGameOver}
             winningScore={WINNING_SCORE}
             currentScore={score}
           />
           
           {/* Mobile hint removed as requested for keyboard controls */}
        </div>

        {/* Controls & Settings */}
        <div className="mt-8 w-full max-w-4xl flex flex-col md:flex-row gap-6 justify-center items-start">
          
          {/* Left Column: Controls */}
          <div className="w-full md:w-1/3 space-y-4">
            
            {gameState === GameState.MENU || gameState === GameState.GAME_OVER ? (
              <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 shadow-lg">
                <h3 className="text-sm font-semibold text-slate-400 uppercase mb-4 tracking-wider">Select Difficulty</h3>
                <div className="grid grid-cols-1 gap-3">
                  {(Object.keys(DIFFICULTY_SETTINGS) as Difficulty[]).map((diff) => (
                    <button
                      key={diff}
                      onClick={() => startGame(diff)}
                      className={`
                        relative overflow-hidden px-4 py-3 rounded-lg text-sm font-bold transition-all duration-200 text-left group
                        ${diff === Difficulty.IMPOSSIBLE ? 'hover:shadow-[0_0_20px_rgba(239,68,68,0.4)] border border-red-900/30' : 'hover:bg-slate-800 border border-transparent'}
                        ${difficulty === diff ? 'bg-slate-800 border-slate-600' : 'bg-slate-900'}
                      `}
                    >
                      <div className={`absolute inset-0 w-1 bg-gradient-to-b 
                        ${diff === Difficulty.EASY ? 'from-green-500 to-green-600' : ''}
                        ${diff === Difficulty.MEDIUM ? 'from-blue-500 to-blue-600' : ''}
                        ${diff === Difficulty.HARD ? 'from-orange-500 to-orange-600' : ''}
                        ${diff === Difficulty.IMPOSSIBLE ? 'from-red-600 to-purple-600' : ''}
                      `}></div>
                      <span className="relative z-10 ml-2 text-slate-200 group-hover:text-white">{diff}</span>
                      {diff === Difficulty.IMPOSSIBLE && <span className="float-right text-[10px] bg-red-900 text-red-200 px-1.5 py-0.5 rounded border border-red-700">AI</span>}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
               <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 shadow-lg text-center">
                 <button 
                   onClick={togglePause}
                   className="w-full py-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-semibold border border-slate-600 transition-all"
                 >
                   {gameState === GameState.PAUSED ? 'RESUME MATCH' : 'PAUSE MATCH'}
                 </button>
                 <button 
                   onClick={() => setGameState(GameState.MENU)}
                   className="w-full mt-3 py-2 text-sm text-red-400 hover:text-red-300 hover:underline"
                 >
                   Quit to Menu
                 </button>
               </div>
            )}
            
             <div className="text-xs text-slate-500 p-4 bg-slate-900/50 rounded-lg border border-slate-800/50">
              <strong className="block text-slate-400 mb-1">Instructions:</strong>
              Use <span className="text-blue-400 font-bold">UP/DOWN Arrows</span> or <span className="text-blue-400 font-bold">W/S</span> keys to control the left paddle. First to 11 wins (must win by 2).
            </div>
          </div>

          {/* Right Column: Commentary */}
          <div className="w-full md:w-2/3">
            <CommentaryPanel messages={commentaryLog} isGenerating={isGeneratingCommentary} />
          </div>

        </div>

      </main>
    </div>
  );
};

export default App;