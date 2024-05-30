import { getToken } from 'next-auth/jwt';
import { NextRequest, NextResponse } from 'next/server';
import { env } from '@/env';
import { z } from 'zod';

const paramsSchema = z.object({ projectId: z.string(), mergeRequestIid: z.string() });

type Params = z.infer<typeof paramsSchema>;

export const GET = async (req: NextRequest, { params }: { params: Params }) => {
    try {
        const { projectId, mergeRequestIid } = paramsSchema.parse(params);

        const token = await getToken({ req });
        if (!token?.access_token) {
            return NextResponse.json('Unauthorized', { status: 401 });
        }

        const url = `${env.GITLAB_URL}/api/v4/projects/${projectId}/merge_requests/${mergeRequestIid}?include_rebase_in_progress=true`;

        const gitlabResponse = await fetch(url, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${token.access_token}`
            }
        });

        const gitlabPayload = await gitlabResponse.json();

        return NextResponse.json(gitlabPayload, { status: gitlabResponse.status });
    } catch (e) {
        return NextResponse.json(e, { status: 400 });
    }
};
