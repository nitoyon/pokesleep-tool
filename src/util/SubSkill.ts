
type GoldSubSkillType =  "Berry Finding S" |
    "Dream Shard Bonus" |
    "Energy Recovery Bonus" |
    "Helping Bonus" |
    "Research EXP Bonus" |
    "Skill Level Up M" |
    "Sleep EXP Bonus";
type BlueSubSkillType = "Helping Speed M" |
    "Ingredient Finder M" |
    "Inventory Up L" |
    "Inventory Up M" |
    "Skill Level Up S" |
    "Skill Trigger M";
type WhiteSubSkillType = "Helping Speed S" |
    "Ingredient Finder S" |
    "Inventory Up S" |
    "Skill Trigger S";
type SubSkillType = GoldSubSkillType | BlueSubSkillType | WhiteSubSkillType;

/**
 * Represents the nature of the pokemon.
 */
class SubSkill {
    private value: SubSkillType;

    private static goldSubSkillNames: GoldSubSkillType[] = [
        "Berry Finding S",
        "Dream Shard Bonus",
        "Energy Recovery Bonus",
        "Helping Bonus",
        "Research EXP Bonus",
        "Skill Level Up M",
        "Sleep EXP Bonus"];
    private static blueSubSkillNames: BlueSubSkillType[] = [
        "Helping Speed M",
        "Ingredient Finder M",
        "Inventory Up L",
        "Inventory Up M",
        "Skill Level Up S",
        "Skill Trigger M"];
    static whiteSubSkillNames: WhiteSubSkillType[] = [
        "Helping Speed S",
        "Ingredient Finder S",
        "Inventory Up S",
        "Skill Trigger S"];
    private static subSkillNames: SubSkillType[] = [
        ...this.goldSubSkillNames,
        ...this.blueSubSkillNames,
        ...this.whiteSubSkillNames,
    ];
    private static allSubSkillsCache: SubSkill[] = [];
    
    constructor(subSkill: string) {
        if (!(SubSkill.subSkillNames as any[]).includes(subSkill)) {
            throw new Error(`Invalid subskill specified: ${subSkill}`);
        }
        this.value = subSkill as SubSkillType;  
    }

    get name(): SubSkillType {
        return this.value;
    }

    get isGold() {
        return (SubSkill.goldSubSkillNames as any[]).includes(this.value);
    }
    get isBlue() {
        return (SubSkill.blueSubSkillNames as any[]).includes(this.value);
    }
    get isWhite() {
        return (SubSkill.whiteSubSkillNames as any[]).includes(this.value);
    }

    get index(): number {
        return SubSkill.allSubSkills.findIndex(x => x.name === this.name);
    }

    get skillLevelUp(): 0|1|2 {
        switch (this.value) {
            case "Skill Level Up M": return 2;
            case "Skill Level Up S": return 1;
            default: return 0;
        }
    }

    get skillTrigger(): 0|1|2 {
        switch (this.value) {
            case "Skill Trigger M": return 2;
            case "Skill Trigger S": return 1;
            default: return 0;
        }
    }

    get inventory(): 0|1|2|3 {
        switch (this.value) {
            case "Inventory Up L": return 3;
            case "Inventory Up M": return 2;
            case "Inventory Up S": return 1;
            default: return 0;
        }
    }

    get helpingSpeed(): 0|1|2 {
        switch (this.value) {
            case "Helping Speed M": return 2;
            case "Helping Speed S": return 1;
            default: return 0;
        }
    }

    get ingredientFinder(): 0|1|2 {
        switch (this.value) {
            case "Ingredient Finder M": return 2;
            case "Ingredient Finder S": return 1;
            default: return 0;
        }
    }

    get isBFS(): boolean {
        return this.value === "Berry Finding S";
    }

    get isBonus(): boolean {
        switch (this.value) {
            case "Helping Bonus": return true;
            case "Sleep EXP Bonus": return true;
            case "Dream Shard Bonus": return true;
            case "Research EXP Bonus": return true;
            case "Energy Recovery Bonus": return true;
            default: return false;
        }
    }

    static get allSubSkills(): SubSkill[] {
        if (SubSkill.allSubSkillsCache.length === 0) {
            SubSkill.allSubSkillsCache = SubSkill.subSkillNames
                .map(x => new SubSkill(x));
        }
        return [...SubSkill.allSubSkillsCache];
    }
}

export default SubSkill;
