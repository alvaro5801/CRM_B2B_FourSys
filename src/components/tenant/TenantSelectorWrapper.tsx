/**
 * TenantSelectorWrapper
 * 
 * Server Component que busca os tenants do usuário e renderiza o TenantSelector
 * Usado na Sidebar para permitir troca de contexto
 */

import { auth } from '@/auth';
import { getUserTenants } from '@/app/actions/tenant-switch';
import { TenantSelector } from './TenantSelector';

export async function TenantSelectorWrapper() {
  const session = await auth();

  if (!session?.user?.id) {
    return null;
  }

  const result = await getUserTenants();

  if ('error' in result || !result.tenants) {
    return null;
  }

  // Don't show if user has only one tenant
  if (result.tenants.length <= 1) {
    return null;
  }

  return (
    <TenantSelector
      tenants={result.tenants}
      activeTenantId={result.activeTenantId}
    />
  );
}


