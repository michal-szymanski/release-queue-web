import { AuthOptions, User } from 'next-auth';
import GitlabProvider from 'next-auth/providers/gitlab';
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
        async jwt({ token, account, profile }) {
            if (account) {
                const userProfile: User = {
                    id: token.sub!,
                    name: profile?.name,
                    email: profile?.email,
                    image: token?.picture
                };

                return {
                    access_token: account.access_token,
                    expires_at: account.expires_at,
                    refresh_token: account.refresh_token,
                    user: userProfile
                };
            } else if (Date.now() < (token.expires_at ?? 0) * 1000) {
                return token;
            } else {
                if (!token.refresh_token) {
                    throw new Error('Missing refresh token.K');
                }

                try {
                    const response = await fetch(`${env.GITLAB_URL}/oauth/token`, {
                        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                        body: new URLSearchParams({
                            client_id: env.GITLAB_CLIENT_ID,
                            client_secret: env.GITLAB_CLIENT_SECRET,
                            grant_type: 'refresh_token',
                            refresh_token: token.refresh_token!
                        }),
                        method: 'POST'
                    });

                    const json = await response.json();

                    if (!response.ok) {
                        console.log({ json });
                        throw Error('Could not rotate access token.', json);
                    }

                    const { access_token, refresh_token, expires_in } = json as { access_token: string; refresh_token: string; expires_in: number };
                    console.log('new tokens', { access_token, refresh_token });
                    return {
                        ...token,
                        access_token,
                        expires_at: Math.floor(Date.now() / 1000 + expires_in),
                        refresh_token
                    };
                } catch (error) {
                    console.error('Error refreshing access token', error);
                    return {
                        ...token,
                        error: 'RefreshAccessTokenError' as const
                    };
                }
            }
        },
        async session({ session, token }) {
            if (token.user) {
                session.user = token.user as User;
            }

            return session;
        }
    }
};
