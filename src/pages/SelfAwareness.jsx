import { useState, useMemo } from 'react';
import { toast } from '@/components/ui/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Sparkles, BookOpen, Calendar, ChevronLeft, ChevronRight, Flag } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import AILoadingOverlay from '@/components/shared/AILoadingOverlay';
import VoiceInput from '@/components/shared/VoiceInput';
import JournalEntryCard from '@/components/journal/JournalEntryCard';
import MonthlyCalendarView from '@/components/journal/MonthlyCalendarView';
import MonthlyAnalysisInlineCard from '@/components/journal/MonthlyAnalysisInlineCard';
import { useTranslation } from '@/hooks/useTranslation';
import { getLanguageInstruction, COGNITIVE_BIASES_PROMPT, COGNITIVE_BIASES_SCHEMA, HUMAN_NEEDS_PROMPT, HUMAN_NEEDS_SCHEMA, THANK_YOU_POWER_PROMPT, THANK_YOU_POWER_SCHEMA, INTENT_VS_IMPACT_PROMPT, INTENT_VS_IMPACT_SCHEMA } from '@/lib/aiLanguage';
import { useScrollToNew } from '@/hooks/useScrollToNew';

const MONTH_KEYS = ['january','february','march','april','may','june','july','august','september','october','november','december'];

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
    daysInMonth: new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate(),
  };
}

