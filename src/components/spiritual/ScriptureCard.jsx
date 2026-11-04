import { motion } from 'framer-motion';
import { BookOpen, Brain, Lightbulb } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';

export default function ScriptureCard({ item, type, index }) {
  const { t } = useTranslation();
  const isProSocial = type === 'pro';

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
      className={`rounded-xl border p-4 space-y-3 ${
        isProSocial
          ? 'bg-emerald-500/5 border-emerald-500/20'
          : 'bg-red-500/5 border-red-500/20'
      }`}
    >
      <div className="space-y-1">
        <div className="flex items-center gap-1.5">
          <BookOpen className={`w-3.5 h-3.5 ${isProSocial ? 'text-emerald-400' : 'text-red-400'}`} />
          <span className={`text-xs font-bold ${isProSocial ? 'text-emerald-400' : 'text-red-400'}`}>
            {item.reference}
          </span>
        </div>
        <p className="text-sm italic text-foreground/90 leading-relaxed">"{item.text}"</p>
        {item.context && (
          <p className="text-xs text-muted-foreground">{item.context}</p>
        )}
      </div>

      <div className={`h-px ${isProSocial ? 'bg-emerald-500/20' : 'bg-red-500/20'}`} />

      {item.affirmation && (
        <div className="space-y-1">
          <div className="flex items-center gap-1.5">
            <Brain className="w-3.5 h-3.5 text-primary" />
              <span className="text-xs font-semibold text-primary">{t('spiritual.psychologicalAffirmation')}</span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">{item.affirmation}</p>
        </div>
      )}

      {item.philosophy && (
        <div className="space-y-1">
          <div className="flex items-center gap-1.5">
            <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-xs font-semibold text-amber-400">{t('spiritual.parallelPhilosophy')}</span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">{item.philosophy}</p>
        </div>
      )}
    </motion.div>
  );
}