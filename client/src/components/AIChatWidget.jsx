import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send, X, Sparkles, Loader2, ChefHat, HelpCircle } from 'lucide-react';

const SUGGESTIONS = [
  { text: "Recommend a signature dish", query: "Can you recommend a signature dish?" },
  { text: "Is there gluten-free food?", query: "Which dishes are gluten-free?" },
  { text: "What is standard check-in?", query: "What is the standard check-in time for suites?" },
  { text: "Have any coupons?", query: "Do you have any discount coupons?" }
];

export default function AIChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'ai',
      text: 'Greetings! I am GourmetAI, your personal 5-star culinary concierge. I can recommend signature recipes, suggest wine pairings, clarify suite check-in hours, or guide you through table reservations. How may I serve you today?',
      createdAt: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, loading]);

  const handleSendMessage = async (textToSend) => {
    const text = textToSend || inputText;
    if (!text.trim()) return;

    if (!textToSend) {
      setInputText('');
    }

    const userMessage = {
      id: Math.random().toString(),
      sender: 'user',
      text,
      createdAt: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setLoading(true);

    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: text,
          history: messages
        })
      });

      const data = await res.json();
      if (res.ok) {
        setMessages(prev => [...prev, {
          id: Math.random().toString(),
          sender: 'ai',
          text: data.reply,
          createdAt: new Date()
        }]);
      } else {
        throw new Error(data.message || 'AI request failed');
      }
    } catch (err) {
      setMessages(prev => [...prev, {
        id: Math.random().toString(),
        sender: 'ai',
        text: 'Forgive me, I am having trouble connecting to my central recipe memory. However, I can confirm our Signature Seafood Platter ($34.50) and Traditional Crab Curry ($28.00) are both hot, gluten-free, and ready to order! Is there anything else I can check for you?',
        createdAt: new Date()
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      
      {/* Floating Circular Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="w-14 h-14 bg-[#7c562d] hover:bg-[#634423] text-white rounded-full flex items-center justify-center shadow-xl border border-amber-600/30 hover:scale-105 transition-all duration-300 relative group animate-bounce cursor-pointer"
          title="Open GourmetAI Concierge"
        >
          <MessageSquare className="w-6 h-6 transition-transform group-hover:rotate-12" />
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
          </span>
          <span className="absolute right-16 bg-neutral-900/90 text-white text-[10px] uppercase font-bold tracking-widest px-3 py-1.5 rounded-md border border-[#7c562d]/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none shadow-lg whitespace-nowrap">
            Ask GourmetAI ✦
          </span>
        </button>
      )}

      {/* Slide-up Chat Dashboard Window */}
      {isOpen && (
        <div className="w-[350px] sm:w-[380px] h-[500px] bg-neutral-900/95 backdrop-blur-md rounded-xl border border-neutral-800 shadow-2xl flex flex-col overflow-hidden animate-slide-in font-sans">
          
          {/* Header Panel */}
          <div className="bg-neutral-950 px-4.5 py-4 border-b border-neutral-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#7c562d]/25 border border-[#7c562d]/40 flex items-center justify-center text-[#7c562d]">
                <ChefHat className="w-4.5 h-4.5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-neutral-100 uppercase tracking-widest flex items-center gap-1">
                  GourmetAI <Sparkles className="w-3 h-3 text-amber-500 fill-current" />
                </h4>
                <p className="text-[9px] text-[#7c562d] uppercase tracking-wider font-semibold">5-Star Culinary Concierge</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-neutral-500 hover:text-neutral-250 p-1 transition-colors cursor-pointer"
            >
              <X className="w-4.5 h-4.5" />
            </button>
          </div>

          {/* Messages History List */}
          <div className="flex-grow overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-neutral-800">
            {messages.map((msg) => {
              const isUser = msg.sender === 'user';
              return (
                <div
                  key={msg.id}
                  className={`flex ${isUser ? 'justify-end' : 'justify-start'} animate-fade-in`}
                >
                  <div
                    className={`max-w-[80%] rounded px-3 py-2 text-xs leading-relaxed ${
                      isUser
                        ? 'bg-[#7c562d] text-white rounded-br-none shadow-sm'
                        : 'bg-neutral-800 text-neutral-200 border border-neutral-700/50 rounded-bl-none'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.text}</p>
                    <span className="text-[8px] text-neutral-400/80 block mt-1 text-right">
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              );
            })}
            
            {/* Loading / Typing indicator */}
            {loading && (
              <div className="flex justify-start animate-pulse">
                <div className="bg-neutral-800 text-neutral-400 border border-neutral-700/50 rounded rounded-bl-none px-3.5 py-2.5 text-xs flex items-center gap-1.5">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-[#7c562d]" />
                  <span className="text-[10px] italic">GourmetAI is checking recipes...</span>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestion Chips Panel */}
          {messages.length === 1 && !loading && (
            <div className="px-4 py-2 border-t border-neutral-800 bg-neutral-950/40 space-y-1.5">
              <p className="text-[8px] text-neutral-500 font-bold uppercase tracking-wider flex items-center gap-1">
                <HelpCircle className="w-3 h-3 text-[#7c562d]" /> Suggested Queries
              </p>
              <div className="flex flex-wrap gap-1.5 pb-1">
                {SUGGESTIONS.map((sug, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSendMessage(sug.query)}
                    className="text-[9px] bg-neutral-800 hover:bg-[#7c562d]/10 hover:text-white border border-neutral-700/60 hover:border-[#7c562d]/40 text-neutral-400 px-2.5 py-1 rounded transition-all duration-300 cursor-pointer"
                  >
                    {sug.text}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Send Input Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="px-4 py-3 border-t border-neutral-850 bg-neutral-950 flex gap-2 items-center"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Ask about signature menus, timings, coupons..."
              className="flex-grow bg-neutral-900 border border-neutral-800 focus:border-[#7c562d]/50 focus:ring-1 focus:ring-[#7c562d]/20 rounded px-3 py-2 text-xs focus:outline-none text-neutral-200"
            />
            <button
              type="submit"
              disabled={loading || !inputText.trim()}
              className="bg-[#7c562d] hover:bg-[#634423] disabled:bg-neutral-800 disabled:text-neutral-600 text-white p-2 rounded transition-colors cursor-pointer"
            >
              <Send className="w-4.5 h-4.5" />
            </button>
          </form>

        </div>
      )}

    </div>
  );
}
