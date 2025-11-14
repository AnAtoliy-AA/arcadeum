import { useLanguage } from "@/app/i18n/LanguageProvider";

export function useTranslation() {
  const { messages } = useLanguage();

  const t = (key: string, params?: Record<string, string>): string => {
    const keys = key.split(".");
    let value: unknown = messages;

    for (const k of keys) {
      if (value && typeof value === "object" && k in value) {
        value = (value as Record<string, unknown>)[k];
      } else {
        return key;
      }
    }

    if (typeof value === "string") {
      if (params) {
        return Object.entries(params).reduce(
          (str, [k, v]) => str.replace(`{${k}}`, v),
          value
        );
      }
      return value;
    }

    return key;
  };

  return { t };
}
