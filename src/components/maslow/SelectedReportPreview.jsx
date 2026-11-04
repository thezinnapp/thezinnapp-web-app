import { useTranslatedJson } from '@/hooks/useTranslatedJson';
import { useTranslation } from '@/hooks/useTranslation';

export default function SelectedReportPreview({ report }) {
  const { t } = useTranslation();
  const translated = useTranslatedJson({
    first_thought: report.first_thought,
    situation: report.situation,
    behavior: report.behavior,
  });

  return (
    <div className="rounded-xl bg-muted/60 border border-border/50 p-4 space-y-2 text-xs">
      <p className="font-semibold text-sm text-foreground">{t('maslow.autoPopulated')}</p>
      <div><span className="text-muted-foreground font-medium">{t('common.firstThought')}: </span>{translated.first_thought}</div>
      {report.behavior && <div><span className="text-muted-foreground font-medium">{t('common.behavior')}: </span>{translated.behavior}</div>}
      {report.situation && <div><span className="text-muted-foreground font-medium">{t('common.situation')}: </span>{translated.situation}</div>}
    </div>
  );
}