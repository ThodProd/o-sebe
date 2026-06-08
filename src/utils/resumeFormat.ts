const MONTHS_RU: Record<string, number> = {
  январь: 0,
  января: 0,
  янв: 0,
  февраль: 1,
  февраля: 1,
  фев: 1,
  март: 2,
  марта: 2,
  мар: 2,
  апрель: 3,
  апреля: 3,
  апр: 3,
  май: 4,
  мая: 4,
  июнь: 5,
  июня: 5,
  июн: 5,
  июль: 6,
  июля: 6,
  июл: 6,
  август: 7,
  августа: 7,
  авг: 7,
  сентябрь: 8,
  сентября: 8,
  сен: 8,
  октябрь: 9,
  октября: 9,
  окт: 9,
  ноябрь: 10,
  ноября: 10,
  ноя: 10,
  декабрь: 11,
  декабря: 11,
  дек: 11,
};

export function hasText(value: string | undefined | null): boolean {
  return Boolean(value?.trim());
}

export function parseFlexibleDate(input: string): Date | null {
  const trimmed = input.trim().toLowerCase();
  if (!trimmed) return null;

  const dmy = trimmed.match(/^(\d{1,2})[./](\d{1,2})[./](\d{4})$/);
  if (dmy) return new Date(Number(dmy[3]), Number(dmy[2]) - 1, Number(dmy[1]));

  const my = trimmed.match(/^(\d{1,2})[./](\d{4})$/);
  if (my) return new Date(Number(my[2]), Number(my[1]) - 1, 1);

  const ym = trimmed.match(/^(\d{4})[./-](\d{1,2})$/);
  if (ym) return new Date(Number(ym[1]), Number(ym[2]) - 1, 1);

  const yearOnly = trimmed.match(/^(\d{4})$/);
  if (yearOnly) return new Date(Number(yearOnly[1]), 0, 1);

  const monthYear = trimmed.match(/^([а-яё]+)\s+(\d{4})$/);
  if (monthYear) {
    const month = MONTHS_RU[monthYear[1]];
    if (month !== undefined) return new Date(Number(monthYear[2]), month, 1);
  }

  const yearMonth = trimmed.match(/^(\d{4})\s+([а-яё]+)$/);
  if (yearMonth) {
    const month = MONTHS_RU[yearMonth[2]];
    if (month !== undefined) return new Date(Number(yearMonth[1]), month, 1);
  }

  const parsed = Date.parse(input);
  if (!Number.isNaN(parsed)) return new Date(parsed);

  return null;
}

function pluralizeYears(count: number): string {
  const mod10 = count % 10;
  const mod100 = count % 100;
  if (mod10 === 1 && mod100 !== 11) return `${count} год`;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return `${count} года`;
  return `${count} лет`;
}

function pluralizeMonths(count: number): string {
  const mod10 = count % 10;
  const mod100 = count % 100;
  if (mod10 === 1 && mod100 !== 11) return `${count} месяц`;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return `${count} месяца`;
  return `${count} месяцев`;
}

export function calculateTenure(startDate: string, endDate: string, isCurrent: boolean): string {
  const start = parseFlexibleDate(startDate);
  if (!start) return '';

  const end = isCurrent ? new Date() : parseFlexibleDate(endDate);
  if (!end) return '';

  let totalMonths =
    (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth()) + 1;

  if (totalMonths <= 0) return '';

  const years = Math.floor(totalMonths / 12);
  const months = totalMonths % 12;

  const parts: string[] = [];
  if (years > 0) parts.push(pluralizeYears(years));
  if (months > 0) parts.push(pluralizeMonths(months));
  if (parts.length === 0) parts.push('менее 1 месяца');

  return parts.join(' ');
}

export function formatWorkPeriod(startDate: string, endDate: string, isCurrent: boolean): string {
  if (!hasText(startDate)) return '';

  const endPart = isCurrent ? 'по настоящее время' : hasText(endDate) ? endDate : '';
  return endPart ? `${startDate} — ${endPart}` : startDate;
}

export const WORK_SCHEDULE_OPTIONS = [
  '5/2',
  '2/2',
  '6/1',
  'Сменный график',
  'Полный день',
  'Свободный график',
  'Гибкий график',
  'Удалённая работа',
  'Вахтовый метод',
  'По договорённости с работодателем',
] as const;

export const PERSONAL_EDUCATION_OPTIONS = [
  'Не указан',
  'Среднее общее (9 классов)',
  'Среднее общее (11 классов)',
  'Среднее профессиональное',
  'Среднее профессиональное (колледж)',
  'Среднее профессиональное (техникум)',
  'Незаконченное высшее',
  'Высшее',
  'Высшее (бакалавр)',
  'Высшее (специалитет)',
  'Высшее (магистр)',
  'Высшее (аспирантура)',
  'Два высших',
  'Несколько высших',
] as const;

export const PERSONAL_EDUCATION_COUNT_OPTIONS = ['3', '4', '5'] as const;

export const MILITARY_SERVICE_OPTIONS = [
  'Не служил',
  'Служил',
  'Военнообязанный',
  'Не подлежит призыву',
  'Не годен по состоянию здоровья',
] as const;

