import React, { useState, useEffect, useRef } from 'react';
import { Message, Sender } from './types';
import { createChatSession, sendMessage } from './services/geminiService';
import ChatMessage from './components/ChatMessage';
import MessageInput from './components/MessageInput';
import TypingIndicator from './components/TypingIndicator';
import SparklesIcon from './components/icons/SparklesIcon';
import { Chat } from '@google/genai';

const EPHEMERAL_DURATION_MS = 15000; // 15 seconds

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'initial',
      text: "Welcome to Phantom Chat 👻\nMessages can be set to disappear. Toggle the sparkles icon to try it out!",
      sender: Sender.AI,
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [isEphemeralMode, setIsEphemeralMode] = useState(false);
  const chatRef = useRef<Chat | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!chatRef.current) {
      chatRef.current = createChatSession();
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessages(prev =>
        prev.filter(msg => {
          if (msg.id === 'initial') return true; // Always keep the initial message
          if (!msg.disappearAt) return true; // Keep non-ephemeral messages
          return msg.disappearAt > Date.now(); // Keep messages that haven't expired
        })
      );
    }, 1000); // Check for expired messages every second
    return () => clearInterval(interval);
  }, []);

  const handleSendMessage = async (text: string) => {
    if (!chatRef.current) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text,
      sender: Sender.USER,
      ...(isEphemeralMode && { disappearAt: Date.now() + EPHEMERAL_DURATION_MS }),
    };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    const aiResponseText = await sendMessage(chatRef.current, text);

    const aiMessage: Message = {
      id: (Date.now() + 1).toString(),
      text: aiResponseText,
      sender: Sender.AI,
      ...(isEphemeralMode && { disappearAt: Date.now() + EPHEMERAL_DURATION_MS }),
    };
    setMessages((prev) => [...prev, aiMessage]);
    setIsLoading(false);
  };

  return (
    <div className="flex flex-col h-screen max-w-3xl mx-auto bg-slate-900 text-white font-sans">
      <header className="flex items-center justify-between bg-slate-800/80 backdrop-blur-sm p-4 border-b border-slate-700 shadow-md sticky top-0 z-10">
        <div className="w-10"></div> {/* Spacer */}
        <div className="text-center">
          <h1 className="text-xl font-bold text-slate-100">Phantom Chat</h1>
          <p className="text-center text-xs text-slate-400">Your private, disappearing chat</p>
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