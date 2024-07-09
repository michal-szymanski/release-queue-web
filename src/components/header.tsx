import { ThemeDropdown } from '@/components/theme-dropdown';
import { currentUser } from '@clerk/nextjs/server';
import UserButton from '@/components/user-button';

export const Header = async () => {
    const user = await currentUser();

    return (
        <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-14 max-w-screen-2xl items-center">
                <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
                    <nav className="flex items-center"></nav>
                    <ThemeDropdown />
                    {user && <UserButton userInfo={{ fullName: user.fullName, imageUrl: user.imageUrl, email: user.primaryEmailAddress?.emailAddress }} />}
                </div>
            </div>
        </header>
    );
};
