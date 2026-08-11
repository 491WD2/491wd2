import React, { createContext, useContext, useMemo, useState, useEffect, useRef } from 'react';
import {
  Home, MessageSquare, Calendar, ShoppingCart, Package,
  Wrench, AlertTriangle, Heart, CreditCard, FolderOpen,
  BookOpen, Settings, Plus, ScanLine,
  Bell, Search, X, Check, ChevronRight,
  Trash2, AlertCircle, Menu, ChevronDown,
  Users, Wind, Droplets, Star, Tag,
  Edit2, Archive, ShieldAlert,
  PawPrint, CalendarCheck, Bookmark, Key, FileText,
  Monitor, Tablet,
} from 'lucide-react';
import { useFamilyData } from '../hooks/useFamilyData';
import {
  addPantryItem as bridgeAddPantry,
  addShoppingItem as bridgeAddShopping,
  addVaultPassword,
  addVaultSubscription,
  deleteShoppingItem as bridgeDeleteShopping,
  mapHubChores,
  mapHubDocs,
  mapHubEvents,
  mapHubMembers,
  mapHubMessages,
  mapHubNotifications,
  mapHubPantry,
  mapHubPasswords,
  mapHubPets,
  mapHubShopping,
  mapHubSubscriptions,
  postFamilyMessage,
  readHouseholdVault,
  toggleChoreDone as bridgeToggleChore,
  toggleShoppingPurchased,
  updatePantryQuantity,
  writeHouseholdVault,
  type HubChore,
  type HubDoc,
  type HubEvent,
  type HubMember,
  type HubMessage,
  type HubNotification,
  type HubPantryItem,
  type HubPassword,
  type HubPet,
  type HubShoppingItem,
  type HubSubscription,
} from './bridge';

// ── Types ─────────────────────────────────────────────────────────────────────

type PreviewMode = 'desktop' | 'app';

type View =
  | 'home' | 'messages' | 'calendar' | 'shopping' | 'pantry'
  | 'cleaning' | 'emergency' | 'pets' | 'subscriptions'
  | 'planner' | 'family' | 'notifications' | 'docs' | 'settings';

const PREVIEW_STORAGE_KEY = '491wd-preview-mode';

