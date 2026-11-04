import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trash2, Brain, ArrowDown, ChevronDown, ChevronUp, AlertTriangle, ShieldAlert } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
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
import ThankYouPowerDisplay from '@/components/shared/ThankYouPowerDisplay';
import { useTranslation } from '@/hooks/useTranslation';
import { useTranslatedJson } from '@/hooks/useTranslatedJson';
import AICautionFooter from '@/components/shared/AICautionFooter';

function parseJSON(str) {
  if (!str) return [];
  try { return JSON.parse(str); } catch { return []; }
}

function CATSection({ title, icon: Icon, items, colorClass, badgeLabel }) {
  const { t } = useTranslation();
  if (!items || items.length === 0) return null;
  return (
    <div className="space-y-2">
      <div className={`flex items-center gap-1.5 ${colorClass}`}>
        <Icon className="w-3.5 h-3.5" />
        <p className="text-xs font-bold uppercase tracking-wide">{title}</p>
      </div>
      {items.map((item, i) => (
        <div key={i} className="rounded-lg border border-border/40 bg-muted/30 p-3 space-y-1.5">
          <div className="flex items-start gap-2 flex-wrap">
            <Badge variant="outline" className={`text-[10px] shrink-0 ${colorClass} border-current/30`}>
              {badgeLabel}: {item.pattern || item.tactic || item.stance}
            </Badge>
            {item.type && (
              <Badge variant="secondary" className="text-[10px] shrink-0">{item.type}</Badge>
            )}
          </div>
          {item.description && (
            <p className="text-xs text-muted-foreground leading-relaxed">{item.description}</p>
          )}
          {item.correction && (
            <div className="mt-1.5 rounded-md bg-emerald-500/8 border border-emerald-500/20 px-2.5 py-2">
              <p className="text-[10px] font-semibold text-emerald-400 mb-0.5">{t('thinkingReport.workbookSolution')}</p>
              <p className="text-xs text-muted-foreground leading-relaxed">{item.correction}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default function ThinkingReportCard({ report, onDelete, index = 0 }) {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);

  const translatedFields = useTranslatedJson({
    situation: report.situation,
    first_thought: report.first_thought,
    feelings: report.feelings,
    behavior: report.behavior,
    cognitive_distortion: report.cognitive_distortion,
    disputing_thought: report.disputing_thought,
    replacement_thought: report.replacement_thought,
    associated_belief: report.associated_belief,
    ai_analysis: report.ai_analysis,
  });
  const translatedDistortedPatterns = useTranslatedJson(report.distorted_thinking_patterns);
  const translatedTactics = useTranslatedJson(report.avoidance_diversion_aggression_tactics);
  const translatedStances = useTranslatedJson(report.associated_stances);

  const steps = [
    { key: 'situation', label: t('common.situation'), color: 'bg-muted' },
    { key: 'first_thought', label: t('common.firstThought'), color: 'bg-chart-1/10' },
    { key: 'feelings', label: t('common.feelings'), color: 'bg-chart-3/10' },
    { key: 'behavior', label: t('common.behavior'), color: 'bg-chart-4/10' },
    { key: 'cognitive_distortion', label: t('common.cognitiveDistortion'), color: 'bg-destructive/10' },
    { key: 'disputing_thought', label: t('common.disputingThought'), color: 'bg-chart-5/10' },
    { key: 'replacement_thought', label: t('common.replacementThought'), color: 'bg-accent/10' },
    { key: 'associated_belief', label: t('common.associatedBelief'), color: 'bg-primary/10' },
  ];

  const distortedPatterns = parseJSON(translatedDistortedPatterns);
  const tactics = parseJSON(translatedTactics);
  const stances = parseJSON(translatedStances);
  const hasCATData = distortedPatterns.length > 0 || tactics.length > 0 || stances.length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Card className="group border-border/50 hover:shadow-lg transition-all duration-300">
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Brain className="w-4 h-4 text-primary" />
              <span className="text-xs text-muted-foreground">
                {new Date(report.created_date).toLocaleDateString()}
              </span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="opacity-0 group-hover:opacity-100 transition-opacity h-7 w-7 text-muted-foreground hover:text-destructive"
              onClick={() => onDelete(report.id)}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          </div>

          <div className="space-y-2">
            {steps.map((step, i) => {
              const value = translatedFields[step.key];
              if (!value) return null;
              return (
                <div key={step.key}>
                  {i > 0 && steps.slice(0, i).some(s => report[s.key]) && (
                    <div className="flex justify-center py-0.5">
                      <ArrowDown className="w-3 h-3 text-muted-foreground/40" />
                    </div>
                  )}
                  <div className={`${step.color} rounded-lg px-3 py-2`}>
                    <p className="text-xs font-medium text-muted-foreground mb-0.5">{step.label}</p>
                    <p className="text-sm">{value}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {report.ai_analysis && (
            <div className="mt-4 bg-primary/5 border border-primary/10 rounded-lg p-3">
              <p className="text-xs font-medium text-emerald-400 mb-1">{t('common.aiAnalysis')}</p>
              <p className="text-xs text-muted-foreground leading-relaxed">{translatedFields.ai_analysis}</p>
            </div>
          )}

          {hasCATData && (
            <div className="mt-4">
              <button
                onClick={() => setExpanded(v => !v)}
                className="select-none w-full flex items-center justify-between px-3 py-2 rounded-lg bg-amber-500/8 border border-amber-500/20 hover:bg-amber-500/12 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-xs font-semibold text-amber-400">{t('thinkingReport.catAnalysis')}</span>
                  <Badge variant="secondary" className="text-[10px] h-4 px-1.5">
                    {distortedPatterns.length + tactics.length + stances.length}
                  </Badge>
                </div>
                {expanded
                  ? <ChevronUp className="w-3.5 h-3.5 text-muted-foreground" />
                  : <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
                }
              </button>

              <AnimatePresence>
                {expanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="pt-3 space-y-4">
                      <CATSection
                        title={t('thinkingReport.distortedPatterns')}
                        icon={Brain}
                        items={distortedPatterns}
                        colorClass="text-rose-400"
                        badgeLabel={t('thinkingReport.pattern')}
                      />
                      <CATSection
                        title={t('thinkingReport.avoidanceTactics')}
                        icon={ShieldAlert}
                        items={tactics}
                        colorClass="text-orange-400"
                        badgeLabel={t('thinkingReport.tactic')}
                      />
                      <CATSection
                        title={t('thinkingReport.associatedStances')}
                        icon={AlertTriangle}
                        items={stances}
                        colorClass="text-amber-400"
                        badgeLabel={t('thinkingReport.stance')}
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {report.four_agreements && (
            <div className="mt-4">
              <FourAgreementsDisplay agreements={report.four_agreements} />
            </div>
          )}

          {report.power_control_wheel && (
            <div className="mt-4">
              <PowerControlWheelDisplay warnings={report.power_control_wheel} />
            </div>
          )}

          {report.shame_guilt_analysis && (
            <div className="mt-4">
              <ShameGuiltDisplay analysis={report.shame_guilt_analysis} />
            </div>
          )}

          {report.halo_effect_analysis && (
            <div className="mt-4">
              <HaloEffectDisplay analysis={report.halo_effect_analysis} />
            </div>
          )}

          {report.stockholm_syndrome_analysis && (
            <div className="mt-4">
              <StockholmSyndromeDisplay analysis={report.stockholm_syndrome_analysis} />
            </div>
          )}

          {report.gaslighting_analysis && (
            <div className="mt-4">
              <GaslightingDisplay analysis={report.gaslighting_analysis} />
            </div>
          )}

          {report.coping_strategies && (
            <div className="mt-4">
              <CopingStrategiesDisplay strategies={report.coping_strategies} />
            </div>
          )}

          {report.cognitive_dissonance_analysis && (
            <div className="mt-4">
              <CognitiveDissonanceDisplay analysis={report.cognitive_dissonance_analysis} />
            </div>
          )}
          {report.intent_vs_impact_analysis && (
            <div className="mt-4">
              <IntentVsImpactDisplay analysis={report.intent_vs_impact_analysis} />
            </div>
          )}
          {report.cognitive_biases_analysis && (
            <div className="mt-4">
              <CognitiveBiasesDisplay analysis={report.cognitive_biases_analysis} />
            </div>
          )}
          {report.thank_you_power_analysis && (
            <div className="mt-4">
              <ThankYouPowerDisplay analysis={report.thank_you_power_analysis} />
            </div>
          )}
          <AICautionFooter />
          </CardContent>
          </Card>
          </motion.div>
          );
          }