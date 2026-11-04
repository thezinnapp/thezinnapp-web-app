import { Heart } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useTranslation } from '@/hooks/useTranslation';
import { useTranslatedJson } from '@/hooks/useTranslatedJson';

function parsePrinciples(analysis) {
  if (!analysis) return [];
  if (Array.isArray(analysis)) return analysis;
  try {
    const parsed = JSON.parse(analysis);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export default function ThankYouPowerDisplay({ analysis }) {
  const { t } = useTranslation();
  const translatedAnalysis = useTranslatedJson(analysis);
  const allPrinciples = parsePrinciples(translatedAnalysis);
  const detectedPrinciples = allPrinciples.filter(p => p && p.detected);

  if (detectedPrinciples.length === 0) return null;

  return (
    <Card className="border-2 border-rose-400/20 bg-rose-400/5">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Heart className="w-4 h-4 text-rose-400" />
          <h4 className="font-semibold text-sm">{t('thankYouPower.title')}</h4>
          <Badge variant="outline" className="text-[10px] text-rose-400 border-rose-400/30">
            {detectedPrinciples.length} {t('thankYouPower.detected')}
          </Badge>
        </div>
        <div className="space-y-3">
          {detectedPrinciples.map((p, i) => (
            <div key={i} className="rounded-lg border border-rose-400/15 bg-rose-400/8 p-3 space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-[10px] text-rose-400 border-rose-400/30 bg-rose-400/10">
                  {p.principle}
                </Badge>
              </div>
              {p.indicator && (
                <p className="text-xs text-muted-foreground leading-relaxed">{p.indicator}</p>
              )}
              {p.definition && (
                <div className="rounded-md bg-rose-400/8 border border-rose-400/20 px-2.5 py-2">
                  <p className="text-[10px] font-semibold text-rose-400 mb-0.5">{t('thankYouPower.definition')}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">{p.definition}</p>
                </div>
              )}
              {p.recommendation && (
                <div className="rounded-md bg-emerald-500/8 border border-emerald-500/20 px-2.5 py-2">
                  <p className="text-[10px] font-semibold text-emerald-400 mb-0.5">{t('thankYouPower.recommendation')}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">{p.recommendation}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}