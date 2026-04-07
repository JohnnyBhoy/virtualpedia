import React from 'react';
import { Message } from '../../types';
import { format } from 'date-fns';
import Avatar from '../common/Avatar';
import { useAuth } from '../../context/AuthContext';
import { User } from '../../types';

interface Props {
  message: Message;
  isStreaming?: boolean;
}

const MessageBubble: React.FC<Props> = ({ message, isStreaming = false }) => {
  const { user } = useAuth();
  const isUser = message.role === 'user';
  const time = message.timestamp ? format(new Date(message.timestamp), 'h:mm a') : '';

  if (isUser) {
    return (
      <div className="flex justify-end mb-4">
        <div className="max-w-xs lg:max-w-md xl:max-w-lg">
          <div className="bg-blue-600 text-white rounded-2xl rounded-br-none px-4 py-3 shadow-sm">
            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
          </div>
          <p className="text-xs text-gray-400 text-right mt-1">{time}</p>
        </div>
        <div className="ml-2 flex-shrink-0">
          <Avatar src={(user as User)?.avatar} name={user?.name || 'You'} size="sm" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-end space-x-2 mb-4">
      <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm flex-shrink-0">🩺</div>
      <div className="max-w-xs lg:max-w-md xl:max-w-lg">
        <div className="bg-white rounded-2xl rounded-bl-none px-4 py-3 shadow-sm border border-gray-100">
          <p className={`text-sm text-gray-800 whitespace-pre-wrap ${isStreaming ? 'streaming-cursor' : ''}`}>
            {message.content}
          </p>
        </div>
        <p className="text-xs text-gray-400 mt-1">{isStreaming ? 'Typing...' : time}</p>
      </div>
    </div>
  );
};

export default MessageBubble;
