import React, { createContext, useContext, useMemo, useState, useEffect, useRef } from 'react';
import {
  Home, MessageSquare, Calendar, ShoppingCart, Package,
  Wrench, Heart, CreditCard,
  BookOpen, Settings, Plus, ScanLine,
  Bell, Search, X, Check, ChevronRight,
  Trash2, AlertCircle, Menu, ChevronDown,
  Users, List, Image, Layers, RefreshCw,
  Edit2, Archive, ShieldAlert,
  PawPrint, CalendarCheck, Bookmark, Key, FileText,
  Monitor, Tablet, AlertTriangle,
} from 'lucide-react';
import type { Project } from '../data/familyData';
import { useFamilyData } from '../hooks/useFamilyData';
import {
  addChoreTask,
  addFamilyMember as bridgeAddMember,
  addPantryItem as bridgeAddPantry,
  addPet as bridgeAddPet,
  addPlannerEvent,
  addPreparednessNote,
  addShoppingItem as bridgeAddShopping,
  addStoragePlace as bridgeAddStoragePlace,
  addVaultSubscription,
  deleteShoppingItem as bridgeDeleteShopping,
  deleteVaultSubscription,
  dismissNotification as bridgeDismissNotification,
  logPetFleaDose,
  mapHubChores,
  mapHubDocs,
  mapHubEmergency,
  mapHubEvents,
  mapHubMembers,
  mapHubMessages,
  mapHubNotifications,
  mapHubPantry,
  mapHubPets,
  mapHubShopping,
  mapHubStoragePlaces,
  mapHubSubscriptions,
  markNotificationRead as bridgeMarkNotificationRead,
  postFamilyMessage,
  readHouseholdVault,
  sessionMemberId,
  setActiveMember as bridgeSetActiveMember,
  setPantryItemPlace as bridgeSetPantryItemPlace,
  toggleChoreDone as bridgeToggleChore,
  toggleShoppingPurchased,
  updateHouseholdName,
  updateMemberField,
  updatePantryQuantity,
  updatePet as bridgeUpdatePet,
  updatePreparednessNote,
  updateVaultSubscription,
  writeHouseholdVault,
  type HubChore,
  type HubDoc,
  type HubEmergencyItem,
  type HubEvent,
  type HubMember,
  type HubMessage,
  type HubNotification,
  type HubPantryItem,
  type HubPet,
  type HubShoppingItem,
  type HubStoragePlace,
  type HubSubscription,
} from './bridge';

// ── Types ─────────────────────────────────────────────────────────────────────

type PreviewMode = 'desktop' | 'app';

type View =
  | 'home' | 'messages' | 'calendar' | 'shopping' | 'pantry'
  | 'cleaning' | 'emergency' | 'pets' | 'subscriptions'
  | 'projects' | 'photos' | 'routines'
  | 'planner' | 'family' | 'notifications' | 'docs' | 'settings'
  | 'wall';

const PREVIEW_STORAGE_KEY = '491wd-preview-mode';

type HubContextValue = {
  members: HubMember[];
  shoppingItems: HubShoppingItem[];
  pantryItems: HubPantryItem[];
  storagePlaces: HubStoragePlace[];
  chores: HubChore[];
  events: HubEvent[];
  messages: HubMessage[];
  pets: HubPet[];
  emergencyItems: HubEmergencyItem[];
  subscriptions: HubSubscription[];
  notifications: HubNotification[];
  docs: HubDoc[];
  projects: Project[];
  badges: { messages: number; shopping: number; pantry: number; notifications: number };
  setPreviewMode?: (mode: PreviewMode) => void;
  previewMode?: PreviewMode;
  activeMemberId?: string;
  toggleShoppingItem: (id: string) => void;
  deleteShoppingItem: (id: string) => void;
  addShoppingItem: (name: string, qty: string) => void;
  updatePantryStock: (id: string, qty: number) => void;
  addPantryItem: (name: string, qty: string, place?: string) => void;
  addStoragePlace: (name: string) => void;
  setPantryItemPlace: (itemId: string, placeName: string) => void;
  toggleChore: (id: string) => void;
  postMessage: (text: string) => void;
  addSubscription: (name: string, password: string, payerMemberId: string) => void;
  updateSubscription: (id: string, patch: { name?: string; password?: string; payerMemberId?: string }) => void;
  removeSubscription: (id: string) => void;
  addChore: (title: string, memberId?: string) => void;
  addEvent: (input: { title: string; date?: string; time?: string; memberId?: string }) => void;
  setActiveMember: (memberId: string) => void;
  addFamilyMember: (name: string) => void;
  updateMemberMedical: (memberId: string, field: 'allergies' | 'emergencyContact', value: string) => void;
  addEmergencyNote: (title: string, body: string) => void;
  updateEmergencyNote: (docId: string, value: string) => void;
  addPet: (name: string, species: 'cat' | 'dog' | 'other') => void;
  renamePet: (petId: string, name: string) => void;
  logFleaDose: (petId: string) => void;
  markNotificationRead: (id: string) => void;
  dismissNotification: (id: string) => void;
  householdName: string;
  setHouseholdName: (name: string) => void;
  navigate: (view: View) => void;
};

const HubContext = createContext<HubContextValue | null>(null);

function useHub(): HubContextValue {
  const ctx = useContext(HubContext);
  if (!ctx) throw new Error('useHub must be used inside FamilyHub');
  return ctx;
}


interface NavItem {
  id: View;
  label: string;
  icon: React.ElementType;
  color: string;
  badge?: number;
}

// ── Data ──────────────────────────────────────────────────────────────────────

/* FAMILY_MEMBERS served via useHub().members */

const CATEGORY_COLORS: Record<string, string> = {
  Dairy: '#0EA5E9', Bakery: '#F59E0B', Produce: '#10B981',
  Meat: '#EF4444', Beverages: '#8B5CF6', Pantry: '#6B7280',
  Frozen: '#06B6D4', Snacks: '#EC4899', Baking: '#D97706',
  Grains: '#92400E', Canned: '#64748B', Oils: '#F97316',
  Condiments: '#14B8A6', Household: '#6366F1',
};

/* EVENTS via useHub */

/* MESSAGES via useHub */

/* CHORES via useHub */

/* PETS via useHub */

/* SUBSCRIPTIONS via useHub */

/* PASSWORDS via useHub */



// ── Shared UI ─────────────────────────────────────────────────────────────────

function Badge({ children, color = '#4F46E5', light = false }: { children: React.ReactNode; color?: string; light?: boolean }) {
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
      style={light
        ? { backgroundColor: color + '18', color }
        : { backgroundColor: color, color: '#fff' }
      }
    >
      {children}
    </span>
  );
}

function Card({ children, className = '', onClick }: { children: React.ReactNode; className?: string; onClick?: () => void }) {
  return (
    <div
      onClick={onClick}
      className={`figma-card ${onClick ? 'figma-card-hover' : ''} ${className}`}
    >
      {children}
    </div>
  );
}

function StockBar({ qty, max, status }: { qty: number; max: number; status: string }) {
  const pct = max > 0 ? Math.min((qty / max) * 100, 100) : 0;
  const barColor = status === 'out' ? '#EF4444' : status === 'low' ? '#F59E0B' : '#10B981';
  return (
    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden w-full">
      <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: barColor }} />
    </div>
  );
}

function StatusChip({ status }: { status: string }) {
  if (status === 'out')  return <span className="figma-chip figma-chip-rose">Out</span>;
  if (status === 'low')  return <span className="figma-chip figma-chip-amber">Low</span>;
  if (status === 'ok')   return <span className="figma-chip figma-chip-blue">OK</span>;
  return <span className="figma-chip figma-chip-green">Good</span>;
}

function MemberDot({ name, color, bg, size = 'md' }: { name: string; color: string; bg: string; size?: 'sm' | 'md' | 'lg' }) {
  const initials = name.slice(0, 1).toUpperCase();
  const sz = size === 'lg' ? 'w-11 h-11 text-base' : size === 'sm' ? 'w-6 h-6 text-xs' : 'w-8 h-8 text-sm';
  return (
    <span className={`${sz} rounded-full flex items-center justify-center font-semibold flex-shrink-0`} style={{ backgroundColor: bg, color }}>
      {initials}
    </span>
  );
}

// ── Sidebar (Figma reference mauve chrome) ────────────────────────────────────

const HOME_NAV: NavItem[] = [
  { id: 'home', label: 'Home', icon: Home, color: '#8B5A7C' },
];

const PLANNING_NAV: NavItem[] = [
  { id: 'messages', label: 'Messages', icon: MessageSquare, color: '#8B5A7C' },
  { id: 'calendar', label: 'Calendar', icon: Calendar, color: '#8B5A7C' },
  { id: 'cleaning', label: 'Cleaning / Kitchen', icon: Wrench, color: '#8B5A7C' },
  { id: 'emergency', label: 'Emergency Planning', icon: ShieldAlert, color: '#8B5A7C' },
  { id: 'planner', label: 'Planner', icon: CalendarCheck, color: '#8B5A7C' },
];

const HOUSEHOLD_NAV: NavItem[] = [
  { id: 'shopping', label: 'Shopping', icon: ShoppingCart, color: '#8B5A7C' },
  { id: 'pantry', label: 'Pantry & Inventory', icon: Package, color: '#8B5A7C' },
  { id: 'pets', label: 'Pets', icon: PawPrint, color: '#8B5A7C' },
  { id: 'subscriptions', label: 'Subscriptions', icon: CreditCard, color: '#8B5A7C' },
  { id: 'family', label: 'Family Members', icon: Users, color: '#8B5A7C' },
  { id: 'notifications', label: 'Notifications', icon: Bell, color: '#8B5A7C' },
  { id: 'docs', label: 'Docs & Help', icon: FileText, color: '#8B5A7C' },
];

const COLLECTIONS_NAV: NavItem[] = [
  { id: 'projects', label: 'Projects', icon: Layers, color: '#8B5A7C' },
  { id: 'photos', label: 'Photos', icon: Image, color: '#8B5A7C' },
  { id: 'routines', label: 'Routines', icon: RefreshCw, color: '#8B5A7C' },
];

const ACCOUNT_NAV: NavItem[] = [
  { id: 'settings', label: 'Settings', icon: Settings, color: '#8B5A7C' },
  { id: 'wall', label: 'Wall display', icon: Monitor, color: '#8B5A7C' },
];

