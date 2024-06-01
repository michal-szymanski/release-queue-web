import { EventModel, JobEvent, MergeRequestEvent, MergeRequestMetadata, mergeRequestsResponseSchema, PipelineEvent, rebaseResponseSchema } from '@/types';
import { makeAutoObservable, reaction, runInAction } from 'mobx';

export class EventStore {
    private _mergeRequest: MergeRequestEvent;
    private _pipeline: PipelineEvent | null;
    private _jobs: JobEvent[];
    private _metadata: MergeRequestMetadata | null;
    private _isRebasing: boolean;

    constructor({ mergeRequest, pipeline, jobs }: EventModel) {
        this._mergeRequest = mergeRequest;
        this._pipeline = pipeline;
        this._jobs = jobs;
        this._metadata = null;
        this._isRebasing = false;

        makeAutoObservable(this);

        this.updateMetadata();

        reaction(
            () => ({ pipeline: this.pipeline, isRebasing: this.isRebasing }),
            async ({ pipeline, isRebasing }) => {
                await this.updateMetadata();

                if (!isRebasing || !pipeline) return;

                const isPipelineRunning = pipeline.object_attributes.status === 'running';
                this.setRebasing(!isPipelineRunning);
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
        return this._isRebasing;
    }

    updateMergeRequest(mergeRequest: MergeRequestEvent) {
        console.log('update merge request');
        this._mergeRequest = mergeRequest;
    }

    updatePipeline(pipeline: PipelineEvent) {
        console.log('current pipeline', this.pipeline);
        console.log('update pipeline', pipeline);
        this._pipeline = pipeline;
    }

    updateJob(job: JobEvent) {
        console.log('current jobs', this.jobs.slice());
        console.log('add job', job);
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

    setRebasing(value: boolean) {
        this._isRebasing = value;
    }

    async rebase() {
        this.setRebasing(true);

        const url = `/api/gitlab/projects/${this.mergeRequest.project.id}/merge-requests/${this.mergeRequest.object_attributes.iid}/rebase`;

        const response = await fetch(url, {
            method: 'POST'
        });

        if (!response.ok) {
            this.setRebasing(false);
        }
    }

    async updateMetadata() {
        console.log('update metadata');
        const url = `/api/gitlab/projects/${this._mergeRequest.project.id}/merge-requests/${this._mergeRequest.object_attributes.iid}`;

        const response = await fetch(url, {
            method: 'GET'
        });

        if (!response.ok) return;

        const json = await response.json();
        const metatada = mergeRequestsResponseSchema.parse(json);

        runInAction(() => {
            this._metadata = metatada;
        });

        if (metatada.detailed_merge_status !== 'checking') return;

        setTimeout(async () => await this.updateMetadata(), 1000);
    }
}
