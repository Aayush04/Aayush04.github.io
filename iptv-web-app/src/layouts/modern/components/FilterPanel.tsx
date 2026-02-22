import { useState, useRef, useEffect } from 'react';
import { useAppStore } from '../../../store';
import { getCountryName } from '../../../services/countries';
import { Icon } from './Icon';

interface DropdownProps {
  label: string;
  placeholder: string;
  value: string | null;
  options: { value: string; label: string }[];
  onChange: (value: string | null) => void;
}

function Dropdown({ label, placeholder, value, options, onChange }: DropdownProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery('');
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => { if (open) inputRef.current?.focus(); }, [open]);

  const filtered = query.trim()
    ? options.filter(o => o.label.toLowerCase().includes(query.toLowerCase()))
    : options;

  const selectedLabel = value ? (options.find(o => o.value === value)?.label ?? value) : null;

  return (
    <div ref={ref} className="relative min-w-0 flex-1">
      <label className="block text-[10px] font-semibold text-white/40 uppercase tracking-wider mb-1 px-0.5">
        {label}
      </label>
      <button
        type="button"
        onClick={() => { setOpen(o => !o); setQuery(''); }}
        className={`w-full flex items-center justify-between gap-1.5 px-3 py-2 rounded-xl text-sm
                    bg-white/[0.05] border transition-all outline-none
                    ${open ? 'border-sky-500/50 bg-white/[0.07]' : 'border-white/[0.08] hover:border-white/20 hover:bg-white/[0.07]'}`}
      >
        <span className={`truncate ${selectedLabel ? 'text-white' : 'text-white/35'}`}>
          {selectedLabel ?? placeholder}
        </span>
        <Icon name={open ? 'chevron-up' : 'chevron-down'} size={13} className="text-white/30 shrink-0" />
      </button>

      {open && (
        <div className="absolute z-50 top-full mt-1.5 w-full min-w-[180px]
                        bg-[#1a1a25] border border-white/[0.1] rounded-xl shadow-2xl shadow-black/50 overflow-hidden">
          <div className="p-2 border-b border-white/[0.07]">
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder={`Search…`}
              className="w-full bg-white/[0.05] text-white text-sm rounded-lg px-3 py-1.5 outline-none
                         focus:ring-1 focus:ring-sky-500/50 placeholder-white/25"
            />
          </div>
          <ul className="max-h-52 overflow-y-auto py-1">
            <li>
              <button
                type="button"
                onClick={() => { onChange(null); setOpen(false); setQuery(''); }}
                className={`w-full text-left px-3 py-2 text-sm transition-colors ${
                  !value ? 'text-sky-400 bg-sky-500/10' : 'text-white/50 hover:text-white hover:bg-white/[0.05]'
                }`}
              >
                {placeholder}
              </button>
            </li>
            {filtered.length === 0 ? (
              <li className="px-3 py-2 text-sm text-white/25">No results</li>
            ) : filtered.map(opt => (
              <li key={opt.value}>
                <button
                  type="button"
                  onClick={() => { onChange(opt.value); setOpen(false); setQuery(''); }}
                  className={`w-full text-left px-3 py-2 text-sm transition-colors ${
                    value === opt.value
                      ? 'text-sky-400 bg-sky-500/10'
                      : 'text-white/80 hover:text-white hover:bg-white/[0.05]'
                  }`}
                >
                  {opt.label}
                </button>
              </li>
            ))}
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

  const streamOpts = [
    { value: 'all'          as const, label: 'All' },
    { value: 'with-streams' as const, label: 'Has streams' },
    { value: 'no-streams'   as const, label: 'No streams' },
  ];

  return (
    <div className="bg-[#111118] border border-white/[0.06] rounded-2xl px-4 py-3 mb-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 text-white/40">
          <Icon name="sliders" size={13} />
          <span className="text-xs font-semibold uppercase tracking-wider">Filters</span>
        </div>
        {hasActiveFilters && (
          <button
            onClick={resetFilters}
            className="flex items-center gap-1 text-xs text-sky-400 hover:text-sky-300 transition-colors"
          >
            <Icon name="x" size={12} />
            Clear all
          </button>
        )}
      </div>

      {/* Filter row: 2-col grid on mobile, single flex row on md+ */}
      <div className="grid grid-cols-2 md:flex md:flex-nowrap gap-2 md:gap-3 md:items-end">
        <Dropdown label="Country"  placeholder="All Countries"  value={selectedCountry}  options={countryOptions}  onChange={setSelectedCountry} />
        <Dropdown label="Category" placeholder="All Categories" value={selectedCategory} options={categoryOptions} onChange={setSelectedCategory} />
        <Dropdown label="Language" placeholder="All Languages"  value={selectedLanguage} options={languageOptions} onChange={setSelectedLanguage} />

        {/* Stream toggle */}
        <div className="shrink-0">
          <label className="block text-[10px] font-semibold text-white/40 uppercase tracking-wider mb-1 px-0.5">
            Streams
          </label>
          <div className="flex rounded-xl overflow-hidden border border-white/[0.08] bg-white/[0.03]">
            {streamOpts.map(opt => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setStreamFilter(opt.value)}
                className={`flex-1 md:flex-none px-3 py-2 text-xs font-medium transition-all border-r last:border-r-0 border-white/[0.06] ${
                  streamFilter === opt.value
                    ? opt.value === 'with-streams'
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : opt.value === 'no-streams'
                        ? 'bg-white/10 text-white/60'
                        : 'bg-sky-500/20 text-sky-400'
                    : 'text-white/35 hover:text-white/70 hover:bg-white/[0.04]'
                }`}
              >
                {opt.value === 'all' ? 'All' : opt.value === 'with-streams' ? '📡' : '∅'}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
