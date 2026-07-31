/**
 * Remove disabled rule options from gameOptions so the engine cannot use
 * features that have been excluded by an admin.
 */
export function stripDisabledRules(
  gameOptions: Record<string, unknown>,
  ruleMap: Map<string, boolean>,
): void {
  if (ruleMap.get('gridSize') === false) {
    delete gameOptions.gridSize;
  }

  const sw = gameOptions.specialWeapons;
  if (typeof sw === 'object' && sw !== null) {
    const weapons = sw as Record<string, unknown>;
    if (ruleMap.get('sonar') === false) {
      delete weapons.sonar;
    }
    if (ruleMap.get('radar') === false) {
      delete weapons.radar;
    }
    if (Object.keys(weapons).length === 0) {
      delete gameOptions.specialWeapons;
    }
  }

  if (ruleMap.get('teams') === false) {
    delete gameOptions.teams;
    delete gameOptions.teamConfig;
    if (gameOptions.mode === 'team') {
      delete gameOptions.mode;
    }
  }

  if (ruleMap.get('combos') === false) {
    delete gameOptions.expansions;
  }
}
