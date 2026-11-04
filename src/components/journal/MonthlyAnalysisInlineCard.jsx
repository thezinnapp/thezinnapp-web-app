import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, Flag } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { useTranslatedJson } from '@/hooks/useTranslatedJson';

export default function MonthlyAnalysisInlineCard({ analysis }) {
  const { t } = useTranslation();
  const translatedFields = useTranslatedJson(analysis ? {
    month_label: analysis.month_label,
    pro_social_patterns: analysis.pro_social_patterns,
    anti_social_patterns: analysis.anti_social_patterns,
    overall_summary: analysis.overall_summary,
  } : null);

  if (!analysis) return null;

  return (
    <motion.div data-monthly-id={analysis.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            {translatedFields?.month_label || analysis.month_label} {t('common.aiAnalysis')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-xs">
          <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-3">
            <div className="flex items-center gap-1.5 mb-1.5">
              <Flag className="w-3 h-3 text-emerald-400" style={{ fill: 'currentColor' }} />
              <p className="font-semibold text-emerald-400">{t('selfAwareness.proSocialPatterns')}</p>
            </div>
            <p className="text-muted-foreground leading-relaxed">{translatedFields?.pro_social_patterns || analysis.pro_social_patterns}</p>
          </div>
          <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-3">
            <div className="flex items-center gap-1.5 mb-1.5">
              <Flag className="w-3 h-3 text-red-400" style={{ fill: 'currentColor' }} />
              <p className="font-semibold text-red-400">{t('selfAwareness.antiSocialPatterns')}</p>
            </div>
            <p className="text-muted-foreground leading-relaxed">{translatedFields?.anti_social_patterns || analysis.anti_social_patterns}</p>
          </div>
          <div className="rounded-xl bg-card border border-border/50 p-3">
            <p className="font-semibold mb-1">{t('selfAwareness.summaryNextSteps')}</p>
            <p className="text-muted-foreground leading-relaxed">{translatedFields?.overall_summary || analysis.overall_summary}</p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}