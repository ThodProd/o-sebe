import React, { useState, useRef } from 'react';
import { useResumeStore } from '../store/resumeStore';
import { FormInput, FormTextarea, FormSelect } from './FormField';
import PhotoEditorModal from './PhotoEditorModal';
import { calculateTenure, EDUCATION_LEVEL_OPTIONS } from '../utils/resumeFormat';
import { Plus, Trash2, ChevronDown, ChevronRight, Upload, X, Crop } from 'lucide-react';

interface SectionProps {
  title: string;
  icon: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

const AccordionSection: React.FC<SectionProps> = ({ title, icon, children, defaultOpen = false }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="mb-2 border border-gray-200 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 bg-white hover:bg-gray-50 transition text-left"
      >
        <div className="flex items-center gap-2">
          <span>{icon}</span>
          <span className="font-semibold text-gray-700 text-sm">{title}</span>
        </div>
        {open ? <ChevronDown size={16} className="text-gray-400" /> : <ChevronRight size={16} className="text-gray-400" />}
      </button>
      {open && (
        <div className="px-4 pb-4 pt-2 bg-gray-50/50 border-t border-gray-100">
          {children}
        </div>
      )}
    </div>
  );
};

const EditorPanel: React.FC = () => {
  const store = useResumeStore();
  const { data } = store;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [editorImage, setEditorImage] = useState<string | null>(null);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (ev.target?.result) {
          setEditorImage(ev.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
    e.target.value = '';
  };

  const handlePhotoSave = (dataUrl: string) => {
    store.setPhoto(dataUrl);
    setEditorImage(null);
  };

  const handlePhotoEditorCancel = () => {
    setEditorImage(null);
  };

  const handlePhotoRemove = () => {
    store.setPhoto('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-2">
      {/* Photo */}
      <AccordionSection title="Фото" icon="📷" defaultOpen>
        <div className="flex items-center gap-3 mt-2">
          {data.personal.photo ? (
            <div className="relative">
              <img src={data.personal.photo} alt="" className="w-[70px] h-[70px] rounded-lg object-cover border-2 border-blue-200" />
              <button type="button" onClick={handlePhotoRemove} className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5">
                <X size={10} />
              </button>
            </div>
          ) : (
            <div className="w-[70px] h-[70px] rounded-lg bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="12" cy="8" r="4" />
                <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
              </svg>
            </div>
          )}
          <div className="flex flex-col gap-2">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 px-3 py-2 bg-blue-50 border border-blue-200 text-blue-700 rounded-lg text-xs hover:bg-blue-100 transition font-medium"
            >
              <Upload size={13} />
              Загрузить фото
            </button>
            {data.personal.photo && (
              <button
                type="button"
                onClick={() => setEditorImage(data.personal.photo)}
                className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-xs hover:bg-gray-50 transition font-medium"
              >
                <Crop size={13} />
                Редактировать
              </button>
            )}
            <p className="text-[10px] text-gray-400">JPG, PNG, WEBP и другие форматы</p>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
          </div>
        </div>
        {editorImage && (
          <PhotoEditorModal
            imageSrc={editorImage}
            onSave={handlePhotoSave}
            onCancel={handlePhotoEditorCancel}
          />
        )}
      </AccordionSection>

      {/* Personal */}
      <AccordionSection title="Личные данные" icon="👤" defaultOpen>
        <div className="grid grid-cols-2 gap-x-3 mt-2">
          <FormInput label="Фамилия" value={data.personal.lastName} onChange={(v) => store.updatePersonal('lastName', v)} placeholder="Иванов" />
          <FormInput label="Имя" value={data.personal.firstName} onChange={(v) => store.updatePersonal('firstName', v)} placeholder="Иван" />
          <div className="col-span-2">
            <FormInput label="Отчество" value={data.personal.middleName} onChange={(v) => store.updatePersonal('middleName', v)} placeholder="Иванович" />
          </div>
          <div className="col-span-2">
            <FormInput label="Желаемая должность" value={data.personal.position} onChange={(v) => store.updatePersonal('position', v)} placeholder="Менеджер по продажам" />
          </div>
        </div>
      </AccordionSection>

      {/* Contacts */}
      <AccordionSection title="Контактные данные" icon="📞">
        <div className="mt-2">
          <FormInput label="Телефон" value={data.personal.phone} onChange={(v) => store.updatePersonal('phone', v)} placeholder="+7 (999) 000-00-00" type="tel" />
          <FormInput label="Email" value={data.personal.email} onChange={(v) => store.updatePersonal('email', v)} placeholder="email@example.ru" type="email" />
          <FormInput label="Город проживания" value={data.personal.city} onChange={(v) => store.updatePersonal('city', v)} placeholder="г. Москва" />
          <FormInput label="Сайт / Портфолио" value={data.personal.website} onChange={(v) => store.updatePersonal('website', v)} placeholder="https://..." />
          <FormInput label="Telegram" value={data.personal.telegram} onChange={(v) => store.updatePersonal('telegram', v)} placeholder="@username" />
          <FormInput label="LinkedIn" value={data.personal.linkedin} onChange={(v) => store.updatePersonal('linkedin', v)} placeholder="linkedin.com/in/..." />

          <div className="mt-3 pt-3 border-t border-gray-200">
            <p className="text-xs font-semibold text-gray-600 mb-2">Дополнительные поля</p>
            <div className="space-y-3">
              {data.customContacts.map((contact, idx) => (
                <div key={contact.id} className="bg-white rounded-lg border border-gray-200 p-3">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-semibold text-xs text-gray-700">Поле {idx + 1}</p>
                    <button
                      type="button"
                      onClick={() => store.removeCustomContact(contact.id)}
                      className="text-red-400 hover:text-red-600 p-1 rounded hover:bg-red-50 transition"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                  <FormInput
                    label="Название поля"
                    value={contact.label}
                    onChange={(v) => store.updateCustomContact(contact.id, 'label', v)}
                    placeholder="Например: WhatsApp"
                  />
                  <FormInput
                    label="Текст поля"
                    value={contact.value}
                    onChange={(v) => store.updateCustomContact(contact.id, 'value', v)}
                    placeholder="Например: +7 999 000-00-00"
                  />
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={store.addCustomContact}
              className="flex items-center gap-2 text-xs text-blue-600 hover:text-blue-800 font-medium mt-2"
            >
              <Plus size={14} />
              Добавить поле
            </button>
          </div>
        </div>
      </AccordionSection>

      {/* Main info */}
      <AccordionSection title="Основная информация" icon="💼">
        <div className="mt-2">
          <FormInput label="Желаемая зарплата" value={data.main.desiredSalary} onChange={(v) => store.updateMain('desiredSalary', v)} placeholder="50 000 рублей" />
          <FormSelect label="Тип занятости" value={data.main.employment} onChange={(v) => store.updateMain('employment', v)}
            options={['Полная занятость', 'Частичная занятость', 'Проектная работа', 'Стажировка', 'Волонтёрство']} />
          <FormSelect label="График работы" value={data.main.schedule} onChange={(v) => store.updateMain('schedule', v)}
            options={['5/2', '2/2', '6/1', 'Свободный', 'Удалённо', 'Гибкий']} />
          <div className="flex gap-4 mt-2">
            <label className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer">
              <input type="checkbox" checked={data.main.readyToTravel} onChange={(e) => store.updateMain('readyToTravel', e.target.checked)} className="w-4 h-4 rounded" />
              Готов к командировкам
            </label>
            <label className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer">
              <input type="checkbox" checked={data.main.readyToRelocate} onChange={(e) => store.updateMain('readyToRelocate', e.target.checked)} className="w-4 h-4 rounded" />
              Готов к переезду
            </label>
          </div>
        </div>
      </AccordionSection>

      {/* Personal details */}
      <AccordionSection title="Личная информация" icon="🪪">
        <div className="mt-2">
          <FormInput label="Гражданство" value={data.personalDetails.citizenship} onChange={(v) => store.updatePersonalDetails('citizenship', v)} />
          <FormSelect label="Образование" value={data.personalDetails.education} onChange={(v) => store.updatePersonalDetails('education', v)}
            options={['Высшее (бакалавр)', 'Высшее (специалитет)', 'Высшее (магистр)', 'Неполное высшее', 'Среднее профессиональное', 'Среднее', 'Два высших']} />
          <FormInput label="Дата рождения" value={data.personalDetails.birthDate} onChange={(v) => store.updatePersonalDetails('birthDate', v)} placeholder="01.01.2000" />
          <FormSelect label="Пол" value={data.personalDetails.gender} onChange={(v) => store.updatePersonalDetails('gender', v)}
            options={['Не указан', 'Мужской', 'Женский']} />
          <FormSelect label="Семейное положение" value={data.personalDetails.maritalStatus} onChange={(v) => store.updatePersonalDetails('maritalStatus', v)}
            options={[
              'Не указан',
              'Не женат',
              'Не замужем',
              'Женат',
              'Замужем',
              'Женат (есть дети)',
              'Замужем (есть дети)',
              'Разведён',
              'Разведена',
              'Вдовец',
              'Вдова',
              'Гражданский брак',
            ]} />
          <FormSelect label="Служба в армии" value={data.personalDetails.militaryService} onChange={(v) => store.updatePersonalDetails('militaryService', v)}
            options={['Не служил', 'Служил', 'Военнообязанный', 'Не подлежит призыву']} />
          <FormSelect label="Медицинская книжка" value={data.personalDetails.medicalBook} onChange={(v) => store.updatePersonalDetails('medicalBook', v)}
            options={['Нет', 'Есть, действующая', 'Есть, требует обновления']} />
          <FormInput label="Водительские права (категории)" value={data.personalDetails.drivingLicense} onChange={(v) => store.updatePersonalDetails('drivingLicense', v)} placeholder="B, C" />
        </div>
      </AccordionSection>

      {/* Languages */}
      <AccordionSection title="Знание языков" icon="🌍">
        <div className="mt-2 space-y-3">
          {data.languages.map((lang) => (
            <div key={lang.id} className="flex gap-2 items-end">
              <div className="flex-1">
                <FormInput label="Язык" value={lang.language} onChange={(v) => store.updateLanguage(lang.id, 'language', v)} />
              </div>
              <div className="flex-1">
                <FormSelect label="Уровень" value={lang.level} onChange={(v) => store.updateLanguage(lang.id, 'level', v)}
                  options={['Родной', 'A1 — Начальный', 'A2 — Элементарный', 'B1 — Средний', 'B2 — Выше среднего', 'C1 — Продвинутый', 'C2 — Профессиональный']} />
              </div>
              <button onClick={() => store.removeLanguage(lang.id)} className="mb-3 p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition">
                <Trash2 size={14} />
              </button>
            </div>
          ))}
          <button onClick={store.addLanguage} className="flex items-center gap-2 text-xs text-blue-600 hover:text-blue-800 font-medium mt-1">
            <Plus size={14} />Добавить язык
          </button>
        </div>
      </AccordionSection>

      {/* Work experience */}
      <AccordionSection title="Опыт работы" icon="🏢">
        <div className="mt-2 space-y-4">
          {data.workExperience.map((work, idx) => (
            <div key={work.id} className="bg-white rounded-lg border border-gray-200 p-3">
              <div className="flex items-center justify-between mb-2">
                <p className="font-semibold text-xs text-gray-700">Место работы {idx + 1}</p>
                <button onClick={() => store.removeWorkExperience(work.id)} className="text-red-400 hover:text-red-600 p-1 rounded hover:bg-red-50 transition">
                  <Trash2 size={13} />
                </button>
              </div>
              <FormInput label="Название организации" value={work.company} onChange={(v) => store.updateWorkExperience(work.id, 'company', v)} />
              <FormInput label="Должность" value={work.position} onChange={(v) => store.updateWorkExperience(work.id, 'position', v)} />
              <div className="grid grid-cols-2 gap-x-3">
                <FormInput label="Дата начала" value={work.startDate} onChange={(v) => store.updateWorkExperience(work.id, 'startDate', v)} placeholder="Январь 2020" />
                {!work.isCurrent && (
                  <FormInput label="Дата окончания" value={work.endDate} onChange={(v) => store.updateWorkExperience(work.id, 'endDate', v)} placeholder="Декабрь 2022" />
                )}
              </div>
              <label className="flex items-center gap-2 text-xs text-gray-600 mb-2 cursor-pointer">
                <input type="checkbox" checked={work.isCurrent} onChange={(e) => store.updateWorkExperience(work.id, 'isCurrent', e.target.checked)} className="w-4 h-4 rounded" />
                По настоящее время
              </label>
              {calculateTenure(work.startDate, work.endDate, work.isCurrent) && (
                <div className="mb-3 px-3 py-2 rounded-lg bg-blue-50 border border-blue-100">
                  <p className="text-[10px] font-semibold text-blue-700 uppercase tracking-wide">Стаж (авто)</p>
                  <p className="text-sm text-blue-900">{calculateTenure(work.startDate, work.endDate, work.isCurrent)}</p>
                </div>
              )}
              <FormTextarea
                label="Обязанности"
                value={work.responsibilities}
                onChange={(v) => store.updateWorkExperience(work.id, 'responsibilities', v)}
                rows={4}
                placeholder="Каждая обязанность с новой строки"
              />
              <FormTextarea
                label="Достижения"
                value={work.achievements}
                onChange={(v) => store.updateWorkExperience(work.id, 'achievements', v)}
                rows={4}
                placeholder="Каждое достижение с новой строки"
              />
            </div>
          ))}
          <button onClick={store.addWorkExperience} className="flex items-center gap-2 text-xs text-blue-600 hover:text-blue-800 font-medium">
            <Plus size={14} />Добавить место работы
          </button>
        </div>
      </AccordionSection>

      {/* Education */}
      <AccordionSection title="Образование" icon="🎓">
        <div className="mt-2 space-y-4">
          {data.education.map((edu, idx) => (
            <div key={edu.id} className="bg-white rounded-lg border border-gray-200 p-3">
              <div className="flex items-center justify-between mb-2">
                <p className="font-semibold text-xs text-gray-700">Учебное заведение {idx + 1}</p>
                <button onClick={() => store.removeEducation(edu.id)} className="text-red-400 hover:text-red-600 p-1 rounded hover:bg-red-50 transition">
                  <Trash2 size={13} />
                </button>
              </div>
              <FormInput label="Название учебного заведения" value={edu.institution} onChange={(v) => store.updateEducation(edu.id, 'institution', v)} />
              <FormSelect
                label="Уровень образования"
                value={edu.level}
                onChange={(v) => store.updateEducation(edu.id, 'level', v)}
                options={[...EDUCATION_LEVEL_OPTIONS]}
              />
              <FormInput label="Город" value={edu.city} onChange={(v) => store.updateEducation(edu.id, 'city', v)} placeholder="г. Москва" />
              <FormInput label="Факультет" value={edu.faculty} onChange={(v) => store.updateEducation(edu.id, 'faculty', v)} />
              <FormInput label="Специальность" value={edu.speciality} onChange={(v) => store.updateEducation(edu.id, 'speciality', v)} />
              <div className="grid grid-cols-2 gap-x-3">
                <FormInput label="Начало обучения" value={edu.startDate} onChange={(v) => store.updateEducation(edu.id, 'startDate', v)} placeholder="Сентябрь 2019" />
                <FormInput label="Окончание обучения" value={edu.endDate} onChange={(v) => store.updateEducation(edu.id, 'endDate', v)} placeholder="Июнь 2023" />
              </div>
              <FormSelect label="Форма обучения" value={edu.studyForm} onChange={(v) => store.updateEducation(edu.id, 'studyForm', v)}
                options={['Очная', 'Заочная', 'Очно-заочная', 'Дистанционная']} />
              <FormInput
                label="Дополнительно"
                value={edu.additionalInfo}
                onChange={(v) => store.updateEducation(edu.id, 'additionalInfo', v)}
                placeholder="Проф. переподготовка"
              />
              <label className="flex items-center gap-2 text-xs text-gray-600 mb-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={edu.showStudyDuration}
                  onChange={(e) => store.updateEducation(edu.id, 'showStudyDuration', e.target.checked)}
                  className="w-4 h-4 rounded"
                />
                Показывать длительность обучения в скобках у периода
              </label>
            </div>
          ))}
          <button onClick={store.addEducation} className="flex items-center gap-2 text-xs text-blue-600 hover:text-blue-800 font-medium">
            <Plus size={14} />Добавить образование
          </button>
        </div>
      </AccordionSection>

      {/* Courses */}
      <AccordionSection title="Курсы и тренинги" icon="📚">
        <div className="mt-2 space-y-4">
          {data.courses.map((course, idx) => (
            <div key={course.id} className="bg-white rounded-lg border border-gray-200 p-3">
              <div className="flex items-center justify-between mb-2">
                <p className="font-semibold text-xs text-gray-700">Курс {idx + 1}</p>
                <button onClick={() => store.removeCourse(course.id)} className="text-red-400 hover:text-red-600 p-1 rounded hover:bg-red-50 transition">
                  <Trash2 size={13} />
                </button>
              </div>
              <FormInput label="Название курса / тренинга" value={course.name} onChange={(v) => store.updateCourse(course.id, 'name', v)} />
              <FormInput label="Учебное заведение" value={course.institution} onChange={(v) => store.updateCourse(course.id, 'institution', v)} />
              <div className="grid grid-cols-2 gap-x-3">
                <FormInput label="Год окончания" value={course.graduationYear} onChange={(v) => store.updateCourse(course.id, 'graduationYear', v)} placeholder="2023" />
                <FormInput label="Длительность" value={course.duration} onChange={(v) => store.updateCourse(course.id, 'duration', v)} placeholder="6 месяцев" />
              </div>
            </div>
          ))}
          <button onClick={store.addCourse} className="flex items-center gap-2 text-xs text-blue-600 hover:text-blue-800 font-medium">
            <Plus size={14} />Добавить курс
          </button>
        </div>
      </AccordionSection>

      {/* Skills */}
      <AccordionSection title="Компьютерные навыки" icon="💻">
        <div className="mt-2 space-y-2">
          {data.skills.map((skill) => (
            <div key={skill.id} className="flex items-center gap-2">
              <input
                value={skill.name}
                onChange={(e) => store.updateSkill(skill.id, e.target.value)}
                className="flex-1 px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
              />
              <button onClick={() => store.removeSkill(skill.id)} className="text-red-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition">
                <Trash2 size={13} />
              </button>
            </div>
          ))}
          <button onClick={store.addSkill} className="flex items-center gap-2 text-xs text-blue-600 hover:text-blue-800 font-medium mt-1">
            <Plus size={14} />Добавить навык
          </button>
        </div>
      </AccordionSection>

      {/* Additional */}
      <AccordionSection title="Дополнительная информация" icon="ℹ️">
        <div className="mt-2">
          <FormTextarea label="О себе / Цель поиска работы" value={data.additional.aboutMe} onChange={(v) => store.updateAdditional('aboutMe', v)} rows={3} />
          <FormTextarea label="Профессиональные навыки" value={data.additional.professionalSkills} onChange={(v) => store.updateAdditional('professionalSkills', v)} rows={3} />
          <FormTextarea label="Личные качества" value={data.additional.personalQualities} onChange={(v) => store.updateAdditional('personalQualities', v)} rows={2} />
          <FormInput label="Хобби и увлечения" value={data.additional.hobbies} onChange={(v) => store.updateAdditional('hobbies', v)} />
        </div>
      </AccordionSection>
    </div>
  );
};

export default EditorPanel;
