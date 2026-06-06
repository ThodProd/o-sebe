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

const DarkTemplate: React.FC<Props> = ({ data, accentColor }) => {
  const { personal, customContacts, main, personalDetails, languages, workExperience, education, courses, skills, additional } = data;
  const fullName = `${personal.lastName} ${personal.firstName} ${personal.middleName}`.trim();

  return (
    <div className="w-full flex flex-1 min-h-full items-stretch" style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', background: '#1a1a2e', color: '#e0e0e0' }}>
      {/* Left sidebar */}
      <div className="w-[200px] flex-shrink-0 self-stretch p-5 flex flex-col gap-4" style={{ background: '#16213e' }}>
        {/* Photo */}
        <div className="flex justify-center">
          {personal.photo ? (
            <img src={personal.photo} alt="" className="w-[110px] h-[110px] rounded-full object-cover" style={{ border: `3px solid ${accentColor}` }} />
          ) : (
            <div className="w-[110px] h-[110px] rounded-full flex items-center justify-center" style={{ background: '#0f3460', border: `3px solid ${accentColor}` }}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke={accentColor} strokeWidth="1.5">
                <circle cx="12" cy="8" r="4" />
                <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
              </svg>
            </div>
          )}
        </div>

        <div className="text-center">
          <h1 className="text-[13px] font-bold mb-1" style={{ color: accentColor }}>{fullName}</h1>
          <p className="text-[10px] opacity-70">{personal.position}</p>
        </div>

        <div>
          <h3 className="text-[9px] font-bold uppercase tracking-widest mb-2 pb-1" style={{ color: accentColor, borderBottom: `1px solid ${accentColor}33` }}>Контакты</h3>
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-[10px]"><Phone size={9} style={{ color: accentColor }} /><span>{personal.phone}</span></div>
            <div className="flex items-center gap-2 text-[10px]"><Mail size={9} style={{ color: accentColor }} /><span className="break-all">{personal.email}</span></div>
            <div className="flex items-center gap-2 text-[10px]"><MapPin size={9} style={{ color: accentColor }} /><span>{personal.city}</span></div>
            {personal.website && <div className="flex items-center gap-2 text-[10px]"><Globe size={9} style={{ color: accentColor }} /><span>{personal.website}</span></div>}
            {personal.telegram && <div className="flex items-center gap-2 text-[10px]"><Send size={9} style={{ color: accentColor }} /><span>{personal.telegram}</span></div>}
            <CustomContactsList contacts={customContacts} variant="dark" accentColor={accentColor} />
          </div>
        </div>

        <div>
          <h3 className="text-[9px] font-bold uppercase tracking-widest mb-2 pb-1" style={{ color: accentColor, borderBottom: `1px solid ${accentColor}33` }}>Навыки</h3>
          <div className="space-y-2">
            {skills.map((skill) => (
              <div key={skill.id}>
                <p className="text-[10px] mb-0.5">{skill.name}</p>
                <div className="h-1 rounded-full" style={{ background: '#ffffff20' }}>
                  <div className="h-1 rounded-full" style={{ background: accentColor, width: '75%' }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-[9px] font-bold uppercase tracking-widest mb-2 pb-1" style={{ color: accentColor, borderBottom: `1px solid ${accentColor}33` }}>Языки</h3>
          {languages.map((lang) => (
            <p key={lang.id} className="text-[10px] mb-1">{lang.language} <span className="opacity-60 text-[9px]">({lang.level})</span></p>
          ))}
        </div>

        <div>
          <h3 className="text-[9px] font-bold uppercase tracking-widest mb-2 pb-1" style={{ color: accentColor, borderBottom: `1px solid ${accentColor}33` }}>Занятость</h3>
          <p className="text-[10px] mb-1">{main.desiredSalary}</p>
          <p className="text-[10px] mb-1">{main.employment}</p>
          {main.schedule && <p className="text-[10px]">{main.schedule}</p>}
        </div>
      </div>

      {/* Main */}
      <div className="flex-1 p-6 space-y-5">
        {additional.aboutMe && (
          <div className="resume-break-unit">
            <h2 className="text-[12px] font-bold uppercase tracking-widest mb-1" style={{ color: accentColor }}>О СЕБЕ</h2>
            <div className="h-0.5 mb-2" style={{ background: `${accentColor}50` }} />
            <p className="opacity-80">{additional.aboutMe}</p>
          </div>
        )}

        <div className="resume-break-unit">
          <h2 className="text-[12px] font-bold uppercase tracking-widest mb-1" style={{ color: accentColor }}>ЛИЧНАЯ ИНФОРМАЦИЯ</h2>
          <div className="h-0.5 mb-2" style={{ background: `${accentColor}50` }} />
          <div className="grid grid-cols-2 gap-x-4 gap-y-1">
            <p><span className="opacity-60">Гражданство:</span> {personalDetails.citizenship}</p>
            <p><span className="opacity-60">Образование:</span> {personalDetails.education}</p>
            <p><span className="opacity-60">Дата рождения:</span> {personalDetails.birthDate}</p>
            <p><span className="opacity-60">Пол:</span> {personalDetails.gender}</p>
            {hasText(personalDetails.maritalStatus) && personalDetails.maritalStatus !== 'Не указан' && (
              <p><span className="opacity-60">Семейное положение:</span> {personalDetails.maritalStatus}</p>
            )}
            {personalDetails.drivingLicense !== 'Нет' && <p><span className="opacity-60">Права:</span> {personalDetails.drivingLicense}</p>}
          </div>
        </div>

        <div>
          <h2 className="text-[12px] font-bold uppercase tracking-widest mb-1" style={{ color: accentColor }}>ОПЫТ РАБОТЫ</h2>
          <div className="h-0.5 mb-2" style={{ background: `${accentColor}50` }} />
          {workExperience.map((work) => {
            const tenure = calculateTenure(work.startDate, work.endDate, work.isCurrent);
            const period = formatWorkPeriod(work.startDate, work.endDate, work.isCurrent);

            return (
              <div key={work.id} className="mb-4 pl-3" style={{ borderLeft: `2px solid ${accentColor}` }}>
                <div className="resume-break-unit">
                  <div className="flex justify-between items-start">
                    <p className="font-bold text-[12px]">{work.company}</p>
                    {period && <span className="text-[9px] opacity-60 ml-2 flex-shrink-0">{period}</span>}
                  </div>
                  <p className="font-semibold mb-1 text-[11px]" style={{ color: accentColor }}>{work.position}</p>
                  {tenure && <p className="text-[9px] opacity-60 mb-1">Стаж: {tenure}</p>}
                </div>
                {hasText(work.responsibilities) && (
                  <div className="mb-1">
                    <p className="resume-break-unit font-semibold text-[10px]">Обязанности:</p>
                    <MultilineText text={work.responsibilities} className="opacity-70" />
                  </div>
                )}
                {hasText(work.achievements) && (
                  <div>
                    <p className="resume-break-unit font-semibold text-[10px]">Достижения:</p>
                    <MultilineText text={work.achievements} className="opacity-70" />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div>
          <h2 className="text-[12px] font-bold uppercase tracking-widest mb-1" style={{ color: accentColor }}>ОБРАЗОВАНИЕ</h2>
          <div className="h-0.5 mb-2" style={{ background: `${accentColor}50` }} />
          {education.map((edu) => {
            const studyPeriod = formatEducationPeriod(edu.startDate, edu.endDate, edu.showStudyDuration);

            return (
              <div key={edu.id} className="resume-break-unit mb-3 pl-3" style={{ borderLeft: `2px solid ${accentColor}` }}>
                <p className="font-bold">{formatEducationInstitution(edu.institution, edu.level)}</p>
                {hasText(edu.city) && <p className="text-[9px] opacity-60">Город: {edu.city}</p>}
                {studyPeriod && <p className="text-[9px] opacity-60">Период обучения: {studyPeriod}</p>}
                {edu.faculty && <p className="opacity-70">{edu.faculty}</p>}
                {edu.speciality && <p className="opacity-60 text-[10px]">{edu.speciality}{edu.studyForm ? ` · ${edu.studyForm}` : ''}</p>}
                {hasText(edu.additionalInfo) && <p className="opacity-60 text-[10px] italic">{edu.additionalInfo}</p>}
              </div>
            );
          })}
        </div>

        {courses.length > 0 && (
          <div>
            <h2 className="text-[12px] font-bold uppercase tracking-widest mb-1" style={{ color: accentColor }}>КУРСЫ И ТРЕНИНГИ</h2>
            <div className="h-0.5 mb-2" style={{ background: `${accentColor}50` }} />
            {courses.map((course) => (
              <div key={course.id} className="resume-break-unit mb-2 pl-3" style={{ borderLeft: `2px solid ${accentColor}` }}>
                <p className="font-bold">{course.name}</p>
                {course.institution && <p className="opacity-70">{course.institution}</p>}
                {(course.graduationYear || course.duration) && (
                  <p className="opacity-50 text-[10px]">{course.graduationYear}{course.duration ? ` · ${course.duration}` : ''}</p>
                )}
              </div>
            ))}
          </div>
        )}

        {additional.personalQualities && (
          <div className="resume-break-unit">
            <h2 className="text-[12px] font-bold uppercase tracking-widest mb-1" style={{ color: accentColor }}>ЛИЧНЫЕ КАЧЕСТВА</h2>
            <div className="h-0.5 mb-2" style={{ background: `${accentColor}50` }} />
            <p className="opacity-70">{additional.personalQualities}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DarkTemplate;
