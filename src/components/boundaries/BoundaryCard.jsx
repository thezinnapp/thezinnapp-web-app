import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useHaptic } from '@/hooks/useHaptic';
import { useTranslation } from '@/hooks/useTranslation';
import { useTranslatedJson } from '@/hooks/useTranslatedJson';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const typeColors = {
  physical: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
  emotional: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
  time: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  sexual: 'bg-pink-500/15 text-pink-400 border-pink-500/30',
  material: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  digital: 'bg-violet-500/15 text-violet-400 border-violet-500/30',
  intellectual: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',
  spiritual: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30',
  conversational: 'bg-orange-500/15 text-orange-400 border-orange-500/30',
  internal: 'bg-fuchsia-500/15 text-fuchsia-400 border-fuchsia-500/30',
};

export default function BoundaryCard({ boundary, onDelete, index = 0 }) {
  const { t } = useTranslation();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const { tap, warning } = useHaptic();
  const translatedFields = useTranslatedJson({
    title: boundary.title,
    description: boundary.description,
    related_belief: boundary.related_belief,
    boundary_script: boundary.boundary_script,
    action_steps: boundary.action_steps,
  });
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Card className="group border-border/50 hover:shadow-lg transition-all duration-300">
         <CardContent className="p-5">
           <div className="flex items-start justify-between gap-3 mb-3">
             <Badge variant="outline" className={`${typeColors[boundary.boundary_type] || typeColors.emotional} border text-xs capitalize`}>
               {t(`boundaries.types.${boundary.boundary_type}`)}
             </Badge>
             <Button
               variant="ghost"
               size="icon"
               className="opacity-0 group-hover:opacity-100 transition-opacity h-9 w-9 text-muted-foreground hover:text-destructive"
               onClick={() => { warning(); setShowDeleteDialog(true); }}
             >
               <Trash2 className="w-4 h-4" />
             </Button>
           </div>

          <h3 className="font-semibold text-sm mb-2">{translatedFields.title}</h3>
                     <p className="text-sm text-muted-foreground leading-relaxed mb-3">{translatedFields.description}</p>

          {boundary.related_belief && (
            <div className="bg-legacy-accent/5 border border-legacy-accent/10 rounded-lg px-3 py-2 mb-3">
              <p className="text-xs text-muted-foreground">
                <span className="font-medium text-legacy-accent">{t('boundaries.supports')}</span> {translatedFields.related_belief}
              </p>
            </div>
          )}

          {boundary.boundary_script && (
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2 mb-2">
              <p className="text-xs font-medium text-amber-500 mb-1">{t('boundaries.whatToSay')}</p>
              <p className="text-sm italic">"{translatedFields.boundary_script}"</p>
            </div>
          )}

          {boundary.action_steps && (
            <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg px-3 py-2">
              <p className="text-xs font-medium text-orange-500 mb-1">{t('boundaries.actionSteps')}</p>
              <p className="text-xs leading-relaxed">{translatedFields.action_steps}</p>
            </div>
          )}
        </CardContent>
        </Card>

        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t('boundaries.deleteTitle')}</AlertDialogTitle>
          <AlertDialogDescription>
            {t('boundaries.deleteDesc', { title: translatedFields.title })}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => { tap(); onDelete(boundary.id); }}
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