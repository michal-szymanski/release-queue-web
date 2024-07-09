import { NextRequest, NextResponse } from 'next/server';
import { env } from '@/env';
import { z } from 'zod';
import { auth } from '@clerk/nextjs/server';

const paramsSchema = z.object({ projectId: z.string(), mergeRequestIid: z.string() });

type Params = z.infer<typeof paramsSchema>;

export const POST = async (req: NextRequest, { params }: { params: Params }) => {
    const { userId, getToken } = auth();

    if (!userId) {
        return new Response('Unauthorized', { status: 401 });
    }

    try {
        const { projectId, mergeRequestIid } = paramsSchema.parse(params);

        const token = await getToken();

        if (!token) {
            return NextResponse.json('Unauthorized', { status: 401 });
        }

        const url = `${env.GITLAB_URL}/api/v4/projects/${projectId}/merge_requests/${mergeRequestIid}/rebase`;

        const gitlabResponse = await fetch(url, {
            method: 'PUT',
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        const gitlabPayload = await gitlabResponse.json();

        return NextResponse.json(gitlabPayload, { status: gitlabResponse.status });
    } catch (e) {
        return NextResponse.json(e, { status: 400 });
    }
};
