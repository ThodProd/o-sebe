import { Course, Education, WorkExperience } from '../types/resume';
import { hasText } from './resumeFormat';

export function getWorkEntryDisplayTitle(work: WorkExperience, index: number): string {
  if (hasText(work.entryTitle)) return work.entryTitle.trim();
  if (hasText(work.company) && hasText(work.position)) {
    return `${work.company.trim()} — ${work.position.trim()}`;
  }
  if (hasText(work.company)) return work.company.trim();
  if (hasText(work.position)) return work.position.trim();
  return `Место работы ${index + 1}`;
}

export function getEducationEntryDisplayTitle(edu: Education, index: number): string {
  if (hasText(edu.institution)) return edu.institution.trim();
  if (hasText(edu.speciality)) return edu.speciality.trim();
  return `Учебное заведение ${index + 1}`;
}

export function getCourseEntryDisplayTitle(course: Course, index: number): string {
  if (hasText(course.entryTitle)) return course.entryTitle.trim();
  if (hasText(course.name)) return course.name.trim();
  if (hasText(course.institution)) return course.institution.trim();
  return `Курс ${index + 1}`;
}
