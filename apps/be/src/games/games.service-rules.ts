export function stripDisabledRules(
  options: Record<string, unknown>,
  ruleMap: Map<string, boolean>,
): void {
  if (ruleMap.get('gridSize') === false) delete options.gridSize;
  const sw = options.specialWeapons;
  if (typeof sw === 'object' && sw !== null) {
    const weapons = sw as Record<string, unknown>;
    if (ruleMap.get('sonar') === false) delete weapons.sonar;
    if (ruleMap.get('radar') === false) delete weapons.radar;
    if (Object.keys(weapons).length === 0) delete options.specialWeapons;
  }
  if (ruleMap.get('teams') === false) {
    delete options.teams;
    delete options.teamConfig;
    if (options.mode === 'team') delete options.mode;
  }
  if (ruleMap.get('combos') === false) delete options.expansions;
}
