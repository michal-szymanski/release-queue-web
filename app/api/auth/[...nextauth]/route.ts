import NextAuth from 'next-auth';
import GitlabProvider from 'next-auth/providers/gitlab';

const handler = NextAuth({
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
    ]
});

export { handler as GET, handler as POST };
