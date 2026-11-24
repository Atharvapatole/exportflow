'use client';

import React, { useState } from 'react';
import {
  Sparkles,
  Send,
  X,
  Check,
  Undo2,
  AlertCircle,
  HelpCircle,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';
import { BaseDocument, AiQuotationChangeProposal } from '@/types';

interface AiQuotationAssistantProps {
  isOpen: boolean;
  onClose: () => void;
  currentDoc: BaseDocument;
  onApplyChanges: (changes: Partial<BaseDocument>) => void;
  onUndoLastChange: () => void;
  canUndo: boolean;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  proposal?: AiQuotationChangeProposal;
  timestamp: string;
}

const QUICK_PROMPTS = [
  'Add my company logo at top left',
  'Switch to Premium International template',
  'Change payment to 30% advance and 70% against BL copy',
  'Add port of loading as Nhava Sheva (INNSA)',
  'Add bank wire transfer details',
  'Remove buyer acceptance section',
  'Improve commercial terms with international force majeure',
  'Set currency to USD and Incoterm CIF',
];

export function AiQuotationAssistant({
  isOpen,
  onClose,
  currentDoc,
  onApplyChanges,
  onUndoLastChange,
  canUndo,
}: AiQuotationAssistantProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content:
        'Hello! I am your ExportFlow AI Document Assistant. Tell me what changes you would like to make to your quotation — from styling and logo placement to pricing, Incoterms, and commercial terms.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeProposal, setActiveProposal] = useState<AiQuotationChangeProposal | null>(null);
  const [appliedProposalSummary, setAppliedProposalSummary] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSend = async (userPrompt?: string) => {
    const textToSend = userPrompt || input.trim();
    if (!textToSend || loading) return;

    setInput('');
    const userMsg: ChatMessage = {
      id: `usr_${Date.now()}`,
      role: 'user',
      content: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);
    setActiveProposal(null);
    setAppliedProposalSummary(null);

    try {
      const res = await fetch('/api/ai/quotation-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: textToSend,
          currentDoc,
          chatHistory: messages.slice(-4),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to process AI request');
      }

      const proposal: AiQuotationChangeProposal = data.proposal;

      const aiMsg: ChatMessage = {
        id: `ai_${Date.now()}`,
        role: 'assistant',
        content: proposal.explanation || proposal.summary,
        proposal,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, aiMsg]);
      setActiveProposal(proposal);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: `err_${Date.now()}`,
          role: 'assistant',
          content: `⚠️ Error: ${err.message}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = (proposal: AiQuotationChangeProposal) => {
    onApplyChanges(proposal.changes);
    setAppliedProposalSummary(proposal.summary);
    setActiveProposal(null);
  };

  return (
    <div className="fixed inset-y-0 right-0 w-full sm:w-[460px] bg-white shadow-2xl border-l border-slate-200 z-50 flex flex-col no-print animate-in slide-in-from-right duration-200">
      {/* Drawer Header */}
      <div className="p-4 bg-[#10243A] text-white flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-400/20 text-amber-300 flex items-center justify-center">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-1.5">
              ExportFlow AI Document Assistant
            </h2>
            <p className="text-[10px] text-slate-300">
              Describe what you want. Let AI prepare your quotation.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {canUndo && (
            <Button
              size="sm"
              variant="ghost"
              onClick={onUndoLastChange}
              title="Undo last AI change"
              className="text-slate-300 hover:text-white hover:bg-slate-800 h-8 px-2 text-xs"
            >
              <Undo2 className="w-3.5 h-3.5 mr-1" />
              Undo
            </Button>
          )}
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Applied Confirmation Banner */}
      {appliedProposalSummary && (
        <div className="bg-emerald-50 border-b border-emerald-200 p-2.5 px-4 text-xs text-emerald-800 flex items-center justify-between">
          <div className="flex items-center gap-1.5 font-semibold">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Applied: {appliedProposalSummary}</span>
          </div>
          <button
            onClick={() => setAppliedProposalSummary(null)}
            className="text-emerald-700 hover:text-emerald-900 text-[10px]"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Messages Stream */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`max-w-[90%] p-3 rounded-xl text-xs leading-relaxed ${
                m.role === 'user'
                  ? 'bg-blue-600 text-white rounded-br-none'
                  : 'bg-slate-100 text-slate-800 rounded-bl-none border border-slate-200'
              }`}
            >
              <p className="whitespace-pre-line">{m.content}</p>

              {/* Proposal Clarification Question */}
              {m.proposal?.clarificationNeeded && (
                <div className="mt-2.5 p-2 rounded bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-1.5 text-[11px]">
                  <HelpCircle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block">Clarification Needed:</span>
                    <p>{m.proposal.clarificationNeeded}</p>
                  </div>
                </div>
              )}

              {/* Commercial Changes Highlight */}
              {m.proposal?.highlightedCommercialChanges &&
                m.proposal.highlightedCommercialChanges.length > 0 && (
                  <div className="mt-2.5 p-2 rounded bg-blue-50 border border-blue-200 text-[11px] space-y-1">
                    <span className="font-bold text-blue-900 block text-[10px] uppercase">
                      Commercial Terms Modified:
                    </span>
                    {m.proposal.highlightedCommercialChanges.map((hc, i) => (
                      <div key={i} className="text-slate-700 flex items-center justify-between">
                        <span className="font-semibold">{hc.field}:</span>
                        <span>
                          <span className="line-through text-slate-400 mr-1">{String(hc.oldValue)}</span>
                          <span className="font-bold text-blue-700">{String(hc.newValue)}</span>
                        </span>
                      </div>
                    ))}
                  </div>
                )}
            </div>
            <span className="text-[9px] text-slate-400 mt-1 px-1">{m.timestamp}</span>
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2 text-xs text-slate-500 italic p-3 bg-slate-50 rounded-lg border border-slate-200 max-w-[80%]">
            <Sparkles className="w-3.5 h-3.5 animate-spin text-amber-500" />
            <span>AI Assistant is analyzing quotation & drafting updates...</span>
          </div>
        )}

        {/* Proposed Changes Pending Confirmation Card */}
        {activeProposal && !loading && (
          <div className="p-3.5 rounded-xl border-2 border-blue-500/40 bg-blue-50/40 space-y-3">
            <div className="flex items-center gap-2 text-blue-900">
              <Zap className="w-4 h-4 text-amber-500" />
              <span className="text-xs font-bold uppercase tracking-wider">AI Proposed Changes</span>
            </div>

            <p className="text-xs text-slate-700 font-medium">{activeProposal.summary}</p>

            <div className="flex items-center gap-2 pt-1">
              <Button
                size="sm"
                onClick={() => handleApply(activeProposal)}
                className="bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs h-8 gap-1.5 flex-1"
              >
                <Check className="w-3.5 h-3.5" />
                Apply Changes
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setActiveProposal(null)}
                className="text-xs h-8 text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Suggested Quick Prompt Chips */}
      <div className="p-2.5 px-4 bg-slate-50 border-t border-slate-200">
        <span className="text-[10px] text-slate-400 uppercase font-semibold block mb-1.5">
          Suggested Instructions:
        </span>
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {QUICK_PROMPTS.map((prompt) => (
            <button
              key={prompt}
              onClick={() => handleSend(prompt)}
              className="whitespace-nowrap px-2.5 py-1 rounded-full text-[10px] font-medium bg-white border border-slate-200 text-slate-700 hover:border-blue-400 hover:text-blue-600 transition-colors shrink-0 shadow-2xs"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      {/* Input Area */}
      <div className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
        <input
          type="text"
          placeholder="e.g. Add 5% discount, change currency to EUR, put logo on right..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSend();
          }}
          disabled={loading}
          className="flex-1 bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        <Button
          onClick={() => handleSend()}
          disabled={!input.trim() || loading}
          size="sm"
          className="bg-blue-600 hover:bg-blue-500 text-white h-9 px-3 shrink-0"
        >
          <Send className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  );
}
