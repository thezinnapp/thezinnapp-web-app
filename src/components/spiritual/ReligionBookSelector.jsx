import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Church, BookOpen, Languages } from 'lucide-react';
import {
  RELIGIONS,
  getReligion,
  getBook,
  DEFAULT_RELIGION,
  DEFAULT_BOOK,
  DEFAULT_TRANSLATION,
} from '@/lib/spiritualData';
import { useTranslation } from '@/hooks/useTranslation';

// Reusable dropdown for a list of options
const ACCENT_STYLES = {
  primary: 'text-primary font-semibold bg-primary/5',
  accent: 'text-accent font-semibold bg-accent/5',
};

function Dropdown({ label, icon: Icon, value, options, onSelect, accentColor = 'primary' }) {
  const [open, setOpen] = useState(false);
  const selected = options.find(o => o.code === value);
  const activeClass = ACCENT_STYLES[accentColor] || ACCENT_STYLES.primary;

  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold text-white uppercase tracking-wide flex items-center gap-1.5">
        <Icon className="w-3 h-3" /> {label}
      </label>
      <div className="relative">
        <button
          onClick={() => setOpen(v => !v)}
          className="select-none w-full flex items-center justify-between px-3 py-2.5 rounded-xl border border-border bg-muted/30 text-sm hover:bg-muted/60 transition-colors"
        >
          <span className="truncate">{selected?.label || value}</span>
          <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform shrink-0 ${open ? 'rotate-180' : ''}`} />
        </button>
        <AnimatePresence>
          {open && (
            <>
              <div className="fixed inset-0 z-20" onClick={() => setOpen(false)} />
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="absolute z-30 top-full mt-1 w-full rounded-xl border border-border bg-card shadow-xl overflow-hidden max-h-60 overflow-y-auto"
              >
                {options.map(o => (
                  <button
                    key={o.code}
                    onClick={() => { onSelect(o.code); setOpen(false); }}
                    className={`select-none w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-muted/60 ${
                      value === o.code ? activeClass : 'text-foreground'
                    }`}
                  >
                    {o.label}
                  </button>
                ))}
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// Shared Religion / Book / Translation selector
// Props: religion, book, translation, onChange({religion, book, translation})
export default function ReligionBookSelector({ religion, book, translation, onChange }) {
  const { t } = useTranslation();
  const currentReligion = useMemo(() => getReligion(religion), [religion]);
  const currentBook = useMemo(() => getBook(religion, book), [religion, book]);

  const handleReligionChange = (newReligionCode) => {
    const newReligion = getReligion(newReligionCode);
    const newBook = newReligion.books[0];
    const newTranslation = newBook.translations[0];
    onChange({ religion: newReligionCode, book: newBook.code, translation: newTranslation.code });
  };

  const handleBookChange = (newBookCode) => {
    const newBook = getBook(religion, newBookCode);
    const newTranslation = newBook.translations[0];
    onChange({ religion, book: newBookCode, translation: newTranslation.code });
  };

  const handleTranslationChange = (newTranslationCode) => {
    onChange({ religion, book, translation: newTranslationCode });
  };

  return (
    <div className="space-y-3">
      <Dropdown
        label={t('spiritualData.religionFaith')}
        icon={Church}
        value={religion}
        options={RELIGIONS.map(r => ({ code: r.code, label: t('spiritualData.religions.' + r.code) }))}
        onSelect={handleReligionChange}
        accentColor="primary"
      />
      <Dropdown
        label={t('spiritualData.referencedBook')}
        icon={BookOpen}
        value={book}
        options={currentReligion.books.map(b => ({ code: b.code, label: t('spiritualData.books.' + b.code) }))}
        onSelect={handleBookChange}
        accentColor="primary"
      />
      <Dropdown
        label={t('spiritualData.translationVersion')}
        icon={Languages}
        value={translation}
        options={currentBook.translations.map(tr => ({ code: tr.code, label: t('spiritualData.translations.' + tr.code) }))}
        onSelect={handleTranslationChange}
        accentColor="accent"
      />
    </div>
  );
}

export { DEFAULT_RELIGION, DEFAULT_BOOK, DEFAULT_TRANSLATION };