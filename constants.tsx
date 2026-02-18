
import { InventoryItem, StatusLevel, NovelGenre, InspirationQuote, QuoteCategory, MarketPrice, Achievement, AchievementCategory, Identity, AuthorRank } from './types';

// 生成初始历史数据的辅助函数
const generateInitialHistory = (base: number, count: number, vol: number) => {
  let price = base;
  const history = [];
  for (let i = 0; i < count; i++) {
    price = price * (1 + (Math.random() - 0.5) * vol);
    history.push(price);
  }
  return history;
};

export const STATUS_PATH: StatusLevel[] = [
  { 
    id: 0, 
    rank: AuthorRank.NOVICE, 
    threshold: 0, 
    unlockedGenres: [NovelGenre.DAILY, NovelGenre.CAMPUS], 
    perks: '生存是第一要务。只能在码字区进行低强度创作。', 
    skills: [] 
  },
  { 
    id: 1, 
    rank: AuthorRank.CONTRACTED, 
    threshold: 1000, 
    unlockedGenres: [NovelGenre.DAILY, NovelGenre.CAMPUS, NovelGenre.TABOO], 
    perks: '有了稳定的稿费预期。解锁行业指数基金，可以开始理财。', 
    skills: [{ id: 'k1', name: '准时更新', description: '体力消耗减少 5%。' }] 
  },
  { 
    id: 2, 
    rank: AuthorRank.MID_TIER, 
    threshold: 10000, 
    unlockedGenres: Object.values(NovelGenre), 
    perks: '读者开始关注你的生活。解锁 IP 邀约和成长型股票，爆发模式效率提升。', 
    skills: [{ id: 'k2', name: '互动达人', description: '发帖获得热度翻倍。' }] 
  },
  { 
    id: 3, 
    rank: AuthorRank.PLATINUM, 
    threshold: 50000, 
    unlockedGenres: Object.values(NovelGenre), 
    perks: '百合文坛的传说。解锁投机型个股和影视对赌协议 (VAM)。', 
    skills: [{ id: 'k3', name: '全职之光', description: '码字字数基础提升 20%。' }] 
  },
  { 
    id: 4, 
    rank: AuthorRank.LEGEND, 
    threshold: 200000, 
    unlockedGenres: Object.values(NovelGenre), 
    perks: '资本市场的操控者。可以肆意操纵个股情绪，名望收益极大化。', 
    skills: [{ id: 'k4', name: '降维打击', description: '作品质量极速攀升，无需投入灵感。' }] 
  },
];

export const IDENTITIES: Identity[] = [
  {
    type: 'TRANSPARENT',
    name: '百合萌新',
    description: '刚入姬圈的小白，对女性情感充满向往。初始房产：合租地下室。',
    initialFunds: 5000,
    initialFans: 0,
    initialSkill: 10,
    specialty: [NovelGenre.DAILY],
    startingSkill: { id: 's0', name: '真诚落笔', description: '小幅提升读者好感度。' },
    initialHouse: 0
  },
  {
    type: 'PART_TIME',
    name: '兼职作者',
    description: '有短篇百合经验，擅长校园纯爱。初始房产：单人公寓。',
    initialFunds: 10000,
    initialFans: 100,
    initialSkill: 30,
    specialty: [NovelGenre.CAMPUS, NovelGenre.TABOO],
    startingSkill: { id: 's1', name: '精准控节奏', description: '减少剧情崩坏概率。' },
    initialHouse: 1
  },
  {
    type: 'NICHE',
    name: '圈内名家',
    description: '有完结中篇，深谙百合拉扯之道。初始房产：精致单间。',
    initialFunds: 20000,
    initialFans: 1000,
    initialSkill: 60,
    specialty: [NovelGenre.ABO, NovelGenre.FANTASY],
    startingSkill: { id: 's2', name: '情感共鸣', description: '大幅提升高评分概率。' },
    initialHouse: 2
  }
];

