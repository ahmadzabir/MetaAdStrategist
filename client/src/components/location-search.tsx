import { useState, useEffect, useRef, useCallback } from 'react';
import { MapPin, Search, ChevronDown, Globe, Building2, Home } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

interface LocationResult {
  key: string;
  name: string;
  type: 'country' | 'region' | 'city' | 'zip' | 'dma';
  country_code?: string;
  country_name?: string;
  region?: string;
  region_id?: string;
  supports_region?: boolean;
  supports_city?: boolean;
}

interface SelectedLocation {
  key: string;
  name: string;
  type: string;
  displayName: string;
}

interface LocationSearchProps {
  value?: SelectedLocation[];
  onChange: (locations: SelectedLocation[]) => void;
  placeholder?: string;
  className?: string;
  maxSelections?: number;
  allowedTypes?: Array<'country' | 'region' | 'city' | 'zip' | 'dma'>;
}

export function LocationSearch({ 
  value = [],
  onChange, 
  placeholder = "Search locations (countries, states, cities)...",
  className = "",
  maxSelections = 10,
  allowedTypes = ['country', 'region', 'city']
}: LocationSearchProps) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<LocationResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Search locations from Meta API
  const searchLocations = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim() || searchQuery.length < 2) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/meta/search-locations?${new URLSearchParams({
        q: searchQuery,
        location_types: JSON.stringify(allowedTypes),
        limit: '15'
      })}`);

      const data = await response.json();
      
      if (data.success && data.locations) {
        const filteredResults = data.locations
          .filter((location: any) => {
            // Filter out already selected locations
            return !value.some(selected => selected.key === location.key);
          })
          .map((location: any) => ({
            key: location.key,
            name: location.name,
            type: location.type,
            country_code: location.country_code,
            country_name: location.country_name,
            region: location.region,
            region_id: location.region_id,
            supports_region: location.supports_region,
            supports_city: location.supports_city
          }));

        setSuggestions(filteredResults);
        setIsOpen(filteredResults.length > 0);
        setSelectedIndex(-1);
      } else {
        // Show fallback basic locations when Meta API is not configured
        const basicLocations = [
          { key: 'US', name: 'United States', type: 'country', country_name: 'United States' },
          { key: 'CA', name: 'Canada', type: 'country', country_name: 'Canada' },
          { key: 'GB', name: 'United Kingdom', type: 'country', country_name: 'United Kingdom' },
          { key: 'AU', name: 'Australia', type: 'country', country_name: 'Australia' },
          { key: 'DE', name: 'Germany', type: 'country', country_name: 'Germany' },
          { key: 'FR', name: 'France', type: 'country', country_name: 'France' },
          { key: 'IT', name: 'Italy', type: 'country', country_name: 'Italy' },
          { key: 'ES', name: 'Spain', type: 'country', country_name: 'Spain' },
          { key: 'BR', name: 'Brazil', type: 'country', country_name: 'Brazil' },
          { key: 'MX', name: 'Mexico', type: 'country', country_name: 'Mexico' },
          { key: 'JP', name: 'Japan', type: 'country', country_name: 'Japan' },
          { key: 'IN', name: 'India', type: 'country', country_name: 'India' },
          { key: 'CN', name: 'China', type: 'country', country_name: 'China' },
          { key: 'RU', name: 'Russia', type: 'country', country_name: 'Russia' },
          { key: 'KR', name: 'South Korea', type: 'country', country_name: 'South Korea' },
          { key: 'SG', name: 'Singapore', type: 'country', country_name: 'Singapore' },
          { key: 'MY', name: 'Malaysia', type: 'country', country_name: 'Malaysia' },
          { key: 'TH', name: 'Thailand', type: 'country', country_name: 'Thailand' },
          { key: 'PH', name: 'Philippines', type: 'country', country_name: 'Philippines' },
          { key: 'ID', name: 'Indonesia', type: 'country', country_name: 'Indonesia' },
          { key: 'VN', name: 'Vietnam', type: 'country', country_name: 'Vietnam' },
          { key: 'PK', name: 'Pakistan', type: 'country', country_name: 'Pakistan' },
          { key: 'BD', name: 'Bangladesh', type: 'country', country_name: 'Bangladesh' },
          { key: 'NG', name: 'Nigeria', type: 'country', country_name: 'Nigeria' },
          { key: 'ZA', name: 'South Africa', type: 'country', country_name: 'South Africa' },
          { key: 'EG', name: 'Egypt', type: 'country', country_name: 'Egypt' },
          { key: 'AR', name: 'Argentina', type: 'country', country_name: 'Argentina' },
          { key: 'CL', name: 'Chile', type: 'country', country_name: 'Chile' },
          { key: 'CO', name: 'Colombia', type: 'country', country_name: 'Colombia' },
          { key: 'PE', name: 'Peru', type: 'country', country_name: 'Peru' },
          { key: 'NL', name: 'Netherlands', type: 'country', country_name: 'Netherlands' },
          { key: 'BE', name: 'Belgium', type: 'country', country_name: 'Belgium' },
          { key: 'CH', name: 'Switzerland', type: 'country', country_name: 'Switzerland' },
          { key: 'AT', name: 'Austria', type: 'country', country_name: 'Austria' },
          { key: 'SE', name: 'Sweden', type: 'country', country_name: 'Sweden' },
          { key: 'NO', name: 'Norway', type: 'country', country_name: 'Norway' },
          { key: 'DK', name: 'Denmark', type: 'country', country_name: 'Denmark' },
          { key: 'FI', name: 'Finland', type: 'country', country_name: 'Finland' },
          { key: 'PL', name: 'Poland', type: 'country', country_name: 'Poland' },
          { key: 'TR', name: 'Turkey', type: 'country', country_name: 'Turkey' },
          { key: 'IL', name: 'Israel', type: 'country', country_name: 'Israel' },
          { key: 'AE', name: 'United Arab Emirates', type: 'country', country_name: 'United Arab Emirates' },
          { key: 'SA', name: 'Saudi Arabia', type: 'country', country_name: 'Saudi Arabia' },
          { key: 'NZ', name: 'New Zealand', type: 'country', country_name: 'New Zealand' }
        ].filter(loc => 
          loc.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !value.some(selected => selected.key === loc.key)
        ) as LocationResult[];

        setSuggestions(basicLocations);
        setIsOpen(basicLocations.length > 0);
        setSelectedIndex(-1);
      }
    } catch (error) {
      console.error('Error searching locations:', error);
      // Fallback to basic locations on error
      const basicLocations = [
        { key: 'US', name: 'United States', type: 'country', country_name: 'United States' },
        { key: 'CA', name: 'Canada', type: 'country', country_name: 'Canada' },
        { key: 'GB', name: 'United Kingdom', type: 'country', country_name: 'United Kingdom' },
        { key: 'AU', name: 'Australia', type: 'country', country_name: 'Australia' },
        { key: 'DE', name: 'Germany', type: 'country', country_name: 'Germany' },
        { key: 'FR', name: 'France', type: 'country', country_name: 'France' },
        { key: 'IN', name: 'India', type: 'country', country_name: 'India' },
        { key: 'BR', name: 'Brazil', type: 'country', country_name: 'Brazil' },
        { key: 'PK', name: 'Pakistan', type: 'country', country_name: 'Pakistan' },
        { key: 'BD', name: 'Bangladesh', type: 'country', country_name: 'Bangladesh' }
      ].filter(loc => 
        loc.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !value.some(selected => selected.key === loc.key)
      ) as LocationResult[];
      
      setSuggestions(basicLocations);
      setIsOpen(basicLocations.length > 0);
    } finally {
      setIsLoading(false);
    }
  }, [value, allowedTypes]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (query) {
        searchLocations(query);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query, searchLocations]);

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

  const handleSelect = useCallback((location: LocationResult) => {
    if (value.length >= maxSelections) return;

    const displayName = getLocationDisplayName(location);
    const newLocation: SelectedLocation = {
      key: location.key,
      name: location.name,
      type: location.type,
      displayName
    };

    onChange([...value, newLocation]);
    setQuery('');
    setSuggestions([]);
    setIsOpen(false);
    setSelectedIndex(-1);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [value, onChange, maxSelections]);

  const handleRemove = (locationKey: string) => {
    onChange(value.filter(loc => loc.key !== locationKey));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };

  const handleInputFocus = () => {
    if (query.trim() && suggestions.length > 0) {
      setIsOpen(true);
    } else if (query.length === 0) {
      // Show popular countries on focus when no query
      const popularCountries = [
        { key: 'US', name: 'United States', type: 'country', country_name: 'United States' },
        { key: 'CA', name: 'Canada', type: 'country', country_name: 'Canada' },
        { key: 'GB', name: 'United Kingdom', type: 'country', country_name: 'United Kingdom' },
        { key: 'AU', name: 'Australia', type: 'country', country_name: 'Australia' },
        { key: 'DE', name: 'Germany', type: 'country', country_name: 'Germany' },
        { key: 'FR', name: 'France', type: 'country', country_name: 'France' },
        { key: 'IN', name: 'India', type: 'country', country_name: 'India' },
        { key: 'BR', name: 'Brazil', type: 'country', country_name: 'Brazil' },
        { key: 'JP', name: 'Japan', type: 'country', country_name: 'Japan' },
        { key: 'MX', name: 'Mexico', type: 'country', country_name: 'Mexico' }
      ].filter(loc => !value.some(selected => selected.key === loc.key)) as LocationResult[];
      
      setSuggestions(popularCountries);
      setIsOpen(popularCountries.length > 0);
    }
  };

  const handleInputBlur = useCallback((e: React.FocusEvent) => {
    // Delay closing to allow clicking on suggestions
    setTimeout(() => {
      if (!dropdownRef.current?.contains(e.relatedTarget as Node)) {
        setIsOpen(false);
        setSelectedIndex(-1);
      }
    }, 200);
  }, []);

  const getLocationDisplayName = (location: LocationResult): string => {
    switch (location.type) {
      case 'country':
        return location.name;
      case 'region':
        return `${location.name}, ${location.country_name || location.country_code || ''}`;
      case 'city':
        return `${location.name}, ${location.region || ''} ${location.country_name || location.country_code || ''}`.trim();
      default:
        return location.name;
    }
  };

  const getLocationIcon = (type: string) => {
    switch (type) {
      case 'country':
        return <Globe className="h-3 w-3" />;
      case 'region':
        return <Building2 className="h-3 w-3" />;
      case 'city':
        return <Home className="h-3 w-3" />;
      default:
        return <MapPin className="h-3 w-3" />;
    }
  };

  const getLocationTypeColor = (type: string) => {
    switch (type) {
      case 'country':
        return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300';
      case 'region':
        return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300';
      case 'city':
        return 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300';
      case 'zip':
        return 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/30 dark:text-gray-300';
    }
  };

  return (
    <div className={`space-y-3 relative ${className}`}>
      <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
        Geographic Targeting
      </Label>
      
      {/* Selected Locations */}
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border">
          {value.map((location) => (
            <Badge
              key={location.key}
              variant="secondary"
              className="flex items-center gap-2 py-1 px-3 bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300"
            >
              {getLocationIcon(location.type)}
              <span className="text-sm">{location.displayName}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleRemove(location.key)}
                className="h-4 w-4 p-0 ml-1 hover:bg-blue-200 dark:hover:bg-blue-800"
                data-testid={`remove-location-${location.key}`}
              >
                ×
              </Button>
            </Badge>
          ))}
        </div>
      )}

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
          placeholder={value.length >= maxSelections ? "Maximum locations reached" : placeholder}
          disabled={value.length >= maxSelections}
          className="pl-10 pr-4 w-full"
          data-testid="input-location-search"
        />
        {isOpen && (
          <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        )}
        {isLoading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
          </div>
        )}
      </div>



      {/* Suggestions Dropdown - Always render but conditionally show */}
      <div 
        ref={dropdownRef}
        className={`absolute left-0 right-0 mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl max-h-80 overflow-y-auto transition-opacity duration-200 ${
          isOpen && suggestions.length > 0 ? 'opacity-100 visible' : 'opacity-0 invisible'
        }`}
        style={{ 
          position: 'absolute', 
          top: '100%', 
          left: 0, 
          right: 0, 
          zIndex: 9999,
          marginTop: '8px'
        }}
      >
          {suggestions.map((location, index) => (
            <button
              key={`${location.key}-${index}`}
              onClick={() => handleSelect(location)}
              className={`w-full text-left px-4 py-3 border-b border-gray-100 dark:border-gray-700 last:border-b-0 transition-all duration-200 ${
                index === selectedIndex
                  ? 'bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 text-blue-800 dark:text-blue-200'
                  : 'hover:bg-gradient-to-r hover:from-gray-50 hover:to-blue-50/30 dark:hover:from-gray-700 dark:hover:to-blue-900/10 hover:text-blue-700 dark:hover:text-blue-300'
              }`}
              data-testid={`location-suggestion-${location.key}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {getLocationIcon(location.type)}
                    <p className="font-medium text-gray-900 dark:text-gray-100 truncate">
                      {location.name}
                    </p>
                  </div>
                  
                  {/* Location details */}
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${getLocationTypeColor(location.type)}`}
                    >
                      {location.type}
                    </Badge>
                    {location.country_name && location.type !== 'country' && (
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {location.country_name}
                      </span>
                    )}
                  </div>
                  
                  {/* Full display name */}
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    {getLocationDisplayName(location)}
                  </p>
                </div>
                <div className="text-xs text-gray-400 dark:text-gray-500 shrink-0">
                  {location.key}
                </div>
              </div>
            </button>
          ))}
      </div>

      {/* Helper text */}
      <p className="text-xs text-gray-500 dark:text-gray-400">
        Search locations by name. {value.length > 0 ? `Selected: ${value.length}/${maxSelections}` : 'Click to see popular countries or start typing'}
      </p>
    </div>
  );
}