function Sidebar({ current, onChange, collapsed, onToggle }: {
  current: View; onChange: (v: View) => void; collapsed: boolean; onToggle: () => void;
}) {
  const {
    members: FAMILY_MEMBERS,
    badges,
    householdName,
    activeMemberId,
    setActiveMember,
    setPreviewMode,
  } = useHub();

  const withBadges = (items: NavItem[]) =>
    items.map((item) => {
      if (item.id === 'messages' && badges.messages > 0) return { ...item, badge: badges.messages };
      if (item.id === 'shopping' && badges.shopping > 0) return { ...item, badge: badges.shopping };
      if (item.id === 'pantry' && badges.pantry > 0) return { ...item, badge: badges.pantry };
      if (item.id === 'notifications' && badges.notifications > 0) {
        return { ...item, badge: badges.notifications };
      }
      return item;
    });

  const sections: { label: string; items: NavItem[] }[] = [
    { label: 'Primary', items: withBadges(HOME_NAV) },
    { label: 'Planning', items: withBadges(PLANNING_NAV) },
    { label: 'Household', items: withBadges(HOUSEHOLD_NAV) },
    { label: 'Collections', items: withBadges(COLLECTIONS_NAV) },
    { label: 'Account', items: withBadges(ACCOUNT_NAV) },
  ];

  const activeMember = FAMILY_MEMBERS.find((m) => m.id === activeMemberId) || FAMILY_MEMBERS[0];

  function NavLink({ item }: { item: NavItem }) {
    const active = current === item.id || (item.id === 'wall' && current === 'home' && false);
    const Icon = item.icon;
    return (
      <button
        type="button"
        onClick={() => {
          if (item.id === 'wall') {
            setPreviewMode?.('app');
            onChange('home');
            return;
          }
          onChange(item.id);
        }}
        className={`figma-sidebar-item ${active ? 'figma-sidebar-item-active' : ''}`}
        title={collapsed ? item.label : undefined}
      >
        <Icon size={20} className="flex-shrink-0" />
        {!collapsed && <span className="flex-1 truncate">{item.label}</span>}
        {!collapsed && item.badge != null && item.badge > 0 && !active && (
          <span className="figma-chip figma-chip-mauve">{item.badge}</span>
        )}
        {collapsed && item.badge != null && item.badge > 0 && !active && (
          <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#8B5A7C]" />
        )}
      </button>
    );
  }

  return (
    <aside className={`figma-sidebar ${collapsed ? 'is-collapsed' : ''}`}>
      <div className="figma-sidebar-brand flex items-start gap-2">
        <div className="min-w-0 flex-1">
          {!collapsed ? (
            <>
              <div className="figma-sidebar-brand-title">FamilyHub</div>
              <div className="figma-sidebar-brand-sub truncate">{householdName}</div>
            </>
          ) : (
            <div className="figma-sidebar-avatar mx-auto">FH</div>
          )}
        </div>
        <button
          type="button"
          onClick={onToggle}
          className="text-[#9CA3AF] hover:text-[#111827] transition-colors flex-shrink-0 p-1"
          aria-label="Toggle sidebar"
        >
          <Menu size={18} />
        </button>
      </div>

      <nav className="figma-sidebar-nav">
        {sections.map((section) => (
          <div key={section.label} className="figma-sidebar-section">
            {!collapsed && <div className="figma-sidebar-section-label">{section.label}</div>}
            {section.items.map((item) => (
              <NavLink key={item.id} item={item} />
            ))}
          </div>
        ))}
      </nav>

      {!collapsed && (
        <div className="figma-sidebar-footer">
          <div className="flex items-center gap-3 mb-3">
            <div className="figma-sidebar-avatar">
              {(activeMember?.name || 'F').slice(0, 1)}
            </div>
            <div className="min-w-0">
              <p className="text-sm text-[#111827] truncate">{activeMember?.name || 'Family'}</p>
              <p className="text-xs text-[#9CA3AF]">Using this device</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {FAMILY_MEMBERS.map((m) => {
              const active = m.id === activeMemberId;
              return (
                <button
                  key={m.id}
                  type="button"
                  title={`Switch to ${m.name}`}
                  onClick={() => setActiveMember(m.id)}
                  className={`rounded-full transition-all ${active ? 'ring-2 ring-offset-1 ring-[#8B5A7C]' : 'opacity-80 hover:opacity-100'}`}
                >
                  <MemberDot name={m.name} color={m.color} bg={m.bg} size="sm" />
                </button>
              );
            })}
          </div>
        </div>
      )}
    </aside>
  );
}

// ── Quick Add Modal ───────────────────────────────────────────────────────────

function QuickAddModal({ mode, onClose, onAdd }: {
  mode: 'shopping' | 'pantry'; onClose: () => void; onAdd: (item: string, qty: string) => void;
}) {
  const [item, setItem] = useState('');
  const [qty, setQty] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => { inputRef.current?.focus(); }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (item.trim()) { onAdd(item.trim(), qty.trim() || '1'); onClose(); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/30 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl p-6" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="font-semibold text-stone-900 text-lg">
              {mode === 'shopping' ? 'Add to Shopping' : 'Add to Inventory'}
            </h3>
            <p className="text-sm text-stone-500 mt-0.5">
              {mode === 'shopping' ? 'Item added to current list' : 'Update pantry stock'}
            </p>
          </div>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-700 p-1">
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="text-xs font-semibold text-stone-500 uppercase tracking-wide mb-1 block">Item name</label>
            <input
              ref={inputRef}
              value={item}
              onChange={e => setItem(e.target.value)}
              placeholder="e.g. Oat milk, Laundry detergent…"
              className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-stone-500 uppercase tracking-wide mb-1 block">Quantity</label>
            <input
              value={qty}
              onChange={e => setQty(e.target.value)}
              placeholder="e.g. 2 gallons, 1 box…"
              className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            />
          </div>
          <button
            type="submit"
            className="w-full py-3 rounded-xl text-white font-semibold text-sm mt-2 transition-opacity hover:opacity-90"
            style={{ backgroundColor: mode === 'shopping' ? '#10B981' : '#84CC16' }}
          >
            Add Item
          </button>
        </form>
      </div>
    </div>
  );
}

// ── Home / Wake Page ──────────────────────────────────────────────────────────

function Clock() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  const h = now.getHours() % 12 || 12;
  const m = now.getMinutes().toString().padStart(2, '0');
  const ampm = now.getHours() >= 12 ? 'PM' : 'AM';
  const day = now.toLocaleDateString('en-US', { weekday: 'long' });
  const date = now.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  return (
    <div>
      <div className="flex items-end gap-2 leading-none">
        <span className="figma-home-clock">{h}:{m}</span>
        <span className="figma-home-clock-ampm">{ampm}</span>
      </div>
      <div className="text-[var(--text-muted)] text-sm mt-2">{day}, {date}</div>
    </div>
  );
}

