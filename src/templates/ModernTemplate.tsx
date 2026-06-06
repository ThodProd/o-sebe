import React from 'react';
import { ResumeData } from '../types/resume';
import { Phone, Mail, MapPin, Globe, Send } from 'lucide-react';
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

const ModernTemplate: React.FC<Props> = ({ data, accentColor }) => {
  const { personal, customContacts, main, personalDetails, languages, workExperience, education, courses, skills, additional } = data;
  const fullName = `${personal.lastName} ${personal.firstName} ${personal.middleName}`.trim();

  const sidebarBg = accentColor;

  return (
    <div className="bg-white w-full flex flex-1 min-h-full items-stretch" style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px' }}>
      {/* Sidebar */}
      <div className="w-[220px] flex-shrink-0 self-stretch text-white p-5 flex flex-col" style={{ background: sidebarBg }}>
        {/* Photo */}
        <div className="mb-4 flex justify-center">
          {personal.photo ? (
            <img src={personal.photo} alt="" className="w-[130px] h-[130px] rounded-full object-cover border-4 border-white/30" />
          ) : (
            <div className="w-[130px] h-[130px] rounded-full bg-white/20 flex items-center justify-center border-4 border-white/30">
              <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5">
                <circle cx="12" cy="8" r="4" />
                <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
              </svg>
            </div>
          )}
        </div>

        <h1 className="text-[15px] font-bold text-center mb-1">{fullName}</h1>
        <p className="text-[10px] text-center opacity-80 mb-5">{personal.position}</p>

        {/* Contact */}
        <div className="mb-4">
          <h3 className="text-[9px] font-bold uppercase tracking-widest mb-2 opacity-70 border-b border-white/30 pb-1">Контакты</h3>
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-[10px]"><Phone size={10} className="flex-shrink-0" /><span>{personal.phone}</span></div>
            <div className="flex items-center gap-2 text-[10px]"><Mail size={10} className="flex-shrink-0" /><span className="break-all">{personal.email}</span></div>
            <div className="flex items-center gap-2 text-[10px]"><MapPin size={10} className="flex-shrink-0" /><span>{personal.city}</span></div>
            {personal.website && <div className="flex items-center gap-2 text-[10px]"><Globe size={10} className="flex-shrink-0" /><span>{personal.website}</span></div>}
            {personal.linkedin && <div className="flex items-center gap-2 text-[10px]"><Globe size={10} className="flex-shrink-0" /><span>{personal.linkedin}</span></div>}
            {personal.telegram && <div className="flex items-center gap-2 text-[10px]"><Send size={10} className="flex-shrink-0" /><span>{personal.telegram}</span></div>}
            <CustomContactsList contacts={customContacts} variant="modern" accentColor={accentColor} />
          </div>
        </div>

        {/* Main info */}
        <div className="mb-4">
          <h3 className="text-[9px] font-bold uppercase tracking-widest mb-2 opacity-70 border-b border-white/30 pb-1">Информация</h3>
          <p className="text-[10px] mb-1"><span className="opacity-70">Зарплата:</span><br />{main.desiredSalary}</p>
          <p className="text-[10px] mb-1"><span className="opacity-70">Занятость:</span><br />{main.employment}</p>
          {main.schedule && <p className="text-[10px]"><span className="opacity-70">График:</span><br />{main.schedule}</p>}
        </div>

        {/* Languages */}
        <div className="mb-4">
          <h3 className="text-[9px] font-bold uppercase tracking-widest mb-2 opacity-70 border-b border-white/30 pb-1">Языки</h3>
          {languages.map((lang) => (
            <p key={lang.id} className="text-[10px] mb-1">{lang.language}<br /><span className="opacity-70 text-[9px]">{lang.level}</span></p>
          ))}
        </div>

        {/* Skills */}
        <div className="mb-4">
          <h3 className="text-[9px] font-bold uppercase tracking-widest mb-2 opacity-70 border-b border-white/30 pb-1">Навыки</h3>
          {skills.map((skill) => (
            <div key={skill.id} className="mb-1">
              <div className="text-[10px] mb-0.5">{skill.name}</div>
              <div className="h-1 bg-white/20 rounded-full">
                <div className="h-1 bg-white/70 rounded-full w-3/4" />
              </div>
            </div>
          ))}
        </div>

        {/* Personal qualities */}
        {additional.personalQualities && (
          <div>
            <h3 className="text-[9px] font-bold uppercase tracking-widest mb-2 opacity-70 border-b border-white/30 pb-1">Личные качества</h3>
            <p className="text-[10px] opacity-90">{additional.personalQualities}</p>
          </div>
        )}
      </div>

      {/* Main content */}
      <div className="flex-1 p-6">
        {/* About */}
        {additional.aboutMe && (
          <div className="resume-break-unit mb-5">
            <h2 className="text-[12px] font-bold uppercase tracking-widest mb-1" style={{ color: accentColor }}>О СЕБЕ</h2>
            <div className="h-0.5 mb-2" style={{ background: accentColor }} />
            <p className="text-gray-700">{additional.aboutMe}</p>
          </div>
        )}

        {/* Personal details */}
        <div className="resume-break-unit mb-5">
          <h2 className="text-[12px] font-bold uppercase tracking-widest mb-1" style={{ color: accentColor }}>ЛИЧНАЯ ИНФОРМАЦИЯ</h2>
          <div className="h-0.5 mb-2" style={{ background: accentColor }} />
          <div className="grid grid-cols-2 gap-x-4 gap-y-1">
            <p><span className="font-semibold">Гражданство:</span> {personalDetails.citizenship}</p>
            <p><span className="font-semibold">Образование:</span> {personalDetails.education}</p>
            <p><span className="font-semibold">Дата рождения:</span> {personalDetails.birthDate}</p>
            <p><span className="font-semibold">Пол:</span> {personalDetails.gender}</p>
            {hasText(personalDetails.maritalStatus) && personalDetails.maritalStatus !== 'Не указан' && (
              <p><span className="font-semibold">Семейное положение:</span> {personalDetails.maritalStatus}</p>
            )}
            {personalDetails.militaryService && <p><span className="font-semibold">Служба в армии:</span> {personalDetails.militaryService}</p>}
            {personalDetails.drivingLicense && <p><span className="font-semibold">Права:</span> {personalDetails.drivingLicense}</p>}
          </div>
        </div>

        {/* Work experience */}
        <div className="mb-5">
          <h2 className="text-[12px] font-bold uppercase tracking-widest mb-1" style={{ color: accentColor }}>ОПЫТ РАБОТЫ</h2>
          <div className="h-0.5 mb-2" style={{ background: accentColor }} />
          {workExperience.map((work) => {
            const tenure = calculateTenure(work.startDate, work.endDate, work.isCurrent);
            const period = formatWorkPeriod(work.startDate, work.endDate, work.isCurrent);

            return (
              <div key={work.id} className="mb-3 pl-3 border-l-2" style={{ borderColor: accentColor }}>
                <div className="resume-break-unit">
                  <div className="flex items-start justify-between">
                    <p className="font-bold text-[12px]">{work.company}</p>
                    {period && (
                      <span className="text-[9px] text-gray-500 ml-2 flex-shrink-0 text-right">
                        {period}
                      </span>
                    )}
                  </div>
                  <p className="font-semibold" style={{ color: accentColor }}>{work.position}</p>
                  {tenure && <p className="text-[9px] text-gray-500 mt-0.5">Стаж: {tenure}</p>}
                </div>
                {hasText(work.responsibilities) && (
                  <div className="mt-1">
                    <p className="resume-break-unit font-semibold text-[10px]">Обязанности:</p>
                    <MultilineText text={work.responsibilities} className="text-gray-600" />
                  </div>
                )}
                {hasText(work.achievements) && (
                  <div className="mt-1">
                    <p className="resume-break-unit font-semibold text-[10px]">Достижения:</p>
                    <MultilineText text={work.achievements} className="text-gray-600" />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Education */}
        <div className="mb-5">
          <h2 className="text-[12px] font-bold uppercase tracking-widest mb-1" style={{ color: accentColor }}>ОБРАЗОВАНИЕ</h2>
          <div className="h-0.5 mb-2" style={{ background: accentColor }} />
          {education.map((edu) => {
            const studyPeriod = formatEducationPeriod(edu.startDate, edu.endDate, edu.showStudyDuration);

            return (
              <div key={edu.id} className="resume-break-unit mb-3 pl-3 border-l-2" style={{ borderColor: accentColor }}>
                <p className="font-bold">{formatEducationInstitution(edu.institution, edu.level)}</p>
                {hasText(edu.city) && <p className="text-[9px] text-gray-500">Город: {edu.city}</p>}
                {studyPeriod && <p className="text-[9px] text-gray-500">Период обучения: {studyPeriod}</p>}
                {edu.faculty && <p>{edu.faculty}</p>}
                {edu.speciality && <p className="text-gray-600">{edu.speciality}</p>}
                {edu.studyForm && <p className="text-gray-500 text-[10px]">{edu.studyForm}</p>}
                {hasText(edu.additionalInfo) && <p className="text-gray-500 text-[10px] italic">{edu.additionalInfo}</p>}
              </div>
            );
          })}
        </div>

        {/* Courses */}
        {courses.length > 0 && (
          <div className="mb-5">
            <h2 className="text-[12px] font-bold uppercase tracking-widest mb-1" style={{ color: accentColor }}>КУРСЫ И ТРЕНИНГИ</h2>
            <div className="h-0.5 mb-2" style={{ background: accentColor }} />
            {courses.map((course) => (
              <div key={course.id} className="resume-break-unit mb-2 pl-3 border-l-2" style={{ borderColor: accentColor }}>
                <p className="font-bold">{course.name}</p>
                {course.institution && <p>{course.institution}</p>}
                {(course.graduationYear || course.duration) && (
                  <p className="text-gray-500 text-[10px]">{course.graduationYear}{course.duration ? ` · ${course.duration}` : ''}</p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Professional skills */}
        {additional.professionalSkills && (
          <div className="resume-break-unit">
            <h2 className="text-[12px] font-bold uppercase tracking-widest mb-1" style={{ color: accentColor }}>ПРОФЕССИОНАЛЬНЫЕ НАВЫКИ</h2>
            <div className="h-0.5 mb-2" style={{ background: accentColor }} />
            <p>{additional.professionalSkills}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ModernTemplate;
