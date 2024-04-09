import { PipelineBuild } from '@/types';
import { CircleArrowRight, CircleX } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

type Props = {
    build?: PipelineBuild;
};

const renderIcon = (build: PipelineBuild) => {
    switch (build.status) {
        case 'failed':
            return <CircleX className="text-red-500" />;
        case 'skipped':
            return <CircleArrowRight className="text-muted" />;
        default:
            return null;
    }
};

const PipelineStageIcon = ({ build }: Props) => {
    if (!build) return null;

    return (
        <TooltipProvider delayDuration={0}>
            <Tooltip>
                <TooltipTrigger className="cursor-pointer" asChild>
                    {renderIcon(build)}
                </TooltipTrigger>
                <TooltipContent>{`${build.stage}: ${build.status}`}</TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
};

export default PipelineStageIcon;
