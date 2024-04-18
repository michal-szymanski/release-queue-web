'use client';

import { CalendarPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { observer } from 'mobx-react';
import { useStore } from '@/hooks';
import { MergeRequestEvent } from '@/types';
import { useState } from 'react';
import { SelectSingleEventHandler } from 'react-day-picker';

type Props = {
    event: MergeRequestEvent;
};

const monday = 1;

export const DatePicker = ({ event }: Props) => {
    const {
        dataStore: { addToQueue }
    } = useStore();
    const [open, setOpen] = useState(false);

    const handleSelect: SelectSingleEventHandler = (date) => {
        if (!date) return;

        const localDate = new Date(date.getTime() + (date.getTimezoneOffset() + 240) * 60 * 1000);
        addToQueue(event, localDate.toISOString());
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
                <Calendar mode="single" onSelect={handleSelect} initialFocus fromDate={new Date()} weekStartsOn={monday} />
            </PopoverContent>
        </Popover>
    );
};

export default observer(DatePicker);
