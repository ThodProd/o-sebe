import React from 'react';
import { TemplateType } from '../types/resume';
import { A4_PAGE_MIN_HEIGHT, A4_PAGE_WIDTH } from '../utils/resumePage';

interface Props {
  template: TemplateType;
  accentColor: string;
  top: number;
}

const ResumeContinuationFill: React.FC<Props> = ({ template, accentColor, top }) => {
  const style: React.CSSProperties = {
    top,
    width: A4_PAGE_WIDTH,
    height: A4_PAGE_MIN_HEIGHT,
  };

  if (template === 'classic') {
    return (
      <div
        className="resume-continuation-fill absolute left-0 flex pointer-events-none z-0"
        style={style}
        aria-hidden
      >
        <div
          className="h-full flex-shrink-0"
          style={{ width: 185, background: '#f9f9f9', borderRight: '1px solid #e5e7eb' }}
        />
        <div className="h-full flex-1 bg-white" />
      </div>
    );
  }

  if (template === 'modern') {
    return (
      <div
        className="resume-continuation-fill absolute left-0 flex pointer-events-none z-0"
        style={style}
        aria-hidden
      >
        <div className="h-full flex-shrink-0" style={{ width: 220, background: accentColor }} />
        <div className="h-full flex-1 bg-white" />
      </div>
    );
  }

  if (template === 'dark') {
    return (
      <div
        className="resume-continuation-fill absolute left-0 flex pointer-events-none z-0"
        style={style}
        aria-hidden
      >
        <div className="h-full flex-shrink-0" style={{ width: 200, background: '#16213e' }} />
        <div className="h-full flex-1" style={{ background: '#1a1a2e' }} />
      </div>
    );
  }

  if (template === 'elegant') {
    return (
      <div
        className="resume-continuation-fill absolute left-0 flex pointer-events-none z-0"
        style={style}
        aria-hidden
      >
        <div
          className="h-full flex-shrink-0 border-r border-gray-100"
          style={{ width: 230, background: `${accentColor}08` }}
        />
        <div className="h-full flex-1 bg-white" />
      </div>
    );
  }

  if (template === 'minimal') {
    return (
      <div
        className="resume-continuation-fill absolute left-0 flex pointer-events-none z-0 bg-white"
        style={style}
        aria-hidden
      >
        <div
          className="h-full flex-shrink-0 border-r"
          style={{ width: 200, borderColor: `${accentColor}30` }}
        />
        <div className="h-full flex-1" />
      </div>
    );
  }

  if (template === 'white') {
    return (
      <div
        className="resume-continuation-fill absolute left-0 flex pointer-events-none z-0 bg-white"
        style={style}
        aria-hidden
      >
        <div className="h-full flex-shrink-0 border-r border-black" style={{ width: 210 }} />
        <div className="h-full flex-1" />
      </div>
    );
  }

  return (
    <div
      className="resume-continuation-fill absolute left-0 bg-white pointer-events-none z-0"
      style={style}
      aria-hidden
    />
  );
};

export default ResumeContinuationFill;