export const MILITARY_UNFIT_STATUS = 'Не годен по состоянию здоровья';

export const MILITARY_FITNESS_CATEGORIES = [
  'Не выбрано',
  'А — годен к военной службе',
  'Б — годен с незначительными ограничениями',
  'В — ограниченно годен',
  'Г — временно не годен',
  'Д — не годен к военной службе',
] as const;

export const EDUCATION_LEVEL_OPTIONS = [
  'Не указан',
  'Среднее общее (9 классов)',
  'Среднее общее (11 классов)',
  'Среднее профессиональное',
  'Среднее профессиональное (колледж)',
  'Среднее профессиональное (техникум)',
  'Незаконченное высшее',
  'Высшее',
  'Высшее (бакалавр)',
  'Высшее (специалитет)',
  'Высшее (магистр)',
  'Высшее (аспирантура)',
  'Два высших',
] as const;

export const DOCUMENT_INFO_OPTIONS = [
  'Диплом',
  'Диплом о профессиональной переподготовке',
  'Диплом о дополнительном образовании',
  'Диплом о профессиональном обучении',
  'Удостоверение о повышении квалификации',
  'Сертификат о прохождении курса',
  'Свидетельство о профессии рабочего',
  'Справка об обучении',
  'Справка о периоде обучения',
  'Сертификат установленного образца',
] as const;

/** @deprecated use DOCUMENT_INFO_OPTIONS */
export const COURSE_DOCUMENT_OPTIONS = DOCUMENT_INFO_OPTIONS;

export const CUSTOM_OPTION_VALUE = '__custom__';

export function formatEducationActivityRights(text: string): string {
  const value = text.trim();
  if (!value) return '';
  return `Даёт право на профессиональную деятельность: ${value}`;
}

export function formatCourseProfessionalActivityRights(text: string): string {
  const value = text.trim();
  if (!value) return '';
  return `Дает право на ведение профессиональной деятельности: ${value}`;
}

/** @deprecated use formatCourseProfessionalActivityRights */
export function formatCoursePositionRights(text: string): string {
  return formatCourseProfessionalActivityRights(text);
}

export function formatCourseLeadLine(
  graduationYear: string,
  institution: string,
  name: string
): string {
  if (hasText(graduationYear) && hasText(institution)) {
    return `${graduationYear.trim()} — ${institution.trim()}`;
  }
  if (hasText(institution)) return institution.trim();
  if (hasText(graduationYear) && hasText(name)) {
    return `${graduationYear.trim()} — ${name.trim()}`;
  }
  return name.trim() || institution.trim();
}

export function formatEducationInstitution(institution: string, level: string): string {
  const name = institution.trim();
  if (!name) return '';

  const levelText = level.trim();
  if (!levelText || levelText === 'Не указан') return name;

  return `${name} (${levelText})`;
}

export function formatEducationPeriod(
  startDate: string,
  endDate: string,
  showDuration = false
): string {
  let base = '';
  if (hasText(startDate) && hasText(endDate)) {
    base = `${startDate} — ${endDate}`;
  } else if (hasText(endDate)) {
    base = endDate;
  } else if (hasText(startDate)) {
    base = startDate;
  }

  if (!showDuration) return base;

  const tenure = calculateTenure(startDate, endDate, false);
  if (!base) return tenure;
  if (!tenure) return base;
  return `${base} (${tenure})`;
}

export function needsPersonalEducationCount(education: string): boolean {
  return education === 'Несколько высших';
}

export function needsMilitaryUnfitDetails(militaryService: string): boolean {
  return militaryService === MILITARY_UNFIT_STATUS;
}

function pluralizeHigherEducation(count: number): string {
  const mod10 = count % 10;
  const mod100 = count % 100;
  if (mod10 === 1 && mod100 !== 11) return `${count} высшее образование`;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return `${count} высших образования`;
  return `${count} высших образований`;
}

export function formatPersonalEducation(education: string, higherCount: string): string {
  const value = education.trim();
  if (!hasText(value) || value === 'Не указан') return value;

  if (value === 'Несколько высших') {
    const count = Number.parseInt(higherCount, 10);
    if (Number.isFinite(count) && count >= 2) {
      return pluralizeHigherEducation(count);
    }
    return value;
  }

  return value;
}

export function formatMilitaryService(
  militaryService: string,
  fitnessCategory: string,
  unfitArticle: string,
  unfitPoint: string
): string {
  const status = militaryService.trim();
  if (!hasText(status)) return '';

  if (!needsMilitaryUnfitDetails(status)) return status;

  const parts: string[] = [status];
  if (hasText(fitnessCategory) && fitnessCategory !== 'Не выбрано') {
    parts.push(fitnessCategory);
  }

  const details: string[] = [];
  if (hasText(unfitArticle)) details.push(`ст. ${unfitArticle.trim()}`);
  if (hasText(unfitPoint)) details.push(`п. ${unfitPoint.trim()}`);

  if (details.length > 0) {
    parts.push(details.join(', '));
  }

  return parts.length === 1 ? parts[0] : `${parts[0]} (${parts.slice(1).join('; ')})`;
}
