import { Moon, Sun, Smartphone } from 'lucide-react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { useTranslation } from '@/hooks/useTranslation';

export default function ThemeDialog({ open, onOpenChange, theme, onThemeChange }) {
  const { t } = useTranslation();
  const options = [
    { value: 'light', label: t('settings.light'), icon: Sun },
    { value: 'dark', label: t('settings.dark'), icon: Moon },
    { value: 'auto', label: t('settings.auto'), icon: Smartphone },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sun className="w-4 h-4" /> {t('settingsDialogs.themeTitle')}
          </DialogTitle>
          <DialogDescription>
            {t('settingsDialogs.themeDesc')}
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-2">
          {options.map((opt) => {
            const Icon = opt.icon;
            const isSelected = theme === opt.value;
            return (
              <button
                key={opt.value}
                onClick={() => {
                  onThemeChange(opt.value);
                  onOpenChange(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg border-2 transition-all ${
                  isSelected
                    ? 'border-primary bg-primary/10'
                    : 'border-border hover:border-border/70 hover:bg-muted/30'
                }`}
              >
                <Icon className="w-5 h-5" />
                <div className="text-left">
                  <p className="font-medium text-sm">{opt.label}</p>
                  {opt.value === 'auto' && (
                    <p className="text-xs text-muted-foreground">{t('settingsDialogs.autoDesc')}</p>
                  )}
                </div>
                {isSelected && (
                  <div className="ml-auto w-2 h-2 rounded-full bg-primary" />
                )}
              </button>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}