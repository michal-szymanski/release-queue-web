import { JobEvent } from '@/types';
import { Circle, CircleArrowRight, CircleCheck, CirclePause, CircleX, LoaderCircle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

type Props = {
    job: JobEvent;
};

const renderIcon = (job: JobEvent) => {
    switch (job.build_status) {
        case 'created':
            return <Circle className="text-muted" />;
        case 'pending':
            return <CirclePause className="text-yellow-500" />;
        case 'running':
            return <LoaderCircle className="animate-spin-slow text-blue-500" />;
        case 'success':
            return <CircleCheck className="text-green-500" />;
        case 'failed':
            return <CircleX className="text-red-500" />;
        case 'skipped':
            return <CircleArrowRight className="text-muted" />;
        default:
            return null;
    }
};

const PipelineStageIcon = ({ job }: Props) => {
    return (
        <TooltipProvider delayDuration={0} disableHoverableContent>
            <Tooltip>
                <TooltipTrigger className="cursor-pointer" asChild>
                    {renderIcon(job)}
                </TooltipTrigger>
                <TooltipContent className="pointer-events-none">{`${job.build_stage}: ${job.build_status}`}</TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
};

export default PipelineStageIcon;
