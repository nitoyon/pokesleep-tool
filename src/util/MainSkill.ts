
export type MainSkillName = "Ingredient Magnet S" |
    "Charge Energy S" |
    "Charge Strength S" |
    "Charge Strength M" |
    "Dream Shard Magnet S" |
    "Energizing Cheer S" |
    "Metronome" |
    "Energy for Everyone S" |
    "Extra Helpful S" |
    "Cooking Power-Up S" |
    "Tasty Chance S";

export function isSkillLevelMax7(skill: MainSkillName): boolean {
    return skill === "Charge Strength M" ||
        skill === "Charge Strength S" ||
        skill === "Dream Shard Magnet S";
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
        return [6, 8, 11, 14, 17, 21][skillLevel - 1];
    }
    if (skill === "Charge Energy S") {
        return [12, 16, 21, 27, 34, 43][skillLevel - 1];
    }
    if (skill === "Charge Strength S") {
        return [400, 569, 765, 1083, 1496, 2066, 2656][skillLevel - 1];
    }
    if (skill === "Charge Strength M") {
        return [880, 1251, 1726, 2383, 3290, 4546, 5843][skillLevel - 1];
    }
    if (skill === "Cooking Power-Up S") {
        return [7, 10, 12, 17, 22, 27][skillLevel - 1];
    }
    if (skill === "Energizing Cheer S") {
        return [14, 17, 23, 29, 38, 51][skillLevel - 1];
    }
    if (skill === "Energy for Everyone S") {
        return [5, 7, 9, 11, 15, 18][skillLevel - 1];
    }
    if (skill === "Extra Helpful S") {
        return [5, 6, 7, 8, 9, 10][skillLevel - 1];
    }
    if (skill === "Dream Shard Magnet S") {
        // TODO
        return [0, 0, 0, 0, 0, 0, 0][skillLevel - 1];
    }
    if (skill === "Tasty Chance S") {
        // TODO
        return [0, 0, 0, 0, 0, 0][skillLevel - 1];
    }
    if (skill === "Metronome") {
        // TODO
        return [0, 0, 0, 0, 0, 0][skillLevel - 1];
    }
}    
