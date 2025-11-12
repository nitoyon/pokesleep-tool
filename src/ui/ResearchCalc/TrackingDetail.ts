import { getMaxTimeForScore, getMinTimeForScore } from './Score';
import { TrackingData } from './ResearchCalcAppConfig';

/** Required minutes taken to fall asleep */
const minutesTakenToFallAsleep = 5;

/** Buffer minutes taken to fall asleep */
const bufferMinutesTakenToFallAsleep = 10;

/** Buffer minutes taken before wake up */
const bufferMinutesBeforeWakeUp = 15;

/** Required minutes to abort sleep tracking */
const minutesRequiredToAbortTracking = 16;

/**
 * Type of the tracking stages
 * 
 * Represents the different phases of the tracking process.
 * Some states prohibit vibration to get the score.
 */
export type TrackingStageType =
    /**
     * Tracking just started.
     * DO NOT apply vibration.
     */
    "init" |

    /**
     * Pokemon Sleep has detected the user fell asleep.
     * Vibration should be avoided for safety.
     */
    "init2" |

    /**
     * Normal tracking phase.
     * Vibration can be applied safely.
     */
    "normal" |

    /**
     * Tracking is about to finish.
     * DO NOT apply vibration.
     */
    "finalizing" |

    /**
     * Forcibly terminating the tracking by applying strong vibration.
     * Used for abnormal termination.
     */
    "aborting" |

    /**
     * Abnormal termination has been completed.
     * Tracking was forcibly terminated by strong vibration.
     */
    "aborted" |

    /**
     * Finish tracking stage used as sentinel.
     */
    "finish";

/**
 * Represent each stage of the sleep tracking.
 *
 * Tracking sleep is divided into some stage like "init", "normal" and
 * "finalizing".
 */
export type TrackingStage = {
    /** Stage type */
    type: TrackingStageType;
    /** Start time */
    start: Date;
    /** Start minute */
    startMinute: number;
    /** End time */
    end: Date;
    /** End minute */
    endMinute: number;
};

/**
 * Represents tracking detail information for sleep sessions.
 */
export default class TrackingDetail {
    /** Start time */
    start: Date;
    /** Score to aim */
    score: number;

    /**
     * Initialize EventData object.
     * @param data Tracking data.
     */
    constructor(data: TrackingData) {
        this.start = new Date(data.start * 1000);
        this.score = data.score;
    }

    /**
     * Calculate tracking stages.
     * @returns An array of TrackingStage objects.
     */
    calculateStage(): TrackingStage[] {
        const ret = this._calculateStageImpl();

        // Add sentinel
        const lastStage = ret[ret.length - 1];
        ret.push({
            type: "finish",
            start: lastStage.end,
            startMinute: lastStage.endMinute,
            end: new Date(8640000000000000),
            endMinute: Number.MAX_VALUE,
        });
        return ret;
    }

    /**
     * Implementation of calculateStage() method.
     * @returns An array of TrackingStage objects.
     */
    _calculateStageImpl(): TrackingStage[] {
        const sleepMinute = getAverageMinuteForScore(this.score);
        const totalSleepMinute = sleepMinute + minutesTakenToFallAsleep;
        const trackStartDate = this.getDateFromMinute(minutesTakenToFallAsleep);
        const ret: TrackingStage[] = [];

        // Add 'init' state
        let start = this.start;
        let startMinute = 0, endMinute = minutesTakenToFallAsleep;
        let end = trackStartDate;
        ret.push({
            type: "init", start, startMinute, end, endMinute,
        });
        startMinute = endMinute;
        start = end;

        // Add 'init2' state
        endMinute += Math.min(sleepMinute, bufferMinutesTakenToFallAsleep);
        end = this.getDateFromMinute(endMinute);
        ret.push({
            type: "init2", start, startMinute, end, endMinute,
        });
        startMinute = endMinute;
        start = end;

        // Add 'aborting' state after 'init2' when score < 3
        if (this.score < 3) {
            endMinute = startMinute + minutesRequiredToAbortTracking;
            end = this.getDateFromMinute(endMinute);
            ret.push({
                type: "aborting", start, startMinute, end, endMinute,
            });
            startMinute = endMinute;
            start = end;

            endMinute = 90;
            end = this.getDateFromMinute(endMinute);
            ret.push({
                type: "aborted", start, startMinute, end, endMinute,
            });
            return ret;
        }

        // Add 'normal' and 'abort' when score <= 16
        if (this.score <= 16) {
            // Add 'normal'
            endMinute = getAverageMinuteForScore(this.score) + minutesTakenToFallAsleep;
            end = this.getDateFromMinute(endMinute);
            ret.push({
                type: "normal", start, startMinute, end, endMinute,
            });
            startMinute = endMinute;
            start = end;

            // Add 'aborting'
            endMinute = Math.min(90,
                endMinute + minutesRequiredToAbortTracking);
            end = this.getDateFromMinute(endMinute);
            ret.push({
                type: "aborting", start, startMinute, end, endMinute,
            });
            startMinute = endMinute;
            start = end;

            // Add 'aborted'
            if (endMinute < 90) {
                endMinute = 90;
                end = this.getDateFromMinute(endMinute);
                ret.push({
                    type: "aborted", start, startMinute, end, endMinute,
                });
            }
            return ret;
        }

        // Add 'normal' state
        endMinute = totalSleepMinute - bufferMinutesBeforeWakeUp;
        end = this.getDateFromMinute(endMinute);
        ret.push({
            type: "normal", start, startMinute, end, endMinute,
        });
        startMinute = endMinute;
        start = end;

        // Add 'finalizing' state
        endMinute = totalSleepMinute;
        end = this.getDateFromMinute(endMinute);
        ret.push({
            type: "finalizing", start, startMinute, end, endMinute,
        });
        return ret;
    }

    /**
     * Get Date object by minute after `start`
     * @param minute Minute after `start`.
     * @returns Date object.
     */
    getDateFromMinute(minute: number) {
        return new Date(this.start.getTime() + minute * 60 * 1000);
    }
}

/**
 * Get average sleep minute to get the score
 * @param score Sleep score.
 * @returns Sleep minute length.
 */
export function getAverageMinuteForScore(score: number): number {
    const min = getMinTimeForScore(score);
    const max = getMaxTimeForScore(score);
    const minMinute = min.h * 60 + min.m;
    const maxMinute = max.h * 60 + max.m + 1;
    return (minMinute + maxMinute) / 2;
}

/**
 * Get start time and end time to get the score.
 * @param date Start date.
 * @param score Sleep score.
 * @param language Language to format the date.
 * @returns Tuple of start time and end time formated by the language.
 */
export function getTrackingPeriod(date: Date, score: number, language: string): [string, string] {
    const timeTakenToFallAsleep = 5;
    const minute = Math.max(90,
        getAverageMinuteForScore(score) + timeTakenToFallAsleep);
    const endDate = new Date(date.getTime() + minute * 60 * 1000);
    const start = formatTime(date, language);
    const end = formatTime(endDate, language);
    return [start, end];
}

/**
 * Format the given date to time using the given time.
 * @param date Date object to be formated.
 * @param language Language to use.
 * @returns Formated string.
 */
export function formatTime(date: Date, language: string): string {
    return Intl.DateTimeFormat(language,
        {hour: "numeric", minute: "numeric"}).format(date);
}
