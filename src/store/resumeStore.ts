import { create } from 'zustand';
import { ActiveDraft, ResumeData, SavedResumeConfig, TemplateType } from '../types/resume';
import {
  createSavedConfig,
  downloadConfigFile,
  getConfigStoragePath,
  loadAppConfig,
  normalizeResumeData,
  parseConfigFile,
  persistAppConfig,
  toConfigFile,
} from '../utils/resumeStorage';
import { appPrompt } from '../utils/dialog';
import { appAlert, appConfirm } from '../utils/dialog';
import { handleUnsavedBeforeSwitch } from '../utils/unsavedChanges';

const defaultData: ResumeData = {
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
  languages: [
    { id: '1', language: 'Русский', level: 'Родной' },
    { id: '2', language: 'Английский', level: 'A2 — Элементарный' },
  ],
  workExperience: [
    {
      id: '1',
      company: 'ООО «Название организации»',
      position: 'Должность',
      startDate: 'Январь 2020',
      endDate: '',
      isCurrent: true,
      responsibilities: '',
      achievements: '',
    },
  ],
  education: [
    {
      id: '1',
      institution: 'Название учебного заведения',
      level: 'Высшее (бакалавр)',
      city: 'г. Москва',
      faculty: 'Название факультета',
      speciality: 'Название специальности',
      startDate: 'Сентябрь 2019',
      endDate: 'Июнь 2023',
      graduationYear: '2023',
      studyForm: 'Очная',
      additionalInfo: '',
      showStudyDuration: true,
    },
  ],
  courses: [
    {
      id: '1',
      name: 'Название курса или тренинга',
      institution: 'Название учебного заведения',
      graduationYear: '2023',
      duration: '6 месяцев',
    },
  ],
  skills: [
    { id: '1', name: 'Microsoft Office' },
    { id: '2', name: '1С Предприятие' },
    { id: '3', name: 'Работа с почтой' },
    { id: '4', name: 'Adobe Photoshop' },
  ],
  additional: {
    personalQualities: 'Ответственность, коммуникабельность, стрессоустойчивость',
    professionalSkills: 'Укажите Ваши профессиональные навыки',
    aboutMe: 'Расскажите немного о себе. Укажите цель поиска работы.',
    computerSkills: ['Microsoft Office', '1С Предприятие', 'Работа с почтой', 'Adobe Photoshop'],
    hobbies: '',
  },
};

interface ResumeStore {
  data: ResumeData;
  template: TemplateType;
  accentColor: string;
  savedConfigs: SavedResumeConfig[];
  activeConfigId: string | null;
  baselineSnapshot: string;
  configsReady: boolean;
  configStoragePath: string | null;
  pendingDraftRecovery: ActiveDraft | null;
  initConfigs: () => Promise<void>;
  restoreDraft: (draft: ActiveDraft) => void;
  dismissDraftRecovery: (draft: ActiveDraft) => void;
  clearPendingDraftRecovery: () => void;
  saveCurrentResume: () => Promise<boolean>;
  updatePersonal: (field: string, value: string) => void;
  addCustomContact: () => void;
  updateCustomContact: (id: string, field: string, value: string) => void;
  removeCustomContact: (id: string) => void;
  updateMain: (field: string, value: string | boolean) => void;
  updatePersonalDetails: (field: string, value: string) => void;
  addLanguage: () => void;
  updateLanguage: (id: string, field: string, value: string) => void;
  removeLanguage: (id: string) => void;
  addWorkExperience: () => void;
  updateWorkExperience: (id: string, field: string, value: string | boolean) => void;
  removeWorkExperience: (id: string) => void;
  addEducation: () => void;
  updateEducation: (id: string, field: string, value: string | boolean) => void;
  removeEducation: (id: string) => void;
  addCourse: () => void;
  updateCourse: (id: string, field: string, value: string) => void;
  removeCourse: (id: string) => void;
  addSkill: () => void;
  updateSkill: (id: string, value: string) => void;
  removeSkill: (id: string) => void;
  updateAdditional: (field: string, value: string) => void;
  setTemplate: (template: TemplateType) => void;
  setAccentColor: (color: string) => void;
  setPhoto: (photo: string) => void;
  resetData: () => void;
  createNewResume: () => void;
  hasUnsavedChanges: () => boolean;
  updateBaseline: () => void;
  saveCurrentAs: (name: string, existingId?: string) => void;
  updateActiveSaved: () => void;
  loadSavedConfig: (id: string) => void;
  tryLoadSavedConfig: (id: string) => Promise<boolean>;
  deleteSavedConfig: (id: string) => void;
  renameSavedConfig: (id: string, name: string) => Promise<void>;
  exportSavedConfig: (id: string) => void;
  exportCurrentConfig: () => void;
  importConfigFile: (file: File) => Promise<'loaded' | 'saved' | 'error'>;
}

