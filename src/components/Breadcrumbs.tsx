import React from 'react';
import { ChevronRight, Home } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export interface BreadcrumbItem {
  label: string;
  href?: string;
  onClick?: () => void;
  icon?: React.ComponentType<{ className?: string }>;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items }) => {
  const { t } = useLanguage();

  return (
    <nav aria-label="Breadcrumb" className="mb-6">
      <ol className="flex items-center gap-2 text-sm">
        <li>
          <button
            onClick={items[0]?.onClick}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-2 py-1"
            aria-label={t('goToHome')}
          >
            <Home className="w-4 h-4" />
          </button>
        </li>

        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          const Icon = item.icon;

          return (
            <li key={index} className="flex items-center gap-2">
              <ChevronRight className="w-4 h-4 text-gray-400" />

              {isLast ? (
                <span
                  className="flex items-center gap-2 text-gray-900 font-medium px-2 py-1"
                  aria-current="page"
                >
                  {Icon && <Icon className="w-4 h-4" />}
                  {item.label}
                </span>
              ) : (
                <button
                  onClick={item.onClick}
                  className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-2 py-1"
                >
                  {Icon && <Icon className="w-4 h-4" />}
                  {item.label}
                </button>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};
