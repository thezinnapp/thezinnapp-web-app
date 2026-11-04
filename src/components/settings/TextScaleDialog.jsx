import { Slider } from "@/components/ui/slider";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Eye, RotateCcw } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";

const MIN = 85;
const MAX = 130;
const DEFAULT = 130;

export default function TextScaleDialog({ open, onOpenChange, textScale, onScaleChange, onReset }) {
  const { t } = useTranslation();
  const percentage = Math.round(textScale * 100);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Eye className="w-4 h-4" /> {t('settingsDialogs.textSizeTitle')}
          </DialogTitle>
          <DialogDescription>
            {t('settingsDialogs.textSizeDesc')}
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-5">
          <div className="flex items-end justify-center">
            <span className="text-xs text-muted-foreground mr-4">A</span>
            <span className="text-3xl font-semibold tabular-nums">{percentage}%</span>
            <span className="text-xl text-muted-foreground ml-4">A</span>
          </div>
          <Slider
            value={[percentage]}
            min={MIN}
            max={MAX}
            step={5}
            onValueChange={(val) => onScaleChange(val[0] / 100)}
          />
          <div className="flex justify-between text-[10px] text-muted-foreground">
            <span>{t('settingsDialogs.small')}</span>
            <span>{t('settingsDialogs.default')}</span>
            <span>{t('settingsDialogs.extraLarge')}</span>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onReset} disabled={percentage === DEFAULT}>
            <RotateCcw className="w-4 h-4 mr-2" /> {t('settingsDialogs.resetToDefault')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}