function todayIsoLocal(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function toIsoLocal(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function HomeView({ onNavigate, onQuickAdd, shoppingItems, pantryItems, chores, onToggleChore }: {
  onNavigate: (v: View) => void;
  onQuickAdd: (mode: 'shopping' | 'pantry') => void;
  shoppingItems: HubShoppingItem[];
  pantryItems: HubPantryItem[];
  chores: HubChore[];
  onToggleChore: (id: string) => void;
}) {
  const {
    members: FAMILY_MEMBERS,
    messages: MESSAGES,
    events: EVENTS,
    pets,
    activeMemberId,
    setActiveMember,
  } = useHub();
  const unchecked = shoppingItems.filter(i => !i.checked);
  const alerts = pantryItems.filter(i => i.status === 'out' || i.status === 'low');
  const outCount = pantryItems.filter(i => i.status === 'out').length;
  const lowCount = pantryItems.filter(i => i.status === 'low').length;
  const todayIso = todayIsoLocal();
  const todayChores = chores.filter(c => c.due === 'Today');
  const todayEvents = EVENTS.filter(e => e.dateIso === todayIso);
  const petAlerts = pets.filter(p => p.fleaStatus === 'dueToday' || p.fleaStatus === 'overdue' || p.fleaStatus === 'dueSoon');
  const upcomingEvents = EVENTS.filter(e => e.dateIso >= todayIso).slice(0, 4);
  const unreadMessages = MESSAGES.filter(m => !m.read);
  const activeName = FAMILY_MEMBERS.find(m => m.id === activeMemberId)?.name;

  return (
    <div className="figma-page space-y-6">
      <div className="figma-page-header">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)] mb-2">Family Hub</p>
          <h1 className="figma-page-title">Home</h1>
          <p className="figma-page-subtitle">Household command center for today</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <span className="figma-chip figma-chip-blue">{todayChores.length} chores today</span>
          <span className="figma-chip figma-chip-amber">{todayEvents.length} events today</span>
          {petAlerts.length > 0 && (
            <span className="figma-chip figma-chip-rose">{petAlerts.length} pet med alerts</span>
          )}
          {activeName && (
            <span className="figma-chip figma-chip-mauve">Signed in as {activeName}</span>
          )}
        </div>
      </div>

      <Card className="p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <Clock />
          <div className="text-sm text-[var(--text-muted)] max-w-xs sm:text-right">
            Soft mauve dashboard for planning, shopping, pantry, and chores — live household data.
          </div>
        </div>
      </Card>

      <div>
        <div className="figma-sidebar-section-label mb-3">Who's checking in?</div>
        <div className="flex gap-3 flex-wrap">
          {FAMILY_MEMBERS.map(m => {
            const active = m.id === activeMemberId;
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => setActiveMember(m.id)}
                className={`figma-checkin ${active ? 'is-active' : ''}`}
              >
                <MemberDot name={m.name} color="#8B5A7C" bg="#F5E6F1" size="sm" />
                <span>{m.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Today strip */}
      {(todayEvents.length > 0 || petAlerts.length > 0) && (
        <Card className="p-4">
          <div className="text-xs font-semibold uppercase tracking-widest text-stone-400 mb-2">Today</div>
          <div className="space-y-2">
            {todayEvents.map((evt) => (
              <button
                key={evt.id}
                type="button"
                onClick={() => onNavigate('calendar')}
                className="w-full flex items-center gap-3 text-left"
              >
                <div className="w-1 h-8 rounded-full flex-shrink-0" style={{ backgroundColor: evt.color }} />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-stone-800 truncate">{evt.title}</div>
                  <div className="text-xs text-stone-400">{evt.time} · {evt.who}</div>
                </div>
              </button>
            ))}
            {petAlerts.map((pet) => (
              <button
                key={pet.id}
                type="button"
                onClick={() => onNavigate('pets')}
                className="w-full flex items-center gap-3 text-left"
              >
                <PawPrint size={14} className="text-orange-500 flex-shrink-0" />
                <div className="text-sm text-stone-700 truncate">{pet.name}: {pet.tasks[0]}</div>
              </button>
            ))}
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button type="button" onClick={() => onQuickAdd('shopping')} className="figma-button-primary justify-start px-5 py-4 rounded-[22px]">
          <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
            <Plus size={18} />
          </div>
          <div className="text-left">
            <div>Add to Shopping</div>
            <div className="text-xs text-white/75 font-normal">{unchecked.length} items in list</div>
          </div>
        </button>
        <button type="button" onClick={() => onQuickAdd('pantry')} className="figma-button-secondary justify-start px-5 py-4 rounded-[22px]">
          <div className="figma-icon-tile !w-9 !h-9">
            <Plus size={18} />
          </div>
          <div className="text-left">
            <div className="font-semibold">Add to Inventory</div>
            <div className="text-xs text-[var(--text-muted)]">{alerts.length} items need attention</div>
          </div>
        </button>
      </div>

      {/* Dashboard grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

        {/* Shopping preview */}
        <Card className="p-4 col-span-1" onClick={() => onNavigate('shopping')}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#10B98118' }}>
                <ShoppingCart size={14} style={{ color: '#10B981' }} />
              </div>
              <span className="font-semibold text-stone-900 text-sm">Shopping List</span>
            </div>
            <ChevronRight size={16} className="text-stone-300" />
          </div>
          <div className="space-y-1.5 mb-3">
            {unchecked.slice(0, 4).map(item => (
              <div key={item.id} className="flex items-center gap-2 text-sm text-stone-600">
                <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: CATEGORY_COLORS[item.category] || '#94a3b8' }} />
                <span className="truncate">{item.name}</span>
                <span className="text-xs text-stone-400 ml-auto flex-shrink-0">{item.qty}</span>
              </div>
            ))}
          </div>
          {unchecked.length > 4 && (
            <div className="text-xs text-stone-400">+{unchecked.length - 4} more items</div>
          )}
          <div className="mt-3 pt-3 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
            <span>{unchecked.length} remaining</span>
            <span style={{ color: '#10B981' }} className="font-medium">{shoppingItems.filter(i=>i.checked).length} checked off</span>
          </div>
        </Card>

        {/* Pantry alerts */}
        <Card className="p-4" onClick={() => onNavigate('pantry')}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-amber-50">
                <AlertCircle size={14} className="text-amber-500" />
              </div>
              <span className="font-semibold text-stone-900 text-sm">Pantry Alerts</span>
            </div>
            <ChevronRight size={16} className="text-stone-300" />
          </div>
          <div className="flex gap-3 mb-3">
            <div className="flex-1 bg-red-50 rounded-xl p-3 text-center">
              <div className="text-2xl font-bold text-red-500">{outCount}</div>
              <div className="text-xs text-red-400 font-medium mt-0.5">Out of stock</div>
            </div>
            <div className="flex-1 bg-amber-50 rounded-xl p-3 text-center">
              <div className="text-2xl font-bold text-amber-500">{lowCount}</div>
              <div className="text-xs text-amber-400 font-medium mt-0.5">Running low</div>
            </div>
          </div>
          <div className="space-y-1.5">
            {alerts.slice(0, 3).map(item => (
              <div key={item.id} className="flex items-center justify-between text-sm">
                <span className="text-stone-600 truncate">{item.name}</span>
                <StatusChip status={item.status} />
              </div>
            ))}
          </div>
        </Card>

        {/* Today's chores */}
        <Card className="p-4" onClick={() => onNavigate('cleaning')}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-sky-50">
                <Wrench size={14} className="text-sky-500" />
              </div>
              <span className="font-semibold text-stone-900 text-sm">Kitchen & Chores</span>
            </div>
            <ChevronRight size={16} className="text-stone-300" />
          </div>
          <div className="space-y-2">
            {todayChores.map(chore => {
              const member = FAMILY_MEMBERS.find(m => m.name === chore.assigned);
              return (
                <div key={chore.id} className="flex items-center gap-2.5">
                  <button
                    onClick={e => { e.stopPropagation(); onToggleChore(chore.id); }}
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all
                      ${chore.done ? 'border-emerald-500 bg-emerald-500' : 'border-stone-300'}`}
                  >
                    {chore.done && <Check size={10} className="text-white" strokeWidth={3} />}
                  </button>
                  <span className={`text-sm flex-1 truncate ${chore.done ? 'line-through text-stone-400' : 'text-stone-700'}`}>
                    {chore.task}
                  </span>
                  {member && <MemberDot name={member.name} color={member.color} bg={member.bg} size="sm" />}
                </div>
              );
            })}
          </div>
          <div className="mt-3 pt-3 border-t border-stone-100 text-xs text-stone-400">
            {todayChores.filter(c=>c.done).length}/{todayChores.length} done today
          </div>
        </Card>

        {/* Messages */}
        <Card className="p-4" onClick={() => onNavigate('messages')}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#DB277718' }}>
                <MessageSquare size={14} style={{ color: '#DB2777' }} />
              </div>
              <span className="font-semibold text-stone-900 text-sm">Messages</span>
            </div>
            {unreadMessages.length > 0 && (
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: '#DB2777' }}>
                {unreadMessages.length}
              </span>
            )}
          </div>
          <div className="space-y-2.5">
            {MESSAGES.slice(0, 3).map(msg => {
              const member = FAMILY_MEMBERS.find(m => m.name === msg.from);
              return (
                <div key={msg.id} className={`flex gap-2.5 ${!msg.read ? 'opacity-100' : 'opacity-60'}`}>
                  {member && <MemberDot name={member.name} color={member.color} bg={member.bg} size="sm" />}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold text-stone-700">{msg.from}</span>
                      <span className="text-xs text-stone-400 flex-shrink-0">{msg.time}</span>
                    </div>
                    <div className="text-xs text-stone-500 truncate">{msg.text}</div>
                  </div>
                  {!msg.read && <div className="w-2 h-2 rounded-full bg-pink-500 flex-shrink-0 mt-1" />}
                </div>
              );
            })}
          </div>
        </Card>

        {/* Upcoming events */}
        <Card className="p-4 col-span-1 sm:col-span-2 lg:col-span-1" onClick={() => onNavigate('calendar')}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-amber-50">
                <Calendar size={14} className="text-amber-600" />
              </div>
              <span className="font-semibold text-stone-900 text-sm">Upcoming Events</span>
            </div>
            <ChevronRight size={16} className="text-stone-300" />
          </div>
          <div className="space-y-2">
            {upcomingEvents.length === 0 && (
              <div className="text-sm text-stone-400">No upcoming events — add one on Calendar.</div>
            )}
            {upcomingEvents.map(evt => (
              <div key={evt.id} className="flex items-center gap-3">
                <div className="w-1 h-10 rounded-full flex-shrink-0" style={{ backgroundColor: evt.color }} />
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-stone-800 font-medium truncate">{evt.title}</div>
                  <div className="text-xs text-stone-400">{evt.date} · {evt.time}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>

      </div>
    </div>
  );
}

// ── Shopping Page ─────────────────────────────────────────────────────────────

function ShoppingView({ items, onToggle, onDelete, onAdd }: {
  items: HubShoppingItem[];
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onAdd: (name: string, qty: string) => void;
}) {
  const { members: FAMILY_MEMBERS } = useHub();
  const [tab, setTab] = useState<'current' | 'saved' | 'shared'>('current');
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('');
  const [newItem, setNewItem] = useState('');
  const [newQty, setNewQty] = useState('');

  const categories = [...new Set(items.map(i => i.category))];
  const filtered = items
    .filter(i => !search || i.name.toLowerCase().includes(search.toLowerCase()))
    .filter(i => !filterCat || i.category === filterCat);
  const unchecked = filtered.filter(i => !i.checked);
  const checked = filtered.filter(i => i.checked);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (newItem.trim()) { onAdd(newItem.trim(), newQty.trim() || '1'); setNewItem(''); setNewQty(''); }
  };

  const SAVED_LISTS = [
    { name: 'Costco Run',    count: 12, updated: 'Aug 3'  },
    { name: 'Weekly Basics', count: 18, updated: 'Aug 1'  },
    { name: 'Birthday Party',count: 9,  updated: 'Jul 28' },
  ];

  const SHARED_ITEMS = [
    { name: 'Paper towels',   qty: '3 rolls', addedBy: 'Hershel',  shared: true },
    { name: 'Dish soap',      qty: '1 bottle',addedBy: 'Lorraine', shared: true },
    { name: 'Trash bags',     qty: '1 box',   addedBy: 'Selena',   shared: true },
  ];

  return (
    <div className="h-full flex flex-col bg-[var(--app-bg)]">
      <div className="px-8 pt-8 pb-5 border-b border-[var(--border-soft)] bg-white/70 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-5 gap-3 flex-wrap">
          <div>
            <h1 className="figma-page-title">Shopping</h1>
            <p className="figma-page-subtitle">{unchecked.filter(i=>!i.checked).length} items remaining on the household list</p>
          </div>
          <div className="flex gap-2">
            <button type="button" className="figma-button-secondary">
              <ScanLine size={16} />
              <span className="hidden sm:inline">Scan</span>
            </button>
            <button type="button" className="figma-button-secondary">
              <Users size={16} />
              <span className="hidden sm:inline">Share</span>
            </button>
          </div>
        </div>

        <div className="figma-segmented">
          {(['current','saved','shared'] as const).map(t => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={tab === t ? 'is-active' : ''}
            >
              {t === 'current' ? 'Current List' : t === 'saved' ? 'Saved Lists' : 'Shared List'}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-8">
        {tab === 'current' && (
          <div className="max-w-3xl space-y-5">
            <form onSubmit={handleAdd} className="flex flex-wrap gap-2">
              <input
                value={newItem}
                onChange={e => setNewItem(e.target.value)}
                placeholder="Add item…"
                className="flex-1 min-w-[180px] px-4 py-3.5 bg-white border border-[var(--border-input)] rounded-[18px] text-sm placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-mauve)]"
              />
              <input
                value={newQty}
                onChange={e => setNewQty(e.target.value)}
                placeholder="Qty"
                className="w-28 px-3 py-3.5 bg-white border border-[var(--border-input)] rounded-[18px] text-sm placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-mauve)]"
              />
              <button type="submit" className="figma-button-primary">
                <Plus size={16} /> Add item
              </button>
            </form>

            <div className="flex gap-2 flex-wrap">
              <div className="figma-search flex-1 min-w-[200px]">
                <Search size={18} />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search items…"
                />
              </div>
              <div className="relative">
                <select
                  value={filterCat}
                  onChange={e => setFilterCat(e.target.value)}
                  className="appearance-none pl-3 pr-8 py-2 bg-white border border-stone-200 rounded-xl text-sm text-stone-700 focus:outline-none focus:ring-2 focus:ring-emerald-400 cursor-pointer"
                >
                  <option value="">All categories</option>
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" />
              </div>
            </div>

            {/* Items */}
            <div className="space-y-1">
              {unchecked.map(item => {
                const catColor = CATEGORY_COLORS[item.category] || '#94a3b8';
                const member = FAMILY_MEMBERS.find(m => m.name === item.addedBy);
                return (
                  <div key={item.id}
                    className="figma-list-row group">
                    <button
                      onClick={() => onToggle(item.id)}
                      className="w-5 h-5 rounded-full border-2 border-[#D1D5DB] flex items-center justify-center flex-shrink-0 hover:border-[var(--accent-mauve)] transition-colors"
                    />
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-medium text-stone-800">{item.name}</span>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs px-1.5 py-0.5 rounded-md font-medium" style={{ backgroundColor: catColor + '18', color: catColor }}>
                          {item.category}
                        </span>
                        <span className="text-xs text-stone-400">{item.qty}</span>
                      </div>
                    </div>
                    {member && (
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <MemberDot name={member.name} color={member.color} bg={member.bg} size="sm" />
                      </div>
                    )}
                    <button
                      onClick={() => onDelete(item.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-stone-300 hover:text-red-400 p-1"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Checked off */}
            {checked.length > 0 && (
              <div className="mt-5">
                <div className="text-xs font-semibold text-stone-400 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                  <Check size={12} className="text-emerald-500" /> Checked off ({checked.length})
                </div>
                <div className="space-y-1">
                  {checked.map(item => (
                    <div key={item.id}
                      className="flex items-center gap-3 px-4 py-2.5 bg-stone-50 rounded-xl border border-stone-100 group">
                      <button
                        onClick={() => onToggle(item.id)}
                        className="w-5 h-5 rounded-full border-2 border-emerald-500 bg-emerald-500 flex items-center justify-center flex-shrink-0"
                      >
                        <Check size={10} className="text-white" strokeWidth={3} />
                      </button>
                      <span className="text-sm text-stone-400 line-through flex-1">{item.name}</span>
                      <span className="text-xs text-stone-300">{item.qty}</span>
                      <button onClick={() => onDelete(item.id)} className="opacity-0 group-hover:opacity-100 transition-opacity text-stone-300 hover:text-red-400 p-1">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {tab === 'saved' && (
          <div className="max-w-2xl space-y-3">
            {SAVED_LISTS.map(list => (
              <Card key={list.name} className="p-4 flex items-center gap-4" onClick={() => {}}>
                <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                  <Bookmark size={18} className="text-emerald-600" />
                </div>
                <div className="flex-1">
                  <div className="font-medium text-stone-900">{list.name}</div>
                  <div className="text-xs text-stone-500 mt-0.5">{list.count} items · Updated {list.updated}</div>
                </div>
                <button className="text-xs font-medium text-emerald-600 px-3 py-1.5 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition-colors">
                  Load
                </button>
              </Card>
            ))}
            <button className="flex items-center gap-2 text-sm text-stone-500 hover:text-stone-800 transition-colors py-2">
              <Plus size={16} /> Create new saved list
            </button>
          </div>
        )}

        {tab === 'shared' && (
          <div className="max-w-2xl">
            <div className="flex items-center gap-3 mb-4 p-3 bg-indigo-50 rounded-xl">
              <Users size={16} className="text-indigo-500" />
              <span className="text-sm text-indigo-700 font-medium">Shared with all family members</span>
            </div>
            <div className="space-y-2">
              {SHARED_ITEMS.map((item, i) => {
                const member = FAMILY_MEMBERS.find(m => m.name === item.addedBy);
                return (
                  <div key={i} className="flex items-center gap-3 px-4 py-3 bg-white rounded-xl border border-stone-100">
                    <div className="w-5 h-5 rounded-full border-2 border-stone-300 flex-shrink-0" />
                    <div className="flex-1">
                      <span className="text-sm font-medium text-stone-800">{item.name}</span>
                      <span className="text-xs text-stone-400 ml-2">{item.qty}</span>
                    </div>
                    {member && <MemberDot name={member.name} color={member.color} bg={member.bg} size="sm" />}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Pantry Page ───────────────────────────────────────────────────────────────

function PantryView({ items, onUpdateStock, onAdd }: {
  items: HubPantryItem[];
  onUpdateStock: (id: string, qty: number) => void;
  onAdd: (name: string, qty: string, place?: string) => void;
}) {
  const { storagePlaces, addStoragePlace, setPantryItemPlace } = useHub();
  const [filter, setFilter] = useState<'all'|'out'|'low'|'good'>('all');
  const [search, setSearch] = useState('');
  const [placeFilter, setPlaceFilter] = useState<string>('all');
  const [showAddPlace, setShowAddPlace] = useState(false);
  const [placeDraft, setPlaceDraft] = useState('');
  const [showAddItem, setShowAddItem] = useState(false);
  const [itemName, setItemName] = useState('');
  const [itemQty, setItemQty] = useState('1');
  const [itemPlace, setItemPlace] = useState(storagePlaces[0]?.name || 'Pantry');

  const filtered = items
    .filter(i => filter === 'all' || i.status === filter || (filter === 'good' && (i.status === 'good' || i.status === 'ok')))
    .filter(i => placeFilter === 'all' || i.place.toLowerCase() === placeFilter.toLowerCase())
    .filter(i => !search || i.name.toLowerCase().includes(search.toLowerCase()));

  const outCount = items.filter(i => i.status === 'out').length;
  const lowCount = items.filter(i => i.status === 'low').length;

  const FILTER_OPTIONS = [
    { key: 'all',  label: 'All',       count: items.length },
    { key: 'out',  label: 'Out',       count: outCount     },
    { key: 'low',  label: 'Low Stock', count: lowCount     },
    { key: 'good', label: 'Stocked',   count: items.filter(i => i.status === 'good' || i.status === 'ok').length },
  ] as const;

  return (
    <div className="h-full flex flex-col bg-[var(--app-bg)]">
      <div className="px-8 pt-8 pb-5 border-b border-[var(--border-soft)] bg-white/70 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-5 gap-3 flex-wrap">
          <div>
            <h1 className="figma-page-title">Pantry & Inventory</h1>
            <p className="figma-page-subtitle">
              {items.length} items · {storagePlaces.length} storage places
            </p>
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={() => setShowAddPlace((v) => !v)} className="figma-button-secondary">
              <Plus size={16} />
              <span className="hidden sm:inline">Add place</span>
            </button>
            <button type="button" onClick={() => setShowAddItem((v) => !v)} className="figma-button-primary">
              <Plus size={16} />
              <span className="hidden sm:inline">Add Item</span>
            </button>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
          <div className="figma-stat-card"><div className="text-xs text-[var(--text-muted)] mb-1">Items</div><div className="text-2xl font-semibold">{items.length}</div></div>
          <div className="figma-stat-card"><div className="text-xs text-[var(--text-muted)] mb-1">Places</div><div className="text-2xl font-semibold">{storagePlaces.length}</div></div>
          <div className="figma-stat-card"><div className="text-xs text-[var(--text-muted)] mb-1">Low</div><div className="text-2xl font-semibold text-[var(--alert-warm-text)]">{lowCount}</div></div>
          <div className="figma-stat-card"><div className="text-xs text-[var(--text-muted)] mb-1">Out</div><div className="text-2xl font-semibold text-[#9D174D]">{outCount}</div></div>
        </div>
        {(outCount + lowCount) > 0 && (
          <div className="figma-alert-warm mb-5 flex items-start gap-3">
            <AlertTriangle size={18} className="mt-0.5 flex-shrink-0" />
            <div>
              <div className="font-semibold text-[var(--alert-warm-text)]">Low stock alert</div>
              <p className="text-sm text-[var(--text-soft)] mt-0.5">{outCount + lowCount} items need attention in pantry inventory</p>
            </div>
          </div>
        )}

        {showAddPlace && (
          <form
            className="flex gap-2 mb-4"
            onSubmit={(e) => {
              e.preventDefault();
              if (!placeDraft.trim()) return;
              addStoragePlace(placeDraft);
              setPlaceDraft('');
              setShowAddPlace(false);
            }}
          >
            <input
              value={placeDraft}
              onChange={(e) => setPlaceDraft(e.target.value)}
              placeholder="New storage place (e.g. Garage shelf, Basement bin)"
              className="flex-1 px-3 py-2 rounded-xl border border-stone-200 text-sm"
            />
            <button type="submit" className="px-3 py-2 rounded-xl text-sm font-medium text-white bg-[var(--accent-mauve)]">
              Save place
            </button>
          </form>
        )}

        {showAddItem && (
          <form
            className="flex flex-wrap gap-2 mb-4"
            onSubmit={(e) => {
              e.preventDefault();
              if (!itemName.trim()) return;
              onAdd(itemName, itemQty || '1', itemPlace);
              setItemName('');
              setItemQty('1');
              setShowAddItem(false);
            }}
          >
            <input
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              placeholder="Item name"
              className="flex-1 min-w-[140px] px-3 py-2 rounded-xl border border-stone-200 text-sm"
            />
            <input
              value={itemQty}
              onChange={(e) => setItemQty(e.target.value)}
              placeholder="Qty"
              className="w-20 px-3 py-2 rounded-xl border border-stone-200 text-sm"
            />
            <select
              value={itemPlace}
              onChange={(e) => setItemPlace(e.target.value)}
              className="px-3 py-2 rounded-xl border border-stone-200 text-sm"
            >
              {storagePlaces.map((p) => (
                <option key={p.id} value={p.name}>{p.name}</option>
              ))}
            </select>
            <button type="submit" className="px-3 py-2 rounded-xl text-sm font-medium text-white bg-[var(--accent-mauve)]">
              Save item
            </button>
          </form>
        )}

        <div className="mb-4">
          <div className="text-xs font-semibold uppercase tracking-wide text-stone-400 mb-2">Storage places</div>
          <div className="flex gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => setPlaceFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                placeFilter === 'all' ? 'bg-[var(--accent-mauve)] text-white' : 'bg-stone-100 text-stone-600'
              }`}
            >
              All places
            </button>
            {storagePlaces.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setPlaceFilter(p.name)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  placeFilter === p.name ? 'bg-[var(--accent-mauve)] text-white' : 'bg-stone-100 text-stone-600'
                }`}
              >
                {p.name}
                <span className="ml-1 opacity-70">{p.itemCount}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-3 items-center flex-wrap">
          <div className="flex gap-1 bg-stone-100 p-1 rounded-xl">
            {FILTER_OPTIONS.map(f => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5
                  ${filter === f.key ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}
              >
                {f.label}
                <span className="text-xs px-1 rounded text-stone-400">{f.count}</span>
              </button>
            ))}
          </div>
          <div className="relative flex-1 min-w-[180px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search inventory…"
              className="w-full pl-8 pr-4 py-2 bg-stone-100 border border-transparent rounded-xl text-sm placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:border-[var(--accent-mauve)] focus:bg-white"
            />
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-3xl space-y-1.5">
          {filtered.map(item => {
            return (
              <div key={item.id}
                className="figma-list-row group">
                <div className={`figma-icon-tile !w-14 !h-14 ${item.status === 'out' || item.status === 'low' ? 'is-alert' : ''}`}>
                  <Package size={22} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-stone-900 text-sm">{item.name}</span>
                    <span className="text-xs px-1.5 py-0.5 rounded-md bg-stone-100 text-stone-500">{item.place}</span>
                  </div>
                  <div className="mt-1.5 flex items-center gap-3">
                    <StockBar qty={item.qty} max={item.max} status={item.status} />
                    <span className="text-xs text-stone-400 flex-shrink-0">{item.qty}/{item.max} {item.unit}</span>
                  </div>
                </div>
                <select
                  value={item.place}
                  onChange={(e) => setPantryItemPlace(item.id, e.target.value)}
                  className="text-xs px-2 py-1.5 rounded-lg border border-stone-200 text-stone-600 max-w-[140px]"
                  title="Move to storage place"
                >
                  {storagePlaces.map((p) => (
                    <option key={p.id} value={p.name}>{p.name}</option>
                  ))}
                  {!storagePlaces.some((p) => p.name === item.place) && (
                    <option value={item.place}>{item.place}</option>
                  )}
                </select>
                <StatusChip status={item.status} />
                <button
                  onClick={() => onUpdateStock(item.id, item.qty + 1)}
                  className="figma-button-primary !text-xs !px-3 !py-1.5 !rounded-lg flex-shrink-0"
                >
                  + Stock
                </button>
              </div>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Package size={40} className="text-stone-200 mb-3" />
            <div className="text-stone-500 font-medium">No items in this place</div>
            <div className="text-sm text-stone-400 mt-1">Add an item or choose another storage place</div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Messages Page ─────────────────────────────────────────────────────────────

function MessagesView() {
  const { members: FAMILY_MEMBERS, messages: boardMessages, postMessage } = useHub();
  const [newMsg, setNewMsg] = useState('');

  const unread = boardMessages.filter((m) => !m.read).length;

  return (
    <div className="h-full flex">
      <div className="w-72 border-r border-stone-100 bg-white flex flex-col flex-shrink-0">
        <div className="px-5 pt-6 pb-4 border-b border-[var(--border-soft)]">
          <h2 className="figma-page-title !text-2xl">Messages</h2>
          <p className="text-xs text-[var(--text-muted)] mt-1">Family board · {unread} unread</p>
        </div>
        <div className="flex-1 overflow-y-auto">
          <div className="w-full px-4 py-3.5 flex items-center gap-3 bg-[var(--accent-mauve-soft)] border-b border-[var(--border-soft)]">
            <div className="flex -space-x-1.5 flex-shrink-0">
              {FAMILY_MEMBERS.slice(0, 2).map(m => <MemberDot key={m.id} name={m.name} color={m.color} bg={m.bg} size="sm" />)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-stone-900">Family Board</div>
              <div className="text-xs text-stone-500 truncate mt-0.5">
                {boardMessages[0]?.text || 'No messages yet — say hello'}
              </div>
            </div>
            {unread > 0 && (
              <span className="w-5 h-5 rounded-full bg-pink-500 text-white text-xs flex items-center justify-center font-semibold flex-shrink-0">
                {unread}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        <div className="px-6 py-4 bg-white border-b border-stone-100 flex items-center gap-3">
          <div className="flex -space-x-1.5">
            {FAMILY_MEMBERS.slice(0, 3).map(m => <MemberDot key={m.id} name={m.name} color={m.color} bg={m.bg} size="sm" />)}
          </div>
          <div>
            <div className="font-semibold text-stone-900 text-sm">Family Board</div>
            <div className="text-xs text-stone-400">{FAMILY_MEMBERS.length} members</div>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          {boardMessages.length === 0 ? (
            <div className="text-sm text-stone-500 text-center py-12">No posts yet. Send the first family note.</div>
          ) : (
            boardMessages.map((msg) => {
              const member = FAMILY_MEMBERS.find(m => m.name === msg.from);
              return (
                <div key={msg.id} className="flex gap-3">
                  {member && <MemberDot name={member.name} color={member.color} bg={member.bg} size="sm" />}
                  <div className="items-start flex flex-col gap-1 max-w-lg">
                    <span className="text-xs text-stone-500 font-medium">{msg.from}</span>
                    <div className="px-4 py-2.5 rounded-2xl rounded-tl-md text-sm bg-white border border-stone-100 text-stone-800">
                      {msg.text}
                    </div>
                    <span className="text-xs text-stone-400">{msg.time}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
        <div className="px-6 py-4 bg-white border-t border-stone-100">
          <form
            className="flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              if (!newMsg.trim()) return;
              postMessage(newMsg);
              setNewMsg('');
            }}
          >
            <input
              value={newMsg}
              onChange={e => setNewMsg(e.target.value)}
              placeholder="Send a message to the family…"
              className="flex-1 px-4 py-2.5 bg-stone-100 rounded-xl text-sm placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
            <button type="submit" className="px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors">
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

// ── Calendar Page ─────────────────────────────────────────────────────────────

function CalendarView() {
  const { members: FAMILY_MEMBERS, events: EVENTS, addEvent } = useHub();
  const [showAdd, setShowAdd] = useState(false);
  const [draft, setDraft] = useState('');
  const [assignee, setAssignee] = useState(FAMILY_MEMBERS[0]?.id || '');
  const [eventDate, setEventDate] = useState(todayIsoLocal());
  const [eventTime, setEventTime] = useState('17:00');
  const [cursor, setCursor] = useState(() => {
    const t = new Date();
    return new Date(t.getFullYear(), t.getMonth(), 1);
  });
  const [selectedIso, setSelectedIso] = useState(todayIsoLocal());
  const [viewMode, setViewMode] = useState<'list' | 'month'>('month');

  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const todayIso = todayIsoLocal();
  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const startOfMonth = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startDay = startOfMonth.getDay();
  const monthName = cursor.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const upcoming = EVENTS.filter((e) => e.dateIso >= todayIso).slice(0, 12);
  const selectedEvents = EVENTS.filter((e) => e.dateIso === selectedIso);
  const todayEventsList = EVENTS.filter((e) => e.dateIso === todayIso);

  return (
    <div className="figma-page max-w-6xl">
      <div className="figma-page-header">
        <div>
          <h1 className="figma-page-title">{viewMode === 'list' ? "Today's Schedule" : 'Calendar'}</h1>
          <p className="figma-page-subtitle">{monthName} · family schedule</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="figma-segmented">
            <button type="button" className={viewMode === 'list' ? 'is-active' : ''} onClick={() => setViewMode('list')} title="List"><List size={18} /></button>
            <button type="button" className={viewMode === 'month' ? 'is-active' : ''} onClick={() => setViewMode('month')} title="Month"><Calendar size={18} /></button>
          </div>
          <div className="figma-segmented">
            <button type="button" onClick={() => setCursor(new Date(year, month - 1, 1))}>‹</button>
            <button type="button" className="is-active px-3">{monthName}</button>
            <button type="button" onClick={() => setCursor(new Date(year, month + 1, 1))}>›</button>
          </div>
          <button type="button" onClick={() => setShowAdd((v) => !v)} className="figma-button-primary"><Plus size={16} /> Add event</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {viewMode === 'list' ? (
            <div className="space-y-3">
              {(todayEventsList.length ? todayEventsList : upcoming.slice(0, 6)).map((evt) => (
                <div key={evt.id} className="figma-list-row">
                  <div className="figma-icon-tile !w-12 !h-12">
                    <Calendar size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-[var(--text-main)] truncate">{evt.title}</div>
                    <div className="text-sm text-[var(--text-muted)] mt-0.5">{evt.date} · {evt.time} · {evt.who}</div>
                  </div>
                  <span className="figma-chip figma-chip-mauve">Household</span>
                </div>
              ))}
              {todayEventsList.length === 0 && upcoming.length === 0 && (
                <div className="figma-empty">No family events scheduled yet.</div>
              )}
            </div>
          ) : (
            <>
              <Card className="p-6">
                <div className="grid grid-cols-7 mb-2">
                  {days.map((d) => (
                    <div key={d} className="text-center text-xs font-semibold text-[var(--text-muted)] py-1">{d}</div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {Array.from({ length: startDay }).map((_, i) => (
                    <div key={`e-${i}`} />
                  ))}
                  {Array.from({ length: daysInMonth }).map((_, i) => {
                    const day = i + 1;
                    const iso = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                    const isToday = iso === todayIso;
                    const isSelected = iso === selectedIso;
                    const dayEvents = EVENTS.filter((e) => e.dateIso === iso);
                    return (
                      <button
                        key={day}
                        type="button"
                        onClick={() => {
                          setSelectedIso(iso);
                          setEventDate(iso);
                        }}
                        className={`aspect-square flex flex-col items-center justify-center rounded-2xl text-sm transition-all
                          ${isToday ? 'figma-cal-today' : isSelected ? 'figma-cal-selected' : 'hover:bg-[#F9FAFB] text-[var(--text-soft)]'}`}
                      >
                        {day}
                        {dayEvents.length > 0 && (
                          <div className="flex gap-0.5 mt-0.5">
                            {dayEvents.slice(0, 3).map((e) => (
                              <div
                                key={e.id}
                                className={`w-1 h-1 rounded-full ${isToday ? 'bg-white' : ''}`}
                                style={isToday ? undefined : { backgroundColor: e.color }}
                              />
                            ))}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </Card>
              {selectedEvents.length > 0 && (
                <div className="mt-3 space-y-2">
                  <div className="text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">
                    {selectedIso === todayIso ? 'Today' : selectedIso}
                  </div>
                  {selectedEvents.map((evt) => (
                    <Card key={evt.id} className="p-4 flex items-center gap-3">
                      <div className="w-1 h-8 rounded-full" style={{ backgroundColor: evt.color }} />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-[var(--text-main)] truncate">{evt.title}</div>
                        <div className="text-xs text-[var(--text-muted)]">{evt.time} · {evt.who}</div>
                      </div>
                      <span className="figma-chip figma-chip-blue">Activity</span>
                    </Card>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-[var(--text-main)]">Upcoming</h3>
            <button type="button" onClick={() => setShowAdd((v) => !v)} className="flex items-center gap-1 text-xs text-[var(--accent-mauve)] font-medium">
              <Plus size={12} /> Add event
            </button>
          </div>
          {showAdd && (
            <form
              className="space-y-2"
              onSubmit={(e) => {
                e.preventDefault();
                if (!draft.trim()) return;
                addEvent({
                  title: draft,
                  date: eventDate,
                  time: eventTime,
                  memberId: assignee || undefined,
                });
                setDraft('');
                setShowAdd(false);
              }}
            >
              <input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Event title" className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm" />
              <div className="flex gap-2">
                <input type="date" value={eventDate} onChange={(e) => setEventDate(e.target.value)} className="flex-1 px-3 py-2 rounded-xl border border-stone-200 text-sm" />
                <input type="time" value={eventTime} onChange={(e) => setEventTime(e.target.value)} className="w-28 px-3 py-2 rounded-xl border border-stone-200 text-sm" />
              </div>
              <div className="flex gap-2">
                <select value={assignee} onChange={(e) => setAssignee(e.target.value)} className="flex-1 px-3 py-2 rounded-xl border border-stone-200 text-sm">
                  <option value="">Family</option>
                  {FAMILY_MEMBERS.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
                </select>
                <button type="submit" className="figma-button-primary !py-2 !px-3 !rounded-xl">Save</button>
              </div>
            </form>
          )}
          {upcoming.length === 0 && (
            <Card className="p-4 text-sm text-stone-500">No upcoming events yet.</Card>
          )}
          {upcoming.map((evt) => (
            <Card key={evt.id} className="p-4" onClick={() => setSelectedIso(evt.dateIso)}>
              <div className="flex items-start gap-3">
                <div className="w-1 h-full min-h-[48px] rounded-full flex-shrink-0" style={{ backgroundColor: evt.color }} />
                <div className="flex-1">
                  <div className="font-medium text-stone-900 text-sm">{evt.title}</div>
                  <div className="text-xs text-stone-500 mt-1">{evt.date} · {evt.time}</div>
                  <div className="mt-2">
                    {FAMILY_MEMBERS.filter((m) => m.name === evt.who).map((m) => (
                      <MemberDot key={m.id} name={m.name} color={m.color} bg={m.bg} size="sm" />
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Cleaning Page ─────────────────────────────────────────────────────────────

function CleaningView({ chores, onToggle }: { chores: HubChore[]; onToggle: (id: string) => void }) {
  const { members: FAMILY_MEMBERS, addChore } = useHub();
  const [draft, setDraft] = useState('');
  const [assignee, setAssignee] = useState(FAMILY_MEMBERS[0]?.id || '');
  const [showAdd, setShowAdd] = useState(false);
  const today = chores.filter(c => c.due === 'Today');
  const upcoming = chores.filter(c => c.due !== 'Today');

  return (
    <div className="figma-page max-w-3xl">
      <div className="figma-page-header">
        <div>
          <h1 className="figma-page-title">Cleaning & Kitchen</h1>
          <p className="figma-page-subtitle">Today and upcoming household chores</p>
        </div>
        <button type="button" onClick={() => setShowAdd((v) => !v)} className="figma-button-primary">
          <Plus size={16} /> Add Chore
        </button>
      </div>
      {showAdd && (
        <form
          className="mb-5 flex flex-wrap gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            if (!draft.trim()) return;
            addChore(draft, assignee || undefined);
            setDraft('');
            setShowAdd(false);
          }}
        >
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Chore title"
            className="flex-1 min-w-[180px] px-3 py-2 rounded-xl border border-stone-200 text-sm"
          />
          <select
            value={assignee}
            onChange={(e) => setAssignee(e.target.value)}
            className="px-3 py-2 rounded-xl border border-stone-200 text-sm"
          >
            {FAMILY_MEMBERS.map((m) => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </select>
          <button type="submit" className="figma-button-primary !py-2 !px-3">Save</button>
        </form>
      )}

      <div className="space-y-5">
        <div>
          <h3 className="text-sm font-semibold text-stone-500 mb-2 uppercase tracking-wide">Today</h3>
          <div className="space-y-2">
            {today.map(chore => {
              const member = FAMILY_MEMBERS.find(m => m.name === chore.assigned);
              return (
                <Card key={chore.id} className="p-4 flex items-center gap-4">
                  <button
                    onClick={() => onToggle(chore.id)}
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all
                      ${chore.done ? 'border-emerald-500 bg-emerald-500' : 'border-stone-300 hover:border-sky-400'}`}
                  >
                    {chore.done && <Check size={12} className="text-white" strokeWidth={3} />}
                  </button>
                  <span className={`flex-1 text-sm font-medium ${chore.done ? 'line-through text-stone-400' : 'text-stone-800'}`}>
                    {chore.task}
                  </span>
                  {member && (
                    <div className="flex items-center gap-1.5">
                      <MemberDot name={member.name} color={member.color} bg={member.bg} size="sm" />
                      <span className="text-xs text-stone-500 hidden sm:block">{member.name}</span>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-stone-500 mb-2 uppercase tracking-wide">Upcoming</h3>
          <div className="space-y-2">
            {upcoming.map(chore => {
              const member = FAMILY_MEMBERS.find(m => m.name === chore.assigned);
              return (
                <Card key={chore.id} className="p-4 flex items-center gap-4">
                  <div className="w-6 h-6 rounded-full border-2 border-stone-200 flex-shrink-0" />
                  <span className="flex-1 text-sm text-stone-700">{chore.task}</span>
                  <span className="text-xs text-stone-400 bg-stone-100 px-2 py-1 rounded-lg">{chore.due}</span>
                  {member && <MemberDot name={member.name} color={member.color} bg={member.bg} size="sm" />}
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Emergency Planning Page ───────────────────────────────────────────────────

function emergencyIcon(cat: HubEmergencyItem['cat']) {
  if (cat === 'Contacts') return { Icon: ShieldAlert, color: '#EF4444' };
  if (cat === 'Medical') return { Icon: Heart, color: '#EC4899' };
  return { Icon: Archive, color: '#4F46E5' };
}

function EmergencyView() {
  const {
    emergencyItems,
    members,
    addEmergencyNote,
    updateEmergencyNote,
    updateMemberMedical,
  } = useHub();
  const [showAdd, setShowAdd] = useState(false);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [memberId, setMemberId] = useState(members[0]?.id || '');
  const [field, setField] = useState<'allergies' | 'emergencyContact' | 'note'>('note');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  const categories = (['Contacts', 'Medical', 'Preparedness'] as const).filter((cat) =>
    emergencyItems.some((i) => i.cat === cat),
  );

  return (
    <div className="figma-page max-w-3xl">
      <div className="flex items-center justify-between mb-2 gap-3 flex-wrap">
        <h1 className="figma-page-title">Emergency Planning</h1>
        <button
          type="button"
          onClick={() => setShowAdd((v) => !v)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium text-white bg-red-500 hover:bg-red-600 transition-colors"
        >
          <Plus size={15} /> Add Info
        </button>
      </div>
      <p className="text-sm text-stone-500 mb-6">Saved household contacts, medical notes, and preparedness info</p>

      <div className="mb-5 p-4 bg-red-50 rounded-2xl border border-red-100 flex items-center gap-3">
        <ShieldAlert size={20} className="text-red-500 flex-shrink-0" />
        <div>
          <div className="font-semibold text-red-700 text-sm">Emergency Services: 911</div>
          <div className="text-xs text-red-500">Poison Control: 1-800-222-1222</div>
        </div>
      </div>

      {showAdd && (
        <Card className="p-4 mb-5 space-y-3">
          <div className="flex flex-wrap gap-2">
            {([
              { key: 'note' as const, label: 'Preparedness note' },
              { key: 'allergies' as const, label: 'Allergy' },
              { key: 'emergencyContact' as const, label: 'ICE contact' },
            ]).map((opt) => (
              <button
                key={opt.key}
                type="button"
                onClick={() => setField(opt.key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium ${
                  field === opt.key ? 'bg-red-500 text-white' : 'bg-stone-100 text-stone-600'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          {field !== 'note' && (
            <select
              value={memberId}
              onChange={(e) => setMemberId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm"
            >
              {members.map((m) => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
          )}
          {field === 'note' && (
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Label (e.g. Go-bag location)"
              className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm"
            />
          )}
          <input
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder={field === 'allergies' ? 'Allergies' : field === 'emergencyContact' ? 'Phone / contact' : 'Details'}
            className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm"
          />
          <button
            type="button"
            onClick={() => {
              if (!body.trim()) return;
              if (field === 'note') {
                if (!title.trim()) return;
                addEmergencyNote(title, body);
                setTitle('');
              } else if (memberId) {
                updateMemberMedical(memberId, field, body);
              }
              setBody('');
              setShowAdd(false);
            }}
            className="px-3 py-2 rounded-xl text-sm font-medium text-white bg-red-500"
          >
            Save
          </button>
        </Card>
      )}

      <div className="space-y-6">
        {categories.map((cat) => (
          <div key={cat}>
            <h3 className="text-sm font-semibold text-stone-500 uppercase tracking-wide mb-2">{cat}</h3>
            <div className="space-y-2">
              {emergencyItems.filter((i) => i.cat === cat).map((item) => {
                const { Icon, color } = emergencyIcon(item.cat);
                const isEditing = editingId === item.id;
                return (
                  <Card key={item.id} className="p-4 flex items-center gap-4">
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: color + '18' }}
                    >
                      <Icon size={16} style={{ color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs text-stone-400 font-medium">{item.label}</div>
                      {isEditing ? (
                        <form
                          className="flex gap-2 mt-1"
                          onSubmit={(e) => {
                            e.preventDefault();
                            if (item.docId) updateEmergencyNote(item.docId, editValue);
                            else if (item.memberId && item.field) {
                              updateMemberMedical(item.memberId, item.field, editValue);
                            }
                            setEditingId(null);
                          }}
                        >
                          <input
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            className="flex-1 px-2 py-1 rounded-lg border border-stone-200 text-sm"
                            autoFocus
                          />
                          <button type="submit" className="text-xs font-medium text-indigo-600">Save</button>
                        </form>
                      ) : (
                        <div className="text-sm font-semibold text-stone-800 mt-0.5">{item.value}</div>
                      )}
                    </div>
                    {item.editable && !isEditing && (
                      <button
                        type="button"
                        className="text-stone-300 hover:text-stone-600 transition-colors p-1"
                        onClick={() => {
                          setEditingId(item.id);
                          setEditValue(item.value);
                        }}
                      >
                        <Edit2 size={14} />
                      </button>
                    )}
                  </Card>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Pets Page ─────────────────────────────────────────────────────────────────

function PetsView() {
  const { pets: PETS, addPet, renamePet, logFleaDose } = useHub();
  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState('');
  const [species, setSpecies] = useState<'cat' | 'dog' | 'other'>('cat');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  return (
    <div className="p-6 max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-stone-900">Pets</h1>
        <button
          type="button"
          onClick={() => setShowAdd((v) => !v)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 transition-colors"
        >
          <Plus size={15} /> Add Pet
        </button>
      </div>

      {showAdd && (
        <form
          className="flex flex-wrap gap-2 mb-4"
          onSubmit={(e) => {
            e.preventDefault();
            if (!name.trim()) return;
            addPet(name, species);
            setName('');
            setShowAdd(false);
          }}
        >
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Pet name"
            className="flex-1 min-w-[140px] px-3 py-2 rounded-xl border border-stone-200 text-sm"
          />
          <select
            value={species}
            onChange={(e) => setSpecies(e.target.value as 'cat' | 'dog' | 'other')}
            className="px-3 py-2 rounded-xl border border-stone-200 text-sm"
          >
            <option value="cat">Cat</option>
            <option value="dog">Dog</option>
            <option value="other">Other</option>
          </select>
          <button type="submit" className="px-3 py-2 rounded-xl text-sm font-medium text-white bg-orange-500">
            Save
          </button>
        </form>
      )}

      <div className="space-y-4">
        {PETS.length === 0 && (
          <Card className="p-6 text-sm text-stone-500">No pets yet — add your household animals here.</Card>
        )}
        {PETS.map((pet) => (
          <Card key={pet.id} className="p-5">
            <div className="flex items-start gap-4">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: pet.color + '18' }}
              >
                <PawPrint size={22} style={{ color: pet.color }} />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  {editingId === pet.id ? (
                    <form
                      className="flex gap-2 flex-1"
                      onSubmit={(e) => {
                        e.preventDefault();
                        renamePet(pet.id, editName);
                        setEditingId(null);
                      }}
                    >
                      <input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="flex-1 px-2 py-1 rounded-lg border border-stone-200 text-sm"
                        autoFocus
                      />
                      <button type="submit" className="text-xs font-medium text-orange-600">Save</button>
                    </form>
                  ) : (
                    <h3 className="font-semibold text-stone-900 text-lg">{pet.name}</h3>
                  )}
                  <Badge color={pet.color} light>{pet.type}</Badge>
                </div>
                <div className="text-sm text-stone-500 mt-0.5">{pet.breed}</div>
                <div className="mt-3 space-y-1.5">
                  {pet.tasks.map((task, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm">
                      <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: pet.color }} />
                      <span className={task.includes('TODAY') || task.includes('OVERDUE') ? 'text-red-600 font-semibold' : 'text-stone-600'}>
                        {task}
                      </span>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => logFleaDose(pet.id)}
                  className="mt-3 text-xs font-medium px-3 py-1.5 rounded-lg bg-orange-50 text-orange-700 hover:bg-orange-100"
                >
                  Log flea dose today
                </button>
              </div>
              <button
                type="button"
                className="text-stone-300 hover:text-stone-600 p-1"
                onClick={() => {
                  setEditingId(pet.id);
                  setEditName(pet.name);
                }}
              >
                <Edit2 size={15} />
              </button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ── Subscriptions Page ────────────────────────────────────────────────────────

function SubscriptionsView() {
  const {
    subscriptions: SUBSCRIPTIONS,
    members,
    addSubscription,
    updateSubscription,
    removeSubscription,
  } = useHub();

  const [revealed, setRevealed] = useState<Record<string, boolean>>({});
  const [draftName, setDraftName] = useState('');
  const [draftPassword, setDraftPassword] = useState('');
  const [draftPayer, setDraftPayer] = useState(members[0]?.id || '');

  return (
    <div className="p-6 max-w-3xl">
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-xl font-semibold text-stone-900">Subscriptions</h1>
      </div>
      <p className="text-sm text-stone-500 mb-5">
        Service name, login password, and who pays — stored on this device only.
      </p>

      <form
        className="grid gap-2 sm:grid-cols-[1fr_1fr_1fr_auto] mb-5"
        onSubmit={(e) => {
          e.preventDefault();
          if (!draftName.trim()) return;
          addSubscription(draftName, draftPassword, draftPayer);
          setDraftName('');
          setDraftPassword('');
        }}
      >
        <input
          value={draftName}
          onChange={(e) => setDraftName(e.target.value)}
          placeholder="Service (e.g. Netflix)"
          className="px-3 py-2 rounded-xl border border-stone-200 text-sm"
        />
        <input
          value={draftPassword}
          onChange={(e) => setDraftPassword(e.target.value)}
          placeholder="Password / PIN"
          className="px-3 py-2 rounded-xl border border-stone-200 text-sm"
        />
        <select
          value={draftPayer}
          onChange={(e) => setDraftPayer(e.target.value)}
          className="px-3 py-2 rounded-xl border border-stone-200 text-sm"
        >
          <option value="">Who pays?</option>
          {members.map((m) => (
            <option key={m.id} value={m.id}>{m.name}</option>
          ))}
        </select>
        <button type="submit" className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium text-white bg-violet-500 hover:bg-violet-600">
          <Plus size={15} /> Add
        </button>
      </form>

      <div className="space-y-2">
        {SUBSCRIPTIONS.length === 0 && (
          <Card className="p-6 text-sm text-stone-500">No subscriptions yet.</Card>
        )}
        {SUBSCRIPTIONS.map((sub) => {
          const payer = members.find((m) => m.id === sub.payerMemberId);
          return (
            <Card key={sub.id} className="p-4 flex items-center gap-4">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: sub.color + '18' }}
              >
                <Key size={16} style={{ color: sub.color }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-stone-900 text-sm">{sub.name}</div>
                <div className="text-xs text-stone-500 mt-0.5 truncate">
                  Password: {revealed[sub.id] ? (sub.password || '—') : '••••••••'}
                </div>
                <div className="text-xs text-stone-400 mt-0.5">
                  Paid by {sub.payerName}
                </div>
              </div>
              <select
                value={sub.payerMemberId}
                onChange={(e) => updateSubscription(sub.id, { payerMemberId: e.target.value })}
                className="text-xs px-2 py-1.5 rounded-lg border border-stone-200"
                title="Person responsible for paying"
              >
                <option value="">Unassigned</option>
                {members.map((m) => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
              {payer && <MemberDot name={payer.name} color={payer.color} bg={payer.bg} size="sm" />}
              <button
                type="button"
                onClick={() => setRevealed((prev) => ({ ...prev, [sub.id]: !prev[sub.id] }))}
                className="text-xs font-medium px-3 py-1.5 rounded-lg bg-stone-100 text-stone-600 hover:bg-stone-200"
              >
                {revealed[sub.id] ? 'Hide' : 'Reveal'}
              </button>
              <button
                type="button"
                onClick={() => removeSubscription(sub.id)}
                className="text-stone-300 hover:text-red-500 p-1"
                title="Remove"
              >
                <Trash2 size={14} />
              </button>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

// ── Planner Page ──────────────────────────────────────────────────────────────

function PlannerView() {
  const { members: FAMILY_MEMBERS, events } = useHub();
  const todayIso = todayIsoLocal();
  // Mon–Sun of the current week
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    const day = d.getDay();
    const mondayOffset = day === 0 ? -6 : 1 - day;
    d.setDate(d.getDate() + mondayOffset + i);
    return d;
  });

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-stone-900">Weekly Planner</h1>
        <span className="text-sm text-stone-500">
          {days[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} –{' '}
          {days[6].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        </span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-7 gap-3">
        {days.map((dateObj) => {
          const iso = toIsoLocal(dateObj);
          const label = dateObj.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
          const tasks = events
            .filter((e) => e.dateIso === iso)
            .map((e) => ({ text: `${e.title} · ${e.time}`, member: e.who, color: e.color }));
          const isToday = iso === todayIso;
          return (
            <div
              key={iso}
              className={`rounded-2xl border p-4 ${isToday ? 'border-indigo-200 bg-indigo-50' : 'bg-white border-stone-100'}`}
            >
              <div className={`text-xs font-semibold mb-3 ${isToday ? 'text-indigo-600' : 'text-stone-400'}`}>
                {label.split(',')[0]}
                {isToday && <span className="ml-1.5 text-white bg-indigo-600 px-1.5 py-0.5 rounded text-[10px]">Today</span>}
              </div>
              <div className="space-y-2">
                {tasks.map((task, i) => {
                  const member = FAMILY_MEMBERS.find((m) => m.name === task.member);
                  return (
                    <div key={i} className="text-xs text-stone-700 leading-snug flex gap-1.5">
                      <div
                        className="w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1"
                        style={{ backgroundColor: member?.color || task.color }}
                      />
                      {task.text}
                    </div>
                  );
                })}
                {tasks.length === 0 && <div className="text-xs text-stone-300">No events</div>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Family Members Page ───────────────────────────────────────────────────────

function FamilyMembersView() {
  const {
    members: FAMILY_MEMBERS,
    activeMemberId,
    setActiveMember,
    addFamilyMember,
    updateMemberMedical,
  } = useHub();
  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState('');
  const [editId, setEditId] = useState<string | null>(null);
  const [allergies, setAllergies] = useState('');
  const [ice, setIce] = useState('');

  return (
    <div className="p-6 max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-stone-900">Family Members</h1>
          <p className="text-sm text-stone-500 mt-0.5">Roster, medical notes, and who is using this device</p>
        </div>
        <button
          type="button"
          onClick={() => setShowAdd((v) => !v)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium text-white bg-teal-500 hover:bg-teal-600 transition-colors"
        >
          <Plus size={15} /> Add Member
        </button>
      </div>

      {showAdd && (
        <form
          className="flex gap-2 mb-4"
          onSubmit={(e) => {
            e.preventDefault();
            if (!name.trim()) return;
            addFamilyMember(name);
            setName('');
            setShowAdd(false);
          }}
        >
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Member name"
            className="flex-1 px-3 py-2 rounded-xl border border-stone-200 text-sm"
          />
          <button type="submit" className="px-3 py-2 rounded-xl text-sm font-medium text-white bg-teal-500">
            Save
          </button>
        </form>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {FAMILY_MEMBERS.map((m) => {
          const isActive = m.id === activeMemberId;
          return (
            <Card key={m.id} className={`p-5 ${isActive ? 'ring-2 ring-indigo-400' : ''}`}>
              <div className="flex items-center gap-4">
                <MemberDot name={m.name} color={m.color} bg={m.bg} size="lg" />
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-stone-900">{m.name}</div>
                  <div className="text-xs text-stone-400 mt-0.5">
                    {isActive ? 'Using this device' : 'Household member'}
                  </div>
                </div>
                <button
                  type="button"
                  className="text-stone-300 hover:text-stone-600 p-1"
                  onClick={() => {
                    setEditId(editId === m.id ? null : m.id);
                    setAllergies('');
                    setIce('');
                  }}
                >
                  <Edit2 size={15} />
                </button>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {!isActive && (
                  <button
                    type="button"
                    onClick={() => setActiveMember(m.id)}
                    className="text-xs font-medium px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700"
                  >
                    Use this device
                  </button>
                )}
              </div>
              {editId === m.id && (
                <form
                  className="mt-3 space-y-2"
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (allergies.trim()) updateMemberMedical(m.id, 'allergies', allergies);
                    if (ice.trim()) updateMemberMedical(m.id, 'emergencyContact', ice);
                    setEditId(null);
                  }}
                >
                  <input
                    value={allergies}
                    onChange={(e) => setAllergies(e.target.value)}
                    placeholder="Allergies"
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm"
                  />
                  <input
                    value={ice}
                    onChange={(e) => setIce(e.target.value)}
                    placeholder="ICE contact / phone"
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm"
                  />
                  <button type="submit" className="px-3 py-1.5 rounded-lg text-xs font-medium text-white bg-teal-500">
                    Save medical info
                  </button>
                </form>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}

// ── Notifications Page ────────────────────────────────────────────────────────

function NotificationsView() {
  const { notifications: NOTES, markNotificationRead, dismissNotification } = useHub();
  return (
    <div className="p-6 max-w-3xl">
      <h1 className="text-xl font-semibold text-stone-900 mb-6">Notifications</h1>
      <div className="space-y-2">
        {NOTES.length === 0 ? (
          <Card className="p-6 text-sm text-stone-500">No notifications yet — you are all caught up.</Card>
        ) : null}
        {NOTES.map((n) => (
          <Card
            key={n.id}
            className={`p-4 flex items-start gap-3 ${n.unread ? '' : 'opacity-70'}`}
            onClick={() => {
              if (n.unread) markNotificationRead(n.id);
            }}
          >
            <div className="w-9 h-9 rounded-xl bg-pink-50 flex items-center justify-center flex-shrink-0">
              <Bell size={16} className="text-pink-500" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between gap-2">
                <div className="font-medium text-stone-900 text-sm">{n.title}</div>
                <span className="text-xs text-stone-400">{n.time}</span>
              </div>
              <div className="text-xs text-stone-500 mt-0.5">{n.body}</div>
            </div>
            {n.unread && <div className="w-2 h-2 rounded-full bg-pink-500 mt-2" />}
            <button
              type="button"
              title="Dismiss"
              className="text-stone-300 hover:text-stone-600 p-1"
              onClick={(e) => {
                e.stopPropagation();
                dismissNotification(n.id);
              }}
            >
              <X size={14} />
            </button>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ── Docs & Help Page ──────────────────────────────────────────────────────────

function DocsView() {
  const { docs: DOCS } = useHub();
  return (
    <div className="p-6 max-w-3xl">
      <h1 className="text-xl font-semibold text-stone-900 mb-2">Docs & Help</h1>
      <p className="text-sm text-stone-500 mb-6">Guides for running FamilyHub on your wall display</p>
      <div className="space-y-2">
        {DOCS.map(d => (
          <Card key={d.id} className="p-4 flex items-center gap-4" onClick={() => {}}>
            <div className="w-10 h-10 rounded-xl bg-cyan-50 flex items-center justify-center">
              <BookOpen size={18} className="text-cyan-600" />
            </div>
            <div className="flex-1">
              <div className="font-medium text-stone-900 text-sm">{d.title}</div>
              <div className="text-xs text-stone-500 mt-0.5">{d.body}</div>
            </div>
            <ChevronRight size={16} className="text-stone-300" />
          </Card>
        ))}
      </div>
    </div>
  );
}


// ── Collections (read-only FamilyData views; style-only shell) ────────────────

function ProjectsView() {
  const { projects } = useHub();
  return (
    <div className="figma-page max-w-4xl">
      <div className="figma-page-header">
        <div>
          <h1 className="figma-page-title">Projects</h1>
          <p className="figma-page-subtitle">Household projects from your saved FamilyData</p>
        </div>
      </div>
      {projects.length === 0 ? (
        <div className="figma-empty">No projects yet — existing data is preserved when you add some.</div>
      ) : (
        <div className="grid gap-4">
          {projects.map((p) => (
            <div key={p.id} className="figma-card p-6">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-semibold text-[var(--text-main)]">{p.name || p.title}</h3>
                  <p className="text-sm text-[var(--text-muted)] mt-1">{p.description || p.nextStep || 'Household project'}</p>
                </div>
                <span className="figma-chip figma-chip-mauve">{p.status}</span>
              </div>
              <div className="mt-4 flex flex-wrap gap-2 text-xs text-[var(--text-soft)]">
                {p.lead ? <span className="figma-chip">Lead: {p.lead}</span> : null}
                {p.targetDate ? <span className="figma-chip figma-chip-amber">Due {p.targetDate}</span> : null}
                {p.priority ? <span className="figma-chip figma-chip-blue">{p.priority}</span> : null}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function PhotosView() {
  return (
    <div className="figma-page max-w-3xl">
      <div className="figma-page-header">
        <div>
          <h1 className="figma-page-title">Photos</h1>
          <p className="figma-page-subtitle">Household photo collection</p>
        </div>
      </div>
      <div className="figma-empty">
        No photo gallery items are loaded in this shell yet. Existing FamilyData is untouched.
      </div>
    </div>
  );
}

function RoutinesView() {
  return (
    <div className="figma-page max-w-3xl">
      <div className="figma-page-header">
        <div>
          <h1 className="figma-page-title">Routines</h1>
          <p className="figma-page-subtitle">Daily and weekly household routines</p>
        </div>
      </div>
      <div className="figma-empty">
        No routines surface in this shell yet. Existing FamilyData is untouched.
      </div>
    </div>
  );
}

// ── Settings Page ─────────────────────────────────────────────────────────────

function SettingsView() {
  const { members, householdName, setHouseholdName, navigate, activeMemberId, setActiveMember } = useHub();
  const [nameDraft, setNameDraft] = useState(householdName);
  const [saved, setSaved] = useState(false);
  const activeName = members.find((m) => m.id === activeMemberId)?.name || 'Not set';

  return (
    <div className="figma-page max-w-2xl">
      <div className="figma-page-header">
        <div>
          <h1 className="figma-page-title">Settings</h1>
          <p className="figma-page-subtitle">Household preferences and device identity</p>
        </div>
      </div>
      <div className="space-y-6">
        <div>
          <div className="figma-sidebar-section-label mb-2">Household</div>
          <Card className="p-6 space-y-4">
            <div>
              <label className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide mb-1 block">Household name</label>
              <div className="flex gap-2">
                <input
                  value={nameDraft}
                  onChange={(e) => { setNameDraft(e.target.value); setSaved(false); }}
                  className="flex-1 px-4 py-3 rounded-[18px] border border-[var(--border-input)] text-sm focus:outline-none focus:border-[var(--accent-mauve)]"
                />
                <button
                  type="button"
                  onClick={() => {
                    setHouseholdName(nameDraft);
                    setSaved(true);
                  }}
                  className="figma-button-primary"
                >
                  Save
                </button>
              </div>
              {saved && <div className="text-xs text-emerald-600 mt-1">Saved</div>}
            </div>
            <div>
              <label className="text-xs font-semibold text-stone-500 uppercase tracking-wide mb-1 block">
                Who is using this device
              </label>
              <select
                value={activeMemberId || ''}
                onChange={(e) => setActiveMember(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm"
              >
                {members.map((m) => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
              <div className="text-xs text-stone-400 mt-1">Messages and med logs attribute to {activeName}</div>
            </div>
            <button type="button" onClick={() => navigate('family')} className="w-full flex items-center gap-4 text-left">
              <div className="w-9 h-9 rounded-xl bg-stone-100 flex items-center justify-center"><Users size={16} className="text-stone-600" /></div>
              <div className="flex-1">
                <div className="text-sm font-medium text-stone-900">Family members</div>
                <div className="text-xs text-stone-400 mt-0.5">{members.length} members</div>
              </div>
              <ChevronRight size={16} className="text-stone-300" />
            </button>
            <button type="button" onClick={() => navigate('notifications')} className="w-full flex items-center gap-4 text-left">
              <div className="w-9 h-9 rounded-xl bg-stone-100 flex items-center justify-center"><Bell size={16} className="text-stone-600" /></div>
              <div className="flex-1">
                <div className="text-sm font-medium text-stone-900">Notifications</div>
                <div className="text-xs text-stone-400 mt-0.5">Open alerts</div>
              </div>
              <ChevronRight size={16} className="text-stone-300" />
            </button>
          </Card>
        </div>
        <div>
          <div className="text-xs font-semibold text-stone-400 uppercase tracking-wide mb-2">App</div>
          <Card className="overflow-hidden">
            <button type="button" onClick={() => navigate('home')} className="w-full flex items-center gap-4 px-5 py-4 hover:bg-stone-50 text-left border-b border-stone-100">
              <div className="w-9 h-9 rounded-xl bg-stone-100 flex items-center justify-center"><Home size={16} className="text-stone-600" /></div>
              <div className="flex-1">
                <div className="text-sm font-medium text-stone-900">Home</div>
                <div className="text-xs text-stone-400 mt-0.5">Landing page when the app opens</div>
              </div>
              <ChevronRight size={16} className="text-stone-300" />
            </button>
            <button type="button" onClick={() => navigate('subscriptions')} className="w-full flex items-center gap-4 px-5 py-4 hover:bg-stone-50 text-left">
              <div className="w-9 h-9 rounded-xl bg-stone-100 flex items-center justify-center"><Key size={16} className="text-stone-600" /></div>
              <div className="flex-1">
                <div className="text-sm font-medium text-stone-900">Subscriptions</div>
                <div className="text-xs text-stone-400 mt-0.5">Password + who pays</div>
              </div>
              <ChevronRight size={16} className="text-stone-300" />
            </button>
          </Card>
        </div>
      </div>
    </div>
  );
}

// ── Preview chrome (Desktop vs App / tablet frame) ────────────────────────────

function PreviewModeToggle({
  mode,
  onChange,
}: {
  mode: PreviewMode;
  onChange: (mode: PreviewMode) => void;
}) {
  return (
    <div className="pointer-events-auto flex items-center gap-1 rounded-2xl border border-white/10 bg-stone-900/90 p-1 shadow-2xl backdrop-blur-md">
      <button
        type="button"
        onClick={() => onChange('desktop')}
        className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-all ${
          mode === 'desktop'
            ? 'bg-white text-stone-900 shadow-sm'
            : 'text-stone-300 hover:bg-white/10 hover:text-white'
        }`}
        aria-pressed={mode === 'desktop'}
      >
        <Monitor size={16} />
        Desktop view
      </button>
      <button
        type="button"
        onClick={() => onChange('app')}
        className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-all ${
          mode === 'app'
            ? 'bg-white text-stone-900 shadow-sm'
            : 'text-stone-300 hover:bg-white/10 hover:text-white'
        }`}
        aria-pressed={mode === 'app'}
      >
        <Tablet size={16} />
        App view
      </button>
    </div>
  );
}

// ── App Root ──────────────────────────────────────────────────────────────────


export default function App() {
  const [data, setData] = useFamilyData();
  const [view, setView] = useState<View>('home');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [quickAddMode, setQuickAddMode] = useState<'shopping' | 'pantry' | null>(null);
  const [previewMode, setPreviewMode] = useState<PreviewMode>(() => {
    try {
      const saved = localStorage.getItem(PREVIEW_STORAGE_KEY);
      return saved === 'app' || saved === 'desktop' ? saved : 'desktop';
    } catch {
      return 'desktop';
    }
  });

  const [vaultTick, setVaultTick] = useState(0);
  const vault = useMemo(() => {
    void vaultTick;
    return readHouseholdVault();
  }, [vaultTick]);

  const hub = useMemo<HubContextValue>(() => {
    const shoppingItems = mapHubShopping(data);
    const pantryItems = mapHubPantry(data);
    const messages = mapHubMessages(data);
    const notifications = mapHubNotifications(data);
    return {
      members: mapHubMembers(data),
      shoppingItems,
      pantryItems,
      storagePlaces: mapHubStoragePlaces(data),
      chores: mapHubChores(data),
      events: mapHubEvents(data),
      messages,
      pets: mapHubPets(data),
      emergencyItems: mapHubEmergency(data),
      subscriptions: mapHubSubscriptions(vault, data),
      notifications,
      docs: mapHubDocs(data),
      projects: Array.isArray(data.projects) ? data.projects : [],
      setPreviewMode,
      previewMode,
      badges: {
        messages: messages.filter((m) => !m.read).length,
        shopping: shoppingItems.filter((i) => !i.checked).length,
        pantry: pantryItems.filter((i) => i.status === 'out' || i.status === 'low').length,
        notifications: notifications.filter((n) => n.unread).length,
      },
      activeMemberId: sessionMemberId(data),
      toggleShoppingItem: (id) => setData((prev) => toggleShoppingPurchased(prev, id)),
      deleteShoppingItem: (id) => setData((prev) => bridgeDeleteShopping(prev, id)),
      addShoppingItem: (name, qty) => setData((prev) => bridgeAddShopping(prev, name, qty)),
      updatePantryStock: (id, qty) => setData((prev) => updatePantryQuantity(prev, id, qty)),
      addPantryItem: (name, qty, place) => setData((prev) => bridgeAddPantry(prev, name, qty, place)),
      addStoragePlace: (name) => setData((prev) => bridgeAddStoragePlace(prev, name)),
      setPantryItemPlace: (itemId, placeName) =>
        setData((prev) => bridgeSetPantryItemPlace(prev, itemId, placeName)),
      toggleChore: (id) => setData((prev) => bridgeToggleChore(prev, id)),
      postMessage: (text) => {
        setData((prev) => postFamilyMessage(prev, text, sessionMemberId(prev)));
      },
      addSubscription: (name, password, payerMemberId) => {
        writeHouseholdVault(
          addVaultSubscription(readHouseholdVault(), { name, password, payerMemberId }),
        );
        setVaultTick((n) => n + 1);
      },
      updateSubscription: (id, patch) => {
        writeHouseholdVault(updateVaultSubscription(readHouseholdVault(), id, patch));
        setVaultTick((n) => n + 1);
      },
      removeSubscription: (id) => {
        writeHouseholdVault(deleteVaultSubscription(readHouseholdVault(), id));
        setVaultTick((n) => n + 1);
      },
      addChore: (title, memberId) => setData((prev) => addChoreTask(prev, title, memberId)),
      addEvent: (input) => setData((prev) => addPlannerEvent(prev, input)),
      setActiveMember: (memberId) => setData((prev) => bridgeSetActiveMember(prev, memberId)),
      addFamilyMember: (name) => setData((prev) => bridgeAddMember(prev, name)),
      updateMemberMedical: (memberId, field, value) =>
        setData((prev) => updateMemberField(prev, memberId, { [field]: value })),
      addEmergencyNote: (title, body) => setData((prev) => addPreparednessNote(prev, title, body)),
      updateEmergencyNote: (docId, value) => setData((prev) => updatePreparednessNote(prev, docId, value)),
      addPet: (name, species) => setData((prev) => bridgeAddPet(prev, name, species)),
      renamePet: (petId, name) => setData((prev) => bridgeUpdatePet(prev, petId, { name })),
      logFleaDose: (petId) => setData((prev) => logPetFleaDose(prev, petId)),
      markNotificationRead: (id) => setData((prev) => bridgeMarkNotificationRead(prev, id)),
      dismissNotification: (id) => setData((prev) => bridgeDismissNotification(prev, id)),
      householdName: data.adminSettings.householdName || 'FamilyHub',
      setHouseholdName: (name) => setData((prev) => updateHouseholdName(prev, name)),
      navigate: setView,
    };
  }, [data, vault, previewMode]);

  useEffect(() => {
    try {
      localStorage.setItem(PREVIEW_STORAGE_KEY, previewMode);
    } catch {
      /* ignore */
    }
  }, [previewMode]);

  useEffect(() => {
    const check = () => {
      if (previewMode === 'app') {
        setSidebarCollapsed(false);
        return;
      }
      setSidebarCollapsed(window.innerWidth < 1024);
    };
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, [previewMode]);

  const renderView = () => {
    switch (view) {
      case 'home':
        return (
          <HomeView
            onNavigate={setView}
            onQuickAdd={setQuickAddMode}
            shoppingItems={hub.shoppingItems}
            pantryItems={hub.pantryItems}
            chores={hub.chores}
            onToggleChore={hub.toggleChore}
          />
        );
      case 'messages':
        return <MessagesView />;
      case 'calendar':
        return <CalendarView />;
      case 'shopping':
        return (
          <ShoppingView
            items={hub.shoppingItems}
            onToggle={hub.toggleShoppingItem}
            onDelete={hub.deleteShoppingItem}
            onAdd={hub.addShoppingItem}
          />
        );
      case 'pantry':
        return (
          <PantryView
            items={hub.pantryItems}
            onUpdateStock={hub.updatePantryStock}
            onAdd={hub.addPantryItem}
          />
        );
      case 'cleaning':
        return <CleaningView chores={hub.chores} onToggle={hub.toggleChore} />;
      case 'emergency':
        return <EmergencyView />;
      case 'pets':
        return <PetsView />;
      case 'subscriptions':
        return <SubscriptionsView />;
      case 'planner':
        return <PlannerView />;
      case 'family':
        return <FamilyMembersView />;
      case 'notifications':
        return <NotificationsView />;
      case 'docs':
        return <DocsView />;
      case 'projects':
        return <ProjectsView />;
      case 'photos':
        return <PhotosView />;
      case 'routines':
        return <RoutinesView />;
      case 'wall':
        return (
          <HomeView
            onNavigate={setView}
            onQuickAdd={setQuickAddMode}
            shoppingItems={hub.shoppingItems}
            pantryItems={hub.pantryItems}
            chores={hub.chores}
            onToggleChore={hub.toggleChore}
          />
        );
      case 'settings':
        return <SettingsView />;
    }
  };

  const shell = (
    <div className="figma-app-shell">
      <Sidebar
        current={view}
        onChange={setView}
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed((p) => !p)}
      />
      <main className="min-w-0 flex-1 overflow-y-auto">
        {renderView()}
      </main>

      {quickAddMode && (
        <QuickAddModal
          mode={quickAddMode}
          onClose={() => setQuickAddMode(null)}
          onAdd={(name, qty) => {
            if (quickAddMode === 'shopping') hub.addShoppingItem(name, qty);
            else hub.addPantryItem(name, qty);
          }}
        />
      )}
    </div>
  );

  return (
    <HubContext.Provider value={hub}>
      <div className="relative h-screen w-screen overflow-hidden bg-stone-950">
        <div className="pointer-events-none absolute inset-x-0 top-0 z-50 flex justify-center pt-3 sm:pt-4">
          <PreviewModeToggle mode={previewMode} onChange={setPreviewMode} />
        </div>

        {previewMode === 'desktop' ? (
          <div className="h-full w-full pt-14">{shell}</div>
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-[radial-gradient(circle_at_top,#292524_0%,#0c0a09_55%)] px-4 pb-6 pt-16">
            <div className="flex w-full max-w-[1180px] flex-col items-center gap-3">
              <div className="text-center text-xs font-medium tracking-wide text-stone-400">
                App view · landscape tablet frame (wall display)
              </div>
              <div
                className="w-full overflow-hidden rounded-[28px] border border-stone-700 bg-stone-900 shadow-[0_40px_80px_rgba(0,0,0,0.45)]"
                style={{ aspectRatio: '16 / 10', maxHeight: 'min(820px, calc(100vh - 7.5rem))' }}
              >
                <div className="flex h-full flex-col p-3">
                  <div className="mb-2 flex items-center justify-center">
                    <div className="h-1.5 w-24 rounded-full bg-stone-700" />
                  </div>
                  <div className="min-h-0 flex-1 overflow-hidden rounded-2xl bg-[#F8F6F2]">
                    {shell}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </HubContext.Provider>
  );
}
