import SubSkill from './SubSkill';

/**
 * Properties for configuring a SubSkillList.
 */
export interface SubSkillListProps {
    lv10: SubSkill|null;
    lv25: SubSkill|null;
    lv50: SubSkill|null;
    lv75: SubSkill|null;
    lv100: SubSkill|null;
}

/**
 * Represents a sub skill list for Pokemon.
 *
 * This class is immutable.
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
    private readonly value: readonly (SubSkill|null)[];

    /**
     * Initialize a new sub skill list.
     * @param props Create an empty list if undefined, or initialize with the given props.
     */
    constructor(props?: Partial<SubSkillListProps>) {
        if (props === undefined) {
            this.value = [null, null, null, null, null];
        }
        else {
            this.value = [
                props.lv10 ?? null,
                props.lv25 ?? null,
                props.lv50 ?? null,
                props.lv75 ?? null,
                props.lv100 ?? null,
            ];
        }
    }

    /**
     * Creates a new SubSkillList instance, optionally with modifications.
     * When updates are provided, applies swap logic to prevent duplicate skills.
     * @param updates Optional updates to apply to specific levels.
     * @returns A new SubSkillList instance with updates applied.
     */
    clone(updates?: Partial<SubSkillListProps>): SubSkillList {
        if (!updates) {
            return new SubSkillList(this.toProps());
        }

        // Start with current values (mutable copy for processing)
        const newValue = [...this.value] as (SubSkill|null)[];

        // Helper to apply a single skill update with swap logic
        const applyUpdate = (index: number, subSkill: SubSkill|null) => {
            if (subSkill !== null) {
                // Find if this skill already exists at another level
                const existingIndex = newValue.findIndex(
                    (s, i) => i !== index && s?.name === subSkill.name
                );

                // If found, swap the skills
                if (existingIndex >= 0) {
                    newValue[existingIndex] = newValue[index];
                }
            }
            newValue[index] = subSkill;
        };

        // Apply updates in level order
        if (updates.lv10 !== undefined) { applyUpdate(0, updates.lv10); }
        if (updates.lv25 !== undefined) { applyUpdate(1, updates.lv25); }
        if (updates.lv50 !== undefined) { applyUpdate(2, updates.lv50); }
        if (updates.lv75 !== undefined) { applyUpdate(3, updates.lv75); }
        if (updates.lv100 !== undefined) { applyUpdate(4, updates.lv100); }

        return new SubSkillList({
            lv10: newValue[0],
            lv25: newValue[1],
            lv50: newValue[2],
            lv75: newValue[3],
            lv100: newValue[4],
        });
    }

    /**
     * Check whether given skill list is equal to this skill list.
     * @param list Skill list to be compared.
     * @returns Whether two skill list is equal or not.
     */
    isEqual(list: SubSkillList) {
        return this.lv10?.name === list.lv10?.name &&
            this.lv25?.name === list.lv25?.name &&
            this.lv50?.name === list.lv50?.name &&
            this.lv75?.name === list.lv75?.name &&
            this.lv100?.name === list.lv100?.name;
    }

    /**
     * Extract current sub skills as a SubSkillListProps object.
     * @returns Current state as properties.
     */
    toProps(): SubSkillListProps {
        return {
            lv10: this.value[0],
            lv25: this.value[1],
            lv50: this.value[2],
            lv75: this.value[3],
            lv100: this.value[4],
        };
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
    /** Get the sub skill for level 25. */
    get lv25(): SubSkill|null { return this.value[1]; }
    /** Get the sub skill for level 50. */
    get lv50(): SubSkill|null { return this.value[2]; }
    /** Get the sub skill for level 75. */
    get lv75(): SubSkill|null { return this.value[3]; }
    /** Get the sub skill for level 100. */
    get lv100(): SubSkill|null { return this.value[4]; }
}

export default SubSkillList;
