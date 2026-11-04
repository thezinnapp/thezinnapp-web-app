// Shared prompt text for the 12 common cognitive biases analysis.
// Injected into Thinking Report, Self-Awareness, and Spiritual AI prompts.
export const COGNITIVE_BIASES_PROMPT = `COGNITIVE BIASES ANALYSIS — Analyze the text for indicators of EACH of the following 12 cognitive biases. For EACH bias, return a JSON object with: bias (the bias name), detected (true if present, false otherwise), indicator (a 1-2 sentence description of how it appears, empty string if not detected), definition (a clear, plain-language definition of the bias so the user understands what it is), and recommendation (a specific recommendation for addressing it, empty string if not detected).

1. Anchoring Bias — The tendency to rely too heavily on the first piece of information encountered (the "anchor") when making decisions or judgments, even when that information is irrelevant.
2. Availability Heuristic — Overestimating the likelihood or importance of events based on how easily examples come to mind, rather than on objective probability.
3. Bandwagon Effect — Adopting beliefs, attitudes, or behaviors because "everyone else is doing it," rather than through independent evaluation.
4. Choice-Supportive Bias — Retroactively assigning positive attributes to a choice one has made while downplaying alternatives, to reduce post-decision dissonance.
5. Confirmation Bias — Seeking, interpreting, or remembering information in a way that confirms preexisting beliefs while ignoring or dismissing contradictory evidence.
6. Ostrich Bias — The tendency to ignore or avoid negative information by "burying one's head in the sand" rather than confronting uncomfortable realities.
7. Outcome Bias — Judging a decision based on its eventual outcome rather than on the quality of the decision process at the time it was made.
8. Overconfidence Bias — Overestimating one's own abilities, knowledge, or the accuracy of one's predictions and judgments.
9. Placebo Bias — Experiencing a perceived improvement in condition due to expectations or beliefs rather than any actual treatment effect.
10. Survivorship Bias — Focusing only on the people or things that "survived" a process while overlooking those that did not, leading to false conclusions.
11. Selective Perception — Allowing expectations to influence perception, causing one to selectively notice and interpret information consistent with expectations while filtering out the rest.
12. Blind Spot Bias — The tendency to recognize cognitive biases in others while failing to see them in oneself (also known as bias blind spot).`;

// Shared prompt text for Tony Robbins' 6 Human Needs analysis.
// Injected into Maslow and Journal AI prompts.
export const HUMAN_NEEDS_PROMPT = `TONY ROBBINS' 6 HUMAN NEEDS ANALYSIS — Tony Robbins identified 6 fundamental human needs that drive all behavior. Analyze the text for indicators of EACH of the following 6 needs. For EACH need, return a JSON object with: need (the need name), detected (true if this need appears to be driving the thoughts, feelings, or behaviors, false otherwise), indicator (a 1-2 sentence description of how it manifests in this entry, empty string if not detected), definition (a clear, plain-language definition of the need so the user understands what it is), and recommendation (a specific, actionable recommendation for addressing this need in a healthy way, empty string if not detected).

1. Certainty — The need for security, stability, comfort, and predictability. People meet this need by controlling their environment, seeking routine, or avoiding risk. An over-reliance on certainty can lead to rigidity, fear of change, or staying in unhealthy but familiar situations.
2. Variety (Uncertainty) — The need for change, challenge, novelty, and stimulation. People meet this need through new experiences, risk-taking, or disruption. An excessive drive for variety can lead to impulsivity, instability, or self-sabotaging behavior.
3. Significance — The need to feel important, special, unique, or worthy of attention. People meet this need through achievement, status, helping others, or — negatively — through domination, victimhood, or destructive behavior. An unhealthy pursuit of significance can lead to arrogance, comparison, or people-pleasing.
4. Connection (Love) — The need for love, intimacy, belonging, and connection with others. People meet this need through relationships, community, or spirituality. A deficit can lead to isolation, codependency, or tolerating abusive relationships to avoid being alone.
5. Growth — The need for emotional, intellectual, and spiritual development. People meet this need through learning, overcoming challenges, and expanding their capacity. Stagnation in growth can lead to boredom, apathy, or a sense that life has lost meaning.
6. Contribution — The need to give beyond oneself, to serve, help, and make a difference in the lives of others and the world. People meet this need through volunteering, mentoring, parenting, or creative work. A lack of contribution can lead to emptiness, self-centeredness, or a feeling that one's life lacks purpose.`;

