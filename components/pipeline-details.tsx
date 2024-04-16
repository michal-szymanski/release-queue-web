import PipelineStageIcon from '@/components/pipeline-stage-icon';
import { MergeRequestEvent } from '@/types';
import { useStore } from '@/hooks';
import { observer } from 'mobx-react';

type Props = {
    event: MergeRequestEvent;
};

const PipelineDetails = ({ event }: Props) => {
    const {
        dataStore: { pipelineEvents, jobEvents }
    } = useStore();
    const pipeline = pipelineEvents.find(
        (p) => p.commit.id === event.object_attributes.last_commit.id || p.commit.id === event.object_attributes.merge_commit_sha
    );

    if (!pipeline) return null;

    return (
        <div className="flex flex-col gap-2">
            <a href={pipeline.object_attributes.url} className="text-sm" target="_blank" rel="noopener noreferrer">
                Pipeline #{pipeline.object_attributes.id}
            </a>
            <div className="inline-flex h-7 items-center gap-1">
                {pipeline.object_attributes.stages.map((stage) => {
                    const job = jobEvents.find((j) => j.pipeline_id === pipeline.object_attributes.id && j.build_stage === stage);
                    if (!job) return null;
                    return <PipelineStageIcon key={stage} job={job} />;
                })}
            </div>
        </div>
    );
};

export default observer(PipelineDetails);
