import React, { useState, useEffect, useRef } from 'react';
import { Message, Sender, UserData } from './types';
import { createChatSession, sendMessage } from './services/geminiService';
import ChatMessage from './components/ChatMessage';
import MessageInput from './components/MessageInput';
import TypingIndicator from './components/TypingIndicator';
import SparklesIcon from './components/icons/SparklesIcon';
import { Chat } from '@google/genai';
import GhostIcon from './components/icons/GhostIcon';
import LockIcon from './components/icons/LockIcon';
import LoginScreen from './components/LoginScreen';
import SignUpScreen from './components/SignUpScreen';

const EPHEMERAL_DURATION_MS = 15000;

const GHOST_ICON_DEFAULT = "data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 256 256' fill='white'%3e%3cpath d='M221.66,66.34l-48-48A8,8,0,0,0,168,16H88a8,8,0,0,0-5.66,2.34l-48,48A8,8,0,0,0,32,72v8a8,8,0,0,0,16,0V74.34L68.69,53.66a8,8,0,0,1,11.31,0L102.34,76,88,88.69a8,8,0,0,0,0,11.31L101.66,113.66a8,8,0,0,0,11.31,0l22.35-22.34a8,8,0,0,1,11.31,0l22.35,22.34a8,8,0,0,0,11.31,0L193.66,100,180,86.34l22.34-22.34a8,8,0,0,1,11.32,0L236,86.34V72A8,8,0,0,0,221.66,66.34ZM187.31,80,160,52.69,132.69,80,160,107.31ZM120,72,96,48l-24,24Z' /%3e%3cpath d='M224,96v64a8,8,0,0,1-16,0V144H48v16a8,8,0,0,1-16,0V96a8,8,0,0,1,16,0v32H208V96a8,8,0,0,1,16,0Zm-88,24a12,12,0,1,0,12,12A12,12,0,0,0,136,120Zm-48,0a12,12,0,1,0,12,12A12,12,0,0,0,88,120Z' /%3e%3c/svg%3e";
const GHOST_ICON_NOTIFY = "data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 256 256' fill='white'%3e%3cpath d='M221.66,66.34l-48-48A8,8,0,0,0,168,16H88a8,8,0,0,0-5.66,2.34l-48,48A8,8,0,0,0,32,72v8a8,8,0,0,0,16,0V74.34L68.69,53.66a8,8,0,0,1,11.31,0L102.34,76,88,88.69a8,8,0,0,0,0,11.31L101.66,113.66a8,8,0,0,0,11.31,0l22.35-22.34a8,8,0,0,1,11.31,0l22.35,22.34a8,8,0,0,0,11.31,0L193.66,100,180,86.34l22.34-22.34a8,8,0,0,1,11.32,0L236,86.34V72A8,8,0,0,0,221.66,66.34ZM187.31,80,160,52.69,132.69,80,160,107.31ZM120,72,96,48l-24,24Z' /%3e%3cpath d='M224,96v64a8,8,0,0,1-16,0V144H48v16a8,8,0,0,1-16,0V96a8,8,0,0,1,16,0v32H208V96a8,8,0,0,1,16,0Zm-88,24a12,12,0,1,0,12,12A12,12,0,0,0,136,120Zm-48,0a12,12,0,1,0,12,12A12,12,0,0,0,88,120Z' /%3e%3ccircle cx='220' cy='36' r='24' fill='%23ef4444'/%3e%3c/svg%3e";

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isEphemeralMode, setIsEphemeralMode] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [hasNotification, setHasNotification] = useState(false);

  const chatRef = useRef<Chat | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Check for existing user on initial load
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('ghost-user');
      if (storedUser) {
        setUserData(JSON.parse(storedUser));
        setIsAuthenticated(false); // Always require login
      }
    } catch (error) {
      console.error("Failed to parse user data from localStorage", error);
      localStorage.clear(); // Clear corrupted data
    }
  }, []);

  // Initialize chat session when authenticated
  useEffect(() => {
    if (isAuthenticated && userData && !chatRef.current) {
      try {
        const history = JSON.parse(localStorage.getItem('ghost-chat-history') || '[]');
        chatRef.current = createChatSession(history);
      } catch (error) {
        console.error("Failed to parse chat history", error);
        chatRef.current = createChatSession(); // Start fresh
      }
    }
    if (!isAuthenticated) {
      chatRef.current = null; // Clear session on lock/logout
    }
  }, [isAuthenticated, userData]);

  // Scroll to bottom effect
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);
  
  // Ephemeral message cleaner
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setMessages(prev =>
        prev.filter(msg => {
          if (msg.id === 'initial') return true;
          return !msg.disappearAt || msg.disappearAt > now;
        })
      );
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Tab notification effects
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        setHasNotification(false);
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  useEffect(() => {
    const link = document.querySelector("link[rel*='icon']") as HTMLLinkElement;
    if (link) {
      if (hasNotification) {
        link.href = GHOST_ICON_NOTIFY;
        document.title = '(New Message) Ghost';
      } else {
        link.href = GHOST_ICON_DEFAULT;
        document.title = 'Ghost';
      }
    }
  }, [hasNotification]);

  const handleSendMessage = async (text: string) => {
    if (!chatRef.current) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text,
      sender: Sender.USER,
      ...(isEphemeralMode && { disappearAt: Date.now() + EPHEMERAL_DURATION_MS }),
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setIsLoading(true);

    const aiResponseText = await sendMessage(chatRef.current, text);
    
    if (document.hidden) {
      setHasNotification(true);
    }

    const aiMessage: Message = {
      id: (Date.now() + 1).toString(),
      text: aiResponseText,
      sender: Sender.AI,
      ...(isEphemeralMode && { disappearAt: Date.now() + EPHEMERAL_DURATION_MS }),
    };
    
    const finalMessages = [...updatedMessages, aiMessage];
    setMessages(finalMessages);
    setIsLoading(false);

    // Persist state
    localStorage.setItem('ghost-messages', JSON.stringify(finalMessages));
    const history = await chatRef.current.getHistory();
    localStorage.setItem('ghost-chat-history', JSON.stringify(history));
  };
  
  const handleSignUp = (newUserData: UserData) => {
    const initialMessages: Message[] = [
      {
        id: 'initial',
        text: `Welcome, ${newUserData.username} 👻\nToggle the sparkles to send disappearing messages!`,
        sender: Sender.AI,
      },
    ];
    localStorage.setItem('ghost-user', JSON.stringify(newUserData));
    localStorage.setItem('ghost-messages', JSON.stringify(initialMessages));
    localStorage.removeItem('ghost-chat-history');
    setUserData(newUserData);
    setMessages(initialMessages);
    setIsAuthenticated(true);
  };

  const handleLogin = (type: 'code' | 'password', value: string): boolean => {
    if (!userData) return false;
    const success = (type === 'code' && value === userData.loginCode) || (type === 'password' && value === userData.password);
    if (success) {
      const storedMessages = localStorage.getItem('ghost-messages');
      if (storedMessages) {
        setMessages(JSON.parse(storedMessages));
      }
      setIsAuthenticated(true);
      return true;
    }
    return false;
  };

  const handleLock = () => {
    setIsAuthenticated(false);
  };

  if (!userData) {
    return <SignUpScreen onSignUp={handleSignUp} />;
  }

  if (!isAuthenticated) {
    return <LoginScreen username={userData.username} onLogin={handleLogin} />;
  }

  return (
    <div className="flex flex-col h-screen max-w-3xl mx-auto bg-slate-900 text-white font-sans">
      <header className="flex items-center justify-between bg-slate-800/80 backdrop-blur-sm p-4 border-b border-slate-700 shadow-md sticky top-0 z-10">
        <div className="w-10">
           <button
            onClick={handleLock}
            className="p-2 rounded-full hover:bg-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-500"
            aria-label="Lock application"
            title="Lock application"
          >
            <LockIcon className="w-6 h-6 text-slate-400" />
          </button>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-2">
            <GhostIcon className="w-6 h-6 text-slate-200" />
            <h1 className="text-xl font-bold text-slate-100">Ghost</h1>
          </div>
           <p className="text-center text-xs text-slate-400">Welcome, {userData.username}</p>
        </div>
        <div className="w-10 flex justify-end">
          <button
            onClick={() => setIsEphemeralMode(!isEphemeralMode)}
            className="p-2 rounded-full hover:bg-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-500"
            aria-label="Toggle disappearing messages"
            title={isEphemeralMode ? "Disable disappearing messages" : "Enable disappearing messages"}
          >
            <SparklesIcon className={`w-6 h-6 transition-colors duration-300 ${isEphemeralMode ? 'text-yellow-300' : 'text-slate-400'}`} />
          </button>
        </div>
      </header>
      
      <main className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        <div className="flex flex-col space-y-4">
          {messages.map((msg) => (
            <ChatMessage key={msg.id} message={msg} />
          ))}
          {isLoading && (
            <div className="flex justify-start">
               <div className="bg-slate-700 rounded-2xl rounded-bl-lg p-2">
                 <TypingIndicator />
               </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </main>

      <footer className="sticky bottom-0">
        <MessageInput onSendMessage={handleSendMessage} isLoading={isLoading} />
      </footer>
    </div>
  );
};

export default App;
