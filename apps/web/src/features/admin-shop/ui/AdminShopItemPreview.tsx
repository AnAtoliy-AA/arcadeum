'use client';

import { YStack, Text } from 'tamagui';

interface Props {
  size: number;
  colorValue?: string | null;
  assetUrl?: string | null;
  itemId: string;
}

export function AdminShopItemPreview({
  size,
  colorValue,
  assetUrl,
  itemId,
}: Props) {
  // Determine text font size based on preview square size
  const fontSize = size >= 48 ? '$5' : size >= 32 ? '$3' : '$1';

  return (
    <YStack
      width={size}
      height={size}
      backgroundColor="$backgroundFocus"
      borderRadius="$2"
      alignItems="center"
      justifyContent="center"
      overflow="hidden"
    >
      {colorValue ? (
        <Text
          fontSize={fontSize}
          fontWeight="800"
          style={{
            backgroundImage: colorValue.startsWith('linear-gradient')
              ? colorValue
              : undefined,
            color: colorValue.startsWith('linear-gradient')
              ? 'transparent'
              : colorValue,
            WebkitBackgroundClip: colorValue.startsWith('linear-gradient')
              ? 'text'
              : undefined,
            backgroundClip: colorValue.startsWith('linear-gradient')
              ? 'text'
              : undefined,
            WebkitTextFillColor: colorValue.startsWith('linear-gradient')
              ? 'transparent'
              : undefined,
          }}
        >
          Aa
        </Text>
      ) : assetUrl ? (
        <img
          src={assetUrl}
          alt={itemId}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
          }}
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}
        />
      ) : (
        <Text fontSize="$1">?</Text>
      )}
    </YStack>
  );
}
