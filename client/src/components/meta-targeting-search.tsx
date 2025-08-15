import { useState, useEffect, useRef, useCallback } from 'react';
import { Search, ChevronDown, ChevronRight, Target, Sparkles, Zap } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

interface MetaTargetingCategory {
  id: string;
  name: string;
  type: string;
  description?: string;
  audience_size?: number;
  audience_size_display?: string;
  path?: string[];
  breadcrumbs?: string[];
  level?: number;
  parentId?: string;
}

interface MetaTargetingSearchProps {
  onSelect: (category: MetaTargetingCategory) => void;
  placeholder?: string;
  className?: string;
  targetingType?: 'interests' | 'behaviors' | 'demographics' | 'adTargetingCategory';
}

export function MetaTargetingSearch({ 
  onSelect, 
  placeholder = "Search Meta targeting categories with live data...",
  className = "",
  targetingType = "adTargetingCategory"
}: MetaTargetingSearchProps) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<MetaTargetingCategory[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isLoading, setIsLoading] = useState(false);
  const [dataSource, setDataSource] = useState<'meta_api' | 'local' | 'local_fallback'>('local');
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout>();

  // Debounced search function
  const searchCategories = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }

    setIsLoading(true);
    
    try {
      const params = new URLSearchParams({
        q: searchQuery,
        type: targetingType,
        limit: '12'
      });

      const response = await fetch(`/api/meta/search-targeting?${params}`);
      const data = await response.json();
      
      if (data.success && data.categories) {
        setSuggestions(data.categories);
        setDataSource(data.source || 'local');
        setIsOpen(data.categories.length > 0);
      } else {
        setSuggestions([]);
        setIsOpen(false);
      }
    } catch (error) {
      console.error('Error searching targeting categories:', error);
      setSuggestions([]);
      setIsOpen(false);
    } finally {
      setIsLoading(false);
    }
  }, [targetingType]);

  // Handle search with debouncing
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      searchCategories(query);
    }, 300); // 300ms debounce

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [query, searchCategories]);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && suggestions[selectedIndex]) {
          handleSelect(suggestions[selectedIndex]);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        setSelectedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  const handleSelect = useCallback((category: MetaTargetingCategory) => {
    try {
      onSelect(category);
      setQuery('');
      setSuggestions([]);
      setIsOpen(false);
      setSelectedIndex(-1);
      if (inputRef.current) {
        inputRef.current.blur();
      }
    } catch (error) {
      console.error('Error in handleSelect:', error);
    }
  }, [onSelect]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    setSelectedIndex(-1);
  };

  const handleInputFocus = () => {
    if (query.trim() && suggestions.length > 0) {
      setIsOpen(true);
    }
  };

  const handleInputBlur = useCallback((e: React.FocusEvent) => {
    // Delay closing to allow clicking on suggestions
    const timer = setTimeout(() => {
      if (!dropdownRef.current?.contains(e.relatedTarget as Node)) {
        setIsOpen(false);
        setSelectedIndex(-1);
      }
    }, 200);
    
    return () => clearTimeout(timer);
  }, []);

  const getCategoryTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'demographics':
        return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700';
      case 'interests':
        return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700';
      case 'behaviors':
        return 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-700';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/30 dark:text-gray-300 dark:border-gray-700';
    }
  };

  const getDataSourceIcon = () => {
    switch (dataSource) {
      case 'meta_api':
        return <Sparkles className="h-3 w-3 text-green-600" />;
      case 'local':
        return <Target className="h-3 w-3 text-blue-600" />;
      case 'local_fallback':
        return <Zap className="h-3 w-3 text-orange-600" />;
      default:
        return <Target className="h-3 w-3 text-gray-600" />;
    }
  };

  const getDataSourceText = () => {
    switch (dataSource) {
      case 'meta_api':
        return 'Live Meta API';
      case 'local':
        return 'Local Database';
      case 'local_fallback':
        return 'Fallback Data';
      default:
        return 'Unknown';
    }
  };

  return (
    <div className={`relative ${className}`}>
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          placeholder={placeholder}
          className="pl-10 pr-4 w-full"
          data-testid="input-meta-targeting-search"
        />
        {isLoading ? (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          </div>
        ) : isOpen && (
          <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        )}
      </div>

      {/* Data Source Indicator */}
      {query && !isLoading && suggestions.length > 0 && (
        <div className="absolute top-full right-0 mt-1 z-50">
          <Badge variant="outline" className="text-xs bg-white dark:bg-gray-800 border shadow-sm">
            {getDataSourceIcon()}
            <span className="ml-1">{getDataSourceText()}</span>
          </Badge>
        </div>
      )}

      {/* Suggestions Dropdown */}
      {isOpen && (
        <div 
          ref={dropdownRef}
          className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-40 max-h-96 overflow-y-auto"
        >
          {isLoading ? (
            // Loading skeleton
            <div className="p-3 space-y-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-full" />
                  <div className="flex gap-2">
                    <Skeleton className="h-5 w-16" />
                    <Skeleton className="h-5 w-12" />
                  </div>
                </div>
              ))}
            </div>
          ) : suggestions.length > 0 ? (
            suggestions.map((category, index) => (
              <button
                key={`${category.id}-${index}`}
                onClick={() => handleSelect(category)}
                className={`w-full text-left px-4 py-3 border-b border-gray-100 dark:border-gray-700 last:border-b-0 transition-colors ${
                  index === selectedIndex
                    ? 'bg-blue-50 dark:bg-blue-900/20 border-l-2 border-l-blue-500'
                    : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                }`}
                data-testid={`suggestion-${category.id}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 dark:text-gray-100 truncate">
                      {category.name}
                    </p>
                    
                    {/* Hierarchical Breadcrumbs */}
                    {(category.breadcrumbs || category.path) && (category.breadcrumbs || category.path)!.length > 1 && (
                      <div className="flex items-center gap-1 mt-1 text-xs text-gray-500 dark:text-gray-400 overflow-hidden">
                        {(category.breadcrumbs || category.path)!.slice(0, -1).map((breadcrumb, idx, arr) => (
                          <span key={idx} className="flex items-center gap-1">
                            <span className="truncate max-w-[80px]">{breadcrumb}</span>
                            {idx < arr.length - 1 && (
                              <ChevronRight className="h-3 w-3 text-gray-400" />
                            )}
                          </span>
                        ))}
                      </div>
                    )}
                    
                    {category.description && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 truncate">
                        {category.description}
                      </p>
                    )}
                    
                    <div className="flex items-center gap-2 mt-2">
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${getCategoryTypeColor(category.type)}`}
                      >
                        {category.type}
                      </Badge>
                      {category.audience_size_display && (
                        <Badge variant="secondary" className="text-xs bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700">
                          {category.audience_size_display} people
                        </Badge>
                      )}
                      {category.level && (
                        <span className="text-xs text-gray-400 dark:text-gray-500">
                          L{category.level}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </button>
            ))
          ) : (
            <div className="px-4 py-6 text-center">
              <Search className="h-8 w-8 mx-auto text-gray-400 mb-2" />
              <p className="text-sm text-gray-500 dark:text-gray-400">
                No targeting categories found
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                Try different keywords or check your search terms
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}