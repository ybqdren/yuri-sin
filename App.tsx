
import React, { useState, useEffect } from 'react';
import { 
  PlayerStats, Novel, AuthorRank, ContractTier, AIConfig, 
  GameEvent, GameEventOption, MarketPrice
} from './types';
import { INITIAL_MARKET, IDENTITIES, STATUS_PATH, ACHIEVEMENTS } from './constants';
import { setGlobalAIConfig } from './services/geminiService';

// Sub-components
import StatsPanel from './components/StatsPanel';
import WritingCenter from './components/WritingCenter';
import FinanceCenter from './components/FinanceCenter';
import SocialCenter from './components/SocialCenter';
import LifeCenter from './components/LifeCenter';
import GatherCenter from './components/GatherCenter';
import ReputationCenter from './components/ReputationCenter';
import AchievementCenter from './components/AchievementCenter';
import IPCenter from './components/IPCenter';
import RankingCenter from './components/RankingCenter';
import PortfolioCenter from './components/PortfolioCenter';
import SettingsModal from './components/SettingsModal';
import EventModal from './components/EventModal';
import StockFloatingWindow from './components/StockFloatingWindow';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('writing');
  const [showSettings, setShowSettings] = useState(false);
  const [activeEvent, setActiveEvent] = useState<GameEvent | null>(null);
  const [finishedNovels, setFinishedNovels] = useState<Novel[]>([]);
  const [activeNovel, setActiveNovel] = useState<Novel | null>(null);
  const [market, setMarket] = useState<MarketPrice[]>(INITIAL_MARKET);
  const [nudgePosts, setNudgePosts] = useState([]);
  const [aiConfig, setAiConfig] = useState<AIConfig>({
    provider: 'gemini',
    apiKey: '',
    model: 'gemini-3-flash-preview'
  });

  const [stats, setStats] = useState<PlayerStats>({
    money: 5000, health: 100, stamina: 100, maxStamina: 100, writingSkill: 10, inspiration: 50, mood: 80,
    shards: 5, reputation: 0, day: 1, skills: [], collectedQuotes: [], houseLevel: 0, unlockedClothes: ['基础睡衣'],
    marketingPower: 10, unlockedTemplates: [], investmentAnxiety: 0, hasFinancialFreedom: false,
    portfolio: {}, unlockedAchievementIds: [], totalWordsWritten: 0, totalInvestmentProfit: 0,
    lockedChaptersCount: 0, totalSpent: 0, maxProfitSingleTrade: 0,
    fans: { passerby: 0, followers: 0, hardcore: 0, stans: 0, dramaFans: 0, visualFans: 0 },
    globalHeat: 0, contractTier: ContractTier.NONE, activeIPProjects: [], legacyIncome: 0, finishedCount: 0,
    rankings: { monthly: [], potential: [], richFans: [] }, marketNews: [],
    isCollateralizing: false, manipulationCooldown: 0, monthlyTickets: 0,
    consecutivePumps: 0, outOfCircleDays: 0, socialBannedDays: 0, lastDaySharedHobby: false,
    genreDecayModifiers: {}, lastMacroEventDay: 0,
    currentRank: AuthorRank.NOVICE,
    lastPostDay: 0,
    nudgePressure: 0,
    nudgeMessagesCount: 0,
    inspirationLibrary: []
  });

  useEffect(() => {
    const nextLevel = [...STATUS_PATH].reverse().find(l => stats.reputation >= l.threshold);
    if (nextLevel && nextLevel.rank !== stats.currentRank) {
      setStats(prev => ({ ...prev, currentRank: nextLevel.rank }));
    }
  }, [stats.reputation, stats.currentRank]);

  useEffect(() => {
    const allNovels = activeNovel ? [...finishedNovels, activeNovel] : finishedNovels;
    const newlyUnlocked = ACHIEVEMENTS.filter(a => 
      !stats.unlockedAchievementIds.includes(a.id) && a.criteria(stats, allNovels)
    );
    if (newlyUnlocked.length > 0) {
      setStats(prev => ({
        ...prev,
        unlockedAchievementIds: [...prev.unlockedAchievementIds, ...newlyUnlocked.map(a => a.id)]
      }));
    }
  }, [stats, activeNovel, finishedNovels]);

  useEffect(() => {
    setMarket(prev => prev.map(asset => {
      const volatility = asset.volatility;
      const change = (Math.random() - 0.5) * 2 * volatility;
      const newPrice = Math.max(0.01, asset.currentPrice * (1 + change));
      const newHistory = [...asset.history, newPrice].slice(-30);
      return { ...asset, currentPrice: newPrice, history: newHistory, sentiment: Math.floor((change / volatility) * 50) };
    }));
  }, [stats.day]);

  useEffect(() => {
    setGlobalAIConfig(aiConfig);
  }, [aiConfig]);

  const handleSaveConfig = (newConfig: AIConfig) => {
    setAiConfig(newConfig);
    setShowSettings(false);
  };

  const handleFinishNovel = (novel: Novel) => {
    setFinishedNovels(prev => [...prev, { ...novel, isFinished: true }]);
    setActiveNovel(null);
    setStats(prev => ({
      ...prev,
      finishedCount: prev.finishedCount + 1,
      reputation: prev.reputation + 2500,
    }));
  };

  const handleEventOption = (option: GameEventOption) => {
    setStats(prev => ({
      ...prev,
      money: prev.money + (option.impact.money || 0),
      reputation: prev.reputation + (option.impact.reputation || 0),
      stamina: prev.stamina + (option.impact.stamina || 0),
      mood: prev.mood + (option.impact.mood || 0),
      fans: { ...prev.fans, stans: prev.fans.stans + (option.impact.fansStans || 0) }
    }));
    setActiveEvent(null);
  };

  return (
    <div className="flex flex-col h-screen bg-[#faf7f2] font-sans text-[#455a64] overflow-hidden">
      {/* 状态栏固定 */}
      <header className="bg-white/95 backdrop-blur-md shrink-0 border-b border-gray-100 p-3 md:p-4 z-50 shadow-sm">
        <StatsPanel stats={stats} onOpenSettings={() => setShowSettings(true)} />
      </header>

      {/* 内容区域独立滚动 */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar bg-[#faf7f2]/50 relative">
        <div className="max-w-4xl mx-auto w-full min-h-full flex flex-col p-4 md:p-6">
          {activeTab === 'writing' && (
            <WritingCenter stats={stats} setStats={setStats} activeNovel={activeNovel} setActiveNovel={setActiveNovel} onFinishNovel={handleFinishNovel} finishedNovels={finishedNovels} />
          )}
          {activeTab === 'finance' && (
            <FinanceCenter stats={stats} setStats={setStats} activeNovel={activeNovel} market={market} setMarket={setMarket} finishedNovels={finishedNovels} onTriggerAIEvent={setActiveEvent} />
          )}
          {activeTab === 'social' && (
            <SocialCenter identity={IDENTITIES[0]} stats={stats} setStats={setStats} activeNovel={activeNovel} market={market} setMarket={setMarket} nudgePosts={nudgePosts} setNudgePosts={setNudgePosts} />
          )}
          {activeTab === 'life' && <LifeCenter stats={stats} setStats={setStats} />}
          {activeTab === 'gather' && <GatherCenter stats={stats} setStats={setStats} />}
          {activeTab === 'reputation' && <ReputationCenter stats={stats} />}
          {activeTab === 'achievement' && <AchievementCenter stats={stats} finishedNovels={finishedNovels} />}
          {activeTab === 'ip' && <IPCenter stats={stats} setStats={setStats} activeNovel={activeNovel} finishedNovels={finishedNovels} onTriggerAIEvent={setActiveEvent} />}
          {activeTab === 'ranking' && <RankingCenter stats={stats} setStats={setStats} activeNovel={activeNovel} />}
          {activeTab === 'portfolio' && <PortfolioCenter stats={stats} finishedNovels={finishedNovels} />}
        </div>
      </main>

      {/* 底部菜单固定并适配安全区 */}
      <nav className="bg-white/95 backdrop-blur-md border-t border-gray-100 shrink-0 z-50 shadow-[0_-2px_10px_rgba(0,0,0,0.02)]" style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 8px)' }}>
        <div className="max-w-4xl mx-auto flex justify-between gap-1 overflow-x-auto no-scrollbar px-3 py-2">
          {[
            { id: 'writing', icon: '✍️', label: '创作' },
            { id: 'finance', icon: '📈', label: '财富' },
            { id: 'social', icon: '📱', label: '社交' },
            { id: 'gather', icon: '✨', label: '取材' },
            { id: 'life', icon: '🏠', label: '生活' },
            { id: 'reputation', icon: '👑', label: '位格' },
            { id: 'achievement', icon: '🏆', label: '成就' },
            { id: 'ip', icon: '📀', label: '版权' },
            { id: 'ranking', icon: '📊', label: '榜单' },
            { id: 'portfolio', icon: '📖', label: '书架' },
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex flex-col items-center justify-center min-w-[58px] md:min-w-[68px] py-2 rounded-[1.2rem] transition-all active:scale-90 ${activeTab === tab.id ? 'bg-[#fce4ec] text-[#f06292] shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}>
              <span className="text-xl mb-1">{tab.icon}</span>
              <span className="text-[10px] font-black">{tab.label}</span>
            </button>
          ))}
        </div>
      </nav>

      {showSettings && <SettingsModal config={aiConfig} onSave={handleSaveConfig} onClose={() => setShowSettings(false)} />}
      {activeEvent && <EventModal event={activeEvent} onOptionClick={handleEventOption} onClose={() => setActiveEvent(null)} />}
      <StockFloatingWindow stats={stats} market={market} activeTab={activeTab} />
      {stats.stamina < 20 && <div className="stamina-low-fog" />}
    </div>
  );
};

export default App;
