import { useState } from 'react';
import { toast } from '@/components/ui/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Pyramid, Sparkles, Plus, ChevronRight } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import AILoadingOverlay from '@/components/shared/AILoadingOverlay';
import MaslowAnalysisCard from '@/components/maslow/MaslowAnalysisCard';
import ReportListItem from '@/components/maslow/ReportListItem';
import SelectedReportPreview from '@/components/maslow/SelectedReportPreview';
import PullToRefreshWrapper from '@/components/shared/PullToRefreshWrapper';
import { useTranslation } from '@/hooks/useTranslation';
import { getLanguageInstruction, HUMAN_NEEDS_PROMPT, HUMAN_NEEDS_SCHEMA, THANK_YOU_POWER_PROMPT, THANK_YOU_POWER_SCHEMA } from '@/lib/aiLanguage';
import { useScrollToNew } from '@/hooks/useScrollToNew';

export default function MaslowNeeds() {
  const { t, language } = useTranslation();
  const [selectedReportId, setSelectedReportId] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const queryClient = useQueryClient();

  const LEVELS = [
    { key: 'self_actualization', label: t('maslow.levels.selfActualization'), sublabel: t('maslow.sublabels.selfActualization'), color: 'bg-violet-500/10 text-violet-400' },
    { key: 'esteem', label: t('maslow.levels.esteem'), sublabel: t('maslow.sublabels.esteem'), color: 'bg-blue-500/10 text-blue-400' },
    { key: 'love_belonging', label: t('maslow.levels.loveBelonging'), sublabel: t('maslow.sublabels.loveBelonging'), color: 'bg-emerald-500/10 text-emerald-400' },
    { key: 'safety', label: t('maslow.levels.safety'), sublabel: t('maslow.sublabels.safety'), color: 'bg-amber-500/10 text-amber-400' },
    { key: 'physiological', label: t('maslow.levels.physiological'), sublabel: t('maslow.sublabels.physiological'), color: 'bg-rose-500/10 text-rose-400' },
  ];

  const { data: reports = [], isLoading: reportsLoading } = useQuery({
    queryKey: ['thinking-reports'],
    queryFn: () => base44.entities.ThinkingReport.list('-created_date'),
  });

  const { data: analyses = [], isLoading: analysesLoading, refetch } = useQuery({
    queryKey: ['maslow-analyses'],
    queryFn: () => base44.entities.MaslowAnalysis.list('-created_date'),
  });

  const setScrollTargetId = useScrollToNew('data-analysis-id', analyses);

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.MaslowAnalysis.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['maslow-analyses'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.MaslowAnalysis.delete(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['maslow-analyses'] });
      const previous = queryClient.getQueryData(['maslow-analyses']);
      queryClient.setQueryData(['maslow-analyses'], old => (old || []).filter(a => a.id !== id));
      return { previous };
    },
    onError: (_, __, ctx) => queryClient.setQueryData(['maslow-analyses'], ctx.previous),
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['maslow-analyses'] }),
  });

  const handleAnalyze = async () => {
    const report = reports.find(r => r.id === selectedReportId);
    if (!report) return;
    setIsAnalyzing(true);
    try {

    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `You are an expert in Maslow's Hierarchy of Needs and Cognitive Behavioral Therapy. Analyze the following thought and behavior from a CBT Thinking Report, and identify how each of Maslow's five hierarchy levels may have been deficient or unmet — contributing to these thoughts and behaviors. Also generate actionable recommendations at each level.

Situation: ${report.situation || 'Not specified'}
First Thought: ${report.first_thought}
Feelings: ${report.feelings || 'Not specified'}
Behavior: ${report.behavior || 'Not specified'}
Associated Belief: ${report.associated_belief || 'Not specified'}

For each of Maslow's five hierarchy levels, explain:
1. Whether this need was likely UNMET or LACKING based on the thought and behavior
2. How the deficit at this level may have CONTRIBUTED to the thought and behavior
3. What BENEFICIAL actions at this level could improve the person's wellbeing

Be specific, compassionate, and clinically grounded. Each analysis should be 2-3 sentences.

Also identify the SINGLE level most likely to be the primary deficit driving this thought/behavior.

Finally, provide 3-5 concrete, actionable recommendations that span multiple hierarchy levels to help this person address their unmet needs.

ADDITIONAL ANALYSIS — ${HUMAN_NEEDS_PROMPT}

GRATITUDE ANALYSIS — ${THANK_YOU_POWER_PROMPT}${getLanguageInstruction(language)}`,
      response_json_schema: {
        type: 'object',
        properties: {
          physiological: { type: 'string' },
          safety: { type: 'string' },
          love_belonging: { type: 'string' },
          esteem: { type: 'string' },
          self_actualization: { type: 'string' },
          primary_deficit: {
            type: 'string',
            enum: ['physiological', 'safety', 'love_belonging', 'esteem', 'self_actualization'],
          },
          recommendations: { type: 'string' },
          human_needs_analysis: HUMAN_NEEDS_SCHEMA,
          thank_you_power_analysis: THANK_YOU_POWER_SCHEMA,
        },
      },
    });

    const created = await createMutation.mutateAsync({
      source_report_id: report.id,
      first_thought: report.first_thought,
      behavior: report.behavior || '',
      situation: report.situation || '',
      physiological: result.physiological,
      safety: result.safety,
      love_belonging: result.love_belonging,
      esteem: result.esteem,
      self_actualization: result.self_actualization,
      primary_deficit: result.primary_deficit,
      recommendations: result.recommendations,
      human_needs_analysis: JSON.stringify(result.human_needs_analysis || []),
      thank_you_power_analysis: JSON.stringify(result.thank_you_power_analysis || []),
    });

    await refetch();
    setScrollTargetId(created.id);
    setSelectedReportId(null);
    } catch (err) {
      toast({ title: t('common.error'), description: err?.message || 'Analysis failed. Please try again.', variant: 'destructive' });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const analyzedIds = new Set(analyses.map(a => a.source_report_id));

  return (
    <div className="space-y-8">
      <AnimatePresence>
        {isAnalyzing && <AILoadingOverlay message={t('maslow.analyzing')} />}
      </AnimatePresence>

      <div>
        <h1 className="text-3xl font-display font-bold tracking-tight">{t('maslow.title')}</h1>
        <p className="text-muted-foreground mt-2">
          {t('maslow.subtitle')}
        </p>
      </div>

      <Card className="border-border/50 shadow-sm overflow-hidden">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <Pyramid className="w-4 h-4 text-primary" />
            {t('maslow.fiveLevels')}
          </CardTitle>
        </CardHeader>
        <CardContent className="pb-4">
          <div className="flex flex-col items-center gap-1">
            {LEVELS.map((level, i) => (
              <div
                key={level.key}
                className="flex items-center justify-center"
                style={{ width: `${40 + i * 15}%` }}
              >
                <Badge variant="outline" className={`w-full justify-center py-1.5 flex flex-col items-center gap-0.5 ${level.color}`}>
                  <span className="text-xs font-medium leading-tight">{level.label}</span>
                  <span className="text-[9px] opacity-60 font-normal leading-tight text-center">{level.sublabel}</span>
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/50 shadow-sm bg-gradient-to-br from-card to-primary/5">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            {t('maslow.analyzeReport')}
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            {t('maslow.analyzeReportDesc')}
          </p>
        </CardHeader>
        <CardContent className="space-y-3">
          {reportsLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map(i => <div key={i} className="h-12 bg-muted rounded-lg animate-pulse" />)}
            </div>
          ) : reports.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              {t('maslow.noReports')}
            </p>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {reports.map(report => {
                const alreadyAnalyzed = analyzedIds.has(report.id);
                const isSelected = selectedReportId === report.id;
                return (
                  <ReportListItem
                    key={report.id}
                    report={report}
                    isSelected={isSelected}
                    alreadyAnalyzed={alreadyAnalyzed}
                    onSelect={() => setSelectedReportId(isSelected ? null : report.id)}
                  />
                );
              })}
            </div>
          )}

          {selectedReportId && (
            <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}>
              {(() => {
                const r = reports.find(x => x.id === selectedReportId);
                return r ? <SelectedReportPreview report={r} /> : null;
              })()}
              <Button onClick={handleAnalyze} disabled={isAnalyzing} className="w-full select-none mt-3">
                <Sparkles className="w-4 h-4 mr-2" />
                {t('maslow.analyzeHierarchy')}
              </Button>
            </motion.div>
          )}
        </CardContent>
      </Card>

      <div>
        <h2 className="text-lg font-semibold mb-4">{t('maslow.pastAnalyses')}</h2>
        <PullToRefreshWrapper onRefresh={refetch}>
          {analysesLoading ? (
            <div className="grid gap-4 md:grid-cols-2">
              {[1, 2].map(i => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-5 space-y-3">
                    <div className="h-4 bg-muted rounded w-3/4" />
                    <div className="h-4 bg-muted rounded w-1/2" />
                    <div className="h-20 bg-muted rounded" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : analyses.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {analyses.map((analysis, i) => (
                <div key={analysis.id} data-analysis-id={analysis.id} className="transition-shadow duration-500">
                  <MaslowAnalysisCard
                    analysis={analysis}
                    onDelete={(id) => deleteMutation.mutate(id)}
                    index={i}
                  />
                </div>
              ))}
            </div>
          ) : (
            <Card className="border-dashed">
              <CardContent className="p-12 text-center">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Plus className="w-6 h-6 text-primary" />
                </div>
                <p className="font-medium mb-1">{t('maslow.noAnalyses')}</p>
                <p className="text-sm text-muted-foreground">{t('maslow.noAnalysesDesc')}</p>
              </CardContent>
            </Card>
          )}
        </PullToRefreshWrapper>
      </div>
    </div>
  );
}