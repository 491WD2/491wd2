export type MemberRole = 'parent' | 'kid' | 'guest'

export interface FamilyMember {
  id: string
  name: string
  role: MemberRole
  color: string
  points: number
}

export type ChoreStatus = 'todo' | 'done'

export interface Chore {
  id: string
  title: string
  assigneeId: string
  points: number
  status: ChoreStatus
  dueLabel: string
}

export type ModuleKey = 'chores' | 'calendar' | 'meals' | 'rewards' | 'notes'

export interface HubModule {
  key: ModuleKey
  title: string
  summary: string
  href: string
  tone: 'lime' | 'sky' | 'coral' | 'mist'
}

export interface HelpArticle {
  id: string
  title: string
  body: string
  tags: string[]
}

export interface BuilderBlock {
  id: string
  label: string
  kind: 'hero' | 'list' | 'stat' | 'cta'
  enabled: boolean
}
