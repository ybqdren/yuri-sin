
import React from 'react';
import { PlayerStats, InventoryItem } from '../types';
import { SHOP_ITEMS, SURVIVAL_COSTS } from '../constants';

interface LifeCenterProps {
  stats: PlayerStats;
  setStats: React.Dispatch<React.SetStateAction<PlayerStats>>;
}

const EXTENDED_SHOP: InventoryItem[] = [
  ...SHOP_ITEMS,
  { id: 'cake', name: '精致甜点', type: 'FOOD', price: 120, icon: '🍰', description: '心情大好。心情+20，体力+10', effect: (s) => ({ ...s, mood: Math.min(100, s.mood + 20), stamina: Math.min(s.maxStamina, s.stamina + 10) }) },
  { id: 'outfit', name: '职场套装', type: 'CLOTHES', price: 800, icon: '👔', description: '名望+100，技巧+2%', effect: (s) => ({ ...s, reputation: s.reputation + 100, writingSkill: s.writingSkill * 1.02 }) },
  { id: 'trip', name: '近郊采风', type: 'TRAVEL', price: 2000, icon: '🎒', description: '灵感碎片+20，心情+30', effect: (s) => ({ ...s, shards: s.shards + 20, mood: Math.min(100, s.mood + 30) }) },
  { id: 'gym', name: '健身私教课', type: 'GEAR', price: 3000, icon: '💪', description: '体力上限+10', effect: (s) => ({ ...s, maxStamina: s.maxStamina + 10 }) },
];

const LifeCenter: React.FC<LifeCenterProps> = ({ stats, setStats }) => {
  const currentHouse = SURVIVAL_COSTS[stats.houseLevel] || SURVIVAL_COSTS[0];

  const buyItem = (item: InventoryItem) => {
    if (stats.money >= item.price) {
      setStats(prev => ({ 
        ...prev, 
        money: prev.money - item.price,
        totalSpent: prev.totalSpent + item.price,
        ...item.effect(prev) 
      }));
      alert(`已购买：${item.name}！`);
    } else {
      alert("资金不足！");
    }
  };

  const nextDay = () => {
    const rent = currentHouse.rent;
    setStats(prev => {
      const churnLoyalRate = prev.lastDaySharedHobby ? 1.0 : 0.99;
      const churnPasserbyRate = 0.85;
      const newPasserby = Math.max(0, prev.fans.passerby * churnPasserbyRate);
      const newFollowers = Math.max(0, prev.fans.followers * churnLoyalRate);
      if (prev.money < rent) {
        return { ...prev, day: prev.day + 1, stamina: 20, money: Math.max(0, prev.money + 400 - rent), mood: Math.max(0, prev.mood - 30), fans: { ...prev.fans, passerby: newPasserby, followers: newFollowers }, outOfCircleDays: Math.max(0, prev.outOfCircleDays - 1), socialBannedDays: Math.max(0, prev.socialBannedDays - 1), lastDaySharedHobby: false };
      }
      return { ...prev, day: prev.day + 1, stamina: Math.min(prev.maxStamina, prev.stamina + currentHouse.staminaRegen), mood: Math.min(100, prev.mood + 5), money: prev.money - rent, fans: { ...prev.fans, passerby: newPasserby, followers: newFollowers }, outOfCircleDays: Math.max(0, prev.outOfCircleDays - 1), socialBannedDays: Math.max(0, prev.socialBannedDays - 1), lastDaySharedHobby: false };
    });
  };

  return (
    <div className="flex flex-col gap-6 pb-20 animate-in fade-in duration-700">
      {/* 居所卡片 */}
      <div className="bg-gradient-to-br from-[#546e7a] to-[#37474f] rounded-[2rem] p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 text-8xl">🏠</div>
        <div className="relative z-10 space-y-4">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-black">{currentHouse.name}</h2>
            <span className="px-2 py-0.5 bg-white/20 text-white text-[8px] font-black rounded-full uppercase">LV.{stats.houseLevel}</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
             <div className="flex flex-col">
               <span className="text-[8px] font-black uppercase text-indigo-200">每日房租</span>
               <span className="text-sm font-black">¥{currentHouse.rent.toLocaleString()}</span>
             </div>
             <div className="flex flex-col">
               <span className="text-[8px] font-black uppercase text-indigo-200">休息恢复</span>
               <span className="text-sm font-black">+{currentHouse.staminaRegen}⚡</span>
             </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-2">购物清单 / SHOP</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {EXTENDED_SHOP.map(item => (
            <button 
              key={item.id}
              onClick={() => buyItem(item)}
              disabled={stats.money < item.price}
              className="bg-white/70 backdrop-blur-md rounded-3xl p-4 flex flex-col items-center justify-center text-center gap-2 border border-white shadow-sm transition-all active:scale-95 disabled:opacity-40"
            >
              <span className="text-3xl">{item.icon}</span>
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-[#546e7a]">{item.name}</span>
                <span className="text-[8px] text-gray-400 mt-0.5 line-clamp-2 leading-tight">{item.description}</span>
              </div>
              <span className="text-[10px] font-mono font-black text-emerald-500 mt-1">¥{item.price}</span>
            </button>
          ))}
        </div>
      </div>

      <button 
        onClick={nextDay}
        className="h-16 bg-[#546e7a] text-white rounded-[2rem] flex items-center justify-center gap-4 active:scale-95 transition-all shadow-xl hover:brightness-110"
      >
        <span className="text-2xl">🌙</span>
        <div className="flex flex-col items-start">
          <span className="text-sm font-black">休息至翌日</span>
          <span className="text-[9px] opacity-70">结算房租并大幅恢复体力</span>
        </div>
      </button>
    </div>
  );
};

export default LifeCenter;
