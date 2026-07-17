import { useState } from 'react'
import { chores as seedChores } from '../data/seed'
import { toggleChoreStatus } from '../lib/chores'
import type { Chore } from '../types'

export function useChores(initial: Chore[] = seedChores) {
  const [chores, setChores] = useState<Chore[]>(initial)

  function completeChore(id: string) {
    setChores((current) =>
      current.map((chore) => (chore.id === id ? toggleChoreStatus(chore) : chore)),
    )
  }

  return { chores, completeChore }
}
