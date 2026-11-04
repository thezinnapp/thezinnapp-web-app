import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Search, BookMarked, Flag, RefreshCw, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import VoiceInput from '@/components/shared/VoiceInput';
import MobileSelect from '@/components/shared/MobileSelect';
import ReligionBookSelector, { DEFAULT_RELIGION, DEFAULT_BOOK, DEFAULT_TRANSLATION } from '@/components/spiritual/ReligionBookSelector';
import { getReligionLabel, getBookLabel, getTranslationLabel } from '@/lib/spiritualData';
import { useTranslation } from '@/hooks/useTranslation';
import { getLanguageInstruction } from '@/lib/aiLanguage';

export default function ScriptureLookupCard({ reflections, onReplaceInReflection }) {
  const { t, language } = useTranslation();
  const [searchText, setSearchText] = useState('');
  const [religion, setReligion] = useState(DEFAULT_RELIGION);
  const [book, setBook] = useState(DEFAULT_BOOK);
  const [translation, setTranslation] = useState(DEFAULT_TRANSLATION);
  const [isSearching, setIsSearching] = useState(false);
  const [result, setResult] = useState(null);
  const [selectedReflectionId, setSelectedReflectionId] = useState('');
  const [isReplacing, setIsReplacing] = useState(false);

  const handleSearch = async () => {
    if (!searchText.trim()) {
      toast.error(t('scriptureLookup.enterSearchError'));
      return;
    }
    setIsSearching(true);
    setResult(null);

    const religionLabel = getReligionLabel(religion);
    const bookLabel = getBookLabel(religion, book);
    const translationLabel = getTranslationLabel(religion, book, translation);

    try {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a scholar of ${religionLabel} and a psychologist. The user has provided the following input — which may be an exact scripture reference, a partial quote, or a paraphrase of a passage they remember:

"${searchText}"

Using ${bookLabel} (${translationLabel} translation), perform the following:

1. IDENTIFY the passage the user is looking for. Match their input to the closest actual passage from ${bookLabel} — whether they gave a reference, a partial quote, or a paraphrase describing the meaning. Provide the exact reference and the full text from the ${translationLabel} translation.

2. DETERMINE whether this passage is PRO-SOCIAL (encouraging love, empathy, growth, gratitude, courage, hope, forgiveness, etc.) or ANTI-SOCIAL (warning against fear, anger, blame, greed, pride, destructive behavior, etc.). Most passages that warn against harmful behavior are corrective/anti-social cautions; those that encourage virtue are pro-social.

3. Generate a PSYCHOLOGICAL AFFIRMATION (1-2 sentences) that closely parallels the passage's meaning and perspective — written as a present-tense, first-person affirmation the user can internalize.

4. Generate a PARALLEL PHILOSOPHY (1-2 sentences) from psychology or philosophy that mirrors the passage's wisdom and perspective.

5. Write a brief CONTEXT note (1 sentence) explaining the passage's setting or audience.

Return the result as a single passage object.${getLanguageInstruction(language)}`,
        response_json_schema: {
          type: 'object',
          properties: {
            reference: { type: 'string', description: 'Exact passage reference' },
            text: { type: 'string', description: 'Full passage text from the selected translation' },
            context: { type: 'string', description: 'Brief context note' },
            affirmation: { type: 'string', description: 'Psychological affirmation paralleling the passage' },
            philosophy: { type: 'string', description: 'Parallel philosophy mirroring the passage' },
            category: { type: 'string', enum: ['pro-social', 'anti-social'], description: 'Whether the passage is pro-social encouragement or anti-social caution' },
            confidence: { type: 'string', description: 'Brief note on how confident the match is and what the input was interpreted as' },
          },
        },
      });

      setResult(res);
    } catch {
      toast.error(t('scriptureLookup.searchFailedError'));
    } finally {
      setIsSearching(false);
    }
  };

  const handleReplace = async () => {
    if (!selectedReflectionId) {
      toast.error(t('scriptureLookup.selectReflectionError'));
      return;
    }
    if (!result) return;

    setIsReplacing(true);
    try {
      await onReplaceInReflection(selectedReflectionId, result, translation, religion, book);
      toast.success(t('scriptureLookup.replaceSuccess'));
      setResult(null);
      setSearchText('');
    } catch {
      toast.error(t('scriptureLookup.replaceFailedError'));
    } finally {
      setIsReplacing(false);
    }
  };

  return (
    <Card className="border-border/50 bg-gradient-to-br from-card to-accent/5">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Search className="w-4 h-4 text-accent" />
          {t('scriptureLookup.title')}
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          {t('scriptureLookup.subtitle')}
        </p>
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
          <label className="text-xs font-semibold text-white uppercase tracking-wide">{t('scriptureLookup.referenceLabel')}</label>
          <div className="flex gap-2 items-end">
            <Textarea
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
              placeholder={t('scriptureLookup.placeholder')}
              className="flex-1 min-h-[80px] resize-none"
            />
            <VoiceInput onTranscript={(tr) => setSearchText(prev => (prev ? prev + ' ' + tr : tr))} />
          </div>
        </div>

        <Button
          onClick={handleSearch}
          disabled={isSearching || !searchText.trim()}
          className="w-full select-none gap-2"
        >
          <Search className="w-4 h-4" />
          {isSearching ? t('scriptureLookup.searching') : t('scriptureLookup.findScripture')}
        </Button>

        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="space-y-3"
            >
              <div className="rounded-xl border border-border bg-muted/20 p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-display font-semibold text-sm text-foreground">{result.reference}</p>
                    <Badge
                      variant="outline"
                      className={`mt-1 text-[10px] ${
                        result.category === 'pro-social'
                          ? 'text-emerald-400 border-emerald-500/30 bg-emerald-500/15'
                          : 'text-red-400 border-red-500/30 bg-red-500/15'
                      }`}
                    >
                      <Flag className="w-2.5 h-2.5 mr-1" style={{ fill: 'currentColor' }} />
                      {result.category === 'pro-social' ? t('scriptureLookup.proSocialBadge') : t('scriptureLookup.antiSocialCautionBadge')}
                    </Badge>
                  </div>
                  <Badge variant="outline" className="text-[10px] text-accent border-accent/30 bg-accent/5">
                    {t('spiritualData.translations.' + translation)}
                  </Badge>
                </div>

                <p className="text-sm text-foreground/90 italic leading-relaxed">"{result.text}"</p>

                {result.context && (
                  <p className="text-xs text-muted-foreground">{result.context}</p>
                )}

                {result.confidence && (
                  <p className="text-[10px] text-muted-foreground/60 italic">{result.confidence}</p>
                )}

                <div className="rounded-lg bg-accent/5 border border-accent/15 p-3 space-y-2">
                  <div>
                    <p className="text-xs font-semibold text-accent mb-0.5">{t('scriptureLookup.psychologicalAffirmation')}</p>
                    <p className="text-xs text-foreground/80 leading-relaxed">{result.affirmation}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-accent mb-0.5">{t('scriptureLookup.parallelPhilosophy')}</p>
                    <p className="text-xs text-foreground/80 leading-relaxed">{result.philosophy}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2 rounded-xl border border-primary/20 bg-primary/5 p-3">
                <p className="text-xs font-semibold text-primary flex items-center gap-1.5">
                  <RefreshCw className="w-3 h-3" /> {t('scriptureLookup.replaceInReflection')}
                </p>
                <MobileSelect
                  value={selectedReflectionId}
                  onValueChange={setSelectedReflectionId}
                  options={[
                    { value: '', label: t('scriptureLookup.selectReflection') },
                    ...reflections.map(r => ({
                      value: r.id,
                      label: `${r.entry_date} — ${(r.thoughts_text || '').slice(0, 35)}...`,
                    })),
                  ]}
                  placeholder={t('scriptureLookup.selectReflection')}
                />
                <Button
                  onClick={handleReplace}
                  disabled={isReplacing || !selectedReflectionId}
                  variant="default"
                  className="w-full select-none gap-2"
                  size="sm"
                >
                  <Check className="w-3.5 h-3.5" />
                  {isReplacing ? t('scriptureLookup.replacing') : (result.category === 'pro-social' ? t('scriptureLookup.replaceProSocial') : t('scriptureLookup.replaceAntiSocial'))}
                </Button>
                <p className="text-[10px] text-muted-foreground">
                  {result.category === 'pro-social' ? t('scriptureLookup.replaceNoticeProSocial') : t('scriptureLookup.replaceNoticeAntiSocial')}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}