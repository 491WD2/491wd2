import { Link } from 'react-router-dom'
import { members } from '../data/seed'
import { useChores } from '../hooks/useChores'
import { memberById, openChores } from '../lib/chores'

export function ChoresKiosk() {
  const { chores, completeChore } = useChores()
  const open = openChores(chores)
  const done = chores.filter((chore) => chore.status === 'done')

  return (
    <div className="-mx-4 -mt-6 min-h-[calc(100vh-4rem)] bg-gradient-to-b from-ink via-navy to-slate px-4 py-6 sm:-mx-6 sm:px-6">
      <div className="mx-auto flex max-w-4xl flex-col gap-6">
        <header className="animate-rise flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="font-display text-3xl font-extrabold tracking-tight text-lime sm:text-4xl">
              491WD2
            </p>
            <h1 className="mt-1 font-display text-2xl font-bold text-foam sm:text-3xl">
              Chore kiosk
            </h1>
            <p className="mt-2 max-w-md text-mist/85">
              Tap a chore to mark it done. Points update for the whole family.
            </p>
          </div>
          <Link
            to="/"
            className="rounded-md border border-white/15 px-3 py-2 text-sm text-mist hover:bg-white/5"
          >
            Back to AdminUX
          </Link>
        </header>

        <section className="animate-rise [animation-delay:80ms]">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-[0.16em] text-sky">
            Needs doing · {open.length}
          </h2>
          <ul className="grid gap-3">
            {open.length === 0 ? (
              <li className="panel rounded-xl px-5 py-8 text-center text-lg text-lime">
                All clear — nice work.
              </li>
            ) : (
              open.map((chore, index) => {
                const assignee = memberById(members, chore.assigneeId)
                return (
                  <li key={chore.id} style={{ animationDelay: `${120 + index * 50}ms` }}>
                    <button
                      type="button"
                      onClick={() => completeChore(chore.id)}
                      className="panel animate-rise flex w-full items-center justify-between gap-4 rounded-xl px-5 py-5 text-left transition duration-200 hover:border-lime/50 hover:bg-lime/5 active:scale-[0.99]"
                    >
                      <div>
                        <p className="font-display text-xl font-bold sm:text-2xl">
                          {chore.title}
                        </p>
                        <p className="mt-1 text-sm text-muted">
                          {assignee?.name ?? 'Anyone'} · {chore.dueLabel}
                        </p>
                      </div>
                      <span className="shrink-0 rounded-md bg-lime/15 px-3 py-2 font-display text-lg font-bold text-lime">
                        +{chore.points}
                      </span>
                    </button>
                  </li>
                )
              })
            )}
          </ul>
        </section>

        {done.length > 0 && (
          <section className="animate-fade">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-[0.16em] text-muted">
              Done
            </h2>
            <ul className="space-y-2">
              {done.map((chore) => (
                <li
                  key={chore.id}
                  className="flex items-center justify-between rounded-lg bg-ink/50 px-4 py-3 text-sm text-mist/70"
                >
                  <button
                    type="button"
                    onClick={() => completeChore(chore.id)}
                    className="text-left hover:text-foam"
                  >
                    <span className="line-through">{chore.title}</span>
                  </button>
                  <span>Undo</span>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </div>
  )
}
