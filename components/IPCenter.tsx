
import React, { useState } from 'react';
import { PlayerStats, Novel, AuthorRank, GameEvent } from '../types';
import { generateIPNegotiation } from '../services/geminiService';

interface IPCenterProps {
  stats: PlayerStats;
  setStats: React.Dispatch<React.SetStateAction<PlayerStats>>;
  activeNovel: Novel | null;
  finishedNovels: Novel[];
  onTriggerAIEvent: (ev: GameEvent) => void;
}

const IPCenter: React.FC<IPCenterProps> = ({ stats, setStats, activeNovel, finishedNovels, onTriggerAIEvent }) => {
  const [isNegotiating, setIsNegotiating] = useState(false);

  const isNovice = stats.currentRank === AuthorRank.NOVICE;
  const canVAM = stats.currentRank === AuthorRank.PLATINUM || stats.currentRank === AuthorRank.LEGEND;

  const startIPNegotiation = async (novel: Novel) => {
    if (isNovice) {
      alert("萌新期暂无版权价值，先签约作品提升位格吧！");
      return;
    }
    setIsNegotiating(true);
    try {
      const aiEvent = await generateIPNegotiation(novel, stats);
      onTriggerAIEvent(aiEvent);
    } catch (e) {
      alert("AI 引擎忙，请重试。");
    } finally {
      setIsNegotiating(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full gap-4 overflow-hidden animate-in fade-in duration-700">
      <div className="flex justify-between items-center px-1 shrink-0">
        <h2 className="text-xl font-black text-[#546e7a] italic">版权中心 / IP HUB</h2>
        <div className="bg-[#fce4ec] px-3 py-1 rounded-full border border-white">
          <span className="text-[10px] font-black text-[#f06292]">位格：{stats.currentRank}</span>
        </div>
      </div>

      <div className="flex-1 glass-card rounded-[2.5rem] p-5 overflow-y-auto no-scrollbar flex flex-col gap-6">
        <div className={`p-6 rounded-[2rem] border-2 border-dashed transition-all ${canVAM ? 'bg-indigo-50 border-indigo-200' : 'bg-slate-50 border-gray-200 opacity-60'}`}>
           <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-black text-[#546e7a]">影视对赌协议 (VAM)</h3>
              {!canVAM && <span className="text-[8px] bg-slate-200 px-2 py-0.5 rounded-full uppercase">需[{AuthorRank.PLATINUM}]</span>}
           </div>
           {canVAM ? (
             <p className="text-[10px] text-indigo-600 font-bold">你已具备顶尖文坛影响力，可以参与高额影视版权分成与对赌。</p>
           ) : (
             <p className="text-[10px] text-gray-400 font-bold">锁定中。达成 {AuthorRank.PLATINUM} 后解锁资本化运作模式。</p>
           )}
        </div>

        <div className="space-y-4">
          <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">版权资产清单</h3>
          <div className="grid grid-cols-1 gap-3">
             {[...finishedNovels, activeNovel].filter(n => n && n.wordCount > 10000).map(novel => (
               novel && (
                 <div key={novel.id} className="flex items-center justify-between p-4 bg-white/40 border border-white rounded-2xl hover:bg-white transition-all group shadow-sm">
                   <div className="flex flex-col">
                      <span className="text-xs font-black text-[#546e7a]">{novel.title}</span>
                      <span className="text-[8px] text-gray-400 font-bold uppercase">完结字数 {Math.floor(novel.wordCount/10000)}w / 热度 {novel.heat}</span>
                   </div>
                   <button onClick={() => startIPNegotiation(novel)} disabled={isNegotiating} className="bg-[#fce4ec] text-[#f06292] text-[9px] font-black px-4 py-2 rounded-full disabled:opacity-30 active:scale-95 transition-all">
                     {isNegotiating ? "洽谈中" : "发起邀约"}
                   </button>
                 </div>
               )
             ))}
             {[...finishedNovels, activeNovel].filter(n => n && n.wordCount > 10000).length === 0 && (
               <div className="text-center py-12 text-gray-300 text-[10px] italic font-black">
                 暂无具备商业价值的作品 (需10,000字以上)
               </div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default IPCenter;
