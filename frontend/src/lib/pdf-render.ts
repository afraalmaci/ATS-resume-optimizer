// Draws the pages of a PDF into a container with pdf.js, entirely in the
// browser. Used for the resume preview: it works the same on phones, where
// the browser's built-in PDF viewer cannot be embedded in a page.

// Must match the installed pdfjs-dist version (checked by a unit test).
const WORKER_SRC = "/pdf.worker.min.js";
// A resume is short; this only guards against very large files.
const MAX_PAGES = 20;

/**
 * Appends one canvas per page to `container`, sized to its width and sharp
 * on high-density screens. Returns the document's page count.
 */
export async function renderPdfPages(
  file: File,
  container: HTMLElement,
  isCancelled: () => boolean,
): Promise<number> {
  // Loaded on demand: pdf.js only runs in the browser and is not needed
  // until someone opens a preview.
  const pdfjs = await import("pdfjs-dist");
  pdfjs.GlobalWorkerOptions.workerSrc = WORKER_SRC;

  const data = new Uint8Array(await file.arrayBuffer());
  // No eval: hardening against malicious PDFs (font code is never executed).
  const doc = await pdfjs.getDocument({ data, isEvalSupported: false }).promise;

  try {
    const width = container.clientWidth;
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 3);
    const pages = Math.min(doc.numPages, MAX_PAGES);

    for (let n = 1; n <= pages; n++) {
      if (isCancelled()) break;
      const page = await doc.getPage(n);
      const unscaled = page.getViewport({ scale: 1 });
      const viewport = page.getViewport({
        scale: (width / unscaled.width) * pixelRatio,
      });

      const canvas = document.createElement("canvas");
      canvas.width = Math.floor(viewport.width);
      canvas.height = Math.floor(viewport.height);
      canvas.style.width = "100%";
      canvas.style.height = "auto";
      canvas.setAttribute("role", "img");
      canvas.setAttribute("aria-label", `Page ${n}`);
      canvas.className = "block bg-white shadow-lg";
      container.appendChild(canvas);

      await page.render({ canvas, viewport }).promise;
    }
    return doc.numPages;
  } finally {
    void doc.destroy();
  }
}
