import events_ from './event.json';

/**
 * Represents event data.
 */
export class EventData {
    /** Event name (English) */
    name: string;
    /** Target date */
    day: Date;
    /** Event bonus for drowsy power */
    bonus: number;

    /** Get start date. */
    get startDate(): Date {
        return new Date(this.day.getFullYear(), this.day.getMonth(),
            this.day.getDate(), 4, 0, 0);
    }

    /** Get end date. */
    get endDate(): Date {
        const time = this.startDate.getTime();
        return new Date(time + 24 * 60 * 60 * 1000);
    }

    /**
     * Initialize EventData object.
     * @param data JSON data.
     */
    constructor(data: JsonEventData) {
        this.day = new Date(data.day);
        this.name = data.name;
        this.bonus = data.bonus;
    }

    /**
     * Returns whether the event is in progress.
     * @param date Checked date.
     * @returns In progress or not.
     */
    isInProgress(date: Date): boolean {
        return this.startDate <= date && date < this.endDate;
    }
}

/**
 * 
 * @param date Date to be checked.
 * @param overrideEvents Events. If now specified, default events is used. 
 * @returns Bonus value.
 */
export function getEventBonus(date: Date, overrideEvents?: EventData[]): number {
    const evts = overrideEvents ?? events;
    for (const event of evts) {
        if (event.isInProgress(date)) {
            return event.bonus;
        }
    }
    return 1;
}

interface JsonEventData {
    /** Event name */
    name: string;
    /** Start date time (YYYY-MM-DD) */
    day: string;
    /** Event bonus for drowsy power */
    bonus: number;
}

const events = (events_ as JsonEventData[])
    .map(x => new EventData(x));

export default events;
