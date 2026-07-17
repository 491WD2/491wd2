import {
  completedCount,
  openChores,
  sortMembersByPoints,
  toggleChoreStatus,
} from './chores'
import type { Chore, FamilyMember } from '../types'

const sampleChores: Chore[] = [
  {
    id: '1',
    title: 'A',
    assigneeId: 'm1',
    points: 2,
    status: 'todo',
    dueLabel: 'Today',
  },
  {
    id: '2',
    title: 'B',
    assigneeId: 'm1',
    points: 2,
    status: 'done',
    dueLabel: 'Done',
  },
]

const sampleMembers: FamilyMember[] = [
  { id: 'm1', name: 'Sam', role: 'parent', color: '#fff', points: 10 },
  { id: 'm2', name: 'Riley', role: 'kid', color: '#000', points: 30 },
]

describe('chores helpers', () => {
  it('filters open chores', () => {
    expect(openChores(sampleChores)).toHaveLength(1)
    expect(openChores(sampleChores)[0]?.id).toBe('1')
  })

  it('counts completed chores', () => {
    expect(completedCount(sampleChores)).toBe(1)
  })

  it('toggles chore status', () => {
    const done = toggleChoreStatus(sampleChores[0]!)
    expect(done.status).toBe('done')
    expect(done.dueLabel).toBe('Done')

    const undone = toggleChoreStatus(done)
    expect(undone.status).toBe('todo')
  })

  it('sorts members by points descending', () => {
    const sorted = sortMembersByPoints(sampleMembers)
    expect(sorted[0]?.name).toBe('Riley')
    expect(sorted[1]?.name).toBe('Sam')
  })
})
