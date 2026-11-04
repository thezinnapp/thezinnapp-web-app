import { Shield } from 'lucide-react';
import PublicHeader from '@/components/shared/PublicHeader';
import { Card, CardContent } from '@/components/ui/card';

const POLICY_TEXT = `PRIVACY POLICY
The ZINN App
Last Updated: November 3, 2026

1. INTRODUCTION

Welcome to The ZINN App ("we," "us," "our," or "the App"). The ZINN App is an AI-powered educational and self-reflection tool that helps users explore their thoughts, beliefs, and emotional patterns through frameworks such as Maslow's Hierarchy of Needs, Cognitive Behavioral Therapy (CBT) principles, The Four Agreements, and other psychological and spiritual frameworks.

This Privacy Policy explains how we collect, use, store, process, and protect your personal data when you use our App. We are committed to being transparent about our data practices, especially because our App processes sensitive personal reflections and psychological self-assessments.

By creating an account and using the App, you acknowledge that you have read and understood this Privacy Policy and consent to the data practices described herein.

2. DATA WE COLLECT

2.1 Account Data
When you register for an account, we collect:
- Your email address (used for authentication and account recovery)
- Your full name (optional, for personalization)
- An encrypted password (stored as a one-way hash, never in plain text)
- Account role (admin or user)

2.2 Journal and Reflection Data
When you use the App's features, you may input:
- Journal entries (thoughts, feelings, reactions, gratitude items)
- Thinking reports (situations, automatic thoughts, disputing thoughts, behaviors)
- Beliefs, affirmations, and philosophies
- Boundary descriptions and scripts
- Spiritual reflection preferences (selected religion, sacred texts)
- Any other text you choose to enter for AI analysis

2.3 AI-Generated Analysis Data
When you request AI analysis, the App generates and stores:
- AI-generated recommendations and insights
- Cognitive distortion identifications
- Maslow needs assessments
- Pro-social and anti-social categorizations
- Coping strategies and behavioral pattern analyses
- Other AI-generated outputs based on your inputs

2.4 Usage and Technical Data
We automatically collect:
- Authentication tokens and session data
- Timestamps of entries and analyses
- Device type and browser information
- App usage logs for security and debugging purposes

3. HOW YOUR DATA IS PROCESSED

3.1 Cloud-Based Storage
Your data is stored on secure cloud servers hosted by our backend infrastructure provider, Supabase, in the United States. When you create a journal entry, thinking report, or any other content, that data is transmitted over an encrypted connection to these servers and stored there. Your data is associated with your user account and is protected by database security rules, so it is not accessible to other users.

3.2 Artificial Intelligence Processing
To generate insights and analyses, the text you input is sent by our secure server functions to Anthropic's Claude AI service. When you request an analysis (such as a Maslow needs assessment or cognitive distortion identification), your input text is sent to Anthropic, processed, and a response is returned to you. The AI-generated results are then stored in your account on our cloud servers. If you use the App in a language other than English, AI-generated results may also be sent to Anthropic to be translated into your language. When you use voice input, your speech is converted to text by your browser's or device's built-in speech recognition service (for example, Google in Chrome or Apple in Safari) before any text reaches our servers.

3.3 Authentication Processing
Your login credentials and authentication sessions are managed by our cloud-based authentication system. Passwords are hashed using industry-standard one-way encryption and are never stored or transmitted in plain text.

3.4 No On-Device Processing of AI Analysis
We want to be clear: AI analysis in this App is NOT performed on your device. Your text inputs are transmitted to remote AI servers for processing. If you have concerns about your text being processed by cloud AI services, please do not enter sensitive information into the analysis features.

4. HOW WE USE YOUR DATA

We use your data to:
- Provide AI-powered analysis and insights based on your inputs
- Store your journal entries, reports, and reflections for your future reference
- Authenticate your identity and manage your account
- Display your historical entries and analyses within the App
- Improve the quality and accuracy of AI prompts and analysis frameworks
- Maintain the security and integrity of the App
- Comply with legal obligations

We do NOT use your personal journal entries or reflections to train public AI models. Your individual inputs are processed for the purpose of generating your personal analysis results and are not incorporated into the training data of the underlying LLM providers.

5. DATA SHARING AND THIRD-PARTY SERVICES

5.1 Backend Infrastructure Provider
We use Supabase as our backend provider. Supabase hosts our database, authentication system, and the server functions that connect to our AI provider. Your data is stored on Supabase's secure cloud infrastructure. Supabase is contractually obligated to protect your data and not use it for their own purposes.

5.2 AI Language Model Providers
When you request AI analysis, your text input is transmitted through our server functions to Anthropic, the provider of the Claude AI models. Anthropic processes your text to generate analysis results under its commercial terms of service. Under those terms, Anthropic does not use the text we send or the results it returns to train its AI models, and it automatically deletes them from its systems within 30 days. Content flagged for violating Anthropic's Usage Policy may be kept for up to 2 years. By using the AI analysis features, you consent to your text being transmitted to Anthropic for processing.

5.3 No Sale of Data
We do not sell, rent, or trade your personal data to any third party. We do not share your journal entries, reflections, or AI analyses with any advertiser, data broker, or marketing service.

5.4 Legal Disclosures
We may disclose your data if required to do so by law, court order, or government regulation, or if we believe in good faith that disclosure is necessary to protect our rights, your safety, or the safety of others.

6. DATA RETENTION AND DELETION

6.1 Data Retention
Your data is retained for as long as your account is active. Journal entries, thinking reports, AI analyses, and other content remain in your account until you choose to delete them or delete your account.

6.2 Deleting Individual Entries
You can delete individual journal entries, thinking reports, beliefs, boundaries, and other content at any time directly within the App. Deleted items are permanently removed from our servers.

6.3 Account Deletion
You can delete your entire account at any time through the App's settings menu. When you delete your account, all associated data — including all journal entries, reports, analyses, and personal information — is permanently deleted from our servers and cannot be recovered.

6.4 Data Anonymization
If you choose to keep your account but stop using the App, your data will remain stored until you delete it. We do not automatically delete inactive accounts, but you may request deletion at any time.

7. YOUR PRIVACY RIGHTS

7.1 General Rights
Depending on your jurisdiction, you may have the following rights regarding your personal data:
- Right to Access: You can request a copy of all data we hold about you.
- Right to Rectification: You can request correction of inaccurate data.
- Right to Erasure: You can request deletion of your data ("right to be forgotten").
- Right to Restrict Processing: You can request that we limit how we process your data.
- Right to Data Portability: You can request your data in a structured, machine-readable format.
- Right to Object: You can object to certain types of processing.

7.2 GDPR (European Union) Rights
If you are a resident of the European Union, you have the rights described above under the General Data Protection Regulation (GDPR). To exercise these rights, please contact us using the information in Section 11.

7.3 CCPA (California) Rights
If you are a California resident, you have the following rights under the California Consumer Privacy Act (CCPA):
- Right to Know: You can request disclosure of the categories and specific pieces of personal information we collect.
- Right to Delete: You can request deletion of your personal information.
- Right to Opt-Out: We do not sell your personal information, so there is no opt-out required.
- Right to Non-Discrimination: We will not discriminate against you for exercising your privacy rights.

7.4 Exercising Your Rights
To exercise any of these rights, you can:
- Delete individual entries directly within the App
- Delete your entire account through the App's settings
- Contact us using the information in Section 11 for data access, portability, or other requests

8. DATA SECURITY

8.1 Security Measures
We implement industry-standard security measures to protect your data, including:
- Encrypted transmission of data using TLS/SSL (HTTPS)
- One-way hashed password storage
- Secure cloud infrastructure with access controls
- Regular security reviews of our backend systems

8.2 No Absolute Guarantee
While we strive to protect your data, no method of transmission over the internet or electronic storage is 100% secure. We cannot guarantee absolute security, but we are committed to implementing and maintaining reasonable security practices.

8.3 Data Breach Notification
In the event of a data breach that compromises your personal information, we will notify you and the appropriate regulatory authorities in accordance with applicable laws.

9. CHILDREN'S PRIVACY

The ZINN App is not intended for use by children under the age of 13. We do not knowingly collect personal information from children under 13. If you believe a child under 13 has provided us with personal information, please contact us immediately so we can delete it. If you are a parent or guardian and believe your child has provided us with information without your consent, please contact us to request deletion.

10. INTERNATIONAL DATA TRANSFERS

Your data may be processed on servers located in countries other than your country of residence, including the United States. By using the App, you consent to the transfer of your data to these countries for processing and storage. We take steps to ensure your data is protected in accordance with this Privacy Policy regardless of where it is processed.

11. CONTACT US

If you have questions, concerns, or requests regarding this Privacy Policy or your personal data, please contact us at support@thezinnapp.com or through the App's support features and account settings.

12. CHANGES TO THIS PRIVACY POLICY

We may update this Privacy Policy from time to time. When we do, we will revise the "Last Updated" date at the top of this page. We encourage you to review this Privacy Policy periodically to stay informed about how we protect your data. If we make material changes, we will notify you through the App or via email.

13. MEDICAL AND PSYCHOLOGICAL DISCLAIMER

This App is an AI-powered educational and self-reflection tool. It does not provide medical, psychological, or mental health diagnosis, treatment, or clinical recommendations. AI-generated analyses may be inaccurate or incomplete. Always consult a licensed healthcare professional for mental health guidance. This App is not a crisis resource. If you are experiencing a mental health emergency, contact your local emergency services immediately.`;

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-background flex flex-col" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
      <PublicHeader />
      <div className="max-w-2xl mx-auto px-4 py-8 sm:py-12 flex-1">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <Shield className="w-5 h-5 text-primary" />
          </div>
          <h1 className="text-xl font-heading font-bold">Privacy Policy</h1>
        </div>

        <Card>
          <CardContent className="p-5 sm:p-6">
            <div
              className="font-body text-sm leading-relaxed text-foreground whitespace-pre-wrap select-text cursor-text"
              style={{ WebkitUserSelect: 'text', userSelect: 'text' }}
            >
              {POLICY_TEXT}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
