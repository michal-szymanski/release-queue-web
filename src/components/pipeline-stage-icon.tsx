import { PipelineBuildStatus } from '@/types';
import { Circle, CircleAlert, CircleArrowRight, CircleCheck, CirclePause, CircleX, LoaderCircle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

type Props = {
    text: string;
    variant: PipelineBuildStatus | 'passed with warnings';
};

const renderIcon = (variant: PipelineBuildStatus | 'passed with warnings') => {
    switch (variant) {
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
        case 'passed with warnings':
            return <CircleAlert className="text-yellow-500" />;
        default:
            return null;
    }
};

const PipelineStageIcon = ({ text, variant }: Props) => {
    return (
        <TooltipProvider delayDuration={0} disableHoverableContent>
            <Tooltip>
                <TooltipTrigger className="cursor-pointer" asChild>
                    {renderIcon(variant)}
                </TooltipTrigger>
                <TooltipContent className="pointer-events-none">{text}</TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
};

export default PipelineStageIcon;
