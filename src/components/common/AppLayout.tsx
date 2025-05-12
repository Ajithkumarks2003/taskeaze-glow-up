
import { ReactNode } from 'react';
import { Navigation } from '../navigation/Navigation';

type AppLayoutProps = {
  children: ReactNode;
};

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-dark-bg">
      <main className="flex-1 pb-20 pt-4 px-4">
        {children}
      </main>
      <Navigation />
    </div>
  );
}
