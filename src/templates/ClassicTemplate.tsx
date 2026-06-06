import React from 'react';
import { ResumeData } from '../types/resume';
import { Phone, Mail, MapPin, Globe } from 'lucide-react';
import MultilineText from '../components/MultilineText';
import CustomContactsList from '../components/CustomContactsList';
import {
  calculateTenure,
  formatEducationInstitution,
  formatEducationPeriod,
  formatWorkPeriod,
  hasText,
} from '../utils/resumeFormat';

interface Props {
  data: ResumeData;
  accentColor: string;
}

const SectionTitle: React.FC<{ text: string; color: string }> = ({ text, color }) => (
  <div className="mb-2 mt-3 first:mt-0">
    <p className="text-[9px] font-bold uppercase tracking-widest" style={{ color }}>{text}</p>
    <div className="border-t border-gray-300 mt-0.5" />
  </div>
);

const ClassicTemplate: React.FC<Props> = ({ data, accentColor }) => {
  const { personal, customContacts, main, personalDetails, languages, workExperience, education, courses, skills, additional } = data;
  const fullName = `${personal.lastName} ${personal.firstName} ${personal.middleName}`.trim();

  return (
    <div className="bg-white w-full flex flex-1 flex-col min-h-full" style={{ fontFamily: 'Inter, sans-serif', fontSize: '10px', color: '#222' }}>

      {/* === PAGE 1 HEADER === */}
      <div className="resume-break-unit flex" style={{ minHeight: 200 }}>
        {/* Photo block */}
        <div className="flex-shrink-0 bg-gray-200 flex items-center justify-center" style={{ width: 185 }}>
          {personal.photo ? (
            <img src={personal.photo} alt="Фото" className="w-full h-full object-cover" style={{ maxHeight: 200, minHeight: 200 }} />
          ) : (
            <div className="flex flex-col items-center justify-center text-gray-400 w-full h-full" style={{ minHeight: 200 }}>
              <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                <circle cx="12" cy="8" r="5" />
                <path d="M3 21c0-5 3.5-8 9-8s9 3 9 8" />
              </svg>
              <span className="text-[9px] mt-1">Фото</span>
            </div>
          )}
        </div>

        {/* Contact info */}
        <div className="flex-1 px-5 py-4 flex flex-col justify-center">
          <p className="text-[9px] font-bold uppercase tracking-widest mb-2" style={{ color: accentColor }}>КОНТАКТНЫЕ ДАННЫЕ</p>
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5 px-2 py-1 rounded text-white text-[10px]" style={{ background: accentColor }}>
              <Phone size={9} /><span>{personal.phone}</span>
            </div>
            <div className="flex items-center gap-1.5 px-2 py-1 rounded text-white text-[10px]" style={{ background: accentColor }}>
              <Mail size={9} /><span>{personal.email}</span>
            </div>
            <div className="flex items-center gap-1.5 px-2 py-1 rounded text-white text-[10px]" style={{ background: accentColor }}>
              <MapPin size={9} /><span>{personal.city}</span>
            </div>
            {personal.website && (
              <div className="flex items-center gap-1.5 px-2 py-1 rounded text-white text-[10px]" style={{ background: accentColor }}>
                <Globe size={9} /><span>{personal.website}</span>
              </div>
            )}
            {personal.telegram && (
              <div className="flex items-center gap-1.5 px-2 py-1 rounded text-white text-[10px]" style={{ background: accentColor }}>
                <span>✈</span><span>{personal.telegram}</span>
              </div>
            )}
            <CustomContactsList contacts={customContacts} variant="classic" accentColor={accentColor} />
          </div>
        </div>
      </div>

      {/* Name bar */}
      <div className="resume-break-unit px-5 py-3" style={{ background: accentColor }}>
        <h1 className="text-[16px] font-bold text-white leading-tight">{fullName}</h1>
        <p className="text-white text-[11px] opacity-90 mt-0.5">{personal.position}</p>
      </div>

      {/* === THREE COLUMN BODY === */}
      <div className="resume-template-body flex flex-1 items-stretch relative">
        {/* LEFT COLUMN */}
        <div className="flex-shrink-0 p-4 self-stretch" style={{ width: 185, background: '#f9f9f9', borderRight: '1px solid #e5e7eb' }}>
          <div className="resume-break-unit">
            <SectionTitle text="ОСНОВНАЯ ИНФОРМАЦИЯ" color={accentColor} />
            <p><strong>Желаемая зарплата:</strong><br />{main.desiredSalary}</p>
            <p className="mt-1"><strong>Занятость:</strong><br />{main.employment}</p>
            {main.schedule && <p className="mt-1"><strong>График:</strong><br />{main.schedule}</p>}
            {main.readyToTravel && <p className="mt-1">✓ Готов к командировкам</p>}
            {main.readyToRelocate && <p className="mt-1">✓ Готов к переезду</p>}
          </div>

          <div className="resume-break-unit">
            <SectionTitle text="ЗНАНИЕ ЯЗЫКОВ" color={accentColor} />
            {languages.map((lang) => (
              <p key={lang.id} className="mt-0.5">{lang.language} ({lang.level})</p>
            ))}
          </div>

          <div className="resume-break-unit">
            <SectionTitle text="КОМПЬЮТЕРНЫЕ НАВЫКИ" color={accentColor} />
            {skills.map((skill) => (
              <p key={skill.id} className="flex gap-1 mt-0.5">
                <span className="text-gray-400">-</span>{skill.name}
              </p>
            ))}
          </div>

          {additional.personalQualities && (
            <div className="resume-break-unit">
              <SectionTitle text="ЛИЧНЫЕ КАЧЕСТВА" color={accentColor} />
              <p>{additional.personalQualities}</p>
            </div>
          )}

          {additional.hobbies && (
            <div className="resume-break-unit">
              <SectionTitle text="ХОББИ" color={accentColor} />
              <p>{additional.hobbies}</p>
            </div>
          )}
        </div>

        {/* MIDDLE COLUMN */}
        <div className="flex-1 p-4">
          <div className="resume-break-unit">
            <SectionTitle text="ЛИЧНАЯ ИНФОРМАЦИЯ" color={accentColor} />
            <p><strong>Гражданство:</strong> {personalDetails.citizenship}</p>
            <p><strong>Образование:</strong> {personalDetails.education}</p>
            <p><strong>Дата рождения:</strong> {personalDetails.birthDate} г.</p>
            <p><strong>Пол:</strong> {personalDetails.gender}</p>
            {hasText(personalDetails.maritalStatus) && personalDetails.maritalStatus !== 'Не указан' && (
              <p><strong>Семейное положение:</strong> {personalDetails.maritalStatus}</p>
            )}
          </div>

          <SectionTitle text="ОПЫТ РАБОТЫ" color={accentColor} />
          {workExperience.map((work) => {
            const tenure = calculateTenure(work.startDate, work.endDate, work.isCurrent);
            const period = formatWorkPeriod(work.startDate, work.endDate, work.isCurrent);

            return (
              <div key={work.id} className="mb-3">
                <div className="resume-break-unit">
                  <p className="font-bold">▶ {work.company}</p>
                  {period && <p><strong>Период работы:</strong> {period}</p>}
                  {tenure && <p><strong>Стаж:</strong> {tenure}</p>}
                  <p><strong>Должность:</strong> {work.position}</p>
                </div>
                {hasText(work.responsibilities) && (
                  <div className="mt-1">
                    <p className="resume-break-unit"><strong>Обязанности:</strong></p>
                    <MultilineText text={work.responsibilities} />
                  </div>
                )}
                {hasText(work.achievements) && (
                  <div className="mt-1">
                    <p className="resume-break-unit"><strong>Достижения:</strong></p>
                    <MultilineText text={work.achievements} />
                  </div>
                )}
              </div>
            );
          })}

          <SectionTitle text="ОБРАЗОВАНИЕ" color={accentColor} />
          {education.map((edu) => {
            const studyPeriod = formatEducationPeriod(edu.startDate, edu.endDate, edu.showStudyDuration);

            return (
              <div key={edu.id} className="resume-break-unit mb-3">
                <p className="font-bold">▶ {formatEducationInstitution(edu.institution, edu.level)}</p>
                {hasText(edu.city) && <p><strong>Город:</strong> {edu.city}</p>}
                {studyPeriod && <p><strong>Период обучения:</strong> {studyPeriod}</p>}
                {edu.faculty && <p><strong>Факультет:</strong> {edu.faculty}</p>}
                {edu.speciality && <p><strong>Специальность:</strong> {edu.speciality}</p>}
                {edu.studyForm && <p><strong>Форма обучения:</strong> {edu.studyForm}</p>}
                {hasText(edu.additionalInfo) && <p><strong>Дополнительно:</strong> {edu.additionalInfo}</p>}
              </div>
            );
          })}

          {courses.length > 0 && (
            <>
              <SectionTitle text="КУРСЫ И ТРЕНИНГИ" color={accentColor} />
              {courses.map((course) => (
                <div key={course.id} className="resume-break-unit mb-3">
                  <p className="font-bold">▶ {course.name}</p>
                  {course.institution && <p><strong>Учебное заведение:</strong> {course.institution}</p>}
                  {course.graduationYear && <p><strong>Дата окончания:</strong> {course.graduationYear} год</p>}
                  {course.duration && <p><strong>Период обучения:</strong> {course.duration}</p>}
                </div>
              ))}
            </>
          )}

          {additional.professionalSkills && (
            <div className="resume-break-unit">
              <SectionTitle text="ПРОФЕССИОНАЛЬНЫЕ НАВЫКИ" color={accentColor} />
              <p>{additional.professionalSkills}</p>
            </div>
          )}

          {additional.aboutMe && (
            <div className="resume-break-unit">
              <SectionTitle text="О СЕБЕ" color={accentColor} />
              <p>{additional.aboutMe}</p>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN (Additional) — только первый лист */}
        <div
          className="resume-first-page-only resume-break-unit flex-shrink-0 p-4 self-start"
          style={{ width: 185, borderLeft: '1px solid #e5e7eb' }}
        >
          <SectionTitle text="ДОПОЛНИТЕЛЬНАЯ ИНФОРМАЦИЯ" color={accentColor} />

          {personalDetails.militaryService && (
            <p className="mb-1.5">
              <strong>Служба в армии:</strong> {personalDetails.militaryService}.
            </p>
          )}
          {personalDetails.medicalBook && (
            <p className="mb-1.5">
              <strong>Медицинская книжка:</strong> {personalDetails.medicalBook}.
            </p>
          )}
          {personalDetails.drivingLicense && (
            <p className="mb-1.5">
              <strong>Наличие водительских прав (категории):</strong> {personalDetails.drivingLicense}.
            </p>
          )}
          {additional.personalQualities && (
            <p className="mb-1.5">
              <strong>Личные качества:</strong> {additional.personalQualities}
            </p>
          )}
          {additional.professionalSkills && (
            <p className="mb-1.5">
              <strong>Профессиональные навыки:</strong> {additional.professionalSkills}
            </p>
          )}
          {additional.aboutMe && (
            <p className="mb-1.5">
              <strong>О себе:</strong> {additional.aboutMe}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClassicTemplate;
