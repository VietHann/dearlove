import { Building2, Clock, MapPin, Phone } from 'lucide-react'
import { OFFICE_LOCATIONS, CONTACT_OFFICE_HOURS } from './contactData'

/**
 * ContactMap — office locations + a CSS-only "map" placeholder.
 *
 * No third-party embed is loaded — we render a stylized SVG canvas
 * representing the three offices so the page is self-contained and
 * respects user privacy (no Google Maps requests).
 */
export function ContactMap() {
  return (
    <section
      aria-labelledby="contact-map-title"
      className="px-4 py-12 sm:px-6 lg:px-8"
    >
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 text-center">
          <p className="m-0 inline-flex items-center rounded-full border border-pink-100 bg-pink-50 px-3 py-1 text-xs font-medium text-pink-600">
            Văn phòng Dearlove
          </p>
          <h2
            id="contact-map-title"
            className="mt-3 font-heading text-2xl text-gray-900 md:text-3xl"
          >
            Ghé thăm văn phòng của chúng tôi
          </h2>
          <p className="mt-2 text-sm text-gray-500 md:text-base">
            Vui lòng đặt lịch trước ít nhất 24 giờ để chúng tôi chuẩn bị mẫu thiệp và nhân viên tư vấn.
          </p>
        </header>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-5 md:gap-8">
          {/* Stylized map canvas */}
          <div className="md:col-span-3">
            <div className="contact-map relative h-72 overflow-hidden rounded-3xl border border-[#d9a441]/20 bg-gradient-to-br from-[#fdf2e3] via-white to-[#fff7f8] shadow-soft md:h-full md:min-h-[440px]">
              {/* Decorative "map" surface */}
              <svg
                aria-hidden="true"
                viewBox="0 0 600 440"
                preserveAspectRatio="xMidYMid slice"
                className="absolute inset-0 h-full w-full"
              >
                <defs>
                  <linearGradient id="mapBg" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#fdf2e3" />
                    <stop offset="100%" stopColor="#fff7f8" />
                  </linearGradient>
                  <pattern id="mapGrid" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#d9a441" strokeOpacity="0.10" strokeWidth="1"/>
                  </pattern>
                </defs>
                <rect width="600" height="440" fill="url(#mapBg)" />
                <rect width="600" height="440" fill="url(#mapGrid)" />
                {/* Decorative roads */}
                <path d="M0 220 Q150 180 300 230 T 600 200" stroke="#b91c1c" strokeOpacity="0.18" strokeWidth="3" fill="none" strokeDasharray="6 6" />
                <path d="M200 0 Q220 150 180 280 T 240 440" stroke="#d9a441" strokeOpacity="0.25" strokeWidth="2" fill="none" />
                <path d="M0 360 Q200 320 380 380 T 600 340" stroke="#10b981" strokeOpacity="0.18" strokeWidth="2" fill="none" strokeDasharray="4 4" />
                {/* Land masses */}
                <ellipse cx="120" cy="100" rx="80" ry="50" fill="#d9a441" fillOpacity="0.10" />
                <ellipse cx="500" cy="320" rx="90" ry="55" fill="#b91c1c" fillOpacity="0.08" />
              </svg>

              {/* HQ pin */}
              <Pin x={62} y={28} label="Hà Nội" sublabel="Trụ sở chính" featured />
              {/* HCM pin */}
              <Pin x={18} y={66} label="TP. Hồ Chí Minh" sublabel="Chi nhánh" />
              {/* Đà Nẵng pin */}
              <Pin x={48} y={48} label="Đà Nẵng" sublabel="Chi nhánh" />

              {/* Legend */}
              <div className="absolute bottom-4 left-4 rounded-xl bg-white/85 px-3 py-2 text-xs text-gray-700 shadow-sm backdrop-blur">
                <p className="flex items-center gap-2">
                  <span className="inline-block size-2 rounded-full bg-[#d9a441]" /> Trụ sở chính
                </p>
                <p className="mt-1 flex items-center gap-2">
                  <span className="inline-block size-2 rounded-full bg-[#b91c1c]" /> Chi nhánh
                </p>
              </div>
            </div>
          </div>

          {/* Office list + office hours */}
          <div className="md:col-span-2">
            <div className="flex h-full flex-col gap-5">
              <ul className="space-y-3">
                {OFFICE_LOCATIONS.map(office => (
                  <li
                    key={office.city}
                    className={`office-card flex gap-3 rounded-2xl border bg-white p-4 shadow-sm transition hover:shadow-md ${
                      office.isHQ
                        ? 'border-[#d9a441]/40 ring-1 ring-[#d9a441]/15'
                        : 'border-gray-100 hover:border-[#d9a441]/30'
                    }`}
                  >
                    <span
                      className={`mt-0.5 inline-flex size-9 shrink-0 items-center justify-center rounded-xl ${
                        office.isHQ
                          ? 'bg-gradient-to-br from-[#d9a441] to-[#b91c1c] text-white'
                          : 'bg-[#fdf2e3] text-[#b91c1c]'
                      }`}
                    >
                      <Building2 size={18} aria-hidden="true" />
                    </span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-heading text-sm text-gray-900">{office.city}</p>
                        {office.isHQ && (
                          <span className="rounded-full bg-[#d9a441]/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[#7c3f06]">
                            HQ
                          </span>
                        )}
                      </div>
                      <p className="mt-1 flex items-start gap-1.5 text-xs leading-relaxed text-gray-600">
                        <MapPin size={12} className="mt-0.5 shrink-0 text-[#b91c1c]" />
                        <span>{office.address}</span>
                      </p>
                      <p className="mt-0.5 flex items-center gap-1.5 text-xs text-gray-500">
                        <Clock size={12} className="shrink-0" />
                        <span>{office.hours}</span>
                      </p>
                      <p className="mt-0.5 flex items-center gap-1.5 text-xs">
                        <Phone size={12} className="shrink-0 text-emerald-600" />
                        <a
                          href={`tel:${office.phone.replace(/\s/g, '')}`}
                          className="font-semibold text-gray-700 hover:text-[#b91c1c]"
                        >
                          {office.phone}
                        </a>
                      </p>
                    </div>
                  </li>
                ))}
              </ul>

              {/* Office hours summary */}
              <div className="mt-auto rounded-2xl border border-[#d9a441]/20 bg-gradient-to-br from-[#fdf2e3] to-white p-4">
                <p className="font-heading text-sm text-[#8d1216]">Tóm tắt giờ làm việc</p>
                <ul className="mt-3 space-y-2">
                  {CONTACT_OFFICE_HOURS.map(({ Icon, label, value }) => (
                    <li key={label} className="flex items-start gap-2 text-xs">
                      <Icon size={14} className="mt-0.5 shrink-0 text-[#b91c1c]" />
                      <div>
                        <span className="font-semibold text-gray-800">{label}: </span>
                        <span className="text-gray-600">{value}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

/** Stylized map pin — pure CSS/SVG, no third-party assets. */
function Pin({
  x,
  y,
  label,
  sublabel,
  featured = false,
}: {
  x: number
  y: number
  label: string
  sublabel?: string
  featured?: boolean
}) {
  return (
    <div
      className="absolute"
      style={{ left: `${x}%`, top: `${y}%`, transform: 'translate(-50%, -100%)' }}
    >
      <div className="relative flex flex-col items-center">
        {featured && (
          <span
            aria-hidden="true"
            className="absolute inset-x-0 -top-2 mx-auto h-12 w-12 animate-ping rounded-full bg-[#d9a441]/40"
          />
        )}
        <svg
          width="40"
          height="48"
          viewBox="0 0 40 48"
          fill="none"
          aria-hidden="true"
          className="drop-shadow-md"
        >
          <path
            d="M20 0C8.954 0 0 8.954 0 20c0 13.5 18.5 27 19.273 27.55a1.25 1.25 0 0 0 1.454 0C21.5 47 40 33.5 40 20 40 8.954 31.046 0 20 0z"
            fill={featured ? '#d9a441' : '#b91c1c'}
          />
          <circle cx="20" cy="20" r="7" fill="white" />
        </svg>
        <div className="mt-1 whitespace-nowrap rounded-lg bg-white/95 px-2 py-1 text-center text-[10px] leading-tight shadow-sm">
          <p className={`font-semibold ${featured ? 'text-[#7c3f06]' : 'text-gray-800'}`}>{label}</p>
          {sublabel && <p className="text-gray-500">{sublabel}</p>}
        </div>
      </div>
    </div>
  )
}
