import { useTranslatedJson } from '@/hooks/useTranslatedJson';
import { Badge } from '@/components/ui/badge';
import { ChevronRight } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';

export default function ReportListItem({ report, isSelected, alreadyAnalyzed, onSelect }) {
  const { t } = useTranslation();
  const translated = useTranslatedJson({
    first_thought: report.first_thought,
    situation: report.situation,
    behavior: report.behavior,
  });

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`select-none w-full text-left rounded-xl border p-3 transition-all duration-200 ${
        isSelected
          ? 'border-primary bg-primary/10 ring-1 ring-primary/30'
          : 'border-border hover:border-border/80 hover:bg-muted/50'
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-sm font-medium line-clamp-1">{translated.first_thought}</p>
          {report.situation && (
            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{translated.situation}</p>
          )}
          {report.behavior && (
            <p className="text-xs text-muted-foreground line-clamp-1">{t('common.behavior')}: {translated.behavior}</p>
          )}
        </div>
        <div className="flex flex-col items-end gap-1 shrink-0">
          {alreadyAnalyzed && (
            <Badge variant="outline" className="text-[10px] text-emerald-400 border-emerald-500/30 bg-emerald-500/10">
              {t('maslow.analyzed')}
            </Badge>
          )}
          <ChevronRight className={`w-4 h-4 text-muted-foreground transition-transform ${isSelected ? 'rotate-90 text-primary' : ''}`} />
        </div>
      </div>
    </button>
  );
}