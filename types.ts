import { z } from 'zod';

export const objectKindSchema = z.enum(['merge_request', 'pipeline', 'deployment', 'build']);

export const gitlabWebhookEvent = z.object({
    object_kind: objectKindSchema
});

const location = z.object({
    avatar_url: z.string().nullable(),
    ci_config_path: z.string().nullable(),
    default_branch: z.string(),
    description: z.string().nullable(),
    git_http_url: z.string(),
    git_ssh_url: z.string(),
    homepage: z.string(),
    http_url: z.string(),
    id: z.number(),
    name: z.string(),
    namespace: z.string(),
    path_with_namespace: z.string(),
    ssh_url: z.string(),
    url: z.string(),
    visibility_level: z.number(),
    web_url: z.string()
});

export const mergeRequestEventSchema = z.object({
    changes: z.object({
        prepared_at: z
            .object({
                previous: z.string().nullable(),
                current: z.string()
            })
            .optional(),
        updated_at: z
            .object({
                previous: z.string(),
                current: z.string()
            })
            .optional()
    }),
    event_type: z.string(),
    labels: z.array(z.unknown()),
    object_attributes: z.object({
        action: z.string().optional(),
        assignee_id: z.unknown().nullable(),
        assignee_ids: z.array(z.unknown()),
        author_id: z.number(),
        blocking_discussions_resolved: z.boolean(),
        created_at: z.string(),
        description: z.string(),
        detailed_merge_status: z.string(),
        draft: z.boolean(),
        first_contribution: z.boolean(),
        head_pipeline_id: z.number().nullable(),
        human_time_change: z.unknown().nullable(),
        human_time_estimate: z.unknown().nullable(),
        human_total_time_spent: z.unknown().nullable(),
        id: z.number(),
        iid: z.number(),
        labels: z.array(z.unknown()),
        last_commit: z.object({
            author: z.object({
                name: z.string(),
                email: z.string().email()
            }),
            id: z.string(),
            message: z.string(),
            timestamp: z.string(),
            title: z.string(),
            url: z.string()
        }),
        last_edited_at: z.string().nullable(),
        last_edited_by_id: z.unknown().nullable(),
        merge_commit_sha: z.unknown().nullable(),
        merge_error: z.unknown().nullable(),
        merge_params: z.object({
            force_remove_source_branch: z.string()
        }),
        merge_status: z.string(),
        merge_user_id: z.unknown().nullable(),
        merge_when_pipeline_succeeds: z.boolean(),
        milestone_id: z.unknown().nullable(),
        prepared_at: z.string(),
        reviewer_ids: z.array(z.unknown()),
        source: location,
        source_branch: z.string(),
        source_project_id: z.number(),
        state: z.string(),
        state_id: z.number(),
        target: location,
        target_branch: z.string(),
        target_project_id: z.number(),
        time_change: z.number(),
        time_estimate: z.number(),
        title: z.string(),
        total_time_spent: z.number(),
        updated_at: z.string(),
        updated_by_id: z.unknown().nullable(),
        url: z.string(),
        work_in_progress: z.boolean()
    }),
    object_kind: z.literal(objectKindSchema.Enum.merge_request),
    project: location,
    repository: z.object({
        description: z.string().nullable(),
        homepage: z.string(),
        name: z.string(),
        url: z.string()
    }),
    user: z.object({
        avatar_url: z.string(),
        email: z.string(),
        id: z.number(),
        name: z.string(),
        username: z.string()
    })
});

export type MergeRequestEvent = z.infer<typeof mergeRequestEventSchema>;
