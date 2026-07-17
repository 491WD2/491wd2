import type { BuilderBlock, Chore, FamilyMember, HelpArticle, HubModule } from '../types'

export const members: FamilyMember[] = [
  { id: 'm1', name: 'Sam', role: 'parent', color: '#6eb6ff', points: 42 },
  { id: 'm2', name: 'Alex', role: 'parent', color: '#c5f467', points: 38 },
  { id: 'm3', name: 'Riley', role: 'kid', color: '#ff6b5a', points: 61 },
  { id: 'm4', name: 'Jordan', role: 'kid', color: '#f0c75e', points: 54 },
]

export const chores: Chore[] = [
  {
    id: 'c1',
    title: 'Unload dishwasher',
    assigneeId: 'm3',
    points: 5,
    status: 'todo',
    dueLabel: 'Today',
  },
  {
    id: 'c2',
    title: 'Feed the dog',
    assigneeId: 'm4',
    points: 3,
    status: 'todo',
    dueLabel: 'Tonight',
  },
  {
    id: 'c3',
    title: 'Take out recycling',
    assigneeId: 'm3',
    points: 4,
    status: 'done',
    dueLabel: 'Done',
  },
  {
    id: 'c4',
    title: 'Wipe kitchen counters',
    assigneeId: 'm2',
    points: 4,
    status: 'todo',
    dueLabel: 'Today',
  },
  {
    id: 'c5',
    title: 'Pack lunch bags',
    assigneeId: 'm1',
    points: 3,
    status: 'todo',
    dueLabel: 'Morning',
  },
]

export const hubModules: HubModule[] = [
  {
    key: 'chores',
    title: 'Chore Kiosk',
    summary: 'Touch-first board for kids and wall tablets.',
    href: '/chores',
    tone: 'lime',
  },
  {
    key: 'calendar',
    title: 'Week Board',
    summary: 'Practices, pickups, and shared appointments.',
    href: '/help#calendar',
    tone: 'sky',
  },
  {
    key: 'meals',
    title: 'Meal Plan',
    summary: 'Tonight’s dinner and grocery notes.',
    href: '/help#meals',
    tone: 'coral',
  },
  {
    key: 'rewards',
    title: 'Rewards',
    summary: 'Points, streaks, and weekend privileges.',
    href: '/help#rewards',
    tone: 'mist',
  },
  {
    key: 'notes',
    title: 'Family Notes',
    summary: 'Pins for guests, babysitters, and reminders.',
    href: '/help#notes',
    tone: 'sky',
  },
]

export const helpArticles: HelpArticle[] = [
  {
    id: 'h1',
    title: 'Open the chore kiosk on a tablet',
    body: 'Navigate to /chores, add the page to the home screen, and set the tablet to stay awake. The PWA starts on the kiosk route for wall displays.',
    tags: ['kiosk', 'chores', 'pwa'],
  },
  {
    id: 'h2',
    title: 'Use AdminUX as the parent command center',
    body: 'AdminUX is the household home: glance at open chores, member points, and jump into modules. Kids should prefer the kiosk; parents stay here.',
    tags: ['admin', 'parents'],
  },
  {
    id: 'h3',
    title: 'Connect Supabase',
    body: 'Copy .env.example to .env.local and set VITE_SUPABASE_URL plus VITE_SUPABASE_ANON_KEY. Without them the app runs on local seed data.',
    tags: ['supabase', 'setup'],
  },
  {
    id: 'h4',
    title: 'Customize layout in UI Builder',
    body: 'Toggle blocks on the UI Builder page to prototype what appears on the command center before wiring them to live data.',
    tags: ['builder', 'layout'],
  },
]

export const builderBlocks: BuilderBlock[] = [
  { id: 'b1', label: 'Today strip', kind: 'hero', enabled: true },
  { id: 'b2', label: 'Open chores list', kind: 'list', enabled: true },
  { id: 'b3', label: 'Points leaderboard', kind: 'stat', enabled: true },
  { id: 'b4', label: 'Launch kiosk CTA', kind: 'cta', enabled: true },
  { id: 'b5', label: 'Meal spotlight', kind: 'hero', enabled: false },
]
