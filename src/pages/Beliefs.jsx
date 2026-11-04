import { useState } from 'react';
import { toast } from '@/components/ui/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Lightbulb, Sparkles, Plus } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import VoiceInput from '@/components/shared/VoiceInput';
import AILoadingOverlay from '@/components/shared/AILoadingOverlay';
import BeliefCard from '@/components/beliefs/BeliefCard';
import MobileSelect from '@/components/shared/MobileSelect';
import PullToRefreshWrapper from '@/components/shared/PullToRefreshWrapper';
import { useTranslation } from '@/hooks/useTranslation';
import { getLanguageInstruction } from '@/lib/aiLanguage';
import { useScrollToNew } from '@/hooks/useScrollToNew';

export default function Beliefs() {
  const { t, language } = useTranslation();
  const [content, setContent] = useState('');
  const [type, setType] = useState('belief');
  const [isAIProcessing, setIsAIProcessing] = useState(false);
  const queryClient = useQueryClient();

  const typeOptions = [
    { value: 'belief', label: t('common.belief') },
    { value: 'affirmation', label: t('common.affirmation') },
    { value: 'philosophy', label: t('common.philosophy') },
  ];

  const { data: beliefs = [], isLoading, refetch } = useQuery({
    queryKey: ['beliefs'],
    queryFn: () => base44.entities.Belief.list('-created_date'),
  });

  const setScrollTargetId = useScrollToNew('data-belief-id', beliefs);

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Belief.create(data),
    onMutate: async (newBelief) => {
      await queryClient.cancelQueries({ queryKey: ['beliefs'] });
      const previous = queryClient.getQueryData(['beliefs']);
      queryClient.setQueryData(['beliefs'], old => [
        { ...newBelief, id: `optimistic-${Date.now()}`, created_date: new Date().toISOString() },
        ...(old || []),
      ]);
      return { previous };
    },
    onError: (_, __, ctx) => {
      queryClient.setQueryData(['beliefs'], ctx.previous);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['beliefs'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Belief.delete(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['beliefs'] });
      const previous = queryClient.getQueryData(['beliefs']);
      queryClient.setQueryData(['beliefs'], old => (old || []).filter(b => b.id !== id));
      return { previous };
    },
    onError: (_, __, ctx) => {
      queryClient.setQueryData(['beliefs'], ctx.previous);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['beliefs'] }),
  });

  const handleSubmit = async () => {
    if (!content.trim()) return;
    setIsAIProcessing(true);
    try {

    const aiResult = await base44.integrations.Core.InvokeLLM({
      prompt: `Analyze this ${type} and provide correlations:

"${content}"

1. Determine if this is "pro-social" (promotes healthy relationships, empathy, growth, cooperation) or "anti-social" (promotes isolation, harm, selfishness, destructive patterns).
2. Generate a single-phrase correlated affirmation that aligns with or counters this ${type}.
3. Generate a correlated philosophy (a philosophical principle or school of thought) that relates to this ${type}.
4. Provide a brief explanation of how these correlate.${getLanguageInstruction(language)}`,
      response_json_schema: {
        type: 'object',
        properties: {
          category: { type: 'string', enum: ['pro-social', 'anti-social'] },
          correlated_affirmation: { type: 'string' },
          correlated_philosophy: { type: 'string' },
          explanation: { type: 'string' },
        },
      },
    });

    const created = await createMutation.mutateAsync({
      content: content.trim(),
      type,
      category: aiResult.category,
      correlated_affirmation: aiResult.correlated_affirmation,
      correlated_philosophy: aiResult.correlated_philosophy,
      explanation: aiResult.explanation,
    });

    await refetch();
    setScrollTargetId(created.id);
    setContent('');
    } catch (err) {
      toast({ title: t('common.error'), description: err?.message || 'Analysis failed. Please try again.', variant: 'destructive' });
    } finally {
      setIsAIProcessing(false);
    }
  };

  return (
    <div className="space-y-8">
      <AnimatePresence>
        {isAIProcessing && <AILoadingOverlay message={t('beliefs.analyzing')} />}
      </AnimatePresence>

      <div>
        <h1 className="text-3xl font-display font-bold tracking-tight">{t('beliefs.title')}</h1>
        <p className="text-muted-foreground mt-2">
          {t('beliefs.subtitle')}
        </p>
      </div>

      <Card className="border-border/50 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-primary" />
            {t('beliefs.addNewEntry')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <MobileSelect
              value={type}
              onValueChange={setType}
              options={typeOptions}
              placeholder={t('beliefs.type')}
              className="w-40"
            />
            <VoiceInput onTranscript={(tr) => setContent(prev => prev ? `${prev} ${tr}` : tr)} />
          </div>
          <Textarea
            placeholder={t('beliefs.enterPlaceholder', { type: t(`common.${type}`) })}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[100px] resize-none"
          />
          <Button onClick={handleSubmit} disabled={!content.trim() || isAIProcessing} className="w-full sm:w-auto select-none">
            <Sparkles className="w-4 h-4 mr-2" />
            {t('beliefs.analyzeWithAI')}
          </Button>
        </CardContent>
      </Card>

      <PullToRefreshWrapper onRefresh={refetch}>
        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2">
            {[1, 2, 3, 4].map(i => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-5 space-y-3">
                  <div className="h-4 bg-muted rounded w-20" />
                  <div className="h-4 bg-muted rounded w-full" />
                  <div className="h-12 bg-muted rounded" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : beliefs.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2">
            {beliefs.map((belief, i) => (
              <div key={belief.id} data-belief-id={belief.id} className="transition-shadow duration-500">
                <BeliefCard belief={belief} onDelete={(id) => deleteMutation.mutate(id)} index={i} />
              </div>
            ))}
          </div>
        ) : (
          <Card className="border-dashed">
            <CardContent className="p-12 text-center">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Plus className="w-6 h-6 text-primary" />
              </div>
              <p className="font-medium mb-1">{t('beliefs.noEntries')}</p>
              <p className="text-sm text-muted-foreground">{t('beliefs.noEntriesDesc')}</p>
            </CardContent>
          </Card>
        )}
      </PullToRefreshWrapper>
    </div>
  );
}