export interface GameCreationConfigProps<TOptions = Record<string, unknown>> {
  options: TOptions;
  onChange: (options: TOptions) => void;
}
