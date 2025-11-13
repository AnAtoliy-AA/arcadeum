import "styled-components";

import type { ThemeTokens } from "./shared/config/theme";

declare module "styled-components" {
  export interface DefaultTheme extends ThemeTokens {
    /**
     * Nominal field to keep augmentation distinct from the base interface.
     * This lives only in the type system.
     */
    readonly __neverUseThisField?: never;
  }
}

export {};
