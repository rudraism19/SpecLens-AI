import type { FC } from 'react';
import type { HealthResponse } from '../types';
import { ShieldCheck, Cpu, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react';

interface HeaderProps {
  health: HealthResponse | null;
  loading: boolean;
  onRefreshHealth: () => void;
}

export const Header: FC<HeaderProps> = ({ health, loading, onRefreshHealth }) => {
  return (
    <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur-md sticky top-0 z-50 px-6 py-4">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Logo and Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <ShieldCheck className="w-6 h-6 text-slate-950 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-white m-0">SpecLens AI</h1>
              <span className="text-xs font-mono font-medium px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Phase 1 Scaffolding
              </span>
            </div>
            <p className="text-xs text-slate-400">
              AI-Powered Compliance Copilot for Technical PDFs
            </p>
          </div>
        </div>

        {/* System & Nebius Status Indicators */}
        <div className="flex items-center gap-3">
          {/* Backend Status */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/60 text-xs">
            {health ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-slate-300 font-medium">FastAPI: Online</span>
              </>
            ) : (
              <>
                <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
                <span className="text-slate-300 font-medium">FastAPI: Disconnected</span>
              </>
            )}
            <button
              onClick={onRefreshHealth}
              disabled={loading}
              title="Refresh backend status"
              className="ml-1 text-slate-400 hover:text-slate-200 transition-colors disabled:opacity-40"
            >
              <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {/* Nebius Token Factory Status */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/60 text-xs">
            <Cpu className="w-3.5 h-3.5 text-purple-400" />
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400">Nebius / Nemotron:</span>
              {health?.nebius_configured ? (
                <span className="font-semibold text-purple-300">Ready</span>
              ) : (
                <span className="font-medium text-amber-400/90" title="API key not yet set in backend/.env">
                  Unconfigured (PDF Mode Active)
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
