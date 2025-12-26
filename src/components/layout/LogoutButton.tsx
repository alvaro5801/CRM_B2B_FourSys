/**
 * LogoutButton Component
 * 
 * Client Component para botão de logout
 * Usa NextAuth.js signOut para encerrar a sessão
 */

'use client';

import { signOut } from 'next-auth/react';
import { LogOut } from 'lucide-react';
import { toast } from 'sonner';

interface LogoutButtonProps {
  userName?: string;
}

export function LogoutButton({ userName }: LogoutButtonProps) {
  const handleLogout = async () => {
    const toastId = toast.loading('Saindo...');
    
    try {
      await signOut({ 
        callbackUrl: '/login',
        redirect: true 
      });
      
      toast.success('Até logo!', { id: toastId });
    } catch (error) {
      toast.error('Erro ao sair. Tente novamente.', { id: toastId });
    }
  };

  return (
    <div className="border-t p-4 space-y-3">
      {/* User Info */}
      {userName && (
        <div className="px-2">
          <p className="text-sm font-medium truncate">{userName}</p>
          <p className="text-xs text-muted-foreground">Usuário ativo</p>
        </div>
      )}

      {/* Logout Button */}
      <button
        onClick={handleLogout}
        className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10 hover:text-destructive"
      >
        <LogOut className="h-5 w-5" />
        Sair
      </button>

      {/* Version Info */}
      <p className="text-xs text-muted-foreground text-center pt-2">
        CRM B2B FourSys v1.0
      </p>
    </div>
  );
}

