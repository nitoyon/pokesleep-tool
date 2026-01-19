import pokemons, { getDecendants, getCandyName } from './pokemons';
import { assert } from 'vitest';

describe('getDecendants', () => {
    test('returns itself when non evolved pokemon is specified', () => {
        const p = pokemons.find(x => x.name === "Cramorant");
        if (p === undefined) { assert.fail('p should not be undefined'); }

        const decendants = getDecendants(p);
        expect(decendants.length).toBe(0);
    });

    test('returns evolved pokemon', () => {
        const p = pokemons.find(x => x.name === "Bulbasaur");
        if (p === undefined) { assert.fail('p should not be undefined'); }

        const decendants = getDecendants(p);
        expect(decendants.length).toBe(1);
        expect(decendants[0].name).toBe("Venusaur");
    });

    test('returns evolved pokemon (non-final)', () => {
        const p = pokemons.find(x => x.name === "Bulbasaur");
        if (p === undefined) { assert.fail('p should not be undefined'); }

        const decendants = getDecendants(p, true);
        expect(decendants.length).toBe(3);
        expect(decendants[0].name).toBe("Bulbasaur");
        expect(decendants[1].name).toBe("Ivysaur");
        expect(decendants[2].name).toBe("Venusaur");
    });

    test('returns Pikachu decendants (non-final)', () => {
        const p = pokemons.find(x => x.name === "Pikachu");
        if (p === undefined) { assert.fail('p should not be undefined'); }

        const decendants = getDecendants(p, true);
        expect(decendants.length).toBe(3);
        expect(decendants[0].name).toBe("Pichu");
        expect(decendants[1].name).toBe("Pikachu");
        expect(decendants[2].name).toBe("Raichu");
    });

    test('returns Eevee evolution line', () => {
        const p = pokemons.find(x => x.name === "Eevee");
        if (p === undefined) { assert.fail('p should not be undefined'); }

        const decendants = getDecendants(p);
        expect(decendants.length).toBe(8);
        expect(decendants.some(x => x.name === "Jolteon")).toBe(true);
    });

    test('returns Slowpoke evolution line', () => {
        const p = pokemons.find(x => x.name === "Slowpoke");
        if (p === undefined) { assert.fail('p should not be undefined'); }

        const decendants = getDecendants(p);
        expect(decendants.length).toBe(2);
        expect(decendants[0].name).toBe("Slowbro");
        expect(decendants[1].name).toBe("Slowking");
    });

    test('returns Ralts evolution line', () => {
        const p = pokemons.find(x => x.name === "Ralts");
        if (p === undefined) { assert.fail('p should not be undefined'); }

        const decendants = getDecendants(p);
        expect(decendants.length).toBe(2);
        expect(decendants[0].name).toBe("Gardevoir");
        expect(decendants[1].name).toBe("Gallade");
    });

    test('returns Ralts evolution line (non-final)', () => {
        const p = pokemons.find(x => x.name === "Ralts");
        if (p === undefined) { assert.fail('p should not be undefined'); }

        const decendants = getDecendants(p, true);
        expect(decendants.length).toBe(4);
        expect(decendants[0].name).toBe("Ralts");
        expect(decendants[1].name).toBe("Kirlia");
        expect(decendants[2].name).toBe("Gardevoir");
        expect(decendants[3].name).toBe("Gallade");
    });

    test('returns Vulpix (Alola) evolution line', () => {
        const p = pokemons.find(x => x.name === "Vulpix (Alola)");
        if (p === undefined) { assert.fail('p should not be undefined'); }

        const decendants = getDecendants(p);
        expect(decendants.length).toBe(1);
        expect(decendants[0].name).toBe("Ninetales (Alola)");
    });

    test('returns Vulpix evolution line', () => {
        const p = pokemons.find(x => x.name === "Vulpix");
        if (p === undefined) { assert.fail('p should not be undefined'); }

        const decendants = getDecendants(p);
        expect(decendants.length).toBe(1);
        expect(decendants[0].name).toBe("Ninetales");
    });

    test('returns Toxel evolution line', () => {
        const p = pokemons.find(x => x.name === "Toxel");
        if (p === undefined) { assert.fail('p should not be undefined'); }

        const decendants = getDecendants(p);
        expect(decendants.length).toBe(2);
        expect(decendants[0].name).toBe("Toxtricity (Amped)");
        expect(decendants[1].name).toBe("Toxtricity (Low Key)");
    });

    test('returns Toxel evolution line (non-final)', () => {
        const p = pokemons.find(x => x.name === "Toxel");
        if (p === undefined) { assert.fail('p should not be undefined'); }

        const decendants = getDecendants(p, true);
        expect(decendants.length).toBe(3);
        expect(decendants[0].name).toBe("Toxel");
        expect(decendants[1].name).toBe("Toxtricity (Amped)");
        expect(decendants[2].name).toBe("Toxtricity (Low Key)");
    });
});

