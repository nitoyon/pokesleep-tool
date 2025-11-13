import PokemonIv from '../util/PokemonIv';

/**
 * BASE64文字列から個体値データを復元し、JSON形式で返す
 * @param serialized BASE64文字列
 * @returns 個体値パラメータのJSONオブジェクト
 */
export function deserializeToJson(serialized: string): {
    pokemon: string;
    level: number;
    skillLevel: number;
    subSkills: {
        lv10: string | null;
        lv25: string | null;
        lv50: string | null;
        lv75: string | null;
        lv100: string | null;
    };
    nature: string;
    ingredient: string;
    ribbon: number;
} {
    // デシリアライズ
    const iv = PokemonIv.deserialize(serialized);

    // JSON形式に変換
    return {
        pokemon: iv.pokemonName,
        level: iv.level,
        skillLevel: iv.skillLevel,
        subSkills: {
            lv10: iv.subSkills.lv10?.name || null,
            lv25: iv.subSkills.lv25?.name || null,
            lv50: iv.subSkills.lv50?.name || null,
            lv75: iv.subSkills.lv75?.name || null,
            lv100: iv.subSkills.lv100?.name || null,
        },
        nature: iv.nature.name,
        ingredient: iv.ingredient,
        ribbon: iv.ribbon,
    };
}

