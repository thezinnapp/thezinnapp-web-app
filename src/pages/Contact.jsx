import { useState } from 'react';
import { Mail, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import PublicFooter from '@/components/shared/PublicFooter';
import PublicHeader from '@/components/shared/PublicHeader';

// Replace with your real support email address.
const CONTACT_EMAIL = 'support@thezinnapp.com';

export default function Contact() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const subject = encodeURIComponent(`Contact from ${name || 'a visitor'}`);
    const body = encodeURIComponent(`${message}\n\nFrom: ${name} (${email})`);
    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;
  };

  return (
    <div className="min-h-[100dvh] bg-background flex flex-col">
      <PublicHeader />

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-10">
        <h1 className="font-display text-3xl font-bold tracking-tight mb-6">Contact Us</h1>

        <p className="text-muted-foreground mb-6">
          Have a question, feedback, or need support? We'd love to hear from you. Reach out by
          email or send us a message using the form below.
        </p>

        <a
          href={`mailto:${CONTACT_EMAIL}`}
          className="inline-flex items-center gap-2 text-primary font-medium hover:underline mb-8"
        >
          <Mail className="w-4 h-4" />
          {CONTACT_EMAIL}
        </a>

        <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="How can we help?"
              rows={5}
              required
            />
          </div>
          <Button type="submit" className="w-full sm:w-auto">
            <Send className="w-4 h-4" />
            Send Message
          </Button>
        </form>
      </main>

      <div className="max-w-3xl mx-auto w-full px-4 pb-10">
        <PublicFooter />
      </div>
    </div>
  );
}