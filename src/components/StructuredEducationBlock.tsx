import React from 'react';
import { Education } from '../types/resume';
import ResumeEntryDivider from './ResumeEntryDivider';
import {
  formatEducationActivityRights,
  formatEducationPeriod,
  hasText,
} from '../utils/resumeFormat';

interface Props {
  edu: Education;
  className?: string;
  labeled?: boolean;
  showDivider?: boolean;
  dividerClassName?: string;
  dividerLineClassName?: string;
}

const StructuredEducationBlock: React.FC<Props> = ({
  edu,
  className = 'resume-break-unit mb-1',
  labeled = true,
  showDivider = false,
  dividerClassName,
  dividerLineClassName,
}) => {
  const studyPeriod = formatEducationPeriod(edu.startDate, edu.endDate, edu.showStudyDuration);
  const level = edu.level.trim();

  const line = (label: string, value: string) => {
    if (!hasText(value)) return null;
    if (labeled) {
      return (
        <p>
          <strong>{label}:</strong> {value}
        </p>
      );
    }
    return <p>{value}</p>;
  };

  return (
    <div className={className}>
      {line('Учебное заведение', edu.institution)}
      {line('Город', edu.city)}
      {line('Период обучения', studyPeriod)}
      {level && level !== 'Не указан' && line('Уровень образования', level)}
      {line('Факультет', edu.faculty)}
      {line('Специальность', edu.speciality)}
      {line('Форма обучения', edu.studyForm)}
      {hasText(edu.professionalActivityRights) && (
        <p>{formatEducationActivityRights(edu.professionalActivityRights)}</p>
      )}
      {line('Документ', edu.documentInfo)}
      {hasText(edu.additionalInfo) && line('Дополнительно', edu.additionalInfo)}
      {showDivider && (
        <ResumeEntryDivider className={dividerClassName} lineClassName={dividerLineClassName} />
      )}
    </div>
  );
};

export default StructuredEducationBlock;
