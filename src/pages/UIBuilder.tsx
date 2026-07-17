import { useState } from 'react'
import { builderBlocks as seedBlocks } from '../data/seed'
import type { BuilderBlock } from '../types'

export function UIBuilder() {
  const [blocks, setBlocks] = useState<BuilderBlock[]>(seedBlocks)

  function toggle(id: string) {
    setBlocks((current) =>
      current.map((block) =>
        block.id === id ? { ...block, enabled: !block.enabled } : block,
      ),
    )
  }

  const enabled = blocks.filter((block) => block.enabled)

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <section className="animate-rise">
        <h1 className="font-display text-4xl font-extrabold">UI Builder</h1>
        <p className="mt-2 text-mist/85">
          Prototype which blocks appear on the AdminUX command center. Toggles
          are local for now — wire them to persistence later.
        </p>
        <ul className="mt-6 space-y-2">
          {blocks.map((block) => (
            <li key={block.id}>
              <label className="panel flex cursor-pointer items-center justify-between gap-3 rounded-xl px-4 py-3">
                <span>
                  <span className="block font-medium">{block.label}</span>
                  <span className="text-xs uppercase tracking-wide text-muted">
                    {block.kind}
                  </span>
                </span>
                <input
                  type="checkbox"
                  checked={block.enabled}
                  onChange={() => toggle(block.id)}
                  className="size-5 accent-lime"
                />
              </label>
            </li>
          ))}
        </ul>
      </section>

      <section className="animate-rise [animation-delay:100ms]">
        <h2 className="font-display text-2xl font-bold">Live preview</h2>
        <div className="panel mt-4 min-h-80 space-y-3 rounded-xl p-5">
          {enabled.length === 0 ? (
            <p className="text-muted">Enable at least one block to preview.</p>
          ) : (
            enabled.map((block) => (
              <div
                key={block.id}
                className="rounded-lg border border-dashed border-white/20 bg-ink/40 px-4 py-6 transition duration-300"
              >
                <p className="text-xs uppercase tracking-wide text-sky">{block.kind}</p>
                <p className="font-display mt-1 text-lg font-bold">{block.label}</p>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  )
}
