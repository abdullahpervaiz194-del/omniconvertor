import React from 'react';
import { Loader2, ShieldCheck, Cpu } from 'lucide-react';
import { ProcessingProgress } from '../../types';

interface ProcessingStateProps {
  progress: ProcessingProgress;
  onCancel?: () => void;
}

export const ProcessingState: React.FC<ProcessingStateProps> = ({ progress, onCancel }) => {
  return (
    <div className="w-full bg-[#18181b] border border-[#27272a] rounded-xl p-8 sm:p-12 text-center shadow-2xl relative overflow-hidden">
      {/* Subtle background glow */}
      <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/5 to-transparent pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center max-w-lg mx-auto space-y-6">
        
        {/* Animated processing spinner / pulse */}
        <div className="relative">
          <div className="w-16 h-16 rounded-xl bg-[#09090b] border border-indigo-500/40 flex items-center justify-center text-indigo-400">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
          </div>
          <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-400 flex items-center justify-center">
            <Cpu className="w-3 h-3 text-emerald-400" />
          </div>
        </div>

        {/* Status Stage Message */}
        <div className="space-y-1.5 text-center">
          <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">
            {progress.stageMessage || 'Processing your file...'}
          </h3>
          {progress.detail && (
            <p className="text-xs text-[#a1a1aa] font-mono">
              {progress.detail}
            </p>
          )}
        </div>

        {/* Progress Bar */}
        <div className="w-full space-y-2">
          <div className="w-full h-2.5 bg-[#09090b] rounded-full overflow-hidden p-0.5 border border-[#27272a]">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 via-indigo-400 to-emerald-400 rounded-full transition-all duration-300 shadow-sm"
              style={{ width: `${Math.max(5, progress.percentage)}%` }}
            />
          </div>
          <div className="flex justify-between text-[11px] text-[#a1a1aa] font-mono">
            <span>CLIENT RUNTIME ENGINE</span>
            <span className="text-indigo-400 font-bold">{progress.percentage}%</span>
          </div>
        </div>

        {/* Security / local guarantee */}
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-[#09090b] border border-[#27272a] text-[#a1a1aa] text-[11px] font-mono">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Local memory sandbox execution</span>
        </div>

        {/* Cancel button if provided */}
        {onCancel && (
          <button
            onClick={onCancel}
            className="text-xs text-[#a1a1aa] hover:text-rose-400 underline pt-1 cursor-pointer"
          >
            Cancel process
          </button>
        )}
      </div>
    </div>
  );
};
