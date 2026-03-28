'use client';
import { GoogleLogin, googleLogout } from '@react-oauth/google';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { jwtDecode } from 'jwt-decode';
import { useGoogleLoginMutation } from '../features/auth/api';
import { setAuth, clearAuth } from '../features/auth/slice';
import { RootState } from '../lib/store';
import { LayoutShell } from '../components/LayoutShell';

interface GoogleIdTokenPayload {
  sub: string;
  email?: string;
  name?: string;
  picture?: string;
}

export default function LandingPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const token = useSelector((s: RootState) => s.auth.token);
  const user = useSelector((s: RootState) => s.auth.user);
  const [googleLogin, { isLoading }] = useGoogleLoginMutation();

  const handleSuccess = async (credentialResponse: any) => {
    const id_token = credentialResponse.credential;
    if (!id_token) return;
    try {
      const payload: GoogleIdTokenPayload = jwtDecode(id_token);
      const apiResp = await googleLogin({ id_token }).unwrap();
      dispatch(
        setAuth({
          token: apiResp.access_token,
          user: {
            email: payload.email,
            name: payload.name,
            picture: payload.picture,
          },
        })
      );
      router.replace('/home');
    } catch (err) {
      console.error('login failed', err);
    }
  };

  const handleSignOut = () => {
    googleLogout();
    dispatch(clearAuth());
  };

  return (
    <LayoutShell>
      <div className="max-w-5xl mx-auto grid lg:grid-cols-2 gap-10 items-center mt-10">
        <div className="space-y-6">
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-calm/10 text-calm text-sm font-semibold">
            Early awareness, gentle support
          </div>
          <h1 className="text-4xl lg:text-5xl font-semibold leading-tight">
            Witness AI helps you notice patterns before they feel heavy.
          </h1>
          <p className="text-lg text-ink/70">
            Structured check-ins, quiet insights, and small nudges designed for your day.
            Built for privacy-first reflection in cultures where mental health conversations need care.
          </p>
          <div className="flex items-center gap-3">
            {!token ? (
              <div className="card px-6 py-4 inline-flex items-center gap-3">
                <GoogleLogin
                  onSuccess={handleSuccess}
                  onError={() => console.error('Google Login Failed')}
                  useOneTap
                />
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <button className="button-primary" onClick={() => router.push('/home')}>
                  Continue
                </button>
                <button className="button-ghost" onClick={handleSignOut}>
                  Sign out
                </button>
              </div>
            )}
          </div>
          {user?.name && (
            <p className="text-sm text-ink/60">Signed in as {user.name}</p>
          )}
        </div>
        <div className="card p-8 space-y-6">
          <p className="text-ink/70 text-sm font-medium uppercase tracking-wide">
            Today’s gentle snapshot
          </p>
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-ink text-white shadow-lg">
              <p className="text-sm opacity-80">Mood check-in</p>
              <p className="text-2xl font-semibold mt-2">How was your energy today?</p>
              <p className="text-sm opacity-80 mt-1">Witness AI adapts tomorrow’s questions based on this.</p>
            </div>
            <div className="p-4 rounded-2xl bg-white/80 border border-ink/5">
              <p className="text-sm text-ink/60">Pattern insight</p>
              <p className="font-semibold text-lg mt-1">Your focus dips after 3 PM.</p>
              <p className="text-sm text-ink/60">Try a 5-minute breathing break before tackling key tasks.</p>
            </div>
            <div className="flex items-center gap-3 text-sm text-ink/60">
              <span className="inline-flex h-3 w-3 rounded-full bg-calm"></span>
              Private by default. Share only if you choose.
            </div>
          </div>
        </div>
      </div>
    </LayoutShell>
  );
}
