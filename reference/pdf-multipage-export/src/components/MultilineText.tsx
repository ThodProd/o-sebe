import React from 'react';

interface Props {
  text: string;
  className?: string;
}

const MultilineText: React.FC<Props> = ({ text, className = '' }) => {
  const lines = text.split('\n');

  return (
    <div className={className || undefined}>
      {lines.map((line, index) => (
        <div key={index} className="resume-break-line">
          <span className="whitespace-pre-wrap break-words">{line || '\u00A0'}</span>
        </div>
      ))}
    </div>
  );
};

export default MultilineText;
