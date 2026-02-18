
import React from 'react';
import { PlayerStats, AuthorRank } from '../types';
import { STATUS_PATH } from '../constants';

interface ReputationCenterProps {
  stats: PlayerStats;
}

const ReputationCenter: React.FC<ReputationCenterProps> = ({ stats }) => {
  const currentLevel = [...STATUS_PATH].reverse().find(l => stats.reputation >= l.threshold) || STATUS_PATH[0];
  const nextLevel = STATUS_PATH.find(l => l.threshold > stats.reputation);
  
  const progress = nextLevel 
    ? ((stats.reputation - currentLevel.threshold) / (nextLevel.threshold - currentLevel.threshold)) * 100 
    : 100;

  return (
    <div className="flex-1 flex flex-col h-full gap-6 overflow-hidden animate-in fade-in duration-700">
      {/* 位格主卡片 */}
      <div className="shrink-0 bg-gradient-to-br from-[#546e7a] to-[#37474f] p-8 rounded-[2.5rem] text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 opacity-5 text-9xl">👑</div>
        <div className="relative z-10">
          <div className="flex justify-between items-start">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-black text-indigo-200 uppercase tracking-[0.2em]">当前文坛位格</span>
              <h2 className="text-3xl font-black italic tracking-tight">{currentLevel.rank}</h2>
            </div>
            <div className="text-right flex flex-col">
              <span className="text-3xl font-mono font-black">{stats.reputation.toLocaleString()}</span>
              <span className="text-[8px] font-black uppercase text-indigo-200">Total Reputation</span>
            </div>
          </div>
          
          <p className="text-xs mt-4 text-indigo-100 opacity-80 leading-relaxed font-bold">
            “{currentLevel.perks}”
          </p>

          <div className="mt-8 space-y-2">
            <div className="flex justify-between items-end">
              <span className="text-[10px] font-black text-indigo-200 uppercase">晋升进度</span>
              {nextLevel && <span className="text-[10px] font-mono font-black">距离 {nextLevel.rank}: {(nextLevel.threshold - stats.reputation).toLocaleString()}</span>}
            </div>
            <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-[#f06292] to-indigo-400 transition-all duration-1000" 
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col gap-6 overflow-hidden">
        <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-4">晋升天梯 / STATUS PATH</h3>
        <div className="flex-1 overflow-y-auto no-scrollbar space-y-3 px-1 pb-6">
          {STATUS_PATH.map(level => {
            const isUnlocked = stats.reputation >= level.threshold;
            const isCurrent = stats.currentRank === level.rank;
            
            return (
              <div 
                key={level.rank} 
                className={`p-5 rounded-[2rem] border transition-all relative ${
                  isCurrent ? 'bg-white border-[#fce4ec] shadow-md ring-2 ring-[#fce4ec]/50' :
                  isUnlocked ? 'bg-white/60 border-transparent opacity-80' : 'bg-gray-100/50 border-transparent opacity-40'
                }`}
              >
                {isUnlocked && <span className="absolute top-4 right-4 text-emerald-500">✓</span>}
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-center">
                    <span className={`text-sm font-black ${isUnlocked ? 'text-[#546e7a]' : 'text-gray-400'}`}>{level.rank}</span>
                    <span className="text-[9px] font-mono font-black text-gray-400">{level.threshold.toLocaleString()} 声望</span>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {level.unlockedGenres.map(g => (
                      <span key={g} className="text-[8px] font-black bg-gray-50 text-gray-400 px-2 py-0.5 rounded-full uppercase">{g}</span>
                    ))}
                  </div>
                  {level.skills.length > 0 && (
                    <div className="flex flex-col gap-1 mt-2">
                       <span className="text-[8px] font-black text-indigo-400 uppercase tracking-widest">位格技能:</span>
                       {level.skills.map(s => (
                         <div key={s.id} className="text-[9px] font-bold text-[#90a4ae] flex items-center gap-1">
                            <span className="text-indigo-400">●</span> {s.name}: {s.description}
                         </div>
                       ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ReputationCenter;
