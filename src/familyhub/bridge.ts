import type {
  FamilyData,
  FamilyMember,
  HouseholdNotification,
  HouseholdStorageLocation,
  MessageBoardItem,
  PantryItem,
  Pet,
  PetMedicationEntry,
  PetSpecies,
  ShoppingItem,
  Task,
  DocItem,
} from "../data/familyData";
import { WAKE_PAGE_MEMBER_DISPLAY_ORDER } from "../data/familyData";
import { resolveSessionMemberIdForUi } from "../lib/familyDataSelectors";
import { getMemberColor } from "../lib/memberColors";
import {
  computeFleaMedicationUiStatus,
  latestFleaEntryForPet,
  syncPetFleaDueNotifications,
} from "../lib/petFleaMedication";
import { getMemberFullName } from "../lib/utils";
import {
  addVaultSubscription,
  deleteVaultSubscription,
  readHouseholdVault,
  updateVaultSubscription,
  writeHouseholdVault,
  type HouseholdVault,
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
  /** Storage place display name (fridge, garage shelf, …). */
  place: string;
};

export type HubStoragePlace = {
  id: string;
  name: string;
  itemCount: number;
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
  /** Display label (Today / Tomorrow / Aug 12). */
  date: string;
  /** Canonical YYYY-MM-DD for calendar matching. */
  dateIso: string;
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
  fleaStatus: "none" | "upToDate" | "dueSoon" | "dueToday" | "overdue";
};

export type HubEmergencyItem = {
  id: string;
  cat: "Contacts" | "Medical" | "Preparedness";
  label: string;
  value: string;
  editable: boolean;
  memberId?: string;
  field?: "allergies" | "emergencyContact";
  docId?: string;
};

export type HubSubscription = {
  id: string;
  name: string;
  password: string;
  payerMemberId: string;
  payerName: string;
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

function pantryPlaceName(item: PantryItem): string {
  const detail = item.locationDetail?.trim();
  if (detail) return detail;
  if (item.location?.trim()) return item.location.trim();
  if (item.storageArea?.trim()) return item.storageArea.trim();
  return "Pantry";
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
        place: pantryPlaceName(item),
      };
    });
}

const DEFAULT_STORAGE_PLACE_NAMES = [
  "Kitchen Fridge",
  "Kitchen Freezer",
  "Pantry",
  "Kitchen Cabinets",
  "Laundry Room Freezer",
  "Garage",
] as const;

export function mapHubStoragePlaces(data: FamilyData): HubStoragePlace[] {
  const items = mapHubPantry(data);
  const places = [...(data.storageLocations ?? [])];
  if (places.length === 0) {
    for (const name of DEFAULT_STORAGE_PLACE_NAMES) {
      places.push({
        id: `place-${name.toLowerCase().replace(/\s+/g, "-")}`,
        name,
        storageArea: name.includes("Fridge")
          ? "Kitchen Fridge"
          : name.includes("Freezer")
            ? "Kitchen Freezer"
            : name === "Pantry"
              ? "Pantry"
              : "Custom Location",
        createdAt: "",
        updatedAt: "",
      });
    }
  }
  // Include any place names that exist on items but not in the catalog.
  const known = new Set(places.map((p) => p.name.trim().toLowerCase()));
  for (const item of items) {
    const key = item.place.trim().toLowerCase();
    if (!key || known.has(key)) continue;
    known.add(key);
    places.push({
      id: `place-auto-${key.replace(/\s+/g, "-")}`,
      name: item.place,
      storageArea: "Custom Location",
      createdAt: "",
      updatedAt: "",
    });
  }
  return places.map((p) => ({
    id: p.id,
    name: p.name,
    itemCount: items.filter(
      (i) => i.place.trim().toLowerCase() === p.name.trim().toLowerCase(),
    ).length,
  }));
}

