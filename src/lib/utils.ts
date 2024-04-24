import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

type GroupBy<T> = {
    [key: string]: T[];
};

export const groupBy = <T>(array: T[], selector: (item: T) => string): GroupBy<T> => {
    return array.reduce((groups, item) => {
        const key = selector(item);
        if (!groups[key]) {
            groups[key] = [];
        }
        groups[key].push(item);
        return groups;
    }, {} as GroupBy<T>);
};

type MinBy<T> = T | undefined;

export const minBy = <T>(array: T[], selector: (element: T) => number): MinBy<T> => {
    return array.reduce(
        (minElement, currentElement) => (minElement === undefined || selector(currentElement) < selector(minElement) ? currentElement : minElement),
        undefined as MinBy<T>
    );
};
