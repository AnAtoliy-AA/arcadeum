export function filterProps<T extends Record<string, unknown>>(props: T): Omit<T, 'onPress'> {
  const { onPress: _, ...rest } = props;
  return {
    ...rest,
    onClick: props.onClick ?? props.onPress,
  } as unknown as Omit<T, 'onPress'>;
}
