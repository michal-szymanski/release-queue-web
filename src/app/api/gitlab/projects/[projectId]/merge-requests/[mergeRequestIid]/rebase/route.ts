import { getToken } from 'next-auth/jwt';
import { NextRequest, NextResponse } from 'next/server';
import { env } from '@/env';
import { z } from 'zod';

const paramsSchema = z.object({ projectId: z.string(), mergeRequestIid: z.string() });

type Params = z.infer<typeof paramsSchema>;

export const POST = async (req: NextRequest, { params }: { params: Params }) => {
    try {
        const { projectId, mergeRequestIid } = paramsSchema.parse(params);

        const token = await getToken({ req });
        if (!token?.access_token) {
            return NextResponse.json('Unauthorized', { status: 401 });
        }

        const url = `${env.GITLAB_URL}/api/v4/projects/${projectId}/merge_requests/${mergeRequestIid}/rebase`;

        const rebaseResponse = await fetch(url, {
            method: 'PUT',
            headers: {
                Authorization: `Bearer ${token.access_token}`
            }
        });

        const rebasePayload = await rebaseResponse.json();

        return NextResponse.json({ status: rebaseResponse.status, payload: rebasePayload }, { status: 200 });
    } catch (e) {
        return NextResponse.json(e, { status: 400 });
    }
};
