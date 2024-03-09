import events_ from './event.json';

/**
 * Represents event data.
 */
export class EventData {
    /** Event name (English) */
    name: string;
    /** Start date time */
    start: Date;
    /** End date time */
    end: Date;
    /** Event type (campaign or event) */
    type: "campaign" | "event";
    /** Whether we can encounter Pokemon of different sleep types */
    encounterDifferentSleepType: boolean;

    /**
     * Initialize EventData object.
     * @param data JSON data.
     */
    constructor(data: JsonEventData) {
        this.start = new Date(data.start);
        this.end = new Date(data.end);
        this.type = data.type;
        this.name = data.name;
        this.encounterDifferentSleepType = data.encounterDifferentSleepType;
    }

    /**
     * Returns whether the event is in progress.
     * @param date Checked date.
     * @returns In progress or not.
     */
    isInProgress(date: Date): boolean {
        return this.start <= date && date <= this.end;
    }
}

interface JsonEventData {
    /** Event name */
    name: string;
    /** Start date time (YYYY-MM-DD hh:mm) */
    start: string;
    /** End date time (YYYY-MM-DD hh:mm) */
    end: string;
    /** Event type (campaign or event) */
    type: "campaign" | "event";
    /** Whether we can encounter Pokemon of different sleep types */
    encounterDifferentSleepType: boolean;
}

const events = (events_ as JsonEventData[])
    .map(x => new EventData(x));

export default events;
