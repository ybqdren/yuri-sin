
export enum NovelGenre {
  DAILY = '日常',
  CAMPUS = '校园',
  TABOO = '禁忌',
  ABO = 'ABO',
  FANTASY = '玄幻',
  TRAGEDY = '虐文'
}

export enum NovelTendency {
  SWEET = '甜味',
  BITTER = '酸涩',
  SPICY = '火辣'
}

export enum NovelOrientation {
  ROMANCE = '言情',
  PURE_LOVE = '纯爱',
  YURI = '百合',
  DIVERSE = '多元'
}

// 统一位格枚举
export enum AuthorRank {
  NOVICE = '萌新写手',
  CONTRACTED = '签约作者',
  MID_TIER = '中坚力量',
  PLATINUM = '白金大神',
  LEGEND = '文坛泰斗'
}

export interface ChapterOutline {
  chapterNumber: number;
  title: string;
  goal: string;
  isModified: boolean;
}

export interface ButterflyImpact {
  staminaMod: number;
  heatMod: number;
  moodMod: number;
  fanBias: 'SWEET' | 'BITTER' | 'STANS' | 'LOGIC';
  marketEcho?: string;
}

export interface Novel {
  id: string;
  title: string;
  genre: NovelGenre;
  tendency: NovelTendency;
  orientation: NovelOrientation;
  wordCount: number;
  popularity: number;
  totalIncome: number;
  isFinished: boolean;
  reviews: string[];
  tension: number;
  quality: number;
  heat: number;
  controversy: number;
  fans: { organic: number; hardcore: number };
  monthlyTickets: number;
  outlines: ChapterOutline[];
  currentChapterIndex: number;
  activeInspiration?: string;
  legacyIncomeRate?: number; 
}

export interface PlayerStats {
  money: number;
  health: number;
  stamina: number;
  maxStamina: number;
  writingSkill: number;
  inspiration: number;
  mood: number;
  shards: number;
  reputation: number;
  day: number;
  skills: Skill[];
  collectedQuotes: InspirationQuote[];
  houseLevel: number;
  unlockedClothes: string[];
  marketingPower: number;
  unlockedTemplates: string[];
  investmentAnxiety: number;
  hasFinancialFreedom: boolean;
  portfolio: Record<string, number>;
  unlockedAchievementIds: string[];
  totalWordsWritten: number;
  totalInvestmentProfit: number;
  lockedChaptersCount: number;
  totalSpent: number;
  maxProfitSingleTrade: number;
  fans: FansStats;
  globalHeat: number;
  contractTier: ContractTier;
  activeIPProjects: IPProject[];
  legacyIncome: number;
  finishedCount: number;
  rankings: {
    monthly: RankingEntry[];
    potential: RankingEntry[];
    richFans: RankingEntry[];
  };
  marketNews: MarketNews[];
  isCollateralizing: boolean;
  manipulationCooldown: number;
  monthlyTickets: number;
  consecutivePumps: number;
  outOfCircleDays: number;
  socialBannedDays: number;
  lastDaySharedHobby: boolean;
  genreDecayModifiers: Record<string, number>;
  lastMacroEventDay: number;
  currentRank: AuthorRank; 
  lastPostDay: number;
  nudgePressure: number;
  nudgeMessagesCount: number;
  inspirationLibrary: string[];
}

export interface Skill { id: string; name: string; description: string; }
export interface FansStats { passerby: number; followers: number; hardcore: number; stans: number; dramaFans: number; visualFans: number; }

export interface MarketPrice { 
  name: string; 
  currentPrice: number; 
  history: number[]; 
  category: 'STABLE' | 'GROWTH' | 'SPEC'; 
  volatility: number; 
  description: string; 
  linkedGenre: NovelGenre; 
  sentiment: number;
  minRank: AuthorRank; 
}

export interface MarketNews { id: string; text: string; impact: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL'; }
export interface RankingEntry { rank: number; author: string; title: string; score: number; tickets: number; trend: 'UP' | 'DOWN' | 'STABLE'; isPlayer: boolean; }
export interface IPProject { id: string; name: string; valuation: number; progress: number; }
export interface GameEventOption { text: string; dialogue?: string; impact: { money?: number; reputation?: number; stamina?: number; mood?: number; fansStans?: number; }; }
export interface GameEvent { id: string; title: string; description: string; triggerDescription?: string; options: GameEventOption[]; marketEffect?: { targetAsset: string; bias: number; }; }
export interface InventoryItem { id: string; name: string; type: string; price: number; icon: string; description: string; effect: (stats: PlayerStats) => Partial<PlayerStats>; }

export interface StatusLevel { 
  id: number; 
  rank: AuthorRank; 
  threshold: number; 
  unlockedGenres: NovelGenre[]; 
  perks: string; 
  skills: Skill[]; 
}

export interface Achievement { id: string; title: string; description: string; category: AchievementCategory; icon: string; unlocked: boolean; rewardText: string; criteria: (stats: PlayerStats, novels: Novel[]) => boolean; }
export interface InspirationQuote { id: string; text: string; category: QuoteCategory; effectDescription: string; apply: (stats: PlayerStats, novel: Novel) => { stats: PlayerStats; novel: Novel }; }
export interface AIConfig { provider: 'deepseek' | 'gemini'; apiKey: string; baseUrl?: string; model?: string; }
export interface SocialPost { id: string; platform: 'YURI_SPACE' | 'NPC' | 'NUDGE'; npcRole?: 'CURATOR' | 'FINANCE_GURU' | 'READER'; content: string; author: string; likes: number; type: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL'; replyCount: number; metadata?: any; }
export interface Identity { type: 'TRANSPARENT' | 'PART_TIME' | 'NICHE'; name: string; description: string; initialFunds: number; initialFans: number; initialSkill: number; specialty: NovelGenre[]; startingSkill: Skill; initialHouse: number; }
export enum ContractTier { NONE = '无', LEVEL_1 = '常规签约', LEVEL_2 = '重点扶持', LEVEL_3 = '大神约' }
export enum AchievementCategory { WRITING = '创作', FINANCE = '金融', SOCIAL = '社交', ULTIMATE = '终极' }
export enum QuoteCategory { TENSION = '张力', PURE = '纯爱' }
