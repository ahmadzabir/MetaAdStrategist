import { useState, useEffect, useRef, useCallback } from 'react';
import { Search, ChevronDown } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import type { TargetingCategory } from '@shared/schema';

interface SearchAutocompleteProps {
  categories: TargetingCategory[];
  onSelect: (category: TargetingCategory) => void;
  placeholder?: string;
  className?: string;
}

export function SearchAutocomplete({ 
  categories, 
  onSelect, 
  placeholder = "Search targeting categories...",
  className = "" 
}: SearchAutocompleteProps) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<TargetingCategory[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Filter categories based on search query
  useEffect(() => {
    if (!query.trim()) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }

    const searchLower = query.toLowerCase();
    const filtered = categories
      .filter(cat => cat.name.toLowerCase().includes(searchLower))
      .slice(0, 8) // Limit to 8 suggestions
      .sort((a, b) => {
        // Prioritize exact matches at the start of the name
        const aStartsWith = a.name.toLowerCase().startsWith(searchLower);
        const bStartsWith = b.name.toLowerCase().startsWith(searchLower);
        
        if (aStartsWith && !bStartsWith) return -1;
        if (!aStartsWith && bStartsWith) return 1;
        
        // Then by name length (shorter names first)
        return a.name.length - b.name.length;
      });

    setSuggestions(filtered);
    setIsOpen(filtered.length > 0);
    setSelectedIndex(-1);
  }, [query, categories]);

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

  const handleSelect = useCallback((category: TargetingCategory) => {
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
    switch (type) {
      case 'demographics':
        return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300';
      case 'interests':
        return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300';
      case 'behaviors':
        return 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/30 dark:text-gray-300';
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
          data-testid="input-search-autocomplete"
        />
        {isOpen && (
          <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        )}
      </div>

      {/* Suggestions Dropdown */}
      {isOpen && suggestions.length > 0 && (
        <div 
          ref={dropdownRef}
          className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-50 max-h-80 overflow-y-auto"
        >
          {suggestions.map((category, index) => (
            <button
              key={category.id}
              onClick={() => handleSelect(category)}
              className={`w-full text-left px-4 py-3 border-b border-gray-100 dark:border-gray-700 last:border-b-0 transition-colors ${
                index === selectedIndex
                  ? 'bg-blue-50 dark:bg-blue-900/20'
                  : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
              }`}
              data-testid={`suggestion-${category.id}`}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 dark:text-gray-100 truncate">
                    {category.name}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${getCategoryTypeColor(category.categoryType)}`}
                    >
                      {category.categoryType}
                    </Badge>
                    {category.size && category.size !== 'Unknown' && category.size !== 'Not available' && (
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {category.size} people
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-xs text-gray-400 dark:text-gray-500">
                  L{category.level}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}