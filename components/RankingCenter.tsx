
import React, { useState } from 'react';
import { PlayerStats, Novel, RankingEntry } from '../types';

interface RankingCenterProps {
  stats: PlayerStats;
  setStats: React.Dispatch<React.SetStateAction<PlayerStats>>;
  activeNovel: Novel | null;
}

const RankingCenter: React.FC<RankingCenterProps> = ({ stats, setStats, activeNovel }) => {
  const [activeTab, setActiveTab] = useState<'monthly' | 'potential' | 'richFans'>('monthly');

  const currentRankings = stats.rankings[activeTab] || [];
  const playerEntry = currentRankings.find(r => r.isPlayer);

  const handleBoost = () => {
    if (stats.stamina < 50 || stats.money < 10000) return;
    
    setStats(prev => ({
      ...prev,
      stamina: prev.stamina - 50,
      money: prev.money - 10000,
      globalHeat: prev.globalHeat + 500,
      rankings: {
        ...prev.rankings,
        [activeTab]: prev.rankings[activeTab].map(r => 
          r.isPlayer ? { ...r, score: r.score + 3000, trend: 'UP' } : r
        ).sort((a, b) => b.score - a.score).map((r, i) => ({ ...r, rank: i + 1 }))
      }
    }));
    alert("执行【爆肝推流】！热度瞬间攀升 3,000 点！");
  };

  return (
    <div className="flex-1 flex flex-col h-full gap-4 overflow-hidden animate-in fade-in duration-700">
      {/* Header Info */}
      <div className="flex justify-between items-center px-1 shrink-0">
        <h2 className="text-xl font-black text-[#546e7a] italic">风云榜 / RANKINGS</h2>
        {playerEntry && (
          <div className="bg-[#fce4ec] px-3 py-1 rounded-full border border-white">
            <span className="text-[10px] font-black text-[#f06292]">我的排名：NO.{playerEntry.rank}</span>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 shrink-0 px-1 overflow-x-auto no-scrollbar">
        {[
          { id: 'monthly', label: '月票榜', icon: '🎫' },
          { id: 'potential', label: '潜力榜', icon: '🌱' },
          { id: 'richFans', label: '土豪榜', icon: '💰' }
        ].map(tab => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 rounded-full text-[10px] font-black whitespace-nowrap transition-all border flex items-center gap-2 ${
              activeTab === tab.id ? 'bg-[#546e7a] text-white border-transparent' : 'bg-white text-gray-400 border-gray-100'
            }`}
          >
            <span>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Main List Area */}
      <div className="flex-1 glass-card rounded-[2.5rem] p-4 overflow-y-auto no-scrollbar relative flex flex-col gap-3">
        {currentRankings.map((entry) => (
          <div 
            key={entry.title} 
            className={`p-4 rounded-2xl border flex items-center gap-4 transition-all ${
              entry.isPlayer 
                ? 'bg-gradient-to-r from-[#fce4ec] to-[#f8bbd0] border-[#f06292] shadow-md ring-1 ring-[#fce4ec]' 
                : 'bg-white/60 border-white/50'
            }`}
          >
            <div className="w-8 flex flex-col items-center shrink-0">
              <span className={`text-lg font-black italic ${entry.rank <= 3 ? 'text-[#f06292]' : 'text-gray-300'}`}>
                {entry.rank}
              </span>
              <span className={`text-[8px] font-bold ${entry.trend === 'UP' ? 'text-emerald-500' : entry.trend === 'DOWN' ? 'text-rose-400' : 'text-gray-300'}`}>
                {entry.trend === 'UP' ? '▲' : entry.trend === 'DOWN' ? '▼' : '-'}
              </span>
            </div>
            
            <div className="flex-1 flex flex-col">
              <span className={`text-xs font-black truncate ${entry.isPlayer ? 'text-[#f06292]' : 'text-[#546e7a]'}`}>{entry.title}</span>
              <span className="text-[8px] text-gray-400 font-bold">作者：{entry.author}</span>
            </div>

            <div className="text-right shrink-0">
               <span className="text-[10px] font-mono font-black text-[#546e7a]">{entry.score.toLocaleString()}</span>
               {activeTab === 'monthly' && entry.tickets !== undefined && (
                 <span className="text-[7px] text-amber-500 font-black block uppercase tracking-tighter">🎫 {entry.tickets}</span>
               )}
            </div>
          </div>
        ))}
      </div>

      {/* Actions */}
      {activeNovel && (
        <div className="px-1 mb-2">
          <button 
            disabled={stats.stamina < 50 || stats.money < 10000}
            onClick={handleBoost}
            className="w-full h-14 bg-[#546e7a] text-white rounded-[2rem] flex items-center justify-center gap-3 shadow-lg active:scale-95 transition-all disabled:opacity-30"
          >
            <span className="text-xl">🔥</span>
            <div className="flex flex-col items-start">
               <span className="text-xs font-black">爆肝推流 / RANK BOOST</span>
               <span className="text-[8px] opacity-70">消耗 50⚡ & ¥10,000</span>
            </div>
          </button>
        </div>
      )}
    </div>
  );
};

export default RankingCenter;
