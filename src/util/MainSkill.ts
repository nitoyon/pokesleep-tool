
export type MainSkillName = "Ingredient Magnet S" |
    "Charge Energy S" |
    "Charge Energy S (Moonlight)" |
    "Charge Strength S" |
    "Charge Strength S (Random)" |
    "Charge Strength S (Stockpile)" |
    "Charge Strength M" |
    "Charge Strength M (Bad Dreams)" |
    "Dream Shard Magnet S" |
    "Dream Shard Magnet S (Random)" |
    "Energizing Cheer S" |
    "Metronome" |
    "Energy for Everyone S" |
    "Energy for Everyone S (Lunar Blessing)" |
    "Extra Helpful S" |
    "Cooking Power-Up S" |
    "Tasty Chance S" |
    "Helper Boost" |
    "Berry Burst" |
    "Berry Burst (Disguise)" |
    "Skill Copy" |
    "Skill Copy (Transform)" |
    "Skill Copy (Mimic)" |
    "Ingredient Draw S" |
    "Ingredient Draw S (Super Luck)" |
    "Ingredient Draw S (Hyper Cutter)" |
    "unknown";

export const MainSkillNames: MainSkillName[] = [
    "Charge Strength S", "Charge Strength M",
    "Ingredient Magnet S", "Energy for Everyone S",
    "Charge Energy S", "Energizing Cheer S",
    "Cooking Power-Up S", "Tasty Chance S",
    "Extra Helpful S", "Helper Boost",
    "Dream Shard Magnet S", "Metronome",
    "Berry Burst", "Skill Copy", "Ingredient Draw S",
];

export function getMaxSkillLevel(skill: MainSkillName): 6|7|8 {
    if (skill === "Dream Shard Magnet S" ||
        skill === "Dream Shard Magnet S (Random)") {
        return 8;
    }
    if (skill === "Ingredient Magnet S" ||
        skill === "Charge Strength M" ||
        skill === "Charge Strength S" ||
        skill === "Charge Strength S (Random)" ||
        skill === "Charge Strength S (Stockpile)" ||
        skill === "Extra Helpful S" ||
        skill === "Cooking Power-Up S" ||
        skill === "Metronome" ||
        skill === "Skill Copy (Transform)" ||
        skill === "Skill Copy (Mimic)" ||
        skill === "Ingredient Draw S (Super Luck)" ||
        skill === "Ingredient Draw S (Hyper Cutter)") {
        return 7;
    }
    return 6;
}

export function getSkillValue(skill: MainSkillName, skillLevel: number) {
    // verification
    if (skillLevel !== Math.floor(skillLevel)) {
        throw new Error(`invalid skill level: ${skillLevel}`);
    }
    if (skillLevel < 0 || skillLevel > getMaxSkillLevel(skill)) {
        throw new Error(`invalid main skill: ${skill}, ${skillLevel}`);
    }

    if (skill === "Ingredient Magnet S") {
        return [6, 8, 11, 14, 17, 21, 24][skillLevel - 1];
    }
    if (skill === "Charge Energy S" ||
        skill === "Charge Energy S (Moonlight)"
    ) {
        return [12, 16, 21, 27, 34, 43][skillLevel - 1];
    }
    if (skill === "Charge Strength S") {
        return [400, 569, 785, 1083, 1496, 2066, 3002][skillLevel - 1];
    }
    if (skill === "Charge Strength S (Stockpile)") {
        return [600, 853, 1177, 1625, 2243, 3099, 3984][skillLevel - 1];
    }
    if (skill === "Charge Strength S (Random)") {
        return [500, 711.5, 981.5, 1354, 1870, 2582.5, 3752.5][skillLevel - 1];
    }
    if (skill === "Charge Strength M") {
        return [880, 1251, 1726, 2383, 3290, 4546, 6409][skillLevel - 1];
    }
    if (skill === "Charge Strength M (Bad Dreams)") {
        return [2640, 3753, 5178, 7149, 9870, 13638][skillLevel - 1];
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
    if (skill === "Energy for Everyone S (Lunar Blessing)") {
        return [3, 4, 5, 7, 9, 11][skillLevel - 1];
    }
    if (skill === "Extra Helpful S") {
        return [5, 6, 7, 8, 9, 10, 11][skillLevel - 1];
    }
    if (skill === "Helper Boost") {
        // Assume that 3 same type pokemon exists in the party
        return [3, 4, 5, 6, 7, 8][skillLevel - 1];
    }
    if (skill === "Dream Shard Magnet S") {
        return [240, 340, 480, 670, 920, 1260, 1800, 2500][skillLevel - 1];
    }
    if (skill === "Dream Shard Magnet S (Random)") {
        return [300, 425, 600, 837.5, 1150, 1575, 2250, 2875][skillLevel - 1];
    }
    if (skill === "Tasty Chance S") {
        return [4, 5, 6, 7, 8, 10][skillLevel - 1];
    }
    if (skill === "Berry Burst (Disguise)") {
        return [8, 10, 15, 17, 19, 21][skillLevel - 1];
    }
    if (skill === "Berry Burst") {
        return [11, 14, 21, 24, 27, 30][skillLevel - 1];
    }
    if (skill === "Ingredient Draw S (Super Luck)" ||
        skill === "Ingredient Draw S (Hyper Cutter)"
    ) {
        return [5, 6, 8, 11, 13, 16, 18][skillLevel - 1];
    }
    if (skill === "Metronome") {
        // TODO
        return [0, 0, 0, 0, 0, 0][skillLevel - 1];
    }
    return [0, 0, 0, 0, 0, 0, 0][skillLevel - 1];
}    
