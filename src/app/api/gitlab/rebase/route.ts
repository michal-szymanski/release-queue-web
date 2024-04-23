import { getToken } from 'next-auth/jwt';
import { NextRequest, NextResponse } from 'next/server';
import { env } from '@/env';
import { z } from 'zod';

const payloadSchema = z.object({ projectId: z.number(), mergeRequestIid: z.number() });

export const POST = async (req: NextRequest) => {
    try {
        const { projectId, mergeRequestIid } = payloadSchema.parse(await req.json());

        const token = await getToken({ req });
        if (!token?.access_token) {
            return NextResponse.json('Unauthorized', { status: 401 });
        }

        const rebaseResponse = await fetch(`${env.GITLAB_URL}/api/v4/projects/${projectId}/merge_requests/${mergeRequestIid}/rebase`, {
            method: 'PUT',
            headers: {
                Authorization: `Bearer ${token.access_token}`
            }
        });

        const mergeRequestResponse = await fetch(
            `${env.GITLAB_URL}/api/v4/projects/${projectId}/merge_requests/${mergeRequestIid}?include_rebase_in_progress=true`,
            {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${token.access_token}`
                }
            }
        );

        const rebasePayload = await rebaseResponse.json();
        const mergeRequestPayload = await mergeRequestResponse.json();

        return NextResponse.json(
            {
                rebase: {
                    status: rebaseResponse.status,
                    payload: rebasePayload
                },
                mergeRequest: {
                    status: mergeRequestResponse.status,
                    payload: mergeRequestPayload
                }
            },
            { status: 200 }
        );
    } catch (e) {
        return NextResponse.json(e, { status: 400 });
    }
};
