
import { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface LogoProps extends HTMLAttributes<HTMLDivElement> {}

export function Logo({ className, ...props }: LogoProps) {
  return (
    <div className={cn("flex flex-col items-center", className)} {...props}>
      <div className="h-16 w-16 relative mb-2">
        <img 
          src="/lovable-uploads/764eb57f-c1d3-4810-928b-d2a5abce21fd.png" 
          alt="TaskEaze Logo" 
          className="w-full h-full object-contain"
        />
      </div>
      <div className="flex flex-col items-center">
        <h2 className="text-2xl font-bold tracking-tight text-gradient">TaskEaze</h2>
        <p className="text-xs text-muted-foreground mt-1">Task.Anywhere.Anytime.</p>
      </div>
    </div>
  );
}
