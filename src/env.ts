import { z } from 'zod';
import { createEnv } from '@t3-oss/env-nextjs';

export const env = createEnv({
    server: {
        GITLAB_CLIENT_ID: z.string().min(1),
        GITLAB_CLIENT_SECRET: z.string().min(1),
        NEXTAUTH_URL: z.string().min(1).url(),
        NEXTAUTH_SECRET: z.string().min(1),
        GITLAB_URL: z.string().min(1).url()
    },
    client: {
        NEXT_PUBLIC_WEBSOCKET_URL: z.string().min(1).url()
    },
    runtimeEnv: {
        GITLAB_CLIENT_ID: process.env.GITLAB_CLIENT_ID,
        GITLAB_CLIENT_SECRET: process.env.GITLAB_CLIENT_SECRET,
        NEXTAUTH_URL: process.env.NEXTAUTH_URL,
        NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
        GITLAB_URL: process.env.GITLAB_URL,
        NEXT_PUBLIC_WEBSOCKET_URL: process.env.NEXT_PUBLIC_WEBSOCKET_URL
    }
});
