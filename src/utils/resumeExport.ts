import { applyPdfDocumentLayout, beginPdfExportMode } from './resumePdfLayout';

// Эталон многостраничного PDF: reference/pdf-multipage-export/
async function waitForExportReady(element: HTMLElement): Promise<void> {
  await document.fonts.ready;

  const images = Array.from(element.querySelectorAll('img'));
  await Promise.all(
    images.map(
      (img) =>
        new Promise<void>((resolve) => {
          if (img.complete && img.naturalHeight > 0) {
            resolve();
            return;
          }
          const done = () => resolve();
          img.addEventListener('load', done, { once: true });
          img.addEventListener('error', done, { once: true });
          if (img.complete) resolve();
        })
    )
  );

  await new Promise<void>((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
  });
  await new Promise<void>((resolve) => window.setTimeout(resolve, 250));
}

function getResumeElement(): HTMLElement {
  const element = document.getElementById('resume-preview');
  if (!element) throw new Error('Элемент предпросмотра не найден');
  return element;
}

function getContentRoot(element: HTMLElement): HTMLElement | null {
  return element.querySelector('.resume-document-content');
}

function getExportFileName(element: HTMLElement): string {
  const rawName = element.dataset.exportName?.trim();
  const safeName = sanitizeExportName(rawName || 'resume');
  return `${safeName}.pdf`;
}

export async function exportResumePDF(): Promise<void> {
  const element = getResumeElement();
  const endExportMode = beginPdfExportMode();

  try {
    await waitForExportReady(element);

    const contentRoot = getContentRoot(element);
    const endPageSpacing = contentRoot instanceof HTMLElement
      ? applyPdfDocumentLayout(contentRoot)
      : () => {};

    try {
      await waitForExportReady(element);

      if (window.electronAPI?.printToPDF) {
        const result = await window.electronAPI.printToPDF({
          defaultName: getExportFileName(element),
        });

        if (result.canceled) return;
        if (result.error) throw new Error(result.error);
        return;
      }

      window.print();
    } finally {
      endPageSpacing();
    }
  } finally {
    endExportMode();
  }
}

export function sanitizeExportName(name: string): string {
  return name.replace(/[<>:"/\\|?*\x00-\x1f]+/g, '_').trim() || 'resume';
}
