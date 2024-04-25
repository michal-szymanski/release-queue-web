import {
    JobEvent,
    jobEventSchema,
    MergeRequestEvent,
    mergeRequestEventSchema,
    mergeRequestsResponseSchema,
    PipelineEvent,
    pipelineEventSchema,
    rebaseResponseSchema
} from '@/types';
import { action, autorun, computed, IObservableArray, makeObservable, observable, reaction, runInAction } from 'mobx';
import { io } from 'socket.io-client';
import { z } from 'zod';
import { env } from '@/env';
import { minBy } from '@/lib/utils';

export class DataStore {
    mergeRequestEvents: IObservableArray<MergeRequestEvent>;
    pipelineEvents: IObservableArray<PipelineEvent>;
    jobEvents: IObservableArray<JobEvent>;
    queueMap: Map<string, { id: number; json: MergeRequestEvent; date: string; order: number }[]> = new Map();
    rebaseMap: Map<number, { isInProgress: boolean; hasConflicts: boolean }> = new Map();

    private _socket: ReturnType<typeof io> = io(env.NEXT_PUBLIC_WEBSOCKET_URL, { withCredentials: true });
    private _isQueueLoaded = false;

    constructor() {
        type PrivateMembers =
            | 'setMergeRequests'
            | 'updateQueueMap'
            | 'setPipelines'
            | 'setJobs'
            | 'setIsQueueLoaded'
            | 'rebaseNextQueueItem'
            | 'updateRebaseStatus'
            | '_socket'
            | '_isQueueLoaded';

        this.mergeRequestEvents = observable.array([]);
        this.pipelineEvents = observable.array([]);
        this.jobEvents = observable.array([]);

        makeObservable<DataStore, PrivateMembers>(this, {
            queueMap: observable,
            _socket: observable,
            setMergeRequests: action,
            addToQueue: action,
            removeFromQueue: action,
            updateQueueMap: action,
            setPipelines: action,
            setJobs: action,
            stepBackInQueue: action,
            _isQueueLoaded: observable,
            isQueueEmpty: computed,
            setIsQueueLoaded: action,
            rebaseMap: observable,
            rebaseNextQueueItem: action,
            updateRebaseStatus: action
        });

        this.addToQueue = this.addToQueue.bind(this);
        this.removeFromQueue = this.removeFromQueue.bind(this);
        this.stepBackInQueue = this.stepBackInQueue.bind(this);
        this.rebaseNextQueueItem = this.rebaseNextQueueItem.bind(this);

        this.subscribe();

        reaction(
            () => {
                const queueItems = Array.from(this.queueMap.keys())
                    .map((key) => minBy(this.queueMap.get(key) ?? [], (item) => item.order)?.json)
                    .filter((event): event is MergeRequestEvent => event !== undefined);

                const pipelines = this.pipelineEvents
                    .slice()
                    .filter((p) =>
                        queueItems.some((qi) => qi.object_attributes.last_commit.id === p.commit.id || qi.object_attributes.merge_commit_sha === p.commit.id)
                    );

                return { queueItems, pipelines };
            },
            async ({ queueItems }) => {
                for (const mergeRequest of queueItems) {
                    await this.updateRebaseStatus(mergeRequest);
                }
            }
        );
    }

    private subscribe() {
        this._socket.on('connect', () => {
            console.log(`Client connected. id: ${this._socket.id}`);
        });

        this._socket.on('disconnect', () => {
            console.log(`Client disconnected. id: ${this._socket.id}`);
        });

        this._socket.on('merge-requests', (payload) => {
            const events = z.array(mergeRequestEventSchema).parse(payload);
            this.setMergeRequests(events);
        });

        this._socket.on('queue', (payload) => {
            const queueItems = z
                .array(
                    z.object({
                        id: z.number(),
                        json: mergeRequestEventSchema,
                        date: z.string().datetime(),
                        order: z.number()
                    })
                )
                .parse(payload);
            this.setIsQueueLoaded();
            this.updateQueueMap(queueItems);
        });

        this._socket.on('pipelines', (payload) => {
            const events = z.array(pipelineEventSchema).parse(payload);
            this.setPipelines(events);
        });

        this._socket.on('jobs', (payload) => {
            const events = z.array(jobEventSchema).parse(payload);
            this.setJobs(events);
        });
    }

