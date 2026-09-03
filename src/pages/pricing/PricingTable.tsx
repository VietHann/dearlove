import { ShieldCheck } from 'lucide-react'
import { COMPARISON_TABLE } from './pricingData'

/**
 * PricingTable — detailed plan comparison + retention policy note.
 *
 * Renders a responsive horizontal-scroll table on small screens and a
 * full grid on md+. Includes the "Quyền lợi cộng dồn" explainer block
 * directly beneath.
 */
export function PricingTable() {
  return (
    <div className="mt-10">
      <header className="mb-4 text-center">
        <p className="m-0 inline-flex items-center rounded-full bg-pink-50 px-3 py-1 text-xs font-medium text-pink-600">
          So sánh chi tiết
        </p>
        <h2 className="mt-3 font-heading text-xl text-gray-900 md:text-2xl">
          Bảng so sánh các gói dịch vụ
        </h2>
        <p className="mb-0 mt-2 text-sm text-gray-500">
          Xem nhanh giới hạn và tính năng khác nhau giữa các gói để chọn phương án phù hợp nhất.
        </p>
      </header>

      <div className="overflow-x-auto rounded-2xl border border-gray-100 bg-white shadow-sm">
        <table className="w-full min-w-[720px] border-collapse text-sm">
          <thead>
            <tr className="bg-gray-50">
              <th className="py-3 pl-4 pr-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 md:pl-6">
                Hạng mục
              </th>
              {(['Free Plan', 'Basic Plan', 'Premium Plan'] as const).map(label => (
                <th
                  key={label}
                  className="px-3 py-3 text-center text-xs font-semibold uppercase tracking-wide text-gray-500"
                >
                  <span className="inline-flex items-center justify-center rounded-full bg-gray-100 px-3 py-1 text-[11px] font-semibold text-gray-700">
                    {label}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {COMPARISON_TABLE.map((row, idx) => {
              if (row.category) {
                return (
                  <tr key={`cat-${idx}`}>
                    <td
                      colSpan={4}
                      className="bg-gray-50/60 px-4 py-2 text-left text-[11px] font-semibold uppercase tracking-wide text-gray-500 md:px-6"
                    >
                      {row.category}
                    </td>
                  </tr>
                )
              }
              return (
                <tr key={row.label} className="compare-row border-t border-gray-100">
                  <td className="px-4 py-3 text-left text-xs font-medium text-gray-800 md:px-6">
                    {row.label}
                  </td>
                  {row.values.map((v, i) => (
                    <td key={i} className="px-3 py-3 text-center align-middle">
                      <span className="text-sm font-medium text-gray-700">{renderCell(v)}</span>
                    </td>
                  ))}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <RetentionNote />
    </div>
  )
}

function renderCell(value: string) {
  if (value === '✓') {
    return (
      <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-50 text-emerald-500">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </span>
    )
  }
  if (value === '—') {
    return <span className="text-gray-400">—</span>
  }
  return value
}

/** "Quyền lợi cộng dồn" explainer card. */
function RetentionNote() {
  return (
    <div className="mt-6 rounded-2xl border border-[#e54153]/15 bg-[#fff7f8] px-5 py-4 shadow-sm sm:px-6">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 hidden h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-zen-primary shadow-sm ring-1 ring-zen-primary/10 md:flex">
          <ShieldCheck size={20} />
        </div>
        <div className="min-w-0">
          <div className="font-heading text-base leading-none text-gray-900">
            * Chính sách Quyền lợi cộng dồn
          </div>
          <div className="mt-1 text-sm leading-6 sm:text-base">
            <p>
              Khi nâng cấp lên gói cao hơn, <strong>số thiệp</strong>, <strong>lượt xem</strong> và{' '}
              <strong>giới hạn ảnh</strong> của gói cũ sẽ tự động cộng dồn vào gói mới của bạn.
            </p>
            <p className="mt-1">
              Các tính năng khác sẽ áp dụng theo gói cao nhất đã mua.
            </p>
            <p className="mt-2">
              <strong>🤝 Trở thành Đối tác</strong>: Cần giới hạn cao hơn với mức giá ưu đãi đặc quyền?{' '}
              <a
                href="https://fb.com/zenlove.me"
                target="_blank"
                rel="noreferrer"
                className="font-semibold text-zen-primary underline-offset-2 hover:underline"
              >
                [Liên hệ ngay]
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
