import { getPokemonCount } from './PokemonCount';
import fields from '../data/fields';

describe('getPokemonCount', () => {
    const powers = fields[0].powers;

    test('returns 3 when power is 0', () => {
        expect(getPokemonCount(powers, 0)).toBe(3);
    });
    test('returns valid count for boundary power', () => {
        expect(getPokemonCount(powers, 965231)).toBe(3);
        expect(getPokemonCount(powers, 965232)).toBe(4);
        expect(getPokemonCount(powers, 965233)).toBe(4);

        expect(getPokemonCount(powers, 2073694)).toBe(4);
        expect(getPokemonCount(powers, 2073695)).toBe(5);
        expect(getPokemonCount(powers, 2073696)).toBe(5);

        expect(getPokemonCount(powers, 19563552)).toBe(7);
        expect(getPokemonCount(powers, 19563553)).toBe(8);
        expect(getPokemonCount(powers, 19563554)).toBe(8);
    });
    test('returns 8 when power is Infinite', () => {
        expect(getPokemonCount(powers, Number.POSITIVE_INFINITY)).toBe(8);
    });
});
