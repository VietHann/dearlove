import { Template } from './templatesData';
import { TemplateCard } from './TemplateCard';

interface TemplatesGridProps {
  templates: Template[];
  onViewClick?: (template: Template) => void;
}

export function TemplatesGrid({ templates, onViewClick }: TemplatesGridProps) {
  if (templates.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="mb-4 text-6xl">📭</div>
        <h3 className="mb-2 text-lg font-medium text-gray-700">
          Không tìm thấy mẫu thiệp
        </h3>
        <p className="text-gray-500">
          Hãy thử chọn danh mục khác hoặc xem tất cả các mẫu thiệp.
        </p>
      </div>
    );
  }

  return (
    <section>
      <div className="grid grid-cols-2 gap-x-4 gap-y-6 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 mx-1 sm:mx-10 md:mx-0">
        {templates.map((template) => (
          <TemplateCard
            key={template.id}
            template={template}
            onViewClick={onViewClick}
          />
        ))}
      </div>
    </section>
  );
}
