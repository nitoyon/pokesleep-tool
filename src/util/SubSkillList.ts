import SubSkill from './SubSkill';

/**
 * Represents a sub skill list for Pokemon.
 */
class SubSkillList {
    /**
     * List of sub skills (length is 5).
     * - value[0]: Level 10
     * - value[1]: Level 25
     * - value[2]: Level 50
     * - value[3]: Level 75
     * - value[4]: Level 100
     */
    private value: (SubSkill|null)[];

    /**
     * Initialize a new sub skill list.
     * @param value Create an empty list if value is undefined,
     *              clone the given list if value is specified.
     */
    constructor(value?: SubSkillList|(SubSkill|null)[]) {
        if (value === undefined) {
            this.value = [null, null, null, null, null];
        }
        else if (value instanceof Array) {
            this.value = value;
        }
        else {
            this.value = [...value.value];
        }
    }

    /**
     * Set the sub skill at the specified level.
     * @param level Level at which the sub skill is set.
     * @param subSkill Sub skill to be set.
     */
    set(level: 10|25|50|75|100, subSkill: SubSkill|null) {
        const curIndex = this.getIndex(level);
        if (subSkill !== null) {
            // swap sub skill if selected skill exists at other level
            const prevIndex = this.getSubSkillIndex(subSkill);
            if (prevIndex >= 0) {
                this.value[prevIndex] = this.value[curIndex];
            }
        }
        this.value[curIndex] = subSkill;
    }

    /**
     * Creates a deep copy of this instance.
     * @returns A cloned instance.
     */
    clone(): SubSkillList {
        const ret = new SubSkillList();
        ret.value = [...this.value];
        return ret;
    }
    
    /**
     * Get the active sub skill list at the specified level.
     * @param level level of the Pokemon (1 - 100).
     * @returns Array of the active Sub skills.
     */
    getActiveSubSkills(level: number): SubSkill[] {
        const ret: SubSkill[] = [];
        if (level < 10) { return ret; }
        if (this.value[0] !== null) { ret.push(this.value[0]); }

        if (level < 25) { return ret; }
        if (this.value[1] !== null) { ret.push(this.value[1]); }

        if (level < 50) { return ret; }
        if (this.value[2] !== null) { ret.push(this.value[2]); }

        if (level < 75) { return ret; }
        if (this.value[3] !== null) { ret.push(this.value[3]); }

        if (level < 100) { return ret; }
        if (this.value[4] !== null) { ret.push(this.value[4]); }

        return ret;
    }

    /**
     * Get the index of the sub skill.
     * @param subSkill Sub skill to be searched.
     * @returns 0 to 4 if found, -1 if not found.
     */
    getSubSkillIndex(subSkill: SubSkill|null) {
        if (subSkill === null) { return -1; }
        if (this.value[0]?.name === subSkill.name) { return 0; }
        if (this.value[1]?.name === subSkill.name) { return 1; }
        if (this.value[2]?.name === subSkill.name) { return 2; }
        if (this.value[3]?.name === subSkill.name) { return 3; }
        if (this.value[4]?.name === subSkill.name) { return 4; }
        return -1;
    }

    /**
     * Get the level of the sub skill.
     * @param subSkill Sub skill to be searched.
     * @returns Level (10, 25, 50, 75, 100) if found, -1 if not found.
     */
    getSubSkillLevel(subSkill: SubSkill|null): -1|10|25|50|75|100 {
        const index = this.getSubSkillIndex(subSkill);
        switch (index) {
            case 0: return 10;
            case 1: return 25;
            case 2: return 50;
            case 3: return 75;
            case 4: return 100;
            default: return -1;
        }
    }

    /**
     * Get the index of the given level.
     * @param level Level to get the index.
     * @returns 0 to 4 if valid level is given, -1 if invalid level is given.
     */
    getIndex(level: 10|25|50|75|100) {
        switch (level) {
            case 10: return 0;
            case 25: return 1;
            case 50: return 2;
            case 75: return 3;
            case 100: return 4;
            default: return -1;
        }
    }
    
    /** Get the sub skill for level 10. */
    get lv10(): SubSkill|null { return this.value[0]; }
    /** Set the sub skill for level 10. */
    set lv10(subSkill: SubSkill|null) { this.set(10, subSkill); }
    /** Get the sub skill for level 25. */
    get lv25(): SubSkill|null { return this.value[1]; }
    /** Set the sub skill for level 25. */
    set lv25(subSkill: SubSkill|null) { this.set(25, subSkill); }
    /** Get the sub skill for level 50. */
    get lv50(): SubSkill|null { return this.value[2]; }
    /** Set the sub skill for level 50. */
    set lv50(subSkill: SubSkill|null) { this.set(50, subSkill); }
    /** Get the sub skill for level 75. */
    get lv75(): SubSkill|null { return this.value[3]; }
    /** Set the sub skill for level 75. */
    set lv75(subSkill: SubSkill|null) { this.set(75, subSkill); }
    /** Get the sub skill for level 100. */
    get lv100(): SubSkill|null { return this.value[4]; }
    /** Set the sub skill for level 100. */
    set lv100(subSkill: SubSkill|null) { this.set(100, subSkill); }
}

export default SubSkillList;
