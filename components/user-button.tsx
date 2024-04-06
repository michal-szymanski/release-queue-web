'use client';

import { Avatar, AvatarImage } from '@/components/ui/avatar';
import { AvatarFallback } from '@radix-ui/react-avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Session } from 'next-auth';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { signOut } from 'next-auth/react';

type Props = {
    session: Session | null;
};

const UserButton = ({ session }: Props) => {
    if (!session?.user) return null;
    const { name, email, image } = session.user;

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Avatar className="size-6 cursor-pointer">
                    <AvatarImage src={image ?? ''} />
                    <AvatarFallback>
                        <Skeleton className="size-6 rounded-full" />
                    </AvatarFallback>
                </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
                <DropdownMenuLabel>
                    <div>{name}</div>
                    <div className="text-xs text-muted-foreground">{email}</div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer" onClick={() => signOut()}>
                    Sign Out
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

export default UserButton;
