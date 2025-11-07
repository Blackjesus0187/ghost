import React from 'react';
import { Message, Sender } from '../types';
import SparklesIcon from './icons/SparklesIcon';

interface ChatMessageProps {
  message: Message;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.sender === Sender.USER;
  const isEphemeral = !!message.disappearAt;

  return (
    <div className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-xs md:max-w-md lg:max-w-lg px-4 py-2.5 rounded-2xl flex items-center gap-2 ${
          isUser
            ? 'bg-blue-600 text-white rounded-br-lg'
            : 'bg-slate-700 text-slate-200 rounded-bl-lg'
        }`}
      >
        <p className="whitespace-pre-wrap flex-grow">{message.text}</p>
        {isEphemeral && (
          <SparklesIcon className={`w-3.5 h-3.5 flex-shrink-0 ${isUser ? 'text-blue-200' : 'text-slate-400'}`} />
        )}
      </div>
    </div>
  );
};

export default ChatMessage;