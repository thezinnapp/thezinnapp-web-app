import { Compass } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useTranslation } from '@/hooks/useTranslation';
import { useTranslatedJson } from '@/hooks/useTranslatedJson';

function parseNeedsList(analysis) {
  if (!analysis) return [];
  if (Array.isArray(analysis)) return analysis;
  try {
    const parsed = JSON.parse(analysis);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export default function HumanNeedsDisplay({ analysis }) {
  const { t } = useTranslation();
  const translatedAnalysis = useTranslatedJson(analysis);
  const allNeeds = parseNeedsList(translatedAnalysis);
  const detectedNeeds = allNeeds.filter(n => n && n.detected);

  if (detectedNeeds.length === 0) return null;

  return (
    <Card className="border-2 border-teal-500/20 bg-teal-500/5">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Compass className="w-4 h-4 text-teal-400" />
          <h4 className="font-semibold text-sm">{t('humanNeeds.title')}</h4>
          <Badge variant="outline" className="text-[10px] text-teal-400 border-teal-500/30">
            {detectedNeeds.length} {t('humanNeeds.detected')}
          </Badge>
        </div>
        <div className="space-y-3">
          {detectedNeeds.map((n, i) => (
            <div key={i} className="rounded-lg border border-teal-500/15 bg-teal-500/8 p-3 space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-[10px] text-teal-400 border-teal-500/30 bg-teal-500/10">
                  {n.need}
                </Badge>
              </div>
              {n.indicator && (
                <p className="text-xs text-muted-foreground leading-relaxed">{n.indicator}</p>
              )}
              {n.definition && (
                <div className="rounded-md bg-teal-500/8 border border-teal-500/20 px-2.5 py-2">
                  <p className="text-[10px] font-semibold text-teal-400 mb-0.5">{t('humanNeeds.definition')}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">{n.definition}</p>
                </div>
              )}
              {n.recommendation && (
                <div className="rounded-md bg-emerald-500/8 border border-emerald-500/20 px-2.5 py-2">
                  <p className="text-[10px] font-semibold text-emerald-400 mb-0.5">{t('humanNeeds.recommendation')}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">{n.recommendation}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}