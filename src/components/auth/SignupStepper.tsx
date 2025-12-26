/**
 * SignupStepper Component
 * 
 * Indicador visual de progresso do wizard de cadastro (3 steps)
 */

'use client';

import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Step {
  id: number;
  title: string;
  status: 'completed' | 'current' | 'upcoming';
}

interface SignupStepperProps {
  currentStep: number;
  steps: Step[];
}

export function SignupStepper({ currentStep, steps }: SignupStepperProps) {
  return (
    <nav aria-label="Progresso do cadastro" className="mb-8">
      <ol className="flex items-center justify-center gap-2">
        {steps.map((step, index) => (
          <li key={step.id} className="flex items-center">
            {/* Step Circle */}
            <div
              className={cn(
                'flex items-center justify-center',
                'w-10 h-10 rounded-full',
                'font-semibold text-sm',
                'transition-all duration-200',
                step.status === 'completed' && 'bg-green-500 text-white',
                step.status === 'current' &&
                  'bg-primary text-primary-foreground ring-4 ring-primary/20',
                step.status === 'upcoming' && 'bg-muted text-muted-foreground'
              )}
              aria-current={step.status === 'current' ? 'step' : undefined}
              aria-label={`Passo ${step.id}: ${step.title}`}
            >
              {step.status === 'completed' ? (
                <Check className="h-5 w-5" />
              ) : (
                step.id
              )}
            </div>

            {/* Connector */}
            {index < steps.length - 1 && (
              <div
                className={cn(
                  'w-12 h-0.5 mx-2',
                  step.status === 'completed' ? 'bg-green-500' : 'bg-muted'
                )}
                aria-hidden="true"
              />
            )}
          </li>
        ))}
      </ol>

      {/* Step Title */}
      <div className="text-center mt-4">
        <p className="text-sm text-muted-foreground">
          Passo {currentStep} de {steps.length}
        </p>
        <p className="font-medium text-lg">
          {steps.find((s) => s.id === currentStep)?.title}
        </p>
      </div>
    </nav>
  );
}


