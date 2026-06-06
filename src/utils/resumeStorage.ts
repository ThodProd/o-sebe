import {
  ActiveDraft,
  AppConfigPayload,
  ResumeConfigFile,
  ResumeData,
  SavedResumeConfig,
  TemplateType,
} from '../types/resume';

const STORAGE_KEY = 'o-sebe-app-config';
const LEGACY_STORAGE_KEY = 'o-sebe-saved-resumes';
const CONFIG_VERSION = 1 as const;

const TEMPLATE_TYPES: TemplateType[] = ['classic', 'modern', 'minimal', 'dark', 'elegant', 'white'];

export const createDefaultResumeData = (): ResumeData => ({
  personal: {
    firstName: 'Имя',
    lastName: 'Фамилия',
    middleName: 'Отчество',
    position: 'Желаемая должность',
    photo: '',
    phone: '+7 (123) 456-78-90',
    email: 'email@example.ru',
    city: 'г. Москва',
    website: '',
    linkedin: '',
    telegram: '',
  },
  customContacts: [],
  main: {
    desiredSalary: '50 000 рублей',
    employment: 'Полная занятость',
    schedule: '5/2',
    readyToTravel: false,
    readyToRelocate: false,
  },
  personalDetails: {
    citizenship: 'Российская Федерация',
    education: 'Высшее (бакалавр)',
    birthDate: '01.01.1995',
    gender: 'Не указан',
    maritalStatus: 'Не указан',
    militaryService: 'Не служил',
    medicalBook: 'Нет',
    drivingLicense: 'Нет',
  },
  languages: [],
  workExperience: [],
  education: [],
  courses: [],
  skills: [],
  additional: {
    personalQualities: '',
    professionalSkills: '',
    aboutMe: '',
    computerSkills: [],
    hobbies: '',
  },
});

export function normalizeResumeData(raw: Partial<ResumeData> | undefined): ResumeData {
  const defaults = createDefaultResumeData();

  return {
    personal: { ...defaults.personal, ...raw?.personal },
    customContacts: Array.isArray(raw?.customContacts) ? raw.customContacts : [],
    main: { ...defaults.main, ...raw?.main },
    personalDetails: { ...defaults.personalDetails, ...raw?.personalDetails },
    languages: Array.isArray(raw?.languages) ? raw.languages : [],
    workExperience: Array.isArray(raw?.workExperience)
      ? raw.workExperience.map((item) => ({
          id: item.id ?? Date.now().toString(),
          company: item.company ?? '',
          position: item.position ?? '',
          startDate: item.startDate ?? '',
          endDate: item.endDate ?? '',
          isCurrent: Boolean(item.isCurrent),
          responsibilities: item.responsibilities ?? '',
          achievements: item.achievements ?? '',
        }))
      : [],
    education: Array.isArray(raw?.education)
      ? raw.education.map((item) => ({
          id: item.id ?? Date.now().toString(),
          institution: item.institution ?? '',
          level: item.level ?? 'Не указан',
          city: item.city ?? '',
          faculty: item.faculty ?? '',
          speciality: item.speciality ?? '',
          startDate: item.startDate ?? '',
          endDate: item.endDate ?? '',
          graduationYear: item.graduationYear ?? '',
          studyForm: item.studyForm ?? 'Очная',
          additionalInfo: item.additionalInfo ?? '',
          showStudyDuration: Boolean(item.showStudyDuration),
        }))
      : [],
    courses: Array.isArray(raw?.courses) ? raw.courses : [],
    skills: Array.isArray(raw?.skills) ? raw.skills : [],
    additional: {
      ...defaults.additional,
      ...raw?.additional,
      computerSkills: Array.isArray(raw?.additional?.computerSkills)
        ? raw.additional.computerSkills
        : [],
    },
  };
}

function parseSavedConfigs(raw: unknown): SavedResumeConfig[] {
  if (!Array.isArray(raw)) return [];

  return raw.map((item) => ({
    id: item.id,
    name: item.name || 'Без названия',
    template: TEMPLATE_TYPES.includes(item.template) ? item.template : 'classic',
    accentColor: item.accentColor || '#5ba8a0',
    createdAt: item.createdAt || new Date().toISOString(),
    updatedAt: item.updatedAt || new Date().toISOString(),
    data: normalizeResumeData(item.data),
  }));
}

function parseActiveDraft(raw: unknown): ActiveDraft | null {
  if (!raw || typeof raw !== 'object') return null;

  const draft = raw as Partial<ActiveDraft>;
  if (!draft.data || typeof draft.data !== 'object') return null;

  const template = TEMPLATE_TYPES.includes(draft.template as TemplateType)
    ? (draft.template as TemplateType)
    : 'classic';

  return {
    data: normalizeResumeData(draft.data),
    template,
    accentColor: typeof draft.accentColor === 'string' ? draft.accentColor : '#5ba8a0',
    activeConfigId: typeof draft.activeConfigId === 'string' ? draft.activeConfigId : null,
    hasUnsavedChanges: Boolean(draft.hasUnsavedChanges),
    updatedAt: typeof draft.updatedAt === 'string' ? draft.updatedAt : new Date().toISOString(),
  };
}

