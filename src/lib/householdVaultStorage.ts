/**
 * Multi-item household subscriptions + password vault.
 * Device-only localStorage — not encrypted. Prefer hints over real passwords.
 */

export const HOUSEHOLD_VAULT_STORAGE_KEY = "familysite-491:household-vault";

export type VaultSubscription = {
  id: string;
  name: string;
  amount: number;
  cycle: "Monthly" | "Yearly" | "Quarterly";
  due: string;
  color: string;
};

export type VaultPassword = {
  id: string;
  label: string;
  username: string;
  hint: string;
  color: string;
};

export type HouseholdVault = {
  version: 1;
  subscriptions: VaultSubscription[];
  passwords: VaultPassword[];
};

const DEFAULT_VAULT: HouseholdVault = {
  version: 1,
  subscriptions: [
    { id: "1", name: "Netflix", amount: 22.99, cycle: "Monthly", due: "Aug 15", color: "#EF4444" },
    { id: "2", name: "Spotify Family", amount: 16.99, cycle: "Monthly", due: "Aug 18", color: "#10B981" },
    { id: "3", name: "Amazon Prime", amount: 139, cycle: "Yearly", due: "Nov 3", color: "#F59E0B" },
    { id: "4", name: "Gym — LA Fitness", amount: 45, cycle: "Monthly", due: "Aug 22", color: "#4F46E5" },
    { id: "5", name: "Disney+", amount: 13.99, cycle: "Monthly", due: "Aug 28", color: "#1D4ED8" },
    { id: "6", name: "iCloud 2TB", amount: 9.99, cycle: "Monthly", due: "Sep 1", color: "#6B7280" },
  ],
  passwords: [
    {
      id: "1",
      label: "Home Wi‑Fi",
      username: "491WD2-Family",
      hint: "Router card in kitchen drawer",
      color: "#4F46E5",
    },
    {
      id: "2",
      label: "Streaming PIN",
      username: "Kids profile",
      hint: "Ask parent for code",
      color: "#EC4899",
    },
    {
      id: "3",
      label: "School Portal",
      username: "stella@school.edu",
      hint: "Password manager entry",
      color: "#D97706",
    },
    {
      id: "4",
      label: "Utilities account",
      username: "hershel@home",
      hint: "Shared vault — adults only",
      color: "#059669",
    },
  ],
};

function isCycle(v: unknown): v is VaultSubscription["cycle"] {
  return v === "Monthly" || v === "Yearly" || v === "Quarterly";
}

function coerceVault(raw: unknown): HouseholdVault {
  if (!raw || typeof raw !== "object") {
    return structuredClone(DEFAULT_VAULT);
  }
  const obj = raw as Partial<HouseholdVault>;
  const subscriptions = Array.isArray(obj.subscriptions)
    ? obj.subscriptions
        .filter((s) => s && typeof s === "object")
        .map((s, i) => {
          const row = s as Partial<VaultSubscription>;
          return {
            id: typeof row.id === "string" ? row.id : `sub-${i}`,
            name: typeof row.name === "string" ? row.name : "Subscription",
            amount: typeof row.amount === "number" ? row.amount : 0,
            cycle: isCycle(row.cycle) ? row.cycle : "Monthly",
            due: typeof row.due === "string" ? row.due : "Soon",
            color: typeof row.color === "string" ? row.color : "#8B5CF6",
          } satisfies VaultSubscription;
        })
    : structuredClone(DEFAULT_VAULT.subscriptions);

  const passwords = Array.isArray(obj.passwords)
    ? obj.passwords
        .filter((p) => p && typeof p === "object")
        .map((p, i) => {
          const row = p as Partial<VaultPassword>;
          return {
            id: typeof row.id === "string" ? row.id : `pw-${i}`,
            label: typeof row.label === "string" ? row.label : "Login",
            username: typeof row.username === "string" ? row.username : "",
            hint: typeof row.hint === "string" ? row.hint : "",
            color: typeof row.color === "string" ? row.color : "#8B5CF6",
          } satisfies VaultPassword;
        })
    : structuredClone(DEFAULT_VAULT.passwords);

  return { version: 1, subscriptions, passwords };
}

export function readHouseholdVault(): HouseholdVault {
  if (typeof window === "undefined") {
    return structuredClone(DEFAULT_VAULT);
  }
  try {
    const raw = window.localStorage.getItem(HOUSEHOLD_VAULT_STORAGE_KEY);
    if (!raw?.trim()) {
      return structuredClone(DEFAULT_VAULT);
    }
    return coerceVault(JSON.parse(raw));
  } catch {
    return structuredClone(DEFAULT_VAULT);
  }
}

export function writeHouseholdVault(vault: HouseholdVault): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      HOUSEHOLD_VAULT_STORAGE_KEY,
      JSON.stringify(coerceVault(vault)),
    );
  } catch {
    /* quota */
  }
}

export function addVaultSubscription(
  vault: HouseholdVault,
  input: { name: string; amount: number; cycle?: VaultSubscription["cycle"] },
): HouseholdVault {
  const colors = ["#8B5CF6", "#EF4444", "#10B981", "#F59E0B", "#4F46E5", "#EC4899"];
  const next: VaultSubscription = {
    id: `sub-${Date.now()}`,
    name: input.name.trim(),
    amount: input.amount,
    cycle: input.cycle ?? "Monthly",
    due: "Soon",
    color: colors[vault.subscriptions.length % colors.length]!,
  };
  return { ...vault, subscriptions: [next, ...vault.subscriptions] };
}

export function addVaultPassword(
  vault: HouseholdVault,
  input: { label: string; username: string; hint: string },
): HouseholdVault {
  const colors = ["#4F46E5", "#EC4899", "#D97706", "#059669", "#8B5CF6"];
  const next: VaultPassword = {
    id: `pw-${Date.now()}`,
    label: input.label.trim(),
    username: input.username.trim(),
    hint: input.hint.trim() || "Stored on this device",
    color: colors[vault.passwords.length % colors.length]!,
  };
  return { ...vault, passwords: [next, ...vault.passwords] };
}
