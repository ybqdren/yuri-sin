
import { GoogleGenAI, Type } from "@google/genai";
import { Novel, NovelGenre, NovelTendency, NovelOrientation, AIConfig, PlayerStats, GameEvent, MarketPrice, ChapterOutline, ButterflyImpact } from "../types";

let activeConfig: AIConfig = {
  provider: 'deepseek',
  apiKey: '', 
  baseUrl: 'https://api.deepseek.com/v1/chat/completions',
  model: 'deepseek-chat'
};

export function setGlobalAIConfig(config: AIConfig) {
  activeConfig = config;
}

// Internal helper for AI calls using the provided guidelines for Google GenAI SDK.
async function callAI(prompt: string, options: { json?: boolean, schema?: any, temperature?: number } = {}) {
  try {
    if (activeConfig.provider === 'gemini') {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: activeConfig.model || 'gemini-3-flash-preview',
        contents: prompt,
        config: {
          temperature: options.temperature ?? 0.8,
          responseMimeType: options.json ? "application/json" : undefined,
          responseSchema: options.schema
        }
      });
      return response.text || "";
    } else {
      const url = activeConfig.baseUrl || 'https://api.deepseek.com/v1/chat/completions';
      if (!activeConfig.apiKey) throw new Error("请先在设置中配置 API Key");
      
      const body: any = {
        model: activeConfig.model || 'deepseek-chat',
        messages: [{ role: 'system', content: '你是一个资深的百合小说（GL）作家助手。' }, { role: 'user', content: prompt }],
        temperature: options.temperature ?? 0.8,
      };
      if (options.json) body.response_format = { type: 'json_object' };

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${activeConfig.apiKey}` },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      return data.choices?.[0]?.message?.content || "";
    }
  } catch (e: any) {
    console.error("AI Request Failed", e);
    throw e;
  }
}

/**
 * 生成章节评论
 */
export async function generateChapterComments(novel: Novel): Promise<string[]> {
  const prompt = `为百合小说《${novel.title}》的最新章节生成 3 条读者评论。
  背景：题材 ${novel.genre}，倾向 ${novel.tendency}，当前质量 ${novel.quality.toFixed(1)}，张力 ${novel.tension}。
  要求：评论要像真实的网文平台评论（有玩梗的、催更的、深度分析的）。
  返回 JSON 数组格式: ["评论1", "评论2", "评论3"]。不要带 markdown 标签。`;
  
  const schema = {
    type: Type.ARRAY,
    items: { type: Type.STRING }
  };

  try {
    const text = await callAI(prompt, { json: true, schema });
    const parsed = JSON.parse(text);
    return Array.isArray(parsed) ? parsed : (parsed.comments || []);
  } catch (e) {
    return ["kswl，这对太甜了！", "作者大大什么时候加更啊？", "这章的心理描写太细腻了，心疼女二。"];
  }
}

/**
 * 生成 15 章初始大纲
 */
export async function generateNovelAxis(title: string, genre: string, tendency: string): Promise<ChapterOutline[]> {
  const prompt = `为百合小说《${title}》（${genre}, ${tendency}）生成 15 章剧本轴。
  返回 JSON 数组，格式为: [{"chapterNumber": 1, "title": "...", "goal": "..."}]。不要带 markdown 标签。`;
  
  const schema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        chapterNumber: { type: Type.INTEGER },
        title: { type: Type.STRING },
        goal: { type: Type.STRING }
      },
      required: ["chapterNumber", "title", "goal"]
    }
  };

  try {
    const text = await callAI(prompt, { json: true, schema });
    const parsed = JSON.parse(text);
    const outlines = Array.isArray(parsed) ? parsed : (parsed.outlines || []);
    return outlines.map((o: any) => ({ ...o, isModified: false }));
  } catch (e) {
    return Array.from({ length: 15 }).map((_, i) => ({
      chapterNumber: i + 1,
      title: `第 ${i + 1} 章`,
      goal: "继续书写动人的百合故事。",
      isModified: false
    }));
  }
}

/**
 * 重构大纲并计算蝴蝶效应
 */
export async function recalculateButterflyEffect(novel: Novel, userInput: string): Promise<{newOutlines: ChapterOutline[], impact: ButterflyImpact}> {
  const currentChapter = novel.outlines[novel.currentChapterIndex] || { chapterNumber: 1, title: '起航', goal: '', isModified: false };
  const prompt = `玩家正在写《${novel.title}》，目前第${currentChapter.chapterNumber}章。
  原计划：${currentChapter.goal}。
  玩家想改为：${userInput}。
  请任务：
  1. 重写本章 goal (50字内)。
  2. 修改后续 3 章的大纲以保持逻辑自洽。
  3. 返回蝴蝶效应数值 impact（staminaMod: 消耗, heatMod: 热度, moodMod: 心情, fanBias: 倾向, marketEcho: 关联金融板块）。
  返回 JSON: {"currentChapterGoal": "...", "nextThreeOutlines": [{"title": "...", "goal": "..."}], "impact": {"staminaMod": -50, "heatMod": 1000, "moodMod": -10, "fanBias": "STANS", "marketEcho": "芳文传媒"}}`;

  try {
    const text = await callAI(prompt, { json: true });
    const result = JSON.parse(text);
    
    const updatedOutlines = [...novel.outlines];
    updatedOutlines[novel.currentChapterIndex] = { 
      ...updatedOutlines[novel.currentChapterIndex], 
      goal: result.currentChapterGoal, 
      isModified: true 
    };
    
    result.nextThreeOutlines.forEach((o: any, idx: number) => {
      const nextIdx = novel.currentChapterIndex + 1 + idx;
      if (updatedOutlines[nextIdx]) {
        updatedOutlines[nextIdx] = { ...updatedOutlines[nextIdx], ...o, isModified: true };
      }
    });

    return { newOutlines: updatedOutlines, impact: result.impact };
  } catch (e) {
    throw new Error("蝴蝶扇动翅膀失败，请重试。");
  }
}

export async function generateNovelSnippet(novel: Novel, inspirationLevel: number) {
  const currentGoal = novel.outlines[novel.currentChapterIndex]?.goal || "描写两人的互动";
  const prompt = `创作一段【百合小说】正文。
  书名：《${novel.title}》
  本章目标：${currentGoal}
  性向：百合（GL）
  投入灵感：${inspirationLevel}。直接输出 150 字正文。`;
  try {
    return await callAI(prompt, { temperature: 1.0 });
  } catch (e) {
    return "窗外的风带过一阵橘子的清香。她看着她，心里有些话终究没有说出口。在这个百合盛开的季节里，她们的故事才刚刚开始。";
  }
}

export async function verifyAIConfig(config: AIConfig): Promise<boolean> {
  try {
    if (config.provider === 'gemini') {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({ model: config.model || 'gemini-3-flash-preview', contents: 'Ping' });
      return !!response.text;
    } else {
      const res = await fetch(config.baseUrl || 'https://api.deepseek.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${config.apiKey}` },
        body: JSON.stringify({ model: config.model || 'deepseek-chat', messages: [{ role: 'user', content: 'Ping' }], max_tokens: 5 })
      });
      return res.ok;
    }
  } catch (e) { return false; }
}

