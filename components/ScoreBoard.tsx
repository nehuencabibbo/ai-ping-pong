import React from 'react';
import { GameScore } from '../types';

interface ScoreBoardProps {
  score: GameScore;
  maxScore: number;
}

export const ScoreBoard: React.FC<ScoreBoardProps> = ({ score, maxScore }) => {
  return (
    <div className="flex items-center justify-center space-x-8 mb-4 p-4 bg-slate-800 rounded-xl shadow-lg border border-slate-700">
      <div className="text-center">
        <p className="text-blue-400 font-bold uppercase tracking-wider text-xs mb-1">Player</p>
        <div className="text-4xl font-mono font-black text-white bg-slate-900 px-4 py-2 rounded-lg border-2 border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.3)]">
          {score.player.toString().padStart(2, '0')}
        </div>
      </div>

      <div className="flex flex-col items-center">
        <div className="text-slate-500 font-bold text-xl">VS</div>
        <div className="text-slate-600 text-xs font-medium mt-1">TARGET: {maxScore}</div>
      </div>

      <div className="text-center">
        <p className="text-red-400 font-bold uppercase tracking-wider text-xs mb-1">Computer</p>
        <div className="text-4xl font-mono font-black text-white bg-slate-900 px-4 py-2 rounded-lg border-2 border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.3)]">
          {score.computer.toString().padStart(2, '0')}
        </div>
      </div>
    </div>
  );
};