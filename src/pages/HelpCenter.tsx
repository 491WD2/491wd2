import { useMemo, useState } from 'react'
import { helpArticles } from '../data/seed'

export function HelpCenter() {
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return helpArticles
    return helpArticles.filter(
      (article) =>
        article.title.toLowerCase().includes(q) ||
        article.body.toLowerCase().includes(q) ||
        article.tags.some((tag) => tag.includes(q)),
    )
  }, [query])

  return (
    <div className="animate-rise mx-auto max-w-3xl space-y-6">
      <header>
        <h1 className="font-display text-4xl font-extrabold">Help Center</h1>
        <p className="mt-2 text-mist/85">
          Setup notes for AdminUX, the chore kiosk, Supabase, and UI Builder.
        </p>
      </header>

      <label className="block">
        <span className="mb-2 block text-sm text-muted">Search articles</span>
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="kiosk, supabase, parents…"
          className="w-full rounded-md border border-white/15 bg-ink/50 px-3 py-2.5 text-foam outline-none ring-sky/40 placeholder:text-muted focus:ring-2"
        />
      </label>

      <ul className="space-y-4">
        {filtered.map((article, index) => (
          <li
            key={article.id}
            id={article.tags[0]}
            className="panel animate-rise rounded-xl p-5"
            style={{ animationDelay: `${index * 40}ms` }}
          >
            <h2 className="font-display text-xl font-bold">{article.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-mist/90">{article.body}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {article.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded bg-white/5 px-2 py-0.5 text-xs text-muted"
                >
                  {tag}
                </span>
              ))}
            </div>
          </li>
        ))}
        {filtered.length === 0 && (
          <li className="text-muted">No articles match that search.</li>
        )}
      </ul>
    </div>
  )
}
