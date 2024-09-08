import { EventData, getEventBonus } from './events';

test('IsInProgress', () => {
    const evt = new EventData({name: '', day: '2024-09-02', bonus: 1.5});
    console.log(evt.startDate, evt.endDate);
    expect(evt.isInProgress(new Date(2024, 8, 2, 0, 0, 0))).toBe(false);
    expect(evt.isInProgress(new Date(2024, 8, 2, 3, 59, 0))).toBe(false);
    expect(evt.isInProgress(new Date(2024, 8, 2, 4, 0, 0))).toBe(true);
    expect(evt.isInProgress(new Date(2024, 8, 2, 23, 0, 0))).toBe(true);
    expect(evt.isInProgress(new Date(2024, 8, 3, 3, 59, 0))).toBe(true);
    expect(evt.isInProgress(new Date(2024, 8, 3, 4, 0, 0))).toBe(false);
});

test('getEventBonus', () => {
    const evts = [
        new EventData({name: 'GSD', day: '2024-09-17', bonus: 1.5}),
        new EventData({name: 'GSD', day: '2024-09-18', bonus: 2.5}),
        new EventData({name: 'GSD', day: '2024-09-19', bonus: 1.5}),
    ];
    expect(getEventBonus(new Date(2024, 8, 17, 0), evts)).toBe(1);
    expect(getEventBonus(new Date(2024, 8, 17, 7), evts)).toBe(1.5);
    expect(getEventBonus(new Date(2024, 8, 18, 7), evts)).toBe(2.5);
    expect(getEventBonus(new Date(2024, 8, 19, 7), evts)).toBe(1.5);
    expect(getEventBonus(new Date(2024, 8, 20, 7), evts)).toBe(1);
});