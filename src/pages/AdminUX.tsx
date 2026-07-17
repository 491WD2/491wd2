import { Link } from 'react-router-dom'
import { hubModules, members } from '../data/seed'
import { useChores } from '../hooks/useChores'
import {
  completedCount,
  memberById,
  openChores,
  sortMembersByPoints,
} from '../lib/chores'

const toneClass: Record<string, string> = {
  lime: 'border-lime/30 hover:border-lime/60',
  sky: 'border-sky/30 hover:border-sky/60',
  coral: 'border-coral/30 hover:border-coral/60',
  mist: 'border-mist/20 hover:border-mist/40',
}

export function AdminUX() {
  const { chores } = useChores()
  const open = openChores(chores)
  const done = completedCount(chores)
  const leaders = sortMembersByPoints(members)

  return (
    <div className="space-y-8">
      <section className="animate-rise grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div>
          <p className="mb-2 text-sm font-semibold uppercase tracking-[0.18em] text-sky">
            Command center
          </p>
          <h1 className="font-display text-4xl font-extrabold leading-tight text-foam sm:text-5xl">
            AdminUX
          </h1>
          <p className="mt-3 max-w-xl text-base text-mist/85 sm:text-lg">
            One place for parents to steer the household — chores, points, and
            the modules everyone uses.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              to="/chores"
              className="animate-pulse-soft inline-flex items-center rounded-md bg-lime px-4 py-2.5 text-sm font-semibold text-ink transition hover:bg-lime-deep"
            >
              Open chore kiosk
            </Link>
            <Link
              to="/builder"
              className="inline-flex items-center rounded-md border border-white/15 px-4 py-2.5 text-sm font-semibold text-foam transition hover:bg-white/5"
            >
              Edit layout
            </Link>
          </div>
        </div>

        <div className="panel animate-rise rounded-xl p-5 [animation-delay:80ms]">
          <h2 className="font-display text-lg font-bold text-foam">Today</h2>
          <dl className="mt-4 grid grid-cols-2 gap-4">
            <div>
              <dt className="text-xs uppercase tracking-wide text-muted">Open chores</dt>
              <dd className="font-display text-3xl font-extrabold text-lime">{open.length}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-muted">Completed</dt>
              <dd className="font-display text-3xl font-extrabold text-sky">{done}</dd>
            </div>
          </dl>
          <ul className="mt-4 space-y-2">
            {open.slice(0, 3).map((chore) => {
              const assignee = memberById(members, chore.assigneeId)
              return (
                <li
                  key={chore.id}
                  className="flex items-center justify-between gap-2 rounded-md bg-ink/40 px-3 py-2 text-sm"
                >
                  <span>{chore.title}</span>
                  <span className="text-muted">{assignee?.name ?? 'Unassigned'}</span>
                </li>
              )
            })}
          </ul>
        </div>
      </section>

      <section className="animate-rise [animation-delay:120ms]">
        <div className="mb-3 flex items-end justify-between gap-3">
          <h2 className="font-display text-2xl font-bold">Modules</h2>
          <Link to="/help" className="text-sm text-sky hover:underline">
            Help Center
          </Link>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {hubModules.map((module, index) => (
            <Link
              key={module.key}
              to={module.href}
              className={[
                'panel rounded-xl border p-4 transition duration-200 hover:-translate-y-0.5',
                toneClass[module.tone],
              ].join(' ')}
              style={{ animationDelay: `${160 + index * 40}ms` }}
            >
              <h3 className="font-display text-lg font-bold">{module.title}</h3>
              <p className="mt-1 text-sm text-mist/80">{module.summary}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="animate-rise [animation-delay:200ms]">
        <h2 className="font-display mb-3 text-2xl font-bold">Points</h2>
        <ol className="panel divide-y divide-white/10 rounded-xl">
          {leaders.map((member, index) => (
            <li
              key={member.id}
              className="flex items-center justify-between gap-3 px-4 py-3"
            >
              <div className="flex items-center gap-3">
                <span className="w-6 text-sm text-muted">{index + 1}</span>
                <span
                  className="inline-block size-2.5 rounded-full"
                  style={{ backgroundColor: member.color }}
                  aria-hidden
                />
                <span className="font-medium">{member.name}</span>
                <span className="text-xs uppercase tracking-wide text-muted">
                  {member.role}
                </span>
              </div>
              <span className="font-display font-bold text-lime">{member.points}</span>
            </li>
          ))}
        </ol>
      </section>
    </div>
  )
}
