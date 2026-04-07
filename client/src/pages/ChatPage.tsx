import React, { useState, useEffect, useRef, useCallback } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import { getChatHistory, clearChatHistory } from '../api/chat';
import { Message, User } from '../types';
import MessageBubble from '../components/chat/MessageBubble';
import TypingIndicator from '../components/chat/TypingIndicator';
import Avatar from '../components/common/Avatar';
import Loader from '../components/common/Loader';
import { FaStethoscope, FaTrash, FaPaperPlane, FaMicrophone, FaStop } from 'react-icons/fa';
import { useSpeechInput } from '../hooks/useSpeechInput';

const ChatPage: React.FC = () => {
  const { user, logout } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [isStreaming, setIsStreaming] = useState(false);
  const [showTyping, setShowTyping] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    getChatHistory()
      .then(res => setMessages(res.data.data.messages || []))
      .catch(() => toast.error('Failed to load chat history'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { scrollToBottom(); }, [messages, streamingContent, showTyping]);

  const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed || isStreaming) return;

    const userMsg: Message = {
      role: 'user',
      content: trimmed,
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsStreaming(true);
    setShowTyping(true);
    setStreamingContent('');

    const token = localStorage.getItem('vp_token');
    abortControllerRef.current = new AbortController();

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/chat/message`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ message: trimmed }),
          signal: abortControllerRef.current.signal,
        }
      );

      if (!response.ok) throw new Error('Failed to send message');

      const reader = response.body!.getReader();
      const decoder = new TextDecoder();
      let accumulated = '';

      setShowTyping(false);

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.done) {
                setMessages(prev => [
                  ...prev,
                  {
                    role: 'assistant',
                    content: accumulated,
                    timestamp: new Date().toISOString(),
                  },
                ]);
                setStreamingContent('');
              } else if (data.content) {
                accumulated += data.content;
                setStreamingContent(accumulated);
              }
            } catch {}
          }
        }
      }
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        toast.error('Failed to get response from Dr. Pedia');
      }
      setShowTyping(false);
      setStreamingContent('');
    } finally {
      setIsStreaming(false);
      setShowTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const { isListening, toggleListening } = useSpeechInput({
    onResult: (text) => setInput((prev) => prev ? prev + ' ' + text : text),
    onError: (msg) => toast.error(msg),
  });

  const handleClearChat = async () => {
    if (!window.confirm('Clear all chat history with Dr. Pedia?')) return;
    try {
      await clearChatHistory();
      setMessages([]);
      setStreamingContent('');
      toast.success('Chat cleared');
    } catch {
      toast.error('Failed to clear chat');
    }
  };

  if (loading) return <Loader fullScreen />;

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Navbar */}
      <header className="bg-white border-b border-gray-200 shadow-sm z-10 flex-shrink-0">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FaStethoscope className="text-blue-600 text-xl" />
            <span className="font-bold text-gray-900">VirtualPedia</span>
          </div>
          <div className="flex items-center space-x-4">
            <div className="hidden sm:flex items-center space-x-2">
              <Avatar src={(user as User)?.avatar} name={user?.name || ''} size="sm" />
              <span className="text-sm text-gray-700 font-medium">{user?.name}</span>
            </div>
            <button
              onClick={logout}
              className="text-sm text-gray-500 hover:text-red-500 transition-colors border border-gray-200 px-3 py-1.5 rounded-lg hover:border-red-200"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Dr. Pedia Header */}
      <div className="bg-white border-b border-gray-100 flex-shrink-0">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-xl flex-shrink-0">
              🩺
            </div>
            <div>
              <p className="font-semibold text-gray-900">Dr. Pedia</p>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <p className="text-xs text-green-600">Online now</p>
              </div>
            </div>
          </div>
          {messages.length > 0 && (
            <button
              onClick={handleClearChat}
              className="flex items-center space-x-1 text-xs text-gray-400 hover:text-red-500 transition-colors border border-gray-200 hover:border-red-200 px-3 py-1.5 rounded-lg"
            >
              <FaTrash className="text-xs" /><span>Clear</span>
            </button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-4 py-6">
          {messages.length === 0 && !streamingContent && !showTyping ? (
            <div className="flex flex-col items-center justify-center min-h-64 text-center">
              <div className="w-20 h-20 rounded-full bg-blue-50 flex items-center justify-center text-4xl mb-5 shadow-sm">
                🩺
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Hello! I'm Dr. Pedia 👋</h3>
              <p className="text-gray-500 max-w-sm leading-relaxed">
                I'm here to help with your child's health questions — fevers, milestones, vaccines, nutrition, sleep, and more. What's on your mind today?
              </p>
            </div>
          ) : (
            <>
              {messages.map((msg, i) => (
                <MessageBubble key={i} message={msg} />
              ))}
              {showTyping && <TypingIndicator />}
              {streamingContent && !showTyping && (
                <MessageBubble
                  message={{ role: 'assistant', content: streamingContent, timestamp: '' }}
                  isStreaming
                />
              )}
            </>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="bg-white border-t border-gray-200 flex-shrink-0">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-end space-x-3">
            <div className="flex-1 relative">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isStreaming}
                placeholder={isListening ? 'Listening… speak now 🎙️' : "Ask Dr. Pedia about your child's health..."}
                rows={1}
                className={`w-full border rounded-2xl px-4 py-3 pr-4 text-sm resize-none focus:outline-none focus:ring-2 focus:border-transparent disabled:text-gray-400 transition-all ${
                  isListening
                    ? 'bg-red-50 border-red-300 focus:ring-red-400'
                    : 'border-gray-300 focus:ring-blue-500 disabled:bg-gray-50'
                }`}
                style={{ maxHeight: '120px', overflowY: 'auto' }}
              />
            </div>
            <button
              onClick={toggleListening}
              disabled={isStreaming}
              aria-label={isListening ? 'Stop recording' : 'Start voice input'}
              className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                isListening
                  ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse shadow-md'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-500 border border-gray-200'
              }`}
            >
              {isListening ? <FaStop className="text-sm" /> : <FaMicrophone className="text-sm" />}
            </button>
            <button
              onClick={sendMessage}
              disabled={!input.trim() || isStreaming}
              className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex-shrink-0 shadow-md hover:shadow-lg"
            >
              <FaPaperPlane className="text-sm ml-0.5" />
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-2 text-center">
            Press <kbd className="bg-gray-100 px-1 py-0.5 rounded text-xs">Enter</kbd> to send · <kbd className="bg-gray-100 px-1 py-0.5 rounded text-xs">Shift+Enter</kbd> for new line · <kbd className="bg-gray-100 px-1 py-0.5 rounded text-xs">🎙️</kbd> voice input
          </p>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
