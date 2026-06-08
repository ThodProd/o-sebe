import React, { useLayoutEffect, useRef, useState } from 'react';
import { TemplateType } from '../types/resume';
import {
  applyDocumentPageMinHeight,
  applyFirstPageOnlySections,
  getPageCountForExtent,
  measureContentExtent,
} from '../utils/resumePdfLayout';
import { A4_PAGE_MIN_HEIGHT, A4_PAGE_WIDTH } from '../utils/resumePage';
import ResumeContinuationFill from './ResumeContinuationFill';
import ResumePageFooter from './ResumePageFooter';

interface Props {
  children: React.ReactNode;
  template: TemplateType;
  accentColor: string;
  measureKey: string;
}

const FOOTER_OFFSET = 18;

const ResumeDocument: React.FC<Props> = ({ children, template, accentColor, measureKey }) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const [contentHeight, setContentHeight] = useState(A4_PAGE_MIN_HEIGHT);

  useLayoutEffect(() => {
    const element = contentRef.current;
    if (!element) return;

    const update = () => {
      const cleanFirstPage = applyFirstPageOnlySections(element);
      const cleanMinHeight = applyDocumentPageMinHeight(element);
      const extent = measureContentExtent(element);

      setContentHeight(extent);

      return () => {
        cleanMinHeight();
        cleanFirstPage();
      };
    };

    let cleanup = update();
    void document.fonts.ready.then(() => {
      cleanup();
      cleanup = update();
    });

    const observer = new ResizeObserver(() => {
      cleanup();
      cleanup = update();
    });
    observer.observe(element);

    return () => {
      observer.disconnect();
      cleanup();
    };
  }, [measureKey]);

  const pageCount = getPageCountForExtent(contentHeight);

  return (
    <div
      className="resume-document relative bg-white shadow-2xl"
      style={{ width: A4_PAGE_WIDTH, minHeight: pageCount * A4_PAGE_MIN_HEIGHT }}
    >
      {pageCount > 1 &&
        Array.from({ length: pageCount - 1 }, (_, index) => (
          <ResumeContinuationFill
            key={`fill-${index}`}
            template={template}
            accentColor={accentColor}
            top={(index + 1) * A4_PAGE_MIN_HEIGHT}
          />
        ))}

      {Array.from({ length: pageCount }, (_, index) => (
        <ResumePageFooter
          key={`footer-${index}`}
          page={index + 1}
          total={pageCount}
          template={template}
          accentColor={accentColor}
          top={(index + 1) * A4_PAGE_MIN_HEIGHT - FOOTER_OFFSET - 28}
          isLastPage={index === pageCount - 1}
        />
      ))}

      <div ref={contentRef} className="resume-document-content relative z-[1]">
        {children}
      </div>
    </div>
  );
};

export default ResumeDocument;
