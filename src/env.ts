import { z } from 'zod';
import { createEnv } from '@t3-oss/env-nextjs';

export const env = createEnv({
    server: {
        GITLAB_CLIENT_ID: z.string().min(1),
        GITLAB_CLIENT_SECRET: z.string().min(1),
        GITLAB_URL: z.string().min(1).url(),
        CLERK_SECRET_KEY: z.string().min(1)
    },
    client: {
        NEXT_PUBLIC_WEBSOCKET_URL: z.string().min(1).url(),
        NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string().min(1),
        NEXT_PUBLIC_CLERK_SIGN_IN_URL: z.string().min(1),
        NEXT_PUBLIC_CLERK_SIGN_UP_URL: z.string().min(1),
        NEXT_PUBLIC_CLERK_TELEMETRY_DISABLED: z.literal('1')
    },
    runtimeEnv: {
        GITLAB_CLIENT_ID: process.env.GITLAB_CLIENT_ID,
        GITLAB_CLIENT_SECRET: process.env.GITLAB_CLIENT_SECRET,
        GITLAB_URL: process.env.GITLAB_URL,
        NEXT_PUBLIC_WEBSOCKET_URL: process.env.NEXT_PUBLIC_WEBSOCKET_URL,
        CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY,
        NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
        NEXT_PUBLIC_CLERK_SIGN_IN_URL: process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL,
        NEXT_PUBLIC_CLERK_SIGN_UP_URL: process.env.NEXT_PUBLIC_CLERK_SIGN_UP_URL,
        NEXT_PUBLIC_CLERK_TELEMETRY_DISABLED: process.env.NEXT_PUBLIC_CLERK_TELEMETRY_DISABLED
    }
});
