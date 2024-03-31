import { ThemeDropdown } from '@/components/theme-dropdown';

export const Header = () => {
    return (
        <header className="border-border/40 bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 w-full border-b backdrop-blur">
            <div className="container flex h-14 max-w-screen-2xl items-center">
                <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
                    <nav className="flex items-center"></nav>
                    <ThemeDropdown />
                </div>
            </div>
        </header>
    );
};
