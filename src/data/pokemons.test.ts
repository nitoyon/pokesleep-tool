import pokemons, { getDecendants } from './pokemons';

describe('getDecendants', () => {
    test('returns itself when non evolved pokemon is specified', () => {
        const p = pokemons.find(x => x.name === "Cramorant");
        if (p === undefined) { fail('p should not be undefined'); }

        const decendants = getDecendants(p);
        expect(decendants.length).toBe(0);
    });

    test('returns evolved pokemon', () => {
        const p = pokemons.find(x => x.name === "Bulbasaur");
        if (p === undefined) { fail('p should not be undefined'); }

        const decendants = getDecendants(p);
        expect(decendants.length).toBe(1);
        expect(decendants[0].name).toBe("Venusaur");
    });

    test('returns Eevee evolution line', () => {
        const p = pokemons.find(x => x.name === "Eevee");
        if (p === undefined) { fail('p should not be undefined'); }

        const decendants = getDecendants(p);
        expect(decendants.length).toBe(8);
        expect(decendants.some(x => x.name === "Jolteon")).toBe(true);
    });

    test('returns Slowpoke evolution line', () => {
        const p = pokemons.find(x => x.name === "Slowpoke");
        if (p === undefined) { fail('p should not be undefined'); }

        const decendants = getDecendants(p);
        expect(decendants.length).toBe(2);
        expect(decendants[0].name).toBe("Slowbro");
        expect(decendants[1].name).toBe("Slowking");
    });

    test('returns Ralts evolution line', () => {
        const p = pokemons.find(x => x.name === "Ralts");
        if (p === undefined) { fail('p should not be undefined'); }

        const decendants = getDecendants(p);
        expect(decendants.length).toBe(2);
        expect(decendants[0].name).toBe("Gardevoir");
        expect(decendants[1].name).toBe("Gallade");
    });
});
