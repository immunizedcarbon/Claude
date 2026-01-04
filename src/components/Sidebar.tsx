import React from 'react';
import { Search, Filter, RefreshCw } from 'lucide-react';
import { Input, Select } from './ui/Input';
import { Button } from './ui/Button';
import { ProtocolList } from './ProtocolList';
import { useStore } from '@/store/useStore';
import { useProtocols } from '@/hooks';
import { WAHLPERIODEN } from '@/config/constants';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const setSelectedProtocol = useStore((state) => state.setSelectedProtocol);

  const {
    protocols,
    isLoading,
    isLoadingMore,
    error,
    hasMore,
    search,
    loadMore,
    updateSearch,
    searchParams,
  } = useProtocols();

  const selectedProtocol = useStore((state) => state.selectedProtocol);

  const handleProtocolSelect = (protocol: typeof protocols[0]) => {
    setSelectedProtocol(protocol);
    // Close sidebar on mobile
    if (window.innerWidth < 768) {
      onClose();
    }
  };

  const handleSearch = () => {
    search();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <aside
      className={`
        fixed md:relative z-30 h-full w-full md:w-80 lg:w-96
        bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700
        flex flex-col transition-transform duration-300 ease-in-out
        shadow-xl md:shadow-none
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}
    >
      {/* Filters */}
      <div className="p-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 space-y-3">
        <label className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-2">
          <Filter className="w-3.5 h-3.5" />
          Sucheinstellungen
        </label>

        {/* Wahlperiode Select */}
        <Select
          value={searchParams.wahlperiode}
          onChange={(e) => updateSearch({ wahlperiode: parseInt(e.target.value) })}
          options={WAHLPERIODEN.map((wp) => ({
            value: wp.value,
            label: wp.label,
          }))}
        />

        {/* Date Range */}
        <div className="grid grid-cols-2 gap-2">
          <Input
            type="date"
            placeholder="Von"
            value={searchParams.startDatum || ''}
            onChange={(e) => updateSearch({ startDatum: e.target.value || undefined })}
            className="text-sm"
          />
          <Input
            type="date"
            placeholder="Bis"
            value={searchParams.endDatum || ''}
            onChange={(e) => updateSearch({ endDatum: e.target.value || undefined })}
            className="text-sm"
          />
        </div>

        {/* Search Input */}
        <Input
          type="text"
          placeholder="Thema oder Dokumentnummer..."
          value={searchParams.suchbegriff || ''}
          onChange={(e) => updateSearch({ suchbegriff: e.target.value || undefined })}
          onKeyDown={handleKeyDown}
          leftIcon={<Search className="w-4 h-4" />}
          data-search-input
        />

        {/* Search Button */}
        <Button
          variant="primary"
          onClick={handleSearch}
          disabled={isLoading}
          isLoading={isLoading}
          className="w-full"
          leftIcon={!isLoading && <RefreshCw className="w-4 h-4" />}
        >
          Protokolle laden
        </Button>
      </div>

      {/* Results */}
      <div className="flex-1 overflow-y-auto p-2 bg-slate-50 dark:bg-slate-900/30">
        {error && (
          <div className="m-2 p-4 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 text-sm rounded-xl border border-red-100 dark:border-red-800 shadow-sm">
            <p className="font-semibold mb-1">Fehler beim Laden:</p>
            {error}
          </div>
        )}

        <ProtocolList
          protocols={protocols}
          selectedId={selectedProtocol?.id}
          onSelect={handleProtocolSelect}
          onLoadMore={loadMore}
          hasMore={hasMore}
          isLoading={isLoading}
          isLoadingMore={isLoadingMore}
        />
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800">
        <p className="text-xs text-slate-400 dark:text-slate-500 text-center">
          {protocols.length > 0
            ? `${protocols.length} Protokoll${protocols.length !== 1 ? 'e' : ''} geladen`
            : 'Keine Protokolle'}
        </p>
      </div>
    </aside>
  );
};
