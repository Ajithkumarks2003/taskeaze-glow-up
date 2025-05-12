
import { AuthLayout } from '@/components/auth/AuthLayout';
import { RegisterForm } from '@/components/auth/RegisterForm';

export default function Register() {
  return (
    <AuthLayout
      title="Create an Account"
      subtitle="Sign up to start tracking your tasks"
    >
      <RegisterForm />
    </AuthLayout>
  );
}
