
import React from 'react';
import { PlayerStats, Novel } from '../types';

interface PortfolioCenterProps {
  stats: PlayerStats;
  finishedNovels: Novel[];
}

const PortfolioCenter: React.FC<PortfolioCenterProps> = ({ stats, finishedNovels }) => {
  return (
    <div className="flex-1 flex flex-col h-full gap-4 overflow-hidden animate-in fade-in duration-700">
      {/* Header Info */}
      <div className="flex justify-between items-center px-1 shrink-0">
        <h2 className="text-xl font-black text-[#546e7a] italic">完结殿堂 / PORTFOLIO</h2>
        <div className="flex items-center gap-2">
           <span className="text-[10px] font-black text-[#f06292]">遗产收益: ¥{Math.floor(stats.legacyIncome)}/日</span>
        </div>
      </div>

      {/* Bookshelf Layout */}
      <div className="flex-1 glass-card rounded-[2.5rem] p-6 overflow-y-auto no-scrollbar relative flex flex-col gap-6">
        {finishedNovels.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {finishedNovels.map((novel) => (
              <div key={novel.id} className="group flex flex-col gap-2 animate-in zoom-in duration-500">
                <div className="aspect-[3/4] bg-white rounded-2xl shadow-sm border border-white overflow-hidden relative group-hover:shadow-xl transition-all group-hover:-translate-y-2">
                   {/* Book Spine Style */}
                   <div className="absolute inset-0 bg-gradient-to-r from-black/5 via-transparent to-transparent pointer-events-none" />
                   <div className="h-full w-full p-4 flex flex-col justify-between items-center text-center">
                      <div className="flex flex-col items-center">
                         <span className="text-[7px] font-black text-[#b0bec5] uppercase tracking-widest mb-1">{novel.genre}</span>
                         <h4 className="text-[10px] font-black text-[#546e7a] leading-tight">{novel.title}</h4>
                      </div>
                      <div className="flex flex-col items-center">
                         <span className="text-[8px] font-mono font-black text-[#f06292]">{Math.floor(novel.wordCount/10000)}w Words</span>
                      </div>
                   </div>
                   {/* Legacy Tag */}
                   <div className="absolute top-2 right-2 bg-[#f06292] text-white text-[7px] font-black px-1.5 py-0.5 rounded-full shadow-sm">
                     FIN
                   </div>
                </div>
                
                <div className="flex flex-col items-center opacity-0 group-hover:opacity-100 transition-opacity">
                   <span className="text-[8px] text-gray-400 font-bold">最终热度: {novel.heat}</span>
                   <span className="text-[8px] text-emerald-500 font-bold">收益率: {((novel.legacyIncomeRate || 0) * 100).toFixed(1)}%</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center opacity-30 select-none">
             <span className="text-6xl mb-4">📖</span>
             <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic leading-relaxed">
               虚位以待<br/>等待第一部伟大的百合作品
             </p>
          </div>
        )}
      </div>

      {/* Legacy Buffs Summary */}
      <div className="shrink-0 p-5 bg-[#546e7a] text-white rounded-[2rem] flex justify-around items-center shadow-lg">
         <div className="flex flex-col items-center">
            <span className="text-[10px] opacity-60 font-black uppercase">名家效应</span>
            <span className="text-sm font-black">笔力 +{stats.finishedCount * 5}</span>
         </div>
         <div className="w-px h-8 bg-white/20" />
         <div className="flex flex-col items-center">
            <span className="text-[10px] opacity-60 font-black uppercase">读者基础</span>
            <span className="text-sm font-black">初始粉 +{stats.finishedCount * 200}</span>
         </div>
         <div className="w-px h-8 bg-white/20" />
         <div className="flex flex-col items-center">
            <span className="text-[10px] opacity-60 font-black uppercase">完结作品</span>
            <span className="text-sm font-black">{stats.finishedCount}</span>
         </div>
      </div>
      <div className="h-2" />
    </div>
  );
};

export default PortfolioCenter;
