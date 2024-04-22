import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { MergeRequestState } from '@/types';
import { GitMerge, GitPullRequestArrow } from 'lucide-react';

type Props = {
    state: MergeRequestState;
};

const MergeRequestBadge = ({ state }: Props) => {
    const renderContent = () => {
        if (state === 'opened') {
            return (
                <>
                    <GitPullRequestArrow className="size-4" />
                    <span>Open</span>
                </>
            );
        }

        return (
            <>
                <GitMerge className="size-4" />
                <span>Merged</span>
            </>
        );
    };

    return (
        <Badge
            className={cn('hover:bg-tra capitalize', {
                'bg-green-500': state === 'opened',
                'bg-blue-500': state === 'merged'
            })}
        >
            <div className="inline-flex items-center justify-center gap-1">{renderContent()}</div>
        </Badge>
    );
};

export default MergeRequestBadge;
