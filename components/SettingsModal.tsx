
import React, { useState } from 'react';
import { AIConfig } from '../types';
import { verifyAIConfig } from '../services/geminiService';

interface SettingsModalProps {
  config: AIConfig;
  onSave: (config: AIConfig) => void;
  onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ config, onSave, onClose }) => {
  const [localConfig, setLocalConfig] = useState<AIConfig>({ ...config });
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyStatus, setVerifyStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleVerify = async () => {
    setIsVerifying(true);
    setVerifyStatus('idle');
    const success = await verifyAIConfig(localConfig);
    setVerifyStatus(success ? 'success' : 'error');
    setIsVerifying(false);
  };

  const handleSave = () => {
    onSave(localConfig);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[300] bg-slate-900/40 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in duration-300">
      <div className="glass-card w-full max-w-md rounded-[2.5rem] p-8 border-2 border-white shadow-2xl flex flex-col gap-6 overflow-y-auto no-scrollbar max-h-[90vh]">
        <div className="text-center">
          <h2 className="text-2xl font-black text-[#546e7a] italic">AI 引擎配置</h2>
          <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-widest">阶级跨越背后的超级大脑</p>
        </div>

        <div className="space-y-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">AI 提供商</label>
            <div className="flex gap-2">
              {(['deepseek', 'gemini'] as const).map(p => (
                <button
                  key={p}
                  onClick={() => setLocalConfig({ 
                    ...localConfig, 
                    provider: p, 
                    model: p === 'gemini' ? 'gemini-3-flash-preview' : 'deepseek-chat',
                    baseUrl: p === 'gemini' ? '' : 'https://api.deepseek.com/v1/chat/completions'
                  })}
                  className={`flex-1 py-3 rounded-2xl text-[10px] font-black uppercase transition-all border ${
                    localConfig.provider === p ? 'bg-[#546e7a] text-white border-transparent' : 'bg-white text-gray-400 border-gray-100'
                  }`}
                >
                  {p === 'deepseek' ? 'DeepSeek (默认)' : 'Gemini'}
                </button>
              ))}
            </div>
          </div>

          {localConfig.provider === 'deepseek' ? (
            <div className="flex flex-col gap-4">
               <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">DeepSeek API Key</label>
                <input
                  type="password"
                  value={localConfig.apiKey}
                  onChange={e => setLocalConfig({ ...localConfig, apiKey: e.target.value })}
                  className="w-full p-4 bg-gray-50 rounded-2xl font-mono text-xs outline-none border border-transparent focus:border-indigo-200 transition-all"
                  placeholder="在此输入您的 DeepSeek Key"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">接口地址</label>
                <input
                  type="text"
                  value={localConfig.baseUrl}
                  onChange={e => setLocalConfig({ ...localConfig, baseUrl: e.target.value })}
                  className="w-full p-4 bg-gray-50 rounded-2xl font-mono text-[9px] outline-none border border-transparent focus:border-indigo-200 transition-all"
                  placeholder="https://api.deepseek.com/v1/chat/completions"
                />
              </div>
            </div>
          ) : (
            <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100">
              <p className="text-[9px] text-amber-700 font-bold leading-relaxed">
                Gemini 模式将使用系统内置的 API Key。请确保您可以正常访问 Google AI 服务。
              </p>
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">模型名称</label>
            <input
              type="text"
              value={localConfig.model}
              onChange={e => setLocalConfig({ ...localConfig, model: e.target.value })}
              className="w-full p-4 bg-gray-50 rounded-2xl font-mono text-xs outline-none border border-transparent focus:border-indigo-200 transition-all"
              placeholder={localConfig.provider === 'gemini' ? 'gemini-3-flash-preview' : 'deepseek-chat'}
            />
          </div>
        </div>

        <div className="flex flex-col gap-3 mt-4">
          <button
            onClick={handleVerify}
            disabled={isVerifying}
            className={`w-full py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${
              verifyStatus === 'success' ? 'bg-emerald-500 text-white' :
              verifyStatus === 'error' ? 'bg-rose-500 text-white' :
              'bg-[#fce4ec] text-[#f06292]'
            } disabled:opacity-30`}
          >
            {isVerifying ? '正在检测链路...' : verifyStatus === 'success' ? '✓ 连接成功' : verifyStatus === 'error' ? '✗ 验证失败' : '验证配置'}
          </button>
          
          <div className="flex gap-2">
            <button onClick={onClose} className="flex-1 py-4 text-gray-400 text-[10px] font-black uppercase rounded-2xl">取消</button>
            <button onClick={handleSave} className="flex-1 py-4 bg-[#546e7a] text-white text-[10px] font-black uppercase rounded-2xl shadow-md">保存并重启 AI</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
