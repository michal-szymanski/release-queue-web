import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

type GroupBy<T> = {
    [key: string]: T[];
};

export const groupBy = <T>(array: T[], keyGetter: (item: T) => string): GroupBy<T> => {
    return array.reduce((groups, item) => {
        const key = keyGetter(item);
        if (!groups[key]) {
            groups[key] = [];
        }
        groups[key].push(item);
        return groups;
    }, {} as GroupBy<T>);
};
