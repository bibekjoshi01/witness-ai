import './globals.css';
import { Providers } from '@/components/Providers'
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Witness AI - Gentle Reflection',
  description: 'Structured mental health reflection with gentle insights.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
