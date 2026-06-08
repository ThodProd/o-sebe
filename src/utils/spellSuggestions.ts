const RESUME_DICTIONARY = [
  'администрирование',
  'администратор',
  'аналитик',
  'автоматизация',
  'бакалавр',
  'бухгалтер',
  'владивосток',
  'высшее',
  'график',
  'диплом',
  'должность',
  'занятость',
  'инженер',
  'информационных',
  'коммуникабельность',
  'компьютер',
  'консультирование',
  'квалификация',
  'курсы',
  'магистр',
  'менеджер',
  'москва',
  'образование',
  'обслуживание',
  'обязанности',
  'опыт',
  'организация',
  'ответственность',
  'переподготовка',
  'поддержка',
  'программирование',
  'профессиональная',
  'профессиональные',
  'разработка',
  'резюме',
  'русский',
  'сертификат',
  'системный',
  'специалист',
  'специальность',
  'специалитет',
  'среднее',
  'техническая',
  'технологий',
  'технологии',
  'техническое',
  'технического',
  'технологическ',
  'удостоверение',
  'университет',
  'факультет',
  'формирование',
  'хобби',
  'экономика',
  'юридический',
  'юрист',
  'языки',
  'январь',
  'февраль',
  'март',
  'апрель',
  'май',
  'июнь',
  'июль',
  'август',
  'сентябрь',
  'октябрь',
  'ноябрь',
  'декабрь',
  'очная',
  'заочная',
  'дистанционная',
  'командировки',
  'переезд',
  'гражданство',
  'гражданин',
  'калининград',
  'оценка',
  'имущества',
  'оборудование',
  'оргтехника',
  'деятельности',
  'деятельность',
  'ведение',
  'профессиональную',
  'профессиональной',
  'переподготовке',
  'дополнительного',
  'дополнительное',
  'обучение',
  'обучения',
  'заведение',
  'заведения',
  'колледж',
  'техникум',
  'институт',
  'акademия',
] as const;

function levenshtein(a: string, b: string): number {
  const matrix = Array.from({ length: a.length + 1 }, () => new Array(b.length + 1).fill(0));

  for (let i = 0; i <= a.length; i += 1) matrix[i][0] = i;
  for (let j = 0; j <= b.length; j += 1) matrix[0][j] = j;

  for (let i = 1; i <= a.length; i += 1) {
    for (let j = 1; j <= b.length; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }

  return matrix[a.length][b.length];
}

export function getWordAtCaret(element: HTMLInputElement | HTMLTextAreaElement): {
  word: string;
  start: number;
  end: number;
} | null {
  const value = element.value;
  const caret = element.selectionStart ?? 0;
  let start = caret;
  let end = caret;

  while (start > 0 && /[\p{L}\p{N}_-]/u.test(value[start - 1])) start -= 1;
  while (end < value.length && /[\p{L}\p{N}_-]/u.test(value[end])) end += 1;

  const word = value.slice(start, end).trim();
  if (word.length < 2) return null;

  return { word, start, end };
}

export function replaceWordInField(
  element: HTMLInputElement | HTMLTextAreaElement,
  range: { start: number; end: number },
  replacement: string,
  onChange: (value: string) => void
): void {
  const next = `${element.value.slice(0, range.start)}${replacement}${element.value.slice(range.end)}`;
  onChange(next);
  const caret = range.start + replacement.length;
  window.requestAnimationFrame(() => {
    element.focus();
    element.setSelectionRange(caret, caret);
  });
}

export function getSpellSuggestions(word: string, limit = 6): string[] {
  const normalized = word.toLowerCase().replace(/ё/g, 'е').trim();
  if (normalized.length < 2) return [];

  const maxDistance = normalized.length <= 4 ? 1 : 2;

  return RESUME_DICTIONARY
    .map((candidate) => ({
      candidate,
      distance: levenshtein(normalized, candidate.replace(/ё/g, 'е')),
    }))
    .filter((item) => item.distance > 0 && item.distance <= maxDistance)
    .sort((a, b) => a.distance - b.distance || a.candidate.localeCompare(b.candidate, 'ru'))
    .slice(0, limit)
    .map((item) => item.candidate);
}
