
import React, { useState, useEffect } from 'react';
import { XCircleIcon } from './IconComponents';

type ActiveTab = 'apiKey' | 'password';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (apiKey: string) => void;
  onPasswordSuccess: () => void;
  trialOver?: boolean;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onPasswordSuccess,
  trialOver = false
}) => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('apiKey');
  const [apiKey, setApiKey] = useState('');
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      const savedKey = localStorage.getItem('gemini-api-key') || '';
      setApiKey(savedKey);
      setPassword('');
      setPasswordError(null);
      setActiveTab('apiKey');
    }
  }, [isOpen]);

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  const handleSave = () => {
    onSave(apiKey);
  };

  const handlePasswordSubmit = () => {
    if (password === 'Klinkhammer12') {
      onPasswordSuccess();
    } else {
      setPasswordError("Incorrect password. Please try again.");
    }
  };

  const TabButton: React.FC<{ tabId: ActiveTab; children: React.ReactNode }> = ({ tabId, children }) => (
    <button
      onClick={() => setActiveTab(tabId)}
      className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors focus:outline-none ${
        activeTab === tabId
          ? 'border-white text-white bg-white/5'
          : 'border-transparent text-gray-400 hover:text-white hover:bg-white/5'
      }`}
    >
      {children}
    </button>
  );

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="bg-[#18181b] border border-gray-700 rounded-xl shadow-2xl w-full max-w-md overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Tabs and Close Button */}
        <div className="flex items-center justify-between border-b border-gray-700 bg-black/20 pr-4">
            <div className="flex">
                <TabButton tabId="apiKey">Your API Key</TabButton>
                <TabButton tabId="password">Log In</TabButton>
            </div>
            <button
                onClick={onClose}
                className="text-gray-500 hover:text-white transition-colors p-1"
                aria-label="Close"
            >
                <XCircleIcon className="w-6 h-6" />
            </button>
        </div>

        <div className="p-6">
          {activeTab === 'apiKey' && (
            <div>
              <h2 id="modal-title" className="text-xl font-bold text-white mb-2">
                Enter Your Google AI API Key
              </h2>
              <p className="text-gray-400 text-sm mb-6 leading-relaxed">
                {trialOver
                  ? "Your free generations are used up. To continue, provide your own Gemini API key or log in with a password."
                  : "Your key is stored only in your browser and is never sent to our servers. With your own key you also get access to 4K resolution."
                }
              </p>

              <div className="mb-6">
                 <input
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="Enter your API key here"
                    className="w-full p-3 bg-black/50 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:ring-1 focus:ring-white focus:border-white transition outline-none"
                    aria-label="API Key Input"
                    onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                />
                 <a
                    href="https://aistudio.google.com/app/apikey"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-gray-500 hover:text-white underline mt-2 inline-block transition-colors"
                >
                    Get your API key from Google AI Studio &rarr;
                </a>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleSave}
                  disabled={!apiKey.trim()}
                  className="px-6 py-2.5 text-sm font-bold text-black bg-white rounded-lg hover:bg-gray-200 disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed transition-all active:scale-[0.98]"
                >
                  Save Key
                </button>
              </div>
            </div>
          )}

          {activeTab === 'password' && (
             <div>
                <h2 id="modal-title" className="text-xl font-bold text-white mb-2">
                    Log In
                </h2>
                <p className="text-gray-400 text-sm mb-6 leading-relaxed">
                    Enter the password to get full access to the studio.
                </p>

                <input
                    type="password"
                    value={password}
                    onChange={(e) => {
                        setPassword(e.target.value);
                        setPasswordError(null);
                    }}
                    placeholder="Enter password"
                    className={`w-full p-3 bg-black/50 border rounded-lg text-white placeholder-gray-500 focus:ring-1 focus:ring-white transition outline-none ${
                        passwordError ? 'border-red-500 ring-red-500' : 'border-gray-600 focus:border-white'
                    }`}
                    aria-label="Password Input"
                    onKeyDown={(e) => e.key === 'Enter' && handlePasswordSubmit()}
                />
                {passwordError && <p className="text-red-400 text-xs mt-2">{passwordError}</p>}

                <div className="mt-6 flex justify-end">
                    <button
                        onClick={handlePasswordSubmit}
                        disabled={!password.trim()}
                        className="px-6 py-2.5 text-sm font-bold text-black bg-white rounded-lg hover:bg-gray-200 disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed transition-all active:scale-[0.98]"
                    >
                        Log In
                    </button>
                </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
