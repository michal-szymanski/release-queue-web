import NextAuth, { AuthOptions } from 'next-auth';
import GitlabProvider from 'next-auth/providers/gitlab';
import { z } from 'zod';

export const authOptions: AuthOptions = {
    pages: {
        signIn: '/auth/signin'
    },
    providers: [
        GitlabProvider({
            clientId: process.env.GITLAB_CLIENT_ID ?? '',
            clientSecret: process.env.GITLAB_CLIENT_SECRET ?? '',
            authorization: {
                url: `${process.env.GITLAB_URL}/oauth/authorize`,
                params: { scope: 'read_user' }
            },
            token: `${process.env.GITLAB_URL}/oauth/token`,
            userinfo: `${process.env.GITLAB_URL}/api/v4/user`
        })
    ],
    callbacks: {
        async session({ session, token }) {
            session.user.id = z.coerce.number().positive().parse(token.sub);
            return session;
        }
    }
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