// Shared prompt text for Deborah Norville's "Thank You Power" gratitude analysis.
// Injected into Thinking Report, Self-Awareness, Maslow, and Spiritual AI prompts.
export const THANK_YOU_POWER_PROMPT = `THANK YOU POWER (GRATITUDE ANALYSIS) — Based on Deborah Norville's book "Thank You Power: Making the Science of Gratitude Work for You." Expressing gratitude is a scientifically proven catalyst for unlocking your full potential. By actively acknowledging the good in your life, you can undo the negative effects of stress, boost physical health, increase resilience, and build stronger relationships. Analyze the text for indicators of EACH of the following 5 guiding principles. For EACH principle, return a JSON object with: principle (the principle name exactly as written below), detected (true if this principle is relevant or needed based on the entry's content, false otherwise), indicator (a 1-2 sentence description of how it appears or why it's needed, empty string if not detected), definition (a clear, plain-language definition of the principle so the user understands what it is), and recommendation (a specific, actionable recommendation for applying this principle to the user's situation, empty string if not detected).

1. Gratitude as a Buffer — Regularly counting your blessings acts as a shield against stress, reversing its toxic effects on the body and mind. Look for signs of stress, overwhelm, anxiety, or negativity that gratitude could help buffer against.
2. The Science of "Thank You" — The merging of behavioral research with the spiritual understanding that giving thanks brings both mental and emotional rewards, ultimately making you a more innovative problem-solver. Look for signs of rigid, pessimistic, or black-and-white thinking that gratitude could help reframe into a more creative, open mindset.
3. The Metronome of Life — Rather than only celebrating monumental milestones, this principle advocates for a continuous, steady cadence of appreciation — finding "magic in the mundane" slivers of everyday life. Look for signs that the person overlooks small daily positives, takes everyday blessings for granted, or only acknowledges big events.
4. Actionable Appreciation — Cultivating gratitude through deliberate practices like keeping a daily gratitude journal or vocalizing sincere thanks to others. Look for signs that the person could benefit from concrete, structured gratitude practices.
5. Professional and Social Benefits — Conscious gratitude improves interpersonal dynamics, making you more empathetic and optimistic, which can directly enhance your professional reputation and performance. Look for signs of interpersonal conflict, isolation, pessimism, or strained relationships that gratitude could help address.`;

// Shared JSON schema for the Thank You Power gratitude analysis array in LLM responses.
export const INTENT_VS_IMPACT_PROMPT = `INTENT vs IMPACT ANALYSIS — Detect whether the user's words or actions reveal a gap between their INTENT and the IMPACT on others. ONLY set detected=true when it is clear that the user states or implies that what they said or did wasn't their intention, or they didn't "mean" for something to have happened, or they didn't intend to cause someone to feel a certain way (for example: "I didn't mean to hurt them," "that wasn't my intention," "I was only joking," "I didn't want them to feel that way," "I didn't mean it like that," "it came out wrong"). If the entry shows no such intent-impact gap, set detected=false and leave every other field as an empty string.

When detected, use the following reference to define Intent vs Impact and to remind the user of the difference:

INTENT vs IMPACT
What is Intent?
- Internal goal: What is in your mind.
- Your plan: What you aim to do.
- Hidden: Others cannot see it unless you share it.
- Personal: Based on how you see yourself.
What is Impact?
- Real result: What actually happens.
- How it lands: How others receive your words.
- Visible: Seen and felt by other people.
- Not personal: Shaped by the other person's past and feelings.
Why the Difference Matters
- Good hearts cause hurt: You can mean well and still upset someone.
- Fixing the result: Focus on the hurt caused, not just your good goal.
- Better talks: Listen when someone says you hurt them instead of arguing your goal.

Return a JSON object with:
- detected: true if an intent-impact gap is present, false otherwise
- indicator: a 1-2 sentence description of how it appears in this entry, quoting or paraphrasing the specific statement or inference (empty string if not detected)
- intent_definition: a clear, plain-language definition of Intent based on the reference above (empty string if not detected)
- impact_definition: a clear, plain-language definition of Impact based on the reference above (empty string if not detected)
- why_it_matters: the reminder of why the difference matters, based on the reference above (empty string if not detected)
- recommendation: a specific, compassionate recommendation that helps the user own the impact of their words or actions rather than defending their intent (empty string if not detected)`;

