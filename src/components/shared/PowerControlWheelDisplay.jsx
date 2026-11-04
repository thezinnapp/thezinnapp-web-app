import { AlertTriangle, Shield } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useTranslation } from '@/hooks/useTranslation';
import { useTranslatedJson } from '@/hooks/useTranslatedJson';

const COMPONENT_COLORS = {
  'Physical Violence': 'border-red-600/40 bg-red-600/5',
  'Sexual Violence': 'border-red-700/40 bg-red-700/5',
  'Threats & Intimidation': 'border-orange-600/40 bg-orange-600/5',
  'Emotional Abuse': 'border-rose-600/40 bg-rose-600/5',
  'Isolation': 'border-amber-600/40 bg-amber-600/5',
  'Minimizing, Denying & Blaming': 'border-yellow-600/40 bg-yellow-600/5',
  'Using Children': 'border-red-500/40 bg-red-500/5',
  'Economic Abuse': 'border-orange-500/40 bg-orange-500/5',
};

const RISK_COLORS = {
  'high': 'bg-red-500/20 text-red-400 border-red-500/30',
  'medium': 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  'low': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
};

export default function PowerControlWheelDisplay({ warnings }) {
  const { t } = useTranslation();
  const translatedWarnings = useTranslatedJson(warnings);
  if (!warnings || warnings.length === 0) return null;

  let parsedWarnings = translatedWarnings;
  if (typeof translatedWarnings === 'string') {
    try {
      parsedWarnings = JSON.parse(translatedWarnings);
    } catch {
      return null;
    }
  }

  if (!Array.isArray(parsedWarnings) || parsedWarnings.length === 0) return null;

  const highRiskCount = parsedWarnings.filter(w => w.risk_level === 'high').length;

  return (
    <Card className="border-2 border-red-600/30 bg-red-600/5">
      <CardContent className="p-4">
        <div className="flex items-start gap-3 mb-4">
          <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="font-semibold text-sm text-red-400 mb-1">{t('powerControlWheel.title')}</h4>
            <p className="text-xs text-muted-foreground">
              {highRiskCount > 0
                ? t('powerControlWheel.highRiskWarning', { count: highRiskCount, s: highRiskCount > 1 ? 's' : '' })
                : t('powerControlWheel.generalWarning')}
            </p>
          </div>
        </div>

        <div className="space-y-2">
          {parsedWarnings.map((warning, idx) => (
            <div
              key={idx}
              className={`rounded-lg border p-3 ${COMPONENT_COLORS[warning.component] || 'border-border bg-muted/30'}`}
            >
              <div className="flex items-start gap-2 mb-2">
                <Shield className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-red-500" />
                <div className="flex-1">
                  <p className="font-semibold text-sm mb-1">{warning.component}</p>
                  <Badge
                    className={`text-[10px] font-semibold capitalize ${RISK_COLORS[warning.risk_level] || ''}`}
                  >
                    {t('powerControlWheel.riskLevel', { level: warning.risk_level })}
                  </Badge>
                </div>
              </div>
              {warning.indicator && (
                <p className="text-xs text-muted-foreground mb-2 pl-5">{warning.indicator}</p>
              )}
              {warning.recommendation && (
                <div className="mt-2 pl-5 border-l-2 border-emerald-500/30 bg-emerald-500/5 px-3 py-2 rounded">
                  <p className="text-[10px] font-semibold text-emerald-400 mb-1">{t('powerControlWheel.recommendation')}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">{warning.recommendation}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-4 p-3 rounded-lg bg-blue-500/8 border border-blue-500/20">
          <p className="text-xs text-muted-foreground leading-relaxed">
            <span className="font-semibold text-blue-400">{t('powerControlWheel.resources')} </span>
            {t('powerControlWheel.resourcesText')}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}