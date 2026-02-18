
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { PlayerStats, Novel, SocialPost, FansStats, MarketPrice, Identity } from '../types';
import { generateNPCCuratorPost, generateNPCFinanceGuruPost } from '../services/geminiService';
import { SOCIAL_QUOTES_POOL } from '../constants';

interface SocialCenterProps {
  identity: Identity | null;
  stats: PlayerStats;
  setStats: React.Dispatch<React.SetStateAction<PlayerStats>>;
  activeNovel: Novel | null;
  market: MarketPrice[];
  setMarket: React.Dispatch<React.SetStateAction<MarketPrice[]>>;
  nudgePosts: SocialPost[];
  setNudgePosts: React.Dispatch<React.SetStateAction<SocialPost[]>>;
}

const SocialCenter: React.FC<SocialCenterProps> = ({ identity, stats, setStats, activeNovel, market, setMarket, nudgePosts, setNudgePosts }) => {
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showPostingPanel, setShowPostingPanel] = useState(false);

  const totalFans = useMemo(() => 
    stats.fans.passerby + stats.fans.followers + stats.fans.hardcore + stats.fans.stans,
  [stats.fans]);

  const stanRatio = useMemo(() => totalFans > 0 ? stats.fans.stans / totalFans : 0, [stats.fans, totalFans]);

  const loadFeed = useCallback(async () => {
    setIsRefreshing(true);
    const feedBatch: SocialPost[] = [];

    // 1. Regular User Posts
    const randomPosts: SocialPost[] = Array.from({ length: 2 }).map((_, i) => ({
      id: `mock_${Date.now()}_${i}`,
      platform: 'YURI_SPACE',
      content: SOCIAL_QUOTES_POOL[Math.floor(Math.random() * SOCIAL_QUOTES_POOL.length)],
      author: `姬友${Math.floor(Math.random() * 9000 + 1000)}`,
      likes: Math.floor(Math.random() * 1000),
      type: 'NEUTRAL',
      replyCount: Math.floor(Math.random() * 50)
    }));
    feedBatch.push(...randomPosts);

    // 2. NPC: The Curator (推书姬) - Triggered by Novel Heat/Quality
    if (activeNovel && stats.globalHeat > 200) {
      try {
        const content = await generateNPCCuratorPost(activeNovel);
        feedBatch.unshift({
          id: "curator_" + Date.now(),
          platform: 'NPC',
          npcRole: 'CURATOR',
          content,
          author: "圈内第一推书姬",
          likes: Math.floor(stats.globalHeat * 3),
          type: 'POSITIVE',
          replyCount: Math.floor(stats.globalHeat / 5),
          metadata: { noveltyId: activeNovel.id }
        });
      } catch (e) {}
    }

    // 3. NPC: Finance Guru (理财大神) - Triggered by Market Sentiment
    const hotAsset = market.find(a => Math.abs(a.sentiment) > 30) || market[Math.floor(Math.random() * market.length)];
    if (hotAsset) {
      try {
        const content = await generateNPCFinanceGuruPost(hotAsset);
        feedBatch.push({
          id: "guru_" + Date.now(),
          platform: 'NPC',
          npcRole: 'FINANCE_GURU',
          content,
          author: "资本老韭菜·沈老师",
          likes: 888,
          type: 'NEUTRAL',
          replyCount: 66,
          metadata: { assetName: hotAsset.name }
        });
      } catch (e) {}
    }

    setPosts(feedBatch);
    setIsRefreshing(false);
  }, [activeNovel, stats.globalHeat, market]);

  useEffect(() => {
    loadFeed();
  }, []);

  const handleNPCInteraction = (post: SocialPost, action: string) => {
    if (stats.stamina < 5) return;
    
    let message = "";
    if (post.npcRole === 'CURATOR') {
      setStats(s => ({ 
        ...s, 
        stamina: s.stamina - 5,
        outOfCircleDays: 2, 
        reputation: s.reputation + 200,
        fans: { ...s.fans, followers: s.fans.followers + 500 }
      }));
      message = "转发成功！作品热度持续攀升，获得‘出圈’状态 48 小时。";
    } else if (post.npcRole === 'FINANCE_GURU') {
      const assetName = post.metadata?.assetName;
      setMarket(prev => prev.map(a => a.name === assetName ? { ...a, sentiment: a.sentiment + 10 } : a));
      setStats(s => ({ ...s, stamina: s.stamina - 5, mood: s.mood + 10 }));
      message = `追随大神的脚步！“${assetName}”市场情绪微升，你的信心增强了。`;
    }

    alert(message);
    setPosts(prev => prev.filter(p => p.id !== post.id));
  };

  const handlePostAction = (type: 'TEASE' | 'BRAG' | 'SHARE' | 'INTERACT' | 'VOTE' | 'PLAY_DEAD' | 'LEAVE_NOTE') => {
    if (stats.stamina < 15 && type !== 'PLAY_DEAD') return;
    if (stats.socialBannedDays > 0) return;

    let deltaFans: Partial<FansStats> = {};
    let deltaHeat = 0;
    let deltaMood = 0;
    let deltaWS = 0;
    let deltaRep = 0;
    let deltaStamina = -15;
    let message = "";

    switch(type) {
      case 'TEASE':
        const stanConflictMultiplier = stanRatio > 0.2 ? 2.0 : 1.0;
        deltaHeat = 5000 * stanConflictMultiplier;
        deltaFans = { stans: 50, passerby: -100 };
        deltaMood = -15;
        message = `发刀片预告！全网哀嚎，热度 +${deltaHeat.toLocaleString()}！`;
        break;
      case 'BRAG':
        deltaHeat = 200;
        deltaFans = { followers: 500, passerby: 500 };
        deltaMood = 30;
        message = "晒出理财曲线！新人作者们直呼大佬，粉丝大涨！";
        break;
      case 'SHARE':
        deltaHeat = 100;
        deltaFans = { followers: 1000 };
        deltaMood = 10;
        deltaWS = 2;
        message = "分享百合创作心得！写作技巧 +2，今日忠实粉丝不再流失。";
        setStats(s => ({ ...s, lastDaySharedHobby: true }));
        break;
      case 'INTERACT':
        deltaHeat = 500;
        const converted = Math.floor(stats.fans.followers * 0.2);
        deltaFans = { hardcore: converted, followers: -converted };
        message = `积极互动！${converted} 名忠实粉丝升级为铁粉！`;
        break;
      case 'VOTE':
        if (stats.reputation < 200) return;
        deltaHeat = 1000;
        const ticketGain = Math.floor(stats.fans.hardcore * 0.1);
        if (activeNovel) {
          setStats(s => ({ ...s, reputation: s.reputation - 200, monthlyTickets: s.monthlyTickets + ticketGain }));
        }
        message = `公开催票！获得铁粉投递的 ${ticketGain} 张月票！`;
        break;
      case 'PLAY_DEAD':
        deltaRep = -100;
        deltaStamina = 0;
        setStats(s => ({ ...s, nudgePressure: s.nudgePressure * 0.5, nudgeMessagesCount: 0 }));
        setNudgePosts([]);
        message = "装死：屏蔽催更信息。压力锐减，但名望小幅下降。";
        break;
      case 'LEAVE_NOTE':
        deltaStamina = -20;
        deltaMood = 15;
        deltaFans = { passerby: -500 };
        setStats(s => ({ ...s, nudgePressure: 0, nudgeMessagesCount: 0 }));
        setNudgePosts([]);
        message = "挂请假条：压力平息，心情好转，但路人粉丝流失。";
        break;
    }

    setStats(prev => ({
      ...prev,
      stamina: Math.max(0, prev.stamina + deltaStamina),
      mood: Math.max(0, Math.min(100, prev.mood + deltaMood)),
      globalHeat: prev.globalHeat + deltaHeat,
      writingSkill: prev.writingSkill + deltaWS,
      reputation: Math.max(0, prev.reputation + deltaRep),
      fans: {
        ...prev.fans,
        passerby: Math.max(0, prev.fans.passerby + (deltaFans.passerby || 0)),
        followers: Math.max(0, prev.fans.followers + (deltaFans.followers || 0)),
        hardcore: Math.max(0, prev.fans.hardcore + (deltaFans.hardcore || 0)),
        stans: Math.max(0, prev.fans.stans + (deltaFans.stans || 0)),
      }
    }));

    setShowPostingPanel(false);
    alert(message);
  };

  const pumpMarket = (assetName: string) => {
    if (stats.socialBannedDays > 0) return;
    let sentimentBoost = 5;
    if (stats.reputation >= 20000) sentimentBoost = 80;
    else if (stats.reputation >= 5000) sentimentBoost = 30;

    const isOverdue = stats.manipulationCooldown > 0;
    const penaltyChance = isOverdue ? 0.7 : 0.05;
    const isBanned = Math.random() < penaltyChance;

    if (isBanned) {
      setStats(prev => ({
        ...prev,
        socialBannedDays: 3,
        marketNews: [...prev.marketNews, { id: Date.now().toString(), impact: 'NEGATIVE', text: `疑似通过声望操纵“${assetName}”股价，账号禁言 3 天！` }]
      }));
      setMarket(prev => prev.map(a => a.name === assetName ? { ...a, sentiment: a.sentiment - 50 } : a));
      setShowPostingPanel(false);
      alert("⚠️ 非法操纵警告！账号禁言 3 天。");
      return;
    }

    setMarket(prev => prev.map(a => a.name === assetName ? { ...a, sentiment: a.sentiment + sentimentBoost } : a));
    setStats(prev => ({
      ...prev,
      manipulationCooldown: 12,
      reputation: Math.max(0, prev.reputation - 500),
      marketNews: [...prev.marketNews, { id: Date.now().toString(), impact: 'POSITIVE', text: `大手安利“${assetName}”，核心粉丝热情高涨！` }]
    }));
    setShowPostingPanel(false);
    alert(`护盘成功！ sentiment +${sentimentBoost}。`);
  };

  const allPosts = useMemo(() => {
    return [...nudgePosts, ...posts].sort((a, b) => {
      const aId = parseInt(a.id.split('_')[1]);
      const bId = parseInt(b.id.split('_')[1]);
      return bId - aId;
    });
  }, [posts, nudgePosts]);

  return (
    <div className="flex-1 flex flex-col h-full gap-4 overflow-hidden animate-in fade-in duration-700">
      <div className="shrink-0 glass-card rounded-[2.5rem] p-5 border-white shadow-sm flex flex-col gap-4 relative">
        {stats.socialBannedDays > 0 && (
          <div className="absolute inset-0 z-50 bg-slate-900/60 backdrop-blur-md rounded-[2.5rem] flex items-center justify-center text-white text-center p-4">
             <div className="space-y-2">
                <span className="text-3xl">🚫</span>
                <p className="font-black text-xs">账号禁言中 ({stats.socialBannedDays}天)</p>
             </div>
          </div>
        )}
        
        {stats.outOfCircleDays > 0 && (
          <div className="absolute -top-2 -right-2 z-40 bg-gradient-to-r from-amber-400 to-orange-500 text-white px-3 py-1 rounded-full shadow-lg animate-bounce">
             <span className="text-[8px] font-black uppercase tracking-widest">🔥 出圈中</span>
          </div>
        )}

        {stats.nudgePressure > 100 && (
          <div className="absolute -top-2 -left-2 z-40 bg-rose-500 text-white px-3 py-1 rounded-full shadow-lg animate-pulse">
             <span className="text-[8px] font-black uppercase tracking-widest">⚠️ 被催更中</span>
          </div>
        )}

        <div className="flex justify-between items-start">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#f8bbd0] to-[#f06292] flex items-center justify-center text-3xl shadow-inner border-2 border-white">
              🎨
            </div>
            <div className="flex flex-col">
              <h2 className="text-xl font-black text-[#546e7a]">社交主页</h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="px-2 py-0.5 bg-[#fce4ec] text-[#f06292] text-[8px] font-black rounded-full uppercase tracking-widest">
                  LV.{Math.floor(stats.reputation / 1000)}
                </span>
                <span className="text-[10px] text-gray-400 font-bold">全网热度: {Math.floor(stats.globalHeat)}</span>
              </div>
            </div>
          </div>
          <button 
            disabled={stats.socialBannedDays > 0}
            onClick={() => setShowPostingPanel(true)}
            className="w-10 h-10 bg-[#f06292] text-white rounded-full flex items-center justify-center shadow-lg active:scale-95 transition-all disabled:opacity-30"
          >
            <span className="text-xl">✍️</span>
          </button>
        </div>

        <div className="grid grid-cols-4 gap-2">
          {[
            { label: '路人', val: stats.fans.passerby, color: 'text-gray-400', icon: '👤' },
            { label: '忠实', val: stats.fans.followers, color: 'text-blue-400', icon: '💎' },
            { label: '铁粉', val: stats.fans.hardcore, color: 'text-[#f06292]', icon: '🔥' },
            { label: '激进', val: stats.fans.stans, color: 'text-orange-500', icon: '⚔️' }
          ].map(item => (
            <div key={item.label} className="bg-white/40 p-2 rounded-2xl flex flex-col items-center border border-white/50">
              <span className="text-xs mb-1">{item.icon}</span>
              <span className={`text-[10px] font-black ${item.color}`}>{item.val.toLocaleString()}</span>
              <span className="text-[7px] text-gray-300 font-black uppercase mt-0.5">{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      {showPostingPanel && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="glass-card w-full max-w-sm rounded-[2.5rem] p-8 flex flex-col gap-6 shadow-2xl border-white border-2 overflow-y-auto no-scrollbar max-h-[90vh]">
             <div className="text-center">
                <h3 className="text-xl font-black text-[#546e7a]">社交营业</h3>
             </div>
             <div className="grid grid-cols-2 gap-4">
                <button onClick={() => handlePostAction('TEASE')} className="flex flex-col items-center gap-2 p-4 bg-orange-50 rounded-3xl border border-orange-100">
                  <span className="text-2xl">🔪</span>
                  <span className="text-[10px] font-black text-orange-600">发刀预告</span>
                </button>
                <button onClick={() => handlePostAction('BRAG')} className="flex flex-col items-center gap-2 p-4 bg-emerald-50 rounded-3xl border border-emerald-100">
                  <span className="text-2xl">💰</span>
                  <span className="text-[10px] font-black text-emerald-600">晒收益</span>
                </button>
                <button onClick={() => handlePostAction('SHARE')} className="flex flex-col items-center gap-2 p-4 bg-blue-50 rounded-3xl border border-blue-100">
                  <span className="text-2xl">💡</span>
                  <span className="text-[10px] font-black text-blue-600">分享心得</span>
                </button>
                <button onClick={() => handlePostAction('INTERACT')} className="flex flex-col items-center gap-2 p-4 bg-pink-50 rounded-3xl border border-pink-100">
                  <span className="text-2xl">💬</span>
                  <span className="text-[10px] font-black text-[#f06292]">评论互动</span>
                </button>
                
                {/* Pressure Handling Actions */}
                <button onClick={() => handlePostAction('PLAY_DEAD')} className="flex flex-col items-center gap-2 p-4 bg-gray-100 rounded-3xl border border-gray-200">
                  <span className="text-2xl">💀</span>
                  <span className="text-[10px] font-black text-gray-500">原地装死</span>
                </button>
                <button onClick={() => handlePostAction('LEAVE_NOTE')} className="flex flex-col items-center gap-2 p-4 bg-amber-50 rounded-3xl border border-amber-200">
                  <span className="text-2xl">📝</span>
                  <span className="text-[10px] font-black text-amber-600">挂请假条</span>
                </button>

                <button onClick={() => handlePostAction('VOTE')} className="flex flex-col items-center gap-2 p-4 bg-amber-50 rounded-3xl border border-amber-100 col-span-2">
                  <span className="text-2xl">🎫</span>
                  <span className="text-[10px] font-black text-amber-600">公开催票</span>
                </button>
             </div>

             <div className="border-t border-gray-100 pt-4">
                <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-3 text-center">舆论护盘</span>
                <div className="grid grid-cols-1 gap-2">
                   {market.filter(a => (stats.portfolio[a.name] || 0) > 0).map(a => (
                      <button key={a.name} onClick={() => pumpMarket(a.name)} className="w-full py-3 bg-slate-100 rounded-2xl text-[10px] font-black text-[#546e7a] hover:bg-[#f06292] hover:text-white transition-all flex justify-between px-6">
                        <span>安利：{a.name}</span>
                        <span className="opacity-50">(-500声望)</span>
                      </button>
                   ))}
                </div>
             </div>

             <button onClick={() => setShowPostingPanel(false)} className="py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">取消</button>
          </div>
        </div>
      )}

      <div className="flex-1 glass-card rounded-[2.5rem] p-4 overflow-y-auto no-scrollbar relative flex flex-col gap-4">
        <div className="flex justify-between items-center px-2 mb-2">
           <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic">YuriSpace Feed</span>
           <button onClick={loadFeed} className="text-[10px] text-[#f06292] font-black">刷新</button>
        </div>
        
        {isRefreshing ? (
          <div className="flex-1 flex items-center justify-center animate-pulse">
            <span className="text-xs font-black text-gray-300 italic">同步世界线...</span>
          </div>
        ) : (
          allPosts.map(post => (
            <div key={post.id} className={`p-5 rounded-[2rem] border flex flex-col gap-3 shadow-sm transition-all animate-in slide-in-from-top-2 ${
              post.platform === 'NUDGE' ? 'bg-rose-50 border-rose-100' : 
              post.platform === 'NPC' ? 'bg-[#f8f9fb] border-[#e3f2fd]' : 'bg-white/60 border-white/50'
            }`}>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm shadow-inner ${
                    post.platform === 'NUDGE' ? 'bg-rose-200' :
                    post.npcRole === 'CURATOR' ? 'bg-pink-100' : post.npcRole === 'FINANCE_GURU' ? 'bg-emerald-100' : 'bg-slate-100'
                  }`}>
                    {post.platform === 'NUDGE' ? '📢' : post.npcRole === 'CURATOR' ? '🎀' : post.npcRole === 'FINANCE_GURU' ? '📈' : '👤'}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-black text-[#546e7a]">{post.author}</span>
                    <span className="text-[8px] text-gray-400 font-bold uppercase tracking-wider">
                      {post.platform === 'NUDGE' ? '在线催更中' : post.npcRole === 'CURATOR' ? '认证推书号' : post.npcRole === 'FINANCE_GURU' ? '理财分析师' : '刚刚'}
                    </span>
                  </div>
                </div>
                {post.platform === 'NUDGE' && (
                  <span className="text-[7px] font-black bg-rose-500 text-white px-2 py-0.5 rounded-full uppercase">Urgent</span>
                )}
              </div>
              <p className={`text-xs font-bold leading-relaxed pl-1 whitespace-pre-wrap ${post.platform === 'NUDGE' ? 'text-rose-700' : 'text-[#455a64]'}`}>
                {post.content}
              </p>
              
              {post.platform === 'NPC' ? (
                <div className="flex gap-2 mt-2">
                  <button onClick={() => handleNPCInteraction(post, 'FOLLOW')} className="flex-1 py-2 bg-[#546e7a] text-white text-[9px] font-black rounded-full active:scale-95 transition-all">
                    {post.npcRole === 'CURATOR' ? '转发并感谢' : '关注动态'} (-5⚡)
                  </button>
                </div>
              ) : post.platform === 'NUDGE' ? (
                <div className="flex gap-2 mt-2">
                  <button onClick={() => alert("装死大法好！消息已读不回。")} className="flex-1 py-2 bg-gray-200 text-gray-600 text-[9px] font-black rounded-full">装死</button>
                  <button onClick={() => handlePostAction('LEAVE_NOTE')} className="flex-1 py-2 bg-rose-500 text-white text-[9px] font-black rounded-full">发假条安抚</button>
                </div>
              ) : (
                <div className="flex gap-4 mt-2 px-1">
                  <button className="text-[10px] text-gray-400 font-bold hover:text-[#f06292]">点赞</button>
                  <button className="text-[10px] text-gray-400 font-bold hover:text-blue-400">转发</button>
                  <button onClick={() => { if(stats.stamina >= 2) setStats(s => ({ ...s, stamina: s.stamina - 2, fans: { ...s.fans, followers: s.fans.followers + 1 } })); }} className="text-[10px] text-[#f06292] font-black bg-[#fce4ec] px-3 py-1 rounded-full active:scale-95">互动 (-2⚡)</button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
      <div className="h-4" />
    </div>
  );
};

export default SocialCenter;
