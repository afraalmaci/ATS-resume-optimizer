import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import ResumeUpload from '../ResumeUpload';

// pdf.js needs a real browser canvas; not drawn in these tests.
vi.mock('@/lib/pdf-render', () => ({
  renderPdfPages: vi.fn().mockResolvedValue(1),
}));

const pdf = new File(['%PDF-1.4'], 'my-cv.pdf', { type: 'application/pdf' });

describe('ResumeUpload', () => {
  it('shows a file that was already selected, e.g. after going back a step', () => {
    render(<ResumeUpload file={pdf} onUpload={() => {}} />);
    expect(screen.getAllByText('my-cv.pdf').length).toBeGreaterThan(0);
  });

  it('tells the parent when the file is removed', () => {
    const onUpload = vi.fn();
    render(<ResumeUpload file={pdf} onUpload={onUpload} />);
    fireEvent.click(screen.getByRole('button', { name: 'remove' }));
    expect(onUpload).toHaveBeenLastCalledWith(null);
  });

  // react-dropzone reads the dropped file through the hidden file input.
  function selectFile(file: File) {
    const input = document.querySelector('input[type="file"]')!;
    fireEvent.change(input, { target: { files: [file] } });
  }

  function pdfOfSize(bytes: number) {
    const file = new File(['%PDF-1.4'], 'big.pdf', { type: 'application/pdf' });
    Object.defineProperty(file, 'size', { value: bytes });
    return file;
  }

  it('accepts a PDF up to 5 MB, the same limit as the backend', async () => {
    const onUpload = vi.fn();
    render(<ResumeUpload onUpload={onUpload} />);
    const file = pdfOfSize(3 * 1024 * 1024);
    selectFile(file);
    await waitFor(() => expect(onUpload).toHaveBeenLastCalledWith(file));
  });

  it('rejects a PDF over 5 MB', async () => {
    const onUpload = vi.fn();
    render(<ResumeUpload onUpload={onUpload} />);
    const file = pdfOfSize(6 * 1024 * 1024);
    selectFile(file);
    await new Promise((r) => setTimeout(r, 700));
    expect(onUpload).not.toHaveBeenCalledWith(file);
  });

  it('opens a preview of the selected PDF', async () => {
    render(<ResumeUpload file={pdf} onUpload={() => {}} />);
    fireEvent.click(screen.getByRole('button', { name: 'view' }));
    expect(
      await screen.findByRole('dialog', { name: /my-cv\.pdf/i }),
    ).toBeInTheDocument();
  });
});
