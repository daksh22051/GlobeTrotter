import React from 'react';
import { AssistantMessage, AssistantAction } from '../../types/intelligence';
import { Trip } from '../../types/trip';
import { ActionPreviewCard } from './ActionPreviewCard';
import { Sparkles, User } from 'lucide-react';

interface AssistantMessageItemProps {
  message: AssistantMessage;
  trip: Trip;
  onApplyAction: (action: AssistantAction) => void;
  onCancelAction: (action: AssistantAction) => void;
}

export const AssistantMessageItem: React.FC<AssistantMessageItemProps> = ({
  message,
  trip,
  onApplyAction,
  onCancelAction,
}) => {
  const isUser = message.role === 'user';

  // Basic markdown bold parser
  const renderFormattedContent = (content: string) => {
    const lines = content.split('\n');
    return (
      <div className="space-y-1.5 text-xs sm:text-sm leading-relaxed">
        {lines.map((line, lIdx) => {
          if (!line.trim()) return <div key={lIdx} className="h-1" />;

          // Parse **bold** and *italic*
          const formatted = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

          return (
            <p
              key={lIdx}
              dangerouslySetInnerHTML={{ __html: formatted }}
              className={line.startsWith('- ') ? 'pl-2 border-l-2 border-[#20B8A6]/40' : ''}
            />
          );
        })}
      </div>
    );
  };

  return (
    <div
      className={`flex items-start gap-3 ${
        isUser ? 'flex-row-reverse justify-start' : 'flex-row justify-start'
      }`}
    >
      {/* Avatar */}
      <div
        className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 text-xs ${
          isUser
            ? 'bg-[#17201D] text-white'
            : 'bg-gradient-to-tr from-[#20B8A6] to-[#1F8A70] text-white shadow-xs'
        }`}
      >
        {isUser ? <User className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
      </div>

      {/* Bubble Container */}
      <div className={`max-w-[85%] space-y-1 ${isUser ? 'items-end text-right' : 'items-start text-left'}`}>
        <div
          className={`p-3.5 rounded-2xl ${
            isUser
              ? 'bg-[#17201D] text-white rounded-tr-xs'
              : 'bg-[#F9F7F1] text-[#17201D] border border-[#EAE6DD] rounded-tl-xs'
          }`}
        >
          {renderFormattedContent(message.content)}

          {/* Action Card Preview if assistant proposed one */}
          {message.action && (
            <ActionPreviewCard
              action={message.action}
              trip={trip}
              onApply={onApplyAction}
              onCancel={onCancelAction}
            />
          )}
        </div>

        <span className="text-[10px] text-[#838F8B] px-1 font-medium block">
          {message.timestamp}
        </span>
      </div>
    </div>
  );
};
