
import React from 'react';
import { CameraIcon } from './IconComponents';

export const Header: React.FC = () => {
  return (
    <header className="sticky top-0 z-50 bg-black/80 backdrop-blur-md border-b border-gray-800">
      <div className="container mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
            <div className="bg-white/10 p-2 rounded-xl">
                <CameraIcon className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-xl font-bold text-white tracking-wide">
            AI Studio
            </h1>
        </div>
        <div className="flex items-center gap-4">
            <div className="text-gray-500 text-xs font-mono uppercase tracking-widest hidden sm:block">Built by Second Oak</div>
        </div>
      </div>
    </header>
  );
};
