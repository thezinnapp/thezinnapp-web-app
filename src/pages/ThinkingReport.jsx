import { useState } from 'react';
import { toast } from '@/components/ui/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Brain, Sparkles, Plus } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import VoiceInput from '@/components/shared/VoiceInput';
import AILoadingOverlay from '@/components/shared/AILoadingOverlay';
import ThinkingReportCard from '@/components/thinking/ThinkingReportCard';
import PullToRefreshWrapper from '@/components/shared/PullToRefreshWrapper';
import { useTranslation } from '@/hooks/useTranslation';
import { getLanguageInstruction, COGNITIVE_BIASES_PROMPT, COGNITIVE_BIASES_SCHEMA, THANK_YOU_POWER_PROMPT, THANK_YOU_POWER_SCHEMA, INTENT_VS_IMPACT_PROMPT, INTENT_VS_IMPACT_SCHEMA } from '@/lib/aiLanguage';
import { useScrollToNew } from '@/hooks/useScrollToNew';

const emptyForm = {
  situation: '',
  first_thought: '',
  feelings: '',
  behavior: '',
  disputing_thought: '',
  replacement_thought: '',
  associated_belief: '',
};

export default function ThinkingReport() {
  const { t, language } = useTranslation();
  const [form, setForm] = useState(emptyForm);
  const [activeField, setActiveField] = useState('first_thought');
  const [isProcessing, setIsProcessing] = useState(false);
  const queryClient = useQueryClient();

  const { data: reports = [], isLoading, refetch } = useQuery({
    queryKey: ['thinking-reports'],
    queryFn: () => base44.entities.ThinkingReport.list('-created_date'),
  });

  const setScrollTargetId = useScrollToNew('data-report-id', reports);

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.ThinkingReport.create(data),
    onMutate: async (newReport) => {
      await queryClient.cancelQueries({ queryKey: ['thinking-reports'] });
      const previous = queryClient.getQueryData(['thinking-reports']);
      queryClient.setQueryData(['thinking-reports'], old => [
        { ...newReport, id: `optimistic-${Date.now()}`, created_date: new Date().toISOString() },
        ...(old || []),
      ]);
      return { previous };
    },
    onError: (_, __, ctx) => {
      queryClient.setQueryData(['thinking-reports'], ctx.previous);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['thinking-reports'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.ThinkingReport.delete(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['thinking-reports'] });
      const previous = queryClient.getQueryData(['thinking-reports']);
      queryClient.setQueryData(['thinking-reports'], old => (old || []).filter(r => r.id !== id));
      return { previous };
    },
    onError: (_, __, ctx) => {
      queryClient.setQueryData(['thinking-reports'], ctx.previous);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['thinking-reports'] }),
  });

  const handleChange = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const handleVoiceTranscript = (transcript) => {
    setForm(prev => ({ ...prev, [activeField]: prev[activeField] ? `${prev[activeField]} ${transcript}` : transcript }));
  };

  const handleAIGenerate = async () => {
    if (!form.first_thought.trim()) return;
    setIsProcessing(true);
    try {

    const filledFields = Object.entries(form).filter(([_, v]) => v.trim()).map(([k, v]) => `${k}: "${v}"`).join('\n');

    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `You are a Cognitive Behavioral Therapy expert and a specialist in the "Criminal and Addictive Thinking" workbook by Hazelden. Based on the following information from a CBT Thinking Report, fill in any missing fields, provide analysis, AND perform a deep Criminal and Addictive Thinking assessment.

    Given information:
    ${filledFields}

    PART 1 — Complete the standard CBT Thinking Report fields.

    PART 2 — Criminal and Addictive Thinking Analysis (based on Hazelden's workbook):

    A) DISTORTED THINKING PATTERNS — Identify ALL that apply from this list:
    Closed Channel, Victim Stance, Lack of Empathy, Fear of Exposure, Lack of Time Concept, Superoptimism, Cognitive Indolence, Discontinuity, Power Orientation, Zero State, Ownership, Uniqueness, Fragmentation, Failure to Consider Injury to Others, Emotional Thinking, I-Can't Thinking, Failure to Put Oneself in Another's Shoes, Cutoff, Victim Playing.
    For each identified pattern: provide its name, a 1-2 sentence description of how it appears in this entry, and a specific workbook-based correction/solution.

    B) AVOIDANCE, DIVERSION & AGGRESSION TACTICS — Identify ALL that apply:
    Avoidance Tactics: Changing the subject, Vagueness, Evasion, Forgetting, Claiming not to understand, Playing dumb.
    Diversion Tactics: Intellectualizing, Minimizing, Rationalizing, Justifying, Blaming others, Comparing self to others worse.
    Aggression Tactics: Anger, Threatening, Intimidating, Sarcasm, Humor to deflect, Silent treatment.
    For each: provide name, type (Avoidance/Diversion/Aggression), a 1-2 sentence description of how it appears, and a workbook-based correction.

    C) ASSOCIATED STANCES — Identify ALL that apply:
    Victim Stance, Power Stance, Uniqueness Stance, Ownership Stance, No Obligation Stance, Closed Channel Stance, Fragmentation Stance, Superoptimism Stance, Zero State Stance.
    For each: provide name, a 1-2 sentence description of how it shows up in this entry, and a workbook-based correction/solution.

    PART 3 — Four Agreements Analysis (Don Miguel Ruiz):
    Identify which of the Four Agreements the user should be reminded of based on this thinking pattern:
    1. "Be Impeccable with Your Word" — speaking with integrity, being authentic
    2. "Don't Take Anything Personally" — not internalizing others' actions or judgments
    3. "Don't Make Assumptions" — asking questions and seeking clarity instead of assuming
    4. "Always Do Your Best" — giving your best effort without self-judgment or perfectionism

    For each applicable agreement, briefly explain how it relates to this entry and how applying it would help.

    PART 4 — Power & Control Wheel Analysis (Domestic Violence Warning Signs):
    Analyze the thinking patterns, behaviors, and beliefs for any indicators of power, control, isolation, or abusive dynamics. Check for these 8 components:
    1. PHYSICAL VIOLENCE — harmful physical actions, threats of harm
    2. SEXUAL VIOLENCE — sexual coercion, unwanted intimate contact, reproductive control
    3. THREATS & INTIMIDATION — threats, intimidating behavior, property destruction
    4. EMOTIONAL ABUSE — name-calling, manipulation, making someone feel bad about themselves
    5. ISOLATION — limiting contact with family/friends, controlling movement
    6. MINIMIZING, DENYING & BLAMING — downplaying harm, refusing responsibility, victim-blaming
    7. USING CHILDREN — threatening custody, using kids as messengers, involving them in conflict
    8. ECONOMIC ABUSE — controlling finances, preventing work, financial exploitation

    For each component found: provide the name, describe the specific indicator from this entry, assign a risk level (low/medium/high), and provide a compassionate recommendation focused on safety and support.

    PART 5 — Shame & Guilt Analysis (based on "Healing the Shame That Binds You" by John Bradshaw, and "Shame and Guilt" by June Price Tangney & Rhonda L. Dearing):
    Identify any indicators of guilt and/or shame in the thinking, feelings, and behavior. Carefully distinguish between:
    - SHAME: a global, identity-level feeling of "I am bad / worthless / defective" — toxic shame that binds the person (per Bradshaw), shame-based self-talk, hiding, perfectionism, rage, contempt or disgust directed at the self.
    - GUILT: a specific, behavior-level feeling of "I did a bad thing" (per Tangney & Dearing) — adaptive guilt that motivates repair and amends, or maladaptive/excessive guilt that is irrational or disproportionate.
    For each indicator found: provide the type (shame or guilt), a 1-2 sentence description of how it appears in this entry, the relevant reference/concept from Bradshaw or Tangney & Dearing, and a compassionate recommendation that draws on the relevant reference literature to address the user's needs. If no guilt or shame is present, return an empty array.

    PART 6 — The Halo Effect (Cognitive Bias Analysis):
    The Halo Effect is a cognitive bias where a positive overall impression of a person, thing, or situation leads to inflated positive judgments about specific traits, or where one prominent positive or negative trait colors the perception of everything else about that person or situation.
    Analyze the thinking, feelings, and behavior for indicators of the Halo Effect — e.g., overgeneralizing someone's worth based on one trait, judging an entire situation based on a single positive or negative aspect, or letting one impression dominate all subsequent evaluations.
    Return a JSON object with:
    - detected: true if the Halo Effect is present, false otherwise
    - indicator: a 1-2 sentence description of how it appears in this entry (empty string if not detected)
    - definition: a clear, plain-language definition of the Halo Effect so the user understands what it is
    - recommendation: a specific recommendation for addressing it (empty string if not detected)

    PART 7 — The Stockholm Syndrome (Psychological Bond Analysis):
    The Stockholm Syndrome is a psychological response in which hostages or abuse victims develop a bond, empathy, or positive feelings toward their captors or abusers, often defending them and resisting rescue or intervention. It can also manifest in non-captive relationships (e.g., abusive partnerships, cults, toxic workplaces) where the victim identifies with and protects the person causing them harm.
    Analyze the thinking, feelings, and behavior for indicators of Stockholm Syndrome — e.g., defending or justifying someone who is harming the user, expressing loyalty or positive feelings toward an abuser/controller, minimizing abuse while emphasizing the abuser's good side, resisting help or intervention, or feeling reluctant to leave a harmful situation.
    Return a JSON object with:
    - detected: true if Stockholm Syndrome indicators are present, false otherwise
    - indicator: a 1-2 sentence description of how it appears in this entry (empty string if not detected)
    - definition: a clear, plain-language definition of Stockholm Syndrome so the user understands what it is
    - recommendation: a specific, compassionate recommendation for addressing it (empty string if not detected)

    PART 8 — Gaslighting (Psychological Manipulation Analysis):
    Gaslighting is a form of psychological manipulation in which the abuser attempts to sow self-doubt and confusion in their victim's mind by denying reality, distorting facts, trivializing feelings, or shifting blame — causing the victim to question their own memory, perception, or sanity. It can also appear as self-gaslighting, where the user dismisses or doubts their own valid feelings and perceptions.
    Analyze the thinking, feelings, and behavior for indicators of Gaslighting — either being gaslit by someone else (e.g., the user describes someone denying events the user knows happened, telling the user they are too sensitive or crazy, shifting blame onto the user, or twisting the user's words) OR self-gaslighting (e.g., the user dismissing their own feelings as invalid, doubting their own memory, telling themselves they are overreacting, or minimizing their own valid concerns).
    Return a JSON object with:
    - detected: true if Gaslighting indicators are present, false otherwise
    - indicator: a 1-2 sentence description of how it appears in this entry (empty string if not detected)
    - definition: a clear, plain-language definition of Gaslighting so the user understands what it is
    - recommendation: a specific, compassionate recommendation for addressing it (empty string if not detected)

    PART 9 — Coping Strategies:
    Based on ALL the findings from the analysis above (cognitive distortions, distorted thinking patterns, avoidance/diversion/aggression tactics, associated stances, Four Agreements, Power & Control Wheel, shame & guilt, Halo Effect, Stockholm Syndrome, Gaslighting, Cognitive Dissonance, Intent vs Impact, and the 12 Cognitive Biases), recommend 3-5 specific, actionable Coping Strategies that directly address the specific needs and issues identified in this entry.
    Each coping strategy must be tailored to the specific findings — do not give generic advice. For example, if shame was detected, recommend a shame-specific strategy; if gaslighting was detected, recommend a strategy for rebuilding trust in one's own perception; if a cognitive distortion was identified, recommend a CBT technique for that specific distortion.
    For each coping strategy, provide:
    - strategy: a clear, concise name/title for the coping strategy
    - addresses: which specific finding or need from the analysis this strategy addresses
    - steps: concrete, step-by-step instructions for implementing this strategy

    PART 10 — Cognitive Dissonance (Psychological Conflict Analysis):
    Cognitive Dissonance is the mental discomfort or tension that arises when a person holds two or more contradictory beliefs, values, or ideas simultaneously, or when their behavior conflicts with their beliefs. Common signs include rationalizing contradictions, justifying behavior that goes against one's values, feeling uneasy about conflicting thoughts, or changing one's beliefs to reduce the discomfort.
    Analyze the thinking, feelings, and behavior for indicators of Cognitive Dissonance — e.g., the user's thoughts or behavior contradict their stated beliefs or values, they are rationalizing or justifying a contradiction, they express discomfort about holding conflicting views, or they are modifying their beliefs to reduce tension.
    Return a JSON object with:
    - detected: true if Cognitive Dissonance indicators are present, false otherwise
    - indicator: a 1-2 sentence description of how it appears in this entry (empty string if not detected)
    - definition: a clear, plain-language definition of Cognitive Dissonance so the user understands what it is
    - recommendation: a specific, compassionate recommendation for addressing it (empty string if not detected)

    PART 11 — ${COGNITIVE_BIASES_PROMPT}

    PART 12 — ${THANK_YOU_POWER_PROMPT}

    PART 13 — ${INTENT_VS_IMPACT_PROMPT}${getLanguageInstruction(language)}`,
      response_json_schema: {
        type: 'object',
        properties: {
          situation: { type: 'string' },
          first_thought: { type: 'string' },
          feelings: { type: 'string' },
          behavior: { type: 'string' },
          cognitive_distortion: { type: 'string' },
          disputing_thought: { type: 'string' },
          replacement_thought: { type: 'string' },
          associated_belief: { type: 'string' },
          ai_analysis: { type: 'string' },
          distorted_thinking_patterns: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                pattern: { type: 'string' },
                description: { type: 'string' },
                correction: { type: 'string' },
              },
            },
          },
          avoidance_diversion_aggression_tactics: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                tactic: { type: 'string' },
                type: { type: 'string' },
                description: { type: 'string' },
                correction: { type: 'string' },
              },
            },
          },
          associated_stances: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                stance: { type: 'string' },
                description: { type: 'string' },
                correction: { type: 'string' },
              },
            },
          },
          four_agreements: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                agreement: { type: 'string' },
                relevance: { type: 'string' },
              },
            },
          },
          power_control_wheel: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                component: { type: 'string' },
                indicator: { type: 'string' },
                risk_level: { type: 'string', enum: ['low', 'medium', 'high'] },
                recommendation: { type: 'string' },
              },
            },
          },
          shame_guilt_analysis: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                type: { type: 'string', enum: ['shame', 'guilt'] },
                indicator: { type: 'string' },
                reference: { type: 'string' },
                recommendation: { type: 'string' },
              },
            },
          },
          halo_effect_analysis: {
            type: 'object',
            properties: {
              detected: { type: 'boolean' },
              indicator: { type: 'string' },
              definition: { type: 'string' },
              recommendation: { type: 'string' },
            },
          },
          stockholm_syndrome_analysis: {
            type: 'object',
            properties: {
              detected: { type: 'boolean' },
              indicator: { type: 'string' },
              definition: { type: 'string' },
              recommendation: { type: 'string' },
            },
          },
          gaslighting_analysis: {
            type: 'object',
            properties: {
              detected: { type: 'boolean' },
              indicator: { type: 'string' },
              definition: { type: 'string' },
              recommendation: { type: 'string' },
            },
          },
          coping_strategies: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                strategy: { type: 'string' },
                addresses: { type: 'string' },
                steps: { type: 'string' },
              },
            },
          },
          cognitive_dissonance_analysis: {
            type: 'object',
            properties: {
              detected: { type: 'boolean' },
              indicator: { type: 'string' },
              definition: { type: 'string' },
              recommendation: { type: 'string' },
            },
          },
          cognitive_biases_analysis: COGNITIVE_BIASES_SCHEMA,
          thank_you_power_analysis: THANK_YOU_POWER_SCHEMA,
          intent_vs_impact_analysis: INTENT_VS_IMPACT_SCHEMA,
          },
          },
          });

    const created = await createMutation.mutateAsync({
      situation: form.situation || result.situation,
      first_thought: form.first_thought || result.first_thought,
      feelings: form.feelings || result.feelings,
      behavior: form.behavior || result.behavior,
      cognitive_distortion: result.cognitive_distortion,
      disputing_thought: form.disputing_thought || result.disputing_thought,
      replacement_thought: form.replacement_thought || result.replacement_thought,
      associated_belief: form.associated_belief || result.associated_belief,
      ai_analysis: result.ai_analysis,
      distorted_thinking_patterns: JSON.stringify(result.distorted_thinking_patterns || []),
      avoidance_diversion_aggression_tactics: JSON.stringify(result.avoidance_diversion_aggression_tactics || []),
      associated_stances: JSON.stringify(result.associated_stances || []),
      four_agreements: JSON.stringify(result.four_agreements || []),
      power_control_wheel: JSON.stringify(result.power_control_wheel || []),
      shame_guilt_analysis: JSON.stringify(result.shame_guilt_analysis || []),
      halo_effect_analysis: JSON.stringify(result.halo_effect_analysis || {}),
      stockholm_syndrome_analysis: JSON.stringify(result.stockholm_syndrome_analysis || {}),
      gaslighting_analysis: JSON.stringify(result.gaslighting_analysis || {}),
      coping_strategies: JSON.stringify(result.coping_strategies || []),
      cognitive_dissonance_analysis: JSON.stringify(result.cognitive_dissonance_analysis || {}),
      cognitive_biases_analysis: JSON.stringify(result.cognitive_biases_analysis || []),
      thank_you_power_analysis: JSON.stringify(result.thank_you_power_analysis || []),
      intent_vs_impact_analysis: JSON.stringify(result.intent_vs_impact_analysis || {}),
    });

    await refetch();
    setScrollTargetId(created.id);
    setForm(emptyForm);
    } catch (err) {
      toast({ title: t('common.error'), description: err?.message || 'Analysis failed. Please try again.', variant: 'destructive' });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleManualSave = async () => {
    if (!form.first_thought.trim()) return;
    const created = await createMutation.mutateAsync(form);
    await refetch();
    setScrollTargetId(created.id);
    setForm(emptyForm);
  };

  const fields = [
    { key: 'situation', label: t('common.situation'), placeholder: t('thinkingReport.situationPlaceholder') },
    { key: 'first_thought', label: t('common.firstThought'), placeholder: t('thinkingReport.firstThoughtPlaceholder') },
    { key: 'feelings', label: t('common.feelings'), placeholder: t('thinkingReport.feelingsPlaceholder') },
    { key: 'behavior', label: t('common.behavior'), placeholder: t('thinkingReport.behaviorPlaceholder') },
    { key: 'disputing_thought', label: t('common.disputingThought'), placeholder: t('thinkingReport.disputingThoughtPlaceholder') },
    { key: 'replacement_thought', label: t('common.replacementThought'), placeholder: t('thinkingReport.replacementThoughtPlaceholder') },
    { key: 'associated_belief', label: t('common.associatedBelief'), placeholder: t('thinkingReport.associatedBeliefPlaceholder') },
  ];

  return (
    <div className="space-y-8">
      <AnimatePresence>
        {isProcessing && <AILoadingOverlay message={t('thinkingReport.analyzing')} />}
      </AnimatePresence>

      <div>
        <h1 className="text-3xl font-display font-bold tracking-tight">{t('thinkingReport.title')}</h1>
        <p className="text-muted-foreground mt-2">
          {t('thinkingReport.subtitle')}
        </p>
      </div>

      <Card className="border-border/50 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <Brain className="w-4 h-4 text-primary" />
              {t('thinkingReport.newReport')}
            </CardTitle>
            <VoiceInput onTranscript={handleVoiceTranscript} />
          </div>
          <p className="text-xs text-muted-foreground">{t('thinkingReport.micInstruction')}</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {fields.map((field) => (
              <div key={field.key} className={field.key === 'situation' ? 'md:col-span-2' : ''}>
                <Label className="text-sm font-medium mb-1.5 block">{field.label}</Label>
                <Textarea
                  placeholder={field.placeholder}
                  value={form[field.key]}
                  onChange={(e) => handleChange(field.key, e.target.value)}
                  onFocus={() => setActiveField(field.key)}
                  className={`min-h-[70px] resize-none transition-all ${activeField === field.key ? 'ring-2 ring-primary/30' : ''}`}
                />
              </div>
            ))}
          </div>
          <div className="flex flex-col gap-3 pt-2 sm:flex-row">
            <Button onClick={handleAIGenerate} disabled={!form.first_thought.trim()} className="select-none">
              <Sparkles className="w-4 h-4 mr-2" />
              {t('thinkingReport.aiCompleteSave')}
            </Button>
            <Button variant="outline" onClick={handleManualSave} disabled={!form.first_thought.trim()} className="select-none">
              {t('thinkingReport.saveAsIs')}
            </Button>
          </div>
        </CardContent>
      </Card>

      <PullToRefreshWrapper onRefresh={refetch}>
        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2">
            {[1, 2].map(i => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-5 space-y-3">
                  {[1, 2, 3, 4].map(j => <div key={j} className="h-12 bg-muted rounded-lg" />)}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : reports.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2">
            {reports.map((report, i) => (
              <div key={report.id} data-report-id={report.id} className="transition-shadow duration-500">
                <ThinkingReportCard report={report} onDelete={(id) => deleteMutation.mutate(id)} index={i} />
              </div>
            ))}
          </div>
        ) : (
          <Card className="border-dashed">
            <CardContent className="p-12 text-center">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Plus className="w-6 h-6 text-primary" />
              </div>
              <p className="font-medium mb-1">{t('thinkingReport.noReports')}</p>
              <p className="text-sm text-muted-foreground">{t('thinkingReport.noReportsDesc')}</p>
            </CardContent>
          </Card>
        )}
      </PullToRefreshWrapper>
    </div>
  );
}