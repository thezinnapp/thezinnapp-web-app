import { useState } from 'react';
import { ArrowDown, ArrowRightLeft, Loader2, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/components/ui/use-toast';

const TABLE_LABELS = {
  beliefs: 'Beliefs',
  boundaries: 'Boundaries',
  thinking_reports: 'Thinking reports',
  journal_entries: 'Journal entries',
  maslow_analyses: 'Maslow analyses',
  spiritual_reflections: 'Spiritual reflections',
  monthly_analyses: 'Monthly analyses',
};

const SIGN_IN_LABELS = { email: 'Email', google: 'Google', apple: 'Apple' };

const total = (counts) => Object.values(counts || {}).reduce((sum, n) => sum + (Number(n) || 0), 0);

function AccountSummary({ label, account, counts }) {
  const signIn = (account.sign_in || []).map((p) => SIGN_IN_LABELS[p] || p).join(', ') || '—';
  return (
    <div className="rounded-lg border border-border/50 px-3 py-2.5">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-medium break-all">{account.email}</p>
      <p className="text-xs text-muted-foreground">
        {account.full_name ? `${account.full_name} · ` : ''}Signs in with: {signIn} · Joined{' '}
        {new Date(account.created_date).toLocaleDateString()} · {total(counts)} entries
      </p>
    </div>
  );
}

// Moves every entry from one account to another, for people who can't sign in to
// their imported Base44 account (for example Apple "Hide My Email") and made a new one.
export default function MoveEntriesCard({ users = [], onMoved }) {
  const { toast } = useToast();
  const [fromEmail, setFromEmail] = useState('');
  const [toEmail, setToEmail] = useState('');
  const [preview, setPreview] = useState(null);
  const [deleteOld, setDeleteOld] = useState(true);
  const [busy, setBusy] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const reset = () => {
    setPreview(null);
  };

  const handlePreview = async (e) => {
    e.preventDefault();
    setBusy(true);
    setPreview(null);
    try {
      const data = await base44.users.moveEntries({ fromEmail, toEmail });
      setPreview(data);
    } catch (err) {
      toast({ title: 'Could not check these accounts', description: err.message, variant: 'destructive' });
    } finally {
      setBusy(false);
    }
  };

  const handleMove = async () => {
    setConfirmOpen(false);
    setBusy(true);
    try {
      const data = await base44.users.moveEntries({
        fromEmail,
        toEmail,
        confirm: true,
        deleteOld: preview?.from.role !== 'admin' && deleteOld,
      });
      const moved = total(data?.result?.from);
      toast({
        title: 'Entries moved',
        description: `${moved} ${moved === 1 ? 'entry' : 'entries'} moved to ${data.to.email}.${data.deleted ? ' The old account was deleted.' : ''}${data.warning ? ` ${data.warning}` : ''}`,
      });
      setFromEmail('');
      setToEmail('');
      setPreview(null);
      onMoved?.();
    } catch (err) {
      toast({ title: 'Move failed', description: err.message, variant: 'destructive' });
    } finally {
      setBusy(false);
    }
  };

  const fromCounts = preview?.result?.from;
  const moving = total(fromCounts);
  const canDeleteOld = preview && preview.from.role !== 'admin';

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <ArrowRightLeft className="w-4 h-4 text-primary" />
          Move a User's Entries
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-xs text-muted-foreground">
          For someone who can't sign in to their old account (for example, they used Apple "Hide My Email" on
          the old app) and made a new one. First check who they are, for example by email from their new
          address, then move their old entries into the new account.
        </p>

        <form onSubmit={handlePreview} className="space-y-3">
          <datalist id="move-entries-emails">
            {users.map((u) => (
              <option key={u.id} value={u.email} />
            ))}
          </datalist>
          <div className="space-y-1.5">
            <Label htmlFor="move-from">Old account (move entries from)</Label>
            <Input
              id="move-from"
              type="email"
              list="move-entries-emails"
              placeholder="old address, e.g. …@privaterelay.appleid.com"
              value={fromEmail}
              onChange={(e) => {
                setFromEmail(e.target.value);
                reset();
              }}
              disabled={busy}
              required
            />
          </div>
          <div className="flex justify-center">
            <ArrowDown className="w-4 h-4 text-muted-foreground" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="move-to">New account (move entries to)</Label>
            <Input
              id="move-to"
              type="email"
              list="move-entries-emails"
              placeholder="their new account's address"
              value={toEmail}
              onChange={(e) => {
                setToEmail(e.target.value);
                reset();
              }}
              disabled={busy}
              required
            />
          </div>
          <Button type="submit" variant="outline" className="w-full" disabled={busy || !fromEmail.trim() || !toEmail.trim()}>
            {busy && !preview ? <Loader2 className="w-4 h-4 animate-spin mr-1.5" /> : null}
            Check accounts
          </Button>
        </form>

        {preview && (
          <div className="space-y-3">
            <AccountSummary label="From (old account)" account={preview.from} counts={fromCounts} />
            <AccountSummary label="To (new account)" account={preview.to} counts={preview.result?.to_before} />

            {moving === 0 ? (
              <div className="flex items-start gap-2 rounded-lg bg-muted px-3 py-2.5 text-sm">
                <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0 text-muted-foreground" />
                The old account has no entries to move.
              </div>
            ) : (
              <div className="rounded-lg bg-muted px-3 py-2.5 text-sm">
                <p className="font-medium mb-1">Will move {moving} {moving === 1 ? 'entry' : 'entries'}:</p>
                <ul className="text-xs text-muted-foreground space-y-0.5">
                  {Object.entries(fromCounts)
                    .filter(([, n]) => n > 0)
                    .map(([table, n]) => (
                      <li key={table}>
                        {TABLE_LABELS[table] || table}: {n}
                      </li>
                    ))}
                </ul>
              </div>
            )}

            {canDeleteOld && (
              <div className="flex items-start gap-2">
                <Checkbox id="move-delete-old" checked={deleteOld} onCheckedChange={(v) => setDeleteOld(v === true)} disabled={busy} />
                <Label htmlFor="move-delete-old" className="text-sm font-normal leading-snug">
                  Delete the old account afterwards (recommended, so the person isn't confused by an empty account)
                </Label>
              </div>
            )}

            <Button className="w-full" disabled={busy || moving === 0} onClick={() => setConfirmOpen(true)}>
              {busy ? <Loader2 className="w-4 h-4 animate-spin mr-1.5" /> : <CheckCircle2 className="w-4 h-4 mr-1.5" />}
              Move entries
            </Button>
          </div>
        )}
      </CardContent>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Move {moving} {moving === 1 ? 'entry' : 'entries'}?</AlertDialogTitle>
            <AlertDialogDescription>
              From <span className="break-all">{preview?.from.email}</span> to{' '}
              <span className="break-all">{preview?.to.email}</span>.
              {canDeleteOld && deleteOld ? ' The old account will then be deleted.' : ''} Only do this once you're sure
              both accounts belong to the same person.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleMove}>Move entries</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
