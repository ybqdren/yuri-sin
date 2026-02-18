
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Novel, NovelGenre, NovelTendency, NovelOrientation, PlayerStats, ButterflyImpact, AuthorRank } from '../types';
import { generateNovelFeedback, generateNovelSnippet, generateNovelTitle, generateNovelAxis, recalculateButterflyEffect, generateChapterComments } from '../services/geminiService';
import { STATUS_PATH } from '../constants';

interface WritingCenterProps {
  stats: PlayerStats;
  setStats: React.Dispatch<React.SetStateAction<PlayerStats>>;
  activeNovel: Novel | null;
  setActiveNovel: (n: Novel | null) => void;
  onFinishNovel: (n: Novel) => void;
  finishedNovels: Novel[];
}

const WritingCenter: React.FC<WritingCenterProps> = ({ stats, setStats, activeNovel, setActiveNovel, onFinishNovel, finishedNovels }) => {
  const [creationStep, setCreationStep] = useState(1);
  const [newTitle, setNewTitle] = useState('');
  const [newGenre, setNewGenre] = useState<NovelGenre>(NovelGenre.DAILY);
  const [newTendency, setNewTendency] = useState<NovelTendency>(NovelTendency.SWEET);
  const [newOrientation] = useState<NovelOrientation>(NovelOrientation.YURI); // 强制百合
  
  const [isGeneratingAxis, setIsGeneratingAxis] = useState(false);
  const [isModifyingPlot, setIsModifyingPlot] = useState(false);
  const [plotInput, setPlotInput] = useState('');
  const [butterflyPreview, setButterflyPreview] = useState<ButterflyImpact | null>(null);

  const [isWriting, setIsWriting] = useState(false);
  const [isGeneratingTitle, setIsGeneratingTitle] = useState(false);
  const [sessionDraft, setSessionDraft] = useState<string[]>([]); 
  const [displayedSnippet, setDisplayedSnippet] = useState<string>('');
  const [lastResult, setLastResult] = useState<{ words: number; income: number; stamina: number; mood: number; qualityGain: number; comments: string[] } | null>(null);
  const [shake, setShake] = useState(false);
  
  const [inspirationToSpend, setInspirationToSpend] = useState(10);
  const editorEndRef = useRef<HTMLDivElement>(null);

  const unlockedGenres = useMemo(() => {
    const currentStatus = STATUS_PATH.find(s => s.rank === stats.currentRank) || STATUS_PATH[0];
    return currentStatus.unlockedGenres;
  }, [stats.currentRank]);

  useEffect(() => {
    if (editorEndRef.current) editorEndRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [displayedSnippet, sessionDraft]);

  const handleAITitle = async () => {
    setIsGeneratingTitle(true);
    try {
      const title = await generateNovelTitle(newGenre, newTendency);
      setNewTitle(title.replace(/["'《》「」]/g, '').trim());
    } catch (e: any) {
      alert("AI 引擎忙，请稍后再试");
    } finally {
      setIsGeneratingTitle(false);
    }
  };

  const startNewNovel = async () => {
    if (!newTitle.trim()) return;
    setIsGeneratingAxis(true);
    try {
      const outlines = await generateNovelAxis(newTitle, newGenre, newTendency);
      setActiveNovel({
        id: Math.random().toString(36).substr(2, 9),
        title: newTitle,
        genre: newGenre,
        tendency: newTendency,
        orientation: newOrientation,
        wordCount: 0,
        popularity: 50,
        totalIncome: 0,
        isFinished: false,
        reviews: [],
        tension: 10,
        quality: 0,
        heat: 100,
        controversy: 0,
        fans: { organic: 0, hardcore: 0 },
        monthlyTickets: 0,
        outlines: outlines,
        currentChapterIndex: 0
      });
      setCreationStep(1);
    } catch (e) {
      alert("生成大纲失败");
    } finally {
      setIsGeneratingAxis(false);
    }
  };

  const handleWrite = async (mode: 'normal' | 'hardcore') => {
    if (!activeNovel) return;
    if (stats.inspiration < inspirationToSpend) {
        alert("灵感储备不足！");
        return;
    }
    let staminaCost = (mode === 'hardcore' ? 50 : 25);
    if (stats.stamina < staminaCost) {
        alert("体力耗尽，请休息。");
        return;
    }

    setIsWriting(true);
    setLastResult(null); 
    setDisplayedSnippet('');
    setShake(true);
    try {
      const [snippet, comments] = await Promise.all([
        generateNovelSnippet(activeNovel, inspirationToSpend),
        generateChapterComments(activeNovel)
      ]);
      
      let words = Math.floor((mode === 'hardcore' ? 6000 : 2000) * (0.9 + Math.random() * 0.2));
      let income = Math.floor(words * 0.06 * (1 + stats.writingSkill / 100));
      const qualityGain = parseFloat(((mode === 'hardcore' ? 1.5 : 0.5) * (1 + (inspirationToSpend / 50))).toFixed(2));
      
      let i = 0;
      const timer = setInterval(() => {
        setDisplayedSnippet(snippet.substring(0, i));
        i += 4; 
        if (i > snippet.length) {
          clearInterval(timer);
          setShake(false);
          finishWritingStep(snippet, words, income, qualityGain, staminaCost, comments);
        }
      }, 10);
    } catch (e: any) {
      setIsWriting(false);
      setShake(false);
      alert("灵感枯竭了...");
    }
  };

  const finishWritingStep = (snippet: string, words: number, income: number, qualityGain: number, staminaCost: number, comments: string[]) => {
    if (!activeNovel) return;
    const newIdx = Math.min(activeNovel.outlines.length - 1, activeNovel.currentChapterIndex + 1);
    const updatedNovel = {
      ...activeNovel,
      wordCount: activeNovel.wordCount + words,
      totalIncome: activeNovel.totalIncome + income,
      quality: Math.min(100, activeNovel.quality + qualityGain),
      currentChapterIndex: newIdx
    };
    setSessionDraft(prev => [...prev, snippet]);
    setActiveNovel(updatedNovel);
    setStats(prev => ({
      ...prev,
      stamina: Math.max(0, prev.stamina - staminaCost),
      money: prev.money + income,
      totalWordsWritten: prev.totalWordsWritten + words,
      inspiration: Math.max(0, prev.inspiration - inspirationToSpend),
      mood: Math.max(0, prev.mood - 5),
      lastPostDay: prev.day
    }));
    setIsWriting(false);
    setLastResult({ words, income, stamina: staminaCost, mood: 5, qualityGain, comments });
  };

  if (!activeNovel) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-6 animate-in fade-in zoom-in-95 duration-500 min-h-full">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-black text-[#546e7a] italic tracking-tight">百合创作中心</h2>
          {isGeneratingAxis && <p className="text-[10px] text-[#f06292] animate-pulse mt-2 uppercase font-black">AI 正在构思大纲...</p>}
        </div>
        
        <div className="bg-white/80 backdrop-blur-2xl p-6 md:p-8 rounded-[3rem] border border-white shadow-2xl w-full max-w-md space-y-8">
          {creationStep === 1 ? (
            <div className="space-y-6 animate-in slide-in-from-left-4">
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-4">选择题材 (受位格限制)</label>
                <div className="grid grid-cols-3 gap-3">
                  {Object.values(NovelGenre).map(g => {
                    const isLocked = !unlockedGenres.includes(g);
                    return (
                      <button 
                        key={g} 
                        onClick={() => !isLocked && setNewGenre(g)} 
                        disabled={isLocked}
                        className={`py-4 rounded-2xl text-xs font-black transition-all border flex flex-col items-center gap-1 ${
                          isLocked ? 'bg-gray-100/50 text-gray-300 border-transparent cursor-not-allowed' :
                          newGenre === g ? 'bg-[#546e7a] text-white border-transparent shadow-lg scale-105' : 'bg-white text-gray-400 border-gray-100'
                        }`}
                      >
                        {isLocked && <span className="text-[10px]">🔒</span>}
                        {g}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">作品性向</label>
                <div className="p-4 bg-[#fce4ec]/30 rounded-2xl border border-[#fce4ec] flex items-center justify-between">
                  <span className="text-sm font-black text-[#f06292]">{newOrientation} (GL)</span>
                  <span className="text-[8px] font-black text-gray-400 uppercase">当前频道已锁定</span>
                </div>
              </div>
              
              <button onClick={() => setCreationStep(2)} className="w-full py-5 bg-[#546e7a] text-white font-black rounded-3xl shadow-xl active:scale-95 transition-all">确认题材</button>
            </div>
          ) : (
            <div className="space-y-8 animate-in slide-in-from-right-4">
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-4">情感基调</label>
                <div className="flex gap-3">
                  {Object.values(NovelTendency).map(t => (
                    <button 
                      key={t} 
                      onClick={() => setNewTendency(t)} 
                      className={`flex-1 py-4 rounded-2xl text-xs font-black transition-all border ${
                        newTendency === t ? 'bg-[#f8bbd0] text-white border-transparent shadow-lg scale-105' : 'bg-white text-gray-400 border-gray-100'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div className="relative">
                 <div className="flex justify-between items-center mb-2 px-1">
                   <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">书名</label>
                   <button onClick={handleAITitle} disabled={isGeneratingTitle} className="text-[10px] font-black text-[#f06292] bg-[#fce4ec] px-4 py-1.5 rounded-full hover:shadow-md transition-all">✨ AI 起名</button>
                 </div>
                 <input 
                  type="text" 
                  value={newTitle} 
                  onChange={(e) => setNewTitle(e.target.value)} 
                  placeholder="请输入书名..." 
                  className="w-full p-5 bg-gray-50 rounded-[2rem] border-none font-bold text-lg text-[#546e7a] outline-none shadow-inner" 
                 />
              </div>
              <div className="flex gap-3">
                <button onClick={() => setCreationStep(1)} className="flex-1 py-4 text-gray-400 font-bold rounded-2xl">返回</button>
                <button onClick={startNewNovel} disabled={!newTitle.trim() || isGeneratingAxis} className="flex-[2] py-4 bg-[#f06292] text-white font-black rounded-[2rem] shadow-xl">发布连载</button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  const currentChapter = activeNovel.outlines[activeNovel.currentChapterIndex] || activeNovel.outlines[0];

  return (
    <div className={`flex flex-col gap-5 animate-in fade-in duration-700 pb-24 ${shake ? 'animate-shake' : ''}`}>
      <div className="shrink-0 flex flex-col gap-3">
        <div className="flex justify-between items-end px-2">
          <div className="flex flex-col">
            <h2 className="text-2xl font-black text-[#546e7a] italic tracking-tight truncate max-w-[240px]">{activeNovel.title}</h2>
            <div className="flex items-center gap-2 mt-1">
               <span className="text-[9px] font-black bg-[#546e7a]/10 text-[#546e7a] px-3 py-1 rounded-full">{activeNovel.genre}</span>
               <span className="text-[9px] font-black bg-[#f06292]/10 text-[#f06292] px-3 py-1 rounded-full">百合</span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-2xl font-mono font-black text-[#546e7a]">{activeNovel.wordCount.toLocaleString()}</span>
            <span className="text-[8px] text-gray-400 font-black block uppercase">Total Words</span>
          </div>
        </div>
        
        <div className="p-5 rounded-[2.5rem] bg-white border border-gray-100 shadow-sm relative overflow-hidden">
           <div className="flex justify-between items-center mb-2">
             <span className="text-[9px] font-black text-[#f06292] uppercase tracking-[0.2em]">第 {currentChapter.chapterNumber} 章 / AXIS</span>
           </div>
           <h3 className="text-sm font-black text-[#546e7a] mb-1">{currentChapter.title}</h3>
           <p className="text-[11px] text-gray-400 font-bold leading-relaxed italic">“{currentChapter.goal}”</p>
        </div>
      </div>

      <div className="glass-card rounded-[3rem] p-4 flex flex-col relative overflow-hidden bg-[#faf7f2] paper-texture min-h-[400px] shadow-inner">
        <div className="flex-1 flex flex-col relative overflow-hidden bg-[#fffdfa]/80 shadow-inner rounded-[2rem] border border-[#e8e0d5]">
          <div className="flex-1 overflow-y-auto no-scrollbar p-6 md:p-10 font-serif text-base leading-[2.4] text-[#546e7a] select-none text-justify">
            <style>{`.paper-texture { background-image: url('https://www.transparenttextures.com/patterns/natural-paper.png'); } .writing-paragraph { margin-bottom: 2rem; text-indent: 2em; } .cursor { display: inline-block; width: 2px; height: 1.2em; background-color: #f06292; margin-left: 2px; vertical-align: middle; }`}</style>
            {sessionDraft.map((para, idx) => <p key={idx} className="writing-paragraph">{para}</p>)}
            {displayedSnippet && <p className="writing-paragraph text-[#37474f] font-black">{displayedSnippet}<span className="cursor animate-pulse" /></p>}
            <div ref={editorEndRef} />
          </div>
        </div>

        {lastResult && (
          <div className="absolute inset-0 flex items-center justify-center z-[100] bg-slate-900/10 backdrop-blur-md p-6">
            <div className="bg-white w-full max-w-sm p-8 rounded-[3rem] border-2 border-[#fce4ec] shadow-2xl animate-in zoom-in flex flex-col gap-6 overflow-y-auto max-h-full">
              <div className="text-center">
                <div className="text-5xl mb-2">✨</div>
                <h3 className="text-xl font-black text-[#f06292]">发布成功</h3>
                <p className="text-[10px] text-gray-400 uppercase tracking-widest font-black mt-1">CHAPTER PUBLISHED</p>
              </div>
              <div className="grid grid-cols-2 gap-4 bg-[#f8f9fb] p-5 rounded-3xl border border-gray-100">
                <div className="flex flex-col"><span className="text-[9px] text-gray-400 uppercase font-black">新增字数</span><span className="text-sm font-black text-emerald-500">+{lastResult.words}</span></div>
                <div className="flex flex-col"><span className="text-[9px] text-gray-400 uppercase font-black">获得稿费</span><span className="text-sm font-black text-amber-500">¥{lastResult.income}</span></div>
                <div className="flex flex-col"><span className="text-[9px] text-gray-400 uppercase font-black">体力消耗</span><span className="text-sm font-black text-rose-400">-{lastResult.stamina}⚡</span></div>
                <div className="flex flex-col"><span className="text-[9px] text-gray-400 uppercase font-black">笔力提升</span><span className="text-sm font-black text-indigo-500">+{lastResult.qualityGain}</span></div>
              </div>
              <div className="space-y-4">
                 <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-2">读者书评 / COMMENTS</span>
                 <div className="flex flex-col gap-3">
                    {lastResult.comments.map((c, i) => (
                      <div key={i} className="bg-white p-4 rounded-2xl border border-pink-50 text-[11px] font-bold text-[#546e7a] italic shadow-sm leading-relaxed">
                        “{c}”
                      </div>
                    ))}
                 </div>
              </div>
              <button onClick={() => setLastResult(null)} className="w-full py-5 bg-[#f06292] text-white text-xs font-black uppercase rounded-2xl shadow-xl active:scale-95 transition-all">确认并继续</button>
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-3 shrink-0">
        <div className="px-5 py-4 bg-white/90 rounded-[2.5rem] border border-white shadow-sm flex flex-col gap-2">
           <div className="flex justify-between items-center">
             <div className="flex flex-col">
               <label className="text-[10px] font-black text-[#546e7a] uppercase tracking-widest">灵感投入量</label>
               <span className="text-[9px] text-gray-400 font-bold">投入越多，质量提升越快</span>
             </div>
             <div className="text-right">
                <span className="text-xs font-black text-[#f06292]">库存: {stats.inspiration}</span>
                <span className="text-[10px] font-black text-gray-300 ml-2">消耗: -{inspirationToSpend}</span>
             </div>
           </div>
           <input type="range" min="0" max={Math.min(50, stats.inspiration)} step="10" value={inspirationToSpend} onChange={(e) => setInspirationToSpend(parseInt(e.target.value))} className="w-full h-1.5 bg-gray-100 rounded-lg accent-[#f06292]" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <button disabled={isWriting} onClick={() => handleWrite('normal')} className="h-16 bg-white border border-gray-100 rounded-[2rem] text-sm font-black text-[#546e7a] shadow-sm active:scale-95 transition-all flex items-center justify-center gap-2">
            <span>日常更新</span>
            <span className="text-[10px] opacity-50">(-25⚡)</span>
          </button>
          <button disabled={isWriting} onClick={() => handleWrite('hardcore')} className="h-16 bg-[#546e7a] text-white rounded-[2rem] text-sm font-black shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2">
            <span>爆发灵感</span>
            <span className="text-[10px] opacity-70">(-50⚡)</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default WritingCenter;
