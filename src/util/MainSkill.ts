
export type MainSkillName = "Ingredient Magnet S" |
    "Charge Energy S" |
    "Charge Strength S" |
    "Charge Strength S (Random)" |
    "Charge Strength M" |
    "Dream Shard Magnet S" |
    "Dream Shard Magnet S (Random)" |
    "Energizing Cheer S" |
    "Metronome" |
    "Energy for Everyone S" |
    "Extra Helpful S" |
    "Cooking Power-Up S" |
    "Tasty Chance S" |
    "Helper Boost";

export function isSkillLevelMax7(skill: MainSkillName): boolean {
    return skill === "Ingredient Magnet S" ||
        skill === "Charge Strength M" ||
        skill === "Charge Strength S" ||
        skill === "Charge Strength S (Random)" ||
        skill === "Extra Helpful S" ||
        skill === "Cooking Power-Up S" ||
        skill === "Dream Shard Magnet S" ||
        skill === "Dream Shard Magnet S (Random)";
}

export function getSkillValue(skill: MainSkillName, skillLevel: number) {
    // verification
    if (skillLevel !== Math.floor(skillLevel)) {
        throw new Error(`invalid skill level: ${skillLevel}`);
    }
    if (isSkillLevelMax7(skill)) {
        if (skillLevel < 0 || skillLevel >= 8) {
            throw new Error(`invalid main skill: ${skill}, ${skillLevel}`);
        }
    } else {
        if (skillLevel < 0 || skillLevel >= 7) {
            throw new Error(`invalid main skill: ${skill}, ${skillLevel}`);
        }
    }

    if (skill === "Ingredient Magnet S") {
        return [6, 8, 11, 14, 17, 21, 24][skillLevel - 1];
    }
    if (skill === "Charge Energy S") {
        return [12, 16, 21, 27, 34, 43][skillLevel - 1];
    }
    if (skill === "Charge Strength S") {
        return [400, 569, 765, 1083, 1496, 2066, 3002][skillLevel - 1];
    }
    if (skill === "Charge Strength S (Random)") {
        return [400, 569, 765, 1083, 1496, 2066, 3002][skillLevel - 1] * 1.25;
    }
    if (skill === "Charge Strength M") {
        return [880, 1251, 1726, 2383, 3290, 4546, 6409][skillLevel - 1];
    }
    if (skill === "Cooking Power-Up S") {
        return [7, 10, 12, 17, 22, 27, 31][skillLevel - 1];
    }
    if (skill === "Energizing Cheer S") {
        return [14, 17, 23, 29, 38, 51][skillLevel - 1];
    }
    if (skill === "Energy for Everyone S") {
        return [5, 7, 9, 11, 15, 18][skillLevel - 1];
    }
    if (skill === "Extra Helpful S") {
        return [5, 6, 7, 8, 9, 10, 11][skillLevel - 1];
    }
    if (skill === "Helper Boost") {
        // Assume that 3 same type pokemon exists in the party
        return [3, 4, 5, 6, 7, 8][skillLevel - 1];
    }
    if (skill === "Dream Shard Magnet S") {
        return [240, 340, 480, 670, 920, 1260, 1800][skillLevel - 1];
    }
    if (skill === "Dream Shard Magnet S (Random)") {
        return [240, 340, 480, 670, 920, 1260, 1800][skillLevel - 1] * 1.25;
    }
    if (skill === "Tasty Chance S") {
        return [4, 5, 6, 7, 8, 10][skillLevel - 1];
    }
    if (skill === "Metronome") {
        // TODO
        return [0, 0, 0, 0, 0, 0][skillLevel - 1];
    }
    return [0, 0, 0, 0, 0, 0][skillLevel - 1];
}    
