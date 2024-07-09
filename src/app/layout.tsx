import type { Metadata } from 'next';
import { Inter as FontSans } from 'next/font/google';
import './globals.css';
import { cn } from '@/lib/utils';
import { ThemeProvider } from '@/components/theme-provider';
import { Header } from '@/components/header';
import { ClerkProvider } from '@clerk/nextjs';

const fontSans = FontSans({
    subsets: ['latin'],
    variable: '--font-sans'
});

export const metadata: Metadata = {
    title: 'Create Next App',
    description: 'Generated by create next app'
};

export default function RootLayout({
    children
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <ClerkProvider>
            <html lang="en" suppressHydrationWarning>
                <body className={cn('flex h-screen flex-col bg-background font-sans antialiased', fontSans.variable)}>
                    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
                        <Header />
                        <main className="container h-full flex-grow overflow-y-auto">{children}</main>
                    </ThemeProvider>
                </body>
            </html>
        </ClerkProvider>
    );
}
