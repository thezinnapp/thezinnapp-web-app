import { AlertCircle } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';

export default function AICautionFooter() {
  const { t } = useTranslation();
  return (
    <div className="mt-4 rounded-lg border border-amber-500/25 bg-amber-500/10 px-3 py-2.5 flex items-start gap-2">
      <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
      <p className="text-xs text-amber-900 dark:text-amber-100 leading-relaxed font-medium">
        {t('disclaimer.contextual')}
      </p>
    </div>
  );
}