export async function generateNovelFeedback(novel: Novel) {
  const prompt = `评价百合小说《${novel.title}》。40字内。`;
  return await callAI(prompt);
}

export async function generateNovelTitle(genre: NovelGenre, tendency: NovelTendency) {
  const prompt = `为百合小说（${genre}, ${tendency}）起名。只需标题。`;
  return await callAI(prompt);
}

export async function generateNPCCuratorPost(novel: Novel) { return await callAI(`安利百合小说《${novel.title}》。`); }
export async function generateNPCFinanceGuruPost(asset: MarketPrice) { return await callAI(`理财建议：${asset.name}。`); }
export async function generateNudgeComment(intensity: number) { return await callAI(`催更评论 (强度:${intensity})。`); }
export async function summarizeNovelCompletion(novel: Novel) { return JSON.parse(await callAI(`结项报告《${novel.title}》`, { json: true })); }
export async function generateIPNegotiation(novel: Novel, stats: PlayerStats) { return JSON.parse(await callAI(`洽谈《${novel.title}》IP`, { json: true })); }
export async function generateMacroEvent(stats: PlayerStats, activeNovel: Novel | null) { return JSON.parse(await callAI(`宏观事件`, { json: true })); }
export async function generateSocialRivalEvent(last: number, curr: number) { return JSON.parse(await callAI(`对手动态`, { json: true })); }
export async function generateGatheringDanmu() { return JSON.parse(await callAI(`百合弹幕`, { json: true })); }
