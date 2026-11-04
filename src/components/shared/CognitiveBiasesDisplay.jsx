import { BrainCircuit } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useTranslation } from '@/hooks/useTranslation';
import { useTranslatedJson } from '@/hooks/useTranslatedJson';

function parseBiasList(analysis) {
  if (!analysis) return [];
  if (Array.isArray(analysis)) return analysis;
  try {
    const parsed = JSON.parse(analysis);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export default function CognitiveBiasesDisplay({ analysis }) {
  const { t } = useTranslation();
  const translatedAnalysis = useTranslatedJson(analysis);
  const allBiases = parseBiasList(translatedAnalysis);
  const detectedBiases = allBiases.filter(b => b && b.detected);

  if (detectedBiases.length === 0) return null;

  return (
    <Card className="border-2 border-cyan-500/20 bg-cyan-500/5">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <BrainCircuit className="w-4 h-4 text-cyan-400" />
          <h4 className="font-semibold text-sm">{t('cognitiveBiases.title')}</h4>
          <Badge variant="outline" className="text-[10px] text-cyan-400 border-cyan-500/30">
            {detectedBiases.length} {t('cognitiveBiases.detected')}
          </Badge>
        </div>
        <div className="space-y-3">
          {detectedBiases.map((b, i) => (
            <div key={i} className="rounded-lg border border-cyan-500/15 bg-cyan-500/8 p-3 space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-[10px] text-cyan-400 border-cyan-500/30 bg-cyan-500/10">
                  {b.bias}
                </Badge>
              </div>
              {b.indicator && (
                <p className="text-xs text-muted-foreground leading-relaxed">{b.indicator}</p>
              )}
              {b.definition && (
                <div className="rounded-md bg-cyan-500/8 border border-cyan-500/20 px-2.5 py-2">
                  <p className="text-[10px] font-semibold text-cyan-400 mb-0.5">{t('cognitiveBiases.definition')}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">{b.definition}</p>
                </div>
              )}
              {b.recommendation && (
                <div className="rounded-md bg-emerald-500/8 border border-emerald-500/20 px-2.5 py-2">
                  <p className="text-[10px] font-semibold text-emerald-400 mb-0.5">{t('cognitiveBiases.recommendation')}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">{b.recommendation}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}