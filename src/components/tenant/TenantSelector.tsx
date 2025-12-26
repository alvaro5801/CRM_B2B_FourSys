/**
 * TenantSelector Component
 * 
 * Dropdown para usuários multi-tenant trocarem de contexto
 * IMPORTANTE: Apenas para usuários com acesso a múltiplos tenants
 * SEGURANÇA: Valida acesso ao tenant antes de trocar
 */

'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Check, ChevronDown, Building2 } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { switchTenant } from '@/app/actions/tenant-switch';

interface Tenant {
  id: string;
  name: string;
  slug: string;
  _count?: {
    leads: number;
    users: number;
  };
}

interface TenantSelectorProps {
  tenants: Tenant[];
  activeTenantId?: string;
  isLoading?: boolean;
}

export function TenantSelector({
  tenants,
  activeTenantId,
  isLoading = false,
}: TenantSelectorProps) {
  const router = useRouter();
  const { data: session, update } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [switching, setSwitching] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Use tenantId from session if not provided
  const currentTenantId = activeTenantId || session?.user?.tenantId;
  const activeTenant = tenants.find((t) => t.id === currentTenantId);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isOpen]);

  const handleSelect = async (tenantId: string) => {
    if (tenantId === currentTenantId) {
      setIsOpen(false);
      return;
    }

    setSwitching(true);
    setIsOpen(false);

    // Show loading toast
    const toastId = toast.loading('Trocando de tenant...');

    try {
      // 1. Validate tenant switch with Server Action
      const result = await switchTenant(tenantId);

      if (result.error) {
        toast.error(result.error, { id: toastId });
        setSwitching(false);
        return;
      }

      // 2. Update NextAuth session with new tenantId
      await update({ tenantId });

      // 3. Show success message
      toast.success(`Agora você está em: ${result.tenantName}`, {
        id: toastId,
      });

      // 4. Redirect to home (dashboard) and refresh to reload data
      router.push('/');
      router.refresh();

      // Small delay to ensure session is updated
      setTimeout(() => {
        setSwitching(false);
      }, 500);
    } catch (error) {
      toast.error('Erro ao trocar de tenant. Tente novamente.', {
        id: toastId,
      });
      setSwitching(false);
    }
  };

  // Don't show selector if user has only one tenant
  if (tenants.length <= 1) {
    return null;
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={switching || isLoading}
        className={cn(
          'flex items-center gap-2 px-3 py-2',
          'bg-background border rounded-md',
          'hover:border-primary/50 hover:bg-accent',
          'transition-all duration-200',
          'disabled:opacity-50 disabled:cursor-not-allowed'
        )}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label="Selecionar tenant"
      >
        <Building2 className="h-4 w-4 text-muted-foreground" />
        <div className="flex flex-col items-start min-w-0">
          <span className="text-sm font-medium truncate max-w-[150px]">
            {activeTenant?.name || 'Selecione...'}
          </span>
          <span className="text-xs text-muted-foreground font-mono">
            {activeTenant?.slug}
          </span>
        </div>
        <ChevronDown
          className={cn(
            'h-4 w-4 text-muted-foreground transition-transform',
            isOpen && 'rotate-180'
          )}
        />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div
          role="listbox"
          aria-label="Lista de tenants"
          className={cn(
            'absolute top-full left-0 right-0 mt-2',
            'bg-background border rounded-lg shadow-lg',
            'max-h-96 overflow-y-auto',
            'animate-in slide-in-from-top-2 duration-200',
            'z-50 min-w-[280px]'
          )}
        >
          {tenants.map((tenant) => {
            const isActive = tenant.id === currentTenantId;

            return (
              <div
                key={tenant.id}
                role="option"
                aria-selected={isActive}
                tabIndex={0}
                onClick={() => handleSelect(tenant.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleSelect(tenant.id);
                  }
                }}
                className={cn(
                  'flex items-center justify-between gap-3 p-3',
                  'cursor-pointer transition-colors',
                  'hover:bg-accent',
                  'focus:bg-accent focus:outline-none',
                  isActive && 'bg-primary/10'
                )}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <span className="font-medium truncate">{tenant.name}</span>
                  </div>
                  <div className="text-xs text-muted-foreground font-mono mt-0.5">
                    {tenant.slug}
                  </div>
                  {tenant._count && (
                    <div className="text-xs text-muted-foreground mt-1">
                      {tenant._count.leads} leads • {tenant._count.users}{' '}
                      usuários
                    </div>
                  )}
                </div>

                {isActive && (
                  <Check className="h-4 w-4 text-primary flex-shrink-0" />
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Loading Overlay */}
      {switching && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-card border rounded-lg p-6 shadow-lg">
            <div className="flex flex-col items-center gap-3">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
              <p className="text-sm font-medium">Trocando de tenant...</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

