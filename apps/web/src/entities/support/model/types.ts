export type SupportTeamMember = {
  key: string;
  icon: string;
  name: string;
  role: string;
  bio: string;
  linkedin?: string;
};

export type BaseSupportAction = {
  key: 'payment' | 'sponsor' | 'coffee' | 'iban';
  icon: string;
  title: string;
  description: string;
  cta: string;
};

export type RouteSupportAction = BaseSupportAction & {
  type: 'route';
  href: string;
};

export type ExternalSupportAction = BaseSupportAction & {
  type: 'external';
  href: string;
};

export type CopySupportAction = BaseSupportAction & {
  type: 'copy';
  value: string;
  successMessage: string;
};

export type SupportAction =
  | RouteSupportAction
  | ExternalSupportAction
  | CopySupportAction;
