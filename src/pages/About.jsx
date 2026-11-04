import PublicFooter from '@/components/shared/PublicFooter';
import PublicHeader from '@/components/shared/PublicHeader';


export default function About() {
  return (
    <div className="min-h-[100dvh] bg-background flex flex-col">
      <PublicHeader />

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-10">
        <h1 className="font-display text-3xl font-bold tracking-tight mb-6">About The ZINN App</h1>

        <div className="prose prose-sm dark:prose-invert max-w-none space-y-4 text-foreground/90">
          <p>
            The ZINN App is an AI-powered, cognitive behavioral therapy (CBT) based belief
            management tool designed to help you understand, reframe, and grow from your thoughts.
            It lets you record your beliefs, affirmations, and philosophies, then uses artificial
            intelligence to correlate and categorize them as pro-social or anti-social so you can
            see clearly which ideas support your wellbeing and which ones hold you back.
          </p>
          <p>
            You can build structured CBT thinking reports that walk you from a triggering
            situation through your automatic first thought, the feelings and behaviors that
            follow, and finally a healthier replacement thought. The app generates healthy
            boundaries that reinforce your pro-social beliefs, and it explores how unmet needs
            from Maslow's Hierarchy of Needs may be driving your behavior. It also offers
            self-awareness journaling with monthly pattern analysis, and spiritual reflection that
            connects your journal entries to scripture across major world faiths.
          </p>
          <p>
            Throughout, The ZINN App weaves in educational insights drawn from The Four
            Agreements, the Power and Control Wheel, and common cognitive biases including the
            Halo Effect, Gaslighting, Stockholm Syndrome, and Cognitive Dissonance. It is built
            for individuals committed to personal growth, emotional regulation, and recovery who
            want a structured, reflective companion for their daily self-work.
          </p>
          <p>
            The ZINN App is developed by The ZINN App team as an educational self-reflection
            companion. It is not a medical or mental health service, and its AI-generated insights
            are for informational and educational purposes only. Always consult a licensed
            professional for clinical guidance.
          </p>
        </div>
      </main>

      <div className="max-w-3xl mx-auto w-full px-4 pb-10">
        <PublicFooter />
      </div>
    </div>
  );
}