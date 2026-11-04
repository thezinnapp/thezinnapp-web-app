import { useState, useMemo } from 'react';
import { toast } from '@/components/ui/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AnimatePresence, motion } from 'framer-motion';
import { Sparkles, BookOpen, ChevronDown, ChevronUp, Trash2, BookMarked, Flag } from 'lucide-react';
import AILoadingOverlay from '@/components/shared/AILoadingOverlay';
import ScriptureCard from '@/components/spiritual/ScriptureCard';
import CognitiveBiasesDisplay from '@/components/shared/CognitiveBiasesDisplay';
import ThankYouPowerDisplay from '@/components/shared/ThankYouPowerDisplay';
import ScriptureLookupCard from '@/components/spiritual/ScriptureLookupCard';
import JournalEntrySelect from '@/components/spiritual/JournalEntrySelect';
import SelectedEntryPreview from '@/components/spiritual/SelectedEntryPreview';
import PullToRefreshWrapper from '@/components/shared/PullToRefreshWrapper';
import ReligionBookSelector, { DEFAULT_RELIGION, DEFAULT_BOOK, DEFAULT_TRANSLATION } from '@/components/spiritual/ReligionBookSelector';
import { getReligionLabel, getBookLabel, getTranslationLabel } from '@/lib/spiritualData';
import { useTranslation } from '@/hooks/useTranslation';
import { useTranslatedJson } from '@/hooks/useTranslatedJson';
import { getLanguageInstruction, COGNITIVE_BIASES_PROMPT, COGNITIVE_BIASES_SCHEMA, THANK_YOU_POWER_PROMPT, THANK_YOU_POWER_SCHEMA } from '@/lib/aiLanguage';
import { useScrollToNew } from '@/hooks/useScrollToNew';

function getNow() {
  const now = new Date();
  const pad = n => String(n).padStart(2, '0');
  return {
    date: `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`,
    time: `${pad(now.getHours())}:${pad(now.getMinutes())}`,
    day: now.toLocaleDateString('en-US', { weekday: 'long' }),
    month: now.getMonth() + 1,
    year: now.getFullYear(),
    dayOfMonth: now.getDate(),
  };
}

function parseScriptures(jsonStr) {
  if (!jsonStr) return [];
  try { return JSON.parse(jsonStr); } catch { return []; }
}

