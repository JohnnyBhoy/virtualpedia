import React, { useState, useRef, useEffect, useCallback } from 'react';
import { FaTimes, FaPaperPlane, FaGoogle, FaMicrophone, FaStop } from 'react-icons/fa';
import { useSpeechInput } from '../hooks/useSpeechInput';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  id: string;
}

const MAX_GUEST_MESSAGES = 5;

const GuestChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [userMessageCount, setUserMessageCount] = useState(0);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [hasShownBadge, setHasShownBadge] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  // Always-current messages snapshot for async history building
  const messagesRef = useRef<ChatMessage[]>([]);

  useEffect(() => { messagesRef.current = messages; }, [messages]);

  // Welcome greeting + auto-open after 3 seconds
  useEffect(() => {
    const welcomeTimer = setTimeout(() => {
      setMessages([{
        role: 'assistant',
        content: "Hi Mama! 👋 I'm Dr. Pedia, your free online pediatric health guide. Got a question about your little one? I'm here to help! You can ask me up to 5 questions — no sign-in needed. 🩺💕",
        id: 'welcome',
      }]);
      setHasShownBadge(true);
    }, 2500);

    // Auto-open the chat window at 3 seconds
    const openTimer = setTimeout(() => {
      setIsOpen(true);
    }, 3000);

    return () => {
      clearTimeout(welcomeTimer);
      clearTimeout(openTimer);
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 100);
  }, [isOpen]);

  const handleGoogleLogin = () => {
    window.location.href = `${import.meta.env.VITE_SERVER_URL}/api/auth/google`;
  };

  const sendMessage = useCallback(async () => {
    if (!input.trim() || isLoading) return;

    if (userMessageCount >= MAX_GUEST_MESSAGES) {
      setShowLoginModal(true);
      return;
    }

    const text = input.trim();
    const newCount = userMessageCount + 1;

    // Snapshot history before state updates (avoids stale closure)
    const historyForApi = messagesRef.current
      .filter((m) => m.id !== 'welcome')
      .map((m) => ({ role: m.role, content: m.content }));

    setUserMessageCount(newCount);
    setMessages((prev) => [
      ...prev,
      { role: 'user', content: text, id: `user-${Date.now()}` },
    ]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch(
        `${import.meta.env.VITE_SERVER_URL}/api/guest-chat/message`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: text, history: historyForApi }),
        }
      );

      if (!res.ok) throw new Error(`Server error: ${res.status}`);

      const data = await res.json();
      const reply: string = data.reply || "I'm sorry, I couldn't respond. Please try again!";

      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: reply, id: `ai-${Date.now()}` },
      ]);

      if (newCount >= MAX_GUEST_MESSAGES) {
        setTimeout(() => setShowLoginModal(true), 1200);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: "Oops! I had a little hiccup connecting to Dr. Pedia. Please try again! 💙",
          id: `ai-err-${Date.now()}`,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, userMessageCount]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }, [sendMessage]);

  const { isListening, toggleListening } = useSpeechInput({
    onResult: (text) => setInput((prev) => prev ? prev + ' ' + text : text),
  });

  const remainingMessages = MAX_GUEST_MESSAGES - userMessageCount;

  return (
    <>
      {/* Floating Chat Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          aria-label="Chat with Dr. Pedia"
          className="fixed bottom-6 right-6 z-50 w-16 h-16 bg-blue-500 hover:bg-blue-600 active:scale-95 text-white rounded-full shadow-2xl flex items-center justify-center transition-all duration-200 hover:scale-110"
        >
          <span className="text-3xl">🩺</span>
          {hasShownBadge && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-pink-500 rounded-full flex items-center justify-center text-xs font-bold text-white animate-bounce">
              1
            </span>
          )}
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-0 right-0 sm:bottom-6 sm:right-6 z-50 w-full sm:w-[390px] h-[92dvh] sm:h-[600px] bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-blue-100">

          {/* Header */}
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-5 py-4 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 bg-white rounded-full flex items-center justify-center text-2xl shadow-md flex-shrink-0">🩺</div>
              <div>
                <p className="text-white font-bold text-base leading-tight">Dr. Pedia</p>
                <div className="flex items-center gap-1 mt-0.5">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse inline-block"></span>
                  <p className="text-blue-100 text-xs">Pediatric Health Guide • Online now</p>
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/80 hover:text-white p-2 rounded-full hover:bg-white/20 transition-colors"
              aria-label="Close chat"
            >
              <FaTimes className="text-xl" />
            </button>
          </div>

          {/* Remaining questions banner */}
          {userMessageCount > 0 && userMessageCount < MAX_GUEST_MESSAGES && (
            <div className="bg-pink-50 border-b border-pink-100 px-4 py-2 text-center flex-shrink-0">
              <p className="text-xs text-pink-600 font-medium">
                💬 {remainingMessages} free question{remainingMessages !== 1 ? 's' : ''} left ·{' '}
                <button onClick={handleGoogleLogin} className="underline font-semibold hover:text-pink-800 transition-colors">
                  Sign in for unlimited
                </button>
              </p>
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-gradient-to-b from-blue-50/40 to-white">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex items-end gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-base flex-shrink-0 shadow-sm">🩺</div>
                )}
                <div className={`max-w-[78%] px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm ${
                  msg.role === 'user'
                    ? 'bg-blue-500 text-white rounded-br-none'
                    : 'bg-white text-gray-800 rounded-bl-none border border-gray-100'
                }`}>
                  {msg.content}
                </div>
                {msg.role === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-400 to-rose-400 flex items-center justify-center text-white text-xs font-bold flex-shrink-0 shadow-sm">
                    You
                  </div>
                )}
              </div>
            ))}

            {/* Typing dots while waiting for response */}
            {isLoading && (
              <div className="flex items-end gap-2">
                <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-base flex-shrink-0">🩺</div>
                <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-none px-4 py-3 shadow-sm">
                  <div className="flex gap-1 items-center">
                    <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:0ms]"></span>
                    <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:150ms]"></span>
                    <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:300ms]"></span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="px-4 py-3 bg-white border-t border-gray-100 flex-shrink-0">
            {userMessageCount >= MAX_GUEST_MESSAGES ? (
              <div className="text-center py-1">
                <p className="text-sm text-gray-500 mb-3">Sign in to keep chatting with Dr. Pedia! 💙</p>
                <button
                  onClick={handleGoogleLogin}
                  className="w-full flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 active:scale-95 text-white font-semibold py-3 px-4 rounded-2xl shadow-md transition-all text-base"
                >
                  <FaGoogle />
                  <span>Continue with Google — Free!</span>
                </button>
              </div>
            ) : (
              <div className="flex items-end gap-2">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={isListening ? 'Listening… speak now 🎙️' : 'Ask Dr. Pedia about your child…'}
                  rows={1}
                  disabled={isLoading}
                  className={`flex-1 resize-none border rounded-2xl px-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent max-h-24 overflow-y-auto disabled:opacity-60 transition-colors ${
                    isListening
                      ? 'bg-red-50 border-red-300 focus:ring-red-300'
                      : 'bg-gray-50 border-gray-200 focus:ring-blue-300'
                  }`}
                  style={{ lineHeight: '1.5' }}
                />
                <button
                  onClick={toggleListening}
                  disabled={isLoading}
                  aria-label={isListening ? 'Stop recording' : 'Start voice input'}
                  className={`w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 transition-all shadow-sm ${
                    isListening
                      ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-500'
                  }`}
                >
                  {isListening ? <FaStop className="text-sm" /> : <FaMicrophone className="text-sm" />}
                </button>
                <button
                  onClick={sendMessage}
                  disabled={!input.trim() || isLoading}
                  aria-label="Send message"
                  className="w-11 h-11 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 active:scale-95 text-white rounded-full flex items-center justify-center flex-shrink-0 transition-all shadow-sm"
                >
                  <FaPaperPlane className="text-sm" />
                </button>
              </div>
            )}
            <p className="text-center text-xs text-gray-400 mt-2">Not a substitute for professional medical care</p>
          </div>
        </div>
      )}

      {/* Login Modal */}
      {showLoginModal && (
        <div
          className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center sm:p-4 bg-black/50 backdrop-blur-sm"
          onClick={(e) => { if (e.target === e.currentTarget) setShowLoginModal(false); }}
        >
          <div className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl animate-slide-up">
            <div className="bg-gradient-to-r from-pink-400 via-rose-400 to-blue-500 px-6 py-7 text-center">
              <div className="text-5xl mb-3">🩺💕</div>
              <h2 className="text-white font-bold text-2xl leading-tight">You've used your 5 free questions!</h2>
              <p className="text-white/90 text-sm mt-2">Dr. Pedia would love to keep helping you, Mama</p>
            </div>
            <div className="px-6 py-6">
              <p className="text-gray-700 text-center text-base leading-relaxed mb-6">
                Sign in with Google to get <strong className="text-blue-600">unlimited access</strong> to Dr. Pedia — completely <strong className="text-green-600">free</strong> for all parents! 🌟
              </p>
              <button
                onClick={handleGoogleLogin}
                className="w-full flex items-center justify-center gap-3 bg-blue-500 hover:bg-blue-600 active:scale-95 text-white font-bold py-4 px-6 rounded-2xl shadow-lg hover:shadow-xl transition-all text-base mb-3"
              >
                <FaGoogle className="text-lg" />
                <span>Continue with Google — It's Free!</span>
              </button>
              <button
                onClick={() => setShowLoginModal(false)}
                className="w-full text-gray-400 hover:text-gray-600 py-3 text-sm transition-colors"
              >
                Maybe later
              </button>
              <div className="mt-4 flex items-center justify-center gap-5 text-xs text-gray-400">
                <span>✅ Free forever</span>
                <span>✅ Private & secure</span>
                <span>✅ No credit card</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default GuestChatWidget;
