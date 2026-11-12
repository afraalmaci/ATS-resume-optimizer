import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import PdfPreviewModal from '../PdfPreviewModal';
import { renderPdfPages } from '@/lib/pdf-render';

// pdf.js needs a real browser canvas; the drawing itself is not tested here.
vi.mock('@/lib/pdf-render', () => ({ renderPdfPages: vi.fn() }));
const mockRender = vi.mocked(renderPdfPages);

const pdf = new File(['%PDF-1.4'], 'my-cv.pdf', { type: 'application/pdf' });

beforeEach(() => {
  mockRender.mockReset();
  mockRender.mockResolvedValue(2);
});

afterEach(() => {
  document.body.style.overflow = '';
});

describe('PdfPreviewModal', () => {
  it('shows the file in a dialog and draws its pages', async () => {
    render(<PdfPreviewModal file={pdf} onClose={() => {}} />);

    const dialog = screen.getByRole('dialog', { name: /my-cv\.pdf/i });
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    await waitFor(() => expect(mockRender).toHaveBeenCalled());
    expect(mockRender.mock.calls[0][0]).toBe(pdf);
    expect(await screen.findByText(/2 pages/i)).toBeInTheDocument();
  });

  it('moves focus to the close button and locks page scrolling', () => {
    render(<PdfPreviewModal file={pdf} onClose={() => {}} />);
    expect(screen.getByRole('button', { name: /close/i })).toHaveFocus();
    expect(document.body.style.overflow).toBe('hidden');
  });

  it('closes with the close button', async () => {
    const onClose = vi.fn();
    render(<PdfPreviewModal file={pdf} onClose={onClose} />);
    fireEvent.click(screen.getByRole('button', { name: /close/i }));
    await waitFor(() => expect(onClose).toHaveBeenCalled());
  });

  it('closes with Escape', async () => {
    const onClose = vi.fn();
    render(<PdfPreviewModal file={pdf} onClose={onClose} />);
    fireEvent.keyDown(document, { key: 'Escape' });
    await waitFor(() => expect(onClose).toHaveBeenCalled());
  });

  it("closes with the browser's back action instead of leaving the page", () => {
    const onClose = vi.fn();
    render(<PdfPreviewModal file={pdf} onClose={onClose} />);
    window.dispatchEvent(new PopStateEvent('popstate'));
    expect(onClose).toHaveBeenCalled();
  });

  it('offers to open the file in a new tab when it cannot be drawn', async () => {
    mockRender.mockRejectedValue(new Error('broken'));
    render(<PdfPreviewModal file={pdf} onClose={() => {}} />);
    expect(await screen.findByText(/could not display/i)).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /open in a new tab/i }),
    ).toBeInTheDocument();
  });
});
