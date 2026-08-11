import type {
  FamilyData,
  FamilyMember,
  HouseholdNotification,
  MessageBoardItem,
  PantryItem,
  ShoppingItem,
  Task,
  DocItem,
} from "../data/familyData";
import { WAKE_PAGE_MEMBER_DISPLAY_ORDER } from "../data/familyData";
import { getMemberColor } from "../lib/memberColors";
import { getMemberFullName } from "../lib/utils";
import {
  addVaultPassword,
  addVaultSubscription,
  readHouseholdVault,
  writeHouseholdVault,
  type HouseholdVault,
  type VaultPassword,
  type VaultSubscription,
} from "../lib/householdVaultStorage";

export type HubMember = {
  id: string;
  name: string;
  color: string;
  bg: string;
};

export type HubShoppingItem = {
  id: string;
  name: string;
  qty: string;
  category: string;
  checked: boolean;
  addedBy: string;
};

export type HubPantryStatus = "out" | "low" | "ok" | "good";

export type HubPantryItem = {
  id: string;
  name: string;
  qty: number;
  max: number;
  unit: string;
  category: string;
  expiry: string | null;
  status: HubPantryStatus;
};

export type HubChore = {
  id: string;
  task: string;
  assigned: string;
  due: string;
  done: boolean;
};

export type HubEvent = {
  id: string;
  title: string;
  date: string;
  time: string;
  color: string;
  who: string;
};

export type HubMessage = {
  id: string;
  from: string;
  text: string;
  time: string;
  read: boolean;
};

export type HubPet = {
  id: string;
  name: string;
  type: string;
  breed: string;
  age: string;
  color: string;
  tasks: string[];
};

export type HubSubscription = {
  id: string;
  name: string;
  amount: number;
  cycle: string;
  due: string;
  color: string;
};

export type HubPassword = {
  id: string;
  label: string;
  username: string;
  hint: string;
  color: string;
};

export type HubNotification = {
  id: string;
  title: string;
  body: string;
  time: string;
  unread: boolean;
};

export type HubDoc = {
  id: string;
  title: string;
  body: string;
};

function hexToBg(hex: string): string {
  const h = hex.replace("#", "");
  if (h.length !== 6) return "#F5F5F4";
  const r = Number.parseInt(h.slice(0, 2), 16);
  const g = Number.parseInt(h.slice(2, 4), 16);
  const b = Number.parseInt(h.slice(4, 6), 16);
  return `rgba(${r},${g},${b},0.14)`;
}

function memberNameById(members: FamilyMember[], id: string): string {
  const m = members.find((x) => x.id === id);
  return m ? getMemberFullName(m) : "Family";
}

function formatRelativeTime(iso: string): string {
  const t = Date.parse(iso);
  if (Number.isNaN(t)) return "";
  const mins = Math.max(0, Math.round((Date.now() - t) / 60000));
  if (mins < 1) return "now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  return `${days}d ago`;
}

