
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Logo } from '../components/common/Logo';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Index() {
  const navigate = useNavigate();
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  
  useEffect(() => {
    // If user is already logged in, redirect to dashboard
    if (isLoggedIn) {
      navigate('/dashboard');
    }
  }, [isLoggedIn, navigate]);
  
  if (isLoggedIn) {
    return null; // Don't render anything while redirecting
  }
  
  return (
    <div className="min-h-screen flex flex-col bg-dark-bg relative overflow-hidden">
      {/* Background decorations */}
      <div 
        className="absolute top-0 left-0 w-1/2 h-1/2 bg-neon-pink/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"
        aria-hidden="true"
      />
      <div 
        className="absolute bottom-0 right-0 w-1/2 h-1/2 bg-neon-violet/5 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"
        aria-hidden="true"
      />
      
      {/* Header */}
      <header className="container mx-auto py-6 px-4 flex justify-between items-center">
        <Logo className="h-12" />
        <div className="flex gap-4">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/login')}
            className="border border-neon-pink/20 text-neon-pink hover:bg-neon-pink/10"
          >
            Sign in
          </Button>
          <Button 
            onClick={() => navigate('/register')}
            className="bg-gradient-to-r from-neon-pink to-neon-violet hover:shadow-lg hover:shadow-neon-pink/20"
          >
            Get started
          </Button>
        </div>
      </header>
      
      {/* Main content */}
      <main className="container mx-auto px-4 flex-1 flex flex-col md:flex-row items-center justify-center gap-12 pb-12 md:pb-0">
        <div className="max-w-md space-y-6 text-center md:text-left">
          <h1 className="text-4xl md:text-5xl font-bold">
            Organize tasks, <span className="text-gradient">gain achievements</span>
          </h1>
          
          <p className="text-lg text-muted-foreground">
            TaskEaze combines productivity with gamification to make task management engaging and rewarding.
          </p>
          
          <div className="flex flex-wrap gap-4 justify-center md:justify-start">
            <Button 
              size="lg" 
              onClick={() => navigate('/register')}
              className="bg-gradient-to-r from-neon-pink to-neon-violet hover:shadow-lg hover:shadow-neon-pink/20"
            >
              Start for free
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="border-neon-pink/30 text-neon-pink hover:bg-neon-pink/10"
              onClick={() => navigate('/login')}
            >
              Learn more
            </Button>
          </div>
        </div>
        
        {/* App preview/mockup */}
        <div className="max-w-md w-full">
          <div className="relative">
            {/* App frame */}
            <div className={cn(
              "rounded-2xl shadow-2xl overflow-hidden border-4 border-dark-border",
              "bg-gradient-to-br from-dark-bg to-dark-card"
            )}>
              {/* App mockup content */}
              <div className="pt-6 pb-16 px-4 space-y-4">
                {/* Header mockup */}
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="font-bold text-white">Dashboard</h3>
                    <p className="text-xs text-gray-400">Welcome back, User</p>
                  </div>
                  <div className="h-8 w-8 rounded-full bg-gradient-to-r from-neon-pink to-neon-violet flex items-center justify-center">
                    <span className="text-xs text-white font-bold">U</span>
                  </div>
                </div>
                
                {/* Task card mockup */}
                {[1, 2, 3].map((i) => (
                  <div 
                    key={i} 
                    className="bg-dark-accent rounded-lg p-3 border border-gray-800 animate-float"
                    style={{ animationDelay: `${i * 0.2}s` }}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-sm font-medium">Example Task {i}</h4>
                        <p className="text-xs text-gray-400">Task description here</p>
                      </div>
                      <div className="bg-neon-pink/20 text-neon-pink text-xs px-2 py-0.5 rounded">
                        {['Low', 'Medium', 'High'][i - 1]}
                      </div>
                    </div>
                  </div>
                ))}
                
                {/* Achievement mockup */}
                <div className="bg-dark-accent rounded-lg p-3 border border-gray-800 mt-4 flex items-center justify-between neon-border animate-pulse-glow">
                  <div className="flex items-center">
                    <div className="h-8 w-8 rounded-full bg-gradient-to-r from-neon-pink to-neon-violet flex items-center justify-center mr-3">
                      <span className="text-xs text-white font-bold">★</span>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium">Achievement Unlocked!</h4>
                      <p className="text-xs text-gray-400">First Steps</p>
                    </div>
                  </div>
                  <span className="text-xs bg-neon-violet/20 text-neon-violet px-2 py-0.5 rounded">+50 pts</span>
                </div>
              </div>
              
              {/* Bottom nav mockup */}
              <div className="absolute bottom-0 left-0 right-0 bg-dark-accent border-t border-gray-800 h-14 flex justify-around items-center px-6">
                {['◻', '◆', '⊕', '⋆', '◯'].map((icon, i) => (
                  <div 
                    key={i} 
                    className={cn(
                      "flex items-center justify-center h-8 w-8",
                      i === 2 
                        ? "rounded-full bg-gradient-to-r from-neon-pink to-neon-violet -mt-4" 
                        : "text-gray-400"
                    )}
                  >
                    <span className={i === 2 ? "text-white" : ""}>{icon}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
