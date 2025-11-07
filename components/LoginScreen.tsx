import React, { useState, useRef, useEffect } from 'react';
import GhostIcon from './icons/GhostIcon';
import SendIcon from './icons/SendIcon';

interface LoginScreenProps {
  username: string;
  onLogin: (type: 'code' | 'password', value: string) => boolean;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ username, onLogin }) => {
  const [attempt, setAttempt] = useState('');
  const [mode, setMode] = useState<'code' | 'password'>('code');
  const [error, setError] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, [mode]);

  const handleShake = () => {
    setError(true);
    setTimeout(() => setError(false), 500);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!attempt.trim()) return;

    const success = onLogin(mode, attempt);
    
    if (!success) {
      setAttempt('');
      inputRef.current?.focus();
      handleShake();

      if (mode === 'code') {
        const newFailedAttempts = failedAttempts + 1;
        setFailedAttempts(newFailedAttempts);
        if (newFailedAttempts >= 2) {
          alert("Too many incorrect attempts. For your security, all application data will now be erased.");
          localStorage.clear();
          window.location.reload();
        }
      }
    }
  };
  
  const handleModeToggle = () => {
    setAttempt('');
    setFailedAttempts(0);
    setError(false);
    setMode(prevMode => prevMode === 'code' ? 'password' : 'code');
  }

  return (
    <div className="flex flex-col h-screen max-w-3xl mx-auto bg-slate-900 text-white font-sans items-center justify-center p-4">
       <style>{`
        @keyframes shake {
          10%, 90% { transform: translate3d(-1px, 0, 0); }
          20%, 80% { transform: translate3d(2px, 0, 0); }
          30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
          40%, 60% { transform: translate3d(4px, 0, 0); }
        }
        .shake { animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both; }
      `}</style>
      <div className={`text-center p-8 rounded-lg w-full max-w-sm ${error ? 'shake' : ''}`}>
        <GhostIcon className="w-16 h-16 text-slate-200 mx-auto mb-4" />
        <h1 className="text-3xl font-bold text-slate-100">Welcome back, {username}</h1>
        <p className="text-slate-400 mt-1 mb-6">
          {mode === 'code' ? 'Enter your 6-digit code to unlock' : 'Enter your master password'}
        </p>
        <form onSubmit={handleSubmit} className="flex items-center">
           <input
            ref={inputRef}
            type={mode === 'code' ? 'number' : 'password'}
            value={attempt}
            onChange={(e) => setAttempt(e.target.value)}
            placeholder={mode === 'code' ? '6-Digit Code' : 'Password'}
            className="flex-grow bg-slate-700 text-slate-200 rounded-full py-3 px-5 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            maxLength={mode === 'code' ? 6 : undefined}
            pattern={mode === 'code' ? '\\d{6}' : undefined}
          />
          <button
            type="submit"
            disabled={!attempt.trim()}
            className="ml-3 p-3 rounded-full bg-blue-600 text-white hover:bg-blue-700 disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-800"
            aria-label="Unlock"
          >
            <SendIcon className="w-6 h-6" />
          </button>
        </form>
        <div className="text-xs text-slate-500 mt-4 h-4">
          {mode === 'code' && failedAttempts === 1 && (
            <p className="text-red-400 font-bold">
              Warning: 1 attempt remaining before data is erased.
            </p>
          )}
        </div>
        <button onClick={handleModeToggle} className="text-xs text-slate-400 hover:text-slate-200 mt-4 transition-colors">
            {mode === 'code' ? 'Forgot code? Login with password' : 'Login with 6-digit code'}
        </button>
      </div>
    </div>
  );
};

export default LoginScreen;
