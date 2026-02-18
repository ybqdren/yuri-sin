
import React from 'react';
import { PlayerStats, AuthorRank } from '../types';

interface StatsPanelProps {
  stats: PlayerStats;
  onOpenSettings: () => void;
}

const StatsPanel: React.FC<StatsPanelProps> = ({ stats, onOpenSettings }) => {
  const isStaminaLow = stats.stamina < 20;
  const isMoodLow = stats.mood < 30;
  
  const totalFans = stats.fans.passerby + stats.fans.followers + stats.fans.hardcore + stats.fans.stans;
  const isHot = stats.globalHeat > 500;
  const isRich = stats.money > 1000000;

  const getRankColor = (rank: AuthorRank) => {
    switch(rank) {
      case AuthorRank.NOVICE: return 'bg-gray-100 text-gray-400';
      case AuthorRank.CONTRACTED: return 'bg-blue-50 text-blue-400';
      case AuthorRank.MID_TIER: return 'bg-emerald-50 text-emerald-500';
      case AuthorRank.PLATINUM: return 'bg-amber-50 text-amber-500';
      case AuthorRank.LEGEND: return 'bg-rose-50 text-[#f06292]';
      default: return 'bg-gray-100 text-gray-400';
    }
  };

  return (
    <div className="w-full flex items-center justify-between gap-2 overflow-x-auto no-scrollbar">
      <div className="flex items-center gap-2 shrink-0">
        <div className={`flex flex-col px-2 py-0.5 rounded-lg border border-white shadow-sm ${getRankColor(stats.currentRank)}`}>
          <span className="text-[6px] font-black uppercase tracking-tighter opacity-60">Status</span>
          <span className="text-[9px] font-black italic whitespace-nowrap leading-none">{stats.currentRank}</span>
        </div>

        <div className="flex flex-col shrink-0 min-w-[24px]">
          <span className="text-[6px] font-black text-[#b0bec5] uppercase leading-none">Day</span>
          <span className="text-xs font-black text-[#546e7a] leading-none">{stats.day}</span>
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-4 flex-1 justify-end">
        {/* Heat - Mobile hidden label */}
        <div className="flex flex-col items-center shrink-0">
          <div className={`text-[10px] font-mono font-black ${isHot ? 'text-orange-500 animate-pulse' : 'text-[#90a4ae]'}`}>
            🔥{Math.floor(stats.globalHeat)}
          </div>
        </div>

        {/* Fans */}
        <div className="flex items-center gap-1 shrink-0 bg-[#fce4ec]/50 px-1.5 py-0.5 rounded-full">
          <span className="text-[10px]">🫂</span>
          <span className="text-[9px] font-mono font-black text-[#f06292]">{totalFans.toLocaleString()}</span>
        </div>

        {/* Stamina & Mood Bars grouped for mobile */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex flex-col w-8 md:w-12 gap-1">
             <div className="h-1 w-full bg-gray-100 rounded-full overflow-hidden">
                <div className={`h-full transition-all duration-500 ${isStaminaLow ? 'bg-rose-400' : 'bg-[#90a4ae]'}`} style={{ width: `${(stats.stamina/stats.maxStamina)*100}%` }} />
             </div>
             <div className="h-1 w-full bg-gray-100 rounded-full overflow-hidden">
                <div className={`h-full transition-all duration-500 ${isMoodLow ? 'bg-pink-300 animate-pulse' : 'bg-[#f8bbd0]'}`} style={{ width: `${stats.mood}%` }} />
             </div>
          </div>
        </div>

        {/* Money */}
        <div className={`flex items-center gap-1 shrink-0 bg-white/50 px-2 py-0.5 rounded-full border border-gray-50 transition-all ${isRich ? 'shadow-[0_0_10px_rgba(255,215,0,0.3)] border-amber-200' : ''}`}>
          <span className={`text-[9px] font-black ${isRich ? 'text-amber-500' : 'text-emerald-500'}`}>¥</span>
          <span className={`text-[10px] font-mono font-black ${isRich ? 'text-amber-600' : 'text-[#455a64]'}`}>
            {stats.money > 1000000 ? (stats.money/10000).toFixed(1)+'w' : stats.money.toLocaleString()}
          </span>
        </div>

        <button onClick={onOpenSettings} className="w-7 h-7 rounded-full bg-white flex items-center justify-center border border-gray-100 shadow-sm active:scale-90 shrink-0">
          <span className="text-[10px]">⚙️</span>
        </button>
      </div>
    </div>
  );
};

export default StatsPanel;
