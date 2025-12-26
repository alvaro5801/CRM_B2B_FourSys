'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<'email' | 'reset' | 'success'>('email');
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [userId, setUserId] = useState('');
  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: '',
  });

  // Etapa 1: Verificar email
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok && data.userId) {
        setUserId(data.userId);
        setStep('reset');
        toast.success('Email encontrado! Defina sua nova senha.');
      } else {
        toast.error(data.error || 'Email não encontrado no sistema.');
      }
    } catch (error) {
      toast.error('Erro ao verificar email. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  // Etapa 2: Resetar senha
  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validações
    if (formData.newPassword.length < 6) {
      toast.error('A senha deve ter no mínimo 6 caracteres.');
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      toast.error('As senhas não coincidem.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          newPassword: formData.newPassword,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setStep('success');
        toast.success('Senha alterada com sucesso!');
      } else {
        toast.error(data.error || 'Erro ao alterar senha.');
      }
    } catch (error) {
      toast.error('Erro ao alterar senha. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        {/* Botão Voltar */}
        <Link 
          href="/login" 
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar para login
        </Link>

        <Card>
          <CardHeader>
            <CardTitle>
              {step === 'email' && 'Recuperar Senha'}
              {step === 'reset' && 'Nova Senha'}
              {step === 'success' && 'Senha Alterada!'}
            </CardTitle>
            <CardDescription>
              {step === 'email' && 'Digite seu email para recuperar o acesso'}
              {step === 'reset' && 'Defina sua nova senha de acesso'}
              {step === 'success' && 'Sua senha foi alterada com sucesso'}
            </CardDescription>
          </CardHeader>

          <CardContent>
            {/* Etapa 1: Verificar Email */}
            {step === 'email' && (
              <form onSubmit={handleEmailSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Verificando...
                    </>
                  ) : (
                    'Continuar'
                  )}
                </Button>
              </form>
            )}

            {/* Etapa 2: Definir Nova Senha */}
            {step === 'reset' && (
              <form onSubmit={handleResetSubmit} className="space-y-4">
                <Alert>
                  <AlertDescription className="text-sm">
                    Email: <strong>{email}</strong>
                  </AlertDescription>
                </Alert>

                <div>
                  <Label htmlFor="newPassword">Nova Senha</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    placeholder="Mínimo 6 caracteres"
                    value={formData.newPassword}
                    onChange={(e) =>
                      setFormData({ ...formData, newPassword: e.target.value })
                    }
                    required
                    disabled={isLoading}
                    minLength={6}
                  />
                </div>

                <div>
                  <Label htmlFor="confirmPassword">Confirmar Senha</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Digite a senha novamente"
                    value={formData.confirmPassword}
                    onChange={(e) =>
                      setFormData({ ...formData, confirmPassword: e.target.value })
                    }
                    required
                    disabled={isLoading}
                    minLength={6}
                  />
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Alterando...
                    </>
                  ) : (
                    'Alterar Senha'
                  )}
                </Button>
              </form>
            )}

            {/* Etapa 3: Sucesso */}
            {step === 'success' && (
              <div className="space-y-4 text-center">
                <div className="flex justify-center">
                  <div className="rounded-full bg-green-500/10 p-3">
                    <CheckCircle2 className="h-12 w-12 text-green-500" />
                  </div>
                </div>

                <div>
                  <p className="text-muted-foreground mb-4">
                    Sua senha foi alterada com sucesso! Você já pode fazer login
                    com sua nova senha.
                  </p>
                </div>

                <Button
                  onClick={() => router.push('/login')}
                  className="w-full"
                >
                  Ir para Login
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

