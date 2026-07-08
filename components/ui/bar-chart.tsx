export function BarChart({
  data,
  currency,
}: {
  data: { label: string; total: number }[]
  currency?: string
}) {
  const max = Math.max(...data.map((d) => d.total), 1)

  return (
    <div className="flex items-end gap-2.5 px-1 pt-4" style={{ height: 140 }}>
      {data.map((d) => {
        const heightPct = Math.max((d.total / max) * 100, d.total > 0 ? 4 : 0)
        return (
          <div key={d.label} className="flex flex-1 flex-col items-center gap-2">
            <div className="flex h-full w-full items-end">
              <div
                className="w-full rounded-t-lg bg-primary transition-all duration-500"
                style={{ height: `${heightPct}%`, minHeight: d.total > 0 ? 4 : 0 }}
              />
            </div>
            <span className="text-xs text-muted-foreground">{d.label}</span>
          </div>
        )
      })}
    </div>
  )
}
