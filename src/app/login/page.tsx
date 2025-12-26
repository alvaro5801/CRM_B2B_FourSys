import { LoginForm } from '@/components/auth/LoginForm';

export const metadata = {
  title: 'Login | CRM FourSys',
  description: 'Faça login no CRM FourSys',
};

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background to-muted">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">CRM FourSys</h1>
        </div>

        <LoginForm />
      </div>
    </div>
  );
}


