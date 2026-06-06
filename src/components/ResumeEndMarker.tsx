import React from 'react';
import { TemplateType } from '../types/resume';

interface Props {
  template: TemplateType;
  accentColor: string;
}

const ResumeEndMarker: React.FC<Props> = ({ template, accentColor }) => {
  if (template === 'dark') {
    return (
      <div className="flex items-center gap-2 w-full max-w-[220px]">
        <div className="flex-1 h-px" style={{ background: `${accentColor}55` }} />
        <span className="text-[8px] uppercase tracking-[0.25em] opacity-50">конец резюме</span>
        <div className="flex-1 h-px" style={{ background: `${accentColor}55` }} />
      </div>
    );
  }

  if (template === 'elegant') {
    return (
      <div className="flex flex-col items-center gap-1 w-full">
        <div className="flex items-center gap-2 w-full max-w-[240px]">
          <div className="flex-1 h-px" style={{ background: accentColor }} />
          <span className="text-[9px]" style={{ color: accentColor }}>◆</span>
          <div className="flex-1 h-px" style={{ background: accentColor }} />
        </div>
        <span className="text-[8px] uppercase tracking-[0.2em] text-gray-400">конец резюме</span>
      </div>
    );
  }

  if (template === 'white') {
    return (
      <div className="flex items-center gap-2 w-full max-w-[220px]">
        <div className="flex-1 border-t border-black" />
        <span className="text-[8px] uppercase tracking-[0.25em] text-black/45">конец резюме</span>
        <div className="flex-1 border-t border-black" />
      </div>
    );
  }

  if (template === 'modern') {
    return (
      <div className="flex flex-col items-center gap-1 w-full">
        <div className="h-0.5 w-16 rounded-full" style={{ background: accentColor }} />
        <span className="text-[8px] uppercase tracking-[0.2em]" style={{ color: accentColor }}>
          конец резюме
        </span>
      </div>
    );
  }

  if (template === 'minimal') {
    return (
      <div className="flex items-center gap-2 w-full max-w-[200px]">
        <div className="flex-1 h-px bg-gray-300" />
        <span className="text-[8px] uppercase tracking-[0.2em] text-gray-400">конец</span>
        <div className="flex-1 h-px bg-gray-300" />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 w-full max-w-[280px]">
      <div className="flex-1 h-px bg-gray-300/80" />
      <span className="text-[8px] uppercase tracking-[0.25em] text-gray-400/80 whitespace-nowrap">
        конец резюме
      </span>
      <div className="flex-1 h-px bg-gray-300/80" />
    </div>
  );
};

export default ResumeEndMarker;