export default function SelfAwareness() {
  const { t, language } = useTranslation();
  const now = useMemo(() => getNow(), []);
  const prevMonthInfo = useMemo(() => {
    const month = now.month === 1 ? 12 : now.month - 1;
    const year = now.month === 1 ? now.year - 1 : now.year;
    const lastDay = new Date(year, month, 0).getDate();
    return { month, year, lastDay };
  }, [now]);
  const [thoughts, setThoughts] = useState('');
  const [feelings, setFeelings] = useState('');
  const [reactions, setReactions] = useState('');
  const [workOn, setWorkOn] = useState('');
  const [gratefulFor, setGratefulFor] = useState('');
  const [activeField, setActiveField] = useState('thoughts');
  const [isAnalyzingDay, setIsAnalyzingDay] = useState(false);
  const [isAnalyzingMonth, setIsAnalyzingMonth] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [calMonth, setCalMonth] = useState(now.month);
  const [calYear, setCalYear] = useState(now.year);
  const [tab, setTab] = useState('journal');

  const monthName = (m) => t(`months.${MONTH_KEYS[m - 1]}`);

  const queryClient = useQueryClient();

  const { data: entries = [], isLoading, refetch: refetchEntries } = useQuery({
    queryKey: ['journal-entries'],
    queryFn: () => base44.entities.JournalEntry.list('-created_date'),
  });

  const { data: monthlyAnalyses = [], refetch: refetchMonthly } = useQuery({
    queryKey: ['monthly-analyses'],
    queryFn: () => base44.entities.MonthlyAnalysis.list('-created_date'),
  });

  const setScrollTargetEntry = useScrollToNew('data-entry-id', entries);
  const setScrollTargetMonthly = useScrollToNew('data-monthly-id', monthlyAnalyses);

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.JournalEntry.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['journal-entries'] }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.JournalEntry.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['journal-entries'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.JournalEntry.delete(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['journal-entries'] });
      const prev = queryClient.getQueryData(['journal-entries']);
      queryClient.setQueryData(['journal-entries'], old => (old || []).filter(e => e.id !== id));
      return { prev };
    },
    onError: (_, __, ctx) => queryClient.setQueryData(['journal-entries'], ctx.prev),
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['journal-entries'] }),
  });

  const createMonthlyMutation = useMutation({
    mutationFn: (data) => base44.entities.MonthlyAnalysis.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['monthly-analyses'] }),
  });

  const handleVoiceTranscript = (text) => {
    if (activeField === 'thoughts') setThoughts(p => p ? p + ' ' + text : text);
    else if (activeField === 'feelings') setFeelings(p => p ? p + ' ' + text : text);
    else if (activeField === 'reactions') setReactions(p => p ? p + ' ' + text : text);
    else if (activeField === 'workOn') setWorkOn(p => p ? p + ' ' + text : text);
    else setGratefulFor(p => p ? p + ' ' + text : text);
  };

  const handleSaveEntry = async () => {
    if (!thoughts && !feelings && !reactions && !workOn && !gratefulFor) return;
    setIsSaving(true);
    const n = getNow();
    const created = await createMutation.mutateAsync({
      thoughts,
      feelings,
      reactions,
      work_on: workOn,
      grateful_for: gratefulFor,
      entry_date: n.date,
      entry_time: n.time,
      day_of_week: n.day,
      });

      await refetchEntries();
      setScrollTargetEntry(created.id);
      setThoughts('');
    setFeelings('');
    setReactions('');
    setWorkOn('');
    setGratefulFor('');
    setIsSaving(false);
  };

  const handleAnalyzeDay = async () => {
    const todayEntries = entries.filter(e => e.entry_date === now.date && !e.ai_recommendations);
    if (todayEntries.length === 0) return;
    setIsAnalyzingDay(true);
    try {

    for (const entry of todayEntries) {
      const combined = [entry.thoughts, entry.feelings, entry.reactions].filter(Boolean).join(' ');
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a self-awareness coach, cognitive behavioral therapist, and domestic violence awareness specialist. Analyze the following journal entry (thoughts, feelings, and reactions) and:
    1. Score the language on a scale of 0-100 where 0 = entirely anti-social/self-defeating and 100 = entirely pro-social/growth-oriented. Base this on counting pro-social words (growth, gratitude, empathy, calm, connection, courage, etc.) vs anti-social words (hate, fear, worthless, blame, anger, isolation, etc.).
    2. Identify patterns in thinking, feeling, and reacting.
    3. Give 3-5 specific, actionable self-awareness recommendations.
    4. Identify which of the Four Agreements (by Don Miguel Ruiz) the user should be reminded of:
    - "Be Impeccable with Your Word" — speaking with integrity, being authentic
    - "Don't Take Anything Personally" — not internalizing others' actions or judgments
    - "Don't Make Assumptions" — asking questions and seeking clarity instead of assuming
    - "Always Do Your Best" — giving your best effort without self-judgment or perfectionism
    For each applicable agreement, briefly explain how it relates to this entry.

    5. Check for Power & Control Wheel warning signs (indicators of abusive or controlling dynamics):
    - PHYSICAL VIOLENCE: harmful actions, threats of harm
    - SEXUAL VIOLENCE: sexual coercion, unwanted contact, reproductive control
    - THREATS & INTIMIDATION: threats, intimidating behavior, property destruction
    - EMOTIONAL ABUSE: name-calling, manipulation, making someone feel unworthy
    - ISOLATION: limiting contact with family/friends, controlling movement
    - MINIMIZING, DENYING & BLAMING: downplaying harm, refusing responsibility, victim-blaming
    - USING CHILDREN: threatening custody, using kids as messengers, involving them in conflict
    - ECONOMIC ABUSE: controlling finances, preventing work, financial exploitation
    For each warning sign found, provide: component name, the specific indicator from this entry, risk level (low/medium/high), and a compassionate recommendation.

    6. Shame & Guilt Analysis (based on "Healing the Shame That Binds You" by John Bradshaw, and "Shame and Guilt" by June Price Tangney & Rhonda L. Dearing):
    Identify any indicators of guilt and/or shame in the thoughts, feelings, and reactions. Distinguish between:
    - SHAME: a global, identity-level feeling of "I am bad / worthless / defective" — toxic shame that binds the person (per Bradshaw), shame-based self-talk, hiding, perfectionism, rage, or contempt directed at the self.
    - GUILT: a specific, behavior-level feeling of "I did a bad thing" (per Tangney & Dearing) — adaptive guilt that motivates repair, or maladaptive/excessive guilt.
    For each indicator found, provide: type (shame or guilt), the specific indicator from this entry, the relevant reference/concept from Bradshaw or Tangney & Dearing, and a compassionate recommendation drawing on the relevant reference literature. If none is present, return an empty array.

    7. The Halo Effect (Cognitive Bias Analysis):
    The Halo Effect is a cognitive bias where a positive overall impression of a person, thing, or situation leads to inflated positive judgments about specific traits, or where one prominent positive or negative trait colors the perception of everything else about that person or situation.
    Analyze the thoughts, feelings, and reactions for indicators of the Halo Effect — e.g., overgeneralizing someone's worth based on one trait, judging an entire situation based on a single positive or negative aspect, or letting one impression dominate all subsequent evaluations.
    Return a JSON object with:
    - detected: true if the Halo Effect is present, false otherwise
    - indicator: a 1-2 sentence description of how it appears in this entry (empty string if not detected)
    - definition: a clear, plain-language definition of the Halo Effect so the user understands what it is
    - recommendation: a specific recommendation for addressing it (empty string if not detected)

    8. The Stockholm Syndrome (Psychological Bond Analysis):
    The Stockholm Syndrome is a psychological response in which hostages or abuse victims develop a bond, empathy, or positive feelings toward their captors or abusers, often defending them and resisting rescue or intervention. It can also manifest in non-captive relationships (e.g., abusive partnerships, cults, toxic workplaces) where the victim identifies with and protects the person causing them harm.
    Analyze the thoughts, feelings, and reactions for indicators of Stockholm Syndrome — e.g., defending or justifying someone who is harming the user, expressing loyalty or positive feelings toward an abuser/controller, minimizing abuse while emphasizing the abuser's good side, resisting help or intervention, or feeling reluctant to leave a harmful situation.
    Return a JSON object with:
    - detected: true if Stockholm Syndrome indicators are present, false otherwise
    - indicator: a 1-2 sentence description of how it appears in this entry (empty string if not detected)
    - definition: a clear, plain-language definition of Stockholm Syndrome so the user understands what it is
    - recommendation: a specific, compassionate recommendation for addressing it (empty string if not detected)

    9. Gaslighting (Psychological Manipulation Analysis):
    Gaslighting is a form of psychological manipulation in which the abuser attempts to sow self-doubt and confusion in their victim's mind by denying reality, distorting facts, trivializing feelings, or shifting blame — causing the victim to question their own memory, perception, or sanity. It can also appear as self-gaslighting, where the user dismisses or doubts their own valid feelings and perceptions.
    Analyze the thoughts, feelings, and reactions for indicators of Gaslighting — either being gaslit by someone else (e.g., the user describes someone denying events the user knows happened, telling the user they are too sensitive or crazy, shifting blame onto the user, or twisting the user's words) OR self-gaslighting (e.g., the user dismissing their own feelings as invalid, doubting their own memory, telling themselves they are overreacting, or minimizing their own valid concerns).
    Return a JSON object with:
    - detected: true if Gaslighting indicators are present, false otherwise
    - indicator: a 1-2 sentence description of how it appears in this entry (empty string if not detected)
    - definition: a clear, plain-language definition of Gaslighting so the user understands what it is
    - recommendation: a specific, compassionate recommendation for addressing it (empty string if not detected)

    10. Coping Strategies:
    Based on ALL the findings from the analysis above (patterns, Four Agreements, Power & Control Wheel, shame & guilt, Halo Effect, Stockholm Syndrome, Gaslighting, Cognitive Dissonance, Intent vs Impact, and the 12 Cognitive Biases), recommend 3-5 specific, actionable Coping Strategies that directly address the specific needs and issues identified in this entry.
    Each coping strategy must be tailored to the specific findings — do not give generic advice. For example, if shame was detected, recommend a shame-specific strategy; if gaslighting was detected, recommend a strategy for rebuilding trust in one's own perception; if anti-social patterns were identified, recommend a strategy for that specific pattern.
    For each coping strategy, provide:
    - strategy: a clear, concise name/title for the coping strategy
    - addresses: which specific finding or need from the analysis this strategy addresses
    - steps: concrete, step-by-step instructions for implementing this strategy

    11. Cognitive Dissonance (Psychological Conflict Analysis):
    Cognitive Dissonance is the mental discomfort or tension that arises when a person holds two or more contradictory beliefs, values, or ideas simultaneously, or when their behavior conflicts with their beliefs. Common signs include rationalizing contradictions, justifying behavior that goes against one's values, feeling uneasy about conflicting thoughts, or changing one's beliefs to reduce the discomfort.
    Analyze the thoughts, feelings, and reactions for indicators of Cognitive Dissonance — e.g., the user's thoughts or reactions contradict their stated beliefs or values, they are rationalizing or justifying a contradiction, they express discomfort about holding conflicting views, or they are modifying their beliefs to reduce tension.
    Return a JSON object with:
    - detected: true if Cognitive Dissonance indicators are present, false otherwise
    - indicator: a 1-2 sentence description of how it appears in this entry (empty string if not detected)
    - definition: a clear, plain-language definition of Cognitive Dissonance so the user understands what it is
    - recommendation: a specific, compassionate recommendation for addressing it (empty string if not detected)

    12. ${COGNITIVE_BIASES_PROMPT}

    13. ${HUMAN_NEEDS_PROMPT}

    14. ${THANK_YOU_POWER_PROMPT}

    15. ${INTENT_VS_IMPACT_PROMPT}

    Journal Entry:
    Thoughts: ${entry.thoughts || 'Not provided'}
    Feelings: ${entry.feelings || 'Not provided'}
    Reactions: ${entry.reactions || 'Not provided'}

    Date: ${entry.entry_date}, ${entry.day_of_week}${getLanguageInstruction(language)}`,
        response_json_schema: {
          type: 'object',
          properties: {
            pro_social_score: { type: 'number' },
            recommendations: { type: 'string' },
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
            human_needs_analysis: HUMAN_NEEDS_SCHEMA,
            thank_you_power_analysis: THANK_YOU_POWER_SCHEMA,
            intent_vs_impact_analysis: INTENT_VS_IMPACT_SCHEMA,
          },
        },
      });

      const score = Math.max(0, Math.min(100, result.pro_social_score ?? 50));
      await updateMutation.mutateAsync({
        id: entry.id,
        data: {
          ai_recommendations: result.recommendations,
          pro_social_score: score,
          flag: score >= 50 ? 'green' : 'red',
          four_agreements: JSON.stringify(result.four_agreements || []),
          power_control_wheel: JSON.stringify(result.power_control_wheel || []),
          shame_guilt_analysis: JSON.stringify(result.shame_guilt_analysis || []),
          halo_effect_analysis: JSON.stringify(result.halo_effect_analysis || {}),
          stockholm_syndrome_analysis: JSON.stringify(result.stockholm_syndrome_analysis || {}),
          gaslighting_analysis: JSON.stringify(result.gaslighting_analysis || {}),
          coping_strategies: JSON.stringify(result.coping_strategies || []),
          cognitive_dissonance_analysis: JSON.stringify(result.cognitive_dissonance_analysis || {}),
          cognitive_biases_analysis: JSON.stringify(result.cognitive_biases_analysis || []),
          human_needs_analysis: JSON.stringify(result.human_needs_analysis || []),
          thank_you_power_analysis: JSON.stringify(result.thank_you_power_analysis || []),
          intent_vs_impact_analysis: JSON.stringify(result.intent_vs_impact_analysis || {}),
        },
      });
    }
    } catch (err) {
      toast({ title: t('common.error'), description: err?.message || 'Analysis failed. Please try again.', variant: 'destructive' });
    } finally {
      setIsAnalyzingDay(false);
    }
  };

  const analyzeMonth = async (targetMonth, targetYear) => {
    const monthStr = String(targetMonth).padStart(2, '0');
    const monthEntries = entries.filter(e => e.entry_date?.startsWith(`${targetYear}-${monthStr}`));
    if (monthEntries.length === 0) return;
    setIsAnalyzingMonth(true);
    try {

    const byDay = {};
    monthEntries.forEach(e => {
      const d = new Date(e.entry_date + 'T00:00:00').getDate();
      if (!byDay[d]) byDay[d] = [];
      byDay[d].push(e);
    });

    const dayTexts = Object.entries(byDay).sort(([a], [b]) => Number(a) - Number(b)).map(([day, es]) => {
      const combined = es.map(e =>
        [e.thoughts && `T: ${e.thoughts}`, e.feelings && `F: ${e.feelings}`, e.reactions && `R: ${e.reactions}`]
          .filter(Boolean).join('. ')
      ).join(' | ');
      return `Day ${day}: ${combined}`;
    }).join('\n');

    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `You are a self-awareness and cognitive behavioral therapy expert. Analyze the following month of journal entries (one entry per day) for ${monthName(targetMonth)} ${targetYear}:

${dayTexts}

Provide:
1. PRO-SOCIAL PATTERNS: Recurring pro-social thoughts, feelings, and reactions seen throughout the month
2. ANTI-SOCIAL PATTERNS: Recurring anti-social, self-defeating, or avoidant patterns seen throughout the month
3. OVERALL SUMMARY: Key growth areas and actionable next steps for the coming month${getLanguageInstruction(language)}`,
      response_json_schema: {
        type: 'object',
        properties: {
          pro_social_patterns: { type: 'string' },
          anti_social_patterns: { type: 'string' },
          overall_summary: { type: 'string' },
        },
      },
    });

    const dailyFlags = {};
    monthEntries.forEach(e => {
      const d = new Date(e.entry_date + 'T00:00:00').getDate();
      if (e.flag) dailyFlags[d] = e.flag;
    });

    const created = await createMonthlyMutation.mutateAsync({
      month: targetMonth,
      year: targetYear,
      month_label: `${monthName(targetMonth)} ${targetYear}`,
      pro_social_patterns: result.pro_social_patterns,
      anti_social_patterns: result.anti_social_patterns,
      overall_summary: result.overall_summary,
      daily_flags: JSON.stringify(dailyFlags),
    });

    await refetchMonthly();
    setScrollTargetMonthly(created.id);
    } catch (err) {
      toast({ title: t('common.error'), description: err?.message || 'Analysis failed. Please try again.', variant: 'destructive' });
    } finally {
      setIsAnalyzingMonth(false);
    }
  };

  const handleAnalyzeMonth = () => analyzeMonth(now.month, now.year);
  const handleAnalyzePrevMonth = () => analyzeMonth(prevMonthInfo.month, prevMonthInfo.year);

  const prevMonth = () => {
    if (calMonth === 1) { setCalMonth(12); setCalYear(y => y - 1); }
    else setCalMonth(m => m - 1);
  };
  const nextMonth = () => {
    const n2 = getNow();
    if (calYear > n2.year || (calYear === n2.year && calMonth >= n2.month)) return;
    if (calMonth === 12) { setCalMonth(1); setCalYear(y => y + 1); }
    else setCalMonth(m => m + 1);
  };

  const calEntries = useMemo(() => {
    const monthStr = String(calMonth).padStart(2, '0');
    return entries.filter(e => e.entry_date?.startsWith(`${calYear}-${monthStr}`));
  }, [entries, calMonth, calYear]);

  const currentMonthAnalysis = monthlyAnalyses.find(a => a.month === now.month && a.year === now.year);
  const prevMonthAnalysis = monthlyAnalyses.find(a => a.month === prevMonthInfo.month && a.year === prevMonthInfo.year);
  const isLastDayOfMonth = now.dayOfMonth === now.daysInMonth;
  const canCatchUp = now.dayOfMonth <= 27;
  const prevMonthStr = String(prevMonthInfo.month).padStart(2, '0');
  const hasPrevMonthEntries = entries.some(e => e.entry_date?.startsWith(`${prevMonthInfo.year}-${prevMonthStr}`));

  const todayUnanalyzed = entries.filter(e => e.entry_date === now.date && !e.ai_recommendations).length;

  const fieldButtons = [
    { key: 'thoughts', label: t('common.thoughts') },
    { key: 'feelings', label: t('common.feelings') },
    { key: 'reactions', label: t('common.reactions') },
    { key: 'workOn', label: t('selfAwareness.workOn') },
    { key: 'gratefulFor', label: t('selfAwareness.gratefulFor') },
  ];

  return (
    <div className="space-y-6">
      <AnimatePresence>
        {isAnalyzingDay && <AILoadingOverlay message={t('selfAwareness.analyzingDay')} />}
        {isAnalyzingMonth && <AILoadingOverlay message={t('selfAwareness.analyzingMonth')} />}
      </AnimatePresence>

      <div>
        <h1 className="text-3xl font-display font-bold tracking-tight">{t('selfAwareness.title')}</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          {now.day}, {monthName(now.month)} {now.dayOfMonth}, {now.year}
        </p>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => setTab('journal')}
          className={`select-none flex-1 min-w-0 flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
            tab === 'journal' ? 'bg-primary text-primary-foreground shadow' : 'bg-muted text-muted-foreground hover:text-foreground'
          }`}
        >
          <BookOpen className="w-4 h-4 shrink-0" /> <span className="whitespace-normal text-center leading-tight break-words">{t('selfAwareness.journal')}</span>
        </button>
        <button
          onClick={() => setTab('calendar')}
          className={`select-none flex-1 min-w-0 flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
            tab === 'calendar' ? 'bg-primary text-primary-foreground shadow' : 'bg-muted text-muted-foreground hover:text-foreground'
          }`}
        >
          <Calendar className="w-4 h-4 shrink-0" /> <span className="whitespace-normal text-center leading-tight break-words">{t('selfAwareness.calendar')}</span>
        </button>
      </div>

      {tab === 'journal' && (
        <div className="space-y-5">
          <Card className="border-border/50 shadow-sm bg-gradient-to-br from-card to-primary/5">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-primary" />
                  {t('selfAwareness.newEntry')}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">{now.time}</span>
                  <VoiceInput onTranscript={handleVoiceTranscript} />
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                {now.day} · {monthName(now.month)} {now.dayOfMonth}, {now.year} — {t('selfAwareness.micInstruction')}
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {fieldButtons.map(f => (
                  <button
                    key={f.key}
                    onClick={() => setActiveField(f.key)}
                    className={`select-none text-xs px-3 py-1.5 rounded-lg font-medium transition-all ${
                      activeField === f.key ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              <div className="space-y-3">
                <div>
                   <label className="text-xs font-semibold text-foreground uppercase tracking-wide mb-1.5 block">{t('common.thoughts')}</label>
                  <Textarea
                    placeholder={t('selfAwareness.thoughtsPlaceholder')}
                    value={thoughts}
                    onChange={e => setThoughts(e.target.value)}
                    onFocus={() => setActiveField('thoughts')}
                    className={`resize-none min-h-[80px] transition-all ${activeField === 'thoughts' ? 'ring-2 ring-primary/40' : ''}`}
                  />
                </div>
                <div>
                   <label className="text-xs font-semibold text-foreground uppercase tracking-wide mb-1.5 block">{t('common.feelings')}</label>
                  <Textarea
                    placeholder={t('selfAwareness.feelingsPlaceholder')}
                    value={feelings}
                    onChange={e => setFeelings(e.target.value)}
                    onFocus={() => setActiveField('feelings')}
                    className={`resize-none min-h-[80px] transition-all ${activeField === 'feelings' ? 'ring-2 ring-primary/40' : ''}`}
                  />
                </div>
                <div>
                   <label className="text-xs font-semibold text-foreground uppercase tracking-wide mb-1.5 block">{t('common.reactions')}</label>
                  <Textarea
                    placeholder={t('selfAwareness.reactionsPlaceholder')}
                    value={reactions}
                    onChange={e => setReactions(e.target.value)}
                    onFocus={() => setActiveField('reactions')}
                    className={`resize-none min-h-[80px] transition-all ${activeField === 'reactions' ? 'ring-2 ring-primary/40' : ''}`}
                  />
                </div>
                <div>
                   <label className="text-xs font-semibold text-foreground uppercase tracking-wide mb-1.5 block">{t('selfAwareness.workOnLabel')}</label>
                  <Textarea
                    placeholder={t('selfAwareness.workOnPlaceholder')}
                    value={workOn}
                    onChange={e => setWorkOn(e.target.value)}
                    onFocus={() => setActiveField('workOn')}
                    className={`resize-none min-h-[80px] transition-all ${activeField === 'workOn' ? 'ring-2 ring-primary/40' : ''}`}
                  />
                </div>
                <div>
                   <label className="text-xs font-semibold text-foreground uppercase tracking-wide mb-1.5 block">{t('selfAwareness.gratefulForLabel')}</label>
                  <Textarea
                    placeholder={t('selfAwareness.gratefulForPlaceholder')}
                    value={gratefulFor}
                    onChange={e => setGratefulFor(e.target.value)}
                    onFocus={() => setActiveField('gratefulFor')}
                    className={`resize-none min-h-[80px] transition-all ${activeField === 'gratefulFor' ? 'ring-2 ring-primary/40' : ''}`}
                  />
                </div>
              </div>

              <Button
                onClick={handleSaveEntry}
                disabled={isSaving || (!thoughts && !feelings && !reactions && !workOn && !gratefulFor)}
                className="w-full select-none"
              >
                {t('selfAwareness.saveEntry')}
              </Button>
            </CardContent>
          </Card>

          <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={handleAnalyzeDay}
              disabled={isAnalyzingDay || todayUnanalyzed === 0}
              variant="outline"
              className="select-none gap-2 h-auto py-2 whitespace-normal justify-center text-center"
            >
              <Sparkles className="w-4 h-4 shrink-0" />
              <span className="leading-tight">{t('selfAwareness.analyzeToday')}</span>
              {todayUnanalyzed > 0 && (
                <Badge variant="secondary" className="text-[10px] h-4 px-1.5 shrink-0">{todayUnanalyzed}</Badge>
              )}
            </Button>
            <Button
              onClick={handleAnalyzeMonth}
              disabled={isAnalyzingMonth || !isLastDayOfMonth}
              variant="outline"
              className={`select-none gap-2 h-auto py-2 whitespace-normal justify-center text-center ${!isLastDayOfMonth ? 'opacity-50 cursor-not-allowed' : ''}`}
              title={!isLastDayOfMonth ? t('selfAwareness.availableOnLastDay', { month: monthName(now.month) }) : undefined}
            >
              <Calendar className="w-4 h-4 shrink-0" />
              <span className="leading-tight text-center">{isLastDayOfMonth ? t('selfAwareness.analyzeMonth') : `${t('selfAwareness.monthly')} (${monthName(now.month)} ${now.daysInMonth})`}</span>
            </Button>
          </div>

          {canCatchUp && !prevMonthAnalysis && (
            <Button
              onClick={handleAnalyzePrevMonth}
              disabled={isAnalyzingMonth || !hasPrevMonthEntries}
              variant="outline"
              className="w-full select-none gap-2"
            >
              <Calendar className="w-4 h-4" />
              {t('selfAwareness.catchUpAnalyze', { month: monthName(prevMonthInfo.month), day: prevMonthInfo.lastDay })}
            </Button>
          )}

          {currentMonthAnalysis && (
            <MonthlyAnalysisInlineCard analysis={currentMonthAnalysis} />
          )}
          {prevMonthAnalysis && (
            <MonthlyAnalysisInlineCard analysis={prevMonthAnalysis} />
          )}

          <div>
            <h2 className="text-base font-semibold mb-3">{t('selfAwareness.todaysEntries')}</h2>
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2].map(i => <Card key={i} className="animate-pulse h-20" />)}
              </div>
            ) : entries.filter(e => e.entry_date === now.date).length > 0 ? (
              <div className="space-y-3">
                {entries
                  .filter(e => e.entry_date === now.date)
                  .map((entry, i) => (
                    <div key={entry.id} data-entry-id={entry.id} className="transition-shadow duration-500">
                      <JournalEntryCard
                        entry={entry}
                        onDelete={id => deleteMutation.mutate(id)}
                        index={i}
                      />
                    </div>
                  ))}
              </div>
            ) : (
              <Card className="border-dashed">
                <CardContent className="py-8 text-center">
                  <p className="text-sm text-muted-foreground">{t('selfAwareness.noEntriesToday')}</p>
                </CardContent>
              </Card>
            )}
          </div>

          {entries.filter(e => e.entry_date !== now.date).length > 0 && (
            <div>
              <h2 className="text-base font-semibold mb-3">{t('selfAwareness.pastEntries')}</h2>
              <div className="space-y-3">
                {entries
                  .filter(e => e.entry_date !== now.date)
                  .slice(0, 20)
                  .map((entry, i) => (
                    <JournalEntryCard
                      key={entry.id}
                      entry={entry}
                      onDelete={id => deleteMutation.mutate(id)}
                      index={i}
                    />
                  ))}
              </div>
            </div>
          )}
        </div>
      )}

      {tab === 'calendar' && (
        <div className="space-y-4">
          <Card className="border-border/50">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <button onClick={prevMonth} className="select-none p-2 rounded-lg hover:bg-muted transition-colors">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <h2 className="font-semibold text-base">
                  {monthName(calMonth)} {calYear}
                </h2>
                <button
                  onClick={nextMonth}
                  disabled={calYear === getNow().year && calMonth >= getNow().month}
                  className="select-none p-2 rounded-lg hover:bg-muted transition-colors disabled:opacity-30"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </CardHeader>
            <CardContent>
              <MonthlyCalendarView year={calYear} month={calMonth} entries={calEntries} />
              <div className="flex items-center gap-4 mt-4 justify-center">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Flag className="w-3 h-3 text-emerald-400" style={{ fill: 'currentColor' }} />
                  {t('selfAwareness.proSocialLegend')}
                </div>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Flag className="w-3 h-3 text-red-400" style={{ fill: 'currentColor' }} />
                  {t('selfAwareness.antiSocialLegend')}
                </div>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <div className="w-2 h-2 rounded-full bg-primary/60" />
                  {t('selfAwareness.entryUnscored')}
                </div>
              </div>
            </CardContent>
          </Card>

          {monthlyAnalyses.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-base font-semibold">{t('selfAwareness.monthlyAnalyses')}</h2>
              {monthlyAnalyses.map((ma, i) => (
                <motion.div key={ma.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                  <Card className="border-border/50">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-primary" />
                        {ma.month_label}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-xs">
                      {ma.pro_social_patterns && (
                        <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-3">
                          <p className="font-semibold text-emerald-400 mb-1 flex items-center gap-1">
                            <Flag className="w-3 h-3" style={{ fill: 'currentColor' }} /> {t('common.proSocial')}
                          </p>
                          <p className="text-muted-foreground">{ma.pro_social_patterns}</p>
                        </div>
                      )}
                      {ma.anti_social_patterns && (
                        <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-3">
                          <p className="font-semibold text-red-400 mb-1 flex items-center gap-1">
                            <Flag className="w-3 h-3" style={{ fill: 'currentColor' }} /> {t('common.antiSocial')}
                          </p>
                          <p className="text-muted-foreground">{ma.anti_social_patterns}</p>
                        </div>
                      )}
                      {ma.overall_summary && (
                        <div className="rounded-lg bg-muted/50 p-3">
                          <p className="font-semibold mb-1">{t('selfAwareness.summary')}</p>
                          <p className="text-muted-foreground">{ma.overall_summary}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}