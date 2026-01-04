import React from 'react';
import { FileText, Calendar, Users, ChevronDown, ExternalLink } from 'lucide-react';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { ProtocolSkeleton } from './ui/Spinner';
import type { PlenarprotokollText } from '@/types';
import { useStore } from '@/store/useStore';

interface ProtocolListProps {
  protocols: PlenarprotokollText[];
  selectedId?: string;
  onSelect: (protocol: PlenarprotokollText) => void;
  onLoadMore: () => void;
  hasMore: boolean;
  isLoading: boolean;
  isLoadingMore: boolean;
}

export const ProtocolList: React.FC<ProtocolListProps> = ({
  protocols,
  selectedId,
  onSelect,
  onLoadMore,
  hasMore,
  isLoading,
  isLoadingMore,
}) => {
  const analysisCache = useStore((state) => state.analysisCache);
  const compactMode = useStore((state) => state.settings.compactMode);

  if (isLoading) {
    return (
      <div className="space-y-4 pb-8">
        {[1, 2, 3, 4].map((i) => (
          <ProtocolSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (protocols.length === 0) {
    return (
      <div className="p-8 text-center text-slate-500 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
        <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
        <p className="font-medium mb-1">Keine Protokolle gefunden</p>
        <p className="text-sm">Bitte passen Sie die Suchkriterien an.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-8">
      <div className="grid gap-3">
        {protocols.map((protocol) => {
          const isSelected = selectedId === protocol.id;
          const hasAnalysis = !!analysisCache[protocol.id]?.summary;
          const hasDeepAnalysis = !!analysisCache[protocol.id]?.deepAnalysis;

          return (
            <article
              key={protocol.id}
              onClick={() => onSelect(protocol)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onSelect(protocol);
                }
              }}
              tabIndex={0}
              role="button"
              aria-selected={isSelected}
              className={`
                group relative rounded-xl border transition-all duration-200 cursor-pointer
                hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-bundestag-500
                ${compactMode ? 'p-3' : 'p-5'}
                ${
                  isSelected
                    ? 'bg-bundestag-50 dark:bg-bundestag-900/30 border-bundestag-500 ring-1 ring-bundestag-500'
                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-bundestag-300 dark:hover:border-bundestag-600'
                }
              `}
            >
              {/* Header */}
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                  <Badge variant={isSelected ? 'primary' : 'default'}>
                    {protocol.dokumentnummer}
                  </Badge>
                  {hasDeepAnalysis ? (
                    <Badge variant="success" size="sm">
                      Analysiert
                    </Badge>
                  ) : hasAnalysis ? (
                    <Badge variant="info" size="sm">
                      Zusammenfassung
                    </Badge>
                  ) : null}
                </div>
                <div className="flex items-center text-slate-500 dark:text-slate-400 text-xs">
                  <Calendar className="w-3 h-3 mr-1" />
                  {new Date(protocol.datum).toLocaleDateString('de-DE', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                  })}
                </div>
              </div>

              {/* Title */}
              <h3
                className={`
                  font-semibold text-slate-900 dark:text-white
                  group-hover:text-bundestag-700 dark:group-hover:text-bundestag-400
                  line-clamp-2 transition-colors
                  ${compactMode ? 'text-sm mb-2' : 'text-base mb-3'}
                `}
              >
                {protocol.titel}
              </h3>

              {/* Footer */}
              <div className="flex items-center justify-between">
                <div className="flex items-center text-slate-500 dark:text-slate-400 text-sm">
                  <Users className="w-4 h-4 mr-1.5" />
                  <span>{protocol.wahlperiode}. Wahlperiode</span>
                </div>

                {protocol.fundstelle?.pdf_url && (
                  <a
                    href={protocol.fundstelle.pdf_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="
                      text-xs text-slate-500 hover:text-bundestag-600 dark:text-slate-400
                      dark:hover:text-bundestag-400 flex items-center gap-1 transition-colors
                    "
                    aria-label="PDF öffnen"
                  >
                    <ExternalLink className="w-3 h-3" />
                    PDF
                  </a>
                )}
              </div>

              {/* Text preview for non-compact mode */}
              {!compactMode && protocol.text && (
                <p className="mt-3 text-sm text-slate-500 dark:text-slate-400 line-clamp-2">
                  {protocol.text.substring(0, 200)}...
                </p>
              )}
            </article>
          );
        })}
      </div>

      {/* Load More */}
      {hasMore && (
        <Button
          variant="secondary"
          onClick={onLoadMore}
          disabled={isLoadingMore}
          isLoading={isLoadingMore}
          className="w-full"
          leftIcon={!isLoadingMore && <ChevronDown className="w-4 h-4" />}
        >
          Ältere Protokolle laden
        </Button>
      )}
    </div>
  );
};
