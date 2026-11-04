import { Compass } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useTranslation } from '@/hooks/useTranslation';
import { useTranslatedJson } from '@/hooks/useTranslatedJson';

const AMBER_BOX = 'rounded-md bg-amber-500/8 border border-amber-500/20 px-2.5 py-2';
const AMBER_LABEL = 'text-[10px] font-semibold text-amber-400 mb-0.5';
const BODY = 'text-xs text-muted-foreground leading-relaxed';

export default function IntentVsImpactDisplay({ analysis }) {
  const { t } = useTranslation();
  const translatedAnalysis = useTranslatedJson(analysis);
  if (!analysis) return null;

  let parsed = translatedAnalysis;
  if (typeof translatedAnalysis === 'string') {
    try {
      parsed = JSON.parse(translatedAnalysis);
    } catch {
      return null;
    }
  }

  if (!parsed || typeof parsed !== 'object' || !parsed.detected) return null;

  return (
    <Card className="border-2 border-amber-500/20 bg-amber-500/5">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Compass className="w-4 h-4 text-amber-400" />
          <h4 className="font-semibold text-sm">{t('intentVsImpact.title')}</h4>
          <Badge variant="outline" className="text-[10px] text-amber-400 border-amber-500/30">
            {t('intentVsImpact.detected')}
          </Badge>
        </div>
        {parsed.indicator && <p className={BODY}>{parsed.indicator}</p>}
        {parsed.intent_definition && (
          <div className={AMBER_BOX}>
            <p className={AMBER_LABEL}>{t('intentVsImpact.intentDefinition')}</p>
            <p className={BODY}>{parsed.intent_definition}</p>
          </div>
        )}
        {parsed.impact_definition && (
          <div className={AMBER_BOX}>
            <p className={AMBER_LABEL}>{t('intentVsImpact.impactDefinition')}</p>
            <p className={BODY}>{parsed.impact_definition}</p>
          </div>
        )}
        {parsed.why_it_matters && (
          <div className={AMBER_BOX}>
            <p className={AMBER_LABEL}>{t('intentVsImpact.whyItMatters')}</p>
            <p className={BODY}>{parsed.why_it_matters}</p>
          </div>
        )}
        {parsed.recommendation && (
          <div className="rounded-md bg-emerald-500/8 border border-emerald-500/20 px-2.5 py-2">
            <p className="text-[10px] font-semibold text-emerald-400 mb-0.5">{t('intentVsImpact.recommendation')}</p>
            <p className={BODY}>{parsed.recommendation}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
