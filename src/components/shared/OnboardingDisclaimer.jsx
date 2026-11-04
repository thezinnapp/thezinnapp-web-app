import { useState } from 'react';
import { ShieldAlert, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import { useTranslation } from '@/hooks/useTranslation';
import { useHaptic } from '@/hooks/useHaptic';

export default function OnboardingDisclaimer({ onAccept }) {
  const { t } = useTranslation();
  const { tap } = useHaptic();
  const [accepted, setAccepted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleAccept = async () => {
    tap();
    setLoading(true);
    try {
      await base44.auth.updateMe({ has_accepted_disclaimer: true });
    } catch (e) {
      // proceed even if update fails
    } finally {
      setLoading(false);
      onAccept();
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-background flex flex-col" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
      <div className="flex-1 overflow-y-auto px-6 py-8">
        <div className="max-w-md mx-auto space-y-4">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0">
              <ShieldAlert className="w-6 h-6 text-amber-500" />
            </div>
            <div>
              <h1 className="text-lg font-heading font-bold leading-tight">{t('disclaimer.title')}</h1>
              <p className="text-xs text-muted-foreground mt-0.5">{t('disclaimer.notice')}</p>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-5 space-y-4">
            <p className="text-xs text-muted-foreground leading-relaxed">{t('disclaimer.intro')}</p>

            <div className="space-y-3">
              <div>
                <p className="text-xs font-semibold mb-1">{t('disclaimer.section1Title')}</p>
                <p className="text-xs text-muted-foreground leading-relaxed">{t('disclaimer.section1Body')}</p>
              </div>
              <div>
                <p className="text-xs font-semibold mb-1">{t('disclaimer.section2Title')}</p>
                <p className="text-xs text-muted-foreground leading-relaxed">{t('disclaimer.section2Body')}</p>
              </div>
              <div>
                <p className="text-xs font-semibold mb-1">{t('disclaimer.section3Title')}</p>
                <p className="text-xs text-muted-foreground leading-relaxed">{t('disclaimer.section3Body')}</p>
              </div>
              <div>
                <p className="text-xs font-semibold mb-1">{t('disclaimer.section4Title')}</p>
                <p className="text-xs text-muted-foreground leading-relaxed">{t('disclaimer.section4Body')}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-border p-6 pb-8 bg-card">
        <div className="max-w-md mx-auto space-y-4">
          <label className="flex items-start gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={accepted}
              onChange={(e) => { tap(); setAccepted(e.target.checked); }}
              className="w-5 h-5 rounded border-border mt-0.5 accent-primary shrink-0"
            />
            <span className="text-sm leading-relaxed">{t('disclaimer.acceptLabel')}</span>
          </label>
          <Button
            className="w-full h-12 font-medium"
            disabled={!accepted || loading}
            onClick={handleAccept}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {t('common.loading')}
              </>
            ) : (
              t('disclaimer.continueButton')
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}