import TrackingDetail, { getTrackingPeriod } from './TrackingDetail';
import { TrackingData } from './ResearchCalcAppConfig';

// Test timestamp: 2024-01-15 22:00:00 UTC
const TEST_START_TIMESTAMP = 1705356000;

// Maximum Date value in JavaScript (used as sentinel in finish stage)
const maxDate = new Date(8640000000000000);

describe('TrackingDetail', () => {
    describe('constructor', () => {
        test('initializes with TrackingData', () => {
            const data: TrackingData = {
                score: 50,
                start: TEST_START_TIMESTAMP,
                area: 0, strength: 0, dp: 0,
            };
            const detail = new TrackingDetail(data);

            expect(detail.start).toEqual(new Date(TEST_START_TIMESTAMP * 1000));
            expect(detail.score).toBe(50);
        });
    });

    describe('calculateStage', () => {
        describe('score < 3 (very low score)', () => {
            test('returns init, init2, aborting, and aborted stages for score 1', () => {
                const data: TrackingData = {
                    score: 1,
                    start: TEST_START_TIMESTAMP,
                    area: 0, strength: 0, dp: 0,
                };
                const detail = new TrackingDetail(data);
                const stages = detail.calculateStage();

                expect(stages).toHaveLength(5);
                expect(stages[0].type).toBe('init');
                expect(stages[0].startMinute).toBe(0);
                expect(stages[0].start.getTime() / 1000).toBe(TEST_START_TIMESTAMP);
                expect(stages[0].endMinute).toBe(5);
                expect(stages[0].end.getTime() / 1000).toBe(TEST_START_TIMESTAMP + 300);

                expect(stages[1].type).toBe('init2');
                expect(stages[1].startMinute).toBe(5);
                expect(stages[1].start.getTime() / 1000).toBe(TEST_START_TIMESTAMP + 300);
                expect(stages[1].endMinute).toBe(10.5);
                expect(stages[1].end.getTime() / 1000).toBe(TEST_START_TIMESTAMP + 630);

                expect(stages[2].type).toBe('aborting');
                expect(stages[2].startMinute).toBe(10.5);
                expect(stages[2].start.getTime() / 1000).toBe(TEST_START_TIMESTAMP + 630);
                expect(stages[2].endMinute).toBe(26.5);
                expect(stages[2].end.getTime() / 1000).toBe(TEST_START_TIMESTAMP + 1590);

                expect(stages[3].type).toBe('aborted');
                expect(stages[3].startMinute).toBe(26.5);
                expect(stages[3].start.getTime() / 1000).toBe(TEST_START_TIMESTAMP + 1590);
                expect(stages[3].endMinute).toBe(90);
                expect(stages[3].end.getTime() / 1000).toBe(TEST_START_TIMESTAMP + 5400);

                // Check finish sentinel stage
                expect(stages[4].type).toBe('finish');
                expect(stages[4].startMinute).toBe(90);
                expect(stages[4].start.getTime() / 1000).toBe(TEST_START_TIMESTAMP + 5400);
                expect(stages[4].end).toEqual(maxDate);
                expect(stages[4].endMinute).toBe(Number.MAX_VALUE);
            });

            test('returns correct stages for score 2', () => {
                const data: TrackingData = {
                    score: 2,
                    start: TEST_START_TIMESTAMP,
                    area: 0, strength: 0, dp: 0,
                };
                const detail = new TrackingDetail(data);
                const stages = detail.calculateStage();

                expect(stages).toHaveLength(5);
                expect(stages[0].type).toBe('init');
                expect(stages[0].startMinute).toBe(0);
                expect(stages[0].start.getTime() / 1000).toBe(TEST_START_TIMESTAMP);
                expect(stages[0].endMinute).toBe(5);
                expect(stages[0].end.getTime() / 1000).toBe(TEST_START_TIMESTAMP + 5 * 60);

                expect(stages[1].type).toBe('init2');
                expect(stages[1].startMinute).toBe(5);
                expect(stages[1].start.getTime() / 1000).toBe(TEST_START_TIMESTAMP + 5 * 60);
                expect(stages[1].endMinute).toBe(15);
                expect(stages[1].end.getTime() / 1000).toBe(TEST_START_TIMESTAMP + 15 * 60);

                expect(stages[2].type).toBe('aborting');
                expect(stages[2].startMinute).toBe(15);
                expect(stages[2].start.getTime() / 1000).toBe(TEST_START_TIMESTAMP + 15 * 60);
                expect(stages[2].endMinute).toBe(31);
                expect(stages[2].end.getTime() / 1000).toBe(TEST_START_TIMESTAMP + 31 * 60);

                expect(stages[3].type).toBe('aborted');
                expect(stages[3].startMinute).toBe(31);
                expect(stages[3].start.getTime() / 1000).toBe(TEST_START_TIMESTAMP + 31 * 60);
                expect(stages[3].endMinute).toBe(90);
                expect(stages[3].end.getTime() / 1000).toBe(TEST_START_TIMESTAMP + 90 * 60);

                // Check finish sentinel stage
                expect(stages[4].type).toBe('finish');
                expect(stages[4].startMinute).toBe(90);
                expect(stages[4].start.getTime() / 1000).toBe(TEST_START_TIMESTAMP + 90 * 60);
                expect(stages[4].end).toEqual(maxDate);
                expect(stages[4].endMinute).toBe(Number.MAX_VALUE);
            });
        });

        describe('3 <= score <= 16 (medium score)', () => {
            test('returns init, init2, normal, aborting, and aborted stages for score 3', () => {
                const data: TrackingData = {
                    score: 3,
                    start: TEST_START_TIMESTAMP,
                    area: 0, strength: 0, dp: 0,
                };
                const detail = new TrackingDetail(data);
                const stages = detail.calculateStage();

                expect(stages).toHaveLength(6);
                expect(stages[0].type).toBe('init');
                expect(stages[0].startMinute).toBe(0);
                expect(stages[0].start.getTime() / 1000).toBe(TEST_START_TIMESTAMP);
                expect(stages[0].endMinute).toBe(5);
                expect(stages[0].end.getTime() / 1000).toBe(TEST_START_TIMESTAMP + 5 * 60);

                expect(stages[1].type).toBe('init2');
                expect(stages[1].startMinute).toBe(5);
                expect(stages[1].start.getTime() / 1000).toBe(TEST_START_TIMESTAMP + 5 * 60);
                expect(stages[1].endMinute).toBe(15);
                expect(stages[1].end.getTime() / 1000).toBe(TEST_START_TIMESTAMP + 15 * 60);

                expect(stages[2].type).toBe('normal');
                expect(stages[2].startMinute).toBe(15);
                expect(stages[2].start.getTime() / 1000).toBe(TEST_START_TIMESTAMP + 15 * 60);
                expect(stages[2].endMinute).toBe(20.5);
                expect(stages[2].end.getTime() / 1000).toBe(TEST_START_TIMESTAMP + 20.5 * 60);

                expect(stages[3].type).toBe('aborting');
                expect(stages[3].startMinute).toBe(20.5);
                expect(stages[3].start.getTime() / 1000).toBe(TEST_START_TIMESTAMP + 20.5 * 60);
                expect(stages[3].endMinute).toBe(36.5);
                expect(stages[3].end.getTime() / 1000).toBe(TEST_START_TIMESTAMP + 36.5 * 60);

                expect(stages[4].type).toBe('aborted');
                expect(stages[4].startMinute).toBe(36.5);
                expect(stages[4].start.getTime() / 1000).toBe(TEST_START_TIMESTAMP + 36.5 * 60);
                expect(stages[4].endMinute).toBe(90);
                expect(stages[4].end.getTime() / 1000).toBe(TEST_START_TIMESTAMP + 90 * 60);

                expect(stages[5].type).toBe('finish');
                expect(stages[5].startMinute).toBe(90);
                expect(stages[5].start.getTime() / 1000).toBe(TEST_START_TIMESTAMP + 90 * 60);
                expect(stages[5].end).toEqual(maxDate);
                expect(stages[5].endMinute).toBe(Number.MAX_VALUE);
            });

            test('calculates correct minutes for score 13', () => {
                const data: TrackingData = {
                    score: 13,
                    start: TEST_START_TIMESTAMP,
                    area: 0, strength: 0, dp: 0,
                };
                const detail = new TrackingDetail(data);
                const stages = detail.calculateStage();

                expect(stages).toHaveLength(6);

                expect(stages[0].type).toBe('init');
                expect(stages[0].startMinute).toBe(0);
                expect(stages[0].start.getTime() / 1000).toBe(TEST_START_TIMESTAMP);
                expect(stages[0].endMinute).toBe(5);
                expect(stages[0].end.getTime() / 1000).toBe(TEST_START_TIMESTAMP + 5 * 60);

                expect(stages[1].type).toBe('init2');
                expect(stages[1].startMinute).toBe(5);
                expect(stages[1].start.getTime() / 1000).toBe(TEST_START_TIMESTAMP + 5 * 60);
                expect(stages[1].endMinute).toBe(15);
                expect(stages[1].end.getTime() / 1000).toBe(TEST_START_TIMESTAMP + 15 * 60);

                expect(stages[2].type).toBe('normal');
                expect(stages[2].startMinute).toBe(15);
                expect(stages[2].start.getTime() / 1000).toBe(TEST_START_TIMESTAMP + 15 * 60);
                expect(stages[2].endMinute).toBe(71.5);
                expect(stages[2].end.getTime() / 1000).toBe(TEST_START_TIMESTAMP + 71.5 * 60);

                expect(stages[3].type).toBe('aborting');
                expect(stages[3].startMinute).toBe(71.5);
                expect(stages[3].start.getTime() / 1000).toBe(TEST_START_TIMESTAMP + 71.5 * 60);
                expect(stages[3].endMinute).toBe(87.5);
                expect(stages[3].end.getTime() / 1000).toBe(TEST_START_TIMESTAMP + 87.5 * 60);

                expect(stages[4].type).toBe('aborted');
                expect(stages[4].startMinute).toBe(87.5);
                expect(stages[4].start.getTime() / 1000).toBe(TEST_START_TIMESTAMP + 87.5 * 60);
                expect(stages[4].endMinute).toBe(90);
                expect(stages[4].end.getTime() / 1000).toBe(TEST_START_TIMESTAMP + 90 * 60);

                expect(stages[5].type).toBe('finish');
                expect(stages[5].startMinute).toBe(90);
                expect(stages[5].start.getTime() / 1000).toBe(TEST_START_TIMESTAMP + 90 * 60);
                expect(stages[5].end).toEqual(maxDate);
                expect(stages[5].endMinute).toBe(Number.MAX_VALUE);
            });

            test('calculates correct minutes for score 14', () => {
                const data: TrackingData = {
                    score: 14,
                    start: TEST_START_TIMESTAMP,
                    area: 0, strength: 0, dp: 0,
                };
                const detail = new TrackingDetail(data);
                const stages = detail.calculateStage();

                expect(stages).toHaveLength(5);

                expect(stages[0].type).toBe('init');
                expect(stages[0].startMinute).toBe(0);
                expect(stages[0].start.getTime() / 1000).toBe(TEST_START_TIMESTAMP);
                expect(stages[0].endMinute).toBe(5);
                expect(stages[0].end.getTime() / 1000).toBe(TEST_START_TIMESTAMP + 5 * 60);

                expect(stages[1].type).toBe('init2');
                expect(stages[1].startMinute).toBe(5);
                expect(stages[1].start.getTime() / 1000).toBe(TEST_START_TIMESTAMP + 5 * 60);
                expect(stages[1].endMinute).toBe(15);
                expect(stages[1].end.getTime() / 1000).toBe(TEST_START_TIMESTAMP + 15 * 60);

                expect(stages[2].type).toBe('normal');
                expect(stages[2].startMinute).toBe(15);
                expect(stages[2].start.getTime() / 1000).toBe(TEST_START_TIMESTAMP + 15 * 60);
                expect(stages[2].endMinute).toBe(76.5);
                expect(stages[2].end.getTime() / 1000).toBe(TEST_START_TIMESTAMP + 76.5 * 60);

                expect(stages[3].type).toBe('aborting');
                expect(stages[3].startMinute).toBe(76.5);
                expect(stages[3].start.getTime() / 1000).toBe(TEST_START_TIMESTAMP + 76.5 * 60);
                expect(stages[3].endMinute).toBe(90);
                expect(stages[3].end.getTime() / 1000).toBe(TEST_START_TIMESTAMP + 90 * 60);

                expect(stages[4].type).toBe('finish');
                expect(stages[4].startMinute).toBe(90);
                expect(stages[4].start.getTime() / 1000).toBe(TEST_START_TIMESTAMP + 90 * 60);
                expect(stages[4].end).toEqual(maxDate);
                expect(stages[4].endMinute).toBe(Number.MAX_VALUE);
            });

            test('returns correct stages for score 16', () => {
                const data: TrackingData = {
                    score: 16,
                    start: TEST_START_TIMESTAMP,
                    area: 0, strength: 0, dp: 0,
                };
                const detail = new TrackingDetail(data);
                const stages = detail.calculateStage();

                expect(stages).toHaveLength(5);

                expect(stages[0].type).toBe('init');
                expect(stages[0].startMinute).toBe(0);
                expect(stages[0].start.getTime() / 1000).toBe(TEST_START_TIMESTAMP);
                expect(stages[0].endMinute).toBe(5);
                expect(stages[0].end.getTime() / 1000).toBe(TEST_START_TIMESTAMP + 5 * 60);

                expect(stages[1].type).toBe('init2');
                expect(stages[1].startMinute).toBe(5);
                expect(stages[1].start.getTime() / 1000).toBe(TEST_START_TIMESTAMP + 5 * 60);
                expect(stages[1].endMinute).toBe(15);
                expect(stages[1].end.getTime() / 1000).toBe(TEST_START_TIMESTAMP + 15 * 60);

                expect(stages[2].type).toBe('normal');
                expect(stages[2].startMinute).toBe(15);
                expect(stages[2].start.getTime() / 1000).toBe(TEST_START_TIMESTAMP + 15 * 60);
                expect(stages[2].endMinute).toBe(87.5);
                expect(stages[2].end.getTime() / 1000).toBe(TEST_START_TIMESTAMP + 87.5 * 60);

                expect(stages[3].type).toBe('aborting');
                expect(stages[3].startMinute).toBe(87.5);
                expect(stages[3].start.getTime() / 1000).toBe(TEST_START_TIMESTAMP + 87.5 * 60);
                expect(stages[3].endMinute).toBe(90);
                expect(stages[3].end.getTime() / 1000).toBe(TEST_START_TIMESTAMP + 90 * 60);

                expect(stages[4].type).toBe('finish');
                expect(stages[4].startMinute).toBe(90);
                expect(stages[4].start.getTime() / 1000).toBe(TEST_START_TIMESTAMP + 90 * 60);
                expect(stages[4].end).toEqual(maxDate);
                expect(stages[4].endMinute).toBe(Number.MAX_VALUE);
            });
        });

        describe('score > 16 (high score)', () => {
            test('returns init, init2, normal, and finalizing stages for score 17', () => {
                const data: TrackingData = {
                    score: 17,
                    start: TEST_START_TIMESTAMP,
                    area: 0, strength: 0, dp: 0,
                };
                const detail = new TrackingDetail(data);
                const stages = detail.calculateStage();

                expect(stages).toHaveLength(5);

                expect(stages[0].type).toBe('init');
                expect(stages[0].startMinute).toBe(0);
                expect(stages[0].start.getTime() / 1000).toBe(TEST_START_TIMESTAMP);
                expect(stages[0].endMinute).toBe(5);
                expect(stages[0].end.getTime() / 1000).toBe(TEST_START_TIMESTAMP + 5 * 60);

                expect(stages[1].type).toBe('init2');
                expect(stages[1].startMinute).toBe(5);
                expect(stages[1].start.getTime() / 1000).toBe(TEST_START_TIMESTAMP + 5 * 60);
                expect(stages[1].endMinute).toBe(15);
                expect(stages[1].end.getTime() / 1000).toBe(TEST_START_TIMESTAMP + 15 * 60);

                expect(stages[2].type).toBe('normal');
                expect(stages[2].startMinute).toBe(15);
                expect(stages[2].start.getTime() / 1000).toBe(TEST_START_TIMESTAMP + 15 * 60);
                expect(stages[2].endMinute).toBe(77.5);
                expect(stages[2].end.getTime() / 1000).toBe(TEST_START_TIMESTAMP + 77.5 * 60);

                expect(stages[3].type).toBe('finalizing');
                expect(stages[3].startMinute).toBe(77.5);
                expect(stages[3].start.getTime() / 1000).toBe(TEST_START_TIMESTAMP + 77.5 * 60);
                expect(stages[3].endMinute).toBe(92.5);
                expect(stages[3].end.getTime() / 1000).toBe(TEST_START_TIMESTAMP + 92.5 * 60);

                expect(stages[4].type).toBe('finish');
                expect(stages[4].startMinute).toBe(92.5);
                expect(stages[4].start.getTime() / 1000).toBe(TEST_START_TIMESTAMP + 92.5 * 60);
                expect(stages[4].end).toEqual(maxDate);
                expect(stages[4].endMinute).toBe(Number.MAX_VALUE);
            });

            test('calculates correct minutes for score 50', () => {
                const data: TrackingData = {
                    score: 50,
                    start: TEST_START_TIMESTAMP,
                    area: 0, strength: 0, dp: 0,
                };
                const detail = new TrackingDetail(data);
                const stages = detail.calculateStage();

                expect(stages).toHaveLength(5);

                expect(stages[0].type).toBe('init');
                expect(stages[0].startMinute).toBe(0);
                expect(stages[0].start.getTime() / 1000).toBe(TEST_START_TIMESTAMP);
                expect(stages[0].endMinute).toBe(5);
                expect(stages[0].end.getTime() / 1000).toBe(TEST_START_TIMESTAMP + 5 * 60);

                expect(stages[1].type).toBe('init2');
                expect(stages[1].startMinute).toBe(5);
                expect(stages[1].start.getTime() / 1000).toBe(TEST_START_TIMESTAMP + 5 * 60);
                expect(stages[1].endMinute).toBe(15);
                expect(stages[1].end.getTime() / 1000).toBe(TEST_START_TIMESTAMP + 15 * 60);

                expect(stages[2].type).toBe('normal');
                expect(stages[2].startMinute).toBe(15);
                expect(stages[2].start.getTime() / 1000).toBe(TEST_START_TIMESTAMP + 15 * 60);
                expect(stages[2].endMinute).toBe(245.5);
                expect(stages[2].end.getTime() / 1000).toBe(TEST_START_TIMESTAMP + 245.5 * 60);

                expect(stages[3].type).toBe('finalizing');
                expect(stages[3].startMinute).toBe(245.5);
                expect(stages[3].start.getTime() / 1000).toBe(TEST_START_TIMESTAMP + 245.5 * 60);
                expect(stages[3].endMinute).toBe(260.5);
                expect(stages[3].end.getTime() / 1000).toBe(TEST_START_TIMESTAMP + 260.5 * 60);

                expect(stages[4].type).toBe('finish');
                expect(stages[4].startMinute).toBe(260.5);
                expect(stages[4].start.getTime() / 1000).toBe(TEST_START_TIMESTAMP + 260.5 * 60);
                expect(stages[4].end).toEqual(maxDate);
                expect(stages[4].endMinute).toBe(Number.MAX_VALUE);
            });

            test('calculates correct minutes for score 100', () => {
                const data: TrackingData = {
                    score: 100,
                    start: TEST_START_TIMESTAMP,
                    area: 0, strength: 0, dp: 0,
                };
                const detail = new TrackingDetail(data);
                const stages = detail.calculateStage();

                expect(stages).toHaveLength(5);

                expect(stages[0].type).toBe('init');
                expect(stages[0].startMinute).toBe(0);
                expect(stages[0].start.getTime() / 1000).toBe(TEST_START_TIMESTAMP);
                expect(stages[0].endMinute).toBe(5);
                expect(stages[0].end.getTime() / 1000).toBe(TEST_START_TIMESTAMP + 5 * 60);

                expect(stages[1].type).toBe('init2');
                expect(stages[1].startMinute).toBe(5);
                expect(stages[1].start.getTime() / 1000).toBe(TEST_START_TIMESTAMP + 5 * 60);
                expect(stages[1].endMinute).toBe(15);
                expect(stages[1].end.getTime() / 1000).toBe(TEST_START_TIMESTAMP + 15 * 60);

                expect(stages[2].type).toBe('normal');
                expect(stages[2].startMinute).toBe(15);
                expect(stages[2].start.getTime() / 1000).toBe(TEST_START_TIMESTAMP + 15 * 60);
                expect(stages[2].endMinute).toBe(499.5);
                expect(stages[2].end.getTime() / 1000).toBe(TEST_START_TIMESTAMP + 499.5 * 60);

                expect(stages[3].type).toBe('finalizing');
                expect(stages[3].startMinute).toBe(499.5);
                expect(stages[3].start.getTime() / 1000).toBe(TEST_START_TIMESTAMP + 499.5 * 60);
                expect(stages[3].endMinute).toBe(514.5);
                expect(stages[3].end.getTime() / 1000).toBe(TEST_START_TIMESTAMP + 514.5 * 60);

                expect(stages[4].type).toBe('finish');
                expect(stages[4].startMinute).toBe(514.5);
                expect(stages[4].start.getTime() / 1000).toBe(TEST_START_TIMESTAMP + 514.5 * 60);
                expect(stages[4].end).toEqual(maxDate);
                expect(stages[4].endMinute).toBe(Number.MAX_VALUE);
            });
        });
    });
});

