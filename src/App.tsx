import { FamilyHubApp } from "./familyhub";

/**
 * Primary shell is FamilyHub — opens on Home.
 * Visual style follows the attached Figma/code bundle (mauve admin chrome).
 * Full FamilyData model remains in src/data for persistence/bridge work.
 */
function App() {
  return <FamilyHubApp />;
}

export default App;
