import type { Chore, FamilyMember } from '../types'

export function memberById(
  members: FamilyMember[],
  id: string,
): FamilyMember | undefined {
  return members.find((member) => member.id === id)
}

export function openChores(chores: Chore[]): Chore[] {
  return chores.filter((chore) => chore.status === 'todo')
}

export function completedCount(chores: Chore[]): number {
  return chores.filter((chore) => chore.status === 'done').length
}

export function toggleChoreStatus(chore: Chore): Chore {
  return {
    ...chore,
    status: chore.status === 'todo' ? 'done' : 'todo',
    dueLabel: chore.status === 'todo' ? 'Done' : 'Today',
  }
}

export function sortMembersByPoints(members: FamilyMember[]): FamilyMember[] {
  return [...members].sort((a, b) => b.points - a.points)
}
