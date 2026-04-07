import React from 'react';

const TypingIndicator: React.FC = () => (
  <div className="flex items-end space-x-2 mb-4">
    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs flex-shrink-0">🩺</div>
    <div className="bg-white rounded-2xl rounded-bl-none px-4 py-3 shadow-sm border border-gray-100">
      <div className="flex space-x-1 items-center h-5">
        {[0, 1, 2].map(i => (
          <div
            key={i}
            className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>
    </div>
  </div>
);

export default TypingIndicator;