export const INITIAL_MARKET: MarketPrice[] = [
  { 
    name: '“大橘已定”货币基金', 
    currentPrice: 1.0, 
    history: generateInitialHistory(1.0, 20, 0.002), 
    category: 'STABLE', 
    volatility: 0.002, 
    description: '保本型。新手最爱，微薄但稳定。', 
    linkedGenre: NovelGenre.DAILY, 
    sentiment: 0,
    minRank: AuthorRank.NOVICE 
  },
  { 
    name: '“纯爱战神”指数基金', 
    currentPrice: 25.5, 
    history: generateInitialHistory(25.5, 20, 0.02), 
    category: 'GROWTH', 
    volatility: 0.02, 
    description: '稳健型。随频道整体热度波动，中坚层首选。', 
    linkedGenre: NovelGenre.CAMPUS, 
    sentiment: 0,
    minRank: AuthorRank.CONTRACTED 
  },
  { 
    name: '“姬情四射”能源股', 
    currentPrice: 62.0, 
    history: generateInitialHistory(62.0, 20, 0.08), 
    category: 'GROWTH', 
    volatility: 0.08, 
    description: '成长型。如果你擅长写拉扯文，该股容易溢价。', 
    linkedGenre: NovelGenre.TABOO, 
    sentiment: 0,
    minRank: AuthorRank.MID_TIER 
  },
  { 
    name: '“芳文社”文创传媒', 
    currentPrice: 450.0, 
    history: generateInitialHistory(450.0, 20, 0.15), 
    category: 'SPEC', 
    volatility: 0.15, 
    description: '高风险。白金大神的版权变现消息是其晴雨表。', 
    linkedGenre: NovelGenre.ABO, 
    sentiment: 0,
    minRank: AuthorRank.PLATINUM 
  },
  { 
    name: '“扭曲之光”科技股', 
    currentPrice: 210.5, 
    history: generateInitialHistory(210.5, 20, 0.35), 
    category: 'SPEC', 
    volatility: 0.35, 
    description: '极端风险。文坛泰斗的情绪直接决定其生死。', 
    linkedGenre: NovelGenre.TRAGEDY, 
    sentiment: 0,
    minRank: AuthorRank.LEGEND 
  },
];

export const SURVIVAL_COSTS = [
  { level: 0, name: '合租地下室', rent: 200, staminaRegen: 40 },
  { level: 1, name: '舒适单人公寓', rent: 1500, staminaRegen: 60 },
  { level: 2, name: '精致小型套房', rent: 4000, staminaRegen: 80 },
  { level: 3, name: '顶层海景大平层', rent: 12000, staminaRegen: 100 },
];

export const DANMU_POOL = [
  "kswl kswl kswl！！！", "这对不结婚真的很难收场", "呜呜呜发糖了发糖了", "这就是姬圈天花板吗？", "民政局我搬来了，请原地结婚"
];

export const SOCIAL_QUOTES_POOL = [
  "救命，这对CP的性张力快要把我送走了！",
  "作者你没有心！为什么要在这种时候发刀子？"
];

