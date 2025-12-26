/**
 * Auth.js v5 Setup
 * Multi-tenancy: Session management with tenantId
 */

import NextAuth from 'next-auth';
import { authConfig } from './auth.config';

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);


