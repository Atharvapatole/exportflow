'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  Send,
  Copy,
  Check,
  User,
  Lock,
  ArrowRight,
  Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

export default function AiAssistantPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm1',
      sender: 'assistant',
      text: "Hello! I am your ExportFlow AI Assistant. I can help you draft formal buyer emails, structure quotation commercial terms, explain Incoterms 2020 responsibilities, or refine your export catalog descriptions. How can I help with your export operations today?",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [creditsRemaining, setCreditsRemaining] = useState<number | null>(null);
  const [isLocked, setIsLocked] = useState(false);
  const [lockReason, setLockReason] = useState<string | null>(null);

  // Load wallet & AI balance
  const fetchAiBalance = async () => {
    try {
      const res = await fetch('/api/wallet');
      if (res.ok) {
        const data = await res.json();
        const available = data.aiBalance?.totalAvailable ?? 0;
        setCreditsRemaining(available);
        if (!data.aiBalance?.canUseAi || available <= 0) {
          setIsLocked(true);
          setLockReason('You have reached your AI Assistant message limit.');
        } else {
          setIsLocked(false);
          setLockReason(null);
        }
      }
    } catch (e) {
      console.warn('Failed to load wallet status:', e);
    }
  };

  useEffect(() => {
    fetchAiBalance();
  }, []);

  const suggestions = [
    'Draft a formal email cover letter for a new Quotation',
    'Write a polite follow-up email to a buyer who reviewed our quote',
    'Explain the key differences between FOB and CIF for my buyer',
    'Draft commercial terms for 30% advance and 70% against BL copy',
    'Suggest professional specifications for our organic agro export product',
  ];

  const handleSend = async (textToSend?: string) => {
    if (isLocked) return;
    const prompt = textToSend || input;
    if (!prompt.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `usr_${Date.now()}`,
      sender: 'user',
      text: prompt,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });

      if (res.status === 403) {
        const errData = await res.json();
        setIsLocked(true);
        setCreditsRemaining(0);
        setLockReason(errData.message || 'AI message limit reached.');
        setMessages((prev) => [
          ...prev,
          {
            id: `lock_${Date.now()}`,
            sender: 'assistant',
            text: `🔒 **Chat Locked**: ${errData.message || 'You have exhausted your AI messages.'} Please upgrade to continue chatting with the AI Assistant.`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
        return;
      }

      const data = await res.json();

      if (typeof data.remainingCredits === 'number') {
        setCreditsRemaining(data.remainingCredits);
        if (data.remainingCredits <= 0) {
          setIsLocked(true);
          setLockReason('You have exhausted your AI messages for this billing period.');
        }
      }

      const aiMsg: ChatMessage = {
        id: `ai_${Date.now()}`,
        sender: 'assistant',
        text: data.reply || 'No response generated.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `err_${Date.now()}`,
          sender: 'assistant',
          text: 'Unable to reach the AI service right now. Please check your network or try again.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-4 max-w-4xl mx-auto flex flex-col h-[calc(100vh-140px)]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">AI Export Trade Assistant</h1>
            <span className="px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-[10px] font-bold border border-blue-200 dark:border-blue-800">
              OpenRouter + Groq + Gemini
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">Context-aware trade assistant scoped to your products, buyers & documentation</p>
        </div>

        {/* AI Credit Balance Pill */}
        <div className="flex items-center gap-2">
          <div className={`px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-2 ${
            isLocked
              ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-300'
              : 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300'
          }`}>
            <Zap className="w-3.5 h-3.5" />
            <span>AI Credits: {creditsRemaining !== null ? creditsRemaining : '...'} remaining</span>
          </div>
          {isLocked && (
            <Link href="/pricing">
              <Button size="sm" className="bg-rose-600 hover:bg-rose-700 text-white text-xs gap-1">
                <Lock className="w-3 h-3" />
                Upgrade Plan
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Chat Locked Warning Alert */}
      {isLocked && (
        <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 dark:border-amber-500/40 flex items-center justify-between gap-3 text-xs text-amber-900 dark:text-amber-200">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-600 dark:text-amber-300 flex items-center justify-center shrink-0">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <p className="font-bold">Chat Interface Locked</p>
              <p className="text-[11px] opacity-90">{lockReason || 'You have exhausted your AI messages. Upgrade your plan or purchase an AI Credit Pack to resume chatting.'}</p>
            </div>
          </div>
          <Link href="/pricing">
            <Button size="sm" variant="secondary" className="text-xs shrink-0 gap-1 bg-amber-600 hover:bg-amber-700 text-white border-0">
              Unlock More Messages
              <ArrowRight className="w-3 h-3" />
            </Button>
          </Link>
        </div>
      )}

      {/* Chat Container */}
      <Card className="flex-1 flex flex-col overflow-hidden p-0 dark:bg-[#0E1524] dark:border-slate-800">
        {/* Messages Scroll Area */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex items-start gap-3 ${
                m.sender === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {m.sender === 'assistant' && (
                <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-sm">
                  <Sparkles className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-[80%] rounded-2xl p-4 text-xs leading-relaxed ${
                  m.sender === 'user'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200'
                }`}
              >
                <div className="whitespace-pre-line">{m.text}</div>

                <div className="flex items-center justify-between gap-4 mt-2 pt-2 border-t border-slate-200/40 dark:border-slate-700/50 text-[10px] opacity-70">
                  <span>{m.timestamp}</span>
                  {m.sender === 'assistant' && (
                    <button
                      type="button"
                      onClick={() => copyToClipboard(m.id, m.text)}
                      className="hover:opacity-100 flex items-center gap-1 cursor-pointer"
                    >
                      {copiedId === m.id ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                          <span className="text-emerald-600 dark:text-emerald-400 font-bold">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy draft</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>

              {m.sender === 'user' && (
                <div className="w-8 h-8 rounded-full bg-[#10243A] dark:bg-slate-700 text-white flex items-center justify-center font-bold text-xs shrink-0">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex items-center gap-2 text-xs text-slate-400 p-2">
              <Sparkles className="w-4 h-4 animate-spin text-blue-500" />
              <span>Analyzing export terms and drafting response...</span>
            </div>
          )}
        </div>

        {/* Quick Suggestion Pills */}
        {!isLocked && (
          <div className="p-3 bg-slate-50 dark:bg-slate-900/60 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2 overflow-x-auto text-[11px]">
            <span className="text-slate-400 font-bold uppercase text-[9px] shrink-0">Suggestions:</span>
            {suggestions.map((s, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSend(s)}
                className="px-2.5 py-1 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 whitespace-nowrap hover:border-blue-500 hover:text-blue-600 transition-colors cursor-pointer"
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {/* Chat Input Bar */}
        <div className="p-3 bg-white dark:bg-[#0E1524] border-t border-slate-200 dark:border-slate-800 flex items-center gap-2">
          <Input
            placeholder={
              isLocked
                ? '🔒 Chat is locked: AI message limit reached. Upgrade to continue.'
                : 'Ask anything about export quotations, buyer emails, Incoterms, or HS codes...'
            }
            value={input}
            disabled={isLocked || isLoading}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSend();
            }}
            className={isLocked ? 'opacity-60 cursor-not-allowed bg-slate-100 dark:bg-slate-800' : ''}
          />
          <Button
            size="md"
            variant="secondary"
            onClick={() => handleSend()}
            disabled={!input.trim() || isLoading || isLocked}
            className={isLocked ? 'opacity-50 cursor-not-allowed' : ''}
          >
            {isLocked ? <Lock className="w-4 h-4" /> : <Send className="w-4 h-4" />}
          </Button>
        </div>
      </Card>
    </div>
  );
}
