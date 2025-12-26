import { SignupForm } from '@/components/auth/SignupForm';

export const metadata = {
  title: 'Criar Conta | CRM FourSys',
  description: 'Crie sua conta e comece a usar o CRM FourSys',
};

export default function SignupPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background to-muted">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">CRM FourSys</h1>
          <p className="text-muted-foreground">
            Crie sua conta em menos de 3 minutos
          </p>
        </div>

        <SignupForm />
      </div>
    </div>
  );
}


