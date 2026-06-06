import React from 'react';
import { ResumeData } from '../types/resume';
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

const ElegantTemplate: React.FC<Props> = ({ data, accentColor }) => {
  const { personal, customContacts, main, personalDetails, languages, workExperience, education, courses, skills, additional } = data;
  const fullName = `${personal.lastName} ${personal.firstName} ${personal.middleName}`.trim();

  return (
    <div className="bg-white w-full flex flex-1 flex-col min-h-full" style={{ fontFamily: 'Georgia, serif', fontSize: '11px', color: '#2d2d2d' }}>
      {/* Top header bar */}
      <div className="h-2" style={{ background: accentColor }} />

      {/* Header */}
      <div className="resume-break-unit flex items-center gap-6 px-8 py-6 border-b-2 border-gray-100">
        {personal.photo ? (
          <img src={personal.photo} alt="" className="w-[110px] h-[110px] rounded-full object-cover" style={{ border: `3px solid ${accentColor}` }} />
        ) : (
          <div className="w-[110px] h-[110px] rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0" style={{ border: `3px solid ${accentColor}` }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke={accentColor} strokeWidth="1.5">
              <circle cx="12" cy="8" r="4" />
              <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
            </svg>
          </div>
        )}
        <div className="flex-1">
          <h1 className="text-[22px] font-bold mb-0.5" style={{ fontFamily: 'Playfair Display, Georgia, serif', color: accentColor }}>{fullName}</h1>
          <p className="text-[13px] text-gray-500 mb-3 italic">{personal.position}</p>
          <div className="flex flex-wrap gap-4 text-[10px] text-gray-500">
            <span>☎ {personal.phone}</span>
            <span>@ {personal.email}</span>
            <span>⌂ {personal.city}</span>
            {personal.website && <span>⊕ {personal.website}</span>}
            <CustomContactsList contacts={customContacts} variant="elegant" accentColor={accentColor} />
          </div>
        </div>
        <div className="text-right text-[10px] text-gray-500 flex-shrink-0">
          <div className="inline-block px-3 py-2 rounded" style={{ background: `${accentColor}15`, border: `1px solid ${accentColor}30` }}>
            <p className="font-bold mb-0.5" style={{ color: accentColor }}>{main.desiredSalary}</p>
            <p>{main.employment}</p>
            {main.schedule && <p>{main.schedule}</p>}
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 items-stretch">
        {/* Left */}
        <div className="w-[230px] flex-shrink-0 self-stretch px-6 py-5 border-r border-gray-100 space-y-5" style={{ background: `${accentColor}08` }}>
          <div className="resume-break-unit">
            <h3 className="text-[10px] font-bold uppercase tracking-widest mb-2 pb-1" style={{ color: accentColor, borderBottom: `1px solid ${accentColor}` }}>Личная информация</h3>
            <div className="space-y-1 text-[10px]">
              <p><span className="text-gray-500">Гражданство:</span><br />{personalDetails.citizenship}</p>
              <p><span className="text-gray-500">Образование:</span><br />{personalDetails.education}</p>
              <p><span className="text-gray-500">Дата рождения:</span><br />{personalDetails.birthDate}</p>
              <p><span className="text-gray-500">Пол:</span><br />{personalDetails.gender}</p>
              {hasText(personalDetails.maritalStatus) && personalDetails.maritalStatus !== 'Не указан' && (
                <p><span className="text-gray-500">Семейное положение:</span><br />{personalDetails.maritalStatus}</p>
              )}
              {personalDetails.militaryService !== 'Не служил' && <p><span className="text-gray-500">Армия:</span><br />{personalDetails.militaryService}</p>}
              {personalDetails.medicalBook !== 'Нет' && <p><span className="text-gray-500">Мед. книжка:</span><br />{personalDetails.medicalBook}</p>}
              {personalDetails.drivingLicense !== 'Нет' && <p><span className="text-gray-500">Права:</span><br />{personalDetails.drivingLicense}</p>}
            </div>
          </div>

          <div className="resume-break-unit">
            <h3 className="text-[10px] font-bold uppercase tracking-widest mb-2 pb-1" style={{ color: accentColor, borderBottom: `1px solid ${accentColor}` }}>Знание языков</h3>
            {languages.map((lang) => (
              <div key={lang.id} className="mb-1.5">
                <p className="text-[10px] font-semibold">{lang.language}</p>
                <p className="text-[9px] text-gray-500 italic">{lang.level}</p>
              </div>
            ))}
          </div>

          <div className="resume-break-unit">
            <h3 className="text-[10px] font-bold uppercase tracking-widest mb-2 pb-1" style={{ color: accentColor, borderBottom: `1px solid ${accentColor}` }}>Компьютерные навыки</h3>
            <div className="space-y-1">
              {skills.map((skill) => (
                <p key={skill.id} className="text-[10px]">• {skill.name}</p>
              ))}
            </div>
          </div>

          {additional.personalQualities && (
            <div className="resume-break-unit">
              <h3 className="text-[10px] font-bold uppercase tracking-widest mb-2 pb-1" style={{ color: accentColor, borderBottom: `1px solid ${accentColor}` }}>Личные качества</h3>
              <p className="text-[10px] text-gray-600 italic">{additional.personalQualities}</p>
            </div>
          )}

          {additional.hobbies && (
            <div className="resume-break-unit">
              <h3 className="text-[10px] font-bold uppercase tracking-widest mb-2 pb-1" style={{ color: accentColor, borderBottom: `1px solid ${accentColor}` }}>Хобби</h3>
              <p className="text-[10px] text-gray-600">{additional.hobbies}</p>
            </div>
          )}
        </div>

        {/* Right */}
        <div className="flex-1 px-6 py-5 space-y-5">
          {additional.aboutMe && (
            <div className="resume-break-unit">
              <h3 className="text-[10px] font-bold uppercase tracking-widest mb-2 pb-1" style={{ color: accentColor, borderBottom: `1px solid ${accentColor}` }}>О СЕБЕ</h3>
              <p className="text-[11px] text-gray-700 italic">{additional.aboutMe}</p>
            </div>
          )}

          <div>
            <h3 className="text-[10px] font-bold uppercase tracking-widest mb-3 pb-1" style={{ color: accentColor, borderBottom: `1px solid ${accentColor}` }}>ОПЫТ РАБОТЫ</h3>
            {workExperience.map((work) => {
              const tenure = calculateTenure(work.startDate, work.endDate, work.isCurrent);
              const period = formatWorkPeriod(work.startDate, work.endDate, work.isCurrent);

              return (
                <div key={work.id} className="mb-4 relative pl-4">
                  <div className="absolute left-0 top-1.5 w-2 h-2 rounded-full" style={{ background: accentColor }} />
                  <div className="resume-break-unit">
                    <div className="flex items-start justify-between mb-0.5">
                      <p className="font-bold text-[12px]">{work.company}</p>
                      {period && <span className="text-[9px] text-gray-400 ml-2 flex-shrink-0">{period}</span>}
                    </div>
                    <p className="font-semibold mb-1 text-[11px] italic" style={{ color: accentColor }}>{work.position}</p>
                    {tenure && <p className="text-[9px] text-gray-400 mb-1">Стаж: {tenure}</p>}
                  </div>
                  {hasText(work.responsibilities) && (
                    <div className="mb-1">
                      <p className="resume-break-unit font-semibold text-[10px]">Обязанности:</p>
                      <MultilineText text={work.responsibilities} className="text-[10px] text-gray-600" />
                    </div>
                  )}
                  {hasText(work.achievements) && (
                    <div>
                      <p className="resume-break-unit font-semibold text-[10px]">Достижения:</p>
                      <MultilineText text={work.achievements} className="text-[10px] text-gray-600" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div>
            <h3 className="text-[10px] font-bold uppercase tracking-widest mb-3 pb-1" style={{ color: accentColor, borderBottom: `1px solid ${accentColor}` }}>ОБРАЗОВАНИЕ</h3>
            {education.map((edu) => {
              const studyPeriod = formatEducationPeriod(edu.startDate, edu.endDate, edu.showStudyDuration);

              return (
                <div key={edu.id} className="resume-break-unit mb-3 relative pl-4">
                  <div className="absolute left-0 top-1.5 w-2 h-2 rounded-full" style={{ background: accentColor }} />
                  <p className="font-bold">{formatEducationInstitution(edu.institution, edu.level)}</p>
                  {hasText(edu.city) && <p className="text-[9px] text-gray-400">Город: {edu.city}</p>}
                  {studyPeriod && <p className="text-[9px] text-gray-400">Период обучения: {studyPeriod}</p>}
                  {edu.faculty && <p className="text-[10px]">{edu.faculty}</p>}
                  {edu.speciality && <p className="text-[10px] text-gray-500 italic">{edu.speciality}{edu.studyForm ? ` · ${edu.studyForm}` : ''}</p>}
                  {hasText(edu.additionalInfo) && <p className="text-[10px] text-gray-500 italic">{edu.additionalInfo}</p>}
                </div>
              );
            })}
          </div>

          {courses.length > 0 && (
            <div>
              <h3 className="text-[10px] font-bold uppercase tracking-widest mb-3 pb-1" style={{ color: accentColor, borderBottom: `1px solid ${accentColor}` }}>КУРСЫ И ТРЕНИНГИ</h3>
              {courses.map((course) => (
                <div key={course.id} className="resume-break-unit mb-2 relative pl-4">
                  <div className="absolute left-0 top-1.5 w-2 h-2 rounded-full" style={{ background: accentColor }} />
                  <p className="font-bold">{course.name}</p>
                  {course.institution && <p className="text-[10px] text-gray-500">{course.institution}</p>}
                  {(course.graduationYear || course.duration) && (
                    <p className="text-[9px] text-gray-400">{course.graduationYear}{course.duration ? ` · ${course.duration}` : ''}</p>
                  )}
                </div>
              ))}
            </div>
          )}

          {additional.professionalSkills && (
            <div className="resume-break-unit">
              <h3 className="text-[10px] font-bold uppercase tracking-widest mb-2 pb-1" style={{ color: accentColor, borderBottom: `1px solid ${accentColor}` }}>ПРОФЕССИОНАЛЬНЫЕ НАВЫКИ</h3>
              <p className="text-[10px] text-gray-700">{additional.professionalSkills}</p>
            </div>
          )}
        </div>
      </div>

    </div>
  );
};

export default ElegantTemplate;
