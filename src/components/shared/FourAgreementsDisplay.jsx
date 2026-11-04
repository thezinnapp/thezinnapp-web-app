import { BookOpen } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useTranslation } from '@/hooks/useTranslation';
import { useTranslatedJson } from '@/hooks/useTranslatedJson';

const AGREEMENT_COLORS = {
  'Be Impeccable with Your Word': 'border-blue-500/30 bg-blue-500/5',
  "Don't Take Anything Personally": 'border-purple-500/30 bg-purple-500/5',
  "Don't Make Assumptions": 'border-amber-500/30 bg-amber-500/5',
  'Always Do Your Best': 'border-emerald-500/30 bg-emerald-500/5',
};

export default function FourAgreementsDisplay({ agreements }) {
  const { t } = useTranslation();
  const translatedAgreements = useTranslatedJson(agreements);
  if (!agreements || agreements.length === 0) return null;

  let parsedAgreements = translatedAgreements;
  if (typeof translatedAgreements === 'string') {
    try {
      parsedAgreements = JSON.parse(translatedAgreements);
    } catch {
      return null;
    }
  }

  if (!Array.isArray(parsedAgreements) || parsedAgreements.length === 0) return null;

  return (
    <Card className="border-2 border-primary/20 bg-primary/5">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <BookOpen className="w-4 h-4 text-primary" />
          <h4 className="font-semibold text-sm">{t('fourAgreements.title')}</h4>
        </div>
        <div className="space-y-2">
          {parsedAgreements.map((item, idx) => (
            <div
              key={idx}
              className={`rounded-lg border p-3 text-sm ${AGREEMENT_COLORS[item.agreement] || 'border-border bg-muted/30'}`}
            >
              <p className="font-medium mb-1">{item.agreement}</p>
              <p className="text-xs text-muted-foreground leading-relaxed">{item.relevance}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}