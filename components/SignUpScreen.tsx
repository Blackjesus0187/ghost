import React, { useState, useRef, useEffect } from 'react';
import GhostIcon from './icons/GhostIcon';
import { UserData } from '../types';

interface SignUpScreenProps {
  onSignUp: (userData: UserData) => void;
}

const SignUpScreen: React.FC<SignUpScreenProps> = ({ onSignUp }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginCode, setLoginCode] = useState('');
  const [error, setError] = useState('');
  const usernameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    usernameInputRef.current?.focus();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim() || !loginCode.trim()) {
      setError('All fields are required.');
      return;
    }
    if (!/^\d{6}$/.test(loginCode)) {
      setError('The login code must be exactly 6 digits.');
      return;
    }
    setError('');
    onSignUp({ username, password, loginCode });
  };

  return (
    <div className="flex flex-col h-screen max-w-3xl mx-auto bg-slate-900 text-white font-sans items-center justify-center p-4">
      <div className="text-center p-8 rounded-lg w-full max-w-sm">
        <GhostIcon className="w-16 h-16 text-slate-200 mx-auto mb-4" />
        <h1 className="text-3xl font-bold text-slate-100">Welcome to Ghost</h1>
        <p className="text-slate-400 mt-1 mb-8">Create a secure account to begin.</p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            ref={usernameInputRef}
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Username"
            className="w-full bg-slate-700 text-slate-200 rounded-full py-3 px-5 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Master Password"
            className="w-full bg-slate-700 text-slate-200 rounded-full py-3 px-5 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
          />
          <input
            type="number"
            value={loginCode}
            onChange={(e) => setLoginCode(e.target.value)}
            placeholder="6-Digit Login Code"
            className="w-full bg-slate-700 text-slate-200 rounded-full py-3 px-5 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            maxLength={6}
          />
          {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
          <button
            type="submit"
            className="mt-4 w-full p-3 rounded-full bg-blue-600 text-white font-bold hover:bg-blue-700 disabled:bg-slate-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-900"
          >
            Create Account
          </button>
        </form>
      </div>
    </div>
  );
};

export default SignUpScreen;
