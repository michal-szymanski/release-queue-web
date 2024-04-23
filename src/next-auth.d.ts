import NextAuth from 'next-auth';
import { User } from '@/types';

declare module 'next-auth' {
    interface Session {
        user: User;
    }
}

declare module 'next-auth/jwt' {
    interface JWT {
        access_token?: string;
        expires_at?: number;
    }
}