export const INTENT_VS_IMPACT_SCHEMA = {
  type: "object",
  properties: {
    detected: { type: "boolean" },
    indicator: { type: "string" },
    intent_definition: { type: "string" },
    impact_definition: { type: "string" },
    why_it_matters: { type: "string" },
    recommendation: { type: "string" },
  },
};

export const THANK_YOU_POWER_SCHEMA = {
  type: 'array',
  items: {
    type: 'object',
    properties: {
      principle: { type: 'string' },
      detected: { type: 'boolean' },
      indicator: { type: 'string' },
      definition: { type: 'string' },
      recommendation: { type: 'string' },
    },
  },
};

// Shared JSON schema for the 6 Human Needs array in LLM responses.
export const HUMAN_NEEDS_SCHEMA = {
  type: 'array',
  items: {
    type: 'object',
    properties: {
      need: { type: 'string' },
      detected: { type: 'boolean' },
      indicator: { type: 'string' },
      definition: { type: 'string' },
      recommendation: { type: 'string' },
    },
  },
};

// Shared JSON schema for the cognitive biases array in LLM responses.
export const COGNITIVE_BIASES_SCHEMA = {
  type: 'array',
  items: {
    type: 'object',
    properties: {
      bias: { type: 'string' },
      detected: { type: 'boolean' },
      indicator: { type: 'string' },
      definition: { type: 'string' },
      recommendation: { type: 'string' },
    },
  },
};

// Maps app language codes to full language names for LLM prompt injection.
const LANGUAGE_NAMES = {
  en: 'English',
  es: 'Spanish',
  fr: 'French',
  pt: 'Portuguese',
  ru: 'Russian',
  zh: 'Chinese (Simplified)',
  hi: 'Hindi',
  ar: 'Arabic',
  bn: 'Bengali',
  ur: 'Urdu',
  ja: 'Japanese',
  af: 'Afrikaans',
  zu: 'Zulu',
  xh: 'Xhosa',
};

export function getLanguageName(code) {
  return LANGUAGE_NAMES[code] || 'English';
}

// Returns an instruction string appended to AI prompts so generated content
// is produced in the user's selected app language. Empty for English (default).
export function getLanguageInstruction(language) {
  const name = getLanguageName(language);
  if (!language || language === 'en') return '';
  return `\n\nIMPORTANT: Write ALL generated text entirely in ${name}. This includes every human-readable string in your response — analysis, recommendations, affirmations, philosophies, explanations, descriptions, corrections, scripts, summaries, cognitive distortions, distorted thinking patterns, avoidance/diversion/aggression tactics, stances, Four Agreements names and relevance, Power & Control Wheel components/indicators/recommendations, and shame & guilt indicators/references/recommendations, and Halo Effect indicators/definitions/recommendations, and Stockholm Syndrome indicators/definitions/recommendations, and Gaslighting indicators/definitions/recommendations, and Coping Strategies (strategy names, what each addresses, and implementation steps), and Cognitive Dissonance indicators/definitions/recommendations, and Cognitive Biases (bias names, indicators, definitions, and recommendations), and Tony Robbins' 6 Human Needs (need names, indicators, definitions, and recommendations), and Thank You Power gratitude principles (principle names, indicators, definitions, and recommendations), and Intent vs Impact (indicator, intent definition, impact definition, why the difference matters, and recommendation). The user's app language is set to ${name}, so every human-readable string in your response must be in ${name}. Do not leave any field in English.`;
}