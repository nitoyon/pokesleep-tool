import PokemonIv from '../util/PokemonIv';
import SubSkill, { SubSkillType } from '../util/SubSkill';
import Nature from '../util/Nature';
import { IngredientType } from '../util/PokemonRp';

/**
 * クエリパラメータから個体値データを取得し、シリアライズされたBASE64文字列を返す
 * @param params クエリパラメータ
 * @returns シリアライズされたBASE64文字列
 */
export function serializeFromParams(params: URLSearchParams): string {
    // ポケモン名は必須
    const pokemonName = params.get('pokemon');
    if (!pokemonName) {
        throw new Error('pokemon parameter is required');
    }

    // PokemonIvオブジェクトを作成
    let iv = new PokemonIv(pokemonName);

    // 最終進化ポケモンで計算するかどうか
    const evolved = params.get('evolved') === 'true';
    if (evolved) {
        const decendants = iv.decendants;
        if (decendants.length > 0) {
            iv = iv.clone(decendants[0].name);
        }
    }

    // レベル
    const level = params.get('level');
    if (level !== null) {
        const levelNum = parseInt(level, 10);
        if (isNaN(levelNum) || levelNum < 1 || levelNum > 100) {
            throw new Error(`Invalid level: ${level}`);
        }
        iv.level = levelNum;
    }

    // スキルレベル
    const skillLevel = params.get('skillLevel');
    if (skillLevel !== null) {
        const skillLevelNum = parseInt(skillLevel, 10);
        if (isNaN(skillLevelNum) || skillLevelNum < 1) {
            throw new Error(`Invalid skillLevel: ${skillLevel}`);
        }
        iv.skillLevel = skillLevelNum;
    }

    // サブスキル
    const subSkill10 = params.get('subSkill10');
    if (subSkill10 !== null && subSkill10 !== '') {
        try {
            iv.subSkills.lv10 = new SubSkill(subSkill10 as SubSkillType);
        } catch {
            throw new Error(`Invalid subSkill10: ${subSkill10}`);
        }
    }

    const subSkill25 = params.get('subSkill25');
    if (subSkill25 !== null && subSkill25 !== '') {
        try {
            iv.subSkills.lv25 = new SubSkill(subSkill25 as SubSkillType);
        } catch {
            throw new Error(`Invalid subSkill25: ${subSkill25}`);
        }
    }

    const subSkill50 = params.get('subSkill50');
    if (subSkill50 !== null && subSkill50 !== '') {
        try {
            iv.subSkills.lv50 = new SubSkill(subSkill50 as SubSkillType);
        } catch {
            throw new Error(`Invalid subSkill50: ${subSkill50}`);
        }
    }

    const subSkill75 = params.get('subSkill75');
    if (subSkill75 !== null && subSkill75 !== '') {
        try {
            iv.subSkills.lv75 = new SubSkill(subSkill75 as SubSkillType);
        } catch {
            throw new Error(`Invalid subSkill75: ${subSkill75}`);
        }
    }

    const subSkill100 = params.get('subSkill100');
    if (subSkill100 !== null && subSkill100 !== '') {
        try {
            iv.subSkills.lv100 = new SubSkill(subSkill100 as SubSkillType);
        } catch {
            throw new Error(`Invalid subSkill100: ${subSkill100}`);
        }
    }

    // 性格
    const nature = params.get('nature');
    if (nature !== null && nature !== '') {
        try {
            iv.nature = new Nature(nature);
        } catch {
            throw new Error(`Invalid nature: ${nature}`);
        }
    }

    // 材料タイプ（デフォルト: ABC）
    const ingredient = params.get('ingredient');
    if (ingredient !== null && ingredient !== '') {
        if (ingredient !== 'ABB' && ingredient !== 'ABC') {
            throw new Error(`Invalid ingredient: ${ingredient}. Must be ABB or ABC`);
        }
        iv.ingredient = ingredient as IngredientType;
    } else {
        // デフォルト値をABCに設定
        iv.ingredient = "ABC";
    }

    // リボン
    const ribbon = params.get('ribbon');
    if (ribbon !== null && ribbon !== '') {
        const ribbonNum = parseInt(ribbon, 10);
        if (isNaN(ribbonNum) || ribbonNum < 0 || ribbonNum > 4) {
            throw new Error(`Invalid ribbon: ${ribbon}. Must be 0-4`);
        }
        iv.ribbon = ribbonNum as 0|1|2|3|4;
    }

    // シリアライズ
    return iv.serialize();
}

