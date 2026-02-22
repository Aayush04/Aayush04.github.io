import { useState, useRef, useEffect } from 'react';
import { useAppStore } from '../../../store';
import { getCountryName } from '../../../services/countries';

interface SearchDropdownProps {
  label: string;
  placeholder: string;
  value: string | null;
  options: { value: string; label: string }[];
  onChange: (value: string | null) => void;
}

function SearchDropdown({ label, placeholder, value, options, onChange }: SearchDropdownProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery('');
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  const filtered = query.trim()
    ? options.filter(o => o.label.toLowerCase().includes(query.toLowerCase()))
    : options;

  const selectedLabel = value ? (options.find(o => o.value === value)?.label ?? value) : null;

  return (
    <div ref={containerRef} className="relative min-w-0 flex-1">
      <label className="block text-xs font-medium text-gray-400 mb-1">{label}</label>
      <button
        type="button"
        onClick={() => { setOpen(o => !o); setQuery(''); }}
        className="w-full bg-gray-700 text-left text-white rounded px-2.5 py-1.5 text-sm flex items-center justify-between focus:ring-2 focus:ring-primary-500 outline-none hover:bg-gray-600 transition-colors"
      >
        <span className={`truncate ${selectedLabel ? 'text-white' : 'text-gray-400'}`}>
          {selectedLabel ?? placeholder}
        </span>
        <span className="text-gray-400 ml-1 shrink-0 text-xs">{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-full bg-gray-800 border border-gray-600 rounded-lg shadow-xl overflow-hidden">
          <div className="p-2 border-b border-gray-700">
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder={`Search ${label.toLowerCase()}...`}
              className="w-full bg-gray-700 text-white rounded px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-primary-500 placeholder-gray-500"
            />
          </div>
          <ul className="max-h-56 overflow-y-auto">
            <li>
              <button
                type="button"
                onClick={() => { onChange(null); setOpen(false); setQuery(''); }}
                className={`w-full text-left px-3 py-2 text-sm transition-colors ${
                  !value ? 'bg-primary-600 text-white' : 'text-gray-400 hover:bg-gray-700'
                }`}
              >
                {placeholder}
              </button>
            </li>
            {filtered.length === 0 ? (
              <li className="px-3 py-2 text-sm text-gray-500">No results</li>
            ) : (
              filtered.map(option => (
                <li key={option.value}>
                  <button
                    type="button"
                    onClick={() => { onChange(option.value); setOpen(false); setQuery(''); }}
                    className={`w-full text-left px-3 py-2 text-sm transition-colors ${
                      value === option.value
                        ? 'bg-primary-600 text-white'
                        : 'text-white hover:bg-gray-700'
                    }`}
                  >
                    {option.label}
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
}

export function FilterPanel() {
  const {
    data,
    selectedCountry, selectedCategory, selectedLanguage,
    setSelectedCountry, setSelectedCategory, setSelectedLanguage,
    streamFilter, setStreamFilter,
    resetFilters,
  } = useAppStore();

  if (!data) return null;

  const countryOptions = Array.from(data.countries.values())
    .sort((a, b) => a.name.localeCompare(b.name))
    .map(c => ({ value: c.code, label: `${c.flag} ${getCountryName(c.code)}` }));

  const categoryOptions = Array.from(data.categories)
    .sort()
    .map(c => ({ value: c, label: c }));

  const languageOptions = Array.from(data.languages.values())
    .sort((a, b) => a.name.localeCompare(b.name))
    .map(l => ({ value: l.code, label: l.name }));

  const hasActiveFilters = selectedCountry || selectedCategory || selectedLanguage || streamFilter !== 'all';

  const streamOptions: { value: 'all' | 'with-streams' | 'no-streams'; label: string; activeClass: string }[] = [
    { value: 'all',          label: 'All',   activeClass: 'bg-primary-600 text-white' },
    { value: 'with-streams', label: '📡',    activeClass: 'bg-green-600 text-white' },
    { value: 'no-streams',   label: '🚫',    activeClass: 'bg-gray-500 text-white' },
  ];

  return (
    <div className="bg-gray-800 rounded-lg px-3 py-3 mb-4">
      {/* Header row: title + clear */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Filters</span>
        {hasActiveFilters && (
          <button
            onClick={resetFilters}
            className="text-xs text-primary-400 hover:text-primary-300 transition-colors"
          >
            ✕ Clear all
          </button>
        )}
      </div>

      {/* 2-col grid on mobile → single row on md+ */}
      <div className="grid grid-cols-2 md:flex md:flex-nowrap gap-2 md:gap-3 md:items-end">
        <SearchDropdown label="Country"  placeholder="All Countries"  value={selectedCountry}  options={countryOptions}  onChange={setSelectedCountry} />
        <SearchDropdown label="Category" placeholder="All Categories" value={selectedCategory} options={categoryOptions} onChange={setSelectedCategory} />
        <SearchDropdown label="Language" placeholder="All Languages"  value={selectedLanguage} options={languageOptions} onChange={setSelectedLanguage} />

        {/* Streams segment control */}
        <div className="shrink-0">
          <label className="block text-xs font-medium text-gray-400 mb-1">Streams</label>
          <div className="flex rounded overflow-hidden border border-gray-600 h-[30px]">
            {streamOptions.map(opt => (
              <button
                key={opt.value}
                type="button"
                title={opt.value === 'all' ? 'All channels' : opt.value === 'with-streams' ? 'Has streams' : 'No streams'}
                onClick={() => setStreamFilter(opt.value)}
                className={`flex-1 md:flex-none px-2.5 text-sm font-medium transition-colors border-r last:border-r-0 border-gray-600 ${
                  streamFilter === opt.value
                    ? opt.activeClass
                    : 'bg-gray-700 text-gray-400 hover:bg-gray-600 hover:text-white'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
