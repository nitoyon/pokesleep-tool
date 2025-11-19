# TODO: Add Charge Energy S Simulation to Energy.ts

## Overview

Add simulation for "Charge Energy S" skill that recovers the Pokemon's energy. The skill triggers when `skillRatio * cumulativeHelpCount >= 1`.

## Implementation Steps

### 1. Update Types

- [ ] Add `"chargeEnergy"` to the `type` field in `EnergyEvent` (line 87)
- [ ] Add `chargeEnergyCount` to `EnergyResult` for debugging/display purposes

### 2. Move Calculations Earlier

- [ ] Extract base frequency and skill ratio calculations from `calculateSneakySnacking()` into a separate method or calculate them earlier in `calculate()`
- [ ] These values are needed before creating Charge Energy S events

### 3. Extract calculateSkillProbabilityAfterWakeup() Method

- [ ] Define type of `skillProbabilityAfterWakeup`
- [ ] Extract calculateSkillProbabilityAfterWakeup method from `calculateSneakySnacking` method
- [ ] Add test for extracted method

### 4. Create Helper Methods

- [ ] Create `findSkillTriggerTime(efficiencies: EfficiencyEvent[], baseFreq: number, skillRate: number, startMinutes: number): {minute: number, count: number}`
  - When `skillRate * helpCount` reaches 1, `minute` represents the minute when `skillRate * helpCount` reaches 1 (`helpCount` should start from `startMinute`). In this case, `count` is set to `1`.
  - When `skillRatio * helpCount` doesn't reach 1, `minute` is set to the last efficiencies whose `isAwake` is `true` and returns the expected `count` of the skill triggered (should be less than 1).
  - Note that we should ignore the `EfficiencyEvent` whose `isAwake` is `false` or `isSnacking` is `true`.

### 5. Handle New Event Type

- [ ] Add case for `"chargeEnergy"` in `calculateEnergyForEvents()` (around line 332-347)
  - [ ] Calculate `chargedEnergy: number` like described in @src\util\PokemonStrength (`mainSkillBase * mainSkillFactor`)
  - Similar to `"e4e"`: `curEvent.energyAfter = Math.min(150, curEvent.energyAfter + chargeEnergyEnergy)`

### 6. Modify calculateEnergyForEvents() Method

If main skill startsWith `Charge Energy S`, following loop should be added.

1. Set `startMinutes` to 0
2. Add efficiency calculation and calculate first skill trigger time after `startMinutes`. If skill is not triggered, break from the loop.
3. Insert `"chargeEnergy"` events at the time
4. Recalculate energy with new events
5. Recalculate efficiency
6. Set `startMinutes` after the skill triggered minute, and goto 2. again

### 7. Modify calculate() Method

- [ ] `initialEnergy` should be added by Charge Energy S skill probability after wake up
  - [ ] Added energy is calculated using `calculateSkillProbabilityAfterWakeup()`: `chargedEnergy * twice * 2 + chargedEnergy * once`

### 8. Update Tests

- [ ] Add test cases for Charge Energy S simulation
- [ ] Test edge cases: skill ratio = 0, no triggers within period, multiple triggers
- [ ] Test interaction with existing e4e events (both happening)
- [ ] Test with different skill specialties (skill vs non-skill Pokémon)
- [ ] Test convergence behavior (verify iterations actually converge)

## Notes

- Charge Energy S trigger count is calculated (not a parameter like `e4eCount`)
- The circular dependency (help count → efficiency → energy → Charge Energy S → help count) requires iterative calculation
- May need 2-3 iterations to converge on stable trigger times
- When no Charge Energy S skill is present on the Pokémon, skip all iterations in Step 6
- The energy cap for Charge Energy S is 150 (same as e4e), not 100
