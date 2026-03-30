// ComposeBar — message input at the bottom of MessageThread.
// Enter = send, Shift+Enter = newline.
// PHI warning banner shows above bar when containsPhi() fires (non-blocking).
// Urgent toggle (⚡) and Send button (Navy → Red).

import { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Zap, AlertTriangle } from 'lucide-react';
import { containsPhi } from '../../utils/phiDetector';

interface ComposeBarProps {
  channelName: string;
  disabled?: boolean;
  onSend: (body: string, opts?: { isUrgent?: boolean }) => Promise<void>;
}

export function ComposeBar({ channelName, disabled, onSend }: ComposeBarProps) {
  const [body,      setBody]      = useState('');
  const [isUrgent,  setIsUrgent]  = useState(false);
  const [isSending, setIsSending] = useState(false);
  const textareaRef               = useRef<HTMLTextAreaElement>(null);

  const hasPhi     = body.length > 0 && containsPhi(body);
  const canSend    = body.trim().length > 0 && !isSending && !disabled;

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  }, [body]);

  const handleSend = useCallback(async () => {
    if (!canSend) return;
    const text = body.trim();
    setBody('');
    setIsUrgent(false);
    setIsSending(true);
    try {
      await onSend(text, { isUrgent });
    } finally {
      setIsSending(false);
      textareaRef.current?.focus();
    }
  }, [body, canSend, isUrgent, onSend]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="border-t border-slate-200 bg-white px-4 pt-3 pb-4 flex-shrink-0">

      {/* PHI warning — non-blocking */}
      {hasPhi && (
        <div className="flex items-start gap-2 mb-2 p-2.5 rounded-lg bg-amber-50 border border-amber-200">
          <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-amber-800 leading-relaxed">
            <span className="font-semibold">Possible PHI detected.</span> Avoid sharing patient
            identifiers in messages. Use the patient tag button or refer to chart numbers only.
          </p>
        </div>
      )}

      <div className={`flex items-end gap-2 rounded-xl border transition-colors ${
        hasPhi ? 'border-amber-300' : 'border-slate-200 focus-within:border-slate-900'
      } bg-white px-3 py-2`}>

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          rows={1}
          value={body}
          onChange={e => setBody(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled || isSending}
          placeholder={`Message ${channelName}`}
          className="flex-1 resize-none text-sm text-slate-900 placeholder:text-slate-400 bg-transparent
                     focus:outline-none leading-relaxed py-0.5 min-h-[24px]"
          aria-label={`Message ${channelName}`}
        />

        {/* Urgent toggle */}
        <button
          type="button"
          onClick={() => setIsUrgent(v => !v)}
          aria-label="Toggle urgent"
          aria-pressed={isUrgent}
          className={`p-1.5 rounded-lg transition-colors flex-shrink-0 ${
            isUrgent
              ? 'text-red-600 bg-red-50'
              : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Zap className="w-4 h-4" />
        </button>

        {/* Send */}
        <button
          type="button"
          onClick={handleSend}
          disabled={!canSend}
          aria-label="Send message"
          className="p-1.5 rounded-lg bg-[#0B3A70] text-white hover:bg-[#A60F2D]
                     transition-colors duration-300 disabled:opacity-40
                     disabled:cursor-not-allowed flex-shrink-0"
        >
          {isSending
            ? <span className="w-4 h-4 block rounded-full border-2 border-white/30 border-t-white animate-spin" />
            : <Send className="w-4 h-4" />
          }
        </button>
      </div>

      <p className="text-[10px] text-slate-400 mt-1.5 text-right">
        Enter to send · Shift+Enter for new line
      </p>
    </div>
  );
}
