
import React, { useState } from 'react';
import SendIcon from './icons/SendIcon';

interface MessageInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
}

const MessageInput: React.FC<MessageInputProps> = ({ onSendMessage, isLoading }) => {
  const [inputValue, setInputValue] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() && !isLoading) {
      onSendMessage(inputValue.trim());
      setInputValue('');
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-center p-2 bg-slate-800 border-t border-slate-700"
    >
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        placeholder="Type a message..."
        className="flex-grow bg-slate-700 text-slate-200 rounded-full py-3 px-5 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
        disabled={isLoading}
      />
      <button
        type="submit"
        disabled={isLoading || !inputValue.trim()}
        className="ml-3 p-3 rounded-full bg-blue-600 text-white hover:bg-blue-700 disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-800"
        aria-label="Send message"
      >
        <SendIcon className="w-6 h-6" />
      </button>
    </form>
  );
};

export default MessageInput;
