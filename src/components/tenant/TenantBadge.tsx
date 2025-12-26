/**
 * TenantBadge Component
 * 
 * Exibe o tenant atual no header/sidebar
 * Indica visualmente qual tenant está ativo
 */

import { Building2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface TenantBadgeProps {
  tenantName: string;
  tenantSlug: string;
  isActive?: boolean;
  className?: string;
}

export function TenantBadge({ 
  tenantName, 
  tenantSlug, 
  isActive = true,
  className = '' 
}: TenantBadgeProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Badge 
        variant={isActive ? "default" : "secondary"}
        className="flex items-center gap-2 px-3 py-1.5"
      >
        <Building2 className="h-4 w-4" />
        <div className="flex flex-col items-start">
          <span className="font-semibold text-sm">{tenantName}</span>
          <span className="text-xs opacity-80 font-mono">{tenantSlug}</span>
        </div>
      </Badge>
    </div>
  );
}



