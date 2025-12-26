'use client';

import { Toaster } from 'sonner';

export function ToasterProvider() {
  return (
    <Toaster 
      position="top-right" 
      richColors 
      closeButton 
      expand={false}
      duration={4000}
      className="z-[99999]"
      theme="system"
      toastOptions={{
        style: {
          padding: '16px',
        },
        className: 'toast-modern',
        onClick: (e) => {
          e.stopPropagation(); // Impede que o clique no toast feche modais
        },
        onPointerDown: (e) => {
          e.stopPropagation(); // Impede que pointer events fechem modais
        },
      }}
    />
  );
}

