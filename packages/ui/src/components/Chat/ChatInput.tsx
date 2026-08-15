import { memo, useState } from 'react';
import { Input } from '../Input/Input';
import { Button } from '../Button/Button';
import { SendIcon } from '../Icons';

export type ChatInputProps = {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  disabled?: boolean;
  placeholder?: string;
  sendText?: string;
};

export const ChatInput = memo(function ChatInput({
  value,
  onChange,
  onSend,
  disabled,
  placeholder = 'Type a message...',
}: ChatInputProps) {
  const [isFocused, setIsFocused] = useState(false);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  return (
    <div
      style={{
        padding: '12px 16px',
        backgroundColor: 'var(--glassBg)',
        borderTopWidth: 1,
        borderTopStyle: 'solid',
        borderTopColor: 'var(--glassBorder)',
        display: 'flex',
        gap: 12,
        alignItems: 'center',
        backdropFilter: 'blur(20px)',
        zIndex: 10,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = 'var(--glassBgHover)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = 'var(--glassBg)';
      }}
    >
      <div style={{ flex: 1 }}>
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          fullWidth
          style={{
            padding: '8px 0',
            fontSize: 16,
            backgroundColor: 'transparent',
            borderWidth: 0,
            borderStyle: 'none',
            boxShadow: 'none',
          }}
          className="border-0 bg-transparent focus:border-0 focus:ring-0"
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
      </div>
      <Button
        onClick={onSend}
        disabled={disabled || !value.trim()}
        variant="primary"
        size="sm"
        shape="circle"
        icon={<SendIcon size={18} />}
        aria-label="Send"
        className="hover:scale-[1.1] active:scale-[0.9]"
      />
    </div>
  );
});
