"use client";

import { useState, useRef, useEffect } from "react";

function trim(value?: string | null): string | undefined {
  if (!value) {
    return undefined;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

export type CopyActionButtonProps = {
  value: string;
  label: string;
  successMessage: string;
  className?: string;
  wrapperClassName?: string;
  buttonClassName?: string;
  noticeClassName?: string;
};

export function CopyActionButton({
  value,
  label,
  successMessage,
  className,
  wrapperClassName,
  buttonClassName,
  noticeClassName,
}: CopyActionButtonProps) {
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, []);

  const handleClick = async () => {
    try {
      const copyValue = trim(value);
      if (!copyValue) {
        throw new Error("empty-value");
      }

      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(copyValue);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = copyValue;
        textarea.setAttribute("readonly", "");
        textarea.style.position = "absolute";
        textarea.style.left = "-9999px";
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }

      setStatus("success");
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        setStatus("idle");
      }, 2200);
    } catch (error) {
      console.error("copy-action-error", error);
      setStatus("error");
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        setStatus("idle");
      }, 2200);
    }
  };

  return (
    <div className={[className, wrapperClassName].filter(Boolean).join(" ") || undefined}>
      <button type="button" className={buttonClassName} onClick={handleClick}>
        {label}
      </button>
      <span className={noticeClassName} role="status" aria-live="polite">
        {status === "success"
          ? successMessage
          : status === "error"
            ? "Unable to copy. Try again."
            : ""}
      </span>
    </div>
  );
}
