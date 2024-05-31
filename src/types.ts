import { z } from 'zod';

export const objectKindSchema = z.enum(['merge_request', 'pipeline', 'deployment', 'build']);

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

const mergeRequestStatusSchema = z.enum(['opened', 'merged', 'cancelled']);
export type MergeRequestState = z.infer<typeof mergeRequestStatusSchema>;

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
                email: z.string()
            }),
            id: z.string(),
            message: z.string(),
            timestamp: z.string(),
            title: z.string(),
            url: z.string()
        }),
        last_edited_at: z.string().nullable(),
        last_edited_by_id: z.unknown().nullable(),
        merge_commit_sha: z.string().nullable(),
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
        state: mergeRequestStatusSchema,
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

export const userSchema = z.object({
    id: z.number(),
    name: z.string(),
    email: z.string(),
    image: z.string()
});

export type User = z.infer<typeof userSchema>;

const pipelineBuildStatusSchema = z.enum(['created', 'pending', 'running', 'success', 'failed', 'skipped']);

export type PipelineBuildStatus = z.infer<typeof pipelineBuildStatusSchema>;

const pipelineStatusSchema = z.enum([
    'created',
    'waiting_for_resource',
    'preparing',
    'pending',
    'running',
    'success',
    'failed',
    'canceled',
    'skipped',
    'manual',
    'scheduled'
]);

export const pipelineEventSchema = z.object({
    object_kind: z.literal('pipeline'),
    object_attributes: z.object({
        id: z.number(),
        detailed_status: z.string(),
        status: pipelineStatusSchema,
        stages: z.array(z.string()),
        url: z.string().url()
    }),
    commit: z.object({
        id: z.string()
    }),
    builds: z.array(
        z.object({
            id: z.number(),
            stage: z.string(),
            status: pipelineBuildStatusSchema
        })
    )
});

export type PipelineEvent = z.infer<typeof pipelineEventSchema>;

export const jobEventSchema = z.object({
    build_id: z.number(),
    pipeline_id: z.number(),
    build_stage: z.string(),
    build_status: pipelineBuildStatusSchema,
    build_allow_failure: z.boolean(),
    commit: z.object({
        sha: z.string()
    })
});

export type JobEvent = z.infer<typeof jobEventSchema>;

export const rebaseResponseSchema = z.object({
    rebase_in_progress: z.boolean(),
    merge_error: z.string().nullish()
});

const detailedMergeStatusEnum = z.enum([
    'unchecked',
    'checking',
    'mergeable',
    'commits_status',
    'ci_must_pass',
    'ci_still_running',
    'discussions_not_resolved',
    'draft_status',
    'not_open',
    'not_approved',
    'merge_request_blocked',
    'status_checks_must_pass',
    'preparing',
    'jira_association_missing',
    'conflict',
    'need_rebase',
    'approvals_syncing'
]);

export type DetailedMergeStatus = z.infer<typeof detailedMergeStatusEnum>;

export const mergeRequestsResponseSchema = z.object({
    iid: z.number(),
    merge_status: z.string(),
    detailed_merge_status: detailedMergeStatusEnum,
    has_conflicts: z.boolean(),
    merge_error: z.string().nullable(),
    rebase_in_progress: z.boolean(),
    user: z.object({
        can_merge: z.boolean()
    })
});

export type MergeRequestMetadata = z.infer<typeof mergeRequestsResponseSchema>;

export const eventModelSchema = z.object({
    mergeRequest: mergeRequestEventSchema,
    pipeline: pipelineEventSchema.optional(),
    jobs: z.array(jobEventSchema)
});

export type EventModel = z.infer<typeof eventModelSchema>;
