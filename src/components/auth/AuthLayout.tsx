
import { ReactNode } from 'react';
import { Logo } from '../common/Logo';

type AuthLayoutProps = {
  children: ReactNode;
  title: string;
  subtitle?: string;
};

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-dark-bg p-4">
      <div className="w-full max-w-md animate-fade-in">
        <div className="flex flex-col items-center justify-center mb-8">
          <Logo className="mb-6 animate-float" />
          <h1 className="text-3xl font-bold tracking-tight mb-2">{title}</h1>
          {subtitle && (
            <p className="text-muted-foreground text-center">{subtitle}</p>
          )}
        </div>
        
        <div className="bg-dark-card rounded-xl p-6 neon-border shadow-lg">
          {children}
        </div>
      </div>
    </div>
  );
}
