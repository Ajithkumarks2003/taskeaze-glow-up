
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Home, List, Plus, Award, User } from 'lucide-react';

export function Navigation() {
  const location = useLocation();
  const currentPath = location.pathname;
  
  const isActive = (path: string) => currentPath === path;
  
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-dark-accent border-t border-dark-border px-2 py-3 z-50">
      <div className="max-w-lg mx-auto flex items-center justify-around">
        <NavItem href="/dashboard" icon={<Home size={20} />} label="Home" isActive={isActive('/dashboard')} />
        <NavItem href="/tasks" icon={<List size={20} />} label="Tasks" isActive={isActive('/tasks')} />
        <NavButton href="/new-task" />
        <NavItem href="/achievements" icon={<Award size={20} />} label="Achievements" isActive={isActive('/achievements')} />
        <NavItem href="/profile" icon={<User size={20} />} label="Profile" isActive={isActive('/profile')} />
      </div>
    </nav>
  );
}

type NavItemProps = {
  href: string;
  icon: JSX.Element;
  label: string;
  isActive: boolean;
};

function NavItem({ href, icon, label, isActive }: NavItemProps) {
  return (
    <Link
      to={href}
      className={cn(
        "flex flex-col items-center justify-center w-16 py-1 rounded-lg transition-all",
        isActive 
          ? "text-neon-pink" 
          : "text-gray-400 hover:text-neon-pink/70"
      )}
    >
      {icon}
      <span className="text-xs mt-1">{label}</span>
    </Link>
  );
}

function NavButton({ href }: { href: string }) {
  return (
    <Link
      to={href}
      className="flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-neon-pink to-neon-violet -mt-5 shadow-lg animate-pulse-glow button-hover-effect"
    >
      <Plus size={24} className="text-white" />
    </Link>
  );
}
