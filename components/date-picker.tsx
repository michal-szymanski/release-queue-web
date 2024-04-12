'use client';

import { CalendarPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { observer } from 'mobx-react';
import { useDataStore } from '@/hooks';
import { MergeRequestEvent } from '@/types';
import { useState } from 'react';

type Props = {
    event: MergeRequestEvent;
};

const saturday = 6;
const sunday = 0;
const monday = 1;

export const DatePicker = ({ event }: Props) => {
    const { addToQueue } = useDataStore();
    const [open, setOpen] = useState(false);

    const handleSelect = (date?: Date) => {
        if (!date) return;

        addToQueue(event, date.toISOString());
        setOpen(false);
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button type="button" variant="outline" size="icon" className="size-8">
                    <CalendarPlus className="size-5" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
                <Calendar
                    mode="single"
                    onSelect={handleSelect}
                    initialFocus
                    fromDate={new Date()}
                    weekStartsOn={monday}
                    disabled={{ dayOfWeek: [saturday, sunday] }}
                />
            </PopoverContent>
        </Popover>
    );
};

export default observer(DatePicker);
