import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Flag, Sparkles, ChevronDown, ChevronUp, Trash2 } from 'lucide-react';
import { useState } from 'react';
import FourAgreementsDisplay from '@/components/shared/FourAgreementsDisplay';
import PowerControlWheelDisplay from '@/components/shared/PowerControlWheelDisplay';
import ShameGuiltDisplay from '@/components/shared/ShameGuiltDisplay';
import HaloEffectDisplay from '@/components/shared/HaloEffectDisplay';
import StockholmSyndromeDisplay from '@/components/shared/StockholmSyndromeDisplay';
import GaslightingDisplay from '@/components/shared/GaslightingDisplay';
import CopingStrategiesDisplay from '@/components/shared/CopingStrategiesDisplay';
import CognitiveDissonanceDisplay from '@/components/shared/CognitiveDissonanceDisplay';
import IntentVsImpactDisplay from '@/components/shared/IntentVsImpactDisplay';
import CognitiveBiasesDisplay from '@/components/shared/CognitiveBiasesDisplay';
import HumanNeedsDisplay from '@/components/shared/HumanNeedsDisplay';
import ThankYouPowerDisplay from '@/components/shared/ThankYouPowerDisplay';
import { useTranslation } from '@/hooks/useTranslation';
import { useTranslatedJson } from '@/hooks/useTranslatedJson';
import AICautionFooter from '@/components/shared/AICautionFooter';

export default function JournalEntryCard({ entry, onDelete, index }) {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);
  const isGreen = entry.flag === 'green';
  const translatedFields = useTranslatedJson({
    thoughts: entry.thoughts,
    feelings: entry.feelings,
    reactions: entry.reactions,
    work_on: entry.work_on,
    grateful_for: entry.grateful_for,
    ai_recommendations: entry.ai_recommendations,
  });
  const toggle = () => setExpanded(v => !v);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
    >
      <Card className="border-border/50 overflow-hidden">
        <CardContent className="p-4 space-y-3">
          <div
            className="flex items-start justify-between gap-2 cursor-pointer active:bg-muted/40 rounded-lg -m-1 p-1 transition-colors select-none"
            onClick={toggle}
            role="button"
            tabIndex={0}
          >
            <div className="flex items-center gap-2 flex-wrap min-w-0 flex-1">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Clock className="w-3.5 h-3.5" />
                <span>{t('days.' + (entry.day_of_week || '').toLowerCase())}, {entry.entry_date} at {entry.entry_time}</span>
              </div>
              {entry.flag && (
                <Badge
                  variant="outline"
                  className={`text-[10px] gap-1 ${
                        isGreen
                          ? 'text-emerald-400 border-emerald-500/30 bg-emerald-500/15'
                          : 'text-red-400 border-red-500/30 bg-red-500/15'
                      }`}
                >
                  <Flag className="w-2.5 h-2.5" />
                  {isGreen ? t('common.proSocial') : t('common.antiSocial')} {entry.pro_social_score != null ? `${Math.round(entry.pro_social_score)}%` : ''}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={(e) => { e.stopPropagation(); setExpanded(v => !v); }}
                className="select-none p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors min-h-10 min-w-10 flex items-center justify-center"
                aria-label={expanded ? t('common.collapse') : t('common.expand')}
              >
                {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onDelete(entry.id); }}
                className="select-none p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors min-h-10 min-w-10 flex items-center justify-center"
                aria-label={t('selfAwareness.deleteEntry')}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {entry.thoughts && (
            <p
              className="text-sm line-clamp-2 text-foreground/80 cursor-pointer select-none"
              onClick={toggle}
              role="button"
              tabIndex={0}
            >
              <span className="font-medium text-foreground">{t('common.thoughts')} </span>{translatedFields.thoughts}
            </p>
          )}

          {expanded && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-3 pt-1"
            >
              {entry.feelings && (
                <div className="rounded-lg bg-chart-3/10 p-3">
                  <p className="text-xs font-semibold text-muted-foreground mb-1">{t('common.feelings')}</p>
                  <p className="text-sm">{translatedFields.feelings}</p>
                </div>
              )}
              {entry.reactions && (
                <div className="rounded-lg bg-chart-4/10 p-3">
                  <p className="text-xs font-semibold text-muted-foreground mb-1">{t('common.reactions')}</p>
                  <p className="text-sm">{translatedFields.reactions}</p>
                </div>
              )}
              {entry.ai_recommendations && (
                <div className="rounded-xl bg-emerald-500/5 border border-emerald-500/15 p-4">
                  <div className="flex items-center gap-1.5 mb-2">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                    <p className="text-xs font-semibold text-emerald-400">{t('common.aiRecommendations')}</p>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{translatedFields.ai_recommendations}</p>
                </div>
              )}
              {expanded && entry.four_agreements && (
                <FourAgreementsDisplay agreements={entry.four_agreements} />
              )}
              {expanded && entry.power_control_wheel && (
                <PowerControlWheelDisplay warnings={entry.power_control_wheel} />
              )}
              {expanded && entry.shame_guilt_analysis && (
                <ShameGuiltDisplay analysis={entry.shame_guilt_analysis} />
              )}
              {expanded && entry.halo_effect_analysis && (
                <HaloEffectDisplay analysis={entry.halo_effect_analysis} />
              )}
              {expanded && entry.stockholm_syndrome_analysis && (
                <StockholmSyndromeDisplay analysis={entry.stockholm_syndrome_analysis} />
              )}
              {expanded && entry.gaslighting_analysis && (
                <GaslightingDisplay analysis={entry.gaslighting_analysis} />
              )}
              {expanded && entry.coping_strategies && (
                <CopingStrategiesDisplay strategies={entry.coping_strategies} />
              )}
              {expanded && entry.cognitive_dissonance_analysis && (
                <CognitiveDissonanceDisplay analysis={entry.cognitive_dissonance_analysis} />
              )}
              {expanded && entry.intent_vs_impact_analysis && (
                <IntentVsImpactDisplay analysis={entry.intent_vs_impact_analysis} />
              )}
              {expanded && entry.cognitive_biases_analysis && (
                <CognitiveBiasesDisplay analysis={entry.cognitive_biases_analysis} />
              )}
              {expanded && entry.human_needs_analysis && (
                <HumanNeedsDisplay analysis={entry.human_needs_analysis} />
              )}
              {expanded && entry.thank_you_power_analysis && (
                <ThankYouPowerDisplay analysis={entry.thank_you_power_analysis} />
              )}
              <AICautionFooter />
              </motion.div>
              )}
              </CardContent>
              </Card>
              </motion.div>
              );
              }