type HubContextValue = {
  members: HubMember[];
  shoppingItems: HubShoppingItem[];
  pantryItems: HubPantryItem[];
  chores: HubChore[];
  events: HubEvent[];
  messages: HubMessage[];
  pets: HubPet[];
  subscriptions: HubSubscription[];
  passwords: HubPassword[];
  notifications: HubNotification[];
  docs: HubDoc[];
  badges: { messages: number; shopping: number; pantry: number };
  toggleShoppingItem: (id: string) => void;
  deleteShoppingItem: (id: string) => void;
  addShoppingItem: (name: string, qty: string) => void;
  updatePantryStock: (id: string, qty: number) => void;
  addPantryItem: (name: string, qty: string) => void;
  toggleChore: (id: string) => void;
  postMessage: (text: string) => void;
  addSubscription: (name: string, amount: number) => void;
  addPassword: (label: string, username: string, hint: string) => void;
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



const EMERGENCY_ITEMS = [
  { id: '1', cat: 'Contacts',      label: 'Emergency services', value: '911',            icon: ShieldAlert, color: '#EF4444' },
  { id: '2', cat: 'Contacts',      label: 'Poison Control',     value: '1-800-222-1222', icon: AlertTriangle, color: '#F97316' },
  { id: '3', cat: 'Medical',       label: 'Hershel — blood type',value: 'O+',            icon: Heart, color: '#EC4899' },
  { id: '4', cat: 'Medical',       label: 'Lorraine — allergies',value: 'Penicillin',    icon: Heart, color: '#EC4899' },
  { id: '5', cat: 'Preparedness',  label: 'Go-bag location',    value: 'Hall closet, top shelf', icon: Archive, color: '#4F46E5' },
  { id: '6', cat: 'Preparedness',  label: 'Water supply',       value: '5 gallons (rotate Aug 30)', icon: Droplets, color: '#0EA5E9' },
];

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
      className={`bg-white rounded-2xl border border-black/[0.06] shadow-sm ${onClick ? 'cursor-pointer hover:shadow-md transition-shadow duration-200' : ''} ${className}`}
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
  if (status === 'out')  return <span className="text-xs font-semibold text-red-500 bg-red-50 px-2 py-0.5 rounded-full">Out</span>;
  if (status === 'low')  return <span className="text-xs font-semibold text-amber-500 bg-amber-50 px-2 py-0.5 rounded-full">Low</span>;
  if (status === 'ok')   return <span className="text-xs font-semibold text-sky-500 bg-sky-50 px-2 py-0.5 rounded-full">OK</span>;
  return <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">Good</span>;
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

// ── Sidebar ───────────────────────────────────────────────────────────────────

const PRIMARY_NAV: NavItem[] = [
  { id: 'home',          label: 'Home',                icon: Home,          color: '#4F46E5' },
  { id: 'messages',      label: 'Messages',            icon: MessageSquare, color: '#DB2777' },
  { id: 'calendar',      label: 'Calendar',            icon: Calendar,      color: '#D97706' },
  { id: 'shopping',      label: 'Shopping',            icon: ShoppingCart,  color: '#10B981' },
  { id: 'pantry',        label: 'Pantry & Inventory',  icon: Package,       color: '#84CC16' },
  { id: 'cleaning',      label: 'Cleaning / Kitchen',  icon: Wrench,        color: '#0EA5E9' },
  { id: 'emergency',     label: 'Emergency Planning',  icon: ShieldAlert,   color: '#EF4444' },
];

const TOOLS_NAV: NavItem[] = [
  { id: 'pets',          label: 'Pets',                    icon: PawPrint,      color: '#F97316' },
  { id: 'subscriptions', label: 'Subscriptions & Passwords', icon: CreditCard,  color: '#8B5CF6' },
  { id: 'planner',       label: 'Planner',                 icon: CalendarCheck, color: '#3B82F6' },
  { id: 'family',        label: 'Family Members',          icon: Users,         color: '#14B8A6' },
  { id: 'notifications', label: 'Notifications',           icon: Bell,          color: '#EC4899' },
  { id: 'docs',          label: 'Docs & Help',             icon: FileText,      color: '#06B6D4' },
];

const SYSTEM_NAV: NavItem[] = [
  { id: 'settings', label: 'Settings', icon: Settings, color: '#64748B' },
];

function Sidebar({ current, onChange, collapsed, onToggle }: {
  current: View; onChange: (v: View) => void; collapsed: boolean; onToggle: () => void;
}) {
  const { members: FAMILY_MEMBERS, badges } = useHub();
  const primaryNav = PRIMARY_NAV.map((item) => {
    if (item.id === 'messages' && badges.messages > 0) return { ...item, badge: badges.messages };
    if (item.id === 'shopping' && badges.shopping > 0) return { ...item, badge: badges.shopping };
    if (item.id === 'pantry' && badges.pantry > 0) return { ...item, badge: badges.pantry };
    return item;
  });
  function NavLink({ item }: { item: NavItem }) {
    const active = current === item.id;
    const Icon = item.icon;
    return (
      <button
        onClick={() => onChange(item.id)}
        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group relative
          ${active ? 'text-white shadow-sm' : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'}`}
        style={active ? { backgroundColor: item.color } : {}}
        title={collapsed ? item.label : undefined}
      >
        <Icon size={18} className="flex-shrink-0" style={active ? { color: '#fff' } : { color: item.color }} />
        {!collapsed && <span className="flex-1 text-left truncate">{item.label}</span>}
        {!collapsed && item.badge && !active && (
          <span className="text-xs font-semibold px-1.5 py-0.5 rounded-full min-w-[20px] text-center"
            style={{ backgroundColor: item.color + '18', color: item.color }}>
            {item.badge}
          </span>
        )}
        {collapsed && item.badge && !active && (
          <span className="absolute top-1 right-1 w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
        )}
      </button>
    );
  }

  return (
    <aside
      className="flex h-full flex-col flex-shrink-0 overflow-hidden border-r border-black/[0.06] bg-white transition-all duration-300"
      style={{ width: collapsed ? '64px' : '240px' }}
    >
      {/* Brand */}
      <div className="flex items-center gap-2.5 px-4 py-5 border-b border-black/[0.06]">
        <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center flex-shrink-0">
          <Home size={16} className="text-white" />
        </div>
        {!collapsed && (
          <div>
            <div className="font-semibold text-stone-900 text-sm leading-tight">FamilyHub</div>
            <div className="text-xs text-stone-400 leading-tight">Household Command</div>
          </div>
        )}
        <button onClick={onToggle} className="ml-auto text-stone-400 hover:text-stone-700 transition-colors flex-shrink-0">
          <Menu size={16} />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-4">
        <div>
          {!collapsed && <div className="px-3 pb-1 text-[10px] font-semibold uppercase tracking-widest text-stone-400">Primary</div>}
          <div className="space-y-0.5">
            {primaryNav.map(item => <NavLink key={item.id} item={item} />)}
          </div>
        </div>
        <div>
          {!collapsed && <div className="px-3 pb-1 text-[10px] font-semibold uppercase tracking-widest text-stone-400">Household Tools</div>}
          <div className="space-y-0.5">
            {TOOLS_NAV.map(item => <NavLink key={item.id} item={item} />)}
          </div>
        </div>
        <div>
          {!collapsed && <div className="px-3 pb-1 text-[10px] font-semibold uppercase tracking-widest text-stone-400">System</div>}
          <div className="space-y-0.5">
            {SYSTEM_NAV.map(item => <NavLink key={item.id} item={item} />)}
          </div>
        </div>
      </nav>

      {/* Family avatars */}
      {!collapsed && (
        <div className="px-4 py-4 border-t border-black/[0.06]">
          <div className="text-[10px] font-semibold uppercase tracking-widest text-stone-400 mb-2">Family</div>
          <div className="flex flex-wrap gap-1.5">
            {FAMILY_MEMBERS.map(m => (
              <MemberDot key={m.id} name={m.name} color={m.color} bg={m.bg} size="sm" />
            ))}
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
        <span className="text-6xl lg:text-7xl font-light text-stone-900 tracking-tight" style={{ fontFamily: "'Fraunces', serif" }}>
          {h}:{m}
        </span>
        <span className="text-xl font-light text-stone-500 mb-2" style={{ fontFamily: "'Fraunces', serif" }}>{ampm}</span>
      </div>
      <div className="text-stone-500 text-sm mt-1">{day}, {date}</div>
    </div>
  );
}

function WeatherStrip() {
  return (
    <div className="flex items-center gap-5 flex-wrap">
      <div className="flex items-center gap-2">
        <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center">
          <span className="text-lg">⛅</span>
        </div>
        <div>
          <div className="font-semibold text-stone-900 text-lg leading-none">74°F</div>
          <div className="text-xs text-stone-500">Partly cloudy</div>
        </div>
      </div>
      <div className="flex items-center gap-3 text-xs text-stone-500">
        <span className="flex items-center gap-1"><Droplets size={12} className="text-sky-400" /> 55%</span>
        <span className="flex items-center gap-1"><Wind size={12} className="text-stone-400" /> 8 mph</span>
        <span className="flex items-center gap-1"><span className="text-stone-400">H</span> 79° <span className="text-stone-400 ml-1">L</span> 62°</span>
      </div>
    </div>
  );
}

function HomeView({ onNavigate, onQuickAdd, shoppingItems, pantryItems, chores, onToggleChore }: {
  onNavigate: (v: View) => void;
  onQuickAdd: (mode: 'shopping' | 'pantry') => void;
  shoppingItems: HubShoppingItem[];
  pantryItems: HubPantryItem[];
  chores: HubChore[];
  onToggleChore: (id: string) => void;
}) {
  const { members: FAMILY_MEMBERS, messages: MESSAGES, events: EVENTS } = useHub();
  const unchecked = shoppingItems.filter(i => !i.checked);
  const alerts = pantryItems.filter(i => i.status === 'out' || i.status === 'low');
  const outCount = pantryItems.filter(i => i.status === 'out').length;
  const lowCount = pantryItems.filter(i => i.status === 'low').length;
  const todayChores = chores.filter(c => c.due === 'Today');
  const unreadMessages = MESSAGES.filter(m => !m.read);

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Header: clock + weather */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <Clock />
        <WeatherStrip />
      </div>

      {/* Family member buttons */}
      <div>
        <div className="text-xs font-semibold uppercase tracking-widest text-stone-400 mb-3">Who's checking in?</div>
        <div className="flex gap-3 flex-wrap">
          {FAMILY_MEMBERS.map(m => (
            <button
              key={m.id}
              className="flex items-center gap-2.5 px-4 py-2.5 rounded-full border transition-all duration-150 hover:shadow-md active:scale-95"
              style={{ borderColor: m.color + '30', backgroundColor: m.bg }}
            >
              <MemberDot name={m.name} color={m.color} bg="transparent" size="sm" />
              <span className="font-medium text-sm" style={{ color: m.color }}>{m.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Quick Add */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => onQuickAdd('shopping')}
          className="flex items-center gap-3 px-5 py-4 rounded-2xl text-white font-semibold text-sm transition-all hover:opacity-90 hover:shadow-lg active:scale-98"
          style={{ backgroundColor: '#10B981' }}
        >
          <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center">
            <Plus size={18} />
          </div>
          <div className="text-left">
            <div className="font-semibold">Add to Shopping</div>
            <div className="text-xs text-white/70">{unchecked.length} items in list</div>
          </div>
        </button>
        <button
          onClick={() => onQuickAdd('pantry')}
          className="flex items-center gap-3 px-5 py-4 rounded-2xl text-white font-semibold text-sm transition-all hover:opacity-90 hover:shadow-lg active:scale-98"
          style={{ backgroundColor: '#6D9C0E' }}
        >
          <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center">
            <Plus size={18} />
          </div>
          <div className="text-left">
            <div className="font-semibold">Add to Inventory</div>
            <div className="text-xs text-white/70">{alerts.length} items need attention</div>
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
            {EVENTS.slice(0, 4).map(evt => (
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
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="px-6 pt-6 pb-4 bg-white border-b border-stone-100">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-semibold text-stone-900">Shopping</h1>
            <p className="text-sm text-stone-500 mt-0.5">{unchecked.filter(i=>!i.checked).length} items remaining</p>
          </div>
          <div className="flex gap-2">
            <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium bg-stone-100 text-stone-600 hover:bg-stone-200 transition-colors">
              <ScanLine size={15} />
              <span className="hidden sm:inline">Scan</span>
            </button>
            <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium bg-stone-100 text-stone-600 hover:bg-stone-200 transition-colors">
              <Users size={15} />
              <span className="hidden sm:inline">Share</span>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-stone-100 p-1 rounded-xl w-fit">
          {(['current','saved','shared'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all
                ${tab === t ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}
            >
              {t === 'current' ? 'Current List' : t === 'saved' ? 'Saved Lists' : 'Shared List'}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {tab === 'current' && (
          <div className="max-w-2xl">
            {/* Quick add bar */}
            <form onSubmit={handleAdd} className="flex gap-2 mb-5">
              <input
                value={newItem}
                onChange={e => setNewItem(e.target.value)}
                placeholder="Add item…"
                className="flex-1 px-4 py-2.5 bg-white border border-stone-200 rounded-xl text-sm placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-400"
              />
              <input
                value={newQty}
                onChange={e => setNewQty(e.target.value)}
                placeholder="Qty"
                className="w-24 px-3 py-2.5 bg-white border border-stone-200 rounded-xl text-sm placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-400"
              />
              <button type="submit" className="px-4 py-2.5 bg-emerald-500 text-white rounded-xl text-sm font-medium hover:bg-emerald-600 transition-colors flex items-center gap-1">
                <Plus size={16} /> Add
              </button>
            </form>

            {/* Search + filter */}
            <div className="flex gap-2 mb-4">
              <div className="flex-1 relative">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search items…"
                  className="w-full pl-9 pr-4 py-2 bg-white border border-stone-200 rounded-xl text-sm placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-400"
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
                    className="flex items-center gap-3 px-4 py-3 bg-white rounded-xl border border-stone-100 hover:border-stone-200 group transition-all">
                    <button
                      onClick={() => onToggle(item.id)}
                      className="w-5 h-5 rounded-full border-2 border-stone-300 flex items-center justify-center flex-shrink-0 hover:border-emerald-500 transition-colors"
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
  onAdd: (name: string, qty: string) => void;
}) {
  const [filter, setFilter] = useState<'all'|'out'|'low'|'good'>('all');
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'grid'|'list'>('grid');
  const [scanOpen, setScanOpen] = useState(false);

  const filtered = items
    .filter(i => filter === 'all' || i.status === filter || (filter === 'good' && (i.status === 'good' || i.status === 'ok')))
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
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="px-6 pt-6 pb-4 bg-white border-b border-stone-100">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-semibold text-stone-900">Pantry & Inventory</h1>
            <p className="text-sm text-stone-500 mt-0.5">{items.length} items · {outCount + lowCount} need attention</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setScanOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium bg-stone-100 text-stone-600 hover:bg-stone-200 transition-colors"
            >
              <ScanLine size={15} />
              <span className="hidden sm:inline">Scan Item</span>
            </button>
            <button
              onClick={() => onAdd('New item', '1')}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium text-white transition-colors"
              style={{ backgroundColor: '#6D9C0E' }}
            >
              <Plus size={15} />
              <span className="hidden sm:inline">Add Item</span>
            </button>
          </div>
        </div>

        {/* Alerts summary */}
        {(outCount > 0 || lowCount > 0) && (
          <div className="flex gap-2 mb-4 flex-wrap">
            {outCount > 0 && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-red-50 rounded-lg border border-red-100">
                <div className="w-2 h-2 rounded-full bg-red-500" />
                <span className="text-xs font-medium text-red-600">{outCount} out of stock</span>
              </div>
            )}
            {lowCount > 0 && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 rounded-lg border border-amber-100">
                <div className="w-2 h-2 rounded-full bg-amber-500" />
                <span className="text-xs font-medium text-amber-600">{lowCount} running low</span>
              </div>
            )}
          </div>
        )}

        {/* Filters + search + view toggle */}
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
                <span className={`text-xs px-1 rounded ${filter === f.key ? 'text-stone-400' : 'text-stone-400'}`}>
                  {f.count}
                </span>
              </button>
            ))}
          </div>
          <div className="relative flex-1 min-w-[180px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search pantry…"
              className="w-full pl-8 pr-4 py-2 bg-stone-100 border border-transparent rounded-xl text-sm placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-lime-500 focus:bg-white"
            />
          </div>
          <div className="flex gap-1 bg-stone-100 p-1 rounded-xl ml-auto">
            <button onClick={() => setViewMode('grid')} className={`p-1.5 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm' : ''}`}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="1" y="1" width="6" height="6" rx="1.5" fill={viewMode==='grid'?'#1C1917':'#94a3b8'}/><rect x="9" y="1" width="6" height="6" rx="1.5" fill={viewMode==='grid'?'#1C1917':'#94a3b8'}/><rect x="1" y="9" width="6" height="6" rx="1.5" fill={viewMode==='grid'?'#1C1917':'#94a3b8'}/><rect x="9" y="9" width="6" height="6" rx="1.5" fill={viewMode==='grid'?'#1C1917':'#94a3b8'}/></svg>
            </button>
            <button onClick={() => setViewMode('list')} className={`p-1.5 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white shadow-sm' : ''}`}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="1" y="3" width="14" height="2" rx="1" fill={viewMode==='list'?'#1C1917':'#94a3b8'}/><rect x="1" y="7" width="14" height="2" rx="1" fill={viewMode==='list'?'#1C1917':'#94a3b8'}/><rect x="1" y="11" width="14" height="2" rx="1" fill={viewMode==='list'?'#1C1917':'#94a3b8'}/></svg>
            </button>
          </div>
        </div>
      </div>

      {/* Items */}
      <div className="flex-1 overflow-y-auto p-6">
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {filtered.map(item => {
              const catColor = CATEGORY_COLORS[item.category] || '#94a3b8';
              return (
                <div key={item.id}
                  className="bg-white rounded-2xl border border-stone-100 p-4 hover:border-stone-200 hover:shadow-sm transition-all group">
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ backgroundColor: catColor + '18' }}>
                      <Package size={14} style={{ color: catColor }} />
                    </div>
                    <StatusChip status={item.status} />
                  </div>
                  <div className="font-medium text-stone-900 text-sm leading-tight mb-1">{item.name}</div>
                  <div className="text-xs text-stone-400 mb-3">{item.category}</div>
                  <StockBar qty={item.qty} max={item.max} status={item.status} />
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-stone-500">{item.qty} / {item.max} {item.unit}</span>
                    {item.expiry && <span className="text-xs text-stone-400">Exp {item.expiry}</span>}
                  </div>
                  <div className="flex gap-1 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => onUpdateStock(item.id, item.qty + 1)}
                      className="flex-1 text-xs py-1.5 rounded-lg font-medium text-white transition-colors"
                      style={{ backgroundColor: catColor }}
                    >
                      + Add Stock
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="max-w-3xl space-y-1.5">
            {filtered.map(item => {
              const catColor = CATEGORY_COLORS[item.category] || '#94a3b8';
              return (
                <div key={item.id}
                  className="bg-white rounded-xl border border-stone-100 px-4 py-3 flex items-center gap-4 hover:border-stone-200 group transition-all">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: catColor + '18' }}>
                    <Package size={14} style={{ color: catColor }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-stone-900 text-sm">{item.name}</span>
                      <span className="text-xs px-1.5 py-0.5 rounded-md" style={{ backgroundColor: catColor + '18', color: catColor }}>{item.category}</span>
                    </div>
                    <div className="mt-1.5 flex items-center gap-3">
                      <StockBar qty={item.qty} max={item.max} status={item.status} />
                      <span className="text-xs text-stone-400 flex-shrink-0">{item.qty}/{item.max} {item.unit}</span>
                    </div>
                  </div>
                  <StatusChip status={item.status} />
                  <button
                    onClick={() => onUpdateStock(item.id, item.qty + 1)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-xs px-3 py-1.5 rounded-lg font-medium text-white flex-shrink-0"
                    style={{ backgroundColor: catColor }}
                  >
                    + Stock
                  </button>
                  {item.expiry && <span className="text-xs text-stone-400 hidden lg:block flex-shrink-0">Exp {item.expiry}</span>}
                </div>
              );
            })}
          </div>
        )}

        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Package size={40} className="text-stone-200 mb-3" />
            <div className="text-stone-500 font-medium">No items found</div>
            <div className="text-sm text-stone-400 mt-1">Try adjusting your filters or search</div>
          </div>
        )}
      </div>

      {/* Scan modal */}
      {scanOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={() => setScanOpen(false)}>
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-stone-900">Scan Item</h3>
              <button onClick={() => setScanOpen(false)} className="text-stone-400 hover:text-stone-700"><X size={20} /></button>
            </div>
            <div className="bg-stone-100 rounded-xl h-48 flex flex-col items-center justify-center gap-3 mb-4">
              <ScanLine size={40} className="text-stone-400" />
              <span className="text-sm text-stone-500">Point camera at barcode</span>
              <span className="text-xs text-stone-400">Powered by OpenFoodFacts</span>
            </div>
            <div className="text-center text-xs text-stone-400">Or enter barcode manually</div>
            <input placeholder="e.g. 012345678901" className="w-full mt-2 px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm text-center focus:outline-none focus:ring-2 focus:ring-lime-500" />
            <button className="w-full mt-3 py-2.5 rounded-xl text-white text-sm font-medium" style={{ backgroundColor: '#6D9C0E' }}>
              Look Up
            </button>
          </div>
        </div>
      )}
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
        <div className="px-4 pt-5 pb-4 border-b border-stone-100">
          <h2 className="font-semibold text-stone-900">Messages</h2>
          <p className="text-xs text-stone-500 mt-1">Family board · {unread} unread</p>
        </div>
        <div className="flex-1 overflow-y-auto">
          <div className="w-full px-4 py-3.5 flex items-center gap-3 bg-indigo-50 border-b border-stone-50">
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
  const { members: FAMILY_MEMBERS, events: EVENTS } = useHub();

  const days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  const today = new Date();
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const startDay = startOfMonth.getDay();
  const monthName = today.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <div className="p-6 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-stone-900">Calendar</h1>
        <div className="flex items-center gap-2">
          <button className="p-2 rounded-xl hover:bg-stone-100 transition-colors text-stone-600">‹</button>
          <span className="text-sm font-medium text-stone-900 px-2">{monthName}</span>
          <button className="p-2 rounded-xl hover:bg-stone-100 transition-colors text-stone-600">›</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Mini calendar */}
        <div className="lg:col-span-2">
          <Card className="p-5">
            <div className="grid grid-cols-7 mb-2">
              {days.map(d => <div key={d} className="text-center text-xs font-semibold text-stone-400 py-1">{d}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: startDay }).map((_, i) => <div key={`e-${i}`} />)}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const isToday = day === today.getDate();
                const hasEvent = EVENTS.some(e => e.date === 'Today' && isToday);
                return (
                  <button key={day}
                    className={`aspect-square flex flex-col items-center justify-center rounded-xl text-sm transition-all
                      ${isToday ? 'bg-indigo-600 text-white font-semibold' : 'hover:bg-stone-100 text-stone-700'}`}
                  >
                    {day}
                    {hasEvent && <div className={`w-1 h-1 rounded-full mt-0.5 ${isToday ? 'bg-white' : 'bg-amber-500'}`} />}
                  </button>
                );
              })}
            </div>
          </Card>
        </div>

        {/* Events list */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-stone-900">Upcoming</h3>
            <button className="flex items-center gap-1 text-xs text-indigo-600 font-medium">
              <Plus size={12} /> Add event
            </button>
          </div>
          {EVENTS.map(evt => (
            <Card key={evt.id} className="p-4">
              <div className="flex items-start gap-3">
                <div className="w-1 h-full min-h-[48px] rounded-full flex-shrink-0" style={{ backgroundColor: evt.color }} />
                <div className="flex-1">
                  <div className="font-medium text-stone-900 text-sm">{evt.title}</div>
                  <div className="text-xs text-stone-500 mt-1">{evt.date} · {evt.time}</div>
                  <div className="mt-2">
                    {FAMILY_MEMBERS.filter(m => m.name === evt.who || evt.who === 'Family').map(m => (
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
  const { members: FAMILY_MEMBERS } = useHub();
  const today = chores.filter(c => c.due === 'Today');
  const upcoming = chores.filter(c => c.due !== 'Today');

  return (
    <div className="p-6 max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-stone-900">Cleaning & Kitchen</h1>
        <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium text-white bg-sky-500 hover:bg-sky-600 transition-colors">
          <Plus size={15} /> Add Chore
        </button>
      </div>

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

function EmergencyView() {
  const categories = [...new Set(EMERGENCY_ITEMS.map(i => i.cat))];

  return (
    <div className="p-6 max-w-3xl">
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-xl font-semibold text-stone-900">Emergency Planning</h1>
        <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium text-white bg-red-500 hover:bg-red-600 transition-colors">
          <Plus size={15} /> Add Info
        </button>
      </div>
      <p className="text-sm text-stone-500 mb-6">Critical contacts, medical info, and preparedness checklist</p>

      <div className="mb-5 p-4 bg-red-50 rounded-2xl border border-red-100 flex items-center gap-3">
        <ShieldAlert size={20} className="text-red-500 flex-shrink-0" />
        <div>
          <div className="font-semibold text-red-700 text-sm">Emergency Services: 911</div>
          <div className="text-xs text-red-500">Poison Control: 1-800-222-1222</div>
        </div>
      </div>

      <div className="space-y-6">
        {categories.map(cat => (
          <div key={cat}>
            <h3 className="text-sm font-semibold text-stone-500 uppercase tracking-wide mb-2">{cat}</h3>
            <div className="space-y-2">
              {EMERGENCY_ITEMS.filter(i => i.cat === cat).map(item => {
                const Icon = item.icon;
                return (
                  <Card key={item.id} className="p-4 flex items-center gap-4">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: item.color + '18' }}>
                      <Icon size={16} style={{ color: item.color }} />
                    </div>
                    <div className="flex-1">
                      <div className="text-xs text-stone-400 font-medium">{item.label}</div>
                      <div className="text-sm font-semibold text-stone-800 mt-0.5">{item.value}</div>
                    </div>
                    <button className="text-stone-300 hover:text-stone-600 transition-colors p-1">
                      <Edit2 size={14} />
                    </button>
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
  const { pets: PETS } = useHub();

  return (
    <div className="p-6 max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-stone-900">Pets</h1>
        <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 transition-colors">
          <Plus size={15} /> Add Pet
        </button>
      </div>
      <div className="space-y-4">
        {PETS.map(pet => (
          <Card key={pet.id} className="p-5">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
                style={{ backgroundColor: pet.color + '18' }}>
                {pet.type === 'Dog' ? '🐕' : pet.type === 'Cat' ? '🐈' : '🐟'}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-stone-900 text-lg">{pet.name}</h3>
                  <Badge color={pet.color} light>{pet.type}</Badge>
                </div>
                <div className="text-sm text-stone-500 mt-0.5">{pet.breed} · {pet.age}</div>
                <div className="mt-3 space-y-1.5">
                  {pet.tasks.map((task, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm">
                      <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: pet.color }} />
                      <span className={task.includes('TODAY') ? 'text-red-600 font-semibold' : 'text-stone-600'}>{task}</span>
                    </div>
                  ))}
                </div>
              </div>
              <button className="text-stone-300 hover:text-stone-600 p-1">
                <Edit2 size={15} />
              </button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ── Subscriptions & Passwords Page ────────────────────────────────────────────

function SubscriptionsView() {
  const {
    subscriptions: SUBSCRIPTIONS,
    passwords: PASSWORDS,
    addSubscription,
    addPassword,
  } = useHub();

  const [tab, setTab] = useState<'billing' | 'passwords'>('billing');
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});
  const [draftName, setDraftName] = useState('');
  const [draftAmount, setDraftAmount] = useState('');
  const [draftUser, setDraftUser] = useState('');
  const [draftHint, setDraftHint] = useState('');
  const monthly = SUBSCRIPTIONS.filter(s => s.cycle === 'Monthly');
  const monthlyTotal = monthly.reduce((sum, s) => sum + s.amount, 0);

  return (
    <div className="p-6 max-w-3xl">
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-xl font-semibold text-stone-900">Subscriptions & Passwords</h1>
      </div>
      <p className="text-sm text-stone-500 mb-4">
        {tab === 'billing'
          ? <>Monthly total: <span className="font-semibold text-stone-800">${monthlyTotal.toFixed(2)}</span></>
          : 'Household password vault — stored on this device only.'}
      </p>

      <div className="flex gap-1 bg-stone-100 p-1 rounded-xl w-fit mb-5">
        {([
          { key: 'billing', label: 'Subscriptions' },
          { key: 'passwords', label: 'Passwords' },
        ] as const).map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all
              ${tab === t.key ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'billing' ? (
        <div className="space-y-3">
          <form
            className="flex flex-wrap gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              if (!draftName.trim()) return;
              addSubscription(draftName, Number.parseFloat(draftAmount) || 0);
              setDraftName('');
              setDraftAmount('');
            }}
          >
            <input value={draftName} onChange={e => setDraftName(e.target.value)} placeholder="Service name" className="flex-1 min-w-[140px] px-3 py-2 rounded-xl border border-stone-200 text-sm" />
            <input value={draftAmount} onChange={e => setDraftAmount(e.target.value)} placeholder="Amount" className="w-28 px-3 py-2 rounded-xl border border-stone-200 text-sm" />
            <button type="submit" className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium text-white bg-violet-500 hover:bg-violet-600">
              <Plus size={15} /> Add
            </button>
          </form>
          <div className="space-y-2">
            {SUBSCRIPTIONS.map(sub => (
              <Card key={sub.id} className="p-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: sub.color + '18' }}>
                  <CreditCard size={16} style={{ color: sub.color }} />
                </div>
                <div className="flex-1">
                  <div className="font-medium text-stone-900 text-sm">{sub.name}</div>
                  <div className="text-xs text-stone-400 mt-0.5">Due {sub.due} · {sub.cycle}</div>
                </div>
                <div className="font-semibold text-stone-800">${sub.amount.toFixed(2)}</div>
              </Card>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <form
            className="grid gap-2 sm:grid-cols-3"
            onSubmit={(e) => {
              e.preventDefault();
              if (!draftName.trim()) return;
              addPassword(draftName, draftUser, draftHint);
              setDraftName('');
              setDraftUser('');
              setDraftHint('');
            }}
          >
            <input value={draftName} onChange={e => setDraftName(e.target.value)} placeholder="Label (e.g. Wi‑Fi)" className="px-3 py-2 rounded-xl border border-stone-200 text-sm" />
            <input value={draftUser} onChange={e => setDraftUser(e.target.value)} placeholder="Username / value" className="px-3 py-2 rounded-xl border border-stone-200 text-sm" />
            <div className="flex gap-2">
              <input value={draftHint} onChange={e => setDraftHint(e.target.value)} placeholder="Hint (preferred)" className="flex-1 px-3 py-2 rounded-xl border border-stone-200 text-sm" />
              <button type="submit" className="px-3 py-2 rounded-xl text-sm font-medium text-white bg-violet-500">
                <Plus size={15} />
              </button>
            </div>
          </form>
          <div className="space-y-2">
            {PASSWORDS.map(item => (
              <Card key={item.id} className="p-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: item.color + '18' }}>
                  <Key size={16} style={{ color: item.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-stone-900 text-sm">{item.label}</div>
                  <div className="text-xs text-stone-500 mt-0.5 truncate">
                    {revealed[item.id] ? item.username : '••••••••••••'}
                  </div>
                  <div className="text-xs text-stone-400 mt-0.5">{item.hint}</div>
                </div>
                <button
                  onClick={() => setRevealed(prev => ({ ...prev, [item.id]: !prev[item.id] }))}
                  className="text-xs font-medium px-3 py-1.5 rounded-lg bg-stone-100 text-stone-600 hover:bg-stone-200 transition-colors"
                >
                  {revealed[item.id] ? 'Hide' : 'Reveal'}
                </button>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Planner Page ──────────────────────────────────────────────────────────────

function PlannerView() {
  const { members: FAMILY_MEMBERS, events } = useHub();
  const days = Array.from({ length: 5 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - d.getDay() + 1 + i); // Mon-Fri of current week
    return d;
  });
  const dayLabels = days.map(d => d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }));
  const todayKey = new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-stone-900">Weekly Planner</h1>
        <span className="text-sm text-stone-500">{dayLabels[0]} – {dayLabels[dayLabels.length - 1]}</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
        {dayLabels.map((day, index) => {
          const dateObj = days[index];
          const tasks = events
            .filter(e => (e.date === 'Today' && day === todayKey) || e.date.includes(String(dateObj.getDate())))
            .map(e => ({ text: `${e.title} ${e.time}`, member: e.who, done: false }));
          const isToday = day === todayKey;
          return (
            <div key={day} className={`rounded-2xl border p-4 ${isToday ? 'border-indigo-200 bg-indigo-50' : 'bg-white border-stone-100'}`}>
              <div className={`text-xs font-semibold mb-3 ${isToday ? 'text-indigo-600' : 'text-stone-400'}`}>
                {day.split(' ').slice(0, 2).join(' ')}
                {isToday && <span className="ml-1.5 text-white bg-indigo-600 px-1.5 py-0.5 rounded text-[10px]">Today</span>}
              </div>
              <div className="space-y-2">
                {tasks.map((task, i) => {
                  const member = FAMILY_MEMBERS.find(m => m.name === task.member);
                  return (
                    <div key={i} className="text-xs text-stone-700 leading-snug flex gap-1.5">
                      {member && <div className="w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1" style={{ backgroundColor: member.color }} />}
                      {task.text}
                    </div>
                  );
                })}
                {tasks.length === 0 && <div className="text-xs text-stone-300">No tasks</div>}
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
  const { members: FAMILY_MEMBERS } = useHub();

  return (
    <div className="p-6 max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-stone-900">Family Members</h1>
          <p className="text-sm text-stone-500 mt-0.5">Colors and check-ins for the household roster</p>
        </div>
        <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium text-white bg-teal-500 hover:bg-teal-600 transition-colors">
          <Plus size={15} /> Add Member
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {FAMILY_MEMBERS.map(m => (
          <Card key={m.id} className="p-5 flex items-center gap-4">
            <MemberDot name={m.name} color={m.color} bg={m.bg} size="lg" />
            <div className="flex-1">
              <div className="font-semibold text-stone-900">{m.name}</div>
              <div className="text-xs text-stone-400 mt-0.5">Active · household member</div>
            </div>
            <button className="text-stone-300 hover:text-stone-600 p-1"><Edit2 size={15} /></button>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ── Notifications Page ────────────────────────────────────────────────────────

function NotificationsView() {
  const { notifications: NOTES } = useHub();
  return (
    <div className="p-6 max-w-3xl">
      <h1 className="text-xl font-semibold text-stone-900 mb-6">Notifications</h1>
      <div className="space-y-2">
        {NOTES.length === 0 ? (
          <Card className="p-6 text-sm text-stone-500">No notifications yet — you are all caught up.</Card>
        ) : null}
        {NOTES.map(n => (
          <Card key={n.id} className={`p-4 flex items-start gap-3 ${n.unread ? '' : 'opacity-70'}`}>
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

// ── Settings Page ─────────────────────────────────────────────────────────────

function SettingsView() {
  const SECTIONS = [
    {
      title: 'Household', items: [
        { label: 'Family members', sub: '6 members', icon: Users },
        { label: 'Household name', sub: 'The Family', icon: Home },
        { label: 'Notifications', sub: 'Configured', icon: Bell },
      ]
    },
    {
      title: 'Data', items: [
        { label: 'Backup & export', sub: 'Last backup: Aug 5', icon: Archive },
        { label: 'Import data', sub: 'CSV, JSON supported', icon: FolderOpen },
        { label: 'Product library', sub: '142 saved products', icon: Tag },
      ]
    },
    {
      title: 'App', items: [
        { label: 'Wall display', sub: 'Always-on Home page', icon: Home },
        { label: 'Display & theme', sub: 'Light mode', icon: Star },
        { label: 'Privacy', sub: 'Manage permissions', icon: ShieldAlert },
      ]
    },
  ];

  return (
    <div className="p-6 max-w-2xl">
      <h1 className="text-xl font-semibold text-stone-900 mb-6">Settings</h1>
      <div className="space-y-6">
        {SECTIONS.map(section => (
          <div key={section.title}>
            <div className="text-xs font-semibold text-stone-400 uppercase tracking-wide mb-2">{section.title}</div>
            <Card className="overflow-hidden">
              {section.items.map((item, i) => {
                const Icon = item.icon;
                return (
                  <button key={i} className={`w-full flex items-center gap-4 px-5 py-4 hover:bg-stone-50 transition-colors text-left
                    ${i < section.items.length - 1 ? 'border-b border-stone-100' : ''}`}>
                    <div className="w-9 h-9 rounded-xl bg-stone-100 flex items-center justify-center flex-shrink-0">
                      <Icon size={16} className="text-stone-600" />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-stone-900">{item.label}</div>
                      <div className="text-xs text-stone-400 mt-0.5">{item.sub}</div>
                    </div>
                    <ChevronRight size={16} className="text-stone-300" />
                  </button>
                );
              })}
            </Card>
          </div>
        ))}
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
    return {
      members: mapHubMembers(data),
      shoppingItems,
      pantryItems,
      chores: mapHubChores(data),
      events: mapHubEvents(data),
      messages,
      pets: mapHubPets(data),
      subscriptions: mapHubSubscriptions(vault),
      passwords: mapHubPasswords(vault),
      notifications: mapHubNotifications(data),
      docs: mapHubDocs(data),
      badges: {
        messages: messages.filter((m) => !m.read).length,
        shopping: shoppingItems.filter((i) => !i.checked).length,
        pantry: pantryItems.filter((i) => i.status === 'out' || i.status === 'low').length,
      },
      toggleShoppingItem: (id) => setData((prev) => toggleShoppingPurchased(prev, id)),
      deleteShoppingItem: (id) => setData((prev) => bridgeDeleteShopping(prev, id)),
      addShoppingItem: (name, qty) => setData((prev) => bridgeAddShopping(prev, name, qty)),
      updatePantryStock: (id, qty) => setData((prev) => updatePantryQuantity(prev, id, qty)),
      addPantryItem: (name, qty) => setData((prev) => bridgeAddPantry(prev, name, qty)),
      toggleChore: (id) => setData((prev) => bridgeToggleChore(prev, id)),
      postMessage: (text) => {
        const author = data.familyMembers.find((m) => m.status !== 'archived')?.id;
        setData((prev) => postFamilyMessage(prev, text, author));
      },
      addSubscription: (name, amount) => {
        writeHouseholdVault(addVaultSubscription(readHouseholdVault(), { name, amount }));
        setVaultTick((n) => n + 1);
      },
      addPassword: (label, username, hint) => {
        writeHouseholdVault(addVaultPassword(readHouseholdVault(), { label, username, hint }));
        setVaultTick((n) => n + 1);
      },
    };
  }, [data, vault]);

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
      case 'settings':
        return <SettingsView />;
    }
  };

  const shell = (
    <div className="flex h-full min-h-0 overflow-hidden bg-[#F8F6F2]" style={{ fontFamily: "'DM Sans', system-ui, sans-serif" }}>
      <Sidebar
        current={view}
        onChange={setView}
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed((p) => !p)}
      />
      <main className="min-w-0 flex-1 overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-stone-200">
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