function formatDueLabel(isoDate: string): string {
  if (!isoDate) return "Soon";
  const due = new Date(`${isoDate}T12:00:00`);
  if (Number.isNaN(due.getTime())) return isoDate;
  const today = new Date();
  const startToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const startDue = new Date(due.getFullYear(), due.getMonth(), due.getDate());
  const diffDays = Math.round((startDue.getTime() - startToday.getTime()) / 86400000);
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Tomorrow";
  if (diffDays === -1) return "Yesterday";
  return due.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function parseQty(raw: string | undefined): number {
  if (!raw) return 0;
  const n = Number.parseFloat(raw.replace(/[^\d.-]/g, ""));
  return Number.isFinite(n) ? n : 0;
}

function mapStockStatus(status: PantryItem["status"], qty: number, max: number): HubPantryStatus {
  if (status === "Out" || qty <= 0) return "out";
  if (status === "Low") return "low";
  if (max > 0 && qty / max < 0.5) return "ok";
  return "good";
}

export function mapHubMembers(data: FamilyData): HubMember[] {
  const active = data.familyMembers.filter((m) => m.status !== "archived");
  const byName = new Map(active.map((m) => [getMemberFullName(m), m]));
  const ordered: FamilyMember[] = [];
  for (const name of WAKE_PAGE_MEMBER_DISPLAY_ORDER) {
    const hit = byName.get(name);
    if (hit) ordered.push(hit);
  }
  for (const m of active) {
    if (!ordered.some((x) => x.id === m.id)) ordered.push(m);
  }
  return ordered.map((m) => {
    const color = getMemberColor(m);
    return {
      id: m.id,
      name: getMemberFullName(m),
      color,
      bg: hexToBg(color),
    };
  });
}

export function mapHubShopping(data: FamilyData): HubShoppingItem[] {
  return data.shopping.map((item) => ({
    id: item.id,
    name: item.name,
    qty: [item.quantity, item.unit].filter(Boolean).join(" ") || "1",
    category: item.category || "Pantry",
    checked: item.purchased,
    addedBy: item.requestedByMemberId
      ? memberNameById(data.familyMembers, item.requestedByMemberId)
      : "Family",
  }));
}

export function mapHubPantry(data: FamilyData): HubPantryItem[] {
  return data.pantry
    .filter((item) => !item.inactiveInInventory)
    .map((item) => {
      const qty = parseQty(item.quantity);
      const max = parseQty(item.maxQuantity) || Math.max(qty * 2, 4);
      return {
        id: item.id,
        name: item.name,
        qty,
        max,
        unit: item.unit || "items",
        category: item.category || "Pantry",
        expiry: item.bestByDate || item.expiryDate || null,
        status: mapStockStatus(item.status, qty, max),
      };
    });
}

export function mapHubChores(data: FamilyData): HubChore[] {
  return data.tasks
    .filter((task) => task.type === "chore" || task.type === "task")
    .map((task) => {
      const done = task.status === "Done" || task.status === "Completed";
      const assigned = task.assignedMemberId
        ? memberNameById(data.familyMembers, task.assignedMemberId)
        : task.owner || "Family";
      return {
        id: task.id,
        task: task.title,
        assigned,
        due: formatDueLabel(task.dueDate || task.nextDueDate),
        done,
      };
    });
}

export function mapHubEvents(data: FamilyData): HubEvent[] {
  const members = mapHubMembers(data);
  return data.planner.slice(0, 12).map((evt, index) => {
    const member = members.find((m) => m.id === evt.assignedMemberId);
    return {
      id: evt.id,
      title: evt.title,
      date: formatDueLabel(evt.date),
      time: evt.time || evt.startTime || "All day",
      color: member?.color || ["#4F46E5", "#DB2777", "#D97706", "#059669"][index % 4]!,
      who: evt.assignedPerson || member?.name || "Family",
    };
  });
}

export function mapHubMessages(data: FamilyData): HubMessage[] {
  const items = [...data.messageBoard].sort((a, b) =>
    (b.updatedAt || b.createdAt).localeCompare(a.updatedAt || a.createdAt),
  );
  return items.slice(0, 20).map((msg) => ({
    id: msg.id,
    from: msg.authorMemberId
      ? memberNameById(data.familyMembers, msg.authorMemberId)
      : msg.title || "Family",
    text: msg.message || msg.title,
    time: formatRelativeTime(msg.updatedAt || msg.createdAt),
    read: !msg.pinned && msg.priority !== "important" && msg.priority !== "urgent",
  }));
}

export function mapHubPets(data: FamilyData): HubPet[] {
  const meds = data.petMedicationEntries ?? [];
  return (data.pets ?? [])
    .filter((pet) => pet.active !== false)
    .map((pet) => {
      const related = meds
        .filter((m) => m.petId === pet.id)
        .slice(0, 3)
        .map((m) => `${m.medicationType} · ${formatDueLabel(m.givenAt.slice(0, 10))}`);
      const color = pet.colorTheme
        ? getMemberColor({
            id: pet.id,
            name: pet.name,
            status: "active",
            colorTheme: pet.colorTheme,
            notes: "",
          } as FamilyMember)
        : "#D97706";
      return {
        id: pet.id,
        name: pet.name,
        type: pet.species === "dog" ? "Dog" : pet.species === "cat" ? "Cat" : "Pet",
        breed: pet.species,
        age: "",
        color,
        tasks: related.length > 0 ? related : ["No medication logged yet"],
      };
    });
}

export function mapHubNotifications(data: FamilyData): HubNotification[] {
  return [...(data.notifications ?? [])]
    .filter((n) => !n.dismissedAt)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 30)
    .map((n: HouseholdNotification) => ({
      id: n.id,
      title: n.title,
      body: n.body,
      time: formatRelativeTime(n.createdAt),
      unread: !n.readAt,
    }));
}

export function mapHubDocs(data: FamilyData): HubDoc[] {
  return data.docs.slice(0, 20).map((doc: DocItem) => ({
    id: doc.id,
    title: doc.title,
    body: doc.body || doc.content || "",
  }));
}

export function mapHubSubscriptions(vault: HouseholdVault): HubSubscription[] {
  return vault.subscriptions.map((s: VaultSubscription) => ({ ...s }));
}

export function mapHubPasswords(vault: HouseholdVault): HubPassword[] {
  return vault.passwords.map((p: VaultPassword) => ({ ...p }));
}

export function postFamilyMessage(
  data: FamilyData,
  text: string,
  authorMemberId?: string,
): FamilyData {
  const now = new Date().toISOString();
  const trimmed = text.trim();
  if (!trimmed) return data;
  const item: MessageBoardItem = {
    id: `msg-${Date.now()}`,
    title: trimmed.slice(0, 48),
    message: trimmed,
    category: "family",
    colorKey: "blue",
    priority: "normal",
    pinned: false,
    authorMemberId,
    createdAt: now,
    updatedAt: now,
  };
  return {
    ...data,
    messageBoard: [item, ...data.messageBoard],
  };
}