function ReflectionCard({ reflection, onDelete, index, t }) {
  const [expanded, setExpanded] = useState(false);
  const translatedFields = useTranslatedJson({
    thoughts_text: reflection.thoughts_text,
    spiritual_summary: reflection.spiritual_summary,
  });
  const translatedProSocial = useTranslatedJson(reflection.pro_social_scriptures);
  const translatedAntiSocial = useTranslatedJson(reflection.anti_social_scriptures);
  const proScriptures = parseScriptures(translatedProSocial);
  const antiScriptures = parseScriptures(translatedAntiSocial);

  const religionLabel = t('spiritualData.religions.' + (reflection.religion || 'christianity'));
  const bookLabel = t('spiritualData.books.' + (reflection.referenced_book || 'holy_bible'));
  const translationLabel = t('spiritualData.translations.' + (reflection.bible_translation || 'NIV'));

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
      <Card className="border-border/50">
        <CardHeader
          className="pb-2 cursor-pointer active:bg-muted/40 transition-colors select-none"
          onClick={() => setExpanded(v => !v)}
        >
          <div className="flex items-start justify-between gap-2">
            <div className="space-y-1 min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="outline" className="text-[10px] text-legacy-primary border-legacy-primary/30 bg-legacy-primary/5">
                  {religionLabel}
                </Badge>
                <Badge variant="outline" className="text-[10px] text-legacy-accent border-legacy-accent/30 bg-legacy-accent/5">
                  {translationLabel}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {t('days.' + (reflection.day_of_week || '').toLowerCase())}, {reflection.entry_date} · {reflection.entry_time}
                </span>
              </div>
              {reflection.thoughts_text && (
                <p className="text-sm text-foreground/80 line-clamp-2">
                  <span className="font-medium text-white">{t('common.thoughts')} </span>{translatedFields.thoughts_text}
                </p>
              )}
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={(e) => { e.stopPropagation(); setExpanded(v => !v); }}
                className="select-none p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
                aria-label={expanded ? t('common.collapse') : t('common.expand')}
              >
                {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onDelete(reflection.id); }}
                className="select-none p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                aria-label={t('spiritual.deleteReflection')}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </CardHeader>

        {expanded && (
          <CardContent className="space-y-4 pt-0">
            <div className="rounded-xl bg-legacy-primary/5 border border-legacy-primary/15 p-3">
              <p className="text-xs font-semibold text-legacy-primary mb-1 flex items-center gap-1.5">
                <BookMarked className="w-3.5 h-3.5" /> {bookLabel}
              </p>
            </div>

            {reflection.spiritual_summary && (
              <div className="rounded-xl bg-legacy-primary/5 border border-legacy-primary/15 p-3">
                <p className="text-xs font-semibold text-legacy-primary mb-1 flex items-center gap-1.5">
                  <BookMarked className="w-3.5 h-3.5" /> {t('spiritual.spiritualOverview')}
                </p>
                <p className="text-xs text-muted-foreground leading-relaxed">{translatedFields.spiritual_summary}</p>
              </div>
            )}

            {proScriptures.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 uppercase tracking-wide">
                  <Flag className="w-3 h-3" style={{ fill: 'currentColor' }} /> {t('spiritual.proSocialEncouragement')}
                </p>
                {proScriptures.map((s, i) => (
                  <ScriptureCard key={i} item={s} type="pro" index={i} />
                ))}
              </div>
            )}

            {antiScriptures.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-bold text-red-400 flex items-center gap-1.5 uppercase tracking-wide">
                  <Flag className="w-3 h-3" style={{ fill: 'currentColor' }} /> {t('spiritual.antiSocialCaution')}
                </p>
                {antiScriptures.map((s, i) => (
                  <ScriptureCard key={i} item={s} type="anti" index={i} />
                ))}
              </div>
            )}
            {reflection.cognitive_biases_analysis && (
              <CognitiveBiasesDisplay analysis={reflection.cognitive_biases_analysis} />
            )}
            {reflection.thank_you_power_analysis && (
              <ThankYouPowerDisplay analysis={reflection.thank_you_power_analysis} />
            )}
            </CardContent>
        )}
      </Card>
    </motion.div>
  );
}

