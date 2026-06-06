import { forwardRef, useMemo } from 'react';
import { useResumeStore } from '../store/resumeStore';
import ClassicTemplate from '../templates/ClassicTemplate';
import ModernTemplate from '../templates/ModernTemplate';
import MinimalTemplate from '../templates/MinimalTemplate';
import DarkTemplate from '../templates/DarkTemplate';
import ElegantTemplate from '../templates/ElegantTemplate';
import WhiteTemplate from '../templates/WhiteTemplate';
import ResumeDocument from './ResumeDocument';
import { A4_PAGE_WIDTH } from '../utils/resumePage';
import { sanitizeExportName } from '../utils/resumeExport';

interface Props {
  zoom?: number;
}

const ResumePreview = forwardRef<HTMLDivElement, Props>(({ zoom = 1 }, ref) => {
  const { data, template, accentColor } = useResumeStore();
  const fullName = `${data.personal.lastName} ${data.personal.firstName} ${data.personal.middleName}`.trim();

  const measureKey = useMemo(
    () => JSON.stringify({ data, template, accentColor }),
    [data, template, accentColor]
  );

  const renderTemplate = () => {
    const props = { data, accentColor };
    switch (template) {
      case 'classic': return <ClassicTemplate {...props} />;
      case 'modern': return <ModernTemplate {...props} />;
      case 'minimal': return <MinimalTemplate {...props} />;
      case 'dark': return <DarkTemplate {...props} />;
      case 'elegant': return <ElegantTemplate {...props} />;
      case 'white': return <WhiteTemplate {...props} />;
      default: return <ClassicTemplate {...props} />;
    }
  };

  return (
    <div className="resume-preview-area flex justify-center bg-gray-100 min-h-full p-6 print:p-0 print:bg-white">
      <div
        className="resume-preview-zoom"
        style={{
          transform: `scale(${zoom})`,
          transformOrigin: 'top center',
          transition: 'transform 0.15s ease',
        }}
      >
        <div
          ref={ref}
          id="resume-preview"
          className="flex flex-col"
          data-export-name={sanitizeExportName(fullName)}
          style={{
            width: `${A4_PAGE_WIDTH}px`,
            background: 'transparent',
            position: 'relative',
          }}
        >
          <ResumeDocument template={template} accentColor={accentColor} measureKey={measureKey}>
            {renderTemplate()}
          </ResumeDocument>
        </div>
      </div>
    </div>
  );
});

ResumePreview.displayName = 'ResumePreview';
export default ResumePreview;
