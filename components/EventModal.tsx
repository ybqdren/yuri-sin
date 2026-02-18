
import React from 'react';
import { GameEvent, GameEventOption } from '../types';

interface EventModalProps {
  event: GameEvent;
  onOptionClick: (option: GameEventOption, event: GameEvent) => void;
  onClose: () => void;
}

const EventModal: React.FC<EventModalProps> = ({ event, onOptionClick, onClose }) => {
  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
      <div className="glass-card w-full max-w-lg rounded-[2.5rem] p-8 border-2 border-white shadow-2xl flex flex-col gap-6 overflow-y-auto no-scrollbar max-h-[90vh]">
        <div className="text-center">
          <span className="text-4xl mb-2 block animate-bounce">🎭</span>
          <h2 className="text-xl font-black text-[#546e7a]">{event.title}</h2>
          <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-widest italic">Dynamic Game Event</p>
        </div>

        <div className="bg-white/40 p-5 rounded-3xl border border-white/50">
          <p className="text-xs font-bold text-[#455a64] leading-relaxed italic">
            {event.triggerDescription || event.description}
          </p>
        </div>

        <div className="flex flex-col gap-4">
          {event.options.map((option, idx) => (
            <button
              key={idx}
              onClick={() => onOptionClick(option, event)}
              className="group p-5 bg-white/60 border border-white rounded-3xl text-left hover:bg-[#fce4ec] hover:border-[#f06292] transition-all relative overflow-hidden active:scale-95"
            >
              <div className="flex justify-between items-start">
                <span className="text-sm font-black text-[#546e7a] group-hover:text-[#f06292] transition-colors pr-8">
                  {option.text}
                </span>
                <span className="text-lg opacity-20 group-hover:opacity-100 transition-opacity">✨</span>
              </div>
              {option.dialogue && (
                <p className="text-[10px] text-gray-400 mt-2 font-serif italic line-clamp-2">
                  “{option.dialogue}”
                </p>
              )}
              {/* 可选：显示影响概览（如果需要让玩家知道数值变化） */}
            </button>
          ))}
        </div>

        <button 
          onClick={onClose}
          className="text-center text-[10px] font-black text-gray-300 uppercase tracking-widest hover:text-[#f06292] transition-colors"
        >
          暂时搁置 / WAIT
        </button>
      </div>
    </div>
  );
};

export default EventModal;
