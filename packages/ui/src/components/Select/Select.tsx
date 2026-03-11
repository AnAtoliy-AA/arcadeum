import { Select as TamaguiSelect, styled } from 'tamagui';
import { memo } from 'react';
import type { ReactNode } from 'react';

export type SelectProps = {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  error?: boolean;
  fullWidth?: boolean;
  options?: { label: string; value: string }[];
  children?: ReactNode;
  id?: string;
  name?: string;
  disabled?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  'data-testid'?: string;
  onChange?: (e: any) => void;
  style?: any;
  className?: string;
  'aria-label'?: string;
};

// `unstyled` bypasses the default variant that sets `elevate: true`, which Tamagui 2.0.0-rc.23
// forwards as a raw DOM attribute, causing a React warning.
const StyledSelectViewport = styled(TamaguiSelect.Viewport, {
  unstyled: true,
  size: '$4',
  backgroundColor: '$background',
  borderWidth: 1,
  borderColor: '$borderColorHover',
  shadowColor: '$shadowColor',
  shadowRadius: 20,
  shadowOpacity: 0.12,
  overflow: 'hidden',
});

const StyledSelectTrigger = styled(TamaguiSelect.Trigger, {
  name: 'SelectTrigger',
  paddingHorizontal: '$4',
  paddingVertical: '$3',
  borderRadius: '$4',
  borderWidth: 1,
  backgroundColor: '$background',
  borderColor: '$borderColor',

  hoverStyle: {
    borderColor: '$primary',
  },

  focusStyle: {
    borderColor: '$primary',
    borderWidth: 2,
    outlineColor: 'transparent',
  },

  variants: {
    error: {
      true: {
        borderColor: '$error',
        hoverStyle: { borderColor: '$error' },
        focusStyle: { borderColor: '$error' },
      },
    },
    fullWidth: {
      true: {
        width: '100%',
      },
    },
  } as const,
});

export const Select = memo(function Select({
  error = false,
  fullWidth = false,
  options,
  children,
  onValueChange,
  onChange,
  ...rest
}: SelectProps) {
  const handleValueChange = (val: string) => {
    onValueChange?.(val);
    onChange?.({ target: { value: val } });
  };

  return (
    <TamaguiSelect onValueChange={handleValueChange} {...rest}>
      <StyledSelectTrigger error={error} fullWidth={fullWidth} {...rest}>
        <TamaguiSelect.Value />
      </StyledSelectTrigger>

      <TamaguiSelect.Content>
        <TamaguiSelect.ScrollUpButton />
        <StyledSelectViewport>
          <TamaguiSelect.Group>
            {options?.map((option, i) => (
              <TamaguiSelect.Item
                index={i}
                key={option.value}
                value={option.value}
                paddingHorizontal="$4"
                paddingVertical="$2"
                borderRadius="$3"
                cursor="pointer"
              >
                <TamaguiSelect.ItemText>{option.label}</TamaguiSelect.ItemText>
              </TamaguiSelect.Item>
            ))}
            {children}
          </TamaguiSelect.Group>
        </StyledSelectViewport>
        <TamaguiSelect.ScrollDownButton />
      </TamaguiSelect.Content>
    </TamaguiSelect>
  );
});
