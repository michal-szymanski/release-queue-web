import PipelineStageIcon from '@/components/pipeline-stage-icon';
import { MergeRequestEvent, PipelineBuildStatus } from '@/types';
import { useStore } from '@/hooks';
import { observer } from 'mobx-react';
import { EventStore } from '@/stores/event-store';

type Props = {
    model: EventStore;
};

const getBuildStatus = (isFailureAllowed: boolean, jobStatus: PipelineBuildStatus, buildStatus?: PipelineBuildStatus) => {
    if (buildStatus === 'skipped') {
        return buildStatus;
    }

    if (jobStatus === 'failed' && isFailureAllowed) {
        return 'passed with warnings';
    }

    return jobStatus;
};

const PipelineDetails = ({ model }: Props) => {
    const renderContent = () => {
        if (model.isRebasing) {
            return (
                <div className="flex gap-2">
                    <span>Rebasing</span>
                    <PipelineStageIcon text="rebasing" variant="running" />
                </div>
            );
        }

        if (!model.pipeline) return null;

        return (
            <>
                <div className="flex gap-1 text-sm">
                    <a href={model.pipeline.object_attributes.url} target="_blank" rel="noopener noreferrer">
                        Pipeline #{model.pipeline.object_attributes.id}
                    </a>
                    <span>{model.pipeline.object_attributes.detailed_status}</span>
                </div>
                <div className="inline-flex h-7 items-center gap-1">
                    {model.sortedJobs.map((job) => {
                        const build = model.pipeline?.builds.find((b) => b.id === job.build_id);
                        const status = getBuildStatus(job.build_allow_failure, job.build_status, build?.status);
                        return <PipelineStageIcon key={job.build_id} variant={status} text={`${job.build_stage}: ${status}`} />;
                    })}
                </div>
            </>
        );
    };

    return <div className="flex h-16 flex-col justify-end gap-2">{renderContent()}</div>;
};

export default observer(PipelineDetails);
