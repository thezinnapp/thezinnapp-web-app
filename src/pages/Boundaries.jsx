import { useState } from 'react';
import { toast } from '@/components/ui/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Shield, Sparkles, Plus, RefreshCw, Trash2, Target } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import AILoadingOverlay from '@/components/shared/AILoadingOverlay';
import BoundaryCard from '@/components/boundaries/BoundaryCard';
import MobileSelect from '@/components/shared/MobileSelect';
import PullToRefreshWrapper from '@/components/shared/PullToRefreshWrapper';
import { useTranslation } from '@/hooks/useTranslation';
import { getLanguageInstruction } from '@/lib/aiLanguage';
import { useScrollToNew } from '@/hooks/useScrollToNew';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const boundaryTypes = ['physical', 'emotional', 'time', 'sexual', 'material', 'digital', 'intellectual', 'spiritual', 'conversational', 'internal'];

export default function Boundaries() {
  const { t, language } = useTranslation();
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDeletingAll, setIsDeletingAll] = useState(false);
  const [filterType, setFilterType] = useState('all');
  const [selectedBeliefId, setSelectedBeliefId] = useState('');
  const [showDeleteAllDialog, setShowDeleteAllDialog] = useState(false);
  const queryClient = useQueryClient();

  const { data: boundaries = [], isLoading, refetch } = useQuery({
    queryKey: ['boundaries'],
    queryFn: () => base44.entities.Boundary.list('-created_date'),
  });

  const setScrollTargetId = useScrollToNew('data-boundary-id', boundaries);

  const { data: beliefs = [] } = useQuery({
    queryKey: ['beliefs'],
    queryFn: () => base44.entities.Belief.list('-created_date'),
  });

  const { data: reports = [] } = useQuery({
    queryKey: ['thinking-reports'],
    queryFn: () => base44.entities.ThinkingReport.list('-created_date', 10),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Boundary.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['boundaries'] }),
  });

  const handleDeleteAll = async () => {
    setIsDeletingAll(true);
    try {
      await Promise.all(boundaries.map(b => base44.entities.Boundary.delete(b.id)));
    } catch (err) {
      toast({ title: t('common.error'), description: err?.message || 'Could not delete all boundaries. Please try again.', variant: 'destructive' });
    } finally {
      // Refresh either way, so boundaries deleted before a failure disappear from the list.
      queryClient.invalidateQueries({ queryKey: ['boundaries'] });
      setIsDeletingAll(false);
      setShowDeleteAllDialog(false);
    }
  };

  const proSocialBeliefs = beliefs.filter(b => b.category === 'pro-social');
  const selectedBelief = proSocialBeliefs.find(b => b.id === selectedBeliefId) || null;

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {

    const replacementThoughts = reports.filter(r => r.replacement_thought).map(r => `- ${r.replacement_thought}`).join('\n');

    const beliefContext = selectedBelief
      ? `The user has selected this specific pro-social belief to generate boundaries for:

"${selectedBelief.content}" (${selectedBelief.type})

Generate boundaries that DIRECTLY support and protect this specific belief.`
      : `Pro-Social Beliefs:
${proSocialBeliefs.map(b => `- ${b.content} (${b.type})`).join('\n') || '(No pro-social beliefs entered yet - generate general healthy boundaries)'}

Generate boundaries that complement and support the pro-social beliefs listed above.`;

    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `You are an expert in boundary-setting within cognitive behavioral therapy and interpersonal psychology. Based on the following, generate healthy boundaries.

${beliefContext}

Replacement Thoughts from CBT Reports:
${replacementThoughts || '(No replacement thoughts yet)'}

Here are the POSSIBLE boundary types:
1. physical - personal space, touch, physical needs
2. emotional - feelings, emotional energy, empathy limits
3. time - how time is spent, availability, scheduling
4. sexual - intimacy, consent, comfort levels
5. material - possessions, money, lending
6. digital - social media, phone usage, online presence
7. intellectual - thoughts, ideas, respecting differences of opinion
8. spiritual - beliefs, values, religious practices
9. conversational - topics of discussion, communication style, gossip
10. internal - self-discipline, self-talk, personal standards

IMPORTANT: Do NOT generate boundaries for every type. Instead, carefully analyze the belief(s) above and ONLY generate boundaries for the types that are genuinely and specifically relevant to supporting that belief. Skip any type that does not naturally apply. For example, a belief about honesty might warrant conversational and internal boundaries but not sexual or material ones.

For EACH relevant boundary type, provide one boundary that directly complements and supports ${selectedBelief ? 'the selected pro-social belief' : 'the pro-social beliefs listed above'}. Each boundary should include:
- A clear title
- A description of the boundary
- The specific pro-social belief it supports (use the exact belief text)
- The boundary_type (must be one of the lowercase type names listed above)
- A script (what to say when setting this boundary)
- Concrete action steps to enforce it${getLanguageInstruction(language)}`,
      response_json_schema: {
        type: 'object',
        properties: {
          boundaries: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                title: { type: 'string' },
                description: { type: 'string' },
                boundary_type: { type: 'string' },
                related_belief: { type: 'string' },
                action_steps: { type: 'string' },
                boundary_script: { type: 'string' },
              },
            },
          },
        },
      },
    });

    if (result.boundaries && result.boundaries.length > 0) {
      const created = await base44.entities.Boundary.bulkCreate(result.boundaries);
      await queryClient.invalidateQueries({ queryKey: ['boundaries'] });
      await refetch();
      setScrollTargetId(created[0]?.id);
    }

    } catch (err) {
      toast({ title: t('common.error'), description: err?.message || 'Analysis failed. Please try again.', variant: 'destructive' });
    } finally {
      setIsGenerating(false);
    }
  };

  const filteredBoundaries = filterType === 'all'
    ? boundaries
    : boundaries.filter(b => b.boundary_type === filterType);

  return (
    <div className="space-y-8">
      <AnimatePresence>
        {isGenerating && <AILoadingOverlay message={selectedBelief ? `${t('boundaries.generatingFor')} "${selectedBelief.content.slice(0, 50)}..."` : t('boundaries.analyzing')} />}
      </AnimatePresence>

      <div>
        <h1 className="text-3xl font-display font-bold tracking-tight">{t('boundaries.title')}</h1>
        <p className="text-muted-foreground mt-2">
          {t('boundaries.subtitle')}
        </p>
      </div>

      <Card className="border-border/50 shadow-sm bg-gradient-to-br from-card to-accent/5">
        <CardContent className="p-6 space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
              <Shield className="w-5 h-5 text-accent" />
            </div>
            <div>
              <h3 className="font-medium text-sm">{t('boundaries.generateTitle')}</h3>
              <p className="text-xs text-muted-foreground mt-1">
                {t('boundaries.generateDesc')}
              </p>
            </div>
          </div>

          {proSocialBeliefs.length > 0 && (
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
                <Target className="w-3 h-3" /> {t('boundaries.proSocialBelief')}
              </label>
              <MobileSelect
                value={selectedBeliefId || '__all__'}
                onValueChange={val => setSelectedBeliefId(val === '__all__' ? '' : val)}
                options={[
                  { value: '__all__', label: t('boundaries.allBeliefs') },
                  ...proSocialBeliefs.map(b => ({
                    value: b.id,
                    label: b.content.length > 60 ? b.content.slice(0, 60) + '…' : b.content,
                  })),
                ]}
                placeholder={t('boundaries.selectBelief')}
              />
              {selectedBelief && (
                <p className="text-xs text-accent bg-accent/5 border border-accent/15 rounded-lg p-2">
                  {t('boundaries.generatingFor')} <span className="font-medium">"{selectedBelief.content}"</span>
                </p>
              )}
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-2">
            {boundaries.length > 0 && (
              <Button variant="destructive" onClick={() => setShowDeleteAllDialog(true)} disabled={isDeletingAll} className="shrink-0">
                <Trash2 className="w-4 h-4 mr-2" />
                {t('boundaries.deleteAll')}
              </Button>
            )}
            <Button onClick={handleGenerate} disabled={isGenerating || proSocialBeliefs.length === 0} className="shrink-0 flex-1 sm:flex-none">
              {boundaries.length > 0 ? <RefreshCw className="w-4 h-4 mr-2" /> : <Sparkles className="w-4 h-4 mr-2" />}
              {selectedBelief ? t('boundaries.generateForSelected') : boundaries.length > 0 ? t('boundaries.regenerate') : t('boundaries.generate')} {t('boundaries.boundaries')}
            </Button>
          </div>
          {proSocialBeliefs.length === 0 && (
            <p className="text-xs text-muted-foreground text-center">{t('boundaries.addBeliefsFirst')}</p>
          )}
        </CardContent>
      </Card>

      {boundaries.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <Badge
            variant={filterType === 'all' ? 'default' : 'outline'}
            className="cursor-pointer"
            onClick={() => setFilterType('all')}
          >
            {t('boundaries.all')} ({boundaries.length})
          </Badge>
          {boundaryTypes.map(type => {
            const count = boundaries.filter(b => b.boundary_type === type).length;
            if (count === 0) return null;
            return (
              <Badge
                key={type}
                variant={filterType === type ? 'default' : 'outline'}
                className="cursor-pointer capitalize"
                onClick={() => setFilterType(type)}
              >
                {t(`boundaries.types.${type}`)} ({count})
              </Badge>
            );
          })}
        </div>
      )}

      <PullToRefreshWrapper onRefresh={refetch}>
      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map(i => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-5 space-y-3">
                <div className="h-4 bg-muted rounded w-20" />
                <div className="h-4 bg-muted rounded w-full" />
                <div className="h-12 bg-muted rounded" />
                <div className="h-8 bg-muted rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredBoundaries.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredBoundaries.map((boundary, i) => (
            <div key={boundary.id} data-boundary-id={boundary.id} className="transition-shadow duration-500">
              <BoundaryCard
                boundary={boundary}
                onDelete={(id) => deleteMutation.mutate(id)}
                index={i}
              />
            </div>
          ))}
        </div>
      ) : (
        <Card className="border-dashed">
          <CardContent className="p-12 text-center">
            <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mx-auto mb-4">
              <Plus className="w-6 h-6 text-accent" />
            </div>
            <p className="font-medium mb-1">{t('boundaries.noBoundaries')}</p>
            <p className="text-sm text-muted-foreground">
              {t('boundaries.noBoundariesDesc')}
            </p>
          </CardContent>
          </Card>
          )}
          </PullToRefreshWrapper>

      {/* Delete All Dialog (was placed after the return in the original, so it never opened) */}
      <AlertDialog open={showDeleteAllDialog} onOpenChange={setShowDeleteAllDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('boundaries.deleteAll')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('boundaries.deleteAllConfirm', { count: boundaries.length })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAll}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t('common.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}