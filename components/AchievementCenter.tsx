
import React, { useState } from 'react';
import { PlayerStats, Novel, AchievementCategory } from '../types';
import { ACHIEVEMENTS } from '../constants';

interface AchievementCenterProps {
  stats: PlayerStats;
  finishedNovels: Novel[];
}

const AchievementCenter: React.FC<AchievementCenterProps> = ({ stats, finishedNovels }) => {
  const [activeCat, setActiveCat] = useState<AchievementCategory>(AchievementCategory.WRITING);
  const categories = Object.values(AchievementCategory);

  const filteredAchievements = ACHIEVEMENTS.filter(a => a.category === activeCat);
  const unlockedCountInCat = filteredAchievements.filter(a => stats.unlockedAchievementIds.includes(a.id)).length;

  return (
    <div className="flex-1 flex flex-col h-full gap-4 overflow-hidden animate-in fade-in duration-700">
      {/* 顶部总览 - 响应式 Padding */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center px-2 gap-2 shrink-0">
        <div className="flex flex-col">
          <h2 className="text-xl md:text-2xl font-black text-[#546e7a] italic">成就殿堂 / HALL OF FAME</h2>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
            {activeCat}领域：已达成 {unlockedCountInCat} / {filteredAchievements.length}
          </p>
        </div>
        
        <div className="flex items-center gap-3 bg-white/60 px-4 py-2 rounded-2xl border border-white shadow-sm">
           <div className="flex flex-col items-end">
              <span className="text-[10px] font-black text-[#f06292] leading-none mb-1">
                总进度 {stats.unlockedAchievementIds.length} / {ACHIEVEMENTS.length}
              </span>
              <div className="h-1.5 w-24 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-[#f06292] to-pink-300 transition-all duration-1000" 
                  style={{ width: `${(stats.unlockedAchievementIds.length / ACHIEVEMENTS.length) * 100}%` }}
                />
              </div>
           </div>
           <span className="text-2xl">🏆</span>
        </div>
      </div>

      {/* 分类切换器 - 响应式布局 */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar shrink-0 px-2 py-1">
        {categories.map(cat => (
          <button 
            key={cat} 
            onClick={() => setActiveCat(cat)}
            className={`px-5 py-2.5 rounded-2xl text-[10px] md:text-xs font-black whitespace-nowrap transition-all border shadow-sm ${
              activeCat === cat 
                ? 'bg-[#546e7a] text-white border-transparent scale-105 z-10' 
                : 'bg-white/80 text-gray-400 border-gray-50 hover:bg-white'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* 成就网格 - 核心响应式部分 */}
      <div className="flex-1 glass-card rounded-[2.5rem] p-4 md:p-6 overflow-y-auto custom-scrollbar relative bg-white/30">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {filteredAchievements.map((a, index) => {
            const isUnlocked = stats.unlockedAchievementIds.includes(a.id);
            return (
              <div 
                key={a.id} 
                style={{ animationDelay: `${index * 50}ms` }}
                className={`group relative p-5 rounded-[2.2rem] border transition-all duration-500 flex flex-col gap-4 animate-in slide-in-from-bottom-4 fill-mode-both hover:shadow-xl ${
                  isUnlocked 
                    ? 'bg-white border-[#fce4ec] shadow-md cursor-default' 
                    : 'bg-gray-50/40 border-transparent opacity-60 grayscale-[0.8]'
                }`}
              >
                {/* 装饰性背景 */}
                {isUnlocked && (
                  <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-pink-50/20 to-transparent rounded-[2.2rem] pointer-events-none" />
                )}

                <div className="flex items-start gap-4 z-10">
                  <div className={`w-14 h-14 md:w-16 md:h-16 flex items-center justify-center rounded-[1.5rem] text-3xl md:text-4xl transition-all duration-700 ${
                    isUnlocked 
                      ? 'bg-gradient-to-br from-white to-pink-50 shadow-inner group-hover:rotate-12 group-hover:scale-110' 
                      : 'bg-gray-200/50'
                  }`}>
                    {a.icon}
                  </div>
                  <div className="flex-1 flex flex-col min-w-0">
                    <div className="flex flex-col mb-1">
                      <span className={`text-sm md:text-base font-black truncate ${isUnlocked ? 'text-[#546e7a]' : 'text-gray-400'}`}>
                        {a.title}
                      </span>
                      <span className={`text-[8px] font-black uppercase tracking-tighter ${isUnlocked ? 'text-[#f06292]' : 'text-gray-300'}`}>
                        {isUnlocked ? '✓ ACHIEVEMENT UNLOCKED' : 'LOCKED'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="z-10 flex-1">
                  <p className={`text-[10px] md:text-xs font-bold leading-relaxed ${isUnlocked ? 'text-gray-500' : 'text-gray-300'} line-clamp-3`}>
                    {a.description}
                  </p>
                </div>

                {/* 奖励面板 */}
                <div className={`z-10 mt-auto p-3 rounded-2xl border transition-all ${
                  isUnlocked 
                    ? 'bg-emerald-50/40 border-emerald-100/50 text-emerald-600 shadow-sm' 
                    : 'bg-gray-100/30 border-gray-100 text-gray-400'
                }`}>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">🎁</span>
                    <div className="flex flex-col min-w-0">
                      <span className="text-[7px] font-black uppercase tracking-widest opacity-60">Reward Unlock</span>
                      <span className="text-[9px] md:text-[10px] font-black truncate">{a.rewardText}</span>
                    </div>
                  </div>
                </div>

                {/* 状态指示器 */}
                {!isUnlocked && (
                  <div className="absolute bottom-4 right-5 opacity-10 group-hover:opacity-30 transition-opacity">
                    <span className="text-2xl">🔒</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {filteredAchievements.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center p-12 opacity-30 select-none">
            <span className="text-7xl mb-6">📜</span>
            <div className="space-y-2">
              <p className="text-sm font-black text-gray-400 uppercase tracking-widest">荒芜之地</p>
              <p className="text-[10px] font-bold text-gray-300">该领域的传说尚未被记载...</p>
            </div>
          </div>
        )}
      </div>
      
      {/* 底部装饰 - 响应式显示 */}
      <div className="hidden md:flex h-8 shrink-0 mb-2 items-center justify-center">
         <div className="h-px w-12 bg-gray-200" />
         <p className="mx-4 text-[9px] font-black text-gray-300 uppercase tracking-[0.3em] italic">
           WRITING YOUR OWN LEGEND IN YURI WORLD
         </p>
         <div className="h-px w-12 bg-gray-200" />
      </div>
    </div>
  );
};

export default AchievementCenter;
