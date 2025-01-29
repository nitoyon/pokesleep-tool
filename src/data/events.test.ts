import { BonusEventData, DrowsyEventData, getDrowsyBonus,
    getActiveHelpBonus
} from './events';
import pokemons from './pokemons';

test('IsInProgress', () => {
    const evt = new DrowsyEventData({name: '', day: '2024-09-02', bonus: 1.5});
    expect(evt.isInProgress(new Date(2024, 8, 2, 0, 0, 0))).toBe(false);
    expect(evt.isInProgress(new Date(2024, 8, 2, 3, 59, 0))).toBe(false);
    expect(evt.isInProgress(new Date(2024, 8, 2, 4, 0, 0))).toBe(true);
    expect(evt.isInProgress(new Date(2024, 8, 2, 23, 0, 0))).toBe(true);
    expect(evt.isInProgress(new Date(2024, 8, 3, 3, 59, 0))).toBe(true);
    expect(evt.isInProgress(new Date(2024, 8, 3, 4, 0, 0))).toBe(false);
});

test('getDrowsyBonus', () => {
    const evts = [
        new DrowsyEventData({name: 'GSD', day: '2024-09-17', bonus: 1.5}),
        new DrowsyEventData({name: 'GSD', day: '2024-09-18', bonus: 2.5}),
        new DrowsyEventData({name: 'GSD', day: '2024-09-19', bonus: 1.5}),
    ];
    expect(getDrowsyBonus(new Date(2024, 8, 17, 0), evts)).toBe(1);
    expect(getDrowsyBonus(new Date(2024, 8, 17, 7), evts)).toBe(1.5);
    expect(getDrowsyBonus(new Date(2024, 8, 18, 7), evts)).toBe(2.5);
    expect(getDrowsyBonus(new Date(2024, 8, 19, 7), evts)).toBe(1.5);
    expect(getDrowsyBonus(new Date(2024, 8, 20, 7), evts)).toBe(1);
});

test('getActiveHelpBonus', () => {
    const evts = [
        new BonusEventData({
            name: '1st week', start: '2024-09-02T04:00:00', end: '2024-09-08T04:00:00',
            target: {type: 'water'},
            effects: {skillTrigger: 1.5, skillLevel: 1, ingredient: 1, dreamShard: 1},
        }),
        new BonusEventData({
            name: '1st week', start: '2024-09-09T04:00:00', end: '2024-09-15T04:00:00',
            target: {type: 'water'},
            effects: {skillTrigger: 1.5, skillLevel: 3, ingredient: 1, dreamShard: 1},
        }),
    ];
    expect(getActiveHelpBonus(new Date(2024, 8, 1), evts).length).toBe(2);
    expect(getActiveHelpBonus(new Date(2024, 8, 9, 3, 59, 0), evts).length).toBe(2);
    expect(getActiveHelpBonus(new Date(2024, 8, 9, 4, 0, 0), evts).length).toBe(1);
    expect(getActiveHelpBonus(new Date(2024, 8, 16, 3, 59, 0), evts).length).toBe(1);
    expect(getActiveHelpBonus(new Date(2024, 8, 16, 4, 0, 0), evts).length).toBe(0);

    expect(getActiveHelpBonus(new Date(2024, 8, 5), evts).length).toBe(2);
    expect(getActiveHelpBonus(new Date(2024, 8, 5), evts)[0].effects.skillLevel).toBe(1);
    expect(getActiveHelpBonus(new Date(2024, 8, 5), evts)[1].effects.skillLevel).toBe(3);
});

test('BonusEventData', () => {
    const evt = new BonusEventData({
        name: '1st week', start: '2024-09-02 4:00', end: '2024-09-08 4:00',
        target: {type: 'water'},
        effects: {skillTrigger: 1.5, skillLevel: 1, ingredient: 1, dreamShard: 1},
    });
    const bulbasaur = pokemons.find(x => x.name === 'Bulbasaur');
    const squirtle = pokemons.find(x => x.name === 'Squirtle');
    const jigglypuff = pokemons.find(x => x.name === 'Jigglypuff');
    if (bulbasaur === undefined || squirtle === undefined || jigglypuff === undefined) {
        fail('pokemon not found on pokemon.json');
    }
    
    // target is water
    expect(evt.isTarget(bulbasaur)).toBe(false);
    expect(evt.isTarget(squirtle)).toBe(true);
    expect(evt.isTarget(jigglypuff)).toBe(false);

    // target is skill
    evt.target.type = undefined;
    evt.target.speciality = "Skills";
    expect(evt.isTarget(bulbasaur)).toBe(false);
    expect(evt.isTarget(squirtle)).toBe(false);
    expect(evt.isTarget(jigglypuff)).toBe(true);
});