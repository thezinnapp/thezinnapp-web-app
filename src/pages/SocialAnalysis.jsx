import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Sparkles, ShieldCheck, ShieldAlert, ArrowRight, Lightbulb, Trash2 } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import VoiceInput from '@/components/shared/VoiceInput';
import AILoadingOverlay from '@/components/shared/AILoadingOverlay';
import PullToRefreshWrapper from '@/components/shared/PullToRefreshWrapper';
import { useTranslation } from '@/hooks/useTranslation';
import { useTranslatedJson } from '@/hooks/useTranslatedJson';
import { getLanguageInstruction } from '@/lib/aiLanguage';
import { useScrollToNew } from '@/hooks/useScrollToNew';
import { usePersistentState } from '@/hooks/usePersistentState';
import { useToast } from '@/components/ui/use-toast';

export default function SocialAnalysis() {
  const { t, language } = useTranslation();
  const { toast } = useToast();
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [analysisResult, setAnalysisResult] = usePersistentState('social-analysis-result', null);
  const translatedResult = useTranslatedJson(analysisResult);
  const setScrollTargetId = useScrollToNew('data-analysis-result', analysisResult);

  const { data: beliefs = [], refetch } = useQuery({
    queryKey: ['beliefs'],
    queryFn: () => base44.entities.Belief.list('-created_date'),
  });

  const proSocial = beliefs.filter(b => b.category === 'pro-social');
  const antiSocial = beliefs.filter(b => b.category === 'anti-social');

  const handleAnalyze = async () => {
    if (!input.trim()) return;
    setIsProcessing(true);

    try {
    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `You are an expert in social psychology and cognitive behavioral therapy. Analyze the following statement and provide a comprehensive social analysis:

"${input}"

Analyze this from both pro-social and anti-social perspectives. For each perspective provide:
1. A classification of the belief/affirmation/philosophy
2. The underlying social pattern
3. A pro-social reframe if it's anti-social, or reinforcement if it's pro-social
4. Related affirmations (both pro-social and anti-social versions)
5. Related philosophies (both pro-social and anti-social versions)${getLanguageInstruction(language)}`,
      response_json_schema: {
        type: 'object',
        properties: {
          primary_category: { type: 'string', enum: ['pro-social', 'anti-social'] },
          analysis: { type: 'string' },
          pro_social_version: {
            type: 'object',
            properties: {
              belief: { type: 'string' },
              affirmation: { type: 'string' },
              philosophy: { type: 'string' },
              social_pattern: { type: 'string' },
            },
          },
          anti_social_version: {
            type: 'object',
            properties: {
              belief: { type: 'string' },
              affirmation: { type: 'string' },
              philosophy: { type: 'string' },
              social_pattern: { type: 'string' },
            },
          },
          reframe: { type: 'string' },
        },
      },
    });

    setAnalysisResult(result);
    setScrollTargetId('result');
    } catch (error) {
      toast({
        title: t('common.error'),
        description: error.message || 'Analysis failed. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const SocialCard = ({ item }) => {
    const isPro = item.category === 'pro-social';
    const translatedFields = useTranslatedJson({
      content: item.content,
      correlated_affirmation: item.correlated_affirmation,
    });
    return (
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <Card className={`border-l-4 ${isPro ? 'border-l-emerald-500' : 'border-l-rose-500'} border-border/50`}>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              {isPro ? <ShieldCheck className="w-4 h-4 text-emerald-500" /> : <ShieldAlert className="w-4 h-4 text-rose-500" />}
              <Badge variant="outline" className={`text-xs ${isPro ? 'bg-emerald-500/15 text-emerald-500 border-emerald-500/30' : 'bg-rose-500/15 text-rose-500 border-rose-500/30'}`}>
                {item.type === 'belief' && <Lightbulb className="w-3 h-3 mr-1" />}
                {t(`common.${item.type}`)}
              </Badge>
            </div>
            <p className="text-sm font-medium">{translatedFields.content}</p>
            {translatedFields.correlated_affirmation && (
              <p className="text-xs text-muted-foreground mt-2 italic">"{translatedFields.correlated_affirmation}"</p>
            )}
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  return (
    <div className="space-y-8">
      <AnimatePresence>
        {isProcessing && <AILoadingOverlay message={t('socialAnalysis.analyzing')} />}
      </AnimatePresence>

      <div>
        <h1 className="text-3xl font-display font-bold tracking-tight">{t('socialAnalysis.title')}</h1>
        <p className="text-muted-foreground mt-2">
          {t('socialAnalysis.subtitle')}
        </p>
      </div>

      <Card className="border-border/50 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium">{t('socialAnalysis.quickAnalysis')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-2">
            <Textarea
              placeholder={t('socialAnalysis.enterPlaceholder')}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="min-h-[80px] resize-none flex-1"
            />
            <div className="flex flex-col gap-2">
              <VoiceInput onTranscript={(tr) => setInput(prev => prev ? `${prev} ${tr}` : tr)} />
            </div>
          </div>
          <Button onClick={handleAnalyze} disabled={!input.trim()}>
            <Sparkles className="w-4 h-4 mr-2" />
            {t('socialAnalysis.analyze')}
          </Button>
        </CardContent>
      </Card>

      {analysisResult && translatedResult && (
        <motion.div data-analysis-result="result" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="p-6 space-y-5">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                <h3 className="font-display font-semibold text-lg">{t('common.aiAnalysis')}</h3>
                <Badge variant="outline" className={analysisResult.primary_category === 'pro-social' ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' : 'bg-red-500/15 text-red-400 border-red-500/30'}>
                  {analysisResult.primary_category === 'pro-social' ? t('common.proSocial') : t('common.antiSocial')}
                </Badge>
                <button
                  onClick={() => setAnalysisResult(null)}
                  className="select-none ml-auto p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                  aria-label={t('common.delete')}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <p className="text-sm leading-relaxed">{translatedResult.analysis}</p>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                    <h4 className="font-medium text-sm text-emerald-500">{t('socialAnalysis.proSocialVersion')}</h4>
                  </div>
                  <div className="bg-emerald-500/5 rounded-lg p-4 space-y-2 border border-emerald-500/10">
                    <p className="text-sm"><span className="font-medium">{t('common.belief')}:</span> {translatedResult.pro_social_version?.belief}</p>
                    <p className="text-sm"><span className="font-medium">{t('common.affirmation')}:</span> "{translatedResult.pro_social_version?.affirmation}"</p>
                    <p className="text-sm"><span className="font-medium">{t('common.philosophy')}:</span> {translatedResult.pro_social_version?.philosophy}</p>
                    <p className="text-xs text-muted-foreground mt-1">{translatedResult.pro_social_version?.social_pattern}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-rose-500" />
                    <h4 className="font-medium text-sm text-rose-500">{t('socialAnalysis.antiSocialVersion')}</h4>
                  </div>
                  <div className="bg-rose-500/5 rounded-lg p-4 space-y-2 border border-rose-500/10">
                    <p className="text-sm"><span className="font-medium">{t('common.belief')}:</span> {translatedResult.anti_social_version?.belief}</p>
                    <p className="text-sm"><span className="font-medium">{t('common.affirmation')}:</span> "{translatedResult.anti_social_version?.affirmation}"</p>
                    <p className="text-sm"><span className="font-medium">{t('common.philosophy')}:</span> {translatedResult.anti_social_version?.philosophy}</p>
                    <p className="text-xs text-muted-foreground mt-1">{translatedResult.anti_social_version?.social_pattern}</p>
                  </div>
                </div>
              </div>

              {analysisResult.reframe && (
                <div className="bg-card rounded-lg p-4 border border-border/50">
                  <div className="flex items-center gap-2 mb-2">
                    <ArrowRight className="w-4 h-4 text-primary" />
                    <h4 className="font-medium text-sm">{t('socialAnalysis.reframe')}</h4>
                  </div>
                  <p className="text-sm text-muted-foreground">{translatedResult.reframe}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}

      <PullToRefreshWrapper onRefresh={refetch}>
      <Tabs defaultValue="pro-social" className="space-y-4">
        <TabsList className="w-full grid grid-cols-2 h-auto">
          <TabsTrigger value="pro-social" className="gap-2 py-2 min-w-0">
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span className="whitespace-normal text-center leading-tight break-words">{t('common.proSocial')} ({proSocial.length})</span>
          </TabsTrigger>
          <TabsTrigger value="anti-social" className="gap-2 py-2 min-w-0">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span className="whitespace-normal text-center leading-tight break-words">{t('common.antiSocial')} ({antiSocial.length})</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pro-social" className="space-y-3">
          {proSocial.length > 0 ? proSocial.map(b => (
            <SocialCard key={b.id} item={b} />
          )) : (
            <Card className="border-dashed">
              <CardContent className="p-8 text-center text-muted-foreground text-sm">
                {t('socialAnalysis.noProSocial')}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="anti-social" className="space-y-3">
          {antiSocial.length > 0 ? antiSocial.map(b => (
            <SocialCard key={b.id} item={b} />
          )) : (
            <Card className="border-dashed">
              <CardContent className="p-8 text-center text-muted-foreground text-sm">
                {t('socialAnalysis.noAntiSocial')}
              </CardContent>
            </Card>
          )}
        </TabsContent>
        </Tabs>
        </PullToRefreshWrapper>
        </div>
        );
        }