const applyResumeState = (
  data: ResumeData,
  template: TemplateType,
  accentColor: string,
  activeConfigId: string | null = null
) => ({
  data: normalizeResumeData(data),
  template,
  accentColor,
  activeConfigId,
});

let skipDraftPersist = false;
let draftPersistTimer: ReturnType<typeof setTimeout> | null = null;

const buildBaselineSnapshot = (
  savedConfigs: SavedResumeConfig[],
  activeConfigId: string | null
) => {
  if (activeConfigId) {
    const saved = savedConfigs.find((item) => item.id === activeConfigId);
    if (saved) {
      return serializeSession(
        applyResumeState(saved.data, saved.template, saved.accentColor, saved.id)
      );
    }
  }

  return serializeSession(applyResumeState(defaultData, 'classic', '#5ba8a0', null));
};

const buildActiveDraft = (state: {
  data: ResumeData;
  template: TemplateType;
  accentColor: string;
  activeConfigId: string | null;
  baselineSnapshot: string;
}): ActiveDraft => ({
  data: normalizeResumeData(state.data),
  template: state.template,
  accentColor: state.accentColor,
  activeConfigId: state.activeConfigId,
  hasUnsavedChanges: serializeSession(state) !== state.baselineSnapshot,
  updatedAt: new Date().toISOString(),
});

const persistStoreSnapshot = (state: {
  savedConfigs: SavedResumeConfig[];
  data: ResumeData;
  template: TemplateType;
  accentColor: string;
  activeConfigId: string | null;
  baselineSnapshot: string;
}) => {
  void persistAppConfig({
    savedResumes: state.savedConfigs,
    activeDraft: buildActiveDraft(state),
  }).catch((error) => {
    console.error('Failed to persist configs:', error);
  });
};

const serializeSession = (state: {
  data: ResumeData;
  template: TemplateType;
  accentColor: string;
  activeConfigId: string | null;
}) =>
  JSON.stringify({
    data: normalizeResumeData(state.data),
    template: state.template,
    accentColor: state.accentColor,
    activeConfigId: state.activeConfigId,
  });

const createInitialState = () => {
  const session = applyResumeState(defaultData, 'classic', '#5ba8a0', null);
  return {
    ...session,
    savedConfigs: [],
    configsReady: false,
    configStoragePath: null,
    pendingDraftRecovery: null,
    baselineSnapshot: serializeSession(session),
  };
};

