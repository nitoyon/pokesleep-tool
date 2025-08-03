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

    test('returns evolved pokemon (non-final)', () => {
        const p = pokemons.find(x => x.name === "Bulbasaur");
        if (p === undefined) { fail('p should not be undefined'); }

        const decendants = getDecendants(p, true);
        expect(decendants.length).toBe(3);
        expect(decendants[0].name).toBe("Bulbasaur");
        expect(decendants[1].name).toBe("Ivysaur");
        expect(decendants[2].name).toBe("Venusaur");
    });

    test('returns Pikachu decendants (non-final)', () => {
        const p = pokemons.find(x => x.name === "Pikachu");
        if (p === undefined) { fail('p should not be undefined'); }

        const decendants = getDecendants(p, true);
        expect(decendants.length).toBe(3);
        expect(decendants[0].name).toBe("Pichu");
        expect(decendants[1].name).toBe("Pikachu");
        expect(decendants[2].name).toBe("Raichu");
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

    test('returns Ralts evolution line (non-final)', () => {
        const p = pokemons.find(x => x.name === "Ralts");
        if (p === undefined) { fail('p should not be undefined'); }

        const decendants = getDecendants(p, true);
        expect(decendants.length).toBe(4);
        expect(decendants[0].name).toBe("Ralts");
        expect(decendants[1].name).toBe("Kirlia");
        expect(decendants[2].name).toBe("Gardevoir");
        expect(decendants[3].name).toBe("Gallade");
    });

    test('returns Vulpix (Alola) evolution line', () => {
        const p = pokemons.find(x => x.name === "Vulpix (Alola)");
        if (p === undefined) { fail('p should not be undefined'); }

        const decendants = getDecendants(p);
        expect(decendants.length).toBe(1);
        expect(decendants[0].name).toBe("Ninetales (Alola)");
    });

    test('returns Vulpix evolution line', () => {
        const p = pokemons.find(x => x.name === "Vulpix");
        if (p === undefined) { fail('p should not be undefined'); }

        const decendants = getDecendants(p);
        expect(decendants.length).toBe(1);
        expect(decendants[0].name).toBe("Ninetales");
    });
});
