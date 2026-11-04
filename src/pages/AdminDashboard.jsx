import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { UserPlus, Mail, Users, Loader2, ChevronLeft } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { Link } from 'react-router-dom';
import MoveEntriesCard from '@/components/admin/MoveEntriesCard';

export default function AdminDashboard() {
  const { user, isLoadingAuth } = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [inviting, setInviting] = useState(false);
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchUsers();
    }
  }, [user]);

  const fetchUsers = async () => {
    try {
      const userList = await base44.entities.User.list();
      setUsers(userList);
    } catch (err) {
      toast({ title: 'Error loading users', description: err.message, variant: 'destructive' });
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleInvite = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setInviting(true);
    try {
      await base44.users.inviteUser(email.trim(), 'user');
      toast({ title: 'Invitation sent', description: `${email.trim()} has been invited as a tester.` });
      setEmail('');
      fetchUsers();
    } catch (err) {
      toast({ title: 'Invitation failed', description: err.message, variant: 'destructive' });
    } finally {
      setInviting(false);
    }
  };

  if (isLoadingAuth) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link to="/">
          <Button variant="ghost" size="icon" className="-ml-2">
            <ChevronLeft className="w-5 h-5" />
          </Button>
        </Link>
        <h1 className="text-xl font-heading font-bold">Admin Dashboard</h1>
      </div>

      {/* Invite Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <UserPlus className="w-4 h-4 text-primary" />
            Invite Tester
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleInvite} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="email"
                placeholder="tester@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-9"
                required
                disabled={inviting}
              />
            </div>
            <Button type="submit" disabled={inviting || !email.trim()}>
              {inviting ? <Loader2 className="w-4 h-4 animate-spin mr-1.5" /> : <UserPlus className="w-4 h-4 mr-1.5" />}
              Send Invite
            </Button>
          </form>
          <p className="text-xs text-muted-foreground mt-3">
            Testers will receive an email invitation to register with the "user" role.
          </p>
        </CardContent>
      </Card>

      {/* Move entries between accounts (old Base44 sign-ins that can't be reached) */}
      <MoveEntriesCard users={users} onMoved={fetchUsers} />

      {/* User List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Users className="w-4 h-4 text-primary" />
            Registered Users
            <Badge variant="secondary" className="ml-auto">{users.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loadingUsers ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
            </div>
          ) : users.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No users found.</p>
          ) : (
            <div className="space-y-2">
              {users.map((u) => (
                <div
                  key={u.id}
                  className="flex items-center justify-between rounded-lg border border-border/50 px-3 py-2.5"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{u.full_name || '—'}</p>
                    <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                  </div>
                  <Badge
                    variant={u.role === 'admin' ? 'default' : 'outline'}
                    className={u.role === 'admin' ? '' : 'ml-2 shrink-0'}
                  >
                    {u.role || 'user'}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}