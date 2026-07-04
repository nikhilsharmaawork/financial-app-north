import { cn } from '@/lib/utils'

export function ProgressBar({
  value,
  color,
  className,
}: {
  value: number // 0-100
  color?: string
  className?: string
}) {
  const clamped = Math.max(0, Math.min(100, value))
  return (
    <div className={cn('h-2 w-full overflow-hidden rounded-full bg-secondary', className)}>
      <div
        className="h-full rounded-full transition-[width] duration-500 ease-out"
        style={{
          width: `${clamped}%`,
          backgroundColor: color ?? 'var(--primary)',
        }}
      />
    </div>
  )
}
