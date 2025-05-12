
import { AuthLayout } from '@/components/auth/AuthLayout';
import { LoginForm } from '@/components/auth/LoginForm';

export default function Login() {
  return (
    <AuthLayout
      title="TaskEaze Login"
      subtitle="Sign in to access your tasks"
    >
      <LoginForm />
    </AuthLayout>
  );
}
