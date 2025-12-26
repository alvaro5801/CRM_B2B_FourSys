'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { login } from '@/app/actions/auth';
import { toast } from 'sonner';

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  // Show success message if coming from signup (only once)
  useEffect(() => {
    const registered = searchParams.get('registered');
    if (registered === 'true') {
      toast.success('Conta criada com sucesso! Faça login para continuar.');
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await login(formData);

      if (result.error) {
        toast.error(result.error);
        // Limpar senha e resetar loading em caso de erro
        setFormData({ ...formData, password: '' });
        setIsLoading(false);
        return;
      }

      toast.success('Bem-vindo de volta!');
      
      // Small delay to show the toast before redirect
      setTimeout(() => {
        router.push('/');
        router.refresh();
      }, 500);
    } catch (error) {
      toast.error('Erro ao fazer login. Tente novamente.');
      // Limpar senha e resetar loading em caso de exceção
      setFormData({ ...formData, password: '' });
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold">Bem-vindo de volta!</h1>
        <p className="text-muted-foreground mt-2">
          Faça login para acessar sua conta
        </p>
      </div>

      <div className="bg-card border rounded-lg p-6 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="seu@email.com"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              required
              disabled={isLoading}
            />
          </div>

          <div>
            <Label htmlFor="password">Senha</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              required
              disabled={isLoading}
            />
            <div className="text-right mt-1">
              <a
                href="/forgot-password"
                className="text-sm text-primary hover:underline"
              >
                Esqueci minha senha
              </a>
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Entrando...
              </>
            ) : (
              'Entrar'
            )}
          </Button>
        </form>
      </div>

      <p className="text-center text-sm text-muted-foreground mt-4">
        Não tem uma conta?{' '}
        <a href="/signup" className="text-primary hover:underline">
          Criar conta
        </a>
      </p>
    </div>
  );
}

