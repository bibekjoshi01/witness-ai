'use client';
import { LayoutShell } from '../../components/LayoutShell';
import { Protected } from '../../components/Protected';
import { useSelector } from 'react-redux';
import { RootState } from '../../lib/store';

export default function ProfilePage() {
  const user = useSelector((s: RootState) => s.auth.user);
  return (
    <Protected>
      <LayoutShell>
        <div className="max-w-3xl mx-auto card p-8 space-y-6">
          <h2 className="text-2xl font-semibold">Profile</h2>
          <div className="flex items-center gap-4">
            {user?.picture ? (
              <img
                src={user.picture}
                alt="avatar"
                className="h-16 w-16 rounded-full border border-ink/10 object-cover"
              />
            ) : (
              <div className="h-16 w-16 rounded-full bg-ink/10" />
            )}
            <div>
              <p className="text-lg font-semibold">{user?.name || 'Unnamed'}</p>
              <p className="text-ink/60">{user?.email || 'No email'}</p>
            </div>
          </div>
          <p className="text-sm text-ink/60">
            Coming soon: edit goals, reflection cadence, and share settings.
          </p>
        </div>
      </LayoutShell>
    </Protected>
  );
}
