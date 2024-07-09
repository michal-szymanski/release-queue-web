'use client';

import { Avatar, AvatarImage } from '@/components/ui/avatar';
import { AvatarFallback } from '@radix-ui/react-avatar';
import { Skeleton } from '@/components/ui/skeleton';
// import { Session } from 'next-auth';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
// import { signOut } from 'next-auth/react';
import { LogOut } from 'lucide-react';
import { User } from '@clerk/nextjs/server';
import { useAuth } from '@clerk/nextjs';

type Props = {
    userInfo: { fullName: string | null; imageUrl: string; email?: string } | null;
};

const UserButton = ({ userInfo }: Props) => {
    const { signOut } = useAuth();

    if (!userInfo) return null;
    const { fullName, imageUrl, email } = userInfo;

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Avatar className="size-6 cursor-pointer">
                    <AvatarImage src={imageUrl} />
                    <AvatarFallback>
                        <Skeleton className="size-6 rounded-full" />
                    </AvatarFallback>
                </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
                <DropdownMenuLabel>
                    <div>{fullName}</div>
                    <div className="text-xs text-muted-foreground">{email}</div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer gap-2" onClick={() => signOut()}>
                    <LogOut className="size-4" />
                    <span>Sign Out</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

export default UserButton;
