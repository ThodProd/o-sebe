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

const SectionTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="mb-3">
    <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-black">{children}</h3>
    <div className="border-t border-black mt-1" />
  </div>
);

const WhiteTemplate: React.FC<Props> = ({ data }) => {
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
    <div
      className="bg-white w-full flex flex-1 flex-col min-h-full p-10 text-black"
      style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: '#111' }}
    >
      <div className="resume-break-unit flex items-start gap-6 pb-6 mb-6 border-b border-black">
        {personal.photo ? (
          <img
            src={personal.photo}
            alt=""
            className="w-[96px] h-[96px] object-cover flex-shrink-0 border border-black"
          />
        ) : (
          <div className="w-[96px] h-[96px] flex-shrink-0 border border-black flex items-center justify-center bg-white">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="1">
              <circle cx="12" cy="8" r="4" />
              <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
            </svg>
          </div>
        )}

        <div className="flex-1 min-w-0">
          <h1 className="text-[22px] font-bold leading-tight text-black mb-1">{fullName}</h1>
          <p className="text-[13px] text-black/70 mb-3">{personal.position}</p>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-[10px] text-black/80">
            <span>{personal.phone}</span>
            <span>{personal.email}</span>
            <span>{personal.city}</span>
            {personal.website && <span>{personal.website}</span>}
            {personal.telegram && <span>{personal.telegram}</span>}
            {personal.linkedin && <span>{personal.linkedin}</span>}
            <CustomContactsList contacts={customContacts} variant="white" accentColor="#111" />
          </div>
        </div>

        <div className="text-right text-[10px] text-black/70 flex-shrink-0 border-l border-black pl-4">
          {main.desiredSalary && <p className="font-semibold text-black">{main.desiredSalary}</p>}
          {main.employment && <p>{main.employment}</p>}
          {main.schedule && <p>{main.schedule}</p>}
          {main.readyToTravel && <p>Готов к командировкам</p>}
          {main.readyToRelocate && <p>Готов к переезду</p>}
        </div>
      </div>

      <div className="flex flex-1 gap-8 items-stretch">
        <div className="w-[210px] flex-shrink-0 self-stretch space-y-5 border-r border-black pr-6">
          <div className="resume-break-unit">
            <SectionTitle>Личная информация</SectionTitle>
            <div className="space-y-1 text-[10px]">
              <p><span className="text-black/50">Гражданство:</span> {personalDetails.citizenship}</p>
              <p><span className="text-black/50">Образование:</span> {educationSummary}</p>
              <p><span className="text-black/50">Дата рождения:</span> {personalDetails.birthDate}</p>
              <p><span className="text-black/50">Пол:</span> {personalDetails.gender}</p>
              {hasText(personalDetails.maritalStatus) && personalDetails.maritalStatus !== 'Не указан' && (
                <p><span className="text-black/50">Семейное положение:</span> {personalDetails.maritalStatus}</p>
              )}
              {personalDetails.drivingLicense !== 'Нет' && (
                <p><span className="text-black/50">Права:</span> {personalDetails.drivingLicense}</p>
              )}
              {militarySummary && militarySummary !== 'Не служил' && (
                <p><span className="text-black/50">Армия:</span> {militarySummary}</p>
              )}
              {personalDetails.medicalBook !== 'Нет' && (
                <p><span className="text-black/50">Мед. книжка:</span> {personalDetails.medicalBook}</p>
              )}
            </div>
          </div>

          {languages.length > 0 && (
            <div className="resume-break-unit">
              <SectionTitle>Языки</SectionTitle>
              <div className="space-y-1 text-[10px]">
                {languages.map((lang) => (
                  <p key={lang.id}>{lang.language} <span className="text-black/50">— {lang.level}</span></p>
                ))}
              </div>
            </div>
          )}

          {skills.length > 0 && (
            <div className="resume-break-unit">
              <SectionTitle>Навыки</SectionTitle>
              <div className="flex flex-wrap gap-1.5">
                {skills.map((skill) => (
                  <span
                    key={skill.id}
                    className="px-2 py-0.5 text-[9px] border border-black text-black"
                  >
                    {skill.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {additional.personalQualities && (
            <div className="resume-break-unit">
              <SectionTitle>Личные качества</SectionTitle>
              <p className="text-[10px] text-black/80">{additional.personalQualities}</p>
            </div>
          )}

          {additional.hobbies && (
            <div className="resume-break-unit">
              <SectionTitle>Хобби</SectionTitle>
              <p className="text-[10px] text-black/80">{additional.hobbies}</p>
            </div>
          )}
        </div>

        <div className="flex-1 space-y-5">
          {additional.aboutMe && (
            <div className="resume-break-unit">
              <SectionTitle>О себе</SectionTitle>
              <p className="text-[10px] text-black/80 leading-relaxed">{additional.aboutMe}</p>
            </div>
          )}

          {workExperience.length > 0 && (
            <div>
              <SectionTitle>Опыт работы</SectionTitle>
              <div className="space-y-4">
                {workExperience.map((work) => {
                  const tenure = calculateTenure(work.startDate, work.endDate, work.isCurrent);
                  const period = formatWorkPeriod(work.startDate, work.endDate, work.isCurrent);

                  return (
                    <div key={work.id} className="pb-4 border-b border-black/20 last:border-0 last:pb-0">
                      <div className="resume-break-unit">
                        <div className="flex items-baseline justify-between gap-3 mb-0.5">
                          <p className="font-bold text-[12px]">{work.company}</p>
                          {period && <span className="text-[9px] text-black/50 flex-shrink-0">{period}</span>}
                        </div>
                        <p className="font-semibold text-[11px] mb-1">{work.position}</p>
                        {hasText(work.rank) && <p className="text-[10px] text-black/70 mb-1">Звание: {work.rank}</p>}
                        {tenure && <p className="text-[9px] text-black/50 mb-1">Стаж: {tenure}</p>}
                      </div>
                      {hasText(work.responsibilities) && (
                        <div className="mb-1">
                          <p className="resume-break-unit font-semibold text-[10px]">Обязанности:</p>
                          <MultilineText text={work.responsibilities} className="text-[10px] text-black/75" />
                        </div>
                      )}
                      {hasText(work.achievements) && (
                        <div>
                          <p className="resume-break-unit font-semibold text-[10px]">Достижения:</p>
                          <MultilineText text={work.achievements} className="text-[10px] text-black/75" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {education.length > 0 && (
            <div>
              <SectionTitle>Образование</SectionTitle>
              <div className="space-y-3">
                {education.map((edu, index) => (
                  <div key={edu.id} className="resume-break-unit pb-3 last:pb-0">
                    <StructuredEducationBlock
                      edu={edu}
                      className="mb-0 text-[10px]"
                      showDivider={index < education.length - 1}
                      dividerLineClassName="bg-black/15"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {courses.length > 0 && (
            <div>
              <SectionTitle>Курсы и сертификаты</SectionTitle>
              <div className="space-y-2">
                {courses.map((course, index) => (
                  <StructuredCourseBlock
                    key={course.id}
                    course={course}
                    className="resume-break-unit text-[10px]"
                    showDivider={index < courses.length - 1}
                    dividerLineClassName="bg-black/15"
                  />
                ))}
              </div>
            </div>
          )}

          {additional.professionalSkills && (
            <div className="resume-break-unit">
              <SectionTitle>Профессиональные навыки</SectionTitle>
              <p className="text-[10px] text-black/80">{additional.professionalSkills}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WhiteTemplate;
