/**
 * Payment configuration
 * Centralized configuration for payment-related settings
 */

export const ALLOWED_PAYMENT_DOMAINS = [
  "checkout.stripe.com",
  "pay.google.com",
  "paypal.com",
  "www.paypal.com",
  "sandbox.paypal.com",
  // Add your payment provider domains here
] as const;

export const ERROR_COLOR = "#F97316";
export const SUCCESS_COLOR = "#22c55e";

/**
 * Validates if a payment URL is from an allowed domain
 */
export function isValidPaymentUrl(url: string): boolean {
  try {
    const parsedUrl = new URL(url);
    return ALLOWED_PAYMENT_DOMAINS.some(
      (domain) =>
        parsedUrl.hostname === domain ||
        parsedUrl.hostname.endsWith(`.${domain}`)
    );
  } catch {
    return false;
  }
}

/**
 * Parses amount string to number, handling various formats
 */
export function parseAmount(value: string): number {
  // Remove all non-numeric characters except . and ,
  const cleaned = value.replace(/[^\d.,]/g, "");
  // Replace comma with dot for decimal separator
  const normalized = cleaned.replace(",", ".");
  // Remove all dots except the last one (handle thousands separators)
  const parts = normalized.split(".");
  if (parts.length > 2) {
    const integer = parts.slice(0, -1).join("");
    const decimal = parts[parts.length - 1];
    return Number(`${integer}.${decimal}`);
  }
  return Number(normalized);
}

