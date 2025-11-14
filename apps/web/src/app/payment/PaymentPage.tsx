"use client";

import { useState, useCallback } from "react";
import styled from "styled-components";
import { useSessionTokens } from "@/entities/session/model/useSessionTokens";
import { resolveApiUrl } from "@/shared/lib/api-base";
import { useTranslation } from "@/shared/lib/useTranslation";
import {
  isValidPaymentUrl,
  parseAmount,
  ERROR_COLOR,
  SUCCESS_COLOR,
} from "@/shared/config/payment-config";

const Page = styled.main`
  min-height: 100vh;
  padding: 2rem 1.5rem;
  background: ${({ theme }) => theme.background.base};
  color: ${({ theme }) => theme.text.primary};
`;

const Container = styled.div`
  max-width: 600px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

const Title = styled.h1`
  margin: 0;
  font-size: 2rem;
  font-weight: 700;
  color: ${({ theme }) => theme.text.primary};
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const FieldGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-size: 0.875rem;
  font-weight: 600;
  color: ${({ theme }) => theme.text.secondary};
`;

const Input = styled.input`
  padding: 0.75rem 1rem;
  border-radius: 12px;
  border: 1px solid ${({ theme }) => theme.surfaces.card.border};
  background: ${({ theme }) => theme.surfaces.card.background};
  color: ${({ theme }) => theme.text.primary};
  font-size: 1rem;

  &:focus {
    outline: 2px solid ${({ theme }) => theme.outlines.focus};
    outline-offset: 2px;
  }
`;

const TextArea = styled.textarea`
  padding: 0.75rem 1rem;
  border-radius: 12px;
  border: 1px solid ${({ theme }) => theme.surfaces.card.border};
  background: ${({ theme }) => theme.surfaces.card.background};
  color: ${({ theme }) => theme.text.primary};
  font-size: 1rem;
  min-height: 100px;
  resize: vertical;

  &:focus {
    outline: 2px solid ${({ theme }) => theme.outlines.focus};
    outline-offset: 2px;
  }
`;

const SubmitButton = styled.button`
  padding: 1rem;
  border-radius: 16px;
  border: none;
  background: ${({ theme }) => theme.buttons.primary.gradientStart};
  color: ${({ theme }) => theme.buttons.primary.text};
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: transform 0.2s ease;

  &:hover {
    transform: translateY(-2px);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.div`
  padding: 1rem;
  border-radius: 12px;
  background: ${({ theme }) => theme.surfaces.card.background};
  border: 1px solid ${ERROR_COLOR};
  color: ${ERROR_COLOR};
`;

const Success = styled.div`
  padding: 1rem;
  border-radius: 12px;
  background: ${({ theme }) => theme.surfaces.card.background};
  border: 1px solid ${SUCCESS_COLOR};
  color: ${SUCCESS_COLOR};
`;

export function PaymentPage() {
  const { snapshot } = useSessionTokens();
  const { t } = useTranslation();
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("GEL");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      const normalizedAmount = parseAmount(amount);
      if (!Number.isFinite(normalizedAmount) || normalizedAmount <= 0) {
        setError(
          t("payments.errors.invalidAmount") || "Please enter a valid amount"
        );
        return;
      }

      if (normalizedAmount > 1000000) {
        setError(
          t("payments.errors.amountTooLarge") ||
            "Amount is too large. Maximum is 1,000,000"
        );
        return;
      }

      setLoading(true);
      setError(null);
      setSuccess(false);

      try {
        const url = resolveApiUrl("/payments/session");
        const response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(snapshot.accessToken && {
              Authorization: `Bearer ${snapshot.accessToken}`,
            }),
          },
          body: JSON.stringify({
            amount: normalizedAmount,
            currency: currency.trim().toUpperCase(),
            description: note.trim() || undefined,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || "Failed to create payment session");
        }

        const data = await response.json();
        if (data.paymentUrl) {
          // Validate payment URL before opening
          if (!isValidPaymentUrl(data.paymentUrl)) {
            throw new Error(t("payments.errors.invalidUrl") || "Invalid payment URL received");
          }
          window.open(data.paymentUrl, "_blank", "noopener,noreferrer");
          setSuccess(true);
          setAmount("");
          setNote("");
        } else {
          throw new Error(t("payments.errors.noUrl") || "No payment URL received");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : (t("payments.errors.failed") || "Payment failed"));
      } finally {
        setLoading(false);
      }
    },
    [amount, currency, note, snapshot.accessToken, t]
  );

  return (
    <Page>
      <Container>
        <Title>{t("payments.title") || "Payment"}</Title>

        <Form onSubmit={handleSubmit}>
          <FieldGroup>
            <Label htmlFor="payment-amount">{t("payments.amountLabel") || "Amount"}</Label>
            <Input
              id="payment-amount"
              type="number"
              step="0.01"
              placeholder={t("payments.amountPlaceholder") || "0.00"}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              aria-required="true"
              aria-label={t("payments.amountAria") || "Payment amount"}
            />
          </FieldGroup>

          <FieldGroup>
            <Label htmlFor="payment-currency">{t("payments.currencyLabel") || "Currency"}</Label>
            <Input
              id="payment-currency"
              type="text"
              placeholder={t("payments.currencyPlaceholder") || "GEL"}
              value={currency}
              onChange={(e) => setCurrency(e.target.value.toUpperCase())}
              maxLength={8}
              required
              aria-required="true"
              aria-label={t("payments.currencyAria") || "Currency code"}
            />
          </FieldGroup>

          <FieldGroup>
            <Label htmlFor="payment-note">{t("payments.noteLabel") || "Note (optional)"}</Label>
            <TextArea
              id="payment-note"
              placeholder={t("payments.notePlaceholder") || "Add a note..."}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              aria-label={t("payments.noteAria") || "Payment note or description"}
            />
          </FieldGroup>

          {error && <ErrorMessage>{error}</ErrorMessage>}
          {success && (
            <Success>
              {t("payments.status.success") || "Payment session created successfully!"}
            </Success>
          )}

          <SubmitButton type="submit" disabled={loading}>
            {loading
              ? t("payments.submitting") || "Processing..."
              : t("payments.submit") || "Create Payment"}
          </SubmitButton>
        </Form>
      </Container>
    </Page>
  );
}

