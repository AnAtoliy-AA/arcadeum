// Fallback for using MaterialIcons on Android and web.

import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { SymbolWeight, SymbolViewProps } from 'expo-symbols';
import { ComponentProps } from 'react';
import { OpaqueColorValue, type StyleProp, type TextStyle } from 'react-native';

type IconMapping = Record<
  SymbolViewProps['name'],
  ComponentProps<typeof MaterialIcons>['name']
>;
type IconSymbolName = keyof typeof MAPPING;

/**
 * Add your SF Symbols to Material Icons mappings here.
 * - see Material Icons in the [Icons Directory](https://icons.expo.fyi).
 * - see SF Symbols in the [SF Symbols](https://developer.apple.com/sf-symbols/) app.
 */
const MAPPING = {
  'house.fill': 'home',
  'paperplane.fill': 'send',
  'chevron.left.forwardslash.chevron.right': 'code',
  'chevron.right': 'chevron-right',
  'chevron.left': 'chevron-left',
  'chevron.down': 'expand-more',
  'chevron.up': 'expand-less',
  'message.fill': 'chat',
  'gamecontroller.fill': 'sports-esports',
  'person.3.fill': 'groups',
  clock: 'schedule',
  'clock.fill': 'schedule',
  sparkles: 'auto-awesome',
  'gearshape.fill': 'settings',
  'lock.fill': 'lock',
  'lock.open': 'lock-open',
  book: 'menu-book',
  'rectangle.portrait.and.arrow.right': 'logout',
  'exclamationmark.triangle.fill': 'warning',
  'arrow.clockwise': 'refresh',
  'person.crop.circle': 'person-outline',
  'person.circle.fill': 'person',
  'rectangle.grid.2x2': 'grid-view',
  'square.grid.2x2': 'grid-view',
  rectangle: 'view-stream',
  'rectangle.stack': 'layers',
  'arrow.triangle.2.circlepath': 'autorenew',
  hourglass: 'hourglass-empty',
  'crown.fill': 'emoji-events',
  'play.fill': 'play-arrow',
  'hand.draw.fill': 'back-hand',
  'figure.walk': 'directions-walk',
  'bolt.fill': 'bolt',
  'list.bullet.rectangle': 'list',
  'star.circle.fill': 'stars',
  'cup.and.saucer.fill': 'local-cafe',
  'person.2.fill': 'people',
  'paintpalette.fill': 'palette',
  'cpu.fill': 'memory',
  'creditcard.fill': 'credit-card',
  'arrow.up.right': 'open-in-new',
  'doc.on.doc': 'content-copy',
  'checkmark.circle.fill': 'check-circle',
  circle: 'radio-button-unchecked',
  minus: 'remove',
  plus: 'add',
} as IconMapping;

/**
 * An icon component that uses native SF Symbols on iOS, and Material Icons on Android and web.
 * This ensures a consistent look across platforms, and optimal resource usage.
 * Icon `name`s are based on SF Symbols and require manual mapping to Material Icons.
 */
export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: SymbolWeight;
}) {
  return (
    <MaterialIcons
      color={color}
      size={size}
      name={MAPPING[name]}
      style={style}
    />
  );
}
