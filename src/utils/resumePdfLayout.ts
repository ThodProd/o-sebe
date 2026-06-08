import { A4_PAGE_MIN_HEIGHT } from './resumePage';

const PAGE_HEIGHT = A4_PAGE_MIN_HEIGHT;
const BOTTOM_SAFE = 64;
const TOP_SAFE = 48;
const PDF_CONTENT_PADDING = 64;

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

function getLayoutPageIndex(top: number): number {
  let pageIndex = 0;
  while (top > getSafeLimit(pageIndex)) {
    pageIndex += 1;
  }
  return pageIndex;
}

function findPrecedingSectionHeader(lineElement: HTMLElement): HTMLElement | null {
  const container = lineElement.parentElement;
  if (!container) return null;

  const previous = container.previousElementSibling;
  if (
    previous instanceof HTMLElement &&
    previous.classList.contains('resume-break-unit') &&
    !previous.querySelector('.resume-break-line')
  ) {
    return previous;
  }

  return null;
}

function isFirstContentLineAfterHeader(lineElement: HTMLElement): boolean {
  const container = lineElement.parentElement;
  if (!container) return false;
  return container.querySelector('.resume-break-line') === lineElement;
}

function getHeaderToMoveWithContent(
  unit: LayoutUnit,
  units: LayoutUnit[],
  limitBottom: number
): HTMLElement | null {
  if (!unit.element.classList.contains('resume-break-line')) return null;
  if (!isFirstContentLineAfterHeader(unit.element)) return null;

  const header = findPrecedingSectionHeader(unit.element);
  if (!header) return null;

  const headerUnit = units.find((item) => item.element === header);
  if (!headerUnit) return null;

  const headerPage = getLayoutPageIndex(headerUnit.top);
  const contentPage = getLayoutPageIndex(unit.top);

  if (contentPage > headerPage) return header;

  if (unit.bottom > limitBottom + 0.5 && headerUnit.bottom <= limitBottom + 0.5) {
    return header;
  }

  return null;
}

export function measureContentExtent(contentRoot: HTMLElement): number {
  const rootTop = contentRoot.getBoundingClientRect().top;
  let maxBottom = 0;

  contentRoot.querySelectorAll('*').forEach((node) => {
    if (!(node instanceof HTMLElement)) return;

    const style = window.getComputedStyle(node);
    if (style.display === 'none' || style.visibility === 'hidden') return;

    const rect = node.getBoundingClientRect();
    if (rect.height <= 0) return;

    maxBottom = Math.max(maxBottom, rect.bottom - rootTop);
  });

  return maxBottom || contentRoot.scrollHeight;
}

export function getPageCountForExtent(
  extent: number,
  paddingBottom = PDF_CONTENT_PADDING
): number {
  return Math.max(1, Math.ceil((extent + paddingBottom) / PAGE_HEIGHT));
}

export function getDocumentPageCount(
  contentRoot: HTMLElement,
  paddingBottom = PDF_CONTENT_PADDING
): number {
  return getPageCountForExtent(measureContentExtent(contentRoot), paddingBottom);
}

function clearDocumentMinHeight(contentRoot: HTMLElement): () => void {
  const previous = contentRoot.style.minHeight;
  contentRoot.style.minHeight = '';
  return () => {
    contentRoot.style.minHeight = previous;
  };
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

      const headerToMove = getHeaderToMoveWithContent(unit, units, limitBottom);
      if (headerToMove && !adjusted.has(headerToMove)) {
        const headerUnit = units.find((item) => item.element === headerToMove);
        if (headerUnit) {
          const headerPageIndex = getLayoutPageIndex(headerUnit.top);
          const targetTop = getNextPageStart(headerPageIndex);
          const marginTop = targetTop - headerUnit.top;

          if (marginTop > 1) {
            setMarginTop(headerToMove, marginTop);
            adjusted.add(headerToMove);
            changed = true;
            break;
          }
        }
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
  const pageCount = getDocumentPageCount(contentRoot);
  const previous = contentRoot.style.minHeight;

  contentRoot.style.minHeight = `${pageCount * PAGE_HEIGHT}px`;

  return () => {
    contentRoot.style.minHeight = previous;
  };
}

export function applyPdfDocumentLayout(contentRoot: HTMLElement): () => void {
  const cleanups = [
    applyFirstPageOnlySections(contentRoot),
    applyPdfPageSpacing(contentRoot),
    clearDocumentMinHeight(contentRoot),
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
