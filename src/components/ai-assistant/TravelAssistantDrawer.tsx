import React, { useState, useEffect, useRef } from 'react';
import { Trip } from '../../types/trip';
import { AssistantMessage, AssistantAction } from '../../types/intelligence';
import { aiTravelAssistantService } from '../../services/aiTravelAssistantService';
import { AssistantMessageItem } from './AssistantMessageItem';
import { QuickPromptList } from './QuickPromptList';
import {
  Sparkles,
  X,
  Send,
  Trash2,
  HeartPulse,
  Wand2,
  Calendar,
  DollarSign,
  Compass,
} from 'lucide-react';
import { tripHealthService } from '../../services/tripHealthService';

interface TravelAssistantDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  trip: Trip;
  onStateChange?: () => void;
}

export const TravelAssistantDrawer: React.FC<TravelAssistantDrawerProps> = ({
  isOpen,
  onClose,
  trip,
  onStateChange,
}) => {
  const [messages, setMessages] = useState<AssistantMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load History
  useEffect(() => {
    if (isOpen && trip) {
      const history = aiTravelAssistantService.getHistory(trip);
      setMessages(history);
    }
  }, [isOpen, trip]);

  // Scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  if (!isOpen) return null;

  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || inputValue.trim();
    if (!query || !trip) return;

    setInputValue('');

    const userMsg: AssistantMessage = {
      id: `msg_user_${Date.now()}`,
      role: 'user',
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setIsTyping(true);

    try {
      // Simulate intelligent processing delay
      setTimeout(async () => {
        const responseMsg = await aiTravelAssistantService.processQuery(trip, query, newHistory);
        const finalHistory = [...newHistory, responseMsg];
        setMessages(finalHistory);
        aiTravelAssistantService.saveHistory(trip.id, finalHistory);
        setIsTyping(false);
      }, 500);
    } catch {
      setIsTyping(false);
    }
  };

  const handleApplyAction = (action: AssistantAction) => {
    if (!trip) return;
    const success = aiTravelAssistantService.applyAction(trip, action);
    if (success) {
      // Mark action as applied in local message state
      const updatedMessages = messages.map((m) => {
        if (m.action?.id === action.id) {
          return {
            ...m,
            action: { ...m.action, status: 'applied' as const },
          };
        }
        return m;
      });
      setMessages(updatedMessages);
      aiTravelAssistantService.saveHistory(trip.id, updatedMessages);
      if (onStateChange) onStateChange();
    }
  };

  const handleCancelAction = (action: AssistantAction) => {
    const updatedMessages = messages.map((m) => {
      if (m.action?.id === action.id) {
        return {
          ...m,
          action: { ...m.action, status: 'cancelled' as const },
        };
      }
      return m;
    });
    setMessages(updatedMessages);
    aiTravelAssistantService.saveHistory(trip.id, updatedMessages);
  };

  const handleClearHistory = () => {
    localStorage.removeItem(`globetrotter_assistant_history_${trip.id}`);
    const fresh = aiTravelAssistantService.getHistory(trip);
    setMessages(fresh);
  };

  const health = tripHealthService.calculateHealth(trip);

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs animate-in fade-in">
      {/* Sliding Drawer Container */}
      <div className="w-full max-w-md md:max-w-lg bg-white h-full shadow-2xl flex flex-col border-l border-[#EAE6DD] animate-in slide-in-from-right duration-250">
        {/* Drawer Header */}
        <div className="p-4 sm:p-5 border-b border-[#F4F1EA] flex items-center justify-between bg-white sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#20B8A6] to-[#1F8A70] text-white flex items-center justify-center shadow-xs">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-extrabold text-[#17201D]">
                  AI Travel Copilot
                </h3>
                <span className="text-[10px] font-black text-[#1F8A70] bg-[#E8F8F5] px-2 py-0.5 rounded-full border border-[#A3E5D8]">
                  Context Active
                </span>
              </div>
              <p className="text-xs text-[#838F8B]">
                {trip.destination} · Health: {health.score}/100 ({health.label})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handleClearHistory}
              className="p-2 text-[#838F8B] hover:text-[#C72E33] hover:bg-[#FFF0F0] rounded-xl transition-colors cursor-pointer"
              title="Clear conversation"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-[#838F8B] hover:text-[#17201D] hover:bg-[#F9F7F1] rounded-xl transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Messages Scroll Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {messages.map((msg) => (
            <AssistantMessageItem
              key={msg.id}
              message={msg}
              trip={trip}
              onApplyAction={handleApplyAction}
              onCancelAction={handleCancelAction}
            />
          ))}

          {isTyping && (
            <div className="flex items-center gap-2 text-xs text-[#838F8B] p-3 bg-[#F9F7F1] rounded-2xl w-fit">
              <div className="w-2 h-2 rounded-full bg-[#20B8A6] animate-bounce" />
              <div className="w-2 h-2 rounded-full bg-[#20B8A6] animate-bounce [animation-delay:0.2s]" />
              <div className="w-2 h-2 rounded-full bg-[#20B8A6] animate-bounce [animation-delay:0.4s]" />
              <span className="font-semibold text-[#5E6B67] ml-1">Analyzing trip schedule...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestions Strip */}
        <div className="px-4 border-t border-[#F4F1EA] bg-white">
          <QuickPromptList onSelectPrompt={(p) => handleSendMessage(p)} />
        </div>

        {/* Input Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="p-4 border-t border-[#F4F1EA] bg-white flex items-center gap-2"
        >
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Ask anything or request itinerary changes..."
            className="flex-1 px-4 py-2.5 rounded-2xl bg-[#F9F7F1] border border-[#EAE6DD] text-xs sm:text-sm text-[#17201D] placeholder-[#838F8B] focus:outline-none focus:border-[#20B8A6] transition-colors"
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || isTyping}
            className="p-2.5 rounded-2xl bg-[#20B8A6] hover:bg-[#1CA393] text-white shadow-xs transition-all disabled:opacity-40 cursor-pointer"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
