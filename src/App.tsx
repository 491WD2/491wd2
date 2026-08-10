import { FamilyHubApp } from "./familyhub";

/**
 * Primary shell is the Figma Make FamilyHub layout (always-on Home).
 * Full FamilyData model remains in src/data for persistence/bridge work.
 * Legacy AdminUX shell: import CurrentBuild from "./CurrentBuild".
 */
function App() {
  return <FamilyHubApp />;
}

export default App;