export default function Spiritual() {
  const { t, language } = useTranslation();
  const now = useMemo(() => getNow(), []);
  const [religion, setReligion] = useState(DEFAULT_RELIGION);
  const [book, setBook] = useState(DEFAULT_BOOK);
  const [translation, setTranslation] = useState(DEFAULT_TRANSLATION);
  const [selectedEntryId, setSelectedEntryId] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const queryClient = useQueryClient();

  const { data: entries = [] } = useQuery({
    queryKey: ['journal-entries'],
    queryFn: () => base44.entities.JournalEntry.list('-created_date'),
  });

  const { data: reflections = [], isLoading, refetch } = useQuery({
    queryKey: ['spiritual-reflections'],
    queryFn: () => base44.entities.SpiritualReflection.list('-created_date'),
  });

  const setScrollTargetId = useScrollToNew('data-reflection-id', reflections);

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.SpiritualReflection.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['spiritual-reflections'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.SpiritualReflection.delete(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['spiritual-reflections'] });
      const prev = queryClient.getQueryData(['spiritual-reflections']);
      queryClient.setQueryData(['spiritual-reflections'], old => (old || []).filter(r => r.id !== id));
      return { prev };
    },
    onError: (_, __, ctx) => queryClient.setQueryData(['spiritual-reflections'], ctx.prev),
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['spiritual-reflections'] }),
  });

  const handleReplaceInReflection = async (reflectionId, scriptureResult, usedTranslation, usedReligion, usedBook) => {
    const reflection = reflections.find(r => r.id === reflectionId);
    if (!reflection) throw new Error('Reflection not found');

    const newScripture = {
      reference: scriptureResult.reference,
      text: scriptureResult.text,
      context: scriptureResult.context || '',
      affirmation: scriptureResult.affirmation,
      philosophy: scriptureResult.philosophy,
    };

    const isProSocial = scriptureResult.category === 'pro-social';
    const proSocial = parseScriptures(reflection.pro_social_scriptures);
    const antiSocial = parseScriptures(reflection.anti_social_scriptures);

    const updatedData = {
      religion: usedReligion,
      referenced_book: usedBook,
      bible_translation: usedTranslation,
      pro_social_scriptures: JSON.stringify(isProSocial ? [newScripture] : proSocial),
      anti_social_scriptures: JSON.stringify(isProSocial ? antiSocial : [newScripture]),
    };

    await base44.entities.SpiritualReflection.update(reflectionId, updatedData);
    await queryClient.invalidateQueries({ queryKey: ['spiritual-reflections'] });
  };

  const eligibleEntries = useMemo(
    () => entries.filter(e => e.thoughts || e.reactions),
    [entries]
  );

  const selectedEntry = useMemo(
    () => eligibleEntries.find(e => e.id === selectedEntryId) || eligibleEntries[0] || null,
    [eligibleEntries, selectedEntryId]
  );

  const handleGenerate = async () => {
    if (!selectedEntry) return;
    setIsGenerating(true);
    try {

    const religionLabel = getReligionLabel(religion);
    const bookLabel = getBookLabel(religion, book);
    const translationLabel = getTranslationLabel(religion, book, translation);

    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `You are a spiritual counselor and psychologist with deep knowledge of ${religionLabel}. A person has written the following journal entry:

Thoughts: ${selectedEntry.thoughts || 'Not provided'}
Reactions: ${selectedEntry.reactions || 'Not provided'}

Date/Time Context: ${selectedEntry.day_of_week || ''}, ${selectedEntry.entry_date || ''} at ${selectedEntry.entry_time || ''} — Year ${now.year}

Using ${bookLabel} (${translationLabel} translation), perform the following:

1. Identify PRO-SOCIAL elements in the thoughts and reactions (growth, empathy, gratitude, love, courage, hope, etc.) and find 2-3 passages from ${bookLabel} that ENCOURAGE and AFFIRM those pro-social patterns. For each passage:
   - Provide the exact reference and text from the ${translationLabel} translation
   - Write a psychological affirmation (1-2 sentences) that parallels the passage's meaning
   - Write a parallel philosophy (1-2 sentences) from psychology/philosophy that mirrors the passage's wisdom

2. Identify ANTI-SOCIAL elements (fear, anger, blame, isolation, self-defeat, resentment, etc.) and find 2-3 passages from ${bookLabel} that WARN against and provide a corrective path for those patterns. For each passage:
   - Provide the exact reference and text from the ${translationLabel} translation
   - Write a psychological affirmation (1-2 sentences) that parallels the passage's corrective meaning
   - Write a parallel philosophy (1-2 sentences) from psychology/philosophy that mirrors the corrective wisdom

3. Write a brief spiritual overview (2-3 sentences) connecting this journal entry to the wisdom of ${religionLabel} as found in ${bookLabel}.

4. ${COGNITIVE_BIASES_PROMPT}

5. ${THANK_YOU_POWER_PROMPT}

Generate results that are fresh and specifically responsive to this particular entry's unique content.${getLanguageInstruction(language)}`,
      response_json_schema: {
        type: 'object',
        properties: {
          pro_social_scriptures: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                reference: { type: 'string' },
                text: { type: 'string' },
                context: { type: 'string' },
                affirmation: { type: 'string' },
                philosophy: { type: 'string' },
              },
            },
          },
          anti_social_scriptures: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                reference: { type: 'string' },
                text: { type: 'string' },
                context: { type: 'string' },
                affirmation: { type: 'string' },
                philosophy: { type: 'string' },
              },
            },
          },
          spiritual_summary: { type: 'string' },
          cognitive_biases_analysis: COGNITIVE_BIASES_SCHEMA,
          thank_you_power_analysis: THANK_YOU_POWER_SCHEMA,
        },
      },
    });

    const created = await createMutation.mutateAsync({
      source_entry_id: selectedEntry.id,
      entry_date: selectedEntry.entry_date,
      entry_time: selectedEntry.entry_time,
      day_of_week: selectedEntry.day_of_week,
      thoughts_text: selectedEntry.thoughts,
      reactions_text: selectedEntry.reactions,
      religion: religion,
      referenced_book: book,
      bible_translation: translation,
      pro_social_scriptures: JSON.stringify(result.pro_social_scriptures || []),
      anti_social_scriptures: JSON.stringify(result.anti_social_scriptures || []),
      spiritual_summary: result.spiritual_summary,
      cognitive_biases_analysis: JSON.stringify(result.cognitive_biases_analysis || []),
      thank_you_power_analysis: JSON.stringify(result.thank_you_power_analysis || []),
    });

    await queryClient.invalidateQueries({ queryKey: ['spiritual-reflections'] });
    await refetch();

    setScrollTargetId(created.id);
    } catch (err) {
      toast({ title: t('common.error'), description: err?.message || 'Analysis failed. Please try again.', variant: 'destructive' });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <AnimatePresence>
        {isGenerating && <AILoadingOverlay message={t('spiritual.analyzing')} />}
      </AnimatePresence>

      <div>
        <h1 className="text-3xl font-display font-bold tracking-tight">{t('spiritual.title')}</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          {t('spiritual.subtitle')}
        </p>
      </div>

      <Card className="border-border/50 bg-gradient-to-br from-card to-primary/5">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <BookMarked className="w-4 h-4 text-primary" />
            {t('spiritual.generateReflection')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <ReligionBookSelector
            religion={religion}
            book={book}
            translation={translation}
            onChange={({ religion: r, book: b, translation: tr }) => {
              setReligion(r);
              setBook(b);
              setTranslation(tr);
            }}
          />

           <div className="space-y-1.5">
             <label className="text-xs font-bold text-black dark:text-white uppercase tracking-wide">{t('spiritual.journalEntryToAnalyze')}</label>
            {eligibleEntries.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border p-4 text-center">
                <p className="text-xs text-muted-foreground">{t('spiritual.noEntries')}</p>
              </div>
            ) : (
              <JournalEntrySelect
                entries={eligibleEntries}
                selectedEntryId={selectedEntryId}
                onSelect={setSelectedEntryId}
                placeholder={t('spiritual.selectEntry')}
              />
            )}
            </div>

            <SelectedEntryPreview entry={selectedEntry} />

          <Button
            onClick={handleGenerate}
            disabled={isGenerating || !selectedEntry}
            className="w-full select-none gap-2"
          >
            <Sparkles className="w-4 h-4" />
            {t('spiritual.generateBtn')}
          </Button>
        </CardContent>
      </Card>

      <ScriptureLookupCard
        reflections={reflections}
        onReplaceInReflection={handleReplaceInReflection}
      />

      <div>
        <h2 className="text-base font-semibold mb-3 flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-primary" />
          {t('spiritual.reflections')}
        </h2>
        <PullToRefreshWrapper onRefresh={refetch}>
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2].map(i => <Card key={i} className="animate-pulse h-20" />)}
          </div>
        ) : reflections.length > 0 ? (
          <div className="space-y-3">
            {reflections.map((r, i) => (
              <div key={r.id} data-reflection-id={r.id} className="transition-shadow duration-500">
                <ReflectionCard
                  reflection={r}
                  onDelete={id => deleteMutation.mutate(id)}
                  index={i}
                  t={t}
                />
              </div>
            ))}
          </div>
        ) : (
          <Card className="border-dashed">
            <CardContent className="py-10 text-center space-y-2">
              <BookMarked className="w-8 h-8 text-muted-foreground/40 mx-auto" />
              <p className="text-sm text-muted-foreground">{t('spiritual.noReflections')}</p>
            </CardContent>
            </Card>
            )}
            </PullToRefreshWrapper>
            </div>
            </div>
            );
            }