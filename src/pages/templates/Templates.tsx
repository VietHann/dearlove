import { useState, useMemo } from 'react';
import { TemplatesHero } from './TemplatesHero';
import { FilterBar } from './CategoryFilter';
import { TemplatesGrid } from './TemplatesGrid';
import { templates, Template } from './templatesData';
import './templates.css';

export default function Templates() {
  const [selectedCategory, setSelectedCategory] = useState('wedding');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedSort, setSelectedSort] = useState('recent');

  const filteredTemplates = useMemo(() => {
    let result = [...templates];

    // Filter by category
    if (selectedCategory !== 'all') {
      result = result.filter((t) => t.category === selectedCategory);
    }

    // Filter by type
    if (selectedType !== 'all') {
      result = result.filter((t) => t.type === selectedType);
    }

    // Sort
    switch (selectedSort) {
      case 'popular':
        result.sort((a, b) => b.useCount - a.useCount);
        break;
      case 'views':
        result.sort((a, b) => b.viewCount - a.viewCount);
        break;
      case 'recent':
      default:
        // Keep default order (already in source order)
        break;
    }

    return result;
  }, [selectedCategory, selectedType, selectedSort]);

  const handleViewClick = (template: Template) => {
    window.location.assign(`/auth?mode=register&template=${encodeURIComponent(template.id)}`)
  }

  return (
    <main className="min-h-screen bg-background">
      <TemplatesHero />

      <section className="px-4 sm:px-6 lg:px-8">
        <FilterBar
          selectedCategory={selectedCategory}
          selectedType={selectedType}
          selectedSort={selectedSort}
          onCategoryChange={setSelectedCategory}
          onTypeChange={setSelectedType}
          onSortChange={setSelectedSort}
          totalCount={templates.length}
          filteredCount={filteredTemplates.length}
        />
      </section>

      <div className="page-content-body px-4 sm:px-6 lg:px-8">
        <TemplatesGrid
          templates={filteredTemplates}
          onViewClick={handleViewClick}
        />
      </div>
    </main>
  );
}