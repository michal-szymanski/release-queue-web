import { AuthOptions } from 'next-auth';
import GitlabProvider from 'next-auth/providers/gitlab';
import { z } from 'zod';
import { env } from '@/env';

export const authOptions: AuthOptions = {
    pages: {
        signIn: '/auth/signin'
    },
    providers: [
        GitlabProvider({
            clientId: env.GITLAB_CLIENT_ID,
            clientSecret: env.GITLAB_CLIENT_SECRET,
            authorization: {
                url: `${env.GITLAB_URL}/oauth/authorize`,
                params: { scope: 'read_user api read_api' }
            },
            token: `${env.GITLAB_URL}/oauth/token`,
            userinfo: `${env.GITLAB_URL}/api/v4/user`
        })
    ],
    callbacks: {
        async jwt({ token, account }) {
            if (account) {
                token.access_token = account.access_token;
            }
            return token;
        },
        async session({ session, token }) {
            session.user.id = z.coerce.number().positive().parse(token.sub);
            return session;
        }
    }
};
