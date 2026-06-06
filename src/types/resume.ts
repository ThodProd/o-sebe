export interface CustomContact {
  id: string;
  label: string;
  value: string;
}

export interface PersonalInfo {
  firstName: string;
  lastName: string;
  middleName: string;
  position: string;
  photo: string;
  phone: string;
  email: string;
  city: string;
  website: string;
  linkedin: string;
  telegram: string;
}

export interface MainInfo {
  desiredSalary: string;
  employment: string;
  schedule: string;
  readyToTravel: boolean;
  readyToRelocate: boolean;
}

export interface PersonalDetails {
  citizenship: string;
  education: string;
  birthDate: string;
  gender: string;
  maritalStatus: string;
  militaryService: string;
  medicalBook: string;
  drivingLicense: string;
}

export interface Language {
  id: string;
  language: string;
  level: string;
}

export interface WorkExperience {
  id: string;
  company: string;
  position: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  responsibilities: string;
  achievements: string;
}

export interface Education {
  id: string;
  institution: string;
  level: string;
  city: string;
  faculty: string;
  speciality: string;
  startDate: string;
  endDate: string;
  graduationYear: string;
  studyForm: string;
  additionalInfo: string;
  showStudyDuration: boolean;
}

export interface Course {
  id: string;
  name: string;
  institution: string;
  graduationYear: string;
  duration: string;
}

export interface Skill {
  id: string;
  name: string;
}

export interface AdditionalInfo {
  personalQualities: string;
  professionalSkills: string;
  aboutMe: string;
  computerSkills: string[];
  hobbies: string;
}

export interface ResumeData {
  personal: PersonalInfo;
  customContacts: CustomContact[];
  main: MainInfo;
  personalDetails: PersonalDetails;
  languages: Language[];
  workExperience: WorkExperience[];
  education: Education[];
  courses: Course[];
  skills: Skill[];
  additional: AdditionalInfo;
}

export type TemplateType = 'classic' | 'modern' | 'minimal' | 'dark' | 'elegant' | 'white';

export interface SavedResumeConfig {
  id: string;
  name: string;
  data: ResumeData;
  template: TemplateType;
  accentColor: string;
  createdAt: string;
  updatedAt: string;
}

export interface ActiveDraft {
  data: ResumeData;
  template: TemplateType;
  accentColor: string;
  activeConfigId: string | null;
  hasUnsavedChanges: boolean;
  updatedAt: string;
}

export interface AppConfigPayload {
  savedResumes: SavedResumeConfig[];
  activeDraft: ActiveDraft | null;
}

export interface ResumeConfigFile {
  version: 1;
  app: 'o-sebe';
  name: string;
  template: TemplateType;
  accentColor: string;
  data: ResumeData;
  exportedAt: string;
}

export interface TemplateConfig {
  id: TemplateType;
  name: string;
  description: string;
  primaryColor: string;
  accentColor: string;
  preview: string;
}
