import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

// The PDF preview loads public/pdf.worker.min.js. pdf.js refuses to run when
// the worker and the library versions differ, so keep them in step.
describe('pdf.js worker', () => {
  it('matches the installed pdfjs-dist version', () => {
    const root = join(__dirname, '../../..');
    const installed = JSON.parse(
      readFileSync(join(root, 'node_modules/pdfjs-dist/package.json'), 'utf8'),
    ) as { version: string };
    const worker = readFileSync(join(root, 'public/pdf.worker.min.js'), 'utf8');

    expect(worker).toContain(`"${installed.version}"`);
  });
});
