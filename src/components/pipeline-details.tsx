import PipelineStageIcon from '@/components/pipeline-stage-icon';
import { MergeRequestEvent, PipelineBuildStatus } from '@/types';
import { useStore } from '@/hooks';
import { observer } from 'mobx-react';

type Props = {
    event: MergeRequestEvent;
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

const PipelineDetails = ({ event }: Props) => {
    const {
        dataStore: { pipelineEvents, jobEvents }
    } = useStore();

    const pipeline = pipelineEvents
        .slice()
        .find((p) => p.commit.id === event.object_attributes.last_commit.id || p.commit.id === event.object_attributes.merge_commit_sha);

    const jobs = jobEvents
        .slice()
        .filter((job) => job.pipeline_id === pipeline?.object_attributes.id)
        .sort((a, b) => a.build_id - b.build_id);

    const renderContent = () => {
        if (!pipeline) return null;

        return (
            <>
                <div className="flex gap-1 text-sm">
                    <a href={pipeline.object_attributes.url} target="_blank" rel="noopener noreferrer">
                        Pipeline #{pipeline.object_attributes.id}
                    </a>
                    <span>{pipeline.object_attributes.detailed_status}</span>
                </div>
                <div className="inline-flex h-7 items-center gap-1">
                    {jobs.map((job) => {
                        const build = pipeline.builds.find((b) => b.id === job.build_id);
                        const status = getBuildStatus(job.build_allow_failure, job.build_status, build?.status);
                        return <PipelineStageIcon key={job.build_id} variant={status} text={`${job.build_stage}: ${status}`} />;
                    })}
                </div>
            </>
        );
    };

    return <div className="flex h-16 flex-col gap-2">{renderContent()}</div>;
};

export default observer(PipelineDetails);
