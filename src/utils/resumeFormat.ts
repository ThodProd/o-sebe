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

export const EDUCATION_LEVEL_OPTIONS = [
  'Не указан',
  'Высшее (бакалавр)',
  'Высшее (специалитет)',
  'Высшее (магистр)',
  'Неполное высшее',
  'Среднее профессиональное',
  'Среднее',
  'Два высших',
] as const;

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
