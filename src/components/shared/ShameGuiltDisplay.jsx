import { HeartCrack, Heart } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useTranslation } from '@/hooks/useTranslation';
import { useTranslatedJson } from '@/hooks/useTranslatedJson';

export default function ShameGuiltDisplay({ analysis }) {
  const { t } = useTranslation();
  const translatedAnalysis = useTranslatedJson(analysis);
  if (!analysis || analysis.length === 0) return null;

  let parsed = translatedAnalysis;
  if (typeof translatedAnalysis === 'string') {
    try {
      parsed = JSON.parse(translatedAnalysis);
    } catch {
      return null;
    }
  }

  if (!Array.isArray(parsed) || parsed.length === 0) return null;

  return (
    <Card className="border-2 border-rose-500/20 bg-rose-500/5">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <HeartCrack className="w-4 h-4 text-rose-400" />
          <h4 className="font-semibold text-sm">{t('shameGuilt.title')}</h4>
        </div>
        <div className="space-y-2">
          {parsed.map((item, idx) => {
            const isShame = (item.type || '').toLowerCase() === 'shame';
            return (
              <div
                key={idx}
                className={`rounded-lg border p-3 text-sm ${
                  isShame
                    ? 'border-rose-500/30 bg-rose-500/5'
                    : 'border-amber-500/30 bg-amber-500/5'
                }`}
              >
                <div className="flex items-center gap-2 mb-1.5">
                  {isShame
                    ? <HeartCrack className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                    : <Heart className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
                  <Badge
                    variant="outline"
                    className={`text-[10px] ${isShame ? 'text-rose-400 border-rose-500/30' : 'text-amber-400 border-amber-500/30'}`}
                  >
                    {isShame ? t('shameGuilt.shame') : t('shameGuilt.guilt')}
                  </Badge>
                </div>
                {item.indicator && (
                  <p className="text-xs text-muted-foreground leading-relaxed mb-2">{item.indicator}</p>
                )}
                {item.reference && (
                  <p className="text-[10px] font-medium text-foreground/70 mb-1.5">
                    <span className="text-muted-foreground">{t('shameGuilt.reference')}: </span>{item.reference}
                  </p>
                )}
                {item.recommendation && (
                  <div className="mt-1.5 rounded-md bg-emerald-500/8 border border-emerald-500/20 px-2.5 py-2">
                    <p className="text-[10px] font-semibold text-emerald-400 mb-0.5">{t('shameGuilt.recommendation')}</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">{item.recommendation}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}