import { NextRequest, NextResponse } from 'next/server';
import { env } from '@/env';
import { z } from 'zod';
import { auth, clerkClient } from '@clerk/nextjs/server';

const paramsSchema = z.object({ projectId: z.string(), mergeRequestIid: z.string() });

type Params = z.infer<typeof paramsSchema>;

export const GET = async (req: NextRequest, { params }: { params: Params }) => {
    const { userId } = auth();

    if (!userId) {
        return new Response('Unauthorized', { status: 401 });
    }

    try {
        const { projectId, mergeRequestIid } = paramsSchema.parse(params);

        const { data } = await clerkClient.users.getUserOauthAccessToken(userId, 'oauth_gitlab');

        const accessToken = data[0].token;

        if (!accessToken) {
            return NextResponse.json('Unauthorized', { status: 401 });
        }

        const url = `${env.GITLAB_URL}/api/v4/projects/${projectId}/merge_requests/${mergeRequestIid}?include_rebase_in_progress=true`;

        const gitlabResponse = await fetch(url, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        });

        const gitlabPayload = await gitlabResponse.json();

        return NextResponse.json(gitlabPayload, { status: gitlabResponse.status });
    } catch (e) {
        return NextResponse.json(e, { status: 400 });
    }
};
