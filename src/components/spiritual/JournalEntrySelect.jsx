import { useMemo } from 'react';
import MobileSelect from '@/components/shared/MobileSelect';
import { useTranslatedJson } from '@/hooks/useTranslatedJson';

export default function JournalEntrySelect({ entries, selectedEntryId, onSelect, placeholder }) {
  const translationInput = useMemo(() => {
    const obj = {};
    entries.forEach(e => {
      const raw = e.thoughts || e.reactions || '';
      obj[e.id] = raw.slice(0, 40);
    });
    return obj;
  }, [entries]);

  const translatedPreviews = useTranslatedJson(translationInput);

  const options = entries.map(e => {
    const raw = e.thoughts || e.reactions || '';
    const rawPreview = raw.slice(0, 40);
    const preview = translatedPreviews?.[e.id] || rawPreview;
    return {
      value: e.id,
      label: `${e.entry_date} — "${preview}${raw.length >= 40 ? '…' : ''}"`,
    };
  });

  return (
    <MobileSelect
      value={selectedEntryId || (entries[0]?.id ?? '')}
      onValueChange={onSelect}
      options={options}
      placeholder={placeholder}
    />
  );
}