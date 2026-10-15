
import React from 'react';
import { CogIcon } from './IconComponents';

interface HeaderProps {
    onOpenSettings: () => void;
    onLogout?: () => void;
    isLoggedIn?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onOpenSettings, onLogout, isLoggedIn }) => {
  return (
    <header className="sticky top-0 z-50 bg-black/70 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
        {/* Logo */}
        <a href="#" className="group flex items-center gap-3" aria-label="ShotLab">
            <svg
                viewBox="0 0 24 24"
                fill="none"
                strokeWidth={2.5}
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-8 h-8 transition-transform duration-500 ease-out group-hover:rotate-180 drop-shadow-[0_2px_8px_rgba(34,211,238,0.4)]"
            >
                <defs>
                    <linearGradient id="shotlabGrad" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0" stopColor="#5eead4" />
                        <stop offset="0.5" stopColor="#22d3ee" />
                        <stop offset="1" stopColor="#38bdf8" />
                    </linearGradient>
                </defs>
                <g stroke="url(#shotlabGrad)">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="14.31" y1="8" x2="20.05" y2="17.94" />
                    <line x1="9.69" y1="8" x2="21.17" y2="8" />
                    <line x1="7.38" y1="12" x2="13.12" y2="2.06" />
                    <line x1="9.69" y1="16" x2="3.95" y2="6.06" />
                    <line x1="14.31" y1="16" x2="2.83" y2="16" />
                    <line x1="16.62" y1="12" x2="10.88" y2="21.94" />
                </g>
            </svg>
            <span className="flex flex-col leading-none">
                <span className="text-xl font-extrabold tracking-tight text-white">ShotLab</span>
                <span className="text-[10px] font-medium uppercase tracking-[0.25em] text-gray-500 mt-1 hidden sm:block">AI Product Photo Studio</span>
            </span>
        </a>

        {/* Actions */}
        <div className="flex items-center gap-3">
            {isLoggedIn && onLogout && (
                <button
                    onClick={onLogout}
                    className="text-gray-500 hover:text-white text-xs font-medium uppercase tracking-wide transition-colors"
                >
                    Log out
                </button>
            )}
            <button
                onClick={onOpenSettings}
                className="flex items-center justify-center w-9 h-9 rounded-xl border border-gray-800 bg-gray-900/70 text-gray-400 hover:text-white hover:border-gray-600 transition-all active:scale-95"
                aria-label="Settings"
                title="API Key Settings"
            >
                <CogIcon className="w-4.5 h-4.5" style={{ width: 18, height: 18 }} />
            </button>
            <a
                href="https://secondoak.se"
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-800 bg-gray-900/70 text-gray-500 hover:text-white hover:border-gray-600 transition-all text-[10px] font-mono uppercase tracking-widest"
            >
                Built by Second Oak
            </a>
        </div>
      </div>
      {/* gradient hairline */}
      <div className="h-px bg-gradient-to-r from-transparent via-cyan-500/40 to-transparent" />
    </header>
  );
};