function loadLegacyLocalStorage(): SavedResumeConfig[] {
  try {
    const raw = localStorage.getItem(LEGACY_STORAGE_KEY);
    if (!raw) return [];
    return parseSavedConfigs(JSON.parse(raw));
  } catch {
    return [];
  }
}

function loadFromLocalStorage(): AppConfigPayload {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const legacy = loadLegacyLocalStorage();
      return { savedResumes: legacy, activeDraft: null };
    }

    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return { savedResumes: parseSavedConfigs(parsed), activeDraft: null };
    }

    return {
      savedResumes: parseSavedConfigs(parsed.savedResumes),
      activeDraft: parseActiveDraft(parsed.activeDraft),
    };
  } catch {
    return { savedResumes: [], activeDraft: null };
  }
}

export async function loadAppConfig(): Promise<AppConfigPayload> {
  if (window.electronAPI) {
    try {
      const payload = await window.electronAPI.loadConfigs();
      const savedResumes = parseSavedConfigs(
        Array.isArray(payload) ? payload : payload?.savedResumes
      );
      const activeDraft = Array.isArray(payload)
        ? null
        : parseActiveDraft(payload?.activeDraft);

      if (savedResumes.length === 0) {
        const legacy = loadLegacyLocalStorage();
        if (legacy.length > 0) {
          const migrated = { savedResumes: legacy, activeDraft: null };
          await persistAppConfig(migrated);
          localStorage.removeItem(LEGACY_STORAGE_KEY);
          return migrated;
        }
      }

      return { savedResumes, activeDraft };
    } catch (error) {
      console.error('Failed to load configs from Documents:', error);
      return loadFromLocalStorage();
    }
  }

  return loadFromLocalStorage();
}

export async function loadSavedConfigs(): Promise<SavedResumeConfig[]> {
  const config = await loadAppConfig();
  return config.savedResumes;
}

export async function persistAppConfig(payload: AppConfigPayload): Promise<void> {
  const normalized: AppConfigPayload = {
    savedResumes: payload.savedResumes,
    activeDraft: payload.activeDraft ? {
      ...payload.activeDraft,
      data: normalizeResumeData(payload.activeDraft.data),
    } : null,
  };

  if (window.electronAPI) {
    try {
      await window.electronAPI.saveConfigs(normalized);
      return;
    } catch (error) {
      console.error('Failed to save configs to Documents:', error);
    }
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
}

export async function persistSavedConfigs(
  configs: SavedResumeConfig[],
  activeDraft: ActiveDraft | null = null
): Promise<void> {
  await persistAppConfig({ savedResumes: configs, activeDraft });
}

export async function getConfigStoragePath(): Promise<string | null> {
  if (!window.electronAPI) return null;
  try {
    return await window.electronAPI.getConfigPath();
  } catch {
    return null;
  }
}

export function createSavedConfig(
  name: string,
  data: ResumeData,
  template: TemplateType,
  accentColor: string
): SavedResumeConfig {
  const now = new Date().toISOString();

  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    name: name.trim() || 'Без названия',
    data: normalizeResumeData(data),
    template,
    accentColor,
    createdAt: now,
    updatedAt: now,
  };
}

export function toConfigFile(
  name: string,
  data: ResumeData,
  template: TemplateType,
  accentColor: string
): ResumeConfigFile {
  return {
    version: CONFIG_VERSION,
    app: 'o-sebe',
    name: name.trim() || 'Без названия',
    template,
    accentColor,
    data: normalizeResumeData(data),
    exportedAt: new Date().toISOString(),
  };
}

export function parseConfigFile(raw: unknown): ResumeConfigFile | null {
  if (!raw || typeof raw !== 'object') return null;

  const config = raw as Partial<ResumeConfigFile>;
  if (!config.data || typeof config.data !== 'object') return null;

  const template = TEMPLATE_TYPES.includes(config.template as TemplateType)
    ? (config.template as TemplateType)
    : 'classic';

  return {
    version: CONFIG_VERSION,
    app: 'o-sebe',
    name: typeof config.name === 'string' ? config.name : 'Импортированное резюме',
    template,
    accentColor: typeof config.accentColor === 'string' ? config.accentColor : '#5ba8a0',
    data: normalizeResumeData(config.data),
    exportedAt: typeof config.exportedAt === 'string' ? config.exportedAt : new Date().toISOString(),
  };
}

export function downloadConfigFile(config: ResumeConfigFile): void {
  const blob = new Blob([JSON.stringify(config, null, 2)], {
    type: 'application/json;charset=utf-8',
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  const safeName = config.name.replace(/[<>:"/\\|?*]+/g, '_').trim() || 'resume';

  anchor.href = url;
  anchor.download = `${safeName}.osebe.json`;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function sanitizeFileName(name: string): string {
  return name.replace(/[<>:"/\\|?*]+/g, '_').trim() || 'resume';
}
