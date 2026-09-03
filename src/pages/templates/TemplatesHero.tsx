import { Link } from 'react-router-dom';

export function TemplatesHero() {
  return (
    <div className="page-content-header bg-transparent">
      <div className="page-content-header-wrapper">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="breacrumbs-wrapper mb-6">
          <ol className="flex items-center gap-2 text-sm font-viet">
            <li className="text-primary hover:text-primary/80 transition-colors">
              <Link to="/">Trang chủ</Link>
            </li>
            <li className="text-gray-400">&gt;</li>
            <li aria-current="page" className="font-medium text-gray-900 font-viet">
              Mẫu thiệp
            </li>
          </ol>
        </nav>

        {/* Header Info */}
        <div className="header-info">
          {/* Title */}
          <h1 className="page-title font-heading">
            <span className="font-display italic">Mẫu thiệp online</span>
            <br />
            <span className="highlight-gradient font-display italic">đẹp & đa dạng</span>
          </h1>

          {/* Description */}
          <p className="page-description font-viet">
            Khám phá bộ sưu tập thiệp cưới, thiệp sinh nhật, thiệp mời
            được thiết kế tinh tế. Tùy chỉnh dễ dàng!
          </p>

          {/* Decorative Elements */}
          <div className="decorate-polish">
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 2L13.09 8.26L19 9L13.09 9.74L12 16L10.91 9.74L5 9L10.91 8.26L12 2Z"
                fill="#ffd700"
                stroke="#ffb700"
                strokeWidth="1"
              />
            </svg>
          </div>
          <div className="decorate-wave">
            <svg
              width="120"
              height="24"
              viewBox="0 0 120 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M0 12C20 12 20 4 40 4C60 4 60 20 80 20C100 20 100 12 120 12"
                stroke="#ff4874"
                strokeWidth="2"
                strokeOpacity="0.3"
              />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
