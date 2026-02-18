
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { PlayerStats, MarketPrice } from '../types';

interface StockFloatingWindowProps {
  stats: PlayerStats;
  market: MarketPrice[];
  activeTab: string;
}

const StockFloatingWindow: React.FC<StockFloatingWindowProps> = ({ stats, market, activeTab }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [position, setPosition] = useState({ x: window.innerWidth - 60, y: 80 });
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef<{ offsetX: number, offsetY: number } | null>(null);

  // Get active holdings
  const holdings = useMemo(() => {
    return Object.entries(stats.portfolio)
      .filter(([_, amount]) => (amount as number) > 0)
      .map(([name, amount]) => {
        const asset = market.find(m => m.name === name);
        const amountNum = amount as number;
        return {
          name,
          amount: amountNum,
          currentPrice: asset?.currentPrice || 0,
          value: (asset?.currentPrice || 0) * amountNum
        };
      });
  }, [stats.portfolio, market]);

  const totalValue = useMemo(() => holdings.reduce((sum, h) => sum + h.value, 0), [holdings]);

  // Handle Dragging
  const handleMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDragging(true);
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    dragRef.current = {
      offsetX: clientX - position.x,
      offsetY: clientY - position.y,
    };
  };

  useEffect(() => {
    const handleMove = (e: MouseEvent | TouchEvent) => {
      if (!isDragging || !dragRef.current) return;
      
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

      let newX = clientX - dragRef.current.offsetX;
      let newY = clientY - dragRef.current.offsetY;

      // Boundaries
      const padding = 10;
      const width = isExpanded ? 192 : 48;
      const height = isExpanded ? 200 : 48;
      
      newX = Math.max(padding, Math.min(window.innerWidth - width - padding, newX));
      newY = Math.max(padding + 64, Math.min(window.innerHeight - height - 80, newY));

      setPosition({ x: newX, y: newY });
    };

    const handleUp = () => {
      setIsDragging(false);
      dragRef.current = null;
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMove);
      window.addEventListener('mouseup', handleUp);
      window.addEventListener('touchmove', handleMove);
      window.addEventListener('touchend', handleUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleUp);
      window.removeEventListener('touchmove', handleMove);
      window.removeEventListener('touchend', handleUp);
    };
  }, [isDragging, isExpanded]);

  // Only show if there are holdings AND we're not on the finance tab
  if (holdings.length === 0 || activeTab === 'finance') return null;

  return (
    <div 
      className="fixed z-[150] touch-none select-none"
      style={{ left: position.x, top: position.y }}
    >
      {isExpanded ? (
        <div 
          className="glass-card w-48 rounded-2xl p-3 shadow-xl border border-white/80 overflow-hidden flex flex-col gap-2 cursor-grab active:cursor-grabbing"
          onMouseDown={handleMouseDown}
          onTouchStart={handleMouseDown}
        >
          <div className="flex justify-between items-center mb-1 border-b border-gray-100/50 pb-1">
            <span className="text-[10px] font-black text-[#546e7a]">实时持仓 (可拖动)</span>
            <button 
              onMouseDown={(e) => e.stopPropagation()} 
              onTouchStart={(e) => e.stopPropagation()}
              onClick={() => setIsExpanded(false)} 
              className="text-[10px] text-gray-400 hover:text-rose-400 transition-colors"
            >
              收起
            </button>
          </div>
          
          <div className="max-h-32 overflow-y-auto custom-scrollbar flex flex-col gap-2 pointer-events-auto">
            {holdings.map(h => (
              <div key={h.name} className="flex flex-col bg-white/30 p-1.5 rounded-lg border border-white/20">
                <div className="flex justify-between items-center">
                  <span className="text-[9px] font-bold text-[#455a64] truncate w-24">{h.name}</span>
                  <span className="text-[9px] font-mono font-black text-[#546e7a]">{h.currentPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-baseline mt-0.5">
                   <span className="text-[7px] text-gray-400 font-bold">{h.amount} 股</span>
                   <span className="text-[8px] font-mono font-bold text-emerald-500">¥{Math.floor(h.value).toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-gray-100/50 flex justify-between items-center">
             <span className="text-[8px] font-black text-gray-400 uppercase">总资产</span>
             <span className="text-[10px] font-mono font-black text-[#f06292]">¥{Math.floor(totalValue).toLocaleString()}</span>
          </div>
        </div>
      ) : (
        <button 
          onMouseDown={handleMouseDown}
          onTouchStart={handleMouseDown}
          onClick={() => { if (!isDragging) setIsExpanded(true); }}
          className="w-12 h-12 rounded-full glass-card shadow-lg flex flex-col items-center justify-center border border-white/80 active:scale-95 transition-all group cursor-grab active:cursor-grabbing"
        >
          <span className="text-lg">📈</span>
          <span className="text-[7px] font-black text-[#546e7a] group-hover:text-[#f06292] mt-0.5">盯着呢</span>
        </button>
      )}
    </div>
  );
};

export default StockFloatingWindow;
