import React from 'react';

interface Props {
  className?: string;
  lineClassName?: string;
}

const ResumeEntryDivider: React.FC<Props> = ({
  className = 'mt-1',
  lineClassName = 'bg-gray-200',
}) => (
  <div className={className} aria-hidden>
    <div className={`h-px w-10 ${lineClassName}`} />
  </div>
);

export default ResumeEntryDivider;
