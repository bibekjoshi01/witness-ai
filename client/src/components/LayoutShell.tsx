import React, { PropsWithChildren } from 'react';
import Link from 'next/link';

export function LayoutShell({ children }: PropsWithChildren) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="flex items-center justify-between px-6 py-4">
        <Link href="/" className="text-xl font-semibold text-ink">
          Witness AI
        </Link>
        <div className="flex items-center gap-3 text-sm text-ink/70">
          <Link href="/home" className="hover:text-ink">Home</Link>
          <Link href="/profile" className="hover:text-ink">Profile</Link>
        </div>
      </header>
      <main className="flex-1 px-4 pb-10">{children}</main>
      <footer className="px-6 py-4 text-xs text-ink/60">
        Gentle reflection, no judgment.
      </footer>
    </div>
  );
}