export function addChoreTask(
  data: FamilyData,
  title: string,
  assignedMemberId?: string,
): FamilyData {
  const trimmed = title.trim();
  if (!trimmed) return data;
  const today = new Date().toISOString().slice(0, 10);
  const member = data.familyMembers.find((m) => m.id === assignedMemberId);
  const task: Task = {
    id: `task-${Date.now()}`,
    title: trimmed,
    owner: member ? getMemberFullName(member) : "Family",
    status: "Today",
    priority: "Medium",
    dueDate: today,
    type: "chore",
    frequency: "one-time",
    lastCompletedDate: "",
    nextDueDate: today,
    assignedMemberId: assignedMemberId || "",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  return { ...data, tasks: [task, ...data.tasks] };
}

export function addPlannerEvent(
  data: FamilyData,
  input: { title: string; date?: string; time?: string; memberId?: string },
): FamilyData {
  const trimmed = input.title.trim();
  if (!trimmed) return data;
  const date = input.date || new Date().toISOString().slice(0, 10);
  const member = data.familyMembers.find((m) => m.id === input.memberId);
  const evt = {
    id: `plan-${Date.now()}`,
    title: trimmed,
    date,
    time: input.time || "17:00",
    category: "Family" as const,
    assignedMemberId: input.memberId || "",
    assignedPerson: member ? getMemberFullName(member) : "Family",
  };
  return { ...data, planner: [evt, ...data.planner] };
}

export function updateHouseholdName(data: FamilyData, name: string): FamilyData {
  const trimmed = name.trim();
  if (!trimmed) return data;
  return {
    ...data,
    adminSettings: {
      ...data.adminSettings,
      householdName: trimmed,
    },
  };
}

export function toggleShoppingPurchased(
  data: FamilyData,
  id: string,
): FamilyData {
  return {
    ...data,
    shopping: data.shopping.map((item) =>
      item.id === id
        ? {
            ...item,
            purchased: !item.purchased,
            updatedAt: new Date().toISOString(),
          }
        : item,
    ),
  };
}

export function deleteShoppingItem(data: FamilyData, id: string): FamilyData {
  return {
    ...data,
    shopping: data.shopping.filter((item) => item.id !== id),
  };
}

export function addShoppingItem(
  data: FamilyData,
  name: string,
  qty: string,
): FamilyData {
  const now = new Date().toISOString();
  const item: ShoppingItem = {
    id: `shop-${Date.now()}`,
    name,
    quantity: qty || "1",
    category: "Pantry",
    storeSection: "aisles",
    neededBy: now.slice(0, 10),
    purchased: false,
    destination: "Pantry",
    createdAt: now,
    updatedAt: now,
  };
  return { ...data, shopping: [item, ...data.shopping] };
}

export function updatePantryQuantity(
  data: FamilyData,
  id: string,
  qty: number,
): FamilyData {
  return {
    ...data,
    pantry: data.pantry.map((item) => {
      if (item.id !== id) return item;
      const max = parseQty(item.maxQuantity) || Math.max(qty * 2, 4);
      const status =
        qty <= 0 ? "Out" : qty / max < 0.25 ? "Low" : ("Stocked" as const);
      return {
        ...item,
        quantity: String(qty),
        status,
        lastUpdated: new Date().toISOString(),
      };
    }),
  };
}

export function addPantryItem(
  data: FamilyData,
  name: string,
  qty: string,
): FamilyData {
  const now = new Date().toISOString();
  const quantity = qty || "1";
  const item: PantryItem = {
    id: `pantry-${Date.now()}`,
    name,
    quantity,
    unit: "items",
    category: "Pantry",
    storageArea: "Pantry",
    location: "Pantry",
    status: "Stocked",
    isStaple: false,
    tags: [],
    lastUpdated: now,
    createdAt: now,
  };
  return { ...data, pantry: [item, ...data.pantry] };
}

export function toggleChoreDone(data: FamilyData, id: string): FamilyData {
  const today = new Date().toISOString().slice(0, 10);
  return {
    ...data,
    tasks: data.tasks.map((task: Task) => {
      if (task.id !== id) return task;
      const done = task.status === "Done" || task.status === "Completed";
      if (done) {
        return {
          ...task,
          status: "Today",
          lastCompletedDate: "",
          updatedAt: new Date().toISOString(),
        };
      }
      return {
        ...task,
        status: "Done",
        lastCompletedDate: today,
        lastCompletedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    }),
  };
}

export { readHouseholdVault, writeHouseholdVault, addVaultSubscription, addVaultPassword };
export type { HouseholdVault, FamilyData };