export const ACHIEVEMENTS: Achievement[] = [
  // WRITING CATEGORY
  {
    id: 'ink_master',
    title: '百万文字之主',
    description: '累计码字字数超过 1,000,000。',
    category: AchievementCategory.WRITING,
    icon: '🖋️',
    unlocked: false,
    rewardText: '码字体力消耗永久减少 10%。',
    criteria: (s) => s.totalWordsWritten >= 1000000
  },
  {
    id: 'quality_zenith',
    title: '神作降临',
    description: '单本小说质量达到 100。',
    category: AchievementCategory.WRITING,
    icon: '💎',
    unlocked: false,
    rewardText: '作品完结时的基础名望翻倍。',
    criteria: (s, novels) => novels.some(n => n.quality >= 100) || false
  },
  {
    id: 'twisted_king',
    title: '扭曲之王',
    description: '在一本百合小说中累积张力超过 90。',
    category: AchievementCategory.WRITING,
    icon: '🌀',
    unlocked: false,
    rewardText: '全网争议值收益+20%。',
    criteria: (s, novels) => novels.some(n => n.tension >= 90) || false
  },
  {
    id: 'genre_explorer',
    title: '题材大师',
    description: '完结超过 3 本不同题材的小说。',
    category: AchievementCategory.WRITING,
    icon: '🗺️',
    unlocked: false,
    rewardText: '所有题材的受众衰减速度减慢 30%。',
    criteria: (s) => s.finishedCount >= 3
  },

  // FINANCE CATEGORY
  {
    id: 'capital_shaper',
    title: '资本推手',
    description: '单次交易获利超过 ¥50,000。',
    category: AchievementCategory.FINANCE,
    icon: '📈',
    unlocked: false,
    rewardText: '解锁“大宗交易”特权，手续费减半。',
    criteria: (s) => s.maxProfitSingleTrade >= 50000
  },
  {
    id: 'millionaire_club',
    title: '百万负翁？',
    description: '现金存款超过 ¥1,000,000。',
    category: AchievementCategory.FINANCE,
    icon: '💰',
    unlocked: false,
    rewardText: '每日生活成本降低 20%（管家代劳）。',
    criteria: (s) => s.money >= 1000000
  },
  {
    id: 'property_tycoon',
    title: '房产巨头',
    description: '入住“顶层海景大平层”。',
    category: AchievementCategory.FINANCE,
    icon: '🏙️',
    unlocked: false,
    rewardText: '每日心情自动恢复基础值+5。',
    criteria: (s) => s.houseLevel >= 3
  },

  // SOCIAL CATEGORY
  {
    id: 'stan_magnet',
    title: '病娇收割机',
    description: '激进粉丝（Stans）数量超过 10,000。',
    category: AchievementCategory.SOCIAL,
    icon: '⚔️',
    unlocked: false,
    rewardText: '“发刀预告”带来的热度翻倍。',
    criteria: (s) => s.fans.stans >= 10000
  },
  {
    id: 'viral_sensation',
    title: '全网爆火',
    description: '全球热度（Global Heat）峰值超过 10,000。',
    category: AchievementCategory.SOCIAL,
    icon: '🚀',
    unlocked: false,
    rewardText: '社交平台粉丝转化率永久提升 15%。',
    criteria: (s) => s.globalHeat >= 10000
  },
  {
    id: 'yuri_influencer',
    title: '百合教母',
    description: '声望突破 100,000。',
    category: AchievementCategory.SOCIAL,
    icon: '📢',
    unlocked: false,
    rewardText: '“护盘”操纵股价的冷却时间减半。',
    criteria: (s) => s.reputation >= 100000
  },

  // ULTIMATE CATEGORY
  {
    id: 'legendary_author',
    title: '文坛神话',
    description: '位格达到“文坛泰斗”。',
    category: AchievementCategory.ULTIMATE,
    icon: '🔱',
    unlocked: false,
    rewardText: '全网热度增长率永久+50%。',
    criteria: (s) => s.currentRank === AuthorRank.LEGEND
  },
  {
    id: 'financial_freedom',
    title: '财富自由',
    description: '存款 > 5,000,000 且入住顶级豪宅。',
    category: AchievementCategory.ULTIMATE,
    icon: '🥂',
    unlocked: false,
    rewardText: '解锁“佛系模式”：无需再支付房租，体力恢复满值。',
    criteria: (s) => s.money >= 5000000 && s.houseLevel >= 3
  }
];

export const REPUTATION_LEVELS = STATUS_PATH; // 为兼容旧引用

export const SHOP_ITEMS: InventoryItem[] = [
  { id: 'coffee', name: '精品手冲咖啡', type: 'FOOD', price: 45, icon: '☕', description: '提神醒脑，恢复30体力', effect: (s) => ({ ...s, stamina: Math.min(s.maxStamina, s.stamina + 30) }) }
];

export const QUOTE_POOL: InspirationQuote[] = [
  { id: 't1', text: "“我对你，从一开始就没抱过什么纯洁的期待。”", category: QuoteCategory.TENSION, effectDescription: "极大张力", apply: (s, n) => ({ stats: { ...s, mood: Math.max(0, s.mood - 5) }, novel: { ...n, tension: Math.min(100, n.tension + 25) } }) }
];
