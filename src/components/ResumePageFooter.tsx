import React from 'react';
import { TemplateType } from '../types/resume';
import ResumeEndMarker from './ResumeEndMarker';

interface Props {
  page: number;
  total: number;
  template: TemplateType;
  accentColor: string;
  top: number;
  isLastPage: boolean;
}

const pageNumberStyle: Record<TemplateType, React.CSSProperties> = {
  classic: { color: 'rgba(156, 163, 175, 0.75)' },
  modern: { color: 'rgba(156, 163, 175, 0.75)' },
  minimal: { color: 'rgba(156, 163, 175, 0.75)' },
  dark: { color: 'rgba(255, 255, 255, 0.45)' },
  elegant: { color: 'rgba(156, 163, 175, 0.7)' },
  white: { color: 'rgba(107, 114, 128, 0.65)' },
};

const ResumePageFooter: React.FC<Props> = ({
  page,
  total,
  template,
  accentColor,
  top,
  isLastPage,
}) => (
  <div
    className="resume-page-footer absolute left-0 right-0 flex items-center px-5 pointer-events-none z-[3]"
    style={{ top, height: 28 }}
    aria-hidden={!isLastPage && total === 1}
  >
    {isLastPage ? (
      <div className="flex w-full items-center gap-3">
        <div className="flex min-w-0 flex-1 justify-center">
          <ResumeEndMarker template={template} accentColor={accentColor} />
        </div>
        <span
          className="flex-shrink-0 text-[9px] font-semibold tabular-nums tracking-wide"
          style={{
            ...pageNumberStyle[template],
            fontFamily: 'Inter, sans-serif',
          }}
        >
          {page} / {total}
        </span>
      </div>
    ) : (
      <div className="flex w-full justify-end">
        <span
          className="text-[9px] font-semibold tabular-nums tracking-wide"
          style={{
            ...pageNumberStyle[template],
            fontFamily: 'Inter, sans-serif',
          }}
        >
          {page} / {total}
        </span>
      </div>
    )}
  </div>
);

export default ResumePageFooter;