export const useResumeStore = create<ResumeStore>((set, get) => {
  const writeSavedConfigs = (configs: SavedResumeConfig[]) => {
    persistStoreSnapshot({ ...get(), savedConfigs: configs });
    return configs;
  };

  return {
  ...createInitialState(),

  initConfigs: async () => {
    skipDraftPersist = true;

    const [{ savedResumes, activeDraft }, configStoragePath] = await Promise.all([
      loadAppConfig(),
      getConfigStoragePath(),
    ]);

    if (activeDraft?.hasUnsavedChanges) {
      set({
        savedConfigs: savedResumes,
        configsReady: true,
        configStoragePath,
        pendingDraftRecovery: activeDraft,
      });
    } else if (activeDraft) {
      const session = applyResumeState(
        activeDraft.data,
        activeDraft.template,
        activeDraft.accentColor,
        activeDraft.activeConfigId
      );
      set({
        savedConfigs: savedResumes,
        configsReady: true,
        configStoragePath,
        pendingDraftRecovery: null,
        ...session,
        baselineSnapshot: serializeSession(session),
      });
    } else {
      set({
        savedConfigs: savedResumes,
        configsReady: true,
        configStoragePath,
        pendingDraftRecovery: null,
      });
    }

    window.setTimeout(() => {
      skipDraftPersist = false;
    }, 0);
  },

  restoreDraft: (draft) => {
    skipDraftPersist = true;
    const state = get();
    const session = applyResumeState(
      draft.data,
      draft.template,
      draft.accentColor,
      draft.activeConfigId
    );

    set({
      ...session,
      baselineSnapshot: buildBaselineSnapshot(state.savedConfigs, draft.activeConfigId),
      pendingDraftRecovery: null,
    });

    persistStoreSnapshot(get());
    window.setTimeout(() => {
      skipDraftPersist = false;
    }, 0);
  },

  dismissDraftRecovery: (draft) => {
    skipDraftPersist = true;
    const state = get();

    if (draft.activeConfigId) {
      const saved = state.savedConfigs.find((item) => item.id === draft.activeConfigId);
      if (saved) {
        const session = applyResumeState(saved.data, saved.template, saved.accentColor, saved.id);
        set({
          ...session,
          baselineSnapshot: serializeSession(session),
          pendingDraftRecovery: null,
        });
      } else {
        const session = applyResumeState(defaultData, 'classic', '#5ba8a0', null);
        set({
          ...session,
          baselineSnapshot: serializeSession(session),
          pendingDraftRecovery: null,
        });
      }
    } else {
      const session = applyResumeState(defaultData, 'classic', '#5ba8a0', null);
      set({
        ...session,
        baselineSnapshot: serializeSession(session),
        pendingDraftRecovery: null,
      });
    }

    persistStoreSnapshot(get());
    window.setTimeout(() => {
      skipDraftPersist = false;
    }, 0);
  },

  clearPendingDraftRecovery: () => set({ pendingDraftRecovery: null }),

  saveCurrentResume: async () => {
    const state = get();

    if (state.activeConfigId) {
      get().updateActiveSaved();
      return true;
    }

    const name = await appPrompt('Введите название резюме:');
    if (!name?.trim()) return false;

    get().saveCurrentAs(name.trim());
    return true;
  },

  updatePersonal: (field, value) =>
    set((state) => ({
      data: { ...state.data, personal: { ...state.data.personal, [field]: value } },
    })),

  addCustomContact: () =>
    set((state) => ({
      data: {
        ...state.data,
        customContacts: [
          ...state.data.customContacts,
          { id: Date.now().toString(), label: 'Название поля', value: '' },
        ],
      },
    })),

  updateCustomContact: (id, field, value) =>
    set((state) => ({
      data: {
        ...state.data,
        customContacts: state.data.customContacts.map((contact) =>
          contact.id === id ? { ...contact, [field]: value } : contact
        ),
      },
    })),

  removeCustomContact: (id) =>
    set((state) => ({
      data: {
        ...state.data,
        customContacts: state.data.customContacts.filter((contact) => contact.id !== id),
      },
    })),

  updateMain: (field, value) =>
    set((state) => ({
      data: { ...state.data, main: { ...state.data.main, [field]: value } },
    })),

  updatePersonalDetails: (field, value) =>
    set((state) => ({
      data: { ...state.data, personalDetails: { ...state.data.personalDetails, [field]: value } },
    })),

  addLanguage: () =>
    set((state) => ({
      data: {
        ...state.data,
        languages: [
          ...state.data.languages,
          { id: Date.now().toString(), language: 'Новый язык', level: 'A1 — Начальный' },
        ],
      },
    })),

  updateLanguage: (id, field, value) =>
    set((state) => ({
      data: {
        ...state.data,
        languages: state.data.languages.map((l) =>
          l.id === id ? { ...l, [field]: value } : l
        ),
      },
    })),

  removeLanguage: (id) =>
    set((state) => ({
      data: {
        ...state.data,
        languages: state.data.languages.filter((l) => l.id !== id),
      },
    })),

  addWorkExperience: () =>
    set((state) => ({
      data: {
        ...state.data,
        workExperience: [
          ...state.data.workExperience,
          {
            id: Date.now().toString(),
            company: 'Название организации',
            position: 'Должность',
            startDate: '',
            endDate: '',
            isCurrent: false,
            responsibilities: '',
            achievements: '',
          },
        ],
      },
    })),

  updateWorkExperience: (id, field, value) =>
    set((state) => ({
      data: {
        ...state.data,
        workExperience: state.data.workExperience.map((w) =>
          w.id === id ? { ...w, [field]: value } : w
        ),
      },
    })),

  removeWorkExperience: (id) =>
    set((state) => ({
      data: {
        ...state.data,
        workExperience: state.data.workExperience.filter((w) => w.id !== id),
      },
    })),

  addEducation: () =>
    set((state) => ({
      data: {
        ...state.data,
        education: [
          ...state.data.education,
          {
            id: Date.now().toString(),
            institution: 'Название учебного заведения',
            level: 'Не указан',
            city: '',
            faculty: '',
            speciality: '',
            startDate: '',
            endDate: '',
            graduationYear: '',
            studyForm: 'Очная',
            additionalInfo: '',
            showStudyDuration: false,
          },
        ],
      },
    })),

  updateEducation: (id, field, value) =>
    set((state) => ({
      data: {
        ...state.data,
        education: state.data.education.map((e) =>
          e.id === id ? { ...e, [field]: value } : e
        ),
      },
    })),

  removeEducation: (id) =>
    set((state) => ({
      data: {
        ...state.data,
        education: state.data.education.filter((e) => e.id !== id),
      },
    })),

  addCourse: () =>
    set((state) => ({
      data: {
        ...state.data,
        courses: [
          ...state.data.courses,
          {
            id: Date.now().toString(),
            name: 'Название курса',
            institution: '',
            graduationYear: '',
            duration: '',
          },
        ],
      },
    })),

  updateCourse: (id, field, value) =>
    set((state) => ({
      data: {
        ...state.data,
        courses: state.data.courses.map((c) =>
          c.id === id ? { ...c, [field]: value } : c
        ),
      },
    })),

  removeCourse: (id) =>
    set((state) => ({
      data: {
        ...state.data,
        courses: state.data.courses.filter((c) => c.id !== id),
      },
    })),

  addSkill: () =>
    set((state) => ({
      data: {
        ...state.data,
        skills: [...state.data.skills, { id: Date.now().toString(), name: 'Новый навык' }],
      },
    })),

  updateSkill: (id, value) =>
    set((state) => ({
      data: {
        ...state.data,
        skills: state.data.skills.map((s) => (s.id === id ? { ...s, name: value } : s)),
      },
    })),

  removeSkill: (id) =>
    set((state) => ({
      data: {
        ...state.data,
        skills: state.data.skills.filter((s) => s.id !== id),
      },
    })),

  updateAdditional: (field, value) =>
    set((state) => ({
      data: { ...state.data, additional: { ...state.data.additional, [field]: value } },
    })),

  setTemplate: (template) => set({ template }),
  setAccentColor: (color) => set({ accentColor: color }),
  setPhoto: (photo) =>
    set((state) => ({
      data: { ...state.data, personal: { ...state.data.personal, photo } },
    })),

  resetData: () => {
    skipDraftPersist = true;
    const session = applyResumeState(defaultData, 'classic', '#5ba8a0', null);
    set({
      ...session,
      baselineSnapshot: serializeSession(session),
    });
    persistStoreSnapshot(get());
    window.setTimeout(() => {
      skipDraftPersist = false;
    }, 0);
  },

  createNewResume: () => {
    get().resetData();
  },

  hasUnsavedChanges: () => serializeSession(get()) !== get().baselineSnapshot,

  updateBaseline: () => set({ baselineSnapshot: serializeSession(get()) }),

  saveCurrentAs: (name, existingId) => {
    const state = get();
    const now = new Date().toISOString();

    if (existingId) {
      const updatedConfigs = state.savedConfigs.map((item) =>
        item.id === existingId
          ? {
              ...item,
              name: name.trim() || item.name,
              data: normalizeResumeData(state.data),
              template: state.template,
              accentColor: state.accentColor,
              updatedAt: now,
            }
          : item
      );

      set({
        savedConfigs: writeSavedConfigs(updatedConfigs),
        activeConfigId: existingId,
        baselineSnapshot: serializeSession({
          data: normalizeResumeData(state.data),
          template: state.template,
          accentColor: state.accentColor,
          activeConfigId: existingId,
        }),
      });
      return;
    }

    const saved = createSavedConfig(name, state.data, state.template, state.accentColor);
    set({
      savedConfigs: writeSavedConfigs([saved, ...state.savedConfigs]),
      activeConfigId: saved.id,
      baselineSnapshot: serializeSession({
        data: saved.data,
        template: saved.template,
        accentColor: saved.accentColor,
        activeConfigId: saved.id,
      }),
    });
  },

  updateActiveSaved: () => {
    const state = get();
    if (!state.activeConfigId) return;

    const now = new Date().toISOString();
    const updatedConfigs = state.savedConfigs.map((item) =>
      item.id === state.activeConfigId
        ? {
            ...item,
            data: normalizeResumeData(state.data),
            template: state.template,
            accentColor: state.accentColor,
            updatedAt: now,
          }
        : item
    );

    const activeId = state.activeConfigId;
    set({
      savedConfigs: writeSavedConfigs(updatedConfigs),
      baselineSnapshot: serializeSession({
        data: normalizeResumeData(state.data),
        template: state.template,
        accentColor: state.accentColor,
        activeConfigId: activeId,
      }),
    });
  },

  loadSavedConfig: (id) => {
    skipDraftPersist = true;
    const state = get();
    const config = state.savedConfigs.find((item) => item.id === id);
    if (!config) return;

    const session = applyResumeState(config.data, config.template, config.accentColor, config.id);
    set({
      ...session,
      baselineSnapshot: serializeSession(session),
    });
    persistStoreSnapshot(get());
    window.setTimeout(() => {
      skipDraftPersist = false;
    }, 0);
  },

  tryLoadSavedConfig: async (id) => {
    const state = get();
    const config = state.savedConfigs.find((item) => item.id === id);
    if (!config) return false;

    const canProceed = await handleUnsavedBeforeSwitch();
    if (!canProceed) return false;

    get().loadSavedConfig(id);
    return true;
  },

  deleteSavedConfig: (id) => {
    const state = get();
    const updatedConfigs = state.savedConfigs.filter((item) => item.id !== id);

    set({
      savedConfigs: writeSavedConfigs(updatedConfigs),
      activeConfigId: state.activeConfigId === id ? null : state.activeConfigId,
    });
  },

  renameSavedConfig: async (id, name) => {
    const state = get();
    const trimmedName = name.trim();
    if (!trimmedName) return;

    const duplicate = state.savedConfigs.find(
      (item) => item.id !== id && item.name.toLowerCase() === trimmedName.toLowerCase()
    );
    if (duplicate) {
      await appAlert('Резюме с таким названием уже существует');
      return;
    }

    const updatedConfigs = state.savedConfigs.map((item) =>
      item.id === id
        ? { ...item, name: trimmedName, updatedAt: new Date().toISOString() }
        : item
    );

    set({ savedConfigs: writeSavedConfigs(updatedConfigs) });
  },

  exportSavedConfig: (id) => {
    const config = get().savedConfigs.find((item) => item.id === id);
    if (!config) return;

    downloadConfigFile(
      toConfigFile(config.name, config.data, config.template, config.accentColor)
    );
  },

  exportCurrentConfig: () => {
    const state = get();
    const activeConfig = state.savedConfigs.find((item) => item.id === state.activeConfigId);
    const name =
      activeConfig?.name ||
      `${state.data.personal.lastName} ${state.data.personal.firstName}`.trim() ||
      'resume';

    downloadConfigFile(toConfigFile(name, state.data, state.template, state.accentColor));
  },

  importConfigFile: async (file) => {
    try {
      const text = await file.text();
      const parsed = parseConfigFile(JSON.parse(text));
      if (!parsed) return 'error';

      const state = get();
      const duplicate = state.savedConfigs.find(
        (item) => item.name.toLowerCase() === parsed.name.toLowerCase()
      );

      let savedId: string;

      if (duplicate) {
        if (!(await appConfirm(`Резюме «${parsed.name}» уже есть. Заменить сохранённую копию?`))) {
          const session = applyResumeState(parsed.data, parsed.template, parsed.accentColor, null);
          set({
            ...session,
            baselineSnapshot: serializeSession(session),
          });
          return 'loaded';
        }

        const now = new Date().toISOString();
        const updatedConfigs = state.savedConfigs.map((item) =>
          item.id === duplicate.id
            ? {
                ...item,
                name: parsed.name,
                data: parsed.data,
                template: parsed.template,
                accentColor: parsed.accentColor,
                updatedAt: now,
              }
            : item
        );

        savedId = duplicate.id;
        const session = applyResumeState(parsed.data, parsed.template, parsed.accentColor, savedId);
        set({
          ...session,
          savedConfigs: writeSavedConfigs(updatedConfigs),
          baselineSnapshot: serializeSession(session),
        });
        return 'saved';
      }

      const saved = createSavedConfig(
        parsed.name,
        parsed.data,
        parsed.template,
        parsed.accentColor
      );

      const session = applyResumeState(parsed.data, parsed.template, parsed.accentColor, saved.id);
      set({
        ...session,
        savedConfigs: writeSavedConfigs([saved, ...state.savedConfigs]),
        baselineSnapshot: serializeSession(session),
      });
      return 'saved';
    } catch {
      return 'error';
    }
  },
};
});

useResumeStore.subscribe((state, previousState) => {
  if (!state.configsReady || skipDraftPersist) return;

  const currentSnapshot = serializeSession(state);
  const previousSnapshot = serializeSession(previousState);
  if (currentSnapshot === previousSnapshot && state.savedConfigs === previousState.savedConfigs) {
    return;
  }

  if (draftPersistTimer) {
    clearTimeout(draftPersistTimer);
  }

  draftPersistTimer = setTimeout(() => {
    persistStoreSnapshot(useResumeStore.getState());
  }, 300);
});