    private setMergeRequests(events: MergeRequestEvent[]) {
        this.mergeRequestEvents.replace(
            [...events].sort((a, b) => new Date(b.object_attributes.updated_at).getTime() - new Date(a.object_attributes.updated_at).getTime())
        );
    }

    private updateQueueMap(queueItems: { id: number; json: MergeRequestEvent; date: string; order: number }[]) {
        const repositoriesInQueue = Array.from(new Set(queueItems.map((queueItem) => queueItem.json.repository.name)));
        const keysToRemove = Array.from(this.queueMap.keys()).filter((key) => !repositoriesInQueue.includes(key));

        for (const key of keysToRemove) {
            this.queueMap.delete(key);
        }

        for (const repositoryName of repositoriesInQueue) {
            const queue = queueItems.filter((queueItem) => queueItem.json.repository.name === repositoryName);
            this.queueMap.set(repositoryName, queue);
        }
    }

    private setPipelines(events: PipelineEvent[]) {
        this.pipelineEvents.replace([...events]);
    }

    private setJobs(events: JobEvent[]) {
        this.jobEvents.replace([...events]);
    }

    addToQueue(event: MergeRequestEvent, isoString: string) {
        this._socket.emit('add-to-queue', {
            mergeRequestIid: event.object_attributes.iid,
            isoString: z.string().datetime().parse(isoString)
        });
    }

    async removeFromQueue(event: MergeRequestEvent) {
        this._socket.emit('remove-from-queue', event.object_attributes.iid);
        this.rebaseMap.delete(event.object_attributes.iid);

        const queue = this.queueMap.get(event.project.name) ?? [];
        const isFirstInQueue = minBy(queue, (item) => item.order)?.json.object_attributes.iid === event.object_attributes.iid;

        if (event.object_attributes.action === 'merge' || isFirstInQueue) {
            await this.rebaseNextQueueItem(event);
        }
    }

    stepBackInQueue(event: MergeRequestEvent) {
        this._socket.emit('step-back-in-queue', event.object_attributes.iid);
    }

    private setIsQueueLoaded() {
        this._isQueueLoaded = true;
    }

    private async rebaseNextQueueItem(event: MergeRequestEvent) {
        const otherQueueItems = (this.queueMap.get(event.project.name) ?? []).filter((item) => item.json.object_attributes.iid !== event.object_attributes.iid);
        const nextMergeRequest = minBy(otherQueueItems, (item) => item.order)?.json;

        if (!nextMergeRequest) return;

        const url = `/api/gitlab/projects/${nextMergeRequest.project.id}/merge-requests/${nextMergeRequest.object_attributes.iid}/rebase`;
        const response = await fetch(url, {
            method: 'POST'
        });

        if (!response.ok) return;

        const json = await response.json();

        const {
            payload: { rebase_in_progress }
        } = rebaseResponseSchema.parse(json);

        runInAction(() => {
            this.rebaseMap.set(nextMergeRequest.object_attributes.iid, { isInProgress: rebase_in_progress, hasConflicts: false });
        });

        await this.updateRebaseStatus(nextMergeRequest);
    }

    private async updateRebaseStatus(event: MergeRequestEvent) {
        const url = `/api/gitlab/projects/${event.project.id}/merge-requests/${event.object_attributes.iid}`;

        const response = await fetch(url, {
            method: 'GET'
        });

        if (!response.ok) return;

        const json = await response.json();
        const {
            payload: { iid, rebase_in_progress, has_conflicts }
        } = mergeRequestsResponseSchema.parse(json);

        runInAction(() => {
            this.rebaseMap.set(iid, { isInProgress: rebase_in_progress, hasConflicts: has_conflicts });
        });
    }

    get isQueueEmpty() {
        return this._isQueueLoaded && this.queueMap.size === 0;
    }
}
