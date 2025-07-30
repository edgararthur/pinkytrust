import React, { useState } from 'react';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';
import { cn } from '@/utils';

interface ProgressiveDisclosureProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  className?: string;
  titleClassName?: string;
  contentClassName?: string;
  variant?: 'default' | 'card' | 'minimal';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  onToggle?: (isOpen: boolean) => void;
}

const ProgressiveDisclosure = React.forwardRef<HTMLDivElement, ProgressiveDisclosureProps>(
  ({
    title,
    children,
    defaultOpen = false,
    className,
    titleClassName,
    contentClassName,
    variant = 'default',
    size = 'md',
    disabled = false,
    onToggle,
    ...props
  }, ref) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    const handleToggle = () => {
      if (disabled) return;
      
      const newState = !isOpen;
      setIsOpen(newState);
      onToggle?.(newState);
    };

    const variantClasses = {
      default: 'border border-gray-200 rounded-xl bg-white',
      card: 'bg-white rounded-xl shadow-sm border border-gray-100',
      minimal: 'border-b border-gray-200 last:border-b-0',
    };

    const sizeClasses = {
      sm: 'text-sm',
      md: 'text-base',
      lg: 'text-lg',
    };

    const paddingClasses = {
      sm: variant === 'minimal' ? 'py-3' : 'p-3',
      md: variant === 'minimal' ? 'py-4' : 'p-4',
      lg: variant === 'minimal' ? 'py-5' : 'p-5',
    };

    return (
      <div
        ref={ref}
        className={cn(
          'transition-all duration-300',
          variantClasses[variant],
          className
        )}
        {...props}
      >
        <button
          onClick={handleToggle}
          disabled={disabled}
          className={cn(
            'w-full flex items-center justify-between text-left transition-all duration-200',
            paddingClasses[size],
            sizeClasses[size],
            disabled ? 'cursor-not-allowed opacity-50' : 'hover:bg-gray-50 focus:bg-gray-50',
            variant === 'minimal' ? 'hover:bg-transparent focus:bg-transparent' : '',
            titleClassName
          )}
        >
          <span className="font-medium text-gray-900">{title}</span>
          <div className={cn(
            'ml-4 flex-shrink-0 transition-transform duration-300',
            isOpen ? 'rotate-180' : 'rotate-0'
          )}>
            <ChevronDownIcon className="h-5 w-5 text-gray-500" />
          </div>
        </button>
        
        <div
          className={cn(
            'overflow-hidden transition-all duration-300 ease-in-out',
            isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
          )}
        >
          <div className={cn(
            'transition-all duration-300',
            variant === 'minimal' ? 'pb-4' : 'px-4 pb-4',
            contentClassName
          )}>
            {children}
          </div>
        </div>
      </div>
    );
  }
);

ProgressiveDisclosure.displayName = 'ProgressiveDisclosure';

// Accordion component for multiple progressive disclosures
interface AccordionProps {
  items: Array<{
    id: string;
    title: string;
    content: React.ReactNode;
    disabled?: boolean;
  }>;
  allowMultiple?: boolean;
  defaultOpenItems?: string[];
  className?: string;
  variant?: 'default' | 'card' | 'minimal';
  size?: 'sm' | 'md' | 'lg';
  onToggle?: (openItems: string[]) => void;
}

const Accordion = React.forwardRef<HTMLDivElement, AccordionProps>(
  ({
    items,
    allowMultiple = false,
    defaultOpenItems = [],
    className,
    variant = 'default',
    size = 'md',
    onToggle,
    ...props
  }, ref) => {
    const [openItems, setOpenItems] = useState<string[]>(defaultOpenItems);

    const handleToggle = (itemId: string) => {
      let newOpenItems: string[];
      
      if (allowMultiple) {
        newOpenItems = openItems.includes(itemId)
          ? openItems.filter(id => id !== itemId)
          : [...openItems, itemId];
      } else {
        newOpenItems = openItems.includes(itemId) ? [] : [itemId];
      }
      
      setOpenItems(newOpenItems);
      onToggle?.(newOpenItems);
    };

    return (
      <div
        ref={ref}
        className={cn(
          'space-y-2',
          variant === 'minimal' && 'space-y-0',
          className
        )}
        {...props}
      >
        {items.map((item) => (
          <ProgressiveDisclosure
            key={item.id}
            title={item.title}
            defaultOpen={openItems.includes(item.id)}
            variant={variant}
            size={size}
            disabled={item.disabled}
            onToggle={(isOpen) => {
              if (isOpen && !openItems.includes(item.id)) {
                handleToggle(item.id);
              } else if (!isOpen && openItems.includes(item.id)) {
                handleToggle(item.id);
              }
            }}
          >
            {item.content}
          </ProgressiveDisclosure>
        ))}
      </div>
    );
  }
);

Accordion.displayName = 'Accordion';

// FAQ component using progressive disclosure
interface FAQItem {
  id: string;
  question: string;
  answer: React.ReactNode;
}

interface FAQProps {
  items: FAQItem[];
  className?: string;
  searchable?: boolean;
  categories?: Array<{
    id: string;
    name: string;
    items: string[];
  }>;
}

const FAQ = React.forwardRef<HTMLDivElement, FAQProps>(
  ({ items, className, searchable = false, categories, ...props }, ref) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

    const filteredItems = items.filter(item => {
      const matchesSearch = !searchQuery || 
        item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (typeof item.answer === 'string' && item.answer.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesCategory = !selectedCategory || 
        categories?.find(cat => cat.id === selectedCategory)?.items.includes(item.id);
      
      return matchesSearch && matchesCategory;
    });

    return (
      <div ref={ref} className={cn('space-y-6', className)} {...props}>
        {/* Search and Filters */}
        {(searchable || categories) && (
          <div className="space-y-4">
            {searchable && (
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search FAQ..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            )}
            
            {categories && (
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedCategory(null)}
                  className={cn(
                    'px-3 py-1 rounded-full text-sm font-medium transition-colors',
                    selectedCategory === null
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  )}
                >
                  All
                </button>
                {categories.map(category => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={cn(
                      'px-3 py-1 rounded-full text-sm font-medium transition-colors',
                      selectedCategory === category.id
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    )}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* FAQ Items */}
        <Accordion
          items={filteredItems.map(item => ({
            id: item.id,
            title: item.question,
            content: item.answer,
          }))}
          variant="card"
          allowMultiple={true}
        />

        {/* No Results */}
        {filteredItems.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <p>No FAQ items found matching your criteria.</p>
          </div>
        )}
      </div>
    );
  }
);

FAQ.displayName = 'FAQ';

export { ProgressiveDisclosure, Accordion, FAQ };
export type { ProgressiveDisclosureProps, AccordionProps, FAQProps, FAQItem }; 