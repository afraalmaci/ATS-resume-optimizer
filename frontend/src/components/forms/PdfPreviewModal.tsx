"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { renderPdfPages } from "@/lib/pdf-render";

interface PdfPreviewModalProps {
  file: File;
  onClose: () => void;
}

type Status =
  | { kind: "rendering" }
  | { kind: "done"; pages: number }
  | { kind: "error" };

/**
 * Full-screen on phones, a large window on desktop. Closes with the close
 * button, Escape, a click outside, or the browser/phone back action. The
 * file never leaves the browser.
 */
export default function PdfPreviewModal({ file, onClose }: PdfPreviewModalProps) {
  const pagesRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const onCloseRef = useRef(onClose);
  const [status, setStatus] = useState<Status>({ kind: "rendering" });

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  // A history entry for the preview, so "back" closes it instead of leaving
  // the page (how people close things on phones).
  useEffect(() => {
    window.history.pushState({ pdfPreview: true }, "");
    const onPopState = () => onCloseRef.current();
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  const close = useCallback(() => {
    if ((window.history.state as { pdfPreview?: boolean } | null)?.pdfPreview) {
      window.history.back(); // the popstate handler then calls onClose
    } else {
      onCloseRef.current();
    }
  }, []);

  // Escape to close, focus on the close button, and no page scrolling behind.
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKeyDown);
    const previousFocus = document.activeElement as HTMLElement | null;
    closeButtonRef.current?.focus();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      previousFocus?.focus?.();
    };
  }, [close]);

  useEffect(() => {
    const container = pagesRef.current;
    if (!container) return;
    let cancelled = false;
    container.replaceChildren();
    renderPdfPages(file, container, () => cancelled)
      .then((pages) => !cancelled && setStatus({ kind: "done", pages }))
      .catch(() => !cancelled && setStatus({ kind: "error" }));
    return () => {
      cancelled = true;
    };
  }, [file]);

  const openInNewTab = () => {
    const url = URL.createObjectURL(file);
    window.open(url, "_blank", "noopener,noreferrer");
    setTimeout(() => URL.revokeObjectURL(url), 60_000);
  };

  const titleId = "pdf-preview-title";

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-stretch justify-center bg-black/70 sm:items-center sm:p-6"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) close();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="flex h-full w-full flex-col border-rule bg-panel sm:h-[90vh] sm:max-w-3xl sm:border"
      >
        <div className="flex items-center justify-between gap-3 border-b border-rule px-4 py-2 sm:px-5">
          <div className="flex min-w-0 items-center gap-3 text-xs uppercase tracking-[0.2em]">
            <span className="shrink-0 border border-rule px-1.5 py-0.5 text-dim">A</span>
            <h2 id={titleId} className="truncate font-medium normal-case tracking-normal">
              {file.name}
            </h2>
            <span className="shrink-0 text-dim" aria-live="polite">
              {status.kind === "done"
                ? `${status.pages} page${status.pages === 1 ? "" : "s"}`
                : "preview"}
            </span>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={close}
            aria-label="Close preview"
            className="-mr-2 flex h-11 min-w-11 items-center justify-center px-2 text-xs uppercase tracking-widest text-dim hover:text-ink focus-visible:outline focus-visible:outline-amber"
          >
            Close ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto overscroll-contain bg-panel-raised p-3 sm:p-6">
          {status.kind === "rendering" && (
            <p className="text-xs uppercase tracking-[0.2em] text-dim">
              Rendering<span className="animate-blink">_</span>
            </p>
          )}
          {status.kind === "error" && (
            <div className="border-l-4 border-red pl-4 text-sm">
              <p>Could not display this PDF here.</p>
              <button
                type="button"
                onClick={openInNewTab}
                className="mt-2 text-xs uppercase tracking-widest text-amber underline-offset-4 hover:underline"
              >
                Open in a new tab
              </button>
            </div>
          )}
          <div ref={pagesRef} className="mx-auto flex max-w-2xl flex-col gap-4" />
        </div>
      </div>
    </div>,
    document.body,
  );
}
