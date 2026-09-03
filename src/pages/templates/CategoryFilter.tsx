import { useState } from 'react';
import { categories, typeOptions, sortOptions } from './templatesData';

interface FilterBarProps {
  selectedCategory: string;
  selectedType: string;
  selectedSort: string;
  onCategoryChange: (categoryId: string) => void;
  onTypeChange: (typeId: string) => void;
  onSortChange: (sortId: string) => void;
  totalCount: number;
  filteredCount: number;
}

export function FilterBar({
  selectedCategory,
  selectedType,
  selectedSort,
  onCategoryChange,
  onTypeChange,
  onSortChange,
  totalCount,
  filteredCount,
}: FilterBarProps) {
  const [showAllCategories, setShowAllCategories] = useState(false);
  const visibleCategories = showAllCategories ? categories : categories.slice(0, 4);
  const hasMore = categories.length > 4;

  return (
    <div className="space-y-4 font-viet">
      {/* Top row: Category pills */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="-mx-4 flex items-center gap-2 overflow-x-auto px-4 py-0.5 scrollbar-hide sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0">
          {visibleCategories.map((category) => {
            const isSelected = selectedCategory === category.id;
            return (
              <button
                key={category.id}
                aria-pressed={isSelected}
                className={`shrink-0 whitespace-nowrap rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors ${
                  isSelected
                    ? 'border-[#d9a441] bg-gradient-to-r from-[#d9a441]/10 to-[#8d1216]/10 text-[#8d1216]'
                    : 'border-gray-200 bg-white text-gray-600 hover:border-[#d9a441]/60 hover:text-[#7c3f06]'
                }`}
                type="button"
                onClick={() => onCategoryChange(category.id)}
              >
                {category.name}
              </button>
            );
          })}

          {hasMore && (
            <button
              aria-expanded={showAllCategories}
              className="flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full border border-gray-200 bg-white px-3.5 py-1.5 text-sm font-medium text-gray-600 transition-colors hover:border-[#d9a441]/60 hover:text-[#7c3f06]"
              type="button"
              onClick={() => setShowAllCategories(!showAllCategories)}
            >
              {showAllCategories ? 'Thu gọn' : 'Xem thêm'}
              <svg
                aria-hidden="true"
                className={`h-4 w-4 transition-transform ${showAllCategories ? 'rotate-180' : ''}`}
                fill="none"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M19 9L12 15L5 9"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                />
              </svg>
            </button>
          )}
        </div>

        {/* Right side: segmented + dropdowns */}
        <div className="-mx-4 flex shrink-0 items-center gap-2 overflow-x-auto px-4 py-0.5 scrollbar-hide sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 sm:py-0">
          {/* Segmented: Type filter */}
          <div
            aria-label="Lọc theo loại thiệp"
            className="inline-flex shrink-0 items-center rounded-full border border-gray-200 bg-white p-0.5 shadow-soft"
            role="radiogroup"
          >
            {typeOptions.map((type) => {
              const isSelected = selectedType === type.id;
              return (
                <button
                  key={type.id}
                  aria-checked={isSelected}
                  className={`rounded-full px-3 py-1.5 text-sm font-medium transition-all ${
                    isSelected
                      ? 'bg-gradient-to-r from-[#d9a441] to-[#8d1216] text-white shadow-sm'
                      : 'text-gray-600 hover:text-[#8d1216]'
                  }`}
                  role="radio"
                  type="button"
                  onClick={() => onTypeChange(type.id)}
                >
                  {type.name}
                </button>
              );
            })}
          </div>

          {/* Phân loại dropdown */}
          <div className="relative shrink-0">
            <select
              aria-label="Phân loại thiệp theo mức giá"
              className="appearance-none rounded-full border border-gray-200 bg-white px-3.5 py-1.5 pr-8 text-sm font-medium text-gray-600 transition-colors hover:border-[#d9a441]/60 hover:text-[#7c3f06] focus:border-[#d9a441] focus:outline-none"
              defaultValue=""
            >
              <option value="" disabled>
                Phân loại
              </option>
              <option value="free">Miễn phí</option>
              <option value="premium">Premium</option>
              <option value="all">Tất cả</option>
            </select>
            <svg
              aria-hidden="true"
              className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500"
              fill="none"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M19 9L12 15L5 9"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
              />
            </svg>
          </div>

          {/* Sort dropdown */}
          <div className="relative shrink-0">
            <select
              aria-label="Sắp xếp"
              className="appearance-none rounded-full border border-gray-200 bg-white px-3.5 py-1.5 pr-8 text-sm font-medium text-gray-600 transition-colors hover:border-[#d9a441]/60 hover:text-[#7c3f06] focus:border-[#d9a441] focus:outline-none"
              value={selectedSort}
              onChange={(e) => onSortChange(e.target.value)}
            >
              {sortOptions.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.name}
                </option>
              ))}
            </select>
            <svg
              aria-hidden="true"
              className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500"
              fill="none"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M19 9L12 15L5 9"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Result count */}
      <div className="flex items-center justify-between text-sm font-viet text-gray-500">
        <span>
          Hiển thị <strong className="font-semibold text-[#7c3f06]">{filteredCount}</strong> / {totalCount} mẫu thiệp
        </span>
        {(selectedCategory !== 'wedding' || selectedType !== 'all') && (
          <button
            className="font-medium text-[#8d1216] transition-opacity hover:opacity-80"
            type="button"
            onClick={() => {
              onCategoryChange('wedding');
              onTypeChange('all');
              onSortChange('recent');
            }}
          >
            Xóa bộ lọc
          </button>
        )}
      </div>
    </div>
  );
}