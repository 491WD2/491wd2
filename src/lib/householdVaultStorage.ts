/**
 * Household subscriptions vault (device-only localStorage).
 * Each subscription stores a login/password and who pays for it.
 */

export const HOUSEHOLD_VAULT_STORAGE_KEY = "familysite-491:household-vault";

export type VaultSubscription = {
  id: string;
  name: string;
  /** Account password / PIN for this subscription (device-only). */
  password: string;
  /** Family member id responsible for paying. */
  payerMemberId: string;
  color: string;
};

export type HouseholdVault = {
  version: 2;
  subscriptions: VaultSubscription[];
};

const DEFAULT_VAULT: HouseholdVault = {
  version: 2,
  subscriptions: [
    {
      id: "1",
      name: "Netflix",
      password: "",
      payerMemberId: "member-1",
      color: "#EF4444",
    },
    {
      id: "2",
      name: "Spotify Family",
      password: "",
      payerMemberId: "member-2",
      color: "#10B981",
    },
    {
      id: "3",
      name: "Amazon Prime",
      password: "",
      payerMemberId: "member-1",
      color: "#F59E0B",
    },
    {
      id: "4",
      name: "Disney+",
      password: "",
      payerMemberId: "member-3",
      color: "#1D4ED8",
    },
  ],
};

const COLORS = ["#8B5CF6", "#EF4444", "#10B981", "#F59E0B", "#4F46E5", "#EC4899", "#1D4ED8"];

function coerceVault(raw: unknown): HouseholdVault {
  if (!raw || typeof raw !== "object") {
    return structuredClone(DEFAULT_VAULT);
  }
  const obj = raw as Record<string, unknown>;
  const rows = Array.isArray(obj.subscriptions) ? obj.subscriptions : [];

  if (rows.length === 0) {
    return structuredClone(DEFAULT_VAULT);
  }

  const subscriptions = rows
    .filter((s) => s && typeof s === "object")
    .map((s, i) => {
      const row = s as Record<string, unknown>;
      const legacyHint =
        typeof row.hint === "string"
          ? row.hint
          : typeof row.username === "string"
            ? row.username
            : "";
      const password =
        typeof row.password === "string"
          ? row.password
          : legacyHint;
      return {
        id: typeof row.id === "string" ? row.id : `sub-${i}`,
        name: typeof row.name === "string" ? row.name : "Subscription",
        password,
        payerMemberId:
          typeof row.payerMemberId === "string" ? row.payerMemberId : "",
        color: typeof row.color === "string" ? row.color : COLORS[i % COLORS.length]!,
      } satisfies VaultSubscription;
    });

  return { version: 2, subscriptions };
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
  input: { name: string; password?: string; payerMemberId?: string },
): HouseholdVault {
  const next: VaultSubscription = {
    id: `sub-${Date.now()}`,
    name: input.name.trim(),
    password: (input.password ?? "").trim(),
    payerMemberId: input.payerMemberId ?? "",
    color: COLORS[vault.subscriptions.length % COLORS.length]!,
  };
  return { ...vault, subscriptions: [next, ...vault.subscriptions] };
}

export function updateVaultSubscription(
  vault: HouseholdVault,
  id: string,
  patch: Partial<Pick<VaultSubscription, "name" | "password" | "payerMemberId">>,
): HouseholdVault {
  return {
    ...vault,
    subscriptions: vault.subscriptions.map((s) =>
      s.id === id ? { ...s, ...patch } : s,
    ),
  };
}

export function deleteVaultSubscription(
  vault: HouseholdVault,
  id: string,
): HouseholdVault {
  return {
    ...vault,
    subscriptions: vault.subscriptions.filter((s) => s.id !== id),
  };
}
