import { useTranslation } from '@/hooks/useTranslation';
import { useTranslatedText } from '@/hooks/useTranslatedText';

export default function SelectedEntryPreview({ entry }) {
  const { t } = useTranslation();
  const translatedThoughts = useTranslatedText(entry?.thoughts || '');
  const translatedReactions = useTranslatedText(entry?.reactions || '');

  if (!entry) return null;

  return (
    <div className="rounded-xl bg-legacy-primary/5 border border-legacy-primary/15 p-3 space-y-2 min-w-0">
      <div className="text-xs text-muted-foreground font-medium">
        {entry.day_of_week ? t('days.' + entry.day_of_week.toLowerCase()) : ''}, {entry.entry_date} · {entry.entry_time}
      </div>
      {entry.thoughts && (
        <div className="min-w-0 break-words">
          <span className="text-xs font-semibold text-legacy-accent">{t('common.thoughts')} </span>
          <span className="text-xs text-foreground/80 break-words" style={{ overflowWrap: 'anywhere' }}>{translatedThoughts}</span>
        </div>
      )}
      {entry.reactions && (
        <div className="min-w-0 break-words">
          <span className="text-xs font-semibold text-amber-500">{t('common.reactions')} </span>
          <span className="text-xs text-foreground/80 break-words" style={{ overflowWrap: 'anywhere' }}>{translatedReactions}</span>
        </div>
      )}
    </div>
  );
}