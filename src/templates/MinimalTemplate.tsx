import React from 'react';
import { ResumeData } from '../types/resume';
import MultilineText from '../components/MultilineText';
import StructuredEducationBlock from '../components/StructuredEducationBlock';
import StructuredCourseBlock from '../components/StructuredCourseBlock';
import CustomContactsList from '../components/CustomContactsList';
import {
  calculateTenure,
  formatPersonalEducation,
  formatMilitaryService,
  formatWorkPeriod,
  hasText,
} from '../utils/resumeFormat';

interface Props {
  data: ResumeData;
  accentColor: string;
}

const MinimalTemplate: React.FC<Props> = ({ data, accentColor }) => {
  const { personal, customContacts, main, personalDetails, languages, workExperience, education, courses, skills, additional } = data;
  const fullName = `${personal.lastName} ${personal.firstName} ${personal.middleName}`.trim();
  const educationSummary = formatPersonalEducation(personalDetails.education, personalDetails.educationHigherCount);
  const militarySummary = formatMilitaryService(
    personalDetails.militaryService,
    personalDetails.militaryFitnessCategory,
    personalDetails.militaryUnfitArticle,
    personalDetails.militaryUnfitPoint
  );

  return (
    <div className="bg-white w-full flex flex-1 flex-col min-h-full p-8 text-gray-800" style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px' }}>
      {/* Header */}
      <div className="resume-break-unit flex items-start gap-6 mb-6 pb-6 border-b-2" style={{ borderColor: accentColor }}>
        {personal.photo ? (
          <img src={personal.photo} alt="" className="w-[100px] h-[100px] object-cover rounded-lg" />
        ) : (
          <div className="w-[100px] h-[100px] rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5">
              <circle cx="12" cy="8" r="4" />
              <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
            </svg>
          </div>
        )}
        <div className="flex-1">
          <h1 className="text-2xl font-bold mb-1" style={{ color: accentColor }}>{fullName}</h1>
          <p className="text-gray-600 text-[13px] mb-3">{personal.position}</p>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-[10px] text-gray-500">
            <span>📞 {personal.phone}</span>
            <span>✉ {personal.email}</span>
            <span>📍 {personal.city}</span>
            {personal.website && <span>🌐 {personal.website}</span>}
            <CustomContactsList contacts={customContacts} variant="minimal" accentColor={accentColor} />
          </div>
        </div>
        <div className="text-right text-[10px] text-gray-500 flex-shrink-0">
          <p>{main.desiredSalary}</p>
          <p>{main.employment}</p>
          {main.schedule && <p>{main.schedule}</p>}
        </div>
      </div>

      {/* Two column layout */}
      <div className="flex flex-1 gap-8 items-stretch">
        {/* Left */}
        <div className="w-[200px] flex-shrink-0 self-stretch space-y-5 border-r pr-6" style={{ borderColor: `${accentColor}30` }}>
          <div className="resume-break-unit">
            <h3 className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: accentColor }}>Личная информация</h3>
            <div className="space-y-0.5">
              <p><span className="text-gray-500">Гражданство:</span> {personalDetails.citizenship}</p>
              <p><span className="text-gray-500">Образование:</span> {educationSummary}</p>
              <p><span className="text-gray-500">Дата рождения:</span> {personalDetails.birthDate}</p>
              <p><span className="text-gray-500">Пол:</span> {personalDetails.gender}</p>
              {hasText(personalDetails.maritalStatus) && personalDetails.maritalStatus !== 'Не указан' && (
                <p><span className="text-gray-500">Семейное положение:</span> {personalDetails.maritalStatus}</p>
              )}
              {personalDetails.drivingLicense !== 'Нет' && <p><span className="text-gray-500">Права:</span> {personalDetails.drivingLicense}</p>}
              {militarySummary && militarySummary !== 'Не служил' && (
                <p><span className="text-gray-500">Армия:</span> {militarySummary}</p>
              )}
            </div>
          </div>

          <div className="resume-break-unit">
            <h3 className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: accentColor }}>Языки</h3>
            <div className="space-y-0.5">
              {languages.map((lang) => (
                <p key={lang.id}>{lang.language} <span className="text-gray-500">— {lang.level}</span></p>
              ))}
            </div>
          </div>

          <div className="resume-break-unit">
            <h3 className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: accentColor }}>Навыки</h3>
            <div className="flex flex-wrap gap-1">
              {skills.map((skill) => (
                <span key={skill.id} className="px-2 py-0.5 rounded text-[10px] text-white" style={{ background: accentColor }}>{skill.name}</span>
              ))}
            </div>
          </div>

          {additional.personalQualities && (
            <div className="resume-break-unit">
              <h3 className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: accentColor }}>Личные качества</h3>
              <p className="text-gray-600">{additional.personalQualities}</p>
            </div>
          )}
        </div>

        {/* Right */}
        <div className="flex-1 space-y-5">
          {additional.aboutMe && (
            <div className="resume-break-unit">
              <h3 className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: accentColor }}>О СЕБЕ</h3>
              <p className="text-gray-700">{additional.aboutMe}</p>
            </div>
          )}

          <div>
            <h3 className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: accentColor }}>ОПЫТ РАБОТЫ</h3>
            <div className="space-y-4">
              {workExperience.map((work) => {
                const tenure = calculateTenure(work.startDate, work.endDate, work.isCurrent);
                const period = formatWorkPeriod(work.startDate, work.endDate, work.isCurrent);

                return (
                  <div key={work.id}>
                    <div className="resume-break-unit">
                      <div className="flex items-baseline justify-between mb-0.5">
                        <p className="font-bold text-[12px]">{work.company}</p>
                        {period && <span className="text-[10px] text-gray-500">{period}</span>}
                      </div>
                      <p className="font-semibold mb-1" style={{ color: accentColor }}>{work.position}</p>
                      {hasText(work.rank) && <p className="text-[10px] text-gray-600 mb-1">Звание: {work.rank}</p>}
                      {tenure && <p className="text-[10px] text-gray-500 mb-1">Стаж: {tenure}</p>}
                    </div>
                    {hasText(work.responsibilities) && (
                      <div className="mb-1">
                        <p className="resume-break-unit font-semibold text-[10px]">Обязанности:</p>
                        <MultilineText text={work.responsibilities} className="text-gray-600" />
                      </div>
                    )}
                    {hasText(work.achievements) && (
                      <div>
                        <p className="resume-break-unit font-semibold text-[10px]">Достижения:</p>
                        <MultilineText text={work.achievements} className="text-gray-600" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div>
            <h3 className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: accentColor }}>ОБРАЗОВАНИЕ</h3>
            <div className="space-y-3">
              {education.map((edu, index) => (
                <StructuredEducationBlock
                  key={edu.id}
                  edu={edu}
                  className="resume-break-unit"
                  showDivider={index < education.length - 1}
                />
              ))}
            </div>
          </div>

          {courses.length > 0 && (
            <div>
              <h3 className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: accentColor }}>КУРСЫ И СЕРТИФИКАТЫ</h3>
              <div className="space-y-2">
                {courses.map((course, index) => (
                  <StructuredCourseBlock
                    key={course.id}
                    course={course}
                    className="resume-break-unit"
                    showDivider={index < courses.length - 1}
                  />
                ))}
              </div>
            </div>
          )}

          {additional.professionalSkills && (
            <div className="resume-break-unit">
              <h3 className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: accentColor }}>ПРОФЕССИОНАЛЬНЫЕ НАВЫКИ</h3>
              <p className="text-gray-700">{additional.professionalSkills}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MinimalTemplate;
