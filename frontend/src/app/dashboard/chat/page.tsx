'use client';

/**
 * EventPilot AI — AI Chat Assistant Page
 * ChatGPT-style interface with streaming responses and tool call visualization.
 */

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '@/lib/api';
import type { ChatMessageType } from '@/types';
import {
  Send, Sparkles, User, Bot, Loader2, Trash2,
  Calendar, DollarSign, Users, MapPin, Megaphone, Clock
} from 'lucide-react';
import toast from 'react-hot-toast';

const suggestions = [
  { text: 'Plan my wedding', icon: '💒' },
  { text: 'Find a cheaper venue', icon: '🏛️' },
  { text: 'Generate an invitation', icon: '💌' },
  { text: 'Suggest decoration ideas', icon: '🎨' },
  { text: 'Create an Instagram post', icon: '📸' },
  { text: 'Optimize my budget', icon: '💰' },
  { text: "Who hasn't RSVP'd?", icon: '📋' },
  { text: 'Create event schedule', icon: '📅' },
];

const intentIcons: Record<string, React.ReactNode> = {
  planner: <Calendar className="w-4 h-4" />,
  budget: <DollarSign className="w-4 h-4" />,
  vendor: <MapPin className="w-4 h-4" />,
  guest: <Users className="w-4 h-4" />,
  marketing: <Megaphone className="w-4 h-4" />,
  schedule: <Clock className="w-4 h-4" />,
};

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (content: string) => {
    if (!content.trim() || loading) return;

    const userMessage: ChatMessageType = { role: 'user', content };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const res = await api.sendChatMessage(content);
      const data = res.data as {
        response: string;
        suggestions?: string[];
        tool_calls?: Array<{ agent: string; result: Record<string, unknown> }>;
        intent?: string;
      };

      const assistantMessage: ChatMessageType = {
        role: 'assistant',
        content: data?.response || "I'm here to help! Please configure your Supabase and Gemini API keys to enable full functionality.",
        suggestions: data?.suggestions,
        tool_calls: data?.tool_calls,
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "👋 Welcome to EventPilot AI! To enable the AI chat, please configure your Supabase URL, Supabase key, and Gemini API key in the environment variables. Until then, I can show you around the interface!",
        suggestions: ['Create a new event', 'View the dashboard', 'Explore features'],
      }]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const clearHistory = () => {
    setMessages([]);
    api.getChatHistory().catch(() => {});
    toast.success('Chat cleared');
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-indigo-400" />
            AI Chat Assistant
          </h1>
          <p className="text-gray-500 text-xs mt-0.5">Ask me anything about your events</p>
        </div>
        {messages.length > 0 && (
          <button onClick={clearHistory} className="btn-ghost text-xs">
            <Trash2 className="w-3.5 h-3.5" /> Clear
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="text-6xl mb-6 animate-float">✨</div>
            <h2 className="text-xl font-semibold text-white mb-2">How can I help?</h2>
            <p className="text-gray-500 text-sm mb-8 text-center max-w-md">
              I can help you plan events, manage budgets, find vendors, create marketing content, and more.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 max-w-2xl">
              {suggestions.map((s, i) => (
                <button
                  key={i}
                  onClick={() => sendMessage(s.text)}
                  className="glass-card p-3 text-left text-sm text-gray-400 hover:text-white group"
                >
                  <span className="text-lg block mb-1">{s.icon}</span>
                  <span className="group-hover:text-indigo-300 transition-colors">{s.text}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <AnimatePresence>
            {messages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}
              >
                {msg.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                )}
                <div className={`max-w-[80%] ${msg.role === 'user' ? 'order-first' : ''}`}>
                  <div className={`p-4 rounded-2xl text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-indigo-500/20 border border-indigo-500/30 text-white ml-auto rounded-br-md'
                      : 'glass-card-static text-gray-300 rounded-bl-md'
                  }`}>
                    <div className="whitespace-pre-wrap">{msg.content}</div>

                    {/* Tool Calls */}
                    {msg.tool_calls && msg.tool_calls.length > 0 && (
                      <div className="mt-3 space-y-2">
                        {msg.tool_calls.map((tc, j) => (
                          <div key={j} className="p-3 rounded-lg bg-white/[0.03] border border-white/5">
                            <div className="flex items-center gap-2 text-xs text-indigo-300 mb-2">
                              {intentIcons[tc.agent] || <Sparkles className="w-3.5 h-3.5" />}
                              <span className="font-medium capitalize">{tc.agent} Agent</span>
                            </div>
                            <pre className="text-xs text-gray-500 overflow-x-auto max-h-32 overflow-y-auto">
                              {JSON.stringify(tc.result, null, 2).slice(0, 500)}
                            </pre>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Suggestions */}
                  {msg.suggestions && msg.suggestions.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {msg.suggestions.map((s, j) => (
                        <button
                          key={j}
                          onClick={() => sendMessage(s)}
                          className="px-3 py-1.5 rounded-full text-xs bg-white/[0.03] border border-white/5 text-gray-400 hover:text-indigo-300 hover:border-indigo-500/30 transition-all"
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                {msg.role === 'user' && (
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center flex-shrink-0">
                    <User className="w-5 h-5 text-white" />
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        )}

        {loading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div className="glass-card-static p-4 rounded-2xl rounded-bl-md">
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
                Thinking...
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="glass-card-static p-3 flex items-center gap-2">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage(input)}
          className="flex-1 bg-transparent border-none outline-none text-white text-sm placeholder-gray-600 px-3"
          placeholder="Ask me anything about your event..."
          disabled={loading}
        />
        <button
          onClick={() => sendMessage(input)}
          disabled={!input.trim() || loading}
          className="btn-primary p-2.5 rounded-xl disabled:opacity-30"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
