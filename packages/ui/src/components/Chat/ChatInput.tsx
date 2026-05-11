import { memo, useState } from 'react';
import { XStack, styled, View } from 'tamagui';
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

const InputContainer = styled(XStack, {
  name: 'ChatInputContainer',
  padding: '$3 $4',
  backgroundColor: '$glassBg',
  borderTopWidth: 1,
  borderTopColor: '$glassBorder',
  gap: '$3',
  ai: 'center',
  backdropFilter: 'blur(20px)',
  zIndex: 10,
  
  hoverStyle: {
    backgroundColor: '$glassBgHover',
  },
});

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
    <InputContainer 
      borderColor={isFocused ? '$primary' : '$glassBorder'}
    >
      <View flex={1}>
        <Input
          value={value}
          onChangeText={onChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          fullWidth
          unstyled
          paddingVertical="$2"
          fontSize="$4"
          backgroundColor="transparent"
          borderWidth={0}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
      </View>
      <Button
        onClick={onSend}
        disabled={disabled || !value.trim()}
        variant="primary"
        size="sm"
        circular
        icon={<SendIcon size={18} />}
        aria-label="Send"
        hoverStyle={{ scale: 1.1 }}
        pressStyle={{ scale: 0.9 }}
      />
    </InputContainer>
  );
});
