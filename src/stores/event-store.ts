import {
    EventModel,
    JobEvent,
    jobEventSchema,
    MergeRequestEvent,
    mergeRequestEventSchema,
    MergeRequestMetadata,
    mergeRequestsResponseSchema,
    PipelineEvent,
    pipelineEventSchema,
    rebaseResponseSchema
} from '@/types';
import { makeAutoObservable, reaction } from 'mobx';
import { io } from 'socket.io-client';

export class EventStore {
    private _mergeRequest: MergeRequestEvent;
    private _pipeline?: PipelineEvent;
    private _jobs: JobEvent[];
    private _metadata?: MergeRequestMetadata;

    constructor({ mergeRequest, pipeline, jobs }: EventModel) {
        this._mergeRequest = mergeRequest;
        this._pipeline = pipeline;
        this._jobs = jobs;

        makeAutoObservable(this);

        this.updateMetadata();

        reaction(
            () => this._pipeline,
            async () => {
                await this.updateMetadata();
            }
        );
    }

    get mergeRequest() {
        return this._mergeRequest;
    }

    get pipeline() {
        return this._pipeline;
    }

    get jobs() {
        return this._jobs;
    }

    get sortedJobs() {
        return this.jobs.slice().sort((a, b) => a.build_id - b.build_id);
    }

    get metadata() {
        return this._metadata;
    }

    get isRebasing() {
        return false;
    }

    updateMergeRequest(mergeRequest: MergeRequestEvent) {
        console.log('update merge request');
        this._mergeRequest = mergeRequest;
    }

    updatePipeline(pipeline: PipelineEvent) {
        console.log('update pipeline');
        this._pipeline = pipeline;
    }

    updateJob(job: JobEvent) {
        console.log('add job');
        const jobs = this._jobs.map((j) => {
            if (j.build_id === job.build_id) {
                return job;
            }
            return j;
        });

        if (!jobs.some((j) => j.build_id === job.build_id)) {
            jobs.push(job);
        }

        this._jobs = jobs;
    }

    clearJobs() {
        console.log('clear jobs');
        this._jobs = [];
    }

    async rebase() {
        const url = `/api/gitlab/projects/${this.mergeRequest.project.id}/merge-requests/${this.mergeRequest.object_attributes.iid}/rebase`;
        const response = await fetch(url, {
            method: 'POST'
        });

        if (!response.ok) {
            return;
        }

        const json = await response.json();

        const { rebase_in_progress } = rebaseResponseSchema.parse(json);
    }

    private async updateMetadata() {
        console.log('update metadata');
        const url = `/api/gitlab/projects/${this._mergeRequest.project.id}/merge-requests/${this._mergeRequest.object_attributes.iid}`;

        const response = await fetch(url, {
            method: 'GET'
        });

        if (!response.ok) return;

        const json = await response.json();
        this._metadata = mergeRequestsResponseSchema.parse(json);
    }
}
