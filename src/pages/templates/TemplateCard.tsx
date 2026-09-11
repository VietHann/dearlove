import { Template } from './templatesData';

interface TemplateCardProps {
  template: Template;
  onViewClick?: (template: Template) => void;
}

export function TemplateCard({ template, onViewClick }: TemplateCardProps) {
  const handleViewClick = () => {
    if (onViewClick) {
      onViewClick(template)
      return
    }

    window.location.assign(`/auth?mode=register&returnTo=${encodeURIComponent(`/order/${template.id}`)}`)
  }

  return (
    <div
      className="template-item-v3 group/template-item-v3 font-viet"
      style={{ '--image-scroll-percent': '0%', '--scroll-duration': '0.6s' } as React.CSSProperties}
    >
      <article
        className="group relative flex w-full cursor-pointer flex-col items-center rounded-[10px] bg-white shadow-soft transition-all duration-200 ease-in-out hover:-translate-y-2 hover:shadow-[0_18px_45px_-12px_rgba(124,63,6,0.25)] motion-reduce:transform-none motion-reduce:transition-none"
        onClick={handleViewClick}
      >
        {/* Image Container */}
        <div className="relative w-full overflow-hidden rounded-t-[10px] [aspect-ratio:1000/1470]">
          <div className="relative inline-block h-full w-full overflow-hidden bg-gray-100">
            <img
              alt={template.name}
              className="h-auto w-full align-top transform transition-transform duration-200 ease-out group-hover:translate-y-0 group-hover/template-item-v3:transition-duration-[var(--scroll-duration)] group-hover/template-item-v3:transition-timing-function-ease group-hover/template-item-v3:translate-y-[var(--image-scroll-percent)] motion-reduce:transform-none motion-reduce:transition-none"
              decoding="async"
              loading="lazy"
              src={template.image}
              title={`Chọn mẫu ${template.name} cho đơn hàng`}
            />
          </div>
        </div>

        {/* Card footer with name + badge */}
        <div className="w-full px-3 py-2.5 text-center">
          <h3 className="line-clamp-1 font-heading text-sm font-semibold text-[#7c3f06]">
            {template.name}
          </h3>
        </div>

        {/* Hover Overlay */}
        <div className="pointer-events-none absolute inset-0 rounded-[10px] bg-gradient-to-t from-[#8d1216]/40 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          {/* View Button */}
          <div className="absolute inset-0 flex items-end justify-center pb-12">
            <button
              className="pointer-events-auto rounded-full border border-[#d9a441]/40 bg-white px-5 py-2 text-sm font-semibold text-[#8d1216] shadow-lg transition-all duration-200 hover:scale-105 hover:bg-gradient-to-r hover:from-[#d9a441] hover:to-[#8d1216] hover:text-white"
              onClick={event => {
                event.stopPropagation()
                handleViewClick()
              }}
              type="button"
            >
              Chọn mẫu
            </button>
          </div>

          {/* Stats Badges */}
          <div className="absolute top-2 right-2">
            <div className="flex flex-col gap-1 items-end">
              {/* View Count */}
              <div className="rounded-full text-xs font-semibold flex items-center px-2 py-1 text-white bg-[#e54153]/95 backdrop-blur-sm shadow-sm">
                <svg
                  aria-hidden="true"
                  className="mr-1"
                  height="12"
                  viewBox="0 0 24 24"
                  width="12"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <g fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="1.5">
                    <path d="M12 5.50063C7.50016 0.825464 2 4.27416 2 9.1371C2 14 6.01943 16.5914 8.96173 18.9109C10 19.7294 11 20.5 12 20.5" />
                    <path d="M12 5.50063C16.4998 0.825464 22 4.27416 22 9.1371C22 14 17.9806 16.5914 15.0383 18.9109C14 19.7294 13 20.5 12 20.5" opacity="0.5" />
                  </g>
                </svg>
                {template.viewCount}
              </div>
              {/* Use Count */}
              <div className="rounded-full text-xs font-semibold flex items-center px-2 py-1 text-white bg-[#d9a441]/95 backdrop-blur-sm shadow-sm">
                <svg
                  aria-hidden="true"
                  className="mr-1"
                  height="12"
                  viewBox="0 0 24 24"
                  width="12"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <g fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M3.27489 15.2957C2.42496 14.1915 2 13.6394 2 12C2 10.3606 2.42496 9.80853 3.27489 8.70433C4.97196 6.49956 7.81811 4 12 4C16.1819 4 19.028 6.49956 20.7251 8.70433C21.575 9.80853 22 10.3606 22 12C22 13.6394 21.575 14.1915 20.7251 15.2957C19.028 17.5004 16.1819 20 12 20C7.81811 20 4.97196 17.5004 3.27489 15.2957Z" opacity="0.5" />
                  </g>
                </svg>
                {template.useCount}
              </div>
            </div>
          </div>

          {/* Premium badge */}
          {template.premium && (
            <div className="absolute top-2 left-2 rounded-full bg-gradient-to-r from-[#d9a441] to-[#f7c948] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white shadow-md">
              Premium
            </div>
          )}
        </div>
      </article>
    </div>
  );
}