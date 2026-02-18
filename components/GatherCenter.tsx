
import React, { useState, useEffect } from 'react';
import { PlayerStats } from '../types';
import { DANMU_POOL } from '../constants';
import { generateGatheringDanmu } from '../services/geminiService';

interface GatherCenterProps {
  stats: PlayerStats;
  setStats: React.Dispatch<React.SetStateAction<PlayerStats>>;
}

const GATHER_OPTIONS = [
  { id: 'anime', name: '热门番剧', cost: 20, mood: 15, shards: 3, skill: 1, icon: '📺' },
  { id: 'movie', name: '文艺电影', cost: 30, mood: -10, shards: 10, skill: 5, icon: '🎬' },
  { id: 'manga', name: '经典漫画', cost: 15, mood: 5, shards: 5, skill: 2, icon: '📖' },
  { id: 'novel', name: '轻小说', cost: 10, mood: 5, shards: 2, skill: 1, icon: '📚' }
];

const GatherCenter: React.FC<GatherCenterProps> = ({ stats, setStats }) => {
  const [isGathering, setIsGathering] = useState(false);
  const [currentDanmu, setCurrentDanmu] = useState<string[]>([]);

  const handleGather = async (opt: typeof GATHER_OPTIONS[0]) => {
    if (stats.stamina < opt.cost) return;
    setIsGathering(true);

    try {
      let danmuList = await generateGatheringDanmu();
      if (!danmuList || danmuList.length < 5) {
        danmuList = getRandomDanmuFromPool(12);
      }
      setCurrentDanmu(danmuList.slice(0, 12));
    } catch (e) {
      setCurrentDanmu(getRandomDanmuFromPool(12));
    }

    // 稍微延长取材时间以配合慢速弹幕
    setTimeout(() => {
      setStats(prev => ({
        ...prev,
        stamina: Math.max(0, prev.stamina - opt.cost),
        mood: Math.max(0, Math.min(100, prev.mood + opt.mood)),
        shards: prev.shards + opt.shards,
        writingSkill: prev.writingSkill + opt.skill,
      }));
      setIsGathering(false);
      setCurrentDanmu([]);
    }, 6000); 
  };

  const getRandomDanmuFromPool = (count: number) => {
    const poolCopy = [...DANMU_POOL];
    const result: string[] = [];
    for (let i = 0; i < count; i++) {
      if (poolCopy.length === 0) break;
      const randIdx = Math.floor(Math.random() * poolCopy.length);
      result.push(poolCopy.splice(randIdx, 1)[0]);
    }
    return result;
  };

  return (
    <div className="flex-1 flex flex-col h-full gap-4 overflow-hidden animate-in fade-in duration-700">
      <div className="flex justify-between items-center px-1 shrink-0">
        <h2 className="text-xl font-black text-[#546e7a] italic">素材市场 / GATHERING</h2>
        <div className="flex items-center gap-2">
           <span className="text-[10px] font-black text-indigo-400">灵感碎片: {stats.shards}</span>
        </div>
      </div>

      <div className="flex-1 glass-card rounded-[2.5rem] p-4 flex flex-col relative overflow-hidden">
        {isGathering ? (
          <div className="flex-1 flex flex-col items-center justify-center relative overflow-hidden">
             <div className="text-6xl animate-bounce mb-4 z-20">✨</div>
             <p className="font-black text-sm text-gray-400 tracking-[0.3em] z-20">取材中...</p>
             
             <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
                {currentDanmu.map((text, i) => {
                  const top = 10 + (i * 8); 
                  const delay = i * 0.5;
                  // 减慢弹幕速度：从 4-7s 减慢到 10-16s
                  const speed = 10 + Math.random() * 6;
                  return (
                    <div 
                      key={i}
                      className="absolute whitespace-nowrap text-[#f06292] font-black text-xs md:text-sm animate-danmu-slide shadow-sm"
                      style={{ 
                        top: `${top}%`, 
                        left: '110%',
                        animationDelay: `${delay}s`,
                        animationDuration: `${speed}s`,
                        opacity: 0.95
                      }}
                    >
                      {text}
                    </div>
                  );
                })}
             </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 flex-1 items-center">
            {GATHER_OPTIONS.map(opt => (
              <button 
                key={opt.id}
                onClick={() => handleGather(opt)}
                disabled={stats.stamina < opt.cost}
                className="h-32 md:h-40 glass-card rounded-[2rem] flex flex-col items-center justify-center gap-2 transition-all active:scale-95 border-transparent hover:border-[#e3f2fd] disabled:opacity-30"
              >
                <span className="text-4xl">{opt.icon}</span>
                <div className="flex flex-col text-center">
                  <span className="text-xs font-black text-[#546e7a]">{opt.name}</span>
                  <span className="text-[8px] font-black text-rose-400 mt-1">体力 -{opt.cost}</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
      
      <div className="h-14 flex items-center justify-center text-[10px] text-gray-400 font-bold italic mb-2 shrink-0 text-center px-4">
        “由于太爱而产生的创作冲动，正在此间流转”
      </div>

      <style>{`
        @keyframes danmu-slide {
          0% { transform: translateX(0); }
          100% { transform: translateX(-2500px); }
        }
        .animate-danmu-slide { animation: danmu-slide linear forwards; }
      `}</style>
    </div>
  );
};

export default GatherCenter;
