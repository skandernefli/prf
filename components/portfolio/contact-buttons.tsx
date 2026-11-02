"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type ContactId = "email" | "linkedin" | "phone";

type ContactValue = {
  element: HTMLSpanElement;
  canonicalValue: string;
};

export function ContactButtons() {
  const [copiedId, setCopiedId] = useState<ContactId | null>(null);
  const [status, setStatus] = useState("");
  const statusTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const copiedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const selectionTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const announce = useCallback((message: string) => {
    setStatus(message);
    if (statusTimer.current) clearTimeout(statusTimer.current);
    statusTimer.current = setTimeout(() => setStatus(""), 2000);
  }, []);

  const copyText = useCallback(async (text: string) => {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return;
    }

    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();

    try {
      if (!document.execCommand("copy")) {
        throw new Error("Clipboard copy command was rejected.");
      }
    } finally {
      document.body.removeChild(textarea);
    }
  }, []);

  const copyFromButton = useCallback(
    async (id: ContactId, text: string) => {
      try {
        await copyText(text);
        setCopiedId(id);
        announce(`Copied: ${text}`);
        if (copiedTimer.current) clearTimeout(copiedTimer.current);
        copiedTimer.current = setTimeout(() => setCopiedId(null), 1500);
      } catch {
        announce("Copy failed");
      }
    },
    [announce, copyText],
  );

  const handleSelection = useCallback(
    async ({ element, canonicalValue }: ContactValue) => {
      const selection = window.getSelection();
      const selectedText = selection?.toString().trim() ?? "";

      if (!selectedText || !selection?.anchorNode || !element.contains(selection.anchorNode)) {
        return;
      }

      const text =
        selectedText === element.textContent?.trim() ? canonicalValue : selectedText;

      try {
        await copyText(text);
        announce(`Copied: ${text}`);
      } catch {
        announce("Copy failed");
      }
    },
    [announce, copyText],
  );

  const handleTouchSelection = useCallback(
    (contactValue: ContactValue) => {
      if (selectionTimer.current) clearTimeout(selectionTimer.current);
      selectionTimer.current = setTimeout(() => {
        void handleSelection(contactValue);
      }, 50);
    },
    [handleSelection],
  );

  useEffect(
    () => () => {
      if (statusTimer.current) clearTimeout(statusTimer.current);
      if (copiedTimer.current) clearTimeout(copiedTimer.current);
      if (selectionTimer.current) clearTimeout(selectionTimer.current);
    },
    [],
  );

  const emailValue = "skander.nefli@gmail.com";
  const linkedInValue = "https://www.linkedin.com/in/skander-nefli/";
  const phoneValue = "+216 2106799";

  return (
    <section className="contact-links" aria-label="Contact links">
      <ul className="contact-list">
        <li className="contact-item">
          <a
            className="contact-link"
            href={`mailto:${emailValue}`}
            draggable={false}
            aria-label={`Send an email to ${emailValue}`}
            data-thread-anchor="contact-email"
            onClick={(event) => {
              if (window.getSelection()?.toString().trim()) event.preventDefault();
            }}
          >
            <span className="contact-label">01 / Email</span>
            <span
              className="contact-value"
              onMouseUp={(event) =>
                void handleSelection({
                  element: event.currentTarget,
                  canonicalValue: emailValue,
                })
              }
              onTouchEnd={(event) =>
                handleTouchSelection({
                  element: event.currentTarget,
                  canonicalValue: emailValue,
                })
              }
            >
              {emailValue}
            </span>
            <span className="contact-icon">
              <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                <rect x="3" y="5" width="18" height="14" />
                <path d="M3 6l9 7 9-7" />
              </svg>
            </span>
          </a>
          <button
            className="contact-copy-button"
            type="button"
            data-copied={copiedId === "email"}
            aria-label="Copy email address"
            onClick={() => void copyFromButton("email", emailValue)}
          >
            {copiedId === "email" ? "Copied" : "Copy"}
          </button>
        </li>

        <li className="contact-item">
          <a
            className="contact-link"
            href={linkedInValue}
            target="_blank"
            rel="noopener noreferrer"
            draggable={false}
            aria-label="Open LinkedIn profile"
            data-thread-anchor="contact-linkedin"
            onClick={(event) => {
              if (window.getSelection()?.toString().trim()) event.preventDefault();
            }}
          >
            <span className="contact-label">02 / LinkedIn</span>
            <span
              className="contact-value"
              onMouseUp={(event) =>
                void handleSelection({
                  element: event.currentTarget,
                  canonicalValue: linkedInValue,
                })
              }
              onTouchEnd={(event) =>
                handleTouchSelection({
                  element: event.currentTarget,
                  canonicalValue: linkedInValue,
                })
              }
            >
              linkedin.com/in/skander-nefli
            </span>
            <span className="contact-icon">
              <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                <g transform="translate(12 12) scale(1.3) translate(-12.75 -12)">
                  <path
                    vectorEffect="non-scaling-stroke"
                    d="M8 10v7M8 7h.01M12 17v-7M12 13c0-1.7 1.1-3 2.8-3s2.7 1.3 2.7 3v4"
                  />
                </g>
              </svg>
            </span>
          </a>
          <button
            className="contact-copy-button"
            type="button"
            data-copied={copiedId === "linkedin"}
            aria-label="Copy LinkedIn URL"
            onClick={() => void copyFromButton("linkedin", linkedInValue)}
          >
            {copiedId === "linkedin" ? "Copied" : "Copy"}
          </button>
        </li>

        <li className="contact-item">
          <div className="contact-link" data-thread-anchor="contact-phone">
            <span className="contact-label">03 / Phone &amp; WhatsApp</span>
            <span
              className="contact-value"
              onMouseUp={(event) =>
                void handleSelection({
                  element: event.currentTarget,
                  canonicalValue: phoneValue,
                })
              }
              onTouchEnd={(event) =>
                handleTouchSelection({
                  element: event.currentTarget,
                  canonicalValue: phoneValue,
                })
              }
            >
              {phoneValue}
            </span>
            <span className="contact-actions">
              <a
                className="contact-action"
                href="tel:+2162106799"
                draggable={false}
                aria-label="Call +216 2106799"
              >
                <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
              </a>
              <a
                className="contact-action"
                href="https://wa.me/2162106799"
                target="_blank"
                rel="noopener noreferrer"
                draggable={false}
                aria-label="Message +216 2106799 on WhatsApp"
              >
                <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                  <path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21" />
                  <path d="M9 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1a5 5 0 0 0 5 5h1a.5.5 0 0 0 0-1h-1a.5.5 0 0 0 0 1" />
                </svg>
              </a>
            </span>
          </div>
          <button
            className="contact-copy-button"
            type="button"
            data-copied={copiedId === "phone"}
            aria-label="Copy phone number"
            onClick={() => void copyFromButton("phone", phoneValue)}
          >
            {copiedId === "phone" ? "Copied" : "Copy"}
          </button>
        </li>
      </ul>
      <p className="contact-status" role="status" aria-live="polite">
        {status}
      </p>
    </section>
  );
}
