import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trash2, ChevronDown, ChevronUp, Pyramid } from 'lucide-react';
import { useState } from 'react';
import MaslowPyramid from './MaslowPyramid';
import { useTranslation } from '@/hooks/useTranslation';
import { useTranslatedJson } from '@/hooks/useTranslatedJson';
import AICautionFooter from '@/components/shared/AICautionFooter';
import HumanNeedsDisplay from '@/components/shared/HumanNeedsDisplay';
import ThankYouPowerDisplay from '@/components/shared/ThankYouPowerDisplay';

export default function MaslowAnalysisCard({ analysis, onDelete, index }) {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);
  const translatedFields = useTranslatedJson({
    first_thought: analysis.first_thought,
    situation: analysis.situation,
    behavior: analysis.behavior,
    recommendations: analysis.recommendations,
    physiological: analysis.physiological,
    safety: analysis.safety,
    love_belonging: analysis.love_belonging,
    esteem: analysis.esteem,
    self_actualization: analysis.self_actualization,
  });
  const translatedAnalysis = { ...analysis, ...translatedFields };

  const deficitLabels = {
    physiological: { label: t('maslow.levels.physiological'), color: 'bg-rose-500/15 text-rose-400 border-rose-500/30' },
    safety: { label: t('maslow.levels.safety'), color: 'bg-amber-500/15 text-amber-400 border-amber-500/30' },
    love_belonging: { label: t('maslow.levels.loveBelonging'), color: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' },
    esteem: { label: t('maslow.levels.esteem'), color: 'bg-blue-500/15 text-blue-400 border-blue-500/30' },
    self_actualization: { label: t('maslow.levels.selfActualization'), color: 'bg-violet-500/15 text-violet-400 border-violet-500/30' },
  };

  const deficit = deficitLabels[analysis.primary_deficit];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Card className="border-border/50 hover:border-border transition-all duration-300 overflow-hidden">
        <CardHeader className="pb-3 pt-4 px-5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                <Pyramid className="w-4 h-4 text-primary" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium leading-snug line-clamp-2">
                  "{translatedFields.first_thought}"
                </p>
                {analysis.situation && (
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                    {t('common.situation')}: {translatedFields.situation}
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={() => onDelete(analysis.id)}
              className="select-none shrink-0 p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>

          {deficit && (
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs text-muted-foreground">{t('maslow.primaryDeficit')}</span>
              <Badge variant="outline" className={`text-xs ${deficit.color}`}>
                {deficit.label}
              </Badge>
            </div>
          )}
        </CardHeader>

        <CardContent className="px-5 pb-4 space-y-3">
          <button
            onClick={() => setExpanded(!expanded)}
            className="select-none flex items-center gap-1.5 text-xs text-legacy-primary font-medium hover:opacity-75 transition-opacity"
          >
            {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            {expanded ? t('maslow.hideHierarchy') : t('maslow.viewHierarchy')}
          </button>

          {expanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-4"
            >
              <MaslowPyramid analysis={translatedAnalysis} primaryDeficit={analysis.primary_deficit} />

              {analysis.recommendations && (
                <div className="rounded-xl bg-emerald-500/5 border border-emerald-500/15 p-4">
                  <p className="text-xs font-semibold text-emerald-400 mb-2">{t('common.aiRecommendations')}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">{translatedFields.recommendations}</p>
                </div>
              )}

              {analysis.behavior && (
                <div className="rounded-xl bg-blue-500/5 border border-blue-500/15 p-3">
                  <p className="text-xs font-medium text-blue-400 mb-1">{t('maslow.associatedBehavior')}</p>
                  <p className="text-xs">{translatedFields.behavior}</p>
                </div>
              )}
              {analysis.human_needs_analysis && (
                <HumanNeedsDisplay analysis={analysis.human_needs_analysis} />
              )}
              {analysis.thank_you_power_analysis && (
                <ThankYouPowerDisplay analysis={analysis.thank_you_power_analysis} />
              )}
              <AICautionFooter />
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}