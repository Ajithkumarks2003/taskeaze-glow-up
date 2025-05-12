
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

export function RegisterForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // For demonstration, we'll simulate registration
      // In a real app, you would integrate with an auth service
      if (name && email && password) {
        // Replace with actual registration logic
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        toast({
          title: 'Registration successful',
          description: 'Your account has been created',
        });
        
        // For demo, store user role as regular user
        localStorage.setItem('userRole', 'user');
        localStorage.setItem('isLoggedIn', 'true');
        
        navigate('/dashboard');
      } else {
        toast({
          title: 'Registration failed',
          description: 'Please fill out all fields',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Registration failed',
        description: 'Please try again later',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name">Full Name</Label>
        <Input 
          id="name" 
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="John Doe"
          required 
          className="bg-dark-accent text-foreground border-dark-border focus:border-neon-pink"
        />
      </div>
      
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
        <Label htmlFor="password">Password</Label>
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
        {isLoading ? 'Creating account...' : 'Create account'}
      </Button>
      
      <div className="text-center text-sm text-muted-foreground">
        Already have an account?{' '}
        <Link 
          to="/login" 
          className="text-neon-pink hover:text-neon-violet transition-colors"
        >
          Sign in
        </Link>
      </div>
    </form>
  );
}
