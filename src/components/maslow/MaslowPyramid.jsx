import { motion } from 'framer-motion';
import { useTranslation } from '@/hooks/useTranslation';

const levels = [
  {
    key: 'self_actualization',
    labelKey: 'maslow.levels.selfActualization',
    sublabelKey: 'maslow.sublabels.selfActualization',
    color: 'from-violet-500/80 to-purple-600/80',
    border: 'border-violet-400/40',
    text: 'text-violet-100',
    width: 'w-[46%]',
    titleClass: 'text-[11px]',
    padding: 'px-2.5 py-2',
  },
  {
    key: 'esteem',
    labelKey: 'maslow.levels.esteem',
    sublabelKey: 'maslow.sublabels.esteem',
    color: 'from-blue-500/80 to-indigo-600/80',
    border: 'border-blue-400/40',
    text: 'text-blue-100',
    width: 'w-[56%]',
  },
  {
    key: 'love_belonging',
    labelKey: 'maslow.levels.loveBelonging',
    sublabelKey: 'maslow.sublabels.loveBelonging',
    color: 'from-emerald-500/80 to-teal-600/80',
    border: 'border-emerald-400/40',
    text: 'text-emerald-100',
    width: 'w-[72%]',
  },
  {
    key: 'safety',
    labelKey: 'maslow.levels.safety',
    sublabelKey: 'maslow.sublabels.safety',
    color: 'from-amber-500/80 to-orange-600/80',
    border: 'border-amber-400/40',
    text: 'text-amber-100',
    width: 'w-[86%]',
  },
  {
    key: 'physiological',
    labelKey: 'maslow.levels.physiological',
    sublabelKey: 'maslow.sublabels.physiological',
    color: 'from-rose-500/80 to-red-600/80',
    border: 'border-rose-400/40',
    text: 'text-rose-100',
    width: 'w-full',
  },
];

export default function MaslowPyramid({ analysis, primaryDeficit }) {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col items-center gap-1 py-4">
      {levels.map((level, i) => {
        const isDeficit = level.key === primaryDeficit;
        const content = analysis?.[level.key];
        return (
          <motion.div
            key={level.key}
            initial={{ opacity: 0, scaleX: 0.8 }}
            animate={{ opacity: 1, scaleX: 1 }}
            transition={{ delay: i * 0.08, duration: 0.4 }}
            className={`${level.width} relative`}
          >
            <div
              className={`
                bg-gradient-to-r ${level.color} border ${level.border}
                rounded-lg ${level.padding || 'px-4 py-3'} transition-all duration-300
                ${isDeficit ? 'ring-2 ring-white/50 shadow-lg shadow-white/10' : ''}
              `}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0 w-full">
                  <div className={`font-semibold ${level.titleClass || 'text-sm'} ${level.text} flex flex-wrap items-center gap-1`}>
                    <span className="break-words leading-tight">{t(level.labelKey)}</span>
                    {isDeficit && (
                      <span className="text-[9px] bg-white/20 rounded-full px-1.5 py-0.5 font-medium shrink-0 leading-tight">
                        {t('maslow.primaryDeficitBadge')}
                      </span>
                    )}
                  </div>
                  <div className={`text-[10px] opacity-75 ${level.text} break-words leading-tight`}>{t(level.sublabelKey)}</div>
                </div>
              </div>
              {content && (
                <div className={`mt-2 text-xs leading-relaxed ${level.text} opacity-90 max-h-28 overflow-y-auto pr-1 rounded`}>
                  <p>{content}</p>
                </div>
              )}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}