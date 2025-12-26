'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { SignupStepper } from './SignupStepper';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { signup, checkSlugAvailability } from '@/app/actions/auth';
import { toast } from 'sonner';

export function SignupForm() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [slugPreview, setSlugPreview] = useState('');

  // Form data
  const [formData, setFormData] = useState({
    companyName: '',
    name: '',
    email: '',
    password: '',
  });

  const steps = [
    {
      id: 1,
      title: 'Dados da Empresa',
      status: currentStep > 1 ? 'completed' : currentStep === 1 ? 'current' : 'upcoming',
    },
    {
      id: 2,
      title: 'Seus Dados',
      status: currentStep > 2 ? 'completed' : currentStep === 2 ? 'current' : 'upcoming',
    },
    {
      id: 3,
      title: 'Confirmação',
      status: currentStep === 3 ? 'current' : 'upcoming',
    },
  ] as const;

  // Generate slug preview
  const handleCompanyNameChange = async (value: string) => {
    setFormData({ ...formData, companyName: value });
    
    if (value.length >= 2) {
      const result = await checkSlugAvailability(value);
      setSlugPreview(result.slug);
    } else {
      setSlugPreview('');
    }
  };

  const handleNext = () => {
    // Validation for step 1
    if (currentStep === 1) {
      if (!formData.companyName || formData.companyName.trim().length < 2) {
        toast.error('Nome da empresa deve ter pelo menos 2 caracteres');
        return;
      }
    }

    // Validation for step 2
    if (currentStep === 2) {
      if (!formData.name || formData.name.trim().length < 2) {
        toast.error('Nome deve ter pelo menos 2 caracteres');
        return;
      }
      if (!formData.email || !formData.email.includes('@')) {
        toast.error('Email inválido');
        return;
      }
      if (!formData.password || formData.password.length < 8) {
        toast.error('Senha deve ter pelo menos 8 caracteres');
        return;
      }
    }

    setCurrentStep(currentStep + 1);
  };

  const handleBack = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async () => {
    setIsLoading(true);

    try {
      const result = await signup(formData);

      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success('Conta criada com sucesso! Redirecionando...');
      
      // Small delay to show the toast before redirect
      setTimeout(() => {
        router.push('/login?registered=true');
      }, 1000);
    } catch (error) {
      toast.error('Erro ao criar conta. Tente novamente.');
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <SignupStepper currentStep={currentStep} steps={steps} />

      <div className="bg-card border rounded-lg p-6 shadow-sm">
        {/* Step 1: Dados da Empresa */}
        {currentStep === 1 && (
          <div className="space-y-4">
            <div>
              <Label htmlFor="companyName">Nome da Empresa *</Label>
              <Input
                id="companyName"
                type="text"
                placeholder="Ex: FourSys Tecnologia"
                value={formData.companyName}
                onChange={(e) => handleCompanyNameChange(e.target.value)}
                required
              />
            </div>

            {slugPreview && (
              <div className="bg-muted p-3 rounded-md">
                <p className="text-sm text-muted-foreground">
                  💡 Sua URL será:
                </p>
                <p className="font-mono text-sm font-medium mt-1">
                  crm.foursys.com/<span className="text-primary">{slugPreview}</span>
                </p>
              </div>
            )}

            <Button onClick={handleNext} className="w-full">
              Próximo: Seus Dados →
            </Button>
          </div>
        )}

        {/* Step 2: Seus Dados */}
        {currentStep === 2 && (
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Nome Completo *</Label>
              <Input
                id="name"
                type="text"
                placeholder="João Silva"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
              />
            </div>

            <div>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                placeholder="joao@foursys.com"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                required
              />
            </div>

            <div>
              <Label htmlFor="password">Senha *</Label>
              <Input
                id="password"
                type="password"
                placeholder="Mínimo 8 caracteres"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                required
              />
              <p className="text-xs text-muted-foreground mt-1">
                Mínimo 8 caracteres
              </p>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={handleBack} className="flex-1">
                ← Voltar
              </Button>
              <Button onClick={handleNext} className="flex-1">
                Próximo: Confirmar →
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Confirmação */}
        {currentStep === 3 && (
          <div className="space-y-4">
            <div className="bg-muted p-4 rounded-md space-y-2">
              <h3 className="font-semibold">📋 Revise seus dados</h3>
              
              <div className="space-y-1 text-sm">
                <p>
                  <span className="text-muted-foreground">Empresa:</span>{' '}
                  <span className="font-medium">{formData.companyName}</span>
                </p>
                <p>
                  <span className="text-muted-foreground">URL:</span>{' '}
                  <span className="font-mono text-xs">{slugPreview}</span>
                </p>
                <p>
                  <span className="text-muted-foreground">Nome:</span>{' '}
                  <span className="font-medium">{formData.name}</span>
                </p>
                <p>
                  <span className="text-muted-foreground">Email:</span>{' '}
                  <span className="font-medium">{formData.email}</span>
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={handleBack} className="flex-1">
                ← Voltar
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={isLoading}
                className="flex-1"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Criando conta...
                  </>
                ) : (
                  '🚀 Criar Minha Conta'
                )}
              </Button>
            </div>
          </div>
        )}
      </div>

      <p className="text-center text-sm text-muted-foreground mt-4">
        Já tem uma conta?{' '}
        <a href="/login" className="text-primary hover:underline">
          Fazer login
        </a>
      </p>
    </div>
  );
}

