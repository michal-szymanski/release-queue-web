'use client';

import { ClientSafeProvider, signIn } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import GitLabIcon from '@/icons/gitlab-icon.svg';

type Props = {
    providers: ClientSafeProvider[];
};

const AuthProviders = ({ providers }: Props) => {
    const gitLabProvider = providers.find((provider) => provider.name === 'GitLab');
    if (!gitLabProvider) return null;

    return (
        <Button type="button" variant="outline" onClick={() => signIn(gitLabProvider.id, { callbackUrl: '/' })}>
            <figure className="size-8">
                <GitLabIcon />
            </figure>
            <span>{gitLabProvider.name}</span>
        </Button>
    );
};

export default AuthProviders;
