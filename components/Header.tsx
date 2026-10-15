
import React from 'react';
import { ApertureIcon, CogIcon } from './IconComponents';

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
            <span className="relative flex items-center justify-center w-9 h-9 rounded-full bg-gradient-to-br from-emerald-400 via-cyan-400 to-blue-500 shadow-[0_3px_12px_rgba(34,211,238,0.35)]">
                <ApertureIcon
                    className="text-white transition-transform duration-500 ease-out group-hover:rotate-180"
                    style={{ width: 24, height: 24 }}
                    strokeWidth={2}
                />
            </span>
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
      <div className="h-px bg-gradient-to-r from-transparent via-gray-600/60 to-transparent" />
    </header>
  );
};