export function addStoragePlace(data: FamilyData, name: string): FamilyData {
  const trimmed = name.trim();
  if (!trimmed) return data;
  const exists = (data.storageLocations ?? []).some(
    (p) => p.name.trim().toLowerCase() === trimmed.toLowerCase(),
  );
  if (exists) return data;
  const now = new Date().toISOString();
  const place: HouseholdStorageLocation = {
    id: `place-${Date.now()}`,
    name: trimmed,
    storageArea: "Custom Location",
    createdAt: now,
    updatedAt: now,
  };
  // Ensure defaults are persisted the first time the household customizes places.
  const base =
    (data.storageLocations ?? []).length > 0
      ? data.storageLocations
      : DEFAULT_STORAGE_PLACE_NAMES.map((n, i) => ({
          id: `place-seed-${i}`,
          name: n,
          storageArea: (n.includes("Fridge")
            ? "Kitchen Fridge"
            : n.includes("Freezer")
              ? "Kitchen Freezer"
              : n === "Pantry"
                ? "Pantry"
                : "Custom Location") as HouseholdStorageLocation["storageArea"],
          createdAt: now,
          updatedAt: now,
        }));
  return { ...data, storageLocations: [...base, place] };
}

export function setPantryItemPlace(
  data: FamilyData,
  itemId: string,
  placeName: string,
): FamilyData {
  const trimmed = placeName.trim() || "Pantry";
  return {
    ...data,
    pantry: data.pantry.map((item) =>
      item.id === itemId
        ? {
            ...item,
            location: "Custom Location",
            storageArea: "Custom Location",
            locationDetail: trimmed,
            lastUpdated: new Date().toISOString(),
          }
        : item,
    ),
  };
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
  return [...data.planner]
    .filter((evt) => Boolean(evt.date))
    .sort((a, b) => {
      const byDate = a.date.localeCompare(b.date);
      if (byDate !== 0) return byDate;
      return (a.time || "").localeCompare(b.time || "");
    })
    .map((evt, index) => {
      const member = members.find((m) => m.id === evt.assignedMemberId);
      return {
        id: evt.id,
        title: evt.title,
        date: formatDueLabel(evt.date),
        dateIso: evt.date,
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

function fleaStatusLabel(
  status: ReturnType<typeof computeFleaMedicationUiStatus>,
): string {
  switch (status) {
    case "upToDate":
      return "Flea med · up to date";
    case "dueSoon":
      return "Flea med · due soon";
    case "dueToday":
      return "Flea med · DUE TODAY";
    case "overdue":
      return "Flea med · OVERDUE";
    default:
      return "No flea medication logged yet";
  }
}

export function mapHubPets(data: FamilyData): HubPet[] {
  const meds = data.petMedicationEntries ?? [];
  return (data.pets ?? [])
    .filter((pet) => pet.active !== false)
    .map((pet) => {
      const latest = latestFleaEntryForPet(pet.id, meds);
      const fleaStatus = computeFleaMedicationUiStatus(latest?.givenAt);
      const tasks = [fleaStatusLabel(fleaStatus)];
      if (latest) {
        tasks.push(`Last dose · ${formatDueLabel(latest.givenAt.slice(0, 10))}`);
      }
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
        breed: pet.species === "dog" ? "Dog" : pet.species === "cat" ? "Cat" : "Other",
        age: "",
        color,
        tasks,
        fleaStatus,
      };
    });
}

export function mapHubEmergency(data: FamilyData): HubEmergencyItem[] {
  const items: HubEmergencyItem[] = [
    {
      id: "static-911",
      cat: "Contacts",
      label: "Emergency services",
      value: "911",
      editable: false,
    },
    {
      id: "static-poison",
      cat: "Contacts",
      label: "Poison Control",
      value: "1-800-222-1222",
      editable: false,
    },
  ];

  for (const member of data.familyMembers.filter((m) => m.status !== "archived")) {
    const name = getMemberFullName(member);
    if (member.emergencyContact?.trim()) {
      items.push({
        id: `ice-${member.id}`,
        cat: "Contacts",
        label: `${name} — ICE contact`,
        value: member.emergencyContact.trim(),
        editable: true,
        memberId: member.id,
        field: "emergencyContact",
      });
    }
    if (member.allergies?.trim()) {
      items.push({
        id: `allergy-${member.id}`,
        cat: "Medical",
        label: `${name} — allergies`,
        value: member.allergies.trim(),
        editable: true,
        memberId: member.id,
        field: "allergies",
      });
    }
    const blood = member.notes?.match(/blood\s*type\s*[:\-]?\s*(.+)/i)?.[1]?.trim();
    if (blood) {
      items.push({
        id: `blood-${member.id}`,
        cat: "Medical",
        label: `${name} — blood type`,
        value: blood,
        editable: false,
        memberId: member.id,
      });
    }
  }

  for (const doc of data.docs.filter((d) => d.category === "emergency")) {
    items.push({
      id: `doc-${doc.id}`,
      cat: "Preparedness",
      label: doc.title,
      value: (doc.body || doc.content || "").trim() || "—",
      editable: true,
      docId: doc.id,
    });
  }

  return items;
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

export function mapHubSubscriptions(
  vault: HouseholdVault,
  data: FamilyData,
): HubSubscription[] {
  return vault.subscriptions.map((s: VaultSubscription) => ({
    id: s.id,
    name: s.name,
    password: s.password,
    payerMemberId: s.payerMemberId,
    payerName: s.payerMemberId
      ? memberNameById(data.familyMembers, s.payerMemberId)
      : "Unassigned",
    color: s.color,
  }));
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
  const date = input.date?.trim() || new Date().toISOString().slice(0, 10);
  const member = data.familyMembers.find((m) => m.id === input.memberId);
  const evt = {
    id: `plan-${Date.now()}`,
    title: trimmed,
    date,
    time: input.time?.trim() || "17:00",
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
  placeName?: string,
): FamilyData {
  const now = new Date().toISOString();
  const quantity = qty || "1";
  const place = placeName?.trim() || "Pantry";
  const knownArea = (
    [
      "Kitchen Fridge",
      "Kitchen Freezer",
      "Kitchen Cabinets",
      "Pantry",
      "Laundry Room Fridge",
      "Laundry Room Freezer",
      "Family Room Freezer",
    ] as const
  ).find((a) => a.toLowerCase() === place.toLowerCase());
  const item: PantryItem = {
    id: `pantry-${Date.now()}`,
    name,
    quantity,
    unit: "items",
    category: "Pantry",
    storageArea: knownArea ?? "Custom Location",
    location: knownArea ?? "Custom Location",
    locationDetail: knownArea ? undefined : place,
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

export function setActiveMember(data: FamilyData, memberId: string): FamilyData {
  if (!data.familyMembers.some((m) => m.id === memberId && m.status !== "archived")) {
    return data;
  }
  return {
    ...data,
    adminSettings: {
      ...data.adminSettings,
      activeMemberId: memberId,
    },
  };
}

export function addFamilyMember(data: FamilyData, name: string): FamilyData {
  const trimmed = name.trim();
  if (!trimmed) return data;
  const themes = ["rose", "blue", "purple", "green", "orange", "slate"] as const;
  const member: FamilyMember = {
    id: `member-${Date.now()}`,
    name: trimmed,
    status: "active",
    colorTheme: themes[data.familyMembers.length % themes.length] ?? "slate",
    notes: "",
    updatedAt: new Date().toISOString(),
  };
  return { ...data, familyMembers: [...data.familyMembers, member] };
}

export function updateMemberField(
  data: FamilyData,
  memberId: string,
  patch: Partial<Pick<FamilyMember, "allergies" | "emergencyContact" | "notes" | "name">>,
): FamilyData {
  return {
    ...data,
    familyMembers: data.familyMembers.map((m) =>
      m.id === memberId
        ? { ...m, ...patch, updatedAt: new Date().toISOString() }
        : m,
    ),
  };
}

export function addPreparednessNote(
  data: FamilyData,
  title: string,
  body: string,
): FamilyData {
  const t = title.trim();
  const b = body.trim();
  if (!t || !b) return data;
  const now = new Date().toISOString();
  const doc: DocItem = {
    id: `doc-${Date.now()}`,
    title: t,
    content: b,
    body: b,
    category: "emergency",
    tags: ["preparedness"],
    pinned: false,
    relatedMemberIds: [],
    relatedProjectId: "",
    visibility: "household",
    createdAt: now,
    updatedAt: now,
    source: "manual",
  };
  return { ...data, docs: [doc, ...data.docs] };
}

export function updatePreparednessNote(
  data: FamilyData,
  docId: string,
  value: string,
): FamilyData {
  const trimmed = value.trim();
  if (!trimmed) return data;
  return {
    ...data,
    docs: data.docs.map((doc) =>
      doc.id === docId
        ? { ...doc, body: trimmed, content: trimmed, updatedAt: new Date().toISOString() }
        : doc,
    ),
  };
}

export function addPet(
  data: FamilyData,
  name: string,
  species: PetSpecies = "cat",
): FamilyData {
  const trimmed = name.trim();
  if (!trimmed) return data;
  const now = new Date().toISOString();
  const themes = ["orange", "rose", "blue", "green", "purple", "slate"] as const;
  const pet: Pet = {
    id: `pet-${Date.now()}`,
    name: trimmed,
    species,
    colorTheme: themes[(data.pets?.length ?? 0) % themes.length],
    active: true,
    createdAt: now,
    updatedAt: now,
  };
  return { ...data, pets: [...(data.pets ?? []), pet] };
}

export function updatePet(
  data: FamilyData,
  petId: string,
  patch: Partial<Pick<Pet, "name" | "species">>,
): FamilyData {
  return {
    ...data,
    pets: (data.pets ?? []).map((pet) =>
      pet.id === petId
        ? { ...pet, ...patch, updatedAt: new Date().toISOString() }
        : pet,
    ),
  };
}

export function logPetFleaDose(
  data: FamilyData,
  petId: string,
  givenByMemberId?: string,
): FamilyData {
  if (!(data.pets ?? []).some((p) => p.id === petId && p.active !== false)) return data;
  const now = new Date().toISOString();
  const entry: PetMedicationEntry = {
    id: `petmed-${Date.now()}`,
    petId,
    medicationType: "flea",
    givenAt: now,
    givenByMemberId: givenByMemberId || resolveSessionMemberIdForUi(data),
    createdAt: now,
    updatedAt: now,
  };
  return syncPetFleaDueNotifications({
    ...data,
    petMedicationEntries: [...(data.petMedicationEntries ?? []), entry],
  });
}

export function markNotificationRead(data: FamilyData, id: string): FamilyData {
  const now = new Date().toISOString();
  return {
    ...data,
    notifications: (data.notifications ?? []).map((n) =>
      n.id === id && !n.readAt ? { ...n, readAt: now } : n,
    ),
  };
}

export function dismissNotification(data: FamilyData, id: string): FamilyData {
  const now = new Date().toISOString();
  return {
    ...data,
    notifications: (data.notifications ?? []).map((n) =>
      n.id === id ? { ...n, dismissedAt: now, readAt: n.readAt || now } : n,
    ),
  };
}

export function sessionMemberId(data: FamilyData): string | undefined {
  return resolveSessionMemberIdForUi(data);
}

export {
  readHouseholdVault,
  writeHouseholdVault,
  addVaultSubscription,
  updateVaultSubscription,
  deleteVaultSubscription,
};
export type { HouseholdVault, FamilyData };
