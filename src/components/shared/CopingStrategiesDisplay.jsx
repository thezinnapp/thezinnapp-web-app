import { LifeBuoy } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useTranslation } from '@/hooks/useTranslation';
import { useTranslatedJson } from '@/hooks/useTranslatedJson';

export default function CopingStrategiesDisplay({ strategies }) {
  const { t } = useTranslation();
  const translatedStrategies = useTranslatedJson(strategies);
  if (!strategies) return null;

  let parsed = translatedStrategies;
  if (typeof translatedStrategies === 'string') {
    try {
      parsed = JSON.parse(translatedStrategies);
    } catch {
      return null;
    }
  }

  if (!Array.isArray(parsed) || parsed.length === 0) return null;

  return (
    <Card className="border-2 border-indigo-500/20 bg-indigo-500/5">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <LifeBuoy className="w-4 h-4 text-indigo-400" />
          <h4 className="font-semibold text-sm">{t('copingStrategies.title')}</h4>
        </div>
        <div className="space-y-2">
          {parsed.map((item, idx) => (
            <div key={idx} className="rounded-lg border border-indigo-500/30 bg-indigo-500/5 p-3 text-sm">
              {item.strategy && (
                <p className="text-xs font-semibold text-indigo-400 mb-1.5">{item.strategy}</p>
              )}
              {item.addresses && (
                <p className="text-[10px] font-medium text-foreground/70 mb-1.5">
                  <span className="text-muted-foreground">{t('copingStrategies.addresses')}: </span>{item.addresses}
                </p>
              )}
              {item.steps && (
                <div className="mt-1.5 rounded-md bg-emerald-500/8 border border-emerald-500/20 px-2.5 py-2">
                  <p className="text-[10px] font-semibold text-emerald-400 mb-0.5">{t('copingStrategies.steps')}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">{item.steps}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}