describe('getCandyName', () => {
    test('returns ascendant name for some baby Pokémon', () => {
        expect(getCandyName(172)).toBe("Pikachu"); // Pichu → Pikachu
        expect(getCandyName(25)).toBe("Pikachu"); // Pikachu → Pikachu
        expect(getCandyName(26)).toBe("Pikachu"); // Raichu → Pikachu

        expect(getCandyName(173)).toBe("Clefairy"); // Cleffa → Clefairy
        expect(getCandyName(35)).toBe("Clefairy"); // Clefairy → Clefairy

        expect(getCandyName(174)).toBe("Jigglypuff"); // Igglybuff → Jigglypuff
        expect(getCandyName(39)).toBe("Jigglypuff"); // Jigglypuff → Jigglypuff

        expect(getCandyName(360)).toBe("Wobbuffet"); // Wynaut → Wobbuffet
        expect(getCandyName(202)).toBe("Wobbuffet"); // Wobbuffet → Wobbuffet

        expect(getCandyName(438)).toBe("Sudowoodo"); // Bonsly → Sudowoodo
        expect(getCandyName(185)).toBe("Sudowoodo"); // Sudowoodo → Sudowoodo

        expect(getCandyName(439)).toBe("Mr. Mime"); // Mime Jr. → Mr. Mime
        expect(getCandyName(122)).toBe("Mr. Mime"); // Mr. Mime → Mr. Mime

        expect(getCandyName(440)).toBe("Chansey"); // Happiny → Chansey
        expect(getCandyName(113)).toBe("Chansey"); // Chansey → Chansey
        expect(getCandyName(242)).toBe("Chansey"); // Blissey → Chansey

        expect(getCandyName(447)).toBe("Lucario"); // Riolu → Lucario
        expect(getCandyName(448)).toBe("Lucario"); // Lucario → Lucario
    });

    test('returns baby name for some baby Pokémon', () => {
        expect(getCandyName(175)).toBe("Togepi"); // Togepi
        expect(getCandyName(176)).toBe("Togepi"); // Togetic
        expect(getCandyName(468)).toBe("Togepi"); // Togekiss

        expect(getCandyName(848)).toBe("Toxel"); // Toxel
        expect(getCandyName(849)).toBe("Toxel"); // Toxtricity
    });

    test('returns own name for no-evolution Pokémon without evolution', () => {
        expect(getCandyName(845)).toBe("Cramorant"); // Cramorant (no evolution)
    });

    test('returns ancestor name for evolved Pokémon', () => {
        expect(getCandyName(1)).toBe("Bulbasaur"); // Bulbasaur
        expect(getCandyName(2)).toBe("Bulbasaur"); // Ivysaur → Bulbasaur
        expect(getCandyName(3)).toBe("Bulbasaur"); // Venusaur → Bulbasaur
    });

    test('returns empty string for invalid Pokémon ID', () => {
        expect(getCandyName(99999)).toBe("");
    });

    test('returns empty string for negative Pokémon ID', () => {
        expect(getCandyName(-1)).toBe("");
    });
});

describe('JSON data verification', () => {
    test('evolutionCount is -1 if ancestor is null', () => {
        for (const pokemon of pokemons) {
            if (pokemon.ancestor === null) {
                expect(pokemon.evolutionCount, `id=${pokemon.name}`).toBe(-1);
            }
        }
    });

    test('ancestor is null if evolution count and evolution left is 0', () => {
        for (const pokemon of pokemons) {
            if (pokemon.evolutionCount === 0 &&
                pokemon.evolutionLeft === 0
            ) {
                expect(pokemon.ancestor).toBe(null);
            }
        }
    });

    test('ancestor id should be grouped', () => {
        for (const pokemon of pokemons) {
            if (pokemon.ancestor === null) {
                continue;
            }
            const ancestor = pokemons.find(x => x.id === pokemon.ancestor);
            expect(ancestor).toBeDefined();
            if (ancestor === undefined) {
                throw new Error('never comes here');
            }
            expect(ancestor.id, `id=${pokemon.name}`).toBe(pokemon.ancestor);
            expect(pokemon.evolutionCount + pokemon.evolutionLeft, `id=${pokemon.id}`)
                .toBe(ancestor.evolutionCount + ancestor.evolutionLeft);
        }
    });

    test('isFullyEvolved and evolutionCount', () => {
        for (const pokemon of pokemons) {
            if (pokemon.isFullyEvolved) {
                expect(pokemon.evolutionLeft).toBe(0);
            } else {
                expect(pokemon.evolutionLeft).not.toBe(0);
            }
        }
    });
});
