
import React, { useState, useEffect, useMemo } from 'react';
import { PlayerStats, MarketPrice, Novel, GameEvent, AuthorRank } from '../types';
import { ResponsiveContainer, AreaChart, Area, Tooltip, XAxis, YAxis, CartesianGrid } from 'recharts';

interface FinanceCenterProps {
  stats: PlayerStats;
  setStats: React.Dispatch<React.SetStateAction<PlayerStats>>;
  activeNovel: Novel | null;
  market: MarketPrice[];
  setMarket: React.Dispatch<React.SetStateAction<MarketPrice[]>>;
  finishedNovels: Novel[];
  onTriggerAIEvent: (ev: GameEvent) => void;
}

const RANK_WEIGHTS: Record<AuthorRank, number> = {
  [AuthorRank.NOVICE]: 0,
  [AuthorRank.CONTRACTED]: 1,
  [AuthorRank.MID_TIER]: 2,
  [AuthorRank.PLATINUM]: 3,
  [AuthorRank.LEGEND]: 4,
};

const FinanceCenter: React.FC<FinanceCenterProps> = ({ stats, setStats, activeNovel, market, setMarket, finishedNovels, onTriggerAIEvent }) => {
  const [selectedAssetName, setSelectedAssetName] = useState<string | null>(market[0]?.name || null);
  const [tradeShares, setTradeShares] = useState<number>(10);

  const currentRankWeight = RANK_WEIGHTS[stats.currentRank] || 0;

  useEffect(() => {
    if (!selectedAssetName && market.length > 0) setSelectedAssetName(market[0].name);
  }, [market, selectedAssetName]);

  const selectedAsset = useMemo(() => market.find(m => m.name === selectedAssetName), [market, selectedAssetName]);
  const isSelectedLocked = selectedAsset ? RANK_WEIGHTS[selectedAsset.minRank] > currentRankWeight : false;

  const trade = (type: 'BUY' | 'SELL', customShares?: number) => {
    if (!selectedAsset || isSelectedLocked) return;

    const shares = customShares !== undefined ? customShares : tradeShares;
    if (type === 'BUY') {
      const cost = shares * selectedAsset.currentPrice;
      if (stats.money >= cost) {
        setStats(s => ({ 
          ...s, 
          money: s.money - cost, 
          portfolio: { ...s.portfolio, [selectedAsset.name]: (s.portfolio[selectedAsset.name] || 0) + shares } 
        }));
      } else {
        alert("资金不足！");
      }
    } else {
      const held = stats.portfolio[selectedAsset.name] || 0;
      const toSell = Math.min(shares, held);
      if (toSell > 0) {
        const profit = toSell * selectedAsset.currentPrice;
        setStats(s => ({ 
          ...s, 
          money: s.money + profit, 
          totalInvestmentProfit: s.totalInvestmentProfit + profit,
          maxProfitSingleTrade: Math.max(s.maxProfitSingleTrade, profit),
          portfolio: { ...s.portfolio, [selectedAsset.name]: held - toSell } 
        }));
      }
    }
  };

  const chartData = useMemo(() => {
    // 增加数据完整性校验
    if (!selectedAsset || !selectedAsset.history.length) return [];
    return selectedAsset.history.map((val, i) => ({ 
      time: i, 
      price: parseFloat(val.toFixed(4)) 
    }));
  }, [selectedAsset, selectedAsset?.history]);

  return (
    <div className="flex-1 flex flex-col h-full gap-4 overflow-hidden animate-in fade-in duration-700">
      {/* 顶部行情跑马灯 */}
      <div className="h-10 bg-[#546e7a] text-white flex items-center rounded-xl px-4 relative shrink-0 overflow-hidden">
        <span className="text-[10px] font-black uppercase tracking-widest z-10 bg-[#546e7a] pr-4">文坛风向:</span>
        <div className="flex-1 whitespace-nowrap animate-marquee flex gap-12">
          {stats.marketNews.length > 0 ? (
            stats.marketNews.map(n => <span key={n.id} className={`text-[10px] font-black ${n.impact === 'POSITIVE' ? 'text-emerald-300' : 'text-rose-300'}`}>{n.text}</span>)
          ) : (
            <span className="text-[10px] font-black text-gray-400">当前资本情绪平稳。</span>
          )}
        </div>
      </div>

      {/* 资产选择器 */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar shrink-0 px-1 py-1">
        {market.map(asset => {
          const isLocked = RANK_WEIGHTS[asset.minRank] > currentRankWeight;
          const isSelected = selectedAssetName === asset.name;
          
          return (
            <button 
              key={asset.name} 
              onClick={() => setSelectedAssetName(asset.name)} 
              className={`min-w-[130px] p-4 rounded-2xl glass-card border relative overflow-hidden transition-all active:scale-95 ${
                isSelected ? 'border-[#f06292] bg-white shadow-md' : 'border-transparent opacity-70'
              }`}
            >
              {isLocked && (
                <div className="absolute inset-0 bg-slate-900/10 backdrop-blur-[2px] flex flex-col items-center justify-center z-10">
                   <span className="text-sm">🔒</span>
                   <span className="text-[8px] font-black text-[#546e7a] mt-1 uppercase">需 {asset.minRank}</span>
                </div>
              )}
              <div className="flex flex-col gap-1">
                <div className="text-[9px] font-black text-gray-400 truncate uppercase">{asset.name}</div>
                <div className="text-sm font-mono font-black text-[#455a64] flex items-baseline gap-1">
                   {asset.currentPrice.toFixed(2)}
                   <span className={`text-[8px] ${asset.sentiment >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                     {asset.sentiment > 0 ? '↑' : asset.sentiment < 0 ? '↓' : ''}
                   </span>
                </div>
              </div>
              {isSelected && !isLocked && <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#f06292]" />}
            </button>
          );
        })}
      </div>

      {/* 图表主区域 */}
      <div className="flex-1 glass-card rounded-[2.5rem] p-6 relative overflow-hidden flex flex-col shadow-inner bg-white/40 min-h-[250px]">
        {isSelectedLocked ? (
          <div className="h-full w-full flex flex-col items-center justify-center text-center p-8 space-y-4">
             <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-3xl animate-bounce">🔐</div>
             <div className="space-y-1">
                <h3 className="text-sm font-black text-[#546e7a] uppercase">板块受限</h3>
                <p className="text-[10px] text-gray-400 leading-relaxed">
                  位格未达：<span className="text-[#f06292] font-black">[{selectedAsset?.minRank}]</span>。<br/>
                  请通过创作完结作品提升声望。
                </p>
             </div>
          </div>
        ) : (
          <div className="flex-1 relative w-full h-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f06292" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#f06292" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                <XAxis dataKey="time" hide />
                <YAxis domain={['auto', 'auto']} tick={{fontSize: 10, fill: '#90a4ae'}} axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ borderRadius: '1.5rem', border: 'none', boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1)', fontSize: '10px', fontWeight: 'bold' }}
                  labelStyle={{ display: 'none' }}
                />
                <Area type="monotone" dataKey="price" stroke="#f06292" fillOpacity={1} fill="url(#colorPrice)" strokeWidth={3} isAnimationActive={true} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
        
        {selectedAsset && !isSelectedLocked && (
          <div className="mt-4 flex justify-between items-end shrink-0">
            <div className="flex flex-col">
              <span className="text-[10px] text-gray-400 font-bold uppercase">持仓：{stats.portfolio[selectedAsset.name] || 0}</span>
              <p className="text-[9px] text-[#90a4ae] italic mt-1 max-w-[200px]">{selectedAsset.description}</p>
            </div>
            <div className="text-right">
              <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest block mb-1">位格情绪</span>
              <div className={`text-2xl font-mono font-black ${selectedAsset.sentiment >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                {selectedAsset.sentiment > 0 ? '+' : ''}{selectedAsset.sentiment}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 交易面板 */}
      <div className={`flex flex-col gap-3 p-5 rounded-[2.5rem] border transition-all shrink-0 ${isSelectedLocked ? 'opacity-30 pointer-events-none grayscale' : 'bg-white/60 border-white'}`}>
        <div className="flex justify-between items-center px-2">
          <div className="flex flex-col">
            <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">交易规模</span>
            <span className="text-[11px] font-mono font-black text-[#546e7a]">预计支出: ¥{(tradeShares * (selectedAsset?.currentPrice || 0)).toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-4 bg-gray-100 rounded-full px-4 py-2 shadow-inner">
            <button onClick={() => setTradeShares(Math.max(1, tradeShares - 10))} className="text-[#f06292] font-black w-4">-</button>
            <input type="number" value={tradeShares} onChange={e => setTradeShares(Math.max(1, parseInt(e.target.value) || 1))} className="w-12 bg-transparent text-xs font-mono font-black outline-none text-center" />
            <button onClick={() => setTradeShares(tradeShares + 10)} className="text-[#f06292] font-black w-4">+</button>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <button onClick={() => trade('BUY')} className="h-14 bg-emerald-500 text-white text-[11px] font-black rounded-2xl shadow-lg active:scale-95 transition-all">买入 / BUY</button>
          <button onClick={() => trade('SELL')} className="h-14 bg-rose-500 text-white text-[11px] font-black rounded-2xl shadow-lg active:scale-95 transition-all">卖出 / SELL</button>
        </div>
      </div>
    </div>
  );
};

export default FinanceCenter;
