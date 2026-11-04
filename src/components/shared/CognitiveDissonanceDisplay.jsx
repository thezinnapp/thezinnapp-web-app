import { Shuffle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useTranslation } from '@/hooks/useTranslation';
import { useTranslatedJson } from '@/hooks/useTranslatedJson';

export default function CognitiveDissonanceDisplay({ analysis }) {
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
    <Card className="border-2 border-fuchsia-500/20 bg-fuchsia-500/5">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Shuffle className="w-4 h-4 text-fuchsia-400" />
          <h4 className="font-semibold text-sm">{t('cognitiveDissonance.title')}</h4>
          <Badge variant="outline" className="text-[10px] text-fuchsia-400 border-fuchsia-500/30">
            {t('cognitiveDissonance.detected')}
          </Badge>
        </div>
        {parsed.indicator && (
          <p className="text-xs text-muted-foreground leading-relaxed mb-2">{parsed.indicator}</p>
        )}
        {parsed.definition && (
          <div className="rounded-md bg-fuchsia-500/8 border border-fuchsia-500/20 px-2.5 py-2 mb-2">
            <p className="text-[10px] font-semibold text-fuchsia-400 mb-0.5">{t('cognitiveDissonance.definition')}</p>
            <p className="text-xs text-muted-foreground leading-relaxed">{parsed.definition}</p>
          </div>
        )}
        {parsed.recommendation && (
          <div className="rounded-md bg-emerald-500/8 border border-emerald-500/20 px-2.5 py-2">
            <p className="text-[10px] font-semibold text-emerald-400 mb-0.5">{t('cognitiveDissonance.recommendation')}</p>
            <p className="text-xs text-muted-foreground leading-relaxed">{parsed.recommendation}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}