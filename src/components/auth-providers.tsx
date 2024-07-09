'use client';

import { Button } from '@/components/ui/button';
import GitLabIcon from '@/icons/gitlab-icon.svg';
import { useSignIn, useSignUp } from '@clerk/nextjs';

const AuthProviders = () => {
    const { signIn } = useSignIn();
    const { signUp, setActive } = useSignUp();

    if (!signIn || !signUp) return null;

    const handleSignIn = async () => {
        if (!signIn || !signUp) return null;

        // If the user has an account in your application, but does not yet
        // have an OAuth account connected to it, you can transfer the OAuth
        // account to the existing user account.
        const userExistsButNeedsToSignIn =
            signUp.verifications.externalAccount.status === 'transferable' && signUp.verifications.externalAccount.error?.code === 'external_account_exists';

        if (userExistsButNeedsToSignIn) {
            const res = await signIn.create({ transfer: true });

            if (res.status === 'complete') {
                setActive({
                    session: res.createdSessionId
                });
            }
        }

        // If the user has an OAuth account but does not yet
        // have an account in your app, you can create an account
        // for them using the OAuth information.
        const userNeedsToBeCreated = signIn.firstFactorVerification.status === 'transferable';

        if (userNeedsToBeCreated) {
            const res = await signUp.create({
                transfer: true
            });

            if (res.status === 'complete') {
                setActive({
                    session: res.createdSessionId
                });
            }
        } else {
            // If the user has an account in your application
            // and has an OAuth account connected to it, you can sign them in.
            return signIn.authenticateWithRedirect({
                strategy: 'oauth_gitlab',
                redirectUrl: '/auth/callback',
                redirectUrlComplete: '/'
            });
        }
    };

    return (
        <Button type="button" variant="outline" onClick={handleSignIn}>
            <figure className="size-8">
                <GitLabIcon />
            </figure>
            <span>GitLab</span>
        </Button>
    );
};

export default AuthProviders;
