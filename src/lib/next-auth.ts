import { AuthOptions } from 'next-auth';
import GitlabProvider from 'next-auth/providers/gitlab';
import { z } from 'zod';
import { env } from '@/env';
import { JWT } from 'next-auth/jwt';

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
            const isTokenActive = Date.now() < (token.expires_at ?? 0) * 1000;
            const isSignIn = account !== null && account !== undefined;

            if (isTokenActive) {
                return token;
            }

            if (isSignIn) {
                token.access_token = account.access_token;
            }

            return rotatePersonalAccessToken(token);
        },
        async session({ session, token }) {
            session.user.id = z.coerce.number().positive().parse(token.sub);
            return session;
        }
    }
};

const personalAccessTokenSchema = z.object({
    id: z.number(),
    name: z.string(),
    revoked: z.boolean(),
    created_at: z.string().datetime(),
    scopes: z.array(z.string()),
    user_id: z.number(),
    last_used_at: z.string().datetime().nullable(),
    active: z.boolean(),
    expires_at: z.string(),
    token: z.string().optional()
});

type PersonalAccessToken = z.infer<typeof personalAccessTokenSchema>;

const getPersonalAccessToken = async (token: JWT): Promise<PersonalAccessToken> => {
    const response = await fetch(`${env.GITLAB_URL}/api/v4/personal_access_tokens?search=release-queue&revoked=false`, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${token.access_token}`
        }
    });

    const json = await response.json();

    if (response.ok) {
        return z.array(personalAccessTokenSchema).min(1).parse(json)[0];
    }

    throw Error('Could not retrieve personal access token.', json);
};

const rotatePersonalAccessToken = async (token: JWT): Promise<JWT> => {
    try {
        const { id } = await getPersonalAccessToken(token);
        const response = await fetch(`${env.GITLAB_URL}/api/v4/personal_access_tokens/${id}/rotate`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token.access_token}`
            }
        });

        const json = await response.json();
        const { token: newAccessToken, expires_at } = personalAccessTokenSchema.parse(json);

        return {
            ...token,
            access_token: newAccessToken,
            expires_at: new Date(expires_at).getTime() / 1000
        };
    } catch (e) {
        console.error('Could not rotate personal access token.', e);
        return token;
    }
};
