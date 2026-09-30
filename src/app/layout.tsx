import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Filipino Sign Language (FSL) Workshop System',
  description: 'Centralized learning and management platform for Filipino Sign Language workshops, learners, and educators.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full bg-slate-50">
      <body className="min-h-full flex flex-col font-sans antialiased text-slate-900 bg-slate-50">
        {children}
      </body>
    </html>
  );
}
