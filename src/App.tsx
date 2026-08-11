import { FamilyHubApp } from "./familyhub";

/**
 * Primary shell is FamilyHub — opens on Home.
 * No Projects / Photos / Routines / kiosk shell.
 * Full FamilyData model remains in src/data for persistence/bridge work.
 */
function App() {
  return <FamilyHubApp />;
}

export default App;
