import React from 'react';
import { Course } from '../types/resume';
import ResumeEntryDivider from './ResumeEntryDivider';
import {
  formatCourseLeadLine,
  formatCourseProfessionalActivityRights,
  hasText,
} from '../utils/resumeFormat';

interface Props {
  course: Course;
  className?: string;
  labeled?: boolean;
  showDivider?: boolean;
  dividerClassName?: string;
  dividerLineClassName?: string;
}

const StructuredCourseBlock: React.FC<Props> = ({
  course,
  className = 'resume-break-unit mb-1',
  labeled = true,
  showDivider = false,
  dividerClassName,
  dividerLineClassName,
}) => {
  const leadLine = formatCourseLeadLine(course.graduationYear, course.institution, course.name);

  const line = (label: string, value: string, suffix = '') => {
    if (!hasText(value)) return null;
    const text = `${value.trim()}${suffix}`;
    if (labeled) {
      return (
        <p>
          <strong>{label}:</strong> {text}
        </p>
      );
    }
    return <p>{text}</p>;
  };

  return (
    <div className={className}>
      {hasText(leadLine) && <p className="font-bold">{leadLine}</p>}
      {line('Название курса', course.name)}
      {line('Квалификация', course.qualification)}
      {hasText(course.professionalActivityRights) && (
        <p>{formatCourseProfessionalActivityRights(course.professionalActivityRights)}</p>
      )}
      {line('Документ', course.documentInfo, hasText(course.documentInfo) ? '.' : '')}
      {line('Период обучения', course.duration)}
      {showDivider && (
        <ResumeEntryDivider className={dividerClassName} lineClassName={dividerLineClassName} />
      )}
    </div>
  );
};

export default StructuredCourseBlock;
