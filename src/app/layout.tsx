import type { Metadata } from 'next';
import './globals.css';
import { UserProvider } from '@/context/UserContext';
import { Nav } from '@/components/Nav';

export const metadata: Metadata = {
  title: 'Ditto Lab — Micro-Quest Chemistry Lab',
  description:
    'Low-stakes micro-quests to discover real chemistry before committing to a full date.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-slate-50 min-h-screen font-sans">
        <UserProvider>
          <Nav />
          {children}
        </UserProvider>
      </body>
    </html>
  );
}