describe('getTrackingPeriod', () => {
    test('calculates tracking period for score 50', () => {
        const startDate = new Date('2025-01-15T22:00:00');
        const score = 50;
        const [start, end] = getTrackingPeriod(startDate, score, 'en');

        expect(start).toBe('10:00 PM');
        expect(end).toBe('2:20 AM');
    });

    test('calculates tracking period for score 50 (second ceil)', () => {
        const startDate = new Date('2025-01-15T22:00:30');
        const score = 50;
        const [start, end] = getTrackingPeriod(startDate, score, 'en');

        expect(start).toBe('10:00 PM');
        expect(end).toBe('2:21 AM');
    });

    test('calculates tracking period for score 100', () => {
        const startDate = new Date('2025-01-15T22:00:00');
        const score = 100;
        const [start, end] = getTrackingPeriod(startDate, score, 'en');

        expect(start).toBe('10:00 PM');
        expect(end).toBe('6:34 AM');
    });

    test('calculates tracking period for score 1', () => {
        const startDate = new Date('2025-01-15T22:00:00');
        const score = 1;
        const [start, end] = getTrackingPeriod(startDate, score, 'en');

        expect(start).toBe('10:00 PM');
        expect(end).toBe('11:30 PM'); // should be 90 min at least
    });

    test('formats time in Japanese', () => {
        const startDate = new Date('2025-01-15T22:00:00');
        const score = 50;
        const [start, end] = getTrackingPeriod(startDate, score, 'ja');

        expect(start).toBe('22:00');
        expect(end).toBe('2:20');
    });
});
