import React, { memo } from 'react';
import { XStack, styled } from 'tamagui';
import { Input } from '../Input/Input';
import { Button } from '../Button/Button';

export type ChatInputProps = {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  disabled?: boolean;
  placeholder?: string;
  sendText?: string;
};

const InputContainer = styled(XStack, {
  padding: '$4 $5',
  backgroundColor: '$glassBg',
  borderTopWidth: 1,
  borderTopColor: '$glassBorder',
  gap: '$3',
  ai: 'center',
  backdropFilter: 'blur(16px)',
  shadowColor: '$shadowColor',
  shadowOffset: { width: 0, height: -4 },
  shadowOpacity: 0.1,
  shadowRadius: 10,
});

export const ChatInput = memo(function ChatInput({
  value,
  onChange,
  onSend,
  disabled,
  placeholder = 'Type a message...',
  sendText = 'Send',
}: ChatInputProps) {
  const handleKeyPress = (e: any) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  return (
    <InputContainer>
      <Input
        value={value}
        onChangeText={onChange}
        onKeyPress={handleKeyPress}
        placeholder={placeholder}
        disabled={disabled}
        fullWidth
      />
      <Button
        onPress={onSend}
        disabled={disabled || !value.trim()}
        variant="primary"
        showShimmer
        size="md"
      >
        {sendText}
      </Button>
    </InputContainer>
  );
});
