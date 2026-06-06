import React, { useLayoutEffect, useRef, useState } from 'react';
import { TemplateType } from '../types/resume';
import { A4_PAGE_MIN_HEIGHT, A4_PAGE_WIDTH } from '../utils/resumePage';
import ResumeEndMarker from './ResumeEndMarker';

interface Props {
  children: React.ReactNode;
  template: TemplateType;
  accentColor: string;
  measureKey: string;
}

const ResumeDocument: React.FC<Props> = ({ children, template, accentColor, measureKey }) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const [contentHeight, setContentHeight] = useState(A4_PAGE_MIN_HEIGHT);

  useLayoutEffect(() => {
    const element = contentRef.current;
    if (!element) return;

    const update = () => setContentHeight(element.scrollHeight);
    update();
    void document.fonts.ready.then(update);

    const observer = new ResizeObserver(update);
    observer.observe(element);
    return () => observer.disconnect();
  }, [measureKey]);

  const pageCount = Math.max(1, Math.ceil(contentHeight / A4_PAGE_MIN_HEIGHT));

  return (
    <div
      className="resume-document relative bg-white shadow-2xl"
      style={{ width: A4_PAGE_WIDTH }}
    >
      <div ref={contentRef} className="resume-document-content">
        {children}
        <div className="resume-end-section flex justify-center px-5 pt-4 pb-3">
          <ResumeEndMarker template={template} accentColor={accentColor} />
        </div>
      </div>

      {pageCount > 1 && (
        <div
          className="print-hidden pointer-events-none absolute inset-x-0 top-0"
          style={{ height: contentHeight }}
          aria-hidden
        >
          {Array.from({ length: pageCount - 1 }, (_, index) => (
            <div
              key={`page-gap-${index}`}
              className="absolute left-0 right-0 flex items-center justify-end px-5"
              style={{
                top: (index + 1) * A4_PAGE_MIN_HEIGHT - 14,
                height: 28,
              }}
            >
              <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 border-t border-gray-200 shadow-[0_1px_8px_rgba(0,0,0,0.06)]" />
              <span className="relative text-[9px] font-semibold tabular-nums text-gray-400 bg-gray-100/80 px-1.5 py-0.5 rounded">
                {index + 1} / {pageCount}
              </span>
            </div>
          ))}
          <span
            className="absolute right-5 text-[9px] font-semibold tabular-nums text-gray-400"
            style={{ top: pageCount * A4_PAGE_MIN_HEIGHT - 22 }}
          >
            {pageCount} / {pageCount}
          </span>
        </div>
      )}
    </div>
  );
};

export default ResumeDocument;
