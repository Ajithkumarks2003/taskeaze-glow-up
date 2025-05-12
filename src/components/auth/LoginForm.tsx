
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // For demonstration, we'll simulate authentication
      // In a real app, you would integrate with an auth service
      if (email && password) {
        // Replace with actual authentication
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // For demo: Admin detection
        const isAdmin = email.includes('admin');
        localStorage.setItem('userRole', isAdmin ? 'admin' : 'user');
        localStorage.setItem('isLoggedIn', 'true');
        
        toast({
          title: 'Login successful',
          description: `Welcome back${isAdmin ? ', admin' : ''}!`,
        });
        
        navigate('/dashboard');
      } else {
        toast({
          title: 'Login failed',
          description: 'Please provide both email and password',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Login failed',
        description: 'Please check your credentials and try again',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input 
          id="email" 
          type="email" 
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          required 
          className="bg-dark-accent text-foreground border-dark-border focus:border-neon-pink"
        />
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="password">Password</Label>
          <Link 
            to="/forgot-password" 
            className="text-sm text-neon-pink hover:text-neon-violet transition-colors"
          >
            Forgot password?
          </Link>
        </div>
        
        <Input 
          id="password" 
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required 
          className="bg-dark-accent text-foreground border-dark-border focus:border-neon-pink"
        />
      </div>
      
      <Button 
        type="submit" 
        disabled={isLoading} 
        className="w-full bg-gradient-to-r from-neon-pink to-neon-violet hover:shadow-lg hover:shadow-neon-pink/20 transition-all"
      >
        {isLoading ? 'Signing in...' : 'Sign in'}
      </Button>
      
      <div className="text-center text-sm text-muted-foreground">
        Don't have an account?{' '}
        <Link 
          to="/register" 
          className="text-neon-pink hover:text-neon-violet transition-colors"
        >
          Sign up
        </Link>
      </div>
    </form>
  );
}
