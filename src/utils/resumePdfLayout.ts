import { A4_PAGE_MIN_HEIGHT } from './resumePage';

const PAGE_HEIGHT = A4_PAGE_MIN_HEIGHT;
const BOTTOM_SAFE = 64;
const TOP_SAFE = 48;

interface LayoutUnit {
  element: HTMLElement;
  top: number;
  bottom: number;
}

function measureUnits(contentRoot: HTMLElement): LayoutUnit[] {
  const rootRect = contentRoot.getBoundingClientRect();
  const units: LayoutUnit[] = [];

  contentRoot.querySelectorAll('.resume-break-line').forEach((lineElement) => {
    if (!(lineElement instanceof HTMLElement)) return;

    const target = lineElement.querySelector('span') ?? lineElement;
    const rects = Array.from(target.getClientRects());

    if (rects.length === 0) {
      const rect = lineElement.getBoundingClientRect();
      units.push({
        element: lineElement,
        top: rect.top - rootRect.top,
        bottom: rect.bottom - rootRect.top,
      });
      return;
    }

    rects.forEach((rect) => {
      units.push({
        element: lineElement,
        top: rect.top - rootRect.top,
        bottom: rect.bottom - rootRect.top,
      });
    });
  });

  contentRoot.querySelectorAll('.resume-break-unit').forEach((blockElement) => {
    if (!(blockElement instanceof HTMLElement)) return;
    if (blockElement.querySelector('.resume-break-line')) return;

    const rect = blockElement.getBoundingClientRect();
    units.push({
      element: blockElement,
      top: rect.top - rootRect.top,
      bottom: rect.bottom - rootRect.top,
    });
  });

  return units.sort((a, b) => a.top - b.top || a.bottom - b.bottom);
}

function getSafeLimit(pageIndex: number): number {
  if (pageIndex === 0) {
    return PAGE_HEIGHT - BOTTOM_SAFE;
  }

  return (pageIndex + 1) * PAGE_HEIGHT - BOTTOM_SAFE;
}

function getNextPageStart(pageIndex: number): number {
  return (pageIndex + 1) * PAGE_HEIGHT + TOP_SAFE;
}

export function applyPdfPageSpacing(contentRoot: HTMLElement): () => void {
  const cleanups: Array<() => void> = [];

  const setMarginTop = (element: HTMLElement, marginTop: number) => {
    const previous = element.style.marginTop;
    element.style.marginTop = `${marginTop}px`;
    cleanups.push(() => {
      element.style.marginTop = previous;
    });
  };

  let changed = true;
  let guard = 0;

  while (changed && guard < 200) {
    changed = false;
    guard += 1;

    const units = measureUnits(contentRoot);
    const adjusted = new Set<HTMLElement>();
    let pageIndex = 0;
    let limitBottom = getSafeLimit(pageIndex);

    for (const unit of units) {
      if (adjusted.has(unit.element)) continue;

      while (unit.top > limitBottom) {
        pageIndex += 1;
        limitBottom = getSafeLimit(pageIndex);
      }

      if (unit.bottom > limitBottom + 0.5) {
        const targetTop = getNextPageStart(pageIndex);
        const marginTop = targetTop - unit.top;

        if (marginTop > 1) {
          setMarginTop(unit.element, marginTop);
          adjusted.add(unit.element);
          changed = true;
          break;
        }
      }
    }
  }

  return () => {
    cleanups.reverse().forEach((cleanup) => cleanup());
  };
}

export function applyFirstPageOnlySections(contentRoot: HTMLElement): () => void {
  const cleanups: Array<() => void> = [];
  const rootRect = contentRoot.getBoundingClientRect();

  contentRoot.querySelectorAll('.resume-first-page-only').forEach((element) => {
    if (!(element instanceof HTMLElement)) return;

    const rect = element.getBoundingClientRect();
    const top = rect.top - rootRect.top;
    const pageIndex = Math.floor(top / PAGE_HEIGHT);

    if (pageIndex !== 0) return;

    const maxHeight = PAGE_HEIGHT - top;
    const previousMaxHeight = element.style.maxHeight;
    const previousOverflow = element.style.overflow;

    element.style.maxHeight = `${maxHeight}px`;
    element.style.overflow = 'hidden';

    cleanups.push(() => {
      element.style.maxHeight = previousMaxHeight;
      element.style.overflow = previousOverflow;
    });
  });

  return () => {
    cleanups.reverse().forEach((cleanup) => cleanup());
  };
}

export function applyDocumentPageMinHeight(contentRoot: HTMLElement): () => void {
  const pageCount = Math.max(1, Math.ceil(contentRoot.scrollHeight / PAGE_HEIGHT));
  const previous = contentRoot.style.minHeight;

  contentRoot.style.minHeight = `${pageCount * PAGE_HEIGHT}px`;

  return () => {
    contentRoot.style.minHeight = previous;
  };
}

export function applyPdfDocumentLayout(contentRoot: HTMLElement): () => void {
  const cleanups = [
    applyFirstPageOnlySections(contentRoot),
    applyDocumentPageMinHeight(contentRoot),
    applyPdfPageSpacing(contentRoot),
    applyDocumentPageMinHeight(contentRoot),
  ];

  return () => {
    cleanups.reverse().forEach((cleanup) => cleanup());
  };
}

export function beginPdfExportMode(): () => void {
  document.documentElement.classList.add('pdf-export-prep');
  document.body.classList.add('pdf-export-prep');

  return () => {
    document.documentElement.classList.remove('pdf-export-prep');
    document.body.classList.remove('pdf-export-prep');
  };
}
