
import React from 'react';
import { CameraIcon, CogIcon } from './IconComponents';

interface HeaderProps {
    onOpenSettings: () => void;
    onLogout?: () => void;
    isLoggedIn?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onOpenSettings, onLogout, isLoggedIn }) => {
  return (
    <header className="sticky top-0 z-50 bg-black/80 backdrop-blur-md border-b border-gray-800">
      <div className="container mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
            <div className="bg-white/10 p-2 rounded-xl">
                <CameraIcon className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-xl font-bold text-white tracking-wide">
            ShotLab
            </h1>
        </div>
        <div className="flex items-center gap-4">
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
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="Settings"
                title="API Key Settings"
            >
                <CogIcon className="w-5 h-5" />
            </button>
            <div className="text-gray-500 text-xs font-mono uppercase tracking-widest hidden sm:block">Built by <a href="https://secondoak.se" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Second Oak</a></div>
        </div>
      </div>
    </header>
  );
};
