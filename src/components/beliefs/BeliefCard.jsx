import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2, Lightbulb, Quote, BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';
import { useHaptic } from '@/hooks/useHaptic';
import { useTranslation } from '@/hooks/useTranslation';
import { useTranslatedJson } from '@/hooks/useTranslatedJson';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const typeConfig = {
  belief: { icon: Lightbulb, color: 'bg-purple-500/15 text-purple-400 border-purple-500/30' },
  affirmation: { icon: Quote, color: 'bg-chart-2/10 text-chart-2 border-chart-2/20' },
  philosophy: { icon: BookOpen, color: 'bg-chart-3/10 text-chart-3 border-chart-3/20' },
};

const categoryConfig = {
  'pro-social': 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  'anti-social': 'bg-red-500/15 text-red-400 border-red-500/30',
};

export default function BeliefCard({ belief, onDelete, index = 0 }) {
  const { t } = useTranslation();
  const translatedFields = useTranslatedJson({
    content: belief.content,
    correlated_affirmation: belief.correlated_affirmation,
    correlated_philosophy: belief.correlated_philosophy,
    explanation: belief.explanation,
  });
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const { tap, warning } = useHaptic();
  const config = typeConfig[belief.type] || typeConfig.belief;
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Card className="group hover:shadow-lg transition-all duration-300 border-border/50 hover:border-primary/20">
        <CardContent className="p-5">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="outline" className={`${config.color} border text-xs`}>
                <Icon className="w-3 h-3 mr-1" />
                {t(`common.${belief.type}`)}
              </Badge>
              {belief.category && (
                <Badge variant="outline" className={`${categoryConfig[belief.category]} border text-xs`}>
                  {belief.category === 'pro-social' ? t('common.proSocial') : t('common.antiSocial')}
                </Badge>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="opacity-0 group-hover:opacity-100 transition-opacity h-9 w-9 text-muted-foreground hover:text-destructive"
              onClick={() => { warning(); setShowDeleteDialog(true); }}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>

          <p className="font-medium text-sm leading-relaxed mb-3">{translatedFields.content}</p>

          {belief.correlated_affirmation && (
            <div className="bg-muted/50 rounded-lg p-3 mb-2 space-y-2">
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">{t('beliefs.correlatedAffirmation')}</p>
                <p className="text-sm italic">"{translatedFields.correlated_affirmation}"</p>
              </div>
              {belief.correlated_philosophy && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">{t('beliefs.correlatedPhilosophy')}</p>
                  <p className="text-sm italic">"{translatedFields.correlated_philosophy}"</p>
                </div>
              )}
            </div>
          )}

          {belief.explanation && (
            <p className="text-xs text-muted-foreground leading-relaxed">{translatedFields.explanation}</p>
          )}
          </CardContent>
          </Card>

          <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('beliefs.deleteTitle')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('beliefs.deleteDesc')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => { tap(); onDelete(belief.id); }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t('common.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
          </AlertDialogContent>
          </AlertDialog>
          </motion.div>